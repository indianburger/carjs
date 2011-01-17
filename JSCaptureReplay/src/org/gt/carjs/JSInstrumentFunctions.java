/*
 * Copyright 2008 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.gt.carjs;

import java.io.IOException;
import java.util.List;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.Lists;
import com.google.javascript.jscomp.AbstractCompiler;
import com.google.javascript.jscomp.CompilerPass;
import com.google.javascript.jscomp.ControlFlowAnalysis;
import com.google.javascript.jscomp.ControlFlowGraph;
import com.google.javascript.jscomp.ControlFlowGraph.Branch;
import com.google.javascript.jscomp.InstrumentFunctions;
import com.google.javascript.jscomp.Instrumentation;
import com.google.javascript.jscomp.JSError;
import com.google.javascript.jscomp.JSModule;
import com.google.javascript.jscomp.NodeTraversal;
import com.google.javascript.jscomp.NodeTraversal.AbstractPostOrderCallback;
import com.google.javascript.jscomp.NodeUtil;
import com.google.javascript.jscomp.RhinoErrorReporter;
import com.google.javascript.jscomp.graph.DiGraph.DiGraphNode;
import com.google.javascript.rhino.Node;
import com.google.javascript.rhino.Token;
import com.google.protobuf.TextFormat;


/**
 * This class is modeled after {@link InstrumentFunctions}. 
 * Instruments before and after every javascript function 
 * to call log entry and exit methods.
 * @author aravind
 *
 */
public class JSInstrumentFunctions implements CompilerPass {

  private final AbstractCompiler compiler;
  private final MyFunctionNames functionNames;
  private final String templateFilename;
  private final String appNameStr;
  private final String initCodeSource;
  private final String definedFunctionName;
  private final String reportFunctionName;
  private final String reportFunctionExitName;
  private final String appNameSetter;
  private final List<String> declarationsToRemove;

  /**
   * Creates an intrument functions compiler pass.
   *
   * @param compiler          The JSCompiler
   * @param functionNames     Assigned function identifiers.
   * @param templateFilename  Template filename; for use during error
   *                          reporting only.
   * @param appNameStr        String to pass to appNameSetter.
   * @param readable          Instrumentation template protobuf text.
   */
  JSInstrumentFunctions(AbstractCompiler compiler,
		  MyFunctionNames functionNames,
                      String templateFilename,
                      String appNameStr,
                      Readable readable) {
    this.compiler = compiler;
    this.functionNames = functionNames;
    this.templateFilename = templateFilename;
    this.appNameStr = appNameStr;

    Instrumentation.Builder builder = Instrumentation.newBuilder();
    try {
      TextFormat.merge(readable, builder);
    } catch (IOException e) {
      compiler.report(JSError.make(RhinoErrorReporter.PARSE_ERROR,
          "Error reading instrumentation template protobuf at " +
          templateFilename));
      this.initCodeSource = "";
      this.definedFunctionName = "";
      this.reportFunctionName = "";
      this.reportFunctionExitName = "";
      this.appNameSetter = "";
      this.declarationsToRemove = Lists.newArrayList();
      return;
    }

    Instrumentation template = builder.build();

    StringBuilder initCodeSourceBuilder = new StringBuilder();
    for (String line : template.getInitList()) {
      initCodeSourceBuilder.append(line).append("\n");
    }
    this.initCodeSource = initCodeSourceBuilder.toString();

    this.definedFunctionName = template.getReportDefined();
    this.reportFunctionName = template.getReportCall();
    this.reportFunctionExitName = template.getReportExit();
    this.appNameSetter = template.getAppNameSetter();

    this.declarationsToRemove = ImmutableList.copyOf(
        template.getDeclarationToRemoveList());
  }

  @Override
  public void process(Node externs, Node root) {
    Node initCode = null;
    if (!initCodeSource.isEmpty()) {
      Node initCodeRoot = compiler.parseSyntheticCode(
          templateFilename + ":init", initCodeSource);
      if (initCodeRoot != null && initCodeRoot.getFirstChild() != null) {
        initCode = initCodeRoot.removeChildren();
      } else {
        return;  // parse failure
      }
    }

    NodeTraversal.traverse(compiler, root,
                           new RemoveCallback(declarationsToRemove));
    NodeTraversal.traverse(compiler, root, new InstrumentCallback());

    if (!appNameSetter.isEmpty()) {
      Node call = new Node(Token.CALL,
          Node.newString(Token.NAME, appNameSetter),
          Node.newString(appNameStr));
      Node expr = new Node(Token.EXPR_RESULT, call);

      Node addingRoot = compiler.getNodeForCodeInsertion(null);
      addingRoot.addChildrenToFront(expr);
      compiler.reportCodeChange();
    }

    if (initCode != null) {
      Node addingRoot = compiler.getNodeForCodeInsertion(null);
      addingRoot.addChildrenToFront(initCode);
      compiler.reportCodeChange();
    }
  }

  /**
   * The application must refer to these variables to output them so the
   * application must also declare these variables for the first
   * {@link VarCheck} pass. These declarations must be removed before the
   * second {@link VarCheck} pass. Otherwise, the second pass would warn about
   * duplicate declarations.
   */
  private static class RemoveCallback extends AbstractPostOrderCallback {
    private final List<String> removable;
    RemoveCallback(List<String> removable) {
      this.removable = removable;
    }

    @Override
    public void visit(NodeTraversal t, Node n, Node parent) {
      if (NodeUtil.isVarDeclaration(n)) {
        if (removable.contains(n.getString())) {
          parent.removeChild(n);
          if (!parent.hasChildren()) {
            parent.getParent().removeChild(parent);
          }
        }
      }
    }
  }

  /**
   * Traverse a function's body by instrument return sites by
   * inserting calls to {@code reportFunctionExitName}.  If the
   * function is missing an explicit return statement in some control
   * path, this pass inserts a call to {@code reportFunctionExitName}
   * as the last statement in the function's body.
   *
   * Example:
   * Input:
   * function f() {
   *   if (pred) {
   *     return a;
   *   }
   * }
   *
   * Template:
   * reportFunctionExitName: "onExitFn"
   *
   * Output:
   * function f() {
   *   if (pred) {
   *     return onExitFn(0, a);
   *   }
   *   onExitFn(0);
   * }
   *
   **/
  private class InstrumentReturns extends AbstractPostOrderCallback {
    private final int functionId;
    private final String functionName;
    private NodeTraversal nodeTraversal;
    /**
     * @param functionId Function identifier computed by FunctionNames;
     *     used as first argument to {@code reportFunctionExitName}
     *     {@code reportFunctionExitName} must be a 2 argument function that
     *     returns it's second argument.
     */
    InstrumentReturns(int functionId, String functionName) {
      this.functionId = functionId;
      this.functionName = functionName;
    }

    /**
     * @param body  body of function with id == this.functionId
     */
    void process(Node body) {
    	nodeTraversal = new NodeTraversal(compiler, this);
    	nodeTraversal.traverse(body);
        

      if (!allPathsReturn(body)) {
        Node call = newReportFunctionExitNode();
        Node expr = new Node(Token.EXPR_RESULT, call);
        body.addChildToBack(expr);
        compiler.reportCodeChange();
      }
    }

    @Override
    public void visit(NodeTraversal t, Node n, Node parent) {
      if (n.getType() != Token.RETURN) {
        return;
      }
      if (t.getEnclosingFunction() != null && t.getEnclosingFunction().getFirstChild() != null){
    	  String enclosingFunctionName = t.getEnclosingFunction().getFirstChild().getString();
    	  if (enclosingFunctionName == null || enclosingFunctionName.length() == 0) return;
      }
      
      Node call = newReportFunctionExitNode();
      Node returnRhs = n.removeFirstChild();
      if (returnRhs != null) {
        call.addChildToBack(returnRhs);
      }
      n.addChildToFront(call);
      compiler.reportCodeChange();
    }

    private Node newReportFunctionExitNode() {
      return new Node(Token.CALL,
          Node.newString(Token.NAME, reportFunctionExitName),
          Node.newString(functionName));
    }

    /**
     * @returns true if all paths from block must exit with an explicit return.
     */
    private boolean allPathsReturn(Node block) {
      // Computes the control flow graph.
      ControlFlowAnalysis cfa = new ControlFlowAnalysis(compiler, false);
      cfa.process(null, block);
      ControlFlowGraph<Node> cfg = cfa.getCfg();

      Node returnPathsParent = cfg.getImplicitReturn().getValue();
      for (DiGraphNode<Node, Branch> pred :
        cfg.getDirectedPredNodes(returnPathsParent)) {
        Node n = pred.getValue();
        if (n.getType() != Token.RETURN) {
          return false;
        }
      }
      return true;
    }
  }

  private class InstrumentCallback extends AbstractPostOrderCallback {
    @Override
    public void visit(NodeTraversal t, Node n, Node parent) {
      if (n.getType() != Token.FUNCTION) {
        return;
      }

      int id = functionNames.getFunctionId(n);
      //String name = functionNames.getFunctionName(n);
      if (id < 0) {
        // Function node was added during compilation; don't instrument.
    	// instrument only those with $$anonyms and other non-anonymous methods
        return;
      }
      Node body = n.getFirstChild().getNext().getNext();
      String scopeActualName = body.getParent().getFirstChild().getString();
      if (scopeActualName == null || scopeActualName.length() == 0){
    	  scopeActualName = functionNames.getFunctionName(n); //for anonymous outer scope functions, use the genereated name
      }
      if (!reportFunctionName.isEmpty() && !scopeActualName.contains("anonymous")) {
        
        Node call = new Node(Token.CALL,
        		
            Node.newString(Token.NAME, reportFunctionName),
            Node.newString(Token.NAME, "this"),
            Node.newString(scopeActualName), 
            Node.newString(Token.NAME, "arguments")
            );
        
        //TODO: this is a hack for getting original arguments callee
        //If it was one our instrumented anonym functions, then we use the 
        //original call "origCallee" else just use 'arguments.callee;
        
        
        if (scopeActualName.startsWith("$$anonym")){
        	call.addChildrenToBack(Node.newString(Token.NAME, "origCallee"));
        }
        else{
        	call.addChildrenToBack(Node.newString(Token.NAME, "arguments.callee"));
        }
        Node expr = new Node(Token.EXPR_RESULT, call);
        body.addChildToFront(expr);
        compiler.reportCodeChange();
      }
      //do not instrument exits for anonymous functions. the only anonmymous functions
      //remaining shoud be the ones that we introduced for call indirection
      if (!reportFunctionExitName.isEmpty() && !scopeActualName.contains("anonymous")) {
        body = n.getFirstChild().getNext().getNext();
        (new InstrumentReturns(id, scopeActualName)).process(body);
      }

      if (!definedFunctionName.isEmpty()) {
        Node call = new Node(Token.CALL,
            Node.newString(Token.NAME, definedFunctionName),
            Node.newNumber(id));
        Node expr = NodeUtil.newExpr(call);

        Node addingRoot = null;
        if (NodeUtil.isFunctionDeclaration(n)) {
          JSModule module = t.getModule();
          addingRoot = compiler.getNodeForCodeInsertion(module);
          addingRoot.addChildToFront(expr);
        } else {
          Node beforeChild = n;
          for (Node ancestor : n.getAncestors()) {
            int type = ancestor.getType();
            if (type == Token.BLOCK || type == Token.SCRIPT) {
              addingRoot = ancestor;
              break;
            }
            beforeChild = ancestor;
          }
          addingRoot.addChildBefore(expr, beforeChild);
        }
        compiler.reportCodeChange();
      }
    }
  }
}

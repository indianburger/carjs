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

package com.google.javascript.jscomp;

import java.io.Serializable;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.gt.carjs.Props;

import com.google.common.collect.Maps;
import com.google.javascript.jscomp.NodeTraversal.AbstractPostOrderCallback;
import com.google.javascript.rhino.Node;
import com.google.javascript.rhino.Token;

/**
 * Extract a list of all function nodes defined in a javascript
 * program, assigns them globally unique ids and computes their fully
 * qualified names.  Function names are derived from the property they
 * are assigned to and the scope they are defined in.  For instance,
 * the following code
 *
 * goog.widget = function(str) {
 *   this.member_fn = function() {}
 *   local_fn = function() {}
 *   goog.array.map(arr, function(){});
 * }
 *
 * defines the following functions
 *
 *  goog.widget
 *  goog.widget.member_fn
 *  goog.widget::local_fn
 *  goog.widget::<anonymous>
 *
*
 */

public class FunctionNames implements CompilerPass, Serializable {
  private static final long serialVersionUID = 1L;

  private final transient AbstractCompiler compiler;
  private final Map<Node, FunctionRecord> functionMap = Maps.newLinkedHashMap();
  private final transient FunctionListExtractor functionListExtractor;

  public FunctionNames(AbstractCompiler compiler) {
    this.compiler = compiler;
    this.functionListExtractor = new FunctionListExtractor(functionMap);
  }

  @Override
  public void process(Node externs, Node root) {
    
    
    NameAnonyms na = new NameAnonyms(root, compiler, externs);
	NodeTraversal.traverse(compiler, root, na);
	
	NodeTraversal.traverse(compiler, root, functionListExtractor);
  }
  
	

  public Iterable<Node> getFunctionNodeList() {
    return functionMap.keySet();
  }

  public int getFunctionId(Node f) {
    FunctionRecord record = functionMap.get(f);
    if (record != null) {
      return record.id;
    } else {
      return -1;
    }
  }

  public String getFunctionName(Node f) {
    FunctionRecord record = functionMap.get(f);
    if (record == null) {
      // Function node was added during compilation and has no name.
      return null;
    }

    String str = record.name;
    if (str.isEmpty()) {
      str = "<anonymous>";
    }

    Node parent = record.parent;
    if (parent != null) {
      str = getFunctionName(parent) + "::" + str;
    }

    // this.foo -> foo
    str = str.replaceAll("::this\\.", ".");
    // foo.prototype.bar -> foo.bar
    // AnonymousFunctionNamingCallback already replaces ".prototype."
    // with "..", just remove the extra dot.
    str = str.replaceAll("\\.\\.", ".");
    // remove toplevel anonymous blocks, if they exists.
    str = str.replaceFirst("^(<anonymous>::)*", "");
    return str;
  }

  private static class FunctionRecord implements Serializable {
    private static final long serialVersionUID = 1L;

    public final int id;
    public final Node parent;
    public String name;

    FunctionRecord(int id, Node parent, String name) {
      this.id = id;
      this.parent = parent;
      this.name = name;
    }
  }

  private static class FunctionListExtractor extends AbstractPostOrderCallback {
    private final Map<Node, FunctionRecord> functionMap;
    private int nextId = 0;

    FunctionListExtractor(Map<Node, FunctionRecord> functionMap) {
      this.functionMap = functionMap;
    }

    public void visit(NodeTraversal t, Node n, Node parent) {
      if (n.getType() == Token.FUNCTION) {
        Node functionNameNode = n.getFirstChild();
        String functionName = functionNameNode.getString();

        Node enclosingFunction = t.getEnclosingFunction();

        functionMap.put(n,
            new FunctionRecord(nextId, enclosingFunction, functionName));
        nextId++;
      }
    }
  }

  private static class FunctionExpressionNamer
      implements AnonymousFunctionNamingCallback.FunctionNamer {
    private static final char DELIMITER = '.';
    private static final NodeNameExtractor extractor =
        new NodeNameExtractor(DELIMITER);
    private final Map<Node, FunctionRecord> functionMap;

    FunctionExpressionNamer(Map<Node, FunctionRecord> functionMap) {
      this.functionMap = functionMap;
    }

    @Override
    public final String getName(Node node) {
      return extractor.getName(node);
    }

    @Override
    public final void setFunctionName(String name, Node fnNode) {
      FunctionRecord record = functionMap.get(fnNode);
      assert(record != null);
      assert(record.name.isEmpty());
      record.name = name;
    }

    @Override
    public final String getCombinedName(String lhs, String rhs) {
      return lhs + DELIMITER + rhs;
    }
  }
}

class NameAnonyms extends AbstractPostOrderCallback {
	private final Node root;
	private static int anonymCount = 0;
	private final AbstractCompiler compiler;
	private final Node externs;
	private static Set<Node> anonymizedFnNodes = new HashSet<Node>();
	public NameAnonyms(Node root, AbstractCompiler compiler, Node externs) {
		this.root = root;
		this.compiler = compiler;
		this.externs = externs;
	}

	@Override
	public void visit(NodeTraversal t, Node n, Node parent) {
		//System.out.println(n);
		switch (n.getType()) {
		case Token.FUNCTION:
			Node functionNameNode = n.getFirstChild();
			String currFunctionName = functionNameNode.getString();

			if (!anonymizedFnNodes.contains(n)) {
				if(currFunctionName.length() == 0 ){
					Set<String> closures = findClosures(n);

					//System.out.println("closures" + closures);

					n.detachFromParent(); // detach anonymous function from.

					//change all references to 'this' in method to $$_self
					boolean thisChanged = changeThisTo$$_self(n);

					//clone the parameters of modified $$$anonym(originalParams..., closures..) so that
					//we can use it for parameters of function call below

					Node clonedorigParamNode = n.getChildAtIndex(1).cloneTree();
					clonedorigParamNode.setType(Token.LP);

					// parent
					//give 'n' a name and attach to end
					//e.g. function $$anonym(originalParams..., closures..)
					String anonymName = "$$anonym" + anonymCount++;
					Node funcNameNode = Node.newString(Token.NAME, anonymName);
					n.replaceChild(n.getFirstChild(), funcNameNode);

					Node parametersNode = n.getChildAtIndex(1);
					addParamsToMethod(closures, parametersNode, thisChanged, "$$_self");

					root.getFirstChild().addChildrenToBack(n);



					//replace original anonymous call to new anonymous function that closes over
					//params and then makes a call to our named function
					Node newAnonymNode = createAnonymWithParamCall(closures, anonymName, clonedorigParamNode, thisChanged);
					parent.addChildrenToBack(newAnonymNode);



					//add to list of anonymized nodes so that we can ignore it on second pass
					anonymizedFnNodes.add(newAnonymNode);

					compiler.reportCodeChange();
				}
				else{//named function just find closures and add as parameter
					//TODO
				}
			}
		}
	}

	private boolean changeThisTo$$_self(Node funcRoot) {
		ThisChanger tc = new ThisChanger(compiler);
		tc.process(externs, funcRoot);
		return tc.thisChanged;
			
		
	}

	private Node createAnonymWithParamCall(Set<String> closures, String anonymName, Node clonedorigParamNode, boolean thisChanged) {
		Node newAnonymNode = new Node(Token.FUNCTION);
		Node blockNode = new Node(Token.BLOCK);
		newAnonymNode.addChildrenToBack(Node.newString(Token.NAME, ""));
		
		newAnonymNode.addChildrenToBack(clonedorigParamNode);
		newAnonymNode.addChildrenToBack(blockNode);
		
		//to block add call with params as closure varibles
		Node returnNode = new Node(Token.RETURN);
		Node callNode = new Node(Token.CALL);
		callNode.addChildrenToBack(Node.newString(Token.NAME, anonymName));
		
		//first add all original params to this call
		for (int i = 0; i < clonedorigParamNode.getChildCount(); i++){
			Node temp = clonedorigParamNode.getChildAtIndex(i).cloneTree();
			callNode.addChildrenToBack(temp);
		}
		
		addParamsToMethod(closures, callNode, thisChanged, "this");
		
		returnNode.addChildrenToBack(callNode);
		blockNode.addChildrenToBack(returnNode);
		
		
		return newAnonymNode;
	}

	private void addParamsToMethod(Set<String> closures, Node callNode, boolean thisChanged, String thisParam) {
		for (String closure: closures){
			Node paramNode = Node.newString(Token.NAME, closure);
			callNode.addChildrenToBack(paramNode);
		}
		if (thisChanged){
			callNode.addChildrenToBack(Node.newString(Token.NAME, thisParam));
		}
	}
	
	

	
	
	/**
	 * Finds set of all defs in function given (defSites). Adds parameters of function
	 * to this set: defSites. Finds all variables that are referenced in the function given
	 * (alf.names). windowProps are all global properties available. 
	 * Closures = alf.names - defSites - windowProps
	 * @param n root node of the function who's closures are to be found
	 * @return set of closure names
	 */
	private Set<String> findClosures(Node n) {
		Set<String> closureVars = null;
		
		SimpleDefinitionFinder defFinder = new SimpleDefinitionFinder(compiler);
		defFinder.process(externs, n.getLastChild());
		Collection<DefinitionSite> defSites = defFinder.getDefinitionSites();
		Set<String> localDefs = new HashSet<String>();
		
		for(DefinitionSite site: defSites){
			if (site.node.getType() == Token.GETPROP) continue;
			String def = site.node.getString();
			if (def.length() > 0){
				localDefs.add(def);
			}
		}
		
		//adding params to function as defs
		Node origParamNode = n.getChildAtIndex(1);
		for (int i = 0; i < origParamNode.getChildCount(); i++){
			String temp = origParamNode.getChildAtIndex(i).getString();
			localDefs.add(temp);
		}
		
		
		//System.out.println("\nPrinting LOCAL def sites:" + defs);
		
		/*SimpleDefinitionFinder defFinder1 = new SimpleDefinitionFinder(compiler);
		defFinder1.process(externs, root);
		Collection<DefinitionSite> defSites1 = defFinder1.getDefinitionSites();
		Set<String> defs1 = new HashSet<String>();
		
		for(DefinitionSite site1: defSites1){
			if (site1.node.getType() == Token.GETPROP) continue;
			String def = site1.node.getString();
			if (def.length() > 0){
				defs1.add(def);
			}
		}
		System.out.println("\nPrinting Global def sites:" + defs1);*/
		
		
		
		AllNamesFinder alf = new AllNamesFinder(compiler);
		NodeTraversal.traverse(compiler, n.getLastChild(), alf);
		
		//System.out.println("all names: " + alf.names);
		
		closureVars = alf.names;
		
		closureVars.removeAll(localDefs);
		closureVars.removeAll(Props.windowProps); 
		
		closureVars.remove("this"); //since 'this' is later modified to $$_self we don't need to consider this as closure
		
		return closureVars;
	}
	
	
	
}

class AllNamesFinder extends AbstractPostOrderCallback {
	private final AbstractCompiler compiler;
	Set<String> names = new HashSet<String>();
	public AllNamesFinder(AbstractCompiler compiler) {
		this.compiler = compiler;
	}

	@Override
	public void visit(NodeTraversal t, Node n, Node parent) {
		//System.out.println(n);
		switch (n.getType()) {
		case Token.NAME:
			if (n.getString().length() > 0){
				names.add(n.getString());	
			}
			
		}
		
	}
	
	
}

class ThisChanger extends AbstractPostOrderCallback implements CompilerPass, Serializable{
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	private final AbstractCompiler compiler;
	public boolean thisChanged;
	public ThisChanger(AbstractCompiler compiler) {
		this.compiler = compiler;
	}
	
	@Override
	public void process(Node externs, Node root) {
		NodeTraversal.traverse(compiler, root, this);
	
	}
	
	@Override
	public void visit(NodeTraversal t, Node n, Node parent) {
		switch (n.getType()) {
		case Token.THIS:
				parent.replaceChild(n, Node.newString(Token.NAME, "$$_self"));
				thisChanged = true;
				compiler.reportCodeChange();
		}
		
	}
};


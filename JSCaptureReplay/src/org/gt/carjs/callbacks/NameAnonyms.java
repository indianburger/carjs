package org.gt.carjs.callbacks;

import java.util.Collection;
import java.util.HashSet;
import java.util.Set;

import org.gt.carjs.Props;
import org.gt.carjs.ThisChanger;

import com.google.javascript.jscomp.AbstractCompiler;
import com.google.javascript.jscomp.DefinitionSite;
import com.google.javascript.jscomp.NodeTraversal;
import com.google.javascript.jscomp.SimpleDefinitionFinder;
import com.google.javascript.jscomp.NodeTraversal.AbstractPostOrderCallback;
import com.google.javascript.rhino.Node;
import com.google.javascript.rhino.Token;

public class NameAnonyms extends AbstractPostOrderCallback {
	private final Node root;
	private int anonymCount = 0;
	private final AbstractCompiler compiler;
	private final Node externs;
	private final Set<Node> anonymizedFnNodes = new HashSet<Node>();

	public NameAnonyms(Node root, AbstractCompiler compiler, Node externs) {
		this.root = root;
		this.compiler = compiler;
		this.externs = externs;
	}

	@Override
	public void visit(NodeTraversal t, Node n, Node parent) {
		// System.out.println(n);
		switch (n.getType()) {
		case Token.FUNCTION:
			Node functionNameNode = n.getFirstChild();
			String currFunctionName = functionNameNode.getString();

			if (!anonymizedFnNodes.contains(n)) {
				if (currFunctionName.length() == 0) {
					Set<String> closures = findClosures(n);

					// System.out.println("closures" + closures);

					n.detachFromParent(); // detach anonymous function from.

					// change all references to 'this' in method to $$_self
					boolean thisChanged = changeThisTo$$_self(n);

					// clone the parameters of modified
					// $$$anonym(originalParams..., closures..) so that
					// we can use it for parameters of function call below

					Node clonedorigParamNode = n.getChildAtIndex(1).cloneTree();
					clonedorigParamNode.setType(Token.LP);

					// parent
					// give 'n' a name and attach to end
					// e.g. function $$anonym(originalParams..., closures..)
					String anonymName = "$$anonym" + anonymCount++;
					Node funcNameNode = Node.newString(Token.NAME, anonymName);
					n.replaceChild(n.getFirstChild(), funcNameNode);

					Node parametersNode = n.getChildAtIndex(1);
					addParamsToMethod(closures, parametersNode, thisChanged,
							"$$_self", "origCallee");

					root.getFirstChild().addChildrenToBack(n);

					// replace original anonymous call to new anonymous
					// function that closes over
					// params and then makes a call to our named function
					Node newAnonymNode = createAnonymWithParamCall(closures,
							anonymName, clonedorigParamNode, thisChanged);
					parent.addChildrenToBack(newAnonymNode);

					// add to list of anonymized nodes so that we can ignore
					// it on second pass
					anonymizedFnNodes.add(newAnonymNode);

					compiler.reportCodeChange();
				} else {// named function just find closures and add as
						// parameter
						// TODO
				}
			}
		}
	}

	private boolean changeThisTo$$_self(Node funcRoot) {
		ThisChanger tc = new ThisChanger(compiler, "$$_self");
		tc.process(externs, funcRoot);
		return tc.thisChanged;

	}

	private Node createAnonymWithParamCall(Set<String> closures,
			String anonymName, Node clonedorigParamNode, boolean thisChanged) {
		Node newAnonymNode = new Node(Token.FUNCTION);
		Node blockNode = new Node(Token.BLOCK);
		newAnonymNode.addChildrenToBack(Node.newString(Token.NAME, ""));

		newAnonymNode.addChildrenToBack(clonedorigParamNode);
		newAnonymNode.addChildrenToBack(blockNode);

		// to block add call with params as closure varibles
		Node returnNode = new Node(Token.RETURN);
		Node callNode = new Node(Token.CALL);
		callNode.addChildrenToBack(Node.newString(Token.NAME, anonymName));

		// first add all original params to this call
		for (int i = 0; i < clonedorigParamNode.getChildCount(); i++) {
			Node temp = clonedorigParamNode.getChildAtIndex(i).cloneTree();
			callNode.addChildrenToBack(temp);
		}

		addParamsToMethod(closures, callNode, thisChanged, "this", "arguments.callee");

		returnNode.addChildrenToBack(callNode);
		blockNode.addChildrenToBack(returnNode);

		return newAnonymNode;
	}

	private void addParamsToMethod(Set<String> closures, Node callNode,
			boolean thisChanged, String thisParam, String callee) {
		for (String closure : closures) {
			Node paramNode = Node.newString(Token.NAME, closure);
			callNode.addChildrenToBack(paramNode);
		}
		if (thisChanged) {
			callNode.addChildrenToBack(Node.newString(Token.NAME, thisParam));
		}

		// TODO: this is a hack. Has to be fixed so that original arguments can
		// be used
		callNode.addChildrenToBack(Node.newString(Token.NAME,
				callee));
	}

	/**
	 * Finds set of all defs in function given (defSites). Adds parameters of
	 * function to this set: defSites. Finds all variables that are referenced
	 * in the function given (alf.names). windowProps are all global properties
	 * available. Closures = alf.names - defSites - windowProps
	 * 
	 * @param n
	 *            root node of the function who's closures are to be found
	 * @return set of closure names
	 */
	private Set<String> findClosures(Node n) {
		Set<String> closureVars = null;

		SimpleDefinitionFinder defFinder = new SimpleDefinitionFinder(compiler);
		defFinder.process(externs, n.getLastChild());
		Collection<DefinitionSite> defSites = defFinder.getDefinitionSites();
		Set<String> localDefs = new HashSet<String>();

		for (DefinitionSite site : defSites) {
			if (site.node.getType() == Token.GETPROP)
				continue;
			String def = site.node.getString();
			if (def.length() > 0) {
				localDefs.add(def);
			}
		}

		// adding params to function as defs
		Node origParamNode = n.getChildAtIndex(1);
		for (int i = 0; i < origParamNode.getChildCount(); i++) {
			String temp = origParamNode.getChildAtIndex(i).getString();
			localDefs.add(temp);
		}

		// System.out.println("\nPrinting LOCAL def sites:" + defs);

		/*
		 * SimpleDefinitionFinder defFinder1 = new
		 * SimpleDefinitionFinder(compiler); defFinder1.process(externs, root);
		 * Collection<DefinitionSite> defSites1 =
		 * defFinder1.getDefinitionSites(); Set<String> defs1 = new
		 * HashSet<String>();
		 * 
		 * for(DefinitionSite site1: defSites1){ if (site1.node.getType() ==
		 * Token.GETPROP) continue; String def = site1.node.getString(); if
		 * (def.length() > 0){ defs1.add(def); } }
		 * System.out.println("\nPrinting Global def sites:" + defs1);
		 */

		AllNamesFinder alf = new AllNamesFinder();
		NodeTraversal.traverse(compiler, n.getLastChild(), alf);

		// System.out.println("all names: " + alf.names);

		closureVars = alf.names;

		closureVars.removeAll(localDefs);
		closureVars.removeAll(Props.windowProps);

		closureVars.remove("this"); // since 'this' is later modified to
									// $$_self we don't need to consider
									// this as closure

		return closureVars;
	}

}
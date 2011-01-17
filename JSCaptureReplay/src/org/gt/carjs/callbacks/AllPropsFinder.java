package org.gt.carjs.callbacks;

import java.util.HashSet;
import java.util.Set;

import com.google.javascript.jscomp.AbstractCompiler;
import com.google.javascript.jscomp.NodeTraversal;
import com.google.javascript.jscomp.NodeTraversal.AbstractPostOrderCallback;
import com.google.javascript.rhino.Node;
import com.google.javascript.rhino.Token;

/**
 * This class finds all properties like e['keycode'] ( e['key' + 'code'] won't work) 
 * and at the end of node traveral will store all of them in 'names'
 * @author aravind
 *
 */
public class AllPropsFinder extends AbstractPostOrderCallback {
	private final AbstractCompiler compiler;
	public Set<String> names = new HashSet<String>();
	public AllPropsFinder(AbstractCompiler compiler) {
		this.compiler = compiler;
	}

	@Override
	public void visit(NodeTraversal t, Node n, Node parent) {
		switch(n.getType()){
		case Token.GETPROP:
		case Token.GETELEM:
			Node child = n.getLastChild();
			int type = child.getType();
			//right now we consider direct references to properties only like e['keycode']. We miss e['key' + 'code']
			if (type == Token.NAME || type == Token.STRING){
				names.add(n.getLastChild().getString());	//last child of getprop or getelem node is the name of property
			}
		}
		
	}
	
	
}

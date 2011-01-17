package org.gt.carjs.callbacks;

import java.util.HashSet;
import java.util.Set;

import com.google.javascript.jscomp.AbstractCompiler;
import com.google.javascript.jscomp.NodeTraversal;
import com.google.javascript.jscomp.NodeTraversal.AbstractPostOrderCallback;
import com.google.javascript.rhino.Node;
import com.google.javascript.rhino.Token;

public class AllNamesFinder extends AbstractPostOrderCallback {
	public Set<String> names = new HashSet<String>();

	@Override
	public void visit(NodeTraversal t, Node n, Node parent) {
		// System.out.println(n);
		switch (n.getType()) {
		case Token.NAME:
			if (n.getString().length() > 0) {
				names.add(n.getString());
			}

		}

	}

}

package org.gt.carjs;

import java.io.Serializable;

import com.google.javascript.jscomp.AbstractCompiler;
import com.google.javascript.jscomp.CompilerPass;
import com.google.javascript.jscomp.NodeTraversal;
import com.google.javascript.jscomp.NodeTraversal.AbstractPostOrderCallback;
import com.google.javascript.rhino.Node;
import com.google.javascript.rhino.Token;

/**
 * This callback changes all references to this in a given root to $$_self
 * @author aravind
 *
 */
public class ThisChanger extends AbstractPostOrderCallback implements CompilerPass,
		Serializable {
	private static final long serialVersionUID = 1L;
	private final AbstractCompiler compiler;
	public boolean thisChanged;
	
	private String targetName;

	public ThisChanger(AbstractCompiler compiler, String targetName) {
		this.compiler = compiler;
		this.targetName = targetName;
	}

	@Override
	public void process(Node externs, Node root) {
		NodeTraversal.traverse(compiler, root, this);

	}

	@Override
	public void visit(NodeTraversal t, Node n, Node parent) {
		switch (n.getType()) {
		case Token.THIS:
			
			parent.replaceChild(n, Node.newString(Token.NAME, targetName));
			thisChanged = true;
			compiler.reportCodeChange();
		}

	}
}
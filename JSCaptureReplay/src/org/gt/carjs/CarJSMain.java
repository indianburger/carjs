package org.gt.carjs;

import java.io.File;
import java.io.IOException;
import java.io.StringReader;
import java.util.HashSet;
import java.util.Set;

import org.apache.commons.io.FileUtils;
import org.gt.carjs.callbacks.AllPropsFinder;

import com.google.javascript.jscomp.AbstractCompiler;
import com.google.javascript.jscomp.Compiler;
import com.google.javascript.jscomp.CompilerOptions;
import com.google.javascript.jscomp.JSSourceFile;
import com.google.javascript.jscomp.LineNumberCheck;
import com.google.javascript.jscomp.NodeTraversal;
import com.google.javascript.jscomp.NodeTraversal.AbstractPostOrderCallback;
import com.google.javascript.rhino.Node;
import com.google.javascript.rhino.Token;
import com.google.javascript.rhino.testing.BaseJSTypeTestCase;

public class CarJSMain {
	
	
	public static void main(String[] args) throws IOException {


		/*final String jsSource = FileUtils.readFileToString(new File(
				"battle.js"));*/
		String jsSourcePath = "";
		String captureJSPath = "";
		String replayJSPath = "";
		
		/*if (args.length != 3){
			System.out.print("3 arguments required: <source path> <capture js path> <relay js path>\n" +
					"Assuming default tetris paths\n" +
					"source: tetris.js\n" +
					"capture js path: /home/aravind/Dropbox/workspaces/spl-prob/DebugMonitorWeb/WebContent/tetris/tetris.js\n" +
					"replay js path: /home/aravind/Dropbox/workspaces/spl-prob/DebugMonitorWeb/WebContent/tetris/replay.js\n\n");
			jsSourcePath = "tetris.js";
			captureJSPath = "/home/aravind/Dropbox/workspaces/spl-prob/DebugMonitorWeb/WebContent/tetris/tetris.js";
			replayJSPath = "/home/aravind/Dropbox/workspaces/spl-prob/DebugMonitorWeb/WebContent/tetris/replay.js";
			
		}
		else{*/
		if (args.length !=2){
			System.out.println("Wrong number of args. CarJSMain <input path> <instrumented output path>");
			return;
		}
		
			System.out.println("Processing using command line args");
			jsSourcePath = args[0];
			captureJSPath = args[1];
			//replayJSPath = args[2];
		/*}*/
		
		String jsSource = FileUtils.readFileToString(new File(jsSourcePath));
		
		/*final String jsSource = FileUtils.readFileToString(new File(
		"main.js"));*/

		//final String jsSource = "x.click(function(){var a;}, function(){var b;});";
		//final String jsSource = "x.click(x, y);";
		
		/*String jsSource = "var $$_args = new Array();\n" +
							"for (x in arguments) $$_args.push(arguments[x]);\n" +
							"$$_args.push(close1);\n" +
							"$$_args.push(close2);";*/
		
								
		
		/*jsSource = "function closure(x, y){this.x[w][keyCode] = 10};\n" +
							"var anotherClose = 15;\n" +
							"var x = function(qq, rr, closure1){\n" +
							"alert(1);\n" +
							"var y = this - anotherClose;\n" +
							"var z = document.getElementById.blah('x');\n" +
							"};";*/

		/*String jsSource = "var x = $$x;\n " +
						"var out = 0;\n" +
						"function $$x(){\n" + 
						"alert(1);\n" + 
						"var y = 10;}";*/
		/*System.out.println("source:\n" + jsSource);
		System.out.println();*/
		// +
		//"var y = function(){alert(10)};\n" +
		//"var z = 20;";

		Compiler compiler = createMyCompiler(jsSource);
		Node root = compiler.parseInputs();

		Node externsRoot = root.getFirstChild();
		Node mainRoot = root.getLastChild();
		
		

			
		//find the various properties used in program
		AllPropsFinder apf = new AllPropsFinder(compiler);
		NodeTraversal.traverse(compiler, mainRoot, apf);
		
		//find props of event object that are referred to in this program
		Set<String> eventPropsFound = new HashSet<String>(apf.names);
		Set<String> eventObjectProps = Props.keyMouseProps;
		eventPropsFound.retainAll(eventObjectProps);
		//System.out.println(props);
		
		
		//find HTMLElement props that are referred in this program
		Set<String> elementPropsFound = new HashSet<String>(apf.names);
		Set<String> elementObjectProps = Props.elementProps;
		elementPropsFound.retainAll(elementObjectProps);
		
		//after process() of MyFunctionNames, methods are instrumented and source modified.
		//any analysis on original source must be done before this.
		MyFunctionNames functionNames = new MyFunctionNames(compiler);
		functionNames.process(externsRoot, mainRoot);
		//new LineNumberCheck(compiler).process(externsRoot, mainRoot);

		//every function call entry and exit is logged
		StringBuilder pbBuilder = new StringBuilder();
		pbBuilder.append("report_call: \"$$logEntry\"")
			// .append("report_defined: \"$$reportDefine\"")
			.append("report_exit: \"$$logExit\"");

		// final String initCode = initCodeBuilder.toString();
		String instrumentationPb = pbBuilder.toString();

		
		//at this pont we assume that all anonymous functions are removed and replaced with
		//our spl indirections.
		JSInstrumentFunctions instrumentation = new JSInstrumentFunctions(compiler,
				functionNames, "test init code", "testfile.js",
				new StringReader(instrumentationPb));
		instrumentation.process(externsRoot, mainRoot);
		String instrOutput = compiler.toSource();
		

		//System.out.println("Instrumented:\n" + instrOutput);

		//String captureOutput = addCaptureCode(instrOutput, eventPropsFound, elementPropsFound);
		String captureOutput = "$$logEntry(this, \"$$script$$\");\n\n" + instrOutput + "\n\n$$logExit(\"$$script$$\")";
		
		/*FileUtils
				.writeStringToFile(
						new File(
								"/home/aravind/Dropbox/workspaces/spl-prob/" +
								"DebugMonitor/WebContent/battleship/battle.js"),
						instrOutput);*/
		
		FileUtils
		.writeStringToFile(
				new File(captureJSPath),
				captureOutput);
		
		//System.out.println(captureOutput);
		
		//String replayOutput = createReplayJS(instrOutput);
		
		/*FileUtils
		.writeStringToFile(
				new File(replayJSPath),
				replayOutput);*/
		
		/*System.out.println("--------\n" +
				"Capture replay instrumentation complete.\n" +
				"Capture file is at:" + captureJSPath + "\n" + 
				"Replay file at: " + replayJSPath);*/
		System.out.println("--------\n" +
				"Instrumentation complete.\n" +
				"Instrumented file is at:" + captureJSPath);		
		
	}

	private static Compiler createMyCompiler(String jsSource) {
		Compiler compiler = new Compiler();
		CompilerOptions options = new CompilerOptions();
		options.prettyPrint = true;
		options.lineBreak = true;
		options.printInputDelimiter = true;

		JSSourceFile[] externsInputs = new JSSourceFile[] { JSSourceFile
				.fromCode("externs", "") };
		compiler.init(externsInputs, new JSSourceFile[] { JSSourceFile
				.fromCode("testcode", jsSource) }, options);
		BaseJSTypeTestCase.addNativeProperties(compiler.getTypeRegistry());
		
		return compiler;
	}

	private static String createReplayJS(String source) throws IOException {
		String replayFuncsPre = FileUtils.readFileToString(new File("replayFuncsPre.js"));
		String replayFuncsPost = FileUtils.readFileToString(new File("replayFuncsPost.js"));
		source = replayFuncsPre + "\n\n" + source + "\n\n" + replayFuncsPost;
		return source;
	}

	private static String addCaptureCode(String instrOutput, Set<String> propsFound, Set<String> elementPropsFound) throws IOException {
		String myFuncs = FileUtils.readFileToString(new File("captureFuncsPre.js"));
		
		myFuncs = replacePropsIn(myFuncs, "<<eventprops>>", propsFound);
		
		myFuncs = replacePropsIn(myFuncs, "<<elementprops>>", elementPropsFound);
		
		
		
		instrOutput = myFuncs + "\n\n" + instrOutput;
		return instrOutput;
	}

	private static String replacePropsIn(String theString, String target, Set<String> replaceSet) {
		String propsFoundString = "[";
		for (String propFound: replaceSet){
			propsFoundString += "\"" + propFound + "\","; 
		}
		if (propsFoundString.charAt(propsFoundString.length() - 1) == ','){//remove the last comma if it's there
			propsFoundString = propsFoundString.substring(0, propsFoundString.length() - 1);
		}
		
		propsFoundString += "]";
		
		theString = theString.replace(target, propsFoundString);
		return theString;
	}
	
}


	

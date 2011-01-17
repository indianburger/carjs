package org.gt.carjsweb;

import java.io.File;
import java.util.ResourceBundle;

public class Util {
	public static ResourceBundle carjswebProps;
	public static File logFuncFile;
	public static File logRandFile;
	
	static{
		try {
			carjswebProps = ResourceBundle.getBundle("carjsweb");
			logFuncFile = new File(Util.carjswebProps.getString("log_func_path"));
			logRandFile = new File(Util.carjswebProps.getString("log_rand_path"));
			System.out.println("using Log func path:" + carjswebProps.getString("log_func_path"));
			System.out.println("using Log rand path:" + carjswebProps.getString("log_rand_path"));
		} catch (Exception e) {
			e.printStackTrace();
		} 
	}
}

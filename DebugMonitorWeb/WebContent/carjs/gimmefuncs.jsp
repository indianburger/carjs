<%@page import="org.gt.carjsweb.Util"%>
<%@page import="java.io.File"%>
<%@page import="org.apache.commons.io.FileUtils"%>
<%
String fullLog = FileUtils.readFileToString(Util.logFuncFile);
int len = fullLog.length();
if (len > 2 && fullLog.substring(len - 2).equals("__")){
	fullLog = fullLog.substring(0, fullLog.length() - 2);
}
out.write(fullLog);
%>
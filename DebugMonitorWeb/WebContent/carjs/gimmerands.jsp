<%@page import="org.gt.carjsweb.Util"%>
<%@page import="java.io.File"%>
<%@page import="org.apache.commons.io.FileUtils"%>
<%
String fullLog = FileUtils.readFileToString(Util.logRandFile);
if (fullLog.length() > 1 && fullLog.charAt(fullLog.length() - 1) == ','){
	fullLog = fullLog.substring(0, fullLog.length() - 1);
}
out.write(fullLog);
%>
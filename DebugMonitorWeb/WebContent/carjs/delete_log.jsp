<%@page import="java.text.SimpleDateFormat"%>
<%@page import="java.util.Date"%>
<%@page import="java.io.FileWriter"%>
<%@page import="org.gt.carjsweb.Util"%>
<%@page import="java.io.File"%>
<%@page import="org.apache.commons.io.FileUtils"%>
<%
long currentTime = System.currentTimeMillis();

System.out.println();  
System.out.println("clearing log contents. New execution at:" + currentTime );

pageContext.getServletContext().setAttribute("start", new Long(currentTime));
FileUtils.writeStringToFile(Util.logFuncFile, "");
FileUtils.writeStringToFile(Util.logRandFile, "");
%>
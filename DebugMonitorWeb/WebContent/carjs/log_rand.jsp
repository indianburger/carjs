<%@page import="org.gt.carjsweb.Util"%>
<%@page import="java.io.FileWriter"%>
<%@page import="java.io.File"%>
<%@page import="org.apache.commons.io.FileUtils"%>
<%
String row = request.getParameter("log");
System.out.println("rand arrived");
//row += "," + System.getProperty("line.separator");
FileWriter writer = new FileWriter(Util.carjswebProps.getString("log_rand_path"), true);
writer.write(row);
writer.flush();
writer.close();
%>
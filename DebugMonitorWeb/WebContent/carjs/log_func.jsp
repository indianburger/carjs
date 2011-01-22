<%@page import="java.sql.Date"%>
<%@page import="org.gt.carjsweb.Util"%>
<%@page import="java.io.FileWriter"%>
<%@page import="java.io.File"%>
<%@page import="org.apache.commons.io.FileUtils"%>
<%
String row = request.getParameter("log");

//row += "__" + System.getProperty("line.separator");


FileWriter writer = new FileWriter(Util.carjswebProps.getString("log_func_path"), true);
writer.write(row);
writer.flush();
writer.close();


Long startTime = (Long)pageContext.getServletContext().getAttribute("start");
 
Long currentTime = System.currentTimeMillis();


System.out.println("func arrived. Time elapsed: " + (currentTime - startTime) /1000 + "s");

File func = new File(Util.carjswebProps.getString("log_func_path"));
File rand = new File(Util.carjswebProps.getString("log_rand_path"));
long size = func.length() + rand.length();
System.out.println("Func + rand file size: " + size + " bytes");
%>
<%
String name = request.getParameter("name");
response.getWriter().print("Hello " + name);
%>
<?php
include("database.php");

// 清除 username Cookie
setcookie("username", "", time() - 3600, "/");

// 清除 user_id Cookie
setcookie("user_id", "", time() - 3600, "/");

// 清除 login_time Cookie
setcookie("login_time", "", time() - 3600, "/");

// 清除 role Cookie
setcookie("role", "", time() - 3600, "/");
 // 返回成功响应
 echo json_encode([
    "status" => "success",
    "message" => "注销成功！"
]);
?>
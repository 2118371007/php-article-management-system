<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Max-Age: 86400');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json');
$db="ams";
$dbhostname="127.0.0.1";
$dbusername='root';
$dbpassword='123456';
$con=mysqli_connect($dbhostname,$dbusername,$dbpassword,$db) or die("连接数据库失败");
?>
<?php
session_start();
include("database.php");
$username = $_POST["username"];
$password = $_POST["password"];
$posttype = $_POST["posttype"];
$isremember = $_POST["isremember"];
//var_dump($username);
$hashpas = md5($password);
if ($posttype == "login")//处理登录请求和获取权限请求
{
    $sql1 = "select * from users where username=? and password=?";
    $stmt = $con->prepare($sql1);//预处理
    if ($stmt) {
        // 绑定预处理参数，"ss" 表示两个字符串类型的参数
        $stmt->bind_param("ss", $username, $hashpas);

        // 执行查询
        $stmt->execute();

        // 获取查询结果
        $re1 = $stmt->get_result();

        // 检查结果是否有匹配的行
        if ($re1->num_rows > 0) {
            // 用户验证成功
            $user = $re1->fetch_assoc();//把查询到的数据放进user中

            // --- 新增的权限查询逻辑 ---

            // 1. 从登录用户信息中获取角色名
            $userRole = $user['role'];

            // 2. 执行JOIN查询，获取该角色所有可访问的页面路径
            $sql_permission = "SELECT m.path
                               FROM role_menu rm
                               JOIN menu m ON rm.menu_id = m.id
                               WHERE rm.role_name = ?";

            $stmt_permission = $con->prepare($sql_permission);
            $stmt_permission->bind_param("s", $userRole);
            $stmt_permission->execute();
            $result_permission = $stmt_permission->get_result();

            // 3. 将所有可访问的页面路径存入一个数组
            $allowed_pages = [];
            while ($row = $result_permission->fetch_assoc()) {
                $allowed_pages[] = $row['path'];
            }
            $stmt_permission->close();

            // --- 权限查询结束 ---


            // --- 将关键信息存入 SESSION ---
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
            $_SESSION['role'] = $user['role'];
            $_SESSION['permissions'] = $allowed_pages; // 关键的权限列表

            
            // 设置 Cookie
            if ($isremember === "true") {//如果用户选择记住密码，则设置cookie时候设置一个过期时间
                $expire_time = time() + (24 * 60 * 60 * 7); // 7天后的时间戳
                setcookie(
                    "username",
                    $user['username'],
                    $expire_time,
                    "/"
                );
                setcookie(
                    "user_id",
                    $user['id'],
                    $expire_time,
                    "/"
                );
                setcookie("login_time", time(), [
                    "expires" => $expire_time,
                    "path" => "/",
                    "httponly" => true,
                    "secure" => true
                ]);
                setcookie(
                    "role",
                    $user['role'],
                    $expire_time,
                    "/"
                );
            } else {
                // 如果用户没有选择记住密码，则设置会话 Cookie（浏览器关闭时删除）
                setcookie(
                    "username",
                    $user['username'],
                    0,
                    "/"
                ); // 过期时间为 0
                setcookie(
                    "user_id",
                    $user['id'],
                    0,
                    "/"
                );
                setcookie("login_time", time(), [
                    "expires" => 0,
                    "path" => "/",
                    "httponly" => true,
                    "secure" => true
                ]);
                setcookie(
                    "role",
                    $user['role'],
                    0,
                    "/"
                );
            }


            // 返回成功响应
            echo json_encode([
                "status" => "success",
                "message" => "登录成功",
                "username" => $user['username'],
                "role" => $user['role']
            ]);
        }
        //没有匹配行则状态为错误，登陆信息为用户名或密码错误
        else {
            echo json_encode([
                "status" => "error",
                "message" => "用户名或密码错误"
            ]);

        }
    } else {//预处理失败则返回相关错误信息
        echo json_encode([
            "status" => "error",
            "message" => "SQL语句预处理失败：" . $con->error
        ]);

    }
    // 关闭预处理语句
    $stmt->close();
}
else if ($posttype == "get_permissions") {
    // 如果是获取权限请求，直接返回当前用户的权限
    if (isset($_SESSION['permissions'])) {
        echo json_encode([
            'status' => 'success',
            'permissions' => $_SESSION['permissions']
        ]);
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => '未登录或没有权限数据'
        ]);
    }
}
//处理注册请求
else  {
    $sql2 = "INSERT INTO users (username, password) VALUES (?, ?)";
    $stmt = $con->prepare($sql2);//预处理
    //绑定参数
    $stmt->bind_param("ss", $username, $hashpas);
    //执行查询
    if ($stmt->execute()) {
        echo json_encode([
            "status" => "success",
            "message" => "注册成功,请重新登录"
        ]);
    } else {
        // 检查是否是用户名重复导致的错误 (MySQL 错误代码 1062)
        if ($stmt->errno == 1062) { // 唯一性约束冲突
            echo json_encode([
                "status" => "error",
                "message" => "用户名已存在"
            ]);
        } else {
            // 其他数据库错误
            echo json_encode([
                "status" => "error",
                "message" => "注册失败：" . $stmt->error
            ]);
        }
    }
    //关闭预处理
    $stmt->close();
}

// 关闭数据库连接
$con->close();
?>
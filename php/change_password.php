<?php
include("database.php");


// 获取POST数据
$username = $_POST['username'] ?? '';
$new_password = $_POST['new_password'] ?? '';

// 验证数据
if (empty($username) || empty($new_password)) {
    echo json_encode([
        'status' => 'error',
        'message' => '参数不完整'
    ]);
    exit;
}

// 密码加密
$hashed_password = md5($new_password);

// 更新密码
$sql = "UPDATE users SET password = ? WHERE username = ?";
$stmt = $con->prepare($sql);

if ($stmt) {
    $stmt->bind_param("ss", $hashed_password, $username);
    
    if ($stmt->execute()) {
        echo json_encode([
            'status' => 'success',
            'message' => '密码修改成功'
        ]);
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => '密码修改失败：' . $stmt->error
        ]);
    }
    
    $stmt->close();
} else {
    echo json_encode([
        'status' => 'error',
        'message' => '数据库操作失败：' . $con->error
    ]);
}

$con->close();
?> 
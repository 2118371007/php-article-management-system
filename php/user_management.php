<?php
include("database.php");


$action = $_POST['action'] ?? '';
$username = $_POST['username'] ?? '';

if ($action === 'delete_user') {
    if (empty($username)) {
        echo json_encode(['status' => 'error', 'message' => '参数不完整']);
        exit;
    }
    if ($username === 'admin') {
        echo json_encode(['status' => 'error', 'message' => '不能删除超级管理员']);
        exit;
    }
    // 查询用户id
    $stmt = $con->prepare('SELECT id FROM users WHERE username = ?');
    $stmt->bind_param('s', $username);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result->num_rows === 0) {
        echo json_encode(['status' => 'error', 'message' => '用户不存在']);
        exit;
    }
    $user = $result->fetch_assoc();
    $userId = $user['id'];
    $stmt->close();

    // 删除该用户的附件（通过文章）
    $stmt = $con->prepare('SELECT id FROM articles WHERE author_id = ?');
    $stmt->bind_param('i', $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    $articleIds = [];
    while ($row = $result->fetch_assoc()) {
        $articleIds[] = $row['id'];
    }
    $stmt->close();
    if (!empty($articleIds)) {
        $in = implode(',', array_fill(0, count($articleIds), '?'));
        $types = str_repeat('i', count($articleIds));
        $stmt = $con->prepare('DELETE FROM attachments WHERE article_id IN (' . $in . ')');
        $stmt->bind_param($types, ...$articleIds);
        $stmt->execute();
        $stmt->close();
    }
    // 删除该用户的文章
    $stmt = $con->prepare('DELETE FROM articles WHERE author_id = ?');
    $stmt->bind_param('i', $userId);
    $stmt->execute();
    $stmt->close();
    // 删除用户
    $stmt = $con->prepare('DELETE FROM users WHERE id = ?');
    $stmt->bind_param('i', $userId);
    if ($stmt->execute()) {
        echo json_encode(['status' => 'success', 'message' => '用户及其相关数据已删除']);
    } else {
        echo json_encode(['status' => 'error', 'message' => '删除失败: ' . $stmt->error]);
    }
    $stmt->close();
    $con->close();
    exit;
}

if ($action === 'change_role') {
    $new_role = $_POST['new_role'] ?? '';
    
    // 验证参数
    if (empty($username) || empty($new_role)) {
        echo json_encode(['status' => 'error', 'message' => '参数不完整']);
        exit;
    }
    
    // 验证角色值
    if (!in_array($new_role, ['admin', 'user'])) {
        echo json_encode(['status' => 'error', 'message' => '无效的角色值']);
        exit;
    }
    
    // 不能修改超级管理员
    if ($username === 'admin') {
        echo json_encode(['status' => 'error', 'message' => '不能修改超级管理员的角色']);
        exit;
    }
    
    // 获取当前登录的管理员用户名
    $currentAdmin = isset($_COOKIE['username']) ? $_COOKIE['username'] : '';
    
    // 防止管理员降级自己
    if ($username === $currentAdmin && $new_role === 'user') {
        echo json_encode(['status' => 'error', 'message' => '不能降级自己的管理员权限']);
        exit;
    }
    
    // 更新用户角色
    $stmt = $con->prepare('UPDATE users SET role = ? WHERE username = ?');
    if ($stmt) {
        $stmt->bind_param('ss', $new_role, $username);
        
        if ($stmt->execute()) {
            echo json_encode([
                'status' => 'success',
                'message' => '用户角色修改成功'
            ]);
        } else {
            echo json_encode([
                'status' => 'error',
                'message' => '角色修改失败：' . $stmt->error
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
    exit;
}

echo json_encode(['status' => 'error', 'message' => '无效的操作']);
$con->close(); 
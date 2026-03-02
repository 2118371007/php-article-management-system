<?php
include("database.php");

// 获取前端提交的数据
$title = $_POST["title"];
$content = $_POST["content"];
$category = $_POST["category"];
$username = $_POST["username"];
$image = $_FILES["image"];
//获取前端传过来的附件信息，如果上传了附件就存储起来，没传就为空(文件大小转为整数)
$attachmentName = isset($_POST["attachmentName"]) ? $_POST["attachmentName"] : '';
$attachmentSize = isset($_POST["attachmentSize"]) ? intval($_POST["attachmentSize"]) : 0;
$attachmentType = isset($_POST["attachmentType"]) ? $_POST["attachmentType"] : '';
$attachmentPath = isset($_POST["attachmentPath"]) ? $_POST["attachmentPath"] : '';

// 定义图片上传存储目录
$imgDir = '../subimg/';
// 处理图片上传
// 移除不安全字符
$imageName = preg_replace("/[^a-zA-Z0-9\.\-_]/", "", $image['name']);
// 获取临时文件路径
$imageTmpPath = $image['tmp_name'];
// 获取文件扩展名
$imageExtension = pathinfo($imageName, PATHINFO_EXTENSION);
// 生成唯一文件名防止冲突
$newFileName = uniqid() . '.' . $imageExtension;
// 拼接最终存储路径
$imageDestPath = $imgDir . $newFileName;

// 移动图片文件到目标目录
if (!move_uploaded_file($imageTmpPath, $imageDestPath)) {
    echo json_encode([
        'status' => 'error',
        'message' => '图片上传失败'
    ]);
    exit;
}

// 查询用户名对应的用户 ID
$sql1 = "SELECT id FROM users WHERE username=?";
$stmt1 = $con->prepare($sql1);
if (!$stmt1) {
    echo json_encode([
        'status' => 'error',
        'message' => 'SQL 准备失败: ' . $con->error
    ]);
    exit;
}
$stmt1->bind_param("s", $username);
if (!$stmt1->execute()){
    echo json_encode([
        'status' => 'error',
        'message' => 'SQL 执行失败: ' . $stmt1->error
    ]);
    exit;
}
$result = $stmt1->get_result();
if ($result && $result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $author_id = $row['id'];
} else {
    echo json_encode([
        'status' => 'error',
        'message' => '未找到用户'
    ]);
    exit;
}
$stmt1->close();

// 插入文章数据
$sql2 = "INSERT INTO articles (title, content, image_path, category, author_id) VALUES (?, ?, ?, ?, ?)";
$stmt2 = $con->prepare($sql2);
if (!$stmt2) {
    echo json_encode([
        'status' => 'error',
        'message' => '文章 SQL 准备失败: ' . $con->error
    ]);
    exit;
}
$stmt2->bind_param("ssssi", $title, $content, $imageDestPath, $category, $author_id);
if (!$stmt2->execute()){
    echo json_encode([
        'status' => 'error',
        'message' => '发布失败: ' . $stmt2->error
    ]);
    exit;
}
// 获取刚插入的文章 ID
$articleId = $con->insert_id;
$stmt2->close();

// 如果有附件信息则插入附件表
if (!empty($attachmentName) && !empty($attachmentPath)) {
    $sql3 = "INSERT INTO attachments (article_id, file_name, file_path, file_size, file_type) VALUES (?, ?, ?, ?, ?)";
    $stmt3 = $con->prepare($sql3);
    if (!$stmt3) {
        echo json_encode([
            'status' => 'error',
            'message' => '附件 SQL 准备失败: ' . $con->error
        ]);
        exit;
    }
    // 注意：附件大小为 bigint，对应 bind_param 的 "i" 类型（整型）
    $stmt3->bind_param("issis", $articleId, $attachmentName, $attachmentPath, $attachmentSize, $attachmentType);
    if (!$stmt3->execute()){
        echo json_encode([
            'status' => 'error',
            'message' => '附件信息插入失败: ' . $stmt3->error
        ]);
        exit;
    }
    $stmt3->close();
}

// 返回最终成功响应
echo json_encode([
    'status' => 'success',
    'message' => '发布成功',
    'imagePath' => $imageDestPath,
    'articleId' => $articleId
]);

$con->close();
?>

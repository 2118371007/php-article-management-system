<?php
include("database.php");
// 获取前端提交的数据   
$articleid = $_POST["articleid"];
//在数据库中查询文章对应的附件信息
$sql = "SELECT * FROM attachments WHERE article_id=?";
$stmt = $con->prepare($sql);
if (!$stmt) {
    echo json_encode([
        'status' => 'error',
        'message' => 'SQL 准备失败: ' . $con->error
    ]);
    exit;
}
else{
    //绑定参数
    $stmt->bind_param("i", $articleid);
    if (!$stmt->execute()){
        echo json_encode([
            'status' => 'error',
            'message' => 'SQL 执行失败: ' . $stmt->error
        ]);
        exit;
    }
    //获取查询结果
    $result = $stmt->get_result();
    if ($result && $result->num_rows > 0) {
        $attachments = [];
        while ($row = $result->fetch_assoc()) {
            $attachments[] = [
                'id' => $row['id'],
                'file_name' => $row['file_name'],
                'file_size' => $row['file_size'],
                'file_type' => $row['file_type'],
                'file_path' => $row['file_path']
            ];
        }
        echo json_encode([
            'status' => 'success',
            'attachments' => $attachments
        ]);
    } else {
        echo json_encode([
            'status' => 'null',
            'message' => '没有找到附件信息'
        ]);
    }
}
$stmt->close();
$con->close();
?>
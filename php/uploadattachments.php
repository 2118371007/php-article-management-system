<?php
include("database.php");
//获取附件文件 
$attachment = $_FILES['file'];
$attachmentDir = '../attachments/'; // 附件存储目录

// 处理附件上传（如果上传了附件）

$attachmentDestPath = null; // 初始化附件路径
if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
    $attachmentName = preg_replace("/[^a-zA-Z0-9\.\-_]/", "", $_FILES['file']['name']);
    $attachmentTmpPath = $_FILES['file']['tmp_name'];
    $attachmentExtension = pathinfo($attachmentName, PATHINFO_EXTENSION);
    $newAttachmentName = uniqid() . '.' . $attachmentExtension;
    $attachmentDestPath = $attachmentDir . $newAttachmentName;

    // 移动附件文件到目标目录
    if (!move_uploaded_file($attachmentTmpPath, $attachmentDestPath)) {
        echo json_encode([
            'status' => 'error',
            'message' => '附件上传失败'
        ]);
        exit;
    }
    // 获取文件大小和类型
    $fileSize = $_FILES['file']['size'];
    // 获取文件后缀（小写）
    $fileType = strtolower(pathinfo($attachmentName, PATHINFO_EXTENSION)); 
    
    // 返回附件上传成功的信息，包括附件路径、附件名、附件大小和附件类型
    echo json_encode([
        'status' => 'success',
        'message' => '附件上传成功',
        'data' => [
            'attachment_path' => $attachmentDestPath,
            'attachment_name' => $newAttachmentName,
            'attachment_size' => $fileSize,
            'attachment_type' => $fileType
        ]
    ]);
}
?>
<?php
include("database.php");
$articleId = $_POST["articleId"];
$posttype = $_POST["posttype"];
$attachmentId = $_POST["attachmentId"];
//删除按钮发起的请求
if ($posttype == "delete") {
    //检查是否有附件，有则删除
    $sql1 = "SELECT * FROM attachments WHERE article_id = ?";
    $stmt1 = $con->prepare($sql1);
    if ($stmt1) {
        $stmt1->bind_param("i", $articleId);
        if(!$stmt1->execute()){
            echo json_encode([
                "status" => "error",
                "message" => "删除失败：" . $stmt1->error
            ]);
            exit;
        }
        $stmt1->close();
    }
    //删除文章表里面的内容
    $sql = "DELETE FROM articles WHERE id = ?";
    $stmt = $con->prepare($sql);
    if ($stmt) {
        $stmt->bind_param("i", $articleId);
        //如果预处理执行成功则返回对应的信息
        if ($stmt->execute()) {
            echo json_encode([
                "status" => "success",
                "message" => "文章删除成功，请刷新后查看"
            ]);
        } else {
            echo json_encode([
                "status" => "error",
                "message" => "删除失败：" . $stmt->error
            ]);
        }
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "预处理失败" . $stmt->error
        ]);
    }
    $stmt->close();
    
    exit;
}
//编辑按钮发起的请求
else if ($posttype == "edit") {
    $sql1="SELECT * FROM attachments WHERE article_id = ?";
    $stmt1 = $con->prepare($sql1);
    if($stmt1){
        $stmt1->bind_param("i", $articleId);
        $stmt1->execute();
        $re1=$stmt1->get_result();
        if($re1->num_rows>0){
            $attachments = $re1->fetch_assoc();
        }
    }
    $stmt1->close();
    $sql = "SELECT * FROM articles WHERE id = ?";
    $stmt = $con->prepare($sql);
    if ($stmt) {
        $stmt->bind_param("i", $articleId);
        $stmt->execute();
        $re = $stmt->get_result();
        if ($re->num_rows > 0) {
            $article = $re->fetch_assoc();
            echo json_encode([
                "status" => "success",
                "article" => $article,
                "attachments" => $attachments
            ]);
        } else {
            echo json_encode([
                "status" => "error",
                "message" => "文章获取错误" . $stmt->error
            ]);
        }
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "预处理失败" . $stmt->error
        ]);
    }
    $stmt->close();
    exit;
}
//确认修改发起的请求
else if ($posttype == "editconfirm") {
    $title = $_POST["title"];
    $content = $_POST["content"];
    $category = $_POST["category"];
    $image = $_FILES["image"];
    // 定义上传存储目录
    $uploadDir = '../subimg/';
    $imageName = preg_replace("/[^a-zA-Z0-9\.\-_]/", "", $_FILES['image']['name']);
    $imageTmpPath = $_FILES['image']['tmp_name'];
    $imageExtension = pathinfo($imageName, PATHINFO_EXTENSION);
    $newFileName = uniqid() . '.' . $imageExtension;
    $destPath = $uploadDir . $newFileName;
    // 默认更新语句不更新图片路径
    $sql = "UPDATE articles SET title = ?, content = ?, category = ? WHERE id = ?";
    $stmt = $con->prepare($sql);
    $stmt->bind_param("sssi", $title, $content, $category, $articleId);
    //如果上传了图片且没有错误则图片也更新
    if ($image['error'] == UPLOAD_ERR_OK) {
        if (move_uploaded_file($imageTmpPath, $destPath)) {
            $sql = "UPDATE articles SET title = ?, content = ?, category = ?, image_path = ? WHERE id = ?";
            $stmt = $con->prepare($sql);
            $stmt->bind_param("ssssi", $title, $content, $category, $destPath, $articleId);
        }
    }
    if ($stmt) {
        if ($stmt->execute()) {
            //var_dump($stmt->affected_rows);
            echo json_encode([
                "status" => "success",
                "message" => "修改成功"
            ]);
        } else {
            echo json_encode([
                "status" => "error",
                "message" => "修改失败" . $stmt->error
            ]);
        }
        $stmt->close();
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "预处理失败" . $con->error
        ]);
    }

}
//删除附件发起的请求
else if($posttype == "deleteAttachment"){
    $sql = "DELETE FROM attachments WHERE id = ?";
    $stmt = $con->prepare($sql);
    if($stmt){
        $stmt->bind_param("i", $attachmentId);
        if($stmt->execute()){
            echo json_encode([
                "status" => "success",
                "message" => "附件删除成功"
            ]);
        }else{
            echo json_encode([
                "status" => "error",
                "message" => "附件删除失败" . $stmt->error
            ]);
        }
        $stmt->close();
    }else{
        echo json_encode([
            "status" => "error",
            "message" => "预处理失败" . $con->error
        ]);
    }
    exit;
}

$con->close();
?>
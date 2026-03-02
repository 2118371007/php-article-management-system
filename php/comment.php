<?php
include("database.php");
$articleid = $_POST["articleid"];
$posttype = $_POST["posttype"];
//如果当前请求是发布评论
if ($posttype == "submitcomment") {
    $username = $_POST["username"];
    $comments = $_POST["comments"];
    // 查询用户名对应的 ID
    $sql1 = "SELECT id FROM users WHERE username=?";
    $stmt1 = $con->prepare($sql1);
    if ($stmt1) {
        $stmt1->bind_param("s", $username);
        $stmt1->execute();
        $re1 = $stmt1->get_result();
        if ($re1->num_rows > 0) {
            //把查询结果放到userid中
            $row = $re1->fetch_assoc();
            $userid = $row['id'];
        }
    }
    //开始往数据库插入评论内容
    $sql2 = "INSERT INTO comments (article_id, user_id, content) VALUES (?, ?, ?)";
    $stmt2 = $con->prepare($sql2);
    if ($stmt2) {
        $stmt2->bind_param("iis", $articleid, $userid, $comments);
        if ($stmt2->execute()) {
            echo json_encode([
                'status' => 'success',
                'message' => '发布评论成功'
            ]);
        } else {
            echo json_encode([
                'status' => 'error',
                'message' => '发布评论失败' . $stmt2->error
            ]);
        }
    }
    $stmt1->close();
    $stmt2->close();
}
//加载评论发起的请求
else {
    //使用多表联查查询评论者的用户名和评论时间并且按照发布时间排序
    $sql1 = "SELECT 
                comments.content AS comment_content,
                comments.created_at AS comment_time,
                users.username AS commenter_username
            FROM 
                comments
            INNER JOIN 
                users ON comments.user_id = users.id
            WHERE 
                comments.article_id = ?
            ORDER BY comments.created_at 
            ";
    $stmt1 = $con->prepare($sql1);
    $stmt1->bind_param("i", $articleid);
    $stmt1->execute();
    $re1 = $stmt1->get_result();
    //如果有结果则把所有数据都放入comments[]中并且返回给前端
    if ($re1->num_rows > 0) {
        $comments = [];
        while ($row = $re1->fetch_assoc()) {
            $comments[] = $row;
        }
        echo json_encode([
            "status" => "success",
            "comments" => $comments
        ]);
    }
    else{
        echo json_encode([
            "status" => "error",
            "message" => "当前文章还没有评论"
        ]);
    }
    $stmt1->close();
}
$con->close();



?>
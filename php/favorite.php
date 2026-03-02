<?php
include("database.php");
//获取文章id和用户名
$articleid = $_POST["articleid"];
$username = $_POST["username"];
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
//查询用户是否已经收藏过该文章
$sql2 = "SELECT * FROM favorites WHERE user_id=? AND article_id=?";
$stmt2 = $con->prepare($sql2);
if ($stmt2) {
    $stmt2->bind_param("ii", $userid, $articleid);
    $stmt2->execute();
    $re2 = $stmt2->get_result();
    //若有结果则说明已经收藏过，应该取消收藏
    if ($re2->num_rows > 0) {
        $sql3 = "DELETE FROM favorites WHERE user_id=? AND article_id=?";
        $stmt3 = $con->prepare($sql3);
        if ($stmt3) {
            $stmt3->bind_param("ii", $userid, $articleid);
            if ($stmt3->execute()) {
                echo json_encode([
                    'status' => 'success',
                    'message' => '取消收藏成功'
                ]);
            } else {
                echo json_encode([
                    'status' => 'error',
                    'message' => '取消收藏失败' . $stmt3->error
                ]);
            }
        }
    } 
    //没有结果则说明没有收藏过，应该收藏
    else {
        //开始往数据库插入收藏记录
        $sql3 = "INSERT INTO favorites (article_id, user_id) VALUES (?, ?)";
        $stmt3 = $con->prepare($sql3);
        if ($stmt3) {
            $stmt3->bind_param("ii", $articleid, $userid);
            if ($stmt3->execute()) {
                echo json_encode([
                    'status' => 'success',
                    'message' => '收藏成功'
                ]);
            } else {
                echo json_encode([
                    'status' => 'error',
                    'message' => '收藏失败' . $stmt3->error
                ]);
            }
        }
        $stmt3->close();
    }
}
else{
    echo json_encode([
        'status' => 'error',
        'message' => '查询失败' . $stmt2->error
    ]);
}
$stmt1->close();
$stmt2->close();
$con->close();
?>
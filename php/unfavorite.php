<?php
include("database.php");    
$articleid=$_POST["articleId"];
$username=$_POST["username"];
// 查询用户名对应的 ID
$sql1 = "SELECT id FROM users WHERE username=?";
$stmt1 = $con->prepare($sql1);
if ($stmt1) {
    $stmt1->bind_param("s", $username);
    $stmt1->execute();
    $re1 = $stmt1->get_result();
    if ($re1->num_rows > 0) {
        $row = $re1->fetch_assoc();
        $userid = $row['id'];
    }
}
//取消收藏文章
$sql2 = "DELETE FROM favorites WHERE user_id=? AND article_id=?";
        $stmt2 = $con->prepare($sql2);
        if ($stmt2) {
            $stmt2->bind_param("ii", $userid, $articleid);
            if ($stmt2->execute()) {
                echo json_encode([
                    'status' => 'success',
                    'message' => '取消收藏成功'
                ]);
            } else {
                echo json_encode([
                    'status' => 'error',
                    'message' => '取消收藏失败' . $stmt2->error
                ]);
            }
        }
?>
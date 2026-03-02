<?php
include("database.php");
$articleid=$_POST["articleid"];
$username=$_POST["username"];
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
$sql="SELECT 
    a.*, 
    u.username AS author_name
    FROM 
    articles AS a
    JOIN 
    users AS u
    ON 
    a.author_id = u.id
    WHERE 
    a.id = ?;
    ";
$stmt=$con->prepare($sql);
$stmt->bind_param("i",$articleid);
$stmt->execute();
$re=$stmt->get_result();
if($re->num_rows>0){
    $article=$re->fetch_assoc();
    //查询用户是否已经收藏过该文章
    $sql2 = "SELECT * FROM favorites WHERE user_id=? AND article_id=?";
    $stmt2 = $con->prepare($sql2);
    if ($stmt2) {
        $stmt2->bind_param("ii", $userid, $articleid);
        $stmt2->execute();
        $re2 = $stmt2->get_result();
        //若有结果则说明已经收藏过返回相应的识别码
        if ($re2->num_rows > 0) {
            $article["is_favorite"]=true;
        }
        else{
            $article["is_favorite"]=false;
        }
    }
    echo json_encode([
        "status" => "success",
        "article" => $article
    ]);
}
else{
    echo json_encode([
        "status" => "error",
        "message" => "文章获取错误".$stmt->error
    ]);
}
$stmt->close();
$con->close();
?>
<?php
include("database.php");
//获取用户名
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
//使用多表联查查询收藏的文章的标题,作者，类别，和收藏时间并且按照收藏时间排序
$sql2 = "SELECT 
            articles.title AS article_title,
            users.username AS article_author,
            articles.category AS article_category,
            favorites.created_at AS favorite_time,
            articles.id AS article_id
        FROM 
            favorites
        INNER JOIN 
            articles ON favorites.article_id = articles.id
        INNER JOIN 
            users ON articles.author_id = users.id
        WHERE 
            favorites.user_id = ?
        ORDER BY favorites.created_at DESC
        ";
$stmt2 = $con->prepare($sql2);
if($stmt2){
    $stmt2->bind_param("i", $userid);
    $stmt2->execute();
    $re2 = $stmt2->get_result();
    //把查询结果放到数组中
    $favorites = [];
    while ($row = $re2->fetch_assoc()) {
        $favorites[] = $row;
    }
    echo json_encode(
        ["status" => "success",
                "favorites"=>$favorites
        ]
        );
}
else{
    echo json_encode(
        ["status" => "error",
                "message"=>"没有收藏文章".$con->error
        ]
        );
}
$stmt1->close();
$stmt2->close();
$con->close();

?>
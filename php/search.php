<?php
include("database.php");
$temptsearchval=$_POST["search"];
//为绑定参数设置一个$searchval，拼接了%
$searchval="%".$temptsearchval."%";
//多表联查，条件是标题或者正文的模糊查询
$sql="SELECT 
    a.id AS article_id, 
    a.title, 
    SUBSTRING(a.content, 1, 20) AS content_preview, 
    a.image_path, 
    a.created_at, 
    u.username AS author_name
    FROM articles AS a
    JOIN users AS u ON a.author_id = u.id
    WHERE a.title LIKE ? 
    ORDER BY a.created_at DESC;
    ";
$stmt=$con->prepare($sql);
$stmt->bind_param("s",$searchval);
$stmt->execute();
$re=$stmt->get_result();
//如果模糊查询有结果就存储在$articles数组中，然后返回给前端
if($re->num_rows>0){
    $articles=[];
    while($row=$re->fetch_assoc()){
        $articles[]=$row;
    }
    echo json_encode([
        "status"=>"success",
        "articles"=>$articles
    ]);
    
}
//未查询到相关数据的话则返回对应的错误信息
else{
    echo json_encode([
        "status"=>"error",
        "message"=>"未搜索到相关文章!!".$stmt->error
    ]);
}
$stmt->close();
$con->close();

?>
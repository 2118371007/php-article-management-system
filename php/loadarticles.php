<?php
include("database.php");
//获取用户角色，以便在管理页面显示文章
$role = $_POST["role"];
$username = $_POST["username"];

$page = isset($_POST["page"]) ? (int) $_POST["page"] : 1;
$limit = isset($_POST["limit"]) ? (int) $_POST["limit"] : 16;
//计算当前页的偏移量，也就是从第几条数据开始查询

$offset = ($page - 1) * $limit;

//页面的类别
$category = $_POST["category"];
//如果不是首页则请求对应的类别的文章
if ($category == "phone" || $category == "laptop" || $category == "pods" || $category == "others") {
    // 获取文章总数
    $total_sql = "SELECT COUNT(*) as total FROM articles WHERE category = ?";
    $total_stmt = $con->prepare($total_sql);
    $total_stmt->bind_param("s", $category);
    $total_stmt->execute();
    $total_result = $total_stmt->get_result();
    $total_row = $total_result->fetch_assoc();
    $total_articles = (int) $total_row["total"];
    //ceil函数向上取整，max函数确保总页数至少为1
    // 除以每页显示数量 $limit，得到理论页数再向上取整
    //取max函数确保总页数至少为1
    $total_pages = max(1, ceil($total_articles / $limit)); // 计算总页数
    $total_stmt->close();
    // 查询文章的id，标题，从content字段中查询出前面20个字符作为预览，图片路径，作者id，发布时间，
    //并且按发布时间升序排序,
    //offset表示从第几条数据开始查询，limit表示每页显示多少条数据
    $sql1 = "SELECT 
                a.id AS article_id, 
                a.title, 
                SUBSTRING(a.content, 1, 20) AS content_preview, 
                a.image_path, 
                a.created_at, 
                u.username AS author_name
            FROM articles AS a
            JOIN users AS u ON a.author_id = u.id
            WHERE a.category = ?
            ORDER BY a.created_at DESC
            LIMIT ? OFFSET ?";
    //预处理
    $stmt1 = $con->prepare($sql1);
    //绑定参数
    $stmt1->bind_param("sii", $category, $limit, $offset);
    //执行预处理
    $stmt1->execute();
    //把预处理结果拿出来存放在re1中
    $re1 = $stmt1->get_result();
    //如果查询到相关数据就便利把所有的数据循环放入articles数组中并且返回给前端
    if ($re1->num_rows > 0) {
        $articles = [];
        while ($row = $re1->fetch_assoc()) {
            $articles[] = $row;
        }
        echo json_encode([
            "status" => "success",
            "locaution" => "others",
            "articles" => $articles,
            "total_pages"=>$total_pages
        ]);
        $stmt1->close();
    }
    //未查询到就返回对应的错误信息
    else {
        echo json_encode([
            "status" => "error",
            "message" => "当前分类下没有文章" . $stmt1->error
        ]);
        $stmt1->close();

    }
}
//请求首页所展示的文章
else if ($category == "index") {
    // 定义首页查询预处理变量
    $CATEGORY_PHONE = 'phone';
    $CATEGORY_LAPTOP = 'laptop';
    $CATEGORY_PODS = 'pods';
    // 查询文章的id，标题，从content字段中查询出前面20个字符作为预览，图片路径，作者id，发布时间，
    //并且按发布时间升序排序查询出三条数据作为首页展示使用,再使用join从users表中查出作者的username
    $sql1 = "SELECT 
                a.id AS article_id, 
                a.title, 
                SUBSTRING(a.content, 1, 20) AS content_preview, 
                a.image_path, 
                a.created_at, 
                u.username AS author_name
            FROM articles AS a
            JOIN users AS u ON a.author_id = u.id
            WHERE a.category = ?
            ORDER BY a.created_at DESC
            LIMIT 3;";
    //预处理
    $phonestmt = $con->prepare($sql1);
    $phonestmt->bind_param("s", $CATEGORY_PHONE);
    $phonestmt->execute();
    $phonere = $phonestmt->get_result();

    $laptopstmt = $con->prepare($sql1);
    $laptopstmt->bind_param("s", $CATEGORY_LAPTOP);
    $laptopstmt->execute();
    $laptopre = $laptopstmt->get_result();

    $podsstmt = $con->prepare($sql1);
    $podsstmt->bind_param("s", $CATEGORY_PODS);
    $podsstmt->execute();
    $podsre = $podsstmt->get_result();
    //循环把查询结果都传给前端js处理
    if ($phonere->num_rows > 0) {
        $phonearticles = [];
        while ($row = $phonere->fetch_assoc()) {
            $phonearticles[] = $row;
        }
    }
    if ($laptopre->num_rows > 0) {
        $laptoparticles = [];
        while ($row = $laptopre->fetch_assoc()) {
            $laptoparticles[] = $row;
        }
    }
    if ($podsre->num_rows > 0) {
        $podsarticles = [];
        while ($row = $podsre->fetch_assoc()) {
            $podsarticles[] = $row;
        }
    }
    $phonestmt->close();
    $laptopstmt->close();
    $podsstmt->close();
    //把查询到的东西返回给前端，locaution表示是返回给首页的数据
    echo json_encode([
        "status" => "success",
        "locaution" => "index",
        "phonearticles" => $phonearticles,
        "laptoparticles" => $laptoparticles,
        "podsarticles" => $podsarticles
    ]);
}
//请求管理页的文章
else {
    // 如果当前登录用户是admin，则显示所有文章管理，否则只显示自己发布的文章
    if ($role == "admin") {
        //查询文章标题，创建时间，文章类别和作者名
        $sql = "SELECT 
                a.id AS article_id, 
                a.title, 
                a.created_at, 
                a.category, 
                u.username AS author_name
                FROM articles AS a
                JOIN users AS u ON a.author_id = u.id
                ORDER BY a.created_at DESC;
                ";
        //没有查询条件，无须预处理，可直接执行查询
        $re = $con->query($sql);
        //如果有查询结果把查询结果循环放入$articles=[]并且返回给前端
        if ($re) {
            $articles = [];
            while ($row = $re->fetch_assoc()) {
                $articles[] = $row;
            }
            echo json_encode([
                "status" => "success",
                "locaution" => "management",
                "articles" => $articles
            ]);
        }
        //没有查询结果返回对应错误信息
        else {
            echo json_encode([
                "status" => "error",
                "locaution" => "management",
                "message" => "没有用户发布文章" . $con->error
            ]);
        }
    }
    //如果登录的是普通用户就查询自己的文章
    else {
        $sql = "
        SELECT 
            a.id AS article_id, 
            a.title, 
            a.created_at, 
            a.category, 
            u.username AS author_name
            FROM articles AS a
            JOIN users AS u ON a.author_id = u.id
            WHERE u.username = ?
            ORDER BY a.created_at DESC;
        ";
        $stmt = $con->prepare($sql);
        $stmt->bind_param("s", $username);
        $stmt->execute();
        $re = $stmt->get_result();
        if ($re->num_rows > 0) {
            $articles = [];
            while ($row = $re->fetch_assoc()) {
                $articles[] = $row;
            }
            echo json_encode([
                "status" => "success",
                "locaution" => "management",
                "articles" => $articles
            ]);
        } else {
            echo json_encode([
                "status" => "error",
                "locaution" => "management",
                "message" => "你还没有发布文章" . $con->error
            ]);
        }
    }
}

$con->close();
?>
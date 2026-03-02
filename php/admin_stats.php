<?php
include("database.php");

// 获取请求类型
$action = $_POST['action'] ?? '';

// 根据不同的请求类型返回不同的数据
switch($action) {
    case 'basic_stats':
        // 获取基本统计数据
        getBasicStats();
        break;
    case 'category_stats':
        // 获取分类统计数据
        getCategoryStats();
        break;
    case 'user_details':
        // 获取用户详细统计数据
        getUserDetails();
        break;
    default:
        echo json_encode(['status' => 'error', 'message' => '无效的请求类型']);
}

// 获取基本统计数据
function getBasicStats() {
    global $con;
    
    // 获取当前登录用户信息（从Cookie中）
    $currentUsername = isset($_COOKIE['username']) ? $_COOKIE['username'] : null;
    $currentRole = isset($_COOKIE['role']) ? $_COOKIE['role'] : null;
    
    // 如果没有登录，直接返回错误
    if (!$currentUsername) {
        echo json_encode(['status' => 'error', 'message' => '未登录或会话已过期']);
        return;
    }
    
    // 获取用户总数 - 管理员可以看到所有用户，普通用户只看到"1"（自己）
    if ($currentRole === 'admin') {
        $userQuery = "SELECT COUNT(*) as total_users FROM users";
        $stmt = $con->prepare($userQuery);
    } else {
        // 普通用户只看到自己
        $userQuery = "SELECT 1 as total_users";
        $stmt = $con->prepare($userQuery);
    }
    
    if (!$stmt) {
        echo json_encode(['status' => 'error', 'message' => '准备用户查询语句失败']);
        return;
    }
    
    $stmt->execute();
    $userResult = $stmt->get_result();
    $userCount = $userResult->fetch_assoc()['total_users'];
    $stmt->close();

    // 获取文章总数 - 管理员可以看到所有文章，普通用户只看到自己的文章
    if ($currentRole === 'admin') {
        $articleQuery = "SELECT COUNT(*) as total_articles FROM articles";
        $stmt = $con->prepare($articleQuery);
    } else {
        // 普通用户只看到自己的文章
        $articleQuery = "SELECT COUNT(*) as total_articles FROM articles a 
                        JOIN users u ON a.author_id = u.id 
                        WHERE u.username = ?";
        $stmt = $con->prepare($articleQuery);
        $stmt->bind_param('s', $currentUsername);
    }
    
    if (!$stmt) {
        echo json_encode(['status' => 'error', 'message' => '准备文章查询语句失败']);
        return;
    }
    
    $stmt->execute();
    $articleResult = $stmt->get_result();
    $articleCount = $articleResult->fetch_assoc()['total_articles'];
    $stmt->close();

    echo json_encode([
        'status' => 'success',
        'data' => [
            'total_users' => $userCount,
            'total_articles' => $articleCount
        ]
    ]);
}

// 获取分类统计数据
function getCategoryStats() {
    global $con;
    
    // 获取当前登录用户信息（从Cookie中）
    $currentUsername = isset($_COOKIE['username']) ? $_COOKIE['username'] : null;
    $currentRole = isset($_COOKIE['role']) ? $_COOKIE['role'] : null;
    
    // 如果没有登录，直接返回错误
    if (!$currentUsername) {
        echo json_encode(['status' => 'error', 'message' => '未登录或会话已过期']);
        return;
    }
    
    // 预定义所有应该显示的分类
    $allCategories = ['phone', 'laptop', 'pods'];
    $categories = [];
    
    // 初始化每个分类为0，确保即使没有数据也会返回所有分类
    foreach ($allCategories as $cat) {
        $categories[$cat] = [
            'category' => $cat,
            'count' => 0,
            'percentage' => 0
        ];
    }
    
    // 管理员可以看到所有分类统计，普通用户只看到自己的文章分类
    if ($currentRole === 'admin') {
        // 获取各分类文章数量
        //用分组查询查到的个数除以总文章数，计算百分比
        $query = "SELECT 
                    category,
                    COUNT(*) as count,
                    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM articles), 2) as percentage
                FROM articles 
                GROUP BY category";
        
        $stmt = $con->prepare($query);
    } else {
        // 普通用户只能看到自己的文章分类统计
        $query = "SELECT 
                    a.category,
                    COUNT(*) as count,
                    ROUND(COUNT(*) * 100.0 / (
                        SELECT COUNT(*) FROM articles a2 
                        JOIN users u2 ON a2.author_id = u2.id 
                        WHERE u2.username = ?
                    ), 2) as percentage
                FROM articles a
                JOIN users u ON a.author_id = u.id
                WHERE u.username = ?
                GROUP BY a.category";
        
        $stmt = $con->prepare($query);
        $stmt->bind_param('ss', $currentUsername, $currentUsername);
    }
    
    if (!$stmt) {
        echo json_encode(['status' => 'error', 'message' => '准备分类统计查询语句失败']);
        return;
    }
    
    $stmt->execute();
    $result = $stmt->get_result();
    
    // 使用数据库结果更新预设的分类数组
    while($row = $result->fetch_assoc()) {
        //使用isset检查分类是否在预设数组中
        //如果分类存在，则构建关联数组，并更新到预设数组中
        if(isset($categories[$row['category']])) {
            $categories[$row['category']] = [
                'category' => $row['category'],
                'count' => (int)$row['count'],
                'percentage' => (float)$row['percentage']
            ];
        }
    }
    
    $stmt->close();

    // 把关联数组转换为索引数组，保持与原代码相同的输出格式
    // array_values() 函数将关联数组转换为索引数组，即丢弃掉原本的键，变成普通数组
    $categoriesOutput = array_values($categories);
    
    echo json_encode([
        'status' => 'success',
        'data' => $categoriesOutput
    ]);
}

// 获取用户详细统计数据
function getUserDetails() {
    global $con;

    // 获取当前登录用户信息（从Cookie中）
    $currentUsername = isset($_COOKIE['username']) ? $_COOKIE['username'] : null;
    $currentRole = isset($_COOKIE['role']) ? $_COOKIE['role'] : null;
    
    // 如果没有登录，直接返回错误
    if (!$currentUsername) {
        echo json_encode(['status' => 'error', 'message' => '未登录或会话已过期']);
        return;
    }
    
    // 根据用户角色构造不同的查询
    if ($currentRole === 'admin') {
        // 管理员可以查看所有用户数据
        //SUM(CASE WHEN a.category = 'phone' THEN 1 ELSE 0 END)
        //是判断，当前类别是phone的话就记为1，否则记为0，最后再求和，就是phone的数量
        $query = "SELECT 
                    u.username,
                    u.role,
                    SUM(CASE WHEN a.category = 'phone' THEN 1 ELSE 0 END) as phone_count,
                    SUM(CASE WHEN a.category = 'laptop' THEN 1 ELSE 0 END) as laptop_count,
                    SUM(CASE WHEN a.category = 'pods' THEN 1 ELSE 0 END) as pods_count,
                    COUNT(a.id) as total_articles
                  FROM users u
                  LEFT JOIN articles a ON u.id = a.author_id
                  GROUP BY u.id, u.username, u.role
                  ORDER BY total_articles DESC";
    } else {
        // 普通用户只能查看自己的数据
        $query = "SELECT 
                    u.username,
                    u.role,
                    SUM(CASE WHEN a.category = 'phone' THEN 1 ELSE 0 END) as phone_count,
                    SUM(CASE WHEN a.category = 'laptop' THEN 1 ELSE 0 END) as laptop_count,
                    SUM(CASE WHEN a.category = 'pods' THEN 1 ELSE 0 END) as pods_count,
                    COUNT(a.id) as total_articles
                  FROM users u
                  LEFT JOIN articles a ON u.id = a.author_id
                  WHERE u.username = ?
                  GROUP BY u.id, u.username, u.role
                  ORDER BY total_articles DESC";
    }
    
    $stmt = $con->prepare($query);
    if (!$stmt) {
        echo json_encode(['status' => 'error', 'message' => '准备用户详情查询语句失败: ' . $con->error]);
        return;
    }
    
    // 如果是普通用户，需要绑定参数
    if ($currentRole !== 'admin') {
        $stmt->bind_param('s', $currentUsername);
    }
    
    $stmt->execute();
    $result = $stmt->get_result();
    $users = [];
    
    while($row = $result->fetch_assoc()) {
        $users[] = [
            'username' => $row['username'],
            'role' => $row['role'],
            'phone_count' => (int)$row['phone_count'],
            'laptop_count' => (int)$row['laptop_count'],
            'pods_count' => (int)$row['pods_count'],
            'total_articles' => (int)$row['total_articles']
        ];
    }
    
    $stmt->close();

    // 修改模态框标题，根据用户角色
    $title = $currentRole === 'admin' ? '所有用户文章统计' : '我的文章统计';

    echo json_encode([
        'status' => 'success',
        'title' => $title,
        'data' => $users
    ]);
} 
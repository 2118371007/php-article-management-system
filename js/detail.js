$(document).ready(function () {
    // 获取用户 ID 和用户名
    const userId = getCookie("user_id");
    // 获取地址栏中的参数
    const queryString = window.location.search;
    // 使用 URLSearchParams 解析参数
    const urlParams = new URLSearchParams(queryString);
    // 获取具体参数值
    const articleid = urlParams.get("articleid");
    //封装一个函数用于从后端拉取文章及收藏状态
    function showarticle(){
        $.ajax({
            type: "Post",
            url: "/php/detail.php",
            data: {
                articleid: articleid,
                username: localStorage.getItem("username")
            },
            success: function (data) {
                //console.log(data.article.is_favorite);
                if (data.status == "success") {
                    //获取后端传回的数据
                    const article = data.article;
                    
                    //获取容器
                    const detailhtml = $("#detail");
                    let articlehtml = ``;
                    //拼接html标签
                    articlehtml += `
                    <h2>${article.title}</h2>
                    <div class="article-actions">
                        <div class="favorite-button" id="favorite-btn">
                            <i class="iconfont">&#xe605;</i> <!-- 阿里巴巴矢量图标（收藏图标） -->
                            <span>收藏</span>
                        </div>
                    </div>
                    <div class="det_text">
                        <p class="para">
                            ${article.author_name}&nbsp;&nbsp;&nbsp;&nbsp;
                            ${article.created_at}
                        </p>
                    </div>
                    <div class="det_pic">
                        <img src="${article.image_path}" style="width: 1107.78px; height: 422px; object-fit: cover;" />
                    </div>
                    <div class="det_text">
                        <p class="para">
                            ${article.content}
                        </p>
                    </div>
                    
                    `;
                    detailhtml.html(articlehtml);
                    //获取文章收藏状态
                    const is_favorite = article.is_favorite;
                    console.log(is_favorite);
                    //如果已经收藏了就修改对应的收藏图标和提示词
                    if(is_favorite){
                        $("#detail").find("#favorite-btn").html(`
                            <i class="iconfont">&#xe60d;</i> <!-- 已收藏图标 -->
                            <span>已收藏</span>
                        `);
                    }
                }
                else{
                    showPopup(data.message);
                }
    
            },
            error: function () {
                showPopup("文章请求失败!!!");
            }
        })
    }
    //拉取文章
    showarticle();
    //点击收藏按钮 
    $("#detail").on("click","#favorite-btn", function() {
        //判断用户是否登录
        if(!userId){
            showPopup("请先登录");
        }
        else{
            //获取用户名
            var username = localStorage.getItem("username");
            $.ajax({
                type: "Post",
                url: "/php/favorite.php",
                data: {
                    username: username,
                    articleid: articleid
                },
                success: function (data) {
                    if (data.status == "success") {
                        showPopup(data.message);
                        //刷新文章
                        showarticle();
                    }
                    else{
                        showPopup(data.message);
                    }
                },
                error: function () {
                    showPopup("收藏失败!!!");
                }
            })
        }
    });
});
$(document).ready(function () {
    //定义加载评论的函数
    function loadcomment() {
        //发起评论的请求
        $.ajax({
            type: "Post",
            url: "php/comment.php",
            data: {
                posttype: "loadcomment",
                articleid: articleid
            },
            success: function (data) {
                console.log(data);
                if (data.status == "success") {
                    //把后端传回的评论信息存储在comments中
                    const comments = data.comments;
                    //获取评论列表容器
                    const commentlistul = $("#comment-list");
                    let commentlisthtml = ``;
                    //循环拼接html元素
                    comments.forEach(function (comment) {
                        commentlisthtml += `
                    <li>
                        <strong>${comment.commenter_username}:</strong>
                        <span>${comment.comment_content}</span> 
                        <div class="comment-meta">${comment.comment_time}</div>
                    </li>
                    `
                    })
                    //把拼接后的html标签添加到评论容器当中
                    commentlistul.append(commentlisthtml);
                }
                else {
                    //获取评论列表容器
                    const commentlistul = $("#comment-list");
                    commentlistul.append(`<li><span>当前还没有评论，快去发布一条吧!!!</span></li>`);
                }
            },
            error: function () {
                showPopup("拉取评论失败!!!");
            }
        })
    }
    
    // 获取用户 ID 和用户名
    const userId = getCookie("user_id");
    // 获取地址栏中的参数(文章id)
    const queryString = window.location.search;
    // 使用 URLSearchParams 解析参数
    const urlParams = new URLSearchParams(queryString);
    // 获取具体参数值
    const articleid = urlParams.get("articleid");
    //如果当前登陆了，则显示提交评论的部分，否则隐藏
    if (userId) {
        $(".comment-form").show();
    }
    else {
        $(".comment-form").hide();
    }
    //加载评论
    loadcomment();
    //点击发布评论按钮
    $("#submit-comment").click(function () {
        //获取用户名
        var username = localStorage.getItem("username");
        console.log(username);
        //获取评论内容
        var comments = $("#comment-text").val();

        //若评论内容为空则提示，不为空发起请求
        if (comments == "") {
            showPopup("评论内容不能为空");
        }
        else {
            $.ajax({
                type: "Post",
                url: "php/comment.php",
                data: {
                    posttype: "submitcomment",
                    username: username,
                    comments: comments,
                    articleid: articleid
                },
                success: function (data) {
                    if (data.status == "success") {
                        showPopup(data.message);
                        loadcomment();
                        // setTimeout(function () {
                        //     location.reload();
                        // }, 1500)
                    }
                },
                error: function () {
                    showPopup("评论发布失败!!!");
                }
            })
        }
    })

    
})


// 读取 Cookie 的辅助函数
window.getCookie = function(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

$(document).ready(function () {
    // 显示提示弹窗的全局函数
    window.showPopup=function (message) {
        const popup = document.getElementById('custom-popup');
        document.getElementById('popup-message').innerText = message;
        popup.style.display = 'block';
    }

    // 隐藏弹窗的函数
    function hidePopup() {
        const popup = document.getElementById('custom-popup');
        popup.style.display = 'none';
    }

    // 绑定关闭按钮事件
    document.getElementById('popup-close').addEventListener('click', hidePopup);

    // 获取用户 ID 和用户名
    const userId = window.getCookie("user_id");
    const username = window.getCookie("username");
    
    //点击搜索按钮通过地址栏传参跳转到展示搜索内容页面
    $("#search-button").click(function () {
        //获取搜索输入框的值
        var searchval = $("#search-input").val().trim();
        window.location.href = "search.html?search=" + searchval;
    })

    //点击跳转到登录页面
    $("#useraccount").click(function () {
        window.location.href = "login.html";
    });
    
    //查看是否登录，如果登录则显示用户名，否则显示登录图标
    if (userId) {
        $("#useraccount").html(username);
        $("#exit").show();
        $("#useraccount").click(function () {
            window.location.href = "management.html";
        })
    }
    else {
        $("#useraccount").html("&#xe63a;");
        $("#exit").hide();
    }
    //页面上的退出登录按钮点击事件
    $("#exit").click(function () {
        $.ajax({
            type: "Post",
            url: "/php/logout.php",
            success: function (data) {
                console.log(data);
                if (data.status == "success") {
                    console.log("退出登录成功");
                   //清除cookie
                    document.cookie = "user_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                    document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                    document.cookie = "login_time=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                    document.cookie = "role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

                    showPopup(data.message);

                    //打开首页强制刷新页面并且清除浏览器缓存
                    setTimeout(function(){
                        window.location.href = "index.html?nocache=" + new Date().getTime();
                    },1500);
                } else {
                    console.log("退出登录失败");
                    showPopup(data.message);
                }
            },
            error: function () {
                showPopup("请求失败，请稍后重试！");
            }
        })
    })
    //跳转到管理页面的点击事件，如果未登录则跳转到登陆页面，已经登录则跳转到管理页面
    $(".managementpeage").click(function (event) {
        if (!userId) {
            showPopup("未登录或登陆过期，请重新登录...");
            setTimeout(function(){
                window.location.href = "login.html";
            },1500);
        }
        else {
            window.location.href = "management.html";
        }
    })

    
    
    

})
$(document).ready(function () {
    //监听输入框用户名和密码输入框的内容变化，并在输入内容非空时隐藏提示信息元素
    $("#username").on("input", function () {
        if ($(this).val().trim() !== "") {
            $("#username-error").hide();
        }
    });
    
    $("#password").on("input", function () {
        if ($(this).val().trim() !== "") {
            $("#password-error").hide();
        }
    });
    //设置一个注册按钮切换的索引，0表示登录，1表示注册
    var RegisterIndex=0;
    //点击注册事件
    $("#register").click(function(){
        if(RegisterIndex==0)
        {
            $("#register").text("已有帐号,点击去登录");
            $("#btn").html("注册");
            RegisterIndex=1;
        }
        else
        {
            $("#register").text("注册");
            $("#btn").html("登录");
            RegisterIndex=0;
        }
        
    })

    // 登录按钮点击事件
    $("#btn").click(function () {
        // 获取是否勾选了七天免密登录
        var isremember = $("#remember-me").prop("checked");
        // console.log(isremember);
        var username = $("#username").val().trim();
        var password = $("#password").val().trim();
        var hasError = false;
    
        // 验证用户名是否为空，为空则提示错误信息
        if (username === "") {
            $("#username-error").show();
            hasError = true;
        } else {
            $("#username-error").hide();
        }
    
        // 验证密码是否为空，为空则提示错误信息
        if (password === "") {
            $("#password-error").show();
            hasError = true;
        } else {
            $("#password-error").hide();
        }
        //当前按钮是登陆状态
        if(RegisterIndex==0)
        {
            // 如果没有错误，执行登录 AJAX 请求
            if (!hasError) {
                $.ajax({
                    type: "POST",
                    url: "php/login.php",
                    data: {
                        posttype:"login",
                        username: username,
                        password: password,
                        // 传递是否勾选了七天免密登录
                        isremember: isremember
                    },
                    dataType:"json",
                    success: function (data) {
                        if(data.status=="success")
                            {
                                // 存储用户名和用户角色到 localStorage
                                localStorage.setItem("username", data.username);
                                
                                localStorage.setItem("role", data.role);
                                showPopup(data.message);//输出登录信息
                                setTimeout(function(){
                                    window.location.href="index.html";//跳转到首页
                                },1500);
                                
                            }
                            //如果后端传回的状态不是成功则输出对应的错误信息
                        else if(data.status=="error")
                        {
                            showPopup(data.message);
                        }
                    },
                    error: function () {
                        showPopup("请求失败，请稍后重试！");
                    },
                });
            }
        }
        //当前按钮是注册状态
        if(RegisterIndex==1)
        {
            // 如果没有错误，执行注册 AJAX 请求
            if (!hasError) {
                $.ajax({
                    type: "POST",
                    url: "php/login.php",
                    data: {
                        posttype:"register",
                        username: username,
                        password: password,
                    },
                    success: function (data) {
                        if(data.status=="success")
                            {
                                showPopup(data.message);
                                //强制刷新页面并且清除浏览器缓存
                                setTimeout(function(){
                                    location.reload(true)
                                },1000);
                            }
                            //如果后端传回的状态不是成功则输出对应的错误信息
                        else if(data.status=="error")
                        {
                            showPopup(data.message);
                        }
                    },
                    error: function () {
                        showPopup("请求失败，请稍后重试！");
                    },
                });
            }
        }
    });  
    
});
// 实时隐藏错误提示

$(document).ready(function () {
    // 管理页面切换选项卡
    //通过设置active来决定哪一个按钮高亮以及显示对应的内容
    $(".tab-button").click(function () {
        //获取点击按钮的data-target的值
        const target = $(this).data("target");
        $(".tab-button").removeClass("active");
        $(this).addClass("active");
        $(".tab-content").removeClass("active");
        //通过data-target的值显示对应的内容
        $(target).addClass("active");
    });
    //定义拉取管理页面文章的函数
    function loadmanagementarticles() {
        // 获取分类（从 <body> 标签的 data-category 属性）
        const category = $("body").data("category");
        const role = localStorage.getItem("role");
        const username = localStorage.getItem("username");
        // 清空旧文章列表内容
        $(".article-list").empty();
        //ajax请求后端数据
        $.ajax({
            type: "Post",
            url: "/php/loadarticles.php",
            data: {
                username: username,
                category: category,
                role: role
            },
            dataType: "json",
            success: function (data) {
                //如果返回状态是success就把返回的json存储在articles中
                //再定义一个articleHTML拼接所有的html标签和返回的数据
                if (data.status == "success") {
                    //后端返回的文章存储起来
                    const articles = data.articles;
                    const articlelistul = $(".article-list");
                    let articlehtml = ``;
                    if (articles.length > 10) {
                        $("#load-more").show();
                    }
                    else {
                        $("#load-more").hide();
                    }
                    articles.forEach(function (article) {
                        articlehtml += `
                                        <li>
                                            <div class="article-info">
                                                <strong class="article-title">${article.title}</strong>
                                                <span class="article-meta">
                                                    作者：${article.author_name} | 创建时间：${article.created_at} | 类别：${article.category}
                                                </span>
                                            </div>
                                            <div class="article-actions">
                                                <button class="btn-view" data-id="${article.article_id}">查看</button>
                                                <button class="btn-edit" data-id="${article.article_id}">编辑</button>
                                                <button class="btn-delete" data-id="${article.article_id}">删除</button>
                                            </div>
                                        </li>
                                    `;
                    })
                    articlelistul.append(articlehtml);
                }
                else {
                    showPopup(data.message);
                }
            },
            error: function (err) {
                console.log(err)
                showPopup("文章请求失败!!!");
            }
        })
    }
    //拉取管理页文章
    loadmanagementarticles();
    // 使用事件委托绑定管理页面的查看文章按钮点击事件

    //事先把对应的文章id写在btn的data-id属性中，再通过该属性把文章id拿出来并通过url传递
    $(document).on("click", ".btn-view", function () {
        const articleId = $(this).data("id");
        window.location.href = `details.html?articleid=${articleId}`;
    });
    
    //点击编辑按钮
    $(document).on("click", ".btn-edit", function () {
        const articleId = $(this).data("id");
        $.ajax({
            type: "Post",
            url: "/php/management.php",
            data: {
                posttype: "edit",
                articleId: articleId
            },
            success: function (data) {
                if (data.status == "success") {
                    console.log(data);
                    const article = data.article;
                    const editdiv = $("#edit-modal");
                    console.log(article);
                    console.log(data);
                    // 填充表单数据
                    $("#edit-article-id").val(article.id);
                    $("#edit-title").val(article.title);
                    $("#edit-content").val(article.content);
                    $("#edit-category").val(article.category);
                    $("#edit-image-preview").html(`<img src="${article.image_path}" alt="图片预览">`);
                    // 填充附件信息
                    // 获取附件信息展示的容器
                    const attachmentsContainer = $("#edit-attachments");
                    attachmentsContainer.empty(); // 清空之前的附件内容
                    // 检查是否存在附件信息
                    if (data.attachments) {
                        // 创建一个 div 元素，用于显示单个附件信息，并添加 CSS 类
                        const attachmentDiv = $("<div>").addClass("attachment-item");
                         // 创建一个 span 元素，用于显示附件的文件名
                        const attachmentName = $("<span>").text(data.attachments.file_name);
                        // 创建一个 div 元素，用于放置附件操作按钮，并添加 CSS 类
                        const attachmentActions = $("<div>").addClass("attachment-actions");
        
                        // 添加删除按钮
                        const deleteButton = $("<button>").text("删除").addClass("btn-deleteattachments");
        
                        // 为删除附件按钮绑定事件
                        deleteButton.on("click", function () {
                            $.ajax({
                                type: "Post",
                                url: "/php/management.php",
                                data: {
                                    posttype: "deleteAttachment",
                                    attachmentId: data.attachments.id
                                },
                                success: function (data) {
                                    if (data.status === "success") {
                                        showPopup("附件删除成功");
                                    } else {
                                        showPopup("附件删除失败：" + data.message);
                                    }
                                },
                                error: function () {
                                    showPopup("删除请求发起失败!!!");
                                }
                            });
                        });
                        // 将删除按钮添加到附件操作容器中
                        attachmentActions.append(deleteButton);
                        // 将附件名称和操作按钮添加到附件信息容器中
                        attachmentDiv.append(attachmentName, attachmentActions);
                        // 将附件信息容器添加到页面中
                        attachmentsContainer.append(attachmentDiv);
                    } else {
                        attachmentsContainer.text("暂无附件");
                    }

                    $("#edit-image").change(function () {
                        const file = this.files[0];
                        const preview = $("#edit-image-preview");
                        preview.empty(); // 清空之前的内容
                        if (file) {
                            const reader = new FileReader();
                            reader.onload = function (e) {
                                preview.html(`<img src="${e.target.result}" alt="图片预览">`);
                            };
                            reader.readAsDataURL(file);
                        } else {
                            preview.text("图片预览将在这里显示");
                        }
                    });
                    //显示修改框
                    $("#edit-modal").show();

                }
                else {
                    showPopup(data.message);
                }
            },
            error: function () {
                showPopup("修改请求发起失败!!!");
            }
        })

    });
    //点击修改框里面的取消按钮隐藏修改框
    $("#cancel-edit").on("click", function () {
        $("#edit-modal").hide();
    })
    //点击修改按钮发起ajax请求
    $("#save-edit").on("click", function () {
        //获取
        const articleId = $("#edit-article-id").val(); // 改为从隐藏字段获取
        //获取修改框修改的值    
        const title = $("#edit-title").val().trim();
        const content = $("#edit-content").val().trim();
        const category = $("#edit-category").val();
        const posttype = "editconfirm";
        const image = $("#edit-image")[0].files[0];
        //标记用户是否修改了图片
        let imagestatus = "";
        if (image) {
            imagestatus = "change";
        }
        else {
            imagestatus = "unchange";
        }
        // 创建 FormData 对象用来同时存储文本和文件，一起发给后端
        let formData = new FormData();
        formData.append("title", title);
        formData.append("content", content);
        formData.append("image", image);
        formData.append("category", category);
        formData.append("posttype", posttype);
        formData.append("articleId", articleId);
        $.ajax({
            type: "Post",
            url: "/php/management.php",
            processData: false, // 不让 jQuery 处理数据
            contentType: false, // 不设置内容类型，浏览器会自动生成
            data: formData,
            success: function (response) {
                console.log(response);
                if (response.status == "success") {
                    //重新拉取管理页文章
                    loadmanagementarticles();
                    showPopup(response.message);
                }
                else {
                    showPopup(response.message);
                }
            },
            error: function (err) {
                console.log(err);
                showPopup("保存修改失败!!!");
            }
        })
    })
    //点击删除按钮
    $(document).on("click", ".btn-delete", function () {
        const articleId = $(this).data("id");
        $.ajax({
            type: "Post",
            url: "/php/management.php",
            data: {
                posttype: "delete",
                articleId: articleId
            },
            success: function (data) {
                //重新拉取管理页文章
                loadmanagementarticles();
                showPopup(data.message);
            },
            error: function () {
                showPopup("删除文章请求发起失败!!!");
            }
        })
    });
    // 收藏文章加载函数
    function loadFavorites() {
        const username = localStorage.getItem("username");

        $.ajax({
            type: "POST",
            url: "/php/loadfavorites.php",
            data: { username },
            dataType: "json",
            success: function (data) {
                console.log(data);
                if (data.status === "success") {
                    const list = $("#tab-favorites").empty();
                    let html = '';
                    data.favorites.forEach(fav => {
                        html += `
                            <li>
                                <div class="article-info">
                                    <strong class="article-title">${fav.article_title}</strong>
                                    <span class="article-meta">
                                        作者：${fav.article_author} | 
                                        收藏时间：${fav.favorite_time} | 
                                        类别：${fav.article_category}
                                    </span>
                                </div>
                                <div class="article-actions">
                                    <button class="btn-view" data-id="${fav.article_id}">查看</button>
                                    <button class="btn-unfavorite" data-id="${fav.article_id}">取消收藏</button>
                                </div>
                            </li>`;
                    });
                    list.html(html);
                } else {
                    showPopup(data.message);
                }
            },
            error: function (err) {
                console.error(err);
                showPopup("收藏加载失败!");
            }
        });
    }
    //拉取收藏文章
    loadFavorites();
    //点击取消收藏按钮
    $(document).on("click", ".btn-unfavorite", function () {
        console.log("取消收藏");
        const articleId = $(this).data("id");
        const username = localStorage.getItem("username");
        $.ajax({
            type: "POST",
            url: "/php/unfavorite.php",
            data: {
                articleId,
                username
            },
            dataType: "json",
            success: function (data) {
                if (data.status === "success") {
                    showPopup(data.message);
                    //刷新收藏列表
                    loadFavorites();
                } else {
                    showPopup(data.message);
                }
            },
            error: function (err) {
                console.error(err);
                showPopup("取消收藏失败!");
            }
        });
    });
})






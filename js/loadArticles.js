$(document).ready(function () {
    let currentPage = 1; // 当前页码
    const limit = 16; // 每页文章数量
    let totalPages = 0; // 总页数
    function loadarticles(page) {
        // 获取分类（从 <body> 标签的 data-category 属性）
        const category = $("body").data("category");
        const role = localStorage.getItem("role");
        const username = localStorage.getItem("username");
        //ajax请求后端数据
        $.ajax({
            type: "Post",
            url: "/php/loadarticles.php",
            data: {
                username: username,
                category: category,
                role: role,
                page: page,
                limit: limit
            },
            dataType: "json",
            success: function (data) {
                //如果返回状态是success就把返回的json存储在articles中
                //再定义一个articleHTML拼接所有的html标签和返回的数据
                if (data.status == "success") {

                    //如果页面是其他(不是主页和管理页)，则在对应的容器里面动态插入元素
                    if (data.locaution == "others") {
                        const articles = data.articles;
                        const mainDiv = $(".main"); // 获取 class 为 main 的 div
                        // 清空 main div 的内容
                        mainDiv.empty();
                        totalPages = data.total_pages; // 获取总页数
                        const groupSize = 4; // 每组文章数量
                        // 分组添加0,4,8为一组，1,5,9为一组
                        for (let i = 0; i < articles.length; i += groupSize) {
                            // 获取当前组的文章，把后端传回的数据浅拷贝到group中
                            //slice(start, end);包含start，不包含end
                            const group = articles.slice(i, i + groupSize);

                            // 判断添加的 ul 类型，第一组的容器class设置为service_list
                            //后面的设置成service_list top
                            const ulClass = i === 0 ? "service_list" : "service_list top";

                            // 动态生成 ul 和 li
                            let ulHTML = `<ul class="${ulClass}">`;
                            //遍历group，使用字符串把后端的数据和html标签拼接到ulHTML中
                            group.forEach(article => {
                                ulHTML += `
                                <li>
                                    <div class="ser_img">
                                        <a href="details.html?articleid=${article.article_id}">
                                            <img src="${article.image_path}" style="width: 247.4px; height: 169.99px; object-fit: cover;" />
                                        </a>
                                    </div>
                                    <a href="details.htm?articleid=${article.article_id}">
                                        <h3>${article.title}</h3>
                                    </a>
                                    <p class="para">${article.content_preview}</p>
                                    <h4>
                                        <a href="#" style="cursor: default;">
                                            ${article.author_name}&nbsp;&nbsp;&nbsp;&nbsp;
                                            ${article.created_at}
                                        </a>
                                    </h4>
                                </li>
                            `;
                            });
                            ulHTML += `</ul>`;

                            // 将生成的 HTML 添加到 main div 的末尾
                            mainDiv.append(ulHTML);
                            // 更新分页信息
                            $(".pagination .page-numbers").text(`第 ${page} 页 / 共 ${totalPages} 页`);
                            currentPage = page;
                            $(".jump-input").val(currentPage); // 更新跳转输入框的值
                        }
                    }
                    //如果当前是首页
                    else if (data.locaution == "index") {
                        //如果是主页的话就把查询出来的最新的帖子分别放到对应的变量中
                        const phonearticles = data.phonearticles;
                        const laptoparticles = data.laptoparticles;
                        const podsarticles = data.podsarticles;
                        //获取对应的容器
                        const newphone = $("#newphone");
                        const newlaptop = $("#newlaptop");
                        const newpods = $("#newpods");
                        //定义存储数据和html标签的变量
                        let phonearticleshtml = ``;
                        let laptoparticleshtml = ``;
                        let podsarticleshtml = ``;
                        //循环遍历后端传来的数据，把他们拼接起来
                        phonearticles.forEach(function (phonearticle) {
                            phonearticleshtml += `
                            <div class="grid1_of_3">
                                <div class="grid1_of_3_img">
                                    <a href="details.html?articleid=${phonearticle.article_id}">
                                        <img src="${phonearticle.image_path}"  style="width: 364.65px; height: 258.28px; object-fit: cover;" />
                                    </a>
                                </div>
                                <h4>
                                    <span>${phonearticle.title}</span>
                                    <a href="?articleid=${phonearticle.article_id}">
                                    ${phonearticle.content_preview}
                                    </a>
                                </h4>
                                <p>
                                    ${phonearticle.author_name}&nbsp;&nbsp;&nbsp;&nbsp;
                                    ${phonearticle.created_at}
                                </p>
                            </div>
                        `;
                        })
                        laptoparticles.forEach(function (laptoparticle) {
                            laptoparticleshtml += `
                            <div class="grid1_of_3">
                                <div class="grid1_of_3_img">
                                    <a href="details.html?articleid=${laptoparticle.article_id}">
                                        <img src="${laptoparticle.image_path}"  style="width: 364.65px; height: 258.28px; object-fit: cover;" />
                                    </a>
                                </div>
                                <h4>
                                    <span>${laptoparticle.title}</span>
                                    <a href="?articleid=${laptoparticle.article_id}">
                                    ${laptoparticle.content_preview}
                                    </a>
                                </h4>
                                <p>
                                    ${laptoparticle.author_name}&nbsp;&nbsp;&nbsp;&nbsp;
                                    ${laptoparticle.created_at}
                                </p>
                            </div>
                        `;
                        })
                        podsarticles.forEach(function (podsarticle) {
                            podsarticleshtml += `
                            <div class="grid1_of_3">
                                <div class="grid1_of_3_img">
                                    <a href="details.html?articleid=${podsarticle.article_id}">
                                        <img src="${podsarticle.image_path}"  style="width: 364.65px; height: 258.28px; object-fit: cover;" />
                                    </a>
                                </div>
                                <h4>
                                    <span>${podsarticle.title}</span>
                                    <a href="?articleid=${podsarticle.article_id}">
                                    ${podsarticle.content_preview}
                                    </a>
                                </h4>
                                <p>
                                    ${podsarticle.author_name}&nbsp;&nbsp;&nbsp;&nbsp;
                                    ${podsarticle.created_at}
                                </p>
                            </div>
                        `;
                        })
                        //把拼接好的html和数据添加到容器内部末尾
                        newphone.append(phonearticleshtml);
                        newlaptop.append(laptoparticleshtml);
                        newpods.append(podsarticleshtml);
                    }

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
    // 初次加载第一页
    loadarticles(currentPage);
    // 分页按钮点击事件
    $(".first-page").click(() => loadarticles(1));//点击第一页
    $(".prev-page").click(() => {//点击上一页
        //如果当前页码大于1就加载上一页
        if (currentPage > 1) loadarticles(currentPage - 1);
    });
    $(".next-page").click(() => {//点击下一页
        //如果当前页码小于总页数就加载下一页
        if (currentPage < totalPages) loadarticles(currentPage + 1);
    });
    $(".last-page").click(() => loadarticles(totalPages));//点击最后一页
    
    // 跳转按钮
    $(".jump-btn").click(() => {
        //获取输入框的值
        //parseInt()函数可解析一个字符串参数，并返回一个整数
        const jumpPage = parseInt($(".jump-input").val());
        //如果输入的值不是数字或者小于1或者大于总页数，就提示错误
        if (isNaN(jumpPage) || jumpPage < 1 || jumpPage > totalPages) {
            showPopup(`请输入 1 到 ${totalPages} 之间的页码`);
        } else {//如果输入的值是数字并且在范围内就加载对应的页码
            loadarticles(jumpPage);
        }
    });
})
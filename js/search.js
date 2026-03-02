$(document).ready(function () {
    // 获取地址栏中的参数
    const queryString = window.location.search;
    // 使用 URLSearchParams 解析参数
    const urlParams = new URLSearchParams(queryString);
    // 获取具体参数值
    const search = urlParams.get("search");
    //当url中的search不为空发起请求
    if(search!=null){
        // 发起ajax请求
        $.ajax({
            type: "Post",
            url: "/php/search.php",
            data: {
                search: search
            },
            success: function (data) {
                console.log(data);
                if (data.status == "success") {
                    const articles = data.articles;
                    // 获取 id 为 searchcontent 的 div
                    const $searchcontent = $("#searchcontent");
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
                                    <a href="details.html?articleid=${article.article_id}">
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

                        // 将生成的 HTML 添加到 searchcontent div 的末尾
                        $searchcontent.append(ulHTML);
                    };
                }
                else{
                    showPopup(data.message);
                }
                    
            },
            error:function(){
                showPopup("搜索请求发起失败!!!");
            }
                
        })
    }
    
})



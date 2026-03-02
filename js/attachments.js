$(document).ready(function () {
    // 获取地址栏中的参数(文章id)
    const queryString = window.location.search;
    // 使用 URLSearchParams 解析参数
    const urlParams = new URLSearchParams(queryString);
    // 获取具体参数值
    const articleid = urlParams.get("articleid");
    // 定义一个变量存储后端传回的数据
    var attachments = [];
    //向后端请求附件信息
    $.ajax({
        type: "Post",
        url: "php/attachments.php",
        data: {
            articleid: articleid
        },
        success: function (data) {
            console.log(data);
            if (data.status === "success") {
                //把后端传回的附件信息存储在attachments中
                attachments = data.attachments;
                //获取附件列表容器
                const attachmentlistul = $(".attachment-list");
                let attachmentlisthtml = ``;
                //拼接html元素
                attachmentlisthtml += `
                    <li class="attachment-item">
						<div class="file-info">
							<i class="iconfont file-icon"></i>
							<div>
								<div class="file-name">${attachments[0].file_name}</div>
								<div class="file-meta">
									<span class="file-size">${attachments[0].file_size}</span>
									<span class="file-type">${attachments[0].file_type}</span>
								</div>
							</div>
						</div>
						<div class="file-actions">
							<button class="btn-preview"><i class="iconfont"></i> 预览</button>
							<button class="btn-download"><i class="iconfont"></i> 下载</button>
						</div>
					</li>
                `;
                //把拼接后的html标签添加到附件容器当中
                attachmentlistul.append(attachmentlisthtml);
            }
            else if (data.status === "null") {
                //获取附件列表容器
                const attachmentlistul = $(".attachment-list");
                attachmentlistul.append(`<li><span>当前文章暂无附件</span></li>`);
            }
            else {
                showPopup("拉取附件失败!!!");
            }
        },
        error: function () {
            showPopup("拉取附件失败!!!");
        }
    })

    // 统一弹层交互
    function showPreview(file) {
        // 设置预览标题
        $('#preview-title').text(file.file_name);
        // 设置文件大小
        $('#preview-size').text((file.file_size / 1024 / 1024).toFixed(1) + 'MB');
        // 设置文件类型
        $('#preview-type').text(file.file_type.toUpperCase() + ' 文件');
        const $content = $('#preview-content');
        $content.empty().addClass('loading');

        // 预览逻辑
        if (file.file_type === 'txt') {
            // 读取 TXT 文件内容
            $.get(file.file_path, function (text) {
                $content.html($('<pre>').text(text));
            }).fail(function () {
                $content.html('<div class="no-preview">无法加载文本内容</div>');
            });
        } 
        else {
            // 不支持的文件类型
            $content.html('<div class="no-preview">该文件类型不支持预览</div>');
        }
        // 显示预览弹窗
        $('#preview-modal').fadeIn(200);
    }


    // 统一文件下载
    function downloadFile(url) {
        const link = $('<a>', {
            href: url,
            download: url.split('/').pop()
        }).css('display', 'none');
        $('body').append(link);
        link[0].click();
        link.remove();
    }
    // 预览按钮点击事件
    $(".attachment-list").on("click", ".btn-preview", function () {
        // console.log(1);
        showPreview(attachments[0]);
    });
    //下载按钮点击事件
    $(".attachment-list").on("click", ".btn-download", function () {
        downloadFile(attachments[0].file_path);
    });

    // 关闭弹层统一处理
    $('.popup').on('click', function (e) {
        if (!$(e.target).closest('.popup-content').length || $(e.target).hasClass('close-btn')) {
            $(this).fadeOut(150);
        }
    });
})
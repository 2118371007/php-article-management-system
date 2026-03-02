$(document).ready(function () {
    // 全局附件信息变量
    var attachmentPath, attachmentName, attachmentSize, attachmentType;
    var isAttachmentUploaded = false; // 标记附件是否已成功上传
    var pendingSubmission = false;    // 标记是否待附件上传完成后自动提交文章

    // 初始化 Plupload
    var uploader = new plupload.Uploader({
        runtimes: 'html5,flash,silverlight,html4', // 支持的运行环境
        browse_button: 'pickfiles',                 // 选择文件的按钮
        container: 'uploader-container',             // 上传组件的容器
        url: '/php/uploadattachments.php',          // 文件上传的服务器地址
        filters: {
            max_file_size: '10mb',                  // 文件大小限制
            mime_types: [
                { title: "Allowed Files", extensions: "txt" } // 允许的文件类型
            ]
        },
        multi_selection: false,                     // 禁止多文件选择
        flash_swf_url: 'js/Moxie.swf',              // Flash 文件路径
        silverlight_xap_url: 'js/Moxie.xap'           // Silverlight 文件路径
    });

    uploader.init(); // 初始化上传组件

    // 文件添加事件
    uploader.bind('FilesAdded', function (up, files) {
        // 如果文件数量超过1个，移除多余文件并提示用户
        if (uploader.files.length > 1) {
            for (var i = 1; i < uploader.files.length; i++) {
                uploader.removeFile(uploader.files[i]);
            }
            showPopup('只能上传一个附件。');
            return;
        }
        // 将添加的文件显示在页面上
        $.each(files, function (i, file) {
            $('#filelist').append(
                '<div id="' + file.id + '">' +
                file.name + ' (' + plupload.formatSize(file.size) + ') ' +
                '<span class="remove-file" data-id="' + file.id + '">×</span>' +
                '</div>'
            );
        });
        // 上传文件
        uploader.start();
    });

    // 上传进度事件
    uploader.bind('UploadProgress', function (up, file) {
        var fileElem = $('#' + file.id);
        var progressElem = fileElem.find('.progress-bar');
        var percentText = fileElem.find('.percent-text');
    
        if (progressElem.length === 0) {
            fileElem.append(`
                <div class="progress">
                    <div class="progress-bar" style="width: ${file.percent}%">
                        <span class="percent-text">${file.percent}%</span>
                    </div>
                </div>
            `);
        } else {
            progressElem.css('width', file.percent + '%');
            percentText.text(file.percent + '%');
        }
    });
    
    

    // 文件上传成功事件
    uploader.bind('FileUploaded', function (up, file, response) {
        console.log('服务器返回的响应:', response.response);
        var data = JSON.parse(response.response);
        if (data.status === 'success') {
            $('#' + file.id).append('<span class="upload-success">✓上传成功</span>');
            attachmentPath = data.data.attachment_path;
            attachmentName = data.data.attachment_name;
            attachmentSize = data.data.attachment_size;
            attachmentType = data.data.attachment_type;
            isAttachmentUploaded = true;
        } else {
            $('#' + file.id).append('<span class="upload-error">上传失败</span>');
        }
        // 如果之前点击了提交且待附件上传完成，则自动提交文章
        if (pendingSubmission) {
            pendingSubmission = false;
            submitArticle();
        }
    });

    // 上传错误事件
    uploader.bind('Error', function (up, err) {
        if (err.code === plupload.FILE_EXTENSION_ERROR) {
            showPopup('文件类型不支持，仅允许上传 txt文件。');
        } else {
            showPopup('文件上传失败: ' + err.message);
        }
    });

    // 移除文件事件
    $(document).on('click', '.remove-file', function () {
        var fileId = $(this).data('id');
        uploader.removeFile(fileId);
        $('#' + fileId).remove();
        // 重置附件相关变量
        attachmentPath = attachmentName = attachmentSize = attachmentType = undefined;
        isAttachmentUploaded = false;
    });

    // 图片预览
    $("#image").change(function () {
        const file = this.files[0];
        const preview = $("#image-preview");
        preview.empty();
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                preview.html(`<img src="${e.target.result}" alt="图片预览">`);
            };
            reader.readAsDataURL(file);
        } else {
            preview.text("图片预览将在这里显示");
        }
        $("#error-image").text("");
    });

    // 提交按钮点击事件：先验证必填项，再判断附件上传情况
    $("#submit-article").click(function () {
        // 清空之前的错误提示
        $("#error-title").text("");
        $("#error-content").text("");
        $("#error-category").text("");
        $("#error-image").text("");

        // 获取必填字段的值
        let title = $("#title").val().trim();
        let content = $("#content").val().trim();
        let category = $("#category").val();
        let imageFiles = $("#image")[0].files;

        // 标记是否全部通过验证
        let valid = true;
        if (!title) {
            $("#error-title").text("标题为必填项");
            valid = false;
        }
        if (!content) {
            $("#error-content").text("内容为必填项");
            valid = false;
        }
        if (!category) {
            $("#error-category").text("分类为必填项");
            valid = false;
        }
        if (imageFiles.length === 0) {
            $("#error-image").text("请上传图片");
            valid = false;
        }
        // 如果必填项未填写，则阻止提交
        if (!valid) {
            return;
        }

        // 如果存在附件且附件未上传完成，则启动附件上传，并等待上传完成后提交文章
        if (uploader.files.length > 0 && !isAttachmentUploaded) {
            pendingSubmission = true;
            uploader.start();
            showPopup("附件上传中，请等待上传完成后再提交文章！");
            return;
        }
        // 否则直接提交文章
        submitArticle();
    });

    // 提交文章的处理函数
    function submitArticle() {
        // 从页面重新获取数据
        let title = $("#title").val();
        let content = $("#content").val();
        let image = $("#image")[0].files[0];  // 获取图片文件对象
        let category = $("#category").val();
        let username = localStorage.getItem('username');  // 根据实际情况获取用户名

        // 构建表单数据
        let formData = new FormData();
        formData.append("title", title);
        formData.append("content", content);
        formData.append("image", image);
        formData.append("category", category);
        formData.append("username", username);

        // 如果附件已上传成功，附加附件信息
        if (isAttachmentUploaded) {
            formData.append("attachmentName", attachmentName);
            formData.append("attachmentSize", attachmentSize);
            formData.append("attachmentType", attachmentType);
            formData.append("attachmentPath", attachmentPath);
        }

        // 重置表单和上传器状态
        $("#title").val("");
        $("#content").val("");
        $("#category").val("");
        $("#image").val("");
        $("#image-preview").text("图片预览将在这里显示");
        $("#filelist").empty();
        uploader.splice(0, uploader.files.length);
        attachmentPath = attachmentName = attachmentSize = attachmentType = undefined;
        isAttachmentUploaded = false;

        // 发送文章提交请求
        $.ajax({
            type: "POST",
            url: "/php/articlesubmit.php",
            processData: false,
            contentType: false,
            data: formData,
            dataType: "json",
            success: function (data) {
                if (data.status == "success") {
                    showPopup(data.message);
                }
            },
            error: function (err) {
                showPopup("请求失败，请稍后重试！");
            }
        });
    }

    // 输入框实时校验（可选）
    $("#title").on("input", function () {
        if ($(this).val().trim()) {
            $("#error-title").text("");
        }
    });
    $("#content").on("input", function () {
        if ($(this).val().trim()) {
            $("#error-content").text("");
        }
    });
    $("#category").on("change", function () {
        if ($(this).val()) {
            $("#error-category").text("");
        }
    });
});

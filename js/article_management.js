$(document).ready(function () {
    // --- (前面的变量定义和函数不变) ---
    const username = window.parent.getCookie('username');
    const role = window.parent.getCookie('role');
    const params = new URLSearchParams(window.location.search);
    const categoryKey = params.get('category') || 'all';
    let currentPage = 1, totalPages = 1;
    const limit = 10;
    const categoryMap = { 'all': '所有文章', 'phone': '手机', 'laptop': '笔记本', 'pods': '耳机', 'favorite': '收藏列表' };
    function getCategoryName(key) { return categoryMap[key] || key; }
    function handleAjaxError(xhr, defaultMessage) { console.error("AJAX Error:", xhr.responseText); const serverMessage = xhr.responseJSON && xhr.responseJSON.message; window.parent.showPopup(`错误: ${serverMessage || defaultMessage}`); }
    function displayArticles(articles) { /* ...内容不变... */
        const $tbody = $('#articles-table-body').empty();
        if (!articles || !articles.length) { $tbody.append(`<tr><td colspan="5" class="text-center">暂无文章数据</td></tr>`); return; }
        articles.forEach(article => {
            const safeArticle = { id: article.article_id || article.id, title: article.title || '', category: article.category, author_name: article.author_name, created_at: article.created_at };
            const catClass = { 'phone': 'primary', 'laptop': 'success', 'pods': 'warning' }[safeArticle.category] || 'info';
            let buttons = (categoryKey === 'favorite') ? `<button class="btn btn-info btn-sm view-article" data-id="${safeArticle.id}"><i class="fas fa-eye"></i> 查看</button> <button class="btn btn-danger btn-sm unfavorite-article" data-id="${safeArticle.id}"><i class="fas fa-heart-broken"></i> 取消收藏</button>` : `<button class="btn btn-info btn-sm view-article" data-id="${safeArticle.id}"><i class="fas fa-eye"></i> 查看</button> <button class="btn btn-warning btn-sm edit-article" data-id="${safeArticle.id}"><i class="fas fa-edit"></i> 编辑</button> <button class="btn btn-danger btn-sm delete-article" data-id="${safeArticle.id}"><i class="fas fa-trash"></i> 删除</button>`;
            $tbody.append(`<tr><td>${safeArticle.title}</td><td><span class="badge badge-${catClass}">${getCategoryName(safeArticle.category)}</span></td><td>${safeArticle.author_name}</td><td>${safeArticle.created_at}</td><td><div class="btn-group">${buttons}</div></td></tr>`);
        });
    }
    function updatePagination() { /* ...内容不变... */ $(".pagination .page-numbers").text(`第 ${currentPage} 页 / 共 ${totalPages} 页`); $(".jump-input").val(currentPage).attr('max', totalPages); }
    function loadArticles(page = 1) { /* ...内容不变... */
        currentPage = page;
        $('#articles-table-body').html('<tr><td colspan="5" class="text-center"><div class="spinner-border text-primary"></div></td></tr>');
        const isFavorite = categoryKey === 'favorite';
        const requestUrl = isFavorite ? "php/loadfavorites.php" : "php/loadarticles.php";
        const requestData = isFavorite ? { username } : { username, role, category: categoryKey };
        $.post(requestUrl, requestData, data => {
            if (data.status === "success") {
                const articles = isFavorite ? (data.favorites || []) : (data.articles || []);
                totalPages = Math.max(1, Math.ceil(articles.length / limit));
                const paginatedArticles = articles.slice((currentPage - 1) * limit, currentPage * limit);
                displayArticles(paginatedArticles);
            } else { $('#articles-table-body').html(`<tr><td colspan="5" class="text-center text-danger">${data.message || '加载失败'}</td></tr>`); totalPages = 1; }
            updatePagination();
        }, "json").fail(xhr => { handleAjaxError(xhr, `加载${getCategoryName(categoryKey)}失败`); totalPages = 1; updatePagination(); });
    }
    function loadArticleForEdit(articleId) { /* ...内容不变... */
        $('#articleModal').modal('show').find('.modal-body').html('<div class="text-center py-5"><div class="spinner-border"></div><p>加载中...</p></div>');
        $.post("php/management.php", { posttype: "edit", articleId: articleId }, data => {
            if (data.status === "success") {
                const article = data.article;
                const imagePreview = article.image_path ? `<img src="${article.image_path}" class="img-fluid" style="max-height:150px;">` : '<p class="text-muted">无图片</p>';
                $('#articleModal .modal-body').html(`<form id="articleEditForm"><input type="hidden" id="edit-article-id" value="${article.id}"><div class="form-group"><label>标题</label><input type="text" class="form-control" id="edit-title" value="${article.title}" required></div><div class="form-group"><label>内容</label><textarea class="form-control" id="edit-content" rows="6" required>${article.content}</textarea></div><div class="form-group"><label>分类</label><select class="form-control" id="edit-category" required><option value="phone" ${article.category === 'phone' ? 'selected' : ''}>手机</option><option value="laptop" ${article.category === 'laptop' ? 'selected' : ''}>笔记本</option><option value="pods" ${article.category === 'pods' ? 'selected' : ''}>耳机</option></select></div><div class="form-group"><label>图片</label><div class="custom-file"><input type="file" class="custom-file-input" id="edit-image" accept="image/*"><label class="custom-file-label">选择文件</label></div><div id="edit-image-preview" class="mt-2">${imagePreview}</div></div></form>`);
            } else { $('#articleModal').modal('hide'); window.parent.showPopup(data.message); }
        }, 'json').fail(xhr => { $('#articleModal').modal('hide'); handleAjaxError(xhr, "加载文章编辑数据失败"); });
    }
    function buildPage() { /* ...内容不变... */
        let title = getCategoryName(categoryKey);
        if (categoryKey !== 'all' && categoryKey !== 'favorite') title += '文章';
        window.parent.updateBreadcrumb(['文章管理', title]);
        $('#main-content').html(`<div class="card"><div class="card-header"><h3 class="card-title">${title}列表</h3></div><div class="card-body"><div class="table-responsive"><table class="table table-bordered table-striped"><thead><tr><th>标题</th><th>分类</th><th>作者</th><th>创建时间</th><th>操作</th></tr></thead><tbody id="articles-table-body"></tbody></table></div><div class="d-flex justify-content-center mt-3"><div class="pagination-container"><div class="pagination"><button class="page-btn first-page btn btn-sm btn-outline-secondary" title="第一页">«</button><button class="page-btn prev-page btn btn-sm btn-outline-secondary mx-1" title="上一页">‹</button><div class="page-numbers mx-2 d-flex align-items-center"></div><button class="page-btn next-page btn btn-sm btn-outline-secondary mx-1" title="下一页">›</button><button class="page-btn last-page btn btn-sm btn-outline-secondary" title="最后一页">»</button><div class="page-jump ml-3 d-flex align-items-center"><span>跳至</span><input type="number" class="jump-input form-control form-control-sm mx-1" min="1" style="width: 60px;"><button class="jump-btn btn btn-sm btn-primary">Go</button></div></div></div></div></div></div>`);
        loadArticles(1);
    }
    buildPage();


    // --- 6. 事件绑定 ---
    const $mainContent = $('#main-content');
    const $document = $(document);
    $mainContent.on('click', '.page-btn, .jump-btn', function () { /* ...内容不变... */ let newPage = currentPage; const $this = $(this); if ($this.hasClass('first-page')) newPage = 1; else if ($this.hasClass('prev-page')) newPage = Math.max(1, currentPage - 1); else if ($this.hasClass('next-page')) newPage = Math.min(totalPages, currentPage + 1); else if ($this.hasClass('last-page')) newPage = totalPages; else if ($this.hasClass('jump-btn')) { const jumpVal = parseInt($(".jump-input").val()); if (!isNaN(jumpVal) && jumpVal >= 1 && jumpVal <= totalPages) newPage = jumpVal; else { window.parent.showPopup(`请输入 1 到 ${totalPages} 之间的页码`); return; } } if (newPage !== currentPage || $this.hasClass('jump-btn')) loadArticles(newPage); });
    $mainContent.on('keypress', '.jump-input', function (e) { if (e.which === 13) $mainContent.find(".jump-btn").click(); });
    $mainContent.on('click', '.view-article', function () { /* ...内容不变... */ window.open(`details.html?articleid=${$(this).data('id')}`, '_blank'); });
    $mainContent.on('click', '.unfavorite-article', function () { /* ...内容不变... */ $.post('php/unfavorite.php', { username, articleId: $(this).data('id') }, data => { window.parent.showPopup(data.message); if (data.status === 'success') loadArticles(1); }, 'json').fail(xhr => handleAjaxError(xhr, "取消收藏失败")); });
    $mainContent.on('click', '.edit-article', function () { /* ...内容不变... */ loadArticleForEdit($(this).data('id')); });
    $document.on('click', '#save-article', function () { /* ...内容不变... */ const formData = new FormData(); formData.append('posttype', 'editconfirm'); formData.append('articleId', $('#edit-article-id').val()); formData.append('title', $('#edit-title').val()); formData.append('content', $('#edit-content').val()); formData.append('category', $('#edit-category').val()); const imageFile = $('#edit-image')[0].files[0]; if (imageFile) formData.append('image', imageFile); const $btn = $(this).html('<i class="fas fa-spinner fa-spin"></i> 保存中...').prop('disabled', true); $.ajax({ type: "POST", url: "php/management.php", data: formData, processData: false, contentType: false, dataType: "json", success: data => { if (data.status === "success") { $('#articleModal').modal('hide'); loadArticles(currentPage); } window.parent.showPopup(data.message); }, error: xhr => handleAjaxError(xhr, "保存文章失败"), complete: () => $btn.html('保存').prop('disabled', false) }); });
    $document.on('change', '#edit-image', function () { /* ...内容不变... */ const file = this.files[0]; if (file) { const reader = new FileReader(); reader.onload = e => $('#edit-image-preview').html(`<img src="${e.target.result}" class="img-fluid" style="max-height:150px;">`); reader.readAsDataURL(file); $(this).next('.custom-file-label').html(file.name); } });

    /**
     * ✅ 已修正: “删除”按钮事件
     */
    $mainContent.on('click', '.delete-article', function () {
        if (confirm('确定要删除这篇文章吗？此操作不可恢复！')) {
            $.post('php/management.php', { posttype: 'delete', articleId: $(this).data('id') }, data => {
                // 首先显示服务器返回的消息
                window.parent.showPopup(data.message);

                // ✅ 关键修复点: 只有在服务器返回 status 为 'success' 时，才调用刷新函数
                if (data.status === 'success') {
                    // 重新加载当前页的文章列表
                    loadArticles(currentPage);
                }
            }, 'json').fail(xhr => handleAjaxError(xhr, "删除文章失败"));
        }
    });
});
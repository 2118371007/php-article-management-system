$(document).ready(function () {
    const role = window.parent.getCookie('role');
    const categoryMap = { 'phone': '手机', 'laptop': '笔记本', 'pods': '耳机' };
    function getCategoryName(key) { return categoryMap[key] || key; }
    function handleAjaxError(xhr, msg) { window.parent.showPopup(`错误: ${(xhr.responseJSON && xhr.responseJSON.message) || msg}`); }

    function displayAllCategoriesStats($tbody, data) {
        const allDisplayCategories = ['phone', 'laptop', 'pods'];
        const statsMap = (data || []).reduce((map, cat) => (map[cat.category] = cat, map), {});
        allDisplayCategories.forEach(key => {
            const item = statsMap[key] || { count: 0, percentage: 0 };
            $tbody.append(`<tr><td>${getCategoryName(key)}</td><td>${item.count}</td><td><div class="progress progress-xs"><div class="progress-bar bg-primary" style="width: ${item.percentage}%"></div></div><span class="badge bg-primary">${item.percentage}%</span></td></tr>`);
        });
    }

    function loadStats() {
        if (role === 'admin') {
            $.post('php/admin_stats.php', { action: 'basic_stats' }, data => {
                if (data.status === 'success') {
                    $('#total-users').text(data.data.total_users);
                    $('#total-articles').text(data.data.total_articles);
                }
            }, 'json').fail(xhr => handleAjaxError(xhr, "加载基础统计失败"));
        }
        $.post('php/admin_stats.php', { action: 'category_stats' }, data => displayAllCategoriesStats($('#category-stats').empty(), data.data), 'json')
            .fail(xhr => {
                handleAjaxError(xhr, "加载分类统计失败");
                displayAllCategoriesStats($('#category-stats').empty(), []);
            });
    }

    function loadUserDetails() {
        const $tbody = $('#user-details-table').html(`<tr><td colspan="6" class="text-center"><div class="spinner-border text-primary"></div></td></tr>`);
        $.post('php/admin_stats.php', { action: 'user_details' }, data => {
            $tbody.empty();
            if (data.status === 'success' && data.data.length) {
                data.data.forEach(user => {
                    const roleBadge = user.role === 'admin' ? 'badge-danger' : 'badge-info';
                    $tbody.append(`<tr><td>${user.username}</td><td>${user.phone_count}</td><td>${user.laptop_count}</td><td>${user.pods_count}</td><td>${user.total_articles}</td><td><span class="badge ${roleBadge}">${user.role}</span></td></tr>`);
                });
            } else { $tbody.append(`<tr><td colspan="6" class="text-center">暂无用户数据</td></tr>`); }
        }, 'json').fail(xhr => handleAjaxError(xhr, "加载用户详情失败"));
    }

    // --- 构造页面 ---
    let html = '';
    if (role === 'admin') {
        html += `<div class="row"><div class="col-lg-3 col-6"><div class="small-box bg-info"><div class="inner"><h3 id="total-users">0</h3><p>注册用户</p></div><div class="icon"><i class="fas fa-users"></i></div><a href="#" class="small-box-footer" data-toggle="modal" data-target="#userDetailsModal">查看详情 <i class="fas fa-arrow-circle-right"></i></a></div></div><div class="col-lg-3 col-6"><div class="small-box bg-success"><div class="inner"><h3 id="total-articles">0</h3><p>发布文章</p></div><div class="icon"><i class="fas fa-file-alt"></i></div><a href="#" class="small-box-footer" data-toggle="modal" data-target="#userDetailsModal">查看详情 <i class="fas fa-arrow-circle-right"></i></a></div></div></div>`;
    }
    const cardTitle = role === 'admin' ? '文章分类统计' : '我的文章分类统计';
    html += `<div class="row"><div class="col-12"><div class="card"><div class="card-header"><h3 class="card-title">${cardTitle}</h3></div><div class="card-body"><table class="table table-bordered"><thead><tr><th>分类</th><th>文章数量</th><th>占比</th></tr></thead><tbody id="category-stats"></tbody></table></div></div></div></div>`;
    $('#dashboard-content').html(html);

    // --- 初始化调用 ---
    window.parent.updateBreadcrumb('控制面板');
    loadStats();
    $('#userDetailsModal').on('show.bs.modal', loadUserDetails);
});
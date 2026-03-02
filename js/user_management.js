$(document).ready(function () {
    // --- 1. 依赖与全局变量 ---
    const currentAdminUser = window.parent.getCookie('username');

    // --- 2. 辅助函数 ---
    function handleAjaxError(xhr, defaultMessage) {
        console.error("AJAX 请求发生错误:", xhr.responseText);
        const serverMessage = xhr.responseJSON && xhr.responseJSON.message;
        window.parent.showPopup(`错误: ${serverMessage || defaultMessage}`);
    }

    // --- 3. 核心功能函数 ---
    function loadUserDetails() {
        // 在函数开始时打印日志
        console.log("3. loadUserDetails 函数已开始执行。正在向服务器请求新数据...");

        const $tbody = $('#user-details-table').html(`<tr><td colspan="7" class="text-center"><div class="spinner-border text-primary"></div></td></tr>`);
        $.post('php/admin_stats.php', { action: 'user_details' }, data => {
            console.log("4. 成功获取到用户列表新数据，准备渲染表格。");
            $tbody.empty();
            if (data.status === 'success' && data.data.length > 0) {
                data.data.forEach(user => {
                    const roleBadge = user.role === 'admin' ? 'badge-danger' : 'badge-info';
                    let actionsHtml = `<button class="btn btn-warning btn-sm change-password-btn" data-username="${user.username}"><i class="fas fa-key"></i> 修改密码</button> `;
                    if (user.username !== currentAdminUser || user.role !== 'admin') {
                        actionsHtml += `<button class="btn btn-info btn-sm change-role-btn" data-username="${user.username}" data-role="${user.role}"><i class="fas fa-user-cog"></i> ${user.role === 'admin' ? '降级' : '升级'}</button>`;
                    }
                    $tbody.append(`<tr><td>${user.username}</td><td>${user.phone_count}</td><td>${user.laptop_count}</td><td>${user.pods_count}</td><td>${user.total_articles}</td><td><span class="badge ${roleBadge}">${user.role === 'admin' ? '管理员' : '普通用户'}</span></td><td><div class="btn-group">${actionsHtml}</div></td></tr>`);
                });
            } else { $tbody.append(`<tr><td colspan="7" class="text-center">暂无用户数据</td></tr>`); }
            console.log("5. 表格渲染完成。");
        }, 'json').fail(xhr => handleAjaxError(xhr, "加载用户详情失败"));
    }

    // (showChangePasswordModal 函数不变)
    function showChangePasswordModal(targetUsername) {
        $('#changePasswordModal').remove();
        $('body').append(`<div class="modal fade" id="changePasswordModal" tabindex="-1"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><h5 class="modal-title">修改用户 ${targetUsername} 的密码</h5><button type="button" class="close" data-dismiss="modal">&times;</button></div><div class="modal-body"><div class="form-group"><label>新密码</label><input type="password" class="form-control" id="new-password-input" required></div><div class="form-group"><label>确认新密码</label><input type="password" class="form-control" id="confirm-password-input" required></div></div><div class="modal-footer"><button type="button" class="btn btn-secondary" data-dismiss="modal">取消</button><button type="button" class="btn btn-primary" id="confirm-change-password">确定</button></div></div></div></div>`);
        $('#changePasswordModal').modal('show');
    }

    function changeUserRole(targetUsername, currentTargetRole) {
        const newRole = currentTargetRole === 'admin' ? 'user' : 'admin';
        if (targetUsername === currentAdminUser && newRole === 'user') {
            if (!confirm("您确定要将自己的账户降级为普通用户吗？")) return;
        }

        $.post('php/user_management.php', { action: 'change_role', username: targetUsername, new_role: newRole }, data => {
            // 第一个日志探针
            console.log("1. 成功接收到后端响应。响应内容:", data);

            window.parent.showPopup(data.message);

            if (data.status === 'success') {
                // 第二个日志探针
                console.log("2. status为'success'，条件满足，准备调用刷新函数 loadUserDetails()。");
                loadUserDetails(); // 重新加载用户列表
            }
        }, 'json').fail(xhr => handleAjaxError(xhr, '角色修改请求失败'));
    }

    // (页面构建部分不变)
    window.parent.updateBreadcrumb(['用户管理']);
    $('#main-content').html(`<div class="card"><div class="card-header"><h3 class="card-title">用户列表</h3></div><div class="card-body"><div class="table-responsive"><table class="table table-bordered table-striped"><thead><tr><th>用户名</th><th>手机文</th><th>笔记本文</th><th>耳机文</th><th>总文章</th><th>角色</th><th>操作</th></tr></thead><tbody id="user-details-table"></tbody></table></div></div></div>`);
    loadUserDetails();

    // (事件绑定部分不变)
    const $mainContent = $('#main-content');
    const $document = $(document);
    $mainContent.on('click', '.change-role-btn', function () { changeUserRole($(this).data('username'), $(this).data('role')); });
    $mainContent.on('click', '.change-password-btn', function () { showChangePasswordModal($(this).data('username')); });
    $document.on('click', '#confirm-change-password', function () {
        const targetUsername = $('#changePasswordModal .modal-title').text().replace('修改用户 ', '').replace(' 的密码', '');
        const newPassword = $('#new-password-input').val();
        if (!newPassword || newPassword !== $('#confirm-password-input').val()) { window.parent.showPopup('密码不能为空或两次输入不一致'); return; }
        $.post('php/change_password.php', { username: targetUsername, new_password: newPassword }, data => {
            window.parent.showPopup(data.message);
            if (data.status === 'success') $('#changePasswordModal').modal('hide');
        }, 'json').fail(xhr => handleAjaxError(xhr, '密码修改请求失败'));
    });
});
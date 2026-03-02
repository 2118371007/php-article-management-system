$(document).ready(function () {
    // --- 初始化 ---
    window.parent.updateBreadcrumb(['系统设置', '个性化与主题']);
    // 读取并设置当前选项
    $('#theme-mode').val(localStorage.getItem('theme-mode') || '');
    $('#theme-color').val(localStorage.getItem('theme-color') || 'navbar-white');
    $('#sidebar-color').val(localStorage.getItem('sidebar-color') || 'sidebar-dark-primary');

    // --- 事件绑定 ---
    $('#save-theme-settings').on('click', function () {
        localStorage.setItem('theme-mode', $('#theme-mode').val());
        localStorage.setItem('theme-color', $('#theme-color').val());
        localStorage.setItem('sidebar-color', $('#sidebar-color').val());
        // 调用父页面的函数来应用主题
        window.parent.applyThemeSettings();
        window.parent.showPopup('主题设置已保存并应用');
    });
});
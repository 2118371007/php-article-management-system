$(document).ready(function () {
  // --- 1. 初始化检查 ---
  if (typeof window.getCookie !== 'function') {
    console.error('关键函数 getCookie 未定义，请确保 js.js 在 admin.js 之前加载。');
    return;
  }
  const role = window.getCookie('role');
  const username = window.getCookie('username');

  // 验证用户是否真的已登录。
  if (!username || username === 'null' || username === 'undefined') {
    window.showPopup('请先登录！');
    setTimeout(() => window.location.href = 'login.html', 1500);
    return; // 停止执行后续代码
  }

  // --- 2. 暴露给子页面的全局函数 ---

  /**
   * (全局) 动态更新页面主内容区的面包屑导航。
   * @param {string|string[]} pages - 一个包含各层级页面名称的数组，或单个页面名称。
   */
  window.updateBreadcrumb = function (pages) {
    // 始终以“首页”作为面包屑的起点。
    let html = '<li class="breadcrumb-item"><a href="admin.html">首页</a></li>';
    const pageArray = Array.isArray(pages) ? pages : [pages];

    pageArray.forEach((page, index) => {
      // 判断是否为最后一项（即当前页面）。
      const isLast = index === pageArray.length - 1;
      html += `<li class="${isLast ? 'breadcrumb-item active' : 'breadcrumb-item'}">${page}</li>`;
    });

    // 更新内容区域的大标题和面包屑。
    const currentPageTitle = pageArray[pageArray.length - 1];
    $('.content-header h1').text(currentPageTitle);
    $('.breadcrumb').html(html);
  }

  /**
   * (全局) 应用保存在 localStorage 中的主题设置。
   */
  window.applyThemeSettings = function () {
    const mode = localStorage.getItem('theme-mode') || '';
    const color = localStorage.getItem('theme-color') || 'navbar-white';
    const sidebar = localStorage.getItem('sidebar-color') || 'sidebar-dark-primary';

    $('body').removeClass('dark-mode light-mode').addClass(mode);
    const $header = $('.main-header');
    // 移除所有 navbar-* 相关的类，再添加新的。
    $header.removeClass((idx, css) => (css.match(/(^|\s)navbar-\S+/g) || []).join(' ')).addClass(color);
    $header.toggleClass('navbar-dark', mode === 'dark-mode').toggleClass('navbar-light', mode !== 'dark-mode');
    // 移除所有 sidebar-* 相关的类，再添加新的。
    $('.main-sidebar').removeClass((idx, css) => (css.match(/(^|\s)sidebar-\S+/g) || []).join(' ')).addClass(sidebar);
  }

  // --- 3. UI 初始化与事件 ---

  /**
   * 初始化页面顶部和侧边栏的用户信息展示。
   */
  function initUserDropdown() {
    // 将用户名设置到页面上所有需要显示的地方。
    $('#username, #username-full, #sidebar-username').text(username);
    const $roleBadge = $('#user-role-badge');
    
  }

  /**
   * 为侧边栏导航链接绑定点击事件，处理高亮状态。
   */
  $('.nav-sidebar').on('click', '.nav-link', function () {
    const $link = $(this);
    // 如果是可展开的父菜单项本身，不执行任何操作，让其自然展开/折叠。
    if ($link.parent().hasClass('has-treeview') && $link.attr('href') === '#') {
      return;
    }

    // 更新导航链接的 active 状态，实现高亮效果。
    $('.nav-sidebar .nav-link').removeClass('active');
    $link.addClass('active');
    // 如果点击的是子菜单项，也高亮其父菜单。
    if ($link.closest('.nav-treeview').length > 0) {
      $link.parents('.has-treeview').children('.nav-link').first().addClass('active');
    }
  });

  /**
   * “退出登录”按钮的点击事件。
   */
  $('#admin-logout').on('click', function (e) {
    e.preventDefault();
    $.post("php/logout.php", {}, data => {
      if (data.status === "success") {
        // 遍历并清除所有与本站相关的 cookie。
        document.cookie.split(";").forEach(c => { document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); });
        window.showPopup(data.message || '退出成功！');
        // 1.5秒后重定向到登录页
        setTimeout(() => window.location.href = "login.html", 1500);
      } else {
        window.showPopup(data.message || '退出失败');
      }
    }, "json").fail(xhr => window.showPopup(`退出请求失败: ${xhr.statusText}`));
  });

  /**
   *  根据用户权限列表，动态显示或隐藏菜单项
   */
  function applyPermissions(permissionsArray) {
    // 如果权限列表为空，隐藏所有受控菜单
    if (!permissionsArray || permissionsArray.length === 0) {
      $('.nav-sidebar .nav-item[data-permission]').hide();
      return;
    }

    // 遍历所有带 data-permission 属性的菜单项
    $('.nav-sidebar .nav-item[data-permission]').each(function () {
      const requiredPermission = $(this).data('permission');
      const hasPermission = permissionsArray.includes(requiredPermission);

      if (hasPermission) {
        $(this).show();
      } else {
        $(this).hide();
      }
    });

    // 检查并隐藏没有任何子链接的父菜单
    $('.nav-sidebar .nav-item.has-treeview').each(function () {
      if ($(this).find('.nav-treeview .nav-link').length === 0) {
        $(this).hide();
      }
    });
  }

  // 获取权限并应用到菜单
  /**
     *  使用 AJAX 方式获取权限并应用
     */
  function loadAndApplyPermissions() {
    $.ajax({
      // 请求的URL地址
      url: 'php/login.php',

      // 请求方法
      method: 'POST',
      data: {
        posttype: 'get_permissions'
      },

      // 预期从服务器返回的数据类型。设为'json'后，jQuery会自动将返回的JSON字符串解析成JavaScript对象
      dataType: 'json',

      // 请求成功后执行的回调函数
      success: function (data) {
        console.log('获取权限响应:', data);
        if (data.status === 'success') {
          console.log('获取权限成功:', data.permissions);
          // 调用 applyPermissions 函数，并传入从API获取的权限数组
          applyPermissions(data.permissions);
        } else {
          // 如果未授权或出错，也调用一次以隐藏所有菜单
          applyPermissions([]);
          console.warn('获取权限失败:', data.message || '未知错误');
          // 可以在这里添加跳转到登录页的逻辑
          // window.location.href = 'login.html';
        }
      },

      // 请求失败后执行的回调函数（例如网络中断、服务器500错误等）
      error: function (xhr, status, error) {
        console.error('获取权限失败:', status, error);
        // 发生网络错误时，也隐藏所有菜单以策安全
        applyPermissions([]);
      }
    });
  }
  // --- 4. 脚本执行入口 ---
  function initAdmin() {
    initUserDropdown();     // 1. 初始化用户信息显示
    window.applyThemeSettings(); // 2. 应用已保存的主题
    loadAndApplyPermissions(); // 3. 加载并应用权限
    window.showPopup(`欢迎回来，${username}！`);
  }

  initAdmin();
});
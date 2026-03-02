# 文章管理系统 (Article Management System - AMS)

基于 **PHP + MySQL + AJAX** 开发的轻量级、响应式文章管理平台。该系统采用前后端分离的开发思路，通过 AJAX 实现无刷新交互

## 🚀 项目亮点

* **前后端解耦**：前端使用纯 HTML+jQuery，后端提供 PHP 接口，通过 AJAX 进行数据通信。
* **动态主题**：支持用户自定义页面主题样式。

---

## 🛠 技术栈

| 维度 | 技术/工具 |
| :--- | :--- |
| **后端** | PHP 7.0+ (原生开发) |
| **前端** | HTML5, CSS3, JavaScript (jQuery) |
| **交互** | AJAX (异步 JSON 数据交换) |
| **数据库** | MySQL 5.7+ |
| **环境** | Apache/Nginx, Navicat, VSCode |

---

## 📋 核心功能

### 1. 文章管理 (Article Management)
* **多媒体发布**：支持富文本内容、文章配图及附件（.txt 等）同步上传。
* **内容检索**：支持关键词搜索、分类查看（Laptop/Phone/Pods 等）。
* **互动体验**：集成评论系统、收藏/取消收藏功能。

### 2. 用户与权限 (User & Auth)
* **身份认证**：安全登录/退出机制。
* **管理面板**：管理员专属 Dashboard，支持用户数据、文章数据的统计与增删改查。
* **个人中心**：用户可管理自己的收藏列表及文章。

---


## ⚙️ 运行指南

### 1. 环境准备
* **推荐方案**：使用 phpstudy小皮面板 集成环境。

### 2. 数据库配置
1.  打开数据库管理工具（如 Navicat 或 phpMyAdmin），新建数据库 `ams`。
2.  导入项目目录下的 `/sql/ams.sql` 文件，完成表结构与基础数据初始化。
3.  配置数据库连接：
    打开 `/php/database.php` 文件，将以下参数修改为你的本地信息：
    ```php
    $db_host = "localhost";
    $db_user = "root";     // 数据库用户名
    $db_pass = "password"; // 数据库密码
    $db_name = "ams";
    ```

### 3. 目录权限设置
* 由于系统涉及附件与配图上传，请确保以下目录具有写入权限：
    * `/attachments/`
    * `/subimg/`

### 4. 访问方式
* 将整个项目文件夹放置到 Web 根目录（如 XAMPP 的 `htdocs` 目录）。
* 打开浏览器，访问：`http://localhost/你的项目目录名/index.html`。

---

## 📝 开发备注
* **开发环境**：本项目在 HBuilderX 和 VSCode 下调试通过。

## 📂 目录结构说明

```text
AMS/
├── admin.html             # 管理员主页
├── index.html             # 系统首页
├── login.html             # 登录页面
├── details.html           # 文章详情页
├── dashboard.html         # 数据看板
├── article_management.html # 文章列表管理
├── user_management.html    # 用户账户管理
├── theme_settings.html     # 主题设置页
├── search.html             # 搜索结果页
├── php/                   # 后端逻辑文件夹
│   ├── database.php       # 数据库连接配置文件
│   ├── login.php          # 登录逻辑
│   └── ...                # 其他功能接口
├── js/                    # 前端交互逻辑
│   ├── login.js           # 登录表单处理
│   └── ...                # 业务逻辑 JS
├── css/                   # 样式表
├── attachments/           # 用户上传的附件存放目录
├── subimg/                # 用户上传的文章配图存放目录
└──  sql/                   # 数据库脚本

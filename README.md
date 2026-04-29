# 专注学习浏览器 (Learning Browser)

一款基于 [Electron](https://www.electronjs.org/) + [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) 构建的跨平台轻量级专注学习浏览器。它不仅提供了完整的网页浏览体验，还内置了番茄钟、过滤名单、待办事项、笔记等多种提升学习效率的核心工具。

## ✨ 核心特性

- 🚀 **基础浏览器功能**：支持多标签页、前进/后退、页面刷新、快捷键、历史记录。
- 🍅 **番茄钟专注模式 (Pomodoro Timer)**：内置可自定义时长的专注倒计时与休息提示。
- 🛡️ **智能过滤模式 (Filter Mode)**：提供白名单 / 黑名单两种模式。在专注时段内，自动拦截所有不相关网站，助你远离干扰。
- 📝 **多功能侧边栏**：
  - **待办清单 (To-Dos)**：随时规划每日学习任务并打钩。
  - **笔记 (Notes)**：一边阅读一边随手记录。
  - **书签 (Bookmarks)**：收藏学习资料和高频网页。
  - **历史记录 (History)**：自动追踪浏览历史，方便找回。
- 🎨 **深色模式支持 (Dark Mode)**：提供系统级和页面级深色主题反转护眼。
- 🔍 **页面缩放功能**：支持 `Ctrl + / -` 以及 `Ctrl 0` 快速调整网页缩放比例。
- ⚡ **极致轻量**：通过 Vite 工具链与精准的依赖剥离机制，安装包精简至极致 (~85MB)。

## 🛠️ 技术栈

- 框架: **Electron**, **React 19**
- 语言: **TypeScript**
- 构建与打包: **Vite**, **Electron-Vite**, **Electron-Builder**
- 图标库: **Lucide React**

## 📦 安装指南

本项目目前需要通过源码自行构建安装包。请确保你的电脑上已经安装了 [Node.js](https://nodejs.org/) 和 [pnpm](https://pnpm.io/)。

### 1. 下载并安装依赖

在项目根目录下运行以下命令安装所需的构建依赖：

```bash
$ pnpm install
```

### 2. 构建安装包

运行对应的命令，将生成适合你操作系统的安装程序：

```bash
# Windows
$ pnpm build:win

# macOS
$ pnpm build:mac

# Linux (AppImage / snap / deb)
$ pnpm build:linux
```

### 3. 安装应用

打包完成后，打开项目中的 `dist/` 目录：
- **Windows**: 双击运行 `.exe` 安装程序进行安装。
- **macOS**: 打开生成的 `.dmg` 文件，将应用拖入“应用程序”文件夹。
- **Linux**: 直接运行 `.AppImage` 文件，或者安装 `.deb` / `.snap` 包。

# 专注学习浏览器 (Learning Browser)

一款基于 [Electron](https://www.electronjs.org/) + [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) 构建的跨平台轻量级专注学习浏览器。它不仅提供了完整的网页浏览体验，还内置了番茄钟、过滤名单、待办事项、笔记等多种提升学习效率的核心工具。

> **Note**: 本项目完全由 **Vibe Coding** (AI 驱动开发) 模式完成。从功能构思、架构设计、前端实现到自动化构建流程，均由开发者与 AI 协作达成。

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

### 方式一：直接下载 (推荐)

你可以直接前往 [GitHub Releases](https://github.com/Shad0L/learning-browser/releases) 页面，下载对应操作系统的最新安装包：

- **Windows**: 下载 `.exe` 文件并运行。
- **Linux**: 下载 `.AppImage` 直接运行。如果你使用 Arch Linux，也可以下载 `.tar.gz` 源码包自行解压或者通过编写 `PKGBUILD` / `AUR` 进行安装。
- **macOS**: 下载 `.dmg` 文件并安装。

> **⚠️ macOS 用户注意**: 由于本应用未经过 Apple 开发者认证，安装后运行可能会提示 “已损坏无法打开” 或 “无法验证开发者”。
> **修复方法**:
>
> 1. 打开终端 (Terminal)。
> 2. 输入以下命令并回车（请确保应用已移动到 “应用程序” 文件夹）：
>    ```bash
>    sudo xattr -rd com.apple.quarantine /Applications/learning-browser.app
>    ```
> 3. 再次尝试打开即可。

### 方式二：通过源码自行构建

如果你需要自行修改代码或构建，请确保已安装 [Node.js](https://nodejs.org/) 和 [pnpm](https://pnpm.io/)。

1. **安装依赖**:

   ```bash
   $ pnpm install
   ```

2. **构建安装包**:

   ```bash
   # Windows
   $ pnpm build:win
   # Linux
   $ pnpm build:linux
   # macOS
   $ pnpm build:mac
   ```

3. **找到安装程序**:
   构建完成后，在 `dist/` 目录下即可找到对应的安装文件。

# OJ Modern Student

北航 Accoding 学生端浏览器扩展，基于 [OJ Modern](https://github.com/y38501148-max/accoding-modern) 开发。

当前版本：**0.1.0** · Manifest V3 · 桌面 Edge / Chrome。

## 功能

界面美化覆盖导航、题面、列表和表单，支持题库页面和比赛页面。

题面顶部可以复制 Markdown，公式保留为 LaTeX，图片、表格和代码块也会一起复制。输入、输出样例各有复制按钮，保留原有空格和换行。

提交弹窗提供更大的代码编辑区，可以调整字号、查看行数和字符数、复制代码。Tab 插入四个空格，Shift+Tab 取消缩进；先按 Esc，再按 Tab 可移出编辑器。

点击扩展图标可分别开关这三项功能，修改后刷新 OJ 页面生效。目前支持 <https://accoding.buaa.edu.cn/>，VPN 入口待适配。

## 安装

### Edge

Edge Add-ons 商店版待上架，暂按下面的方式安装，将地址改为 `edge://extensions` 即可。上架材料见 [Edge 商店发布](docs/EDGE-STORE.md)。


### Chrome：从 GitHub 安装

1. 在 [Releases](https://github.com/y38501148-max/oj-modern-student/releases/latest) 下载 `oj-modern-student-github-版本号.zip`。
2. 将 ZIP 解压到长期保留的目录，例如 `Documents/oj-modern-student`；之后不要删除或移动它。
3. 打开 `chrome://extensions`，开启右上角的**开发者模式**。
4. 点击**加载已解压的扩展程序**，选择包含 `manifest.json` 的解压目录。
5. 打开或刷新 <https://accoding.buaa.edu.cn/>。

也可克隆仓库，直接加载其中的 `extension/` 文件夹，无需构建。

## 更新

有新版时，OJ 页面会出现提示，扩展图标上显示 `NEW`。点击“稍后”可收起该版本的页面提醒，扩展面板中仍能查看更新。

Chrome 手动安装版需要下载新 ZIP，用新文件替换原目录，再到 `chrome://extensions` 点击“重新加载”。保留原目录路径，以便沿用扩展设置。刷新 OJ 前先保存正在编辑的代码。

Edge 商店版由浏览器自动更新。GitHub 发布可能早于商店上架，页面提示会注明这一点。

扩展每 6 小时检查一次 GitHub 版本，也可在面板中点击“检查更新”。

## 隐私与权限

页面内容在本地处理，设置保存在浏览器中。版本检查访问本仓库的公开版本文件。权限用途和数据处理说明见 [隐私政策](docs/PRIVACY.md)。

## 开发与发布

需要 Node.js 22+；打包还需要系统 `zip` 命令。

```sh
npm ci
npm run check
npm run package
```

- `src/`：功能源码、样式、后台和弹出面板。
- `extension/`：可直接加载的 GitHub 版，由 `npm run build` 生成。
- `dist/oj-modern-student-github-版本.zip`：GitHub 手动安装包。
- `dist/oj-modern-student-edge-版本.zip`：Edge 商店提交包，manifest 位于 ZIP 根目录。
- `package.json` 是版本源；构建同步 `manifest.json` 和 `version.json`。

发布时修改版本和 `CHANGELOG.md`，运行检查、构建、提交并推送，然后推送对应的 `v版本号` Git 标签。GitHub Actions 会验证、构建并附加两份 ZIP 到 Release。Edge 包仍须通过 Partner Center 提交并完成审核。

验证范围见 [验证记录](docs/VALIDATION.md)。

## 来源

界面配色与 Bootstrap / Angular 适配基于 OJ Modern，采用 [MIT 许可](LICENSE)。

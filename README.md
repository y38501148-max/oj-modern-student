# OJ Modern Student

北航 Accoding 学生端浏览器扩展。

该插件由个人开发，与北航程序设计课程组无关。

当前版本：**0.2.9** · Manifest V3 · 桌面 Edge / Chrome。

## 功能

首页重新整理了课程、题库、比赛入口，以及待写题解、推荐题目和赛季冠军。课程页支持搜索、分组展开及进行中／以往课程切换。比赛页的全站导航位于顶部，提供比赛导航、计时区和右侧提交记录，分数按百分制显示。普通题目右侧展示本题个人提交记录。

赛事列表采用白底表格，优先展示比赛标题，课程与时间分层显示。长名称悬停可查看全文。分页使用蓝色当前页、白底按钮和灰色禁用态。

题面公式使用 TeX 字形和 SVG 渲染，字号与正文保持一致。题面中的代码块和文本框均提供“复制”按钮，按钮位于框外，复制时保留原有空格和换行。

提交弹窗提供更大的代码编辑区，可以调整字号、查看行数和字符数、复制代码。Tab 插入四个空格，Shift+Tab 取消缩进；先按 Esc，再按 Tab 可移出编辑器。

普通题目提交后留在题面，右侧提交记录自动显示 Waiting、Judging 和最终结果，同时更新分数、时间与内存。

鼠标悬停或点击右侧分数，可查看数据点数量，以及每个数据点的结果、得分、耗时和内存。普通题目与比赛页面均支持。

查看代码页显示提交信息、语法高亮和行号，支持调整字号与复制纯源码。

点击“检查更新”或扩展图标可查看版本。目前支持 <https://accoding.buaa.edu.cn/>，VPN 入口待适配。

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

使用 Vue 3、TypeScript、Ant Design Vue 4 和 Vite，组件与样式随扩展打包。

需要 Node.js 22.12+；打包还需要系统 `zip` 命令。

```sh
npm ci
npm run check
npm run package
```

- `src/ui/`：Vue 组件、主题和页面样式。
- `src/enhance.js`：样例复制、提交编辑与原站适配。
- `src/background.js`：版本检查和本地设置。
- `extension/`：可直接加载的 GitHub 版，由 `npm run build` 生成。
- `dist/oj-modern-student-github-版本.zip`：GitHub 手动安装包。
- `dist/oj-modern-student-edge-版本.zip`：Edge 商店提交包，manifest 位于 ZIP 根目录。
- `package.json` 是版本源；构建同步 `manifest.json` 和 `version.json`。

发布时修改版本和 `CHANGELOG.md`，运行检查、构建、提交并推送，然后推送对应的 `v版本号` Git 标签。GitHub Actions 会验证、构建并附加两份 ZIP 到 Release。Edge 包仍须通过 Partner Center 提交并完成审核。

验证范围见 [验证记录](docs/VALIDATION.md)。

## 许可

扩展采用 [MIT 许可](LICENSE)。

公式渲染使用随扩展打包的 MathJax 2.7.7，采用 [Apache-2.0 许可](vendor/mathjax2/LICENSE)。

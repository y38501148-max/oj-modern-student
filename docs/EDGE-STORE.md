# Edge Add-ons 上架材料

状态（2026-10-23）：0.2.9 已提交审核，Partner Center 显示 **In review**，提示预计 7 个工作日内反馈。个人开发者账号已通过验证，发布者名称为 `muzermat`。分类为 Developer Tools，公开分发，商店语言为简体中文。

Partner Center 商品 ID：`5afd8ef8-e691-4291-bebc-c17a7e3efd7a`。后台入口：[OJ Modern Student](https://partner.microsoft.com/en-us/dashboard/microsoftedge/5afd8ef8-e691-4291-bebc-c17a7e3efd7a/packages/dashboard)。

- Store ID：`0RDCKF3RPSRX`
- CRX ID：`pddopmfbakkmmpfdnoafekibhmfdgago`
- 商店 URL：后台提示通过审核并发布后才会提供，README 暂不添加安装链接。
- 已提交中文介绍、扩展标志、搜索词、权限说明和隐私政策；审核说明使用英文，注明需要 Accoding 账号的功能及联系邮箱，未提供专用 OJ 测试账号。

## 提交文件

运行 `npm run package` 后生成 `dist/oj-modern-student-edge-0.2.10.zip`。`manifest.json` 位于 ZIP 根目录，后台和面板均使用本地模块，功能代码随包分发。安装包通过 `_locales/zh_CN/messages.json` 声明简体中文名称与说明。

## 商店文案

- 名称：OJ Modern Student
- 简短说明：北航 Accoding 学生端：界面美化、文本与代码复制、提交界面优化。
- 分类：开发人员工具 / 生产力（以后台可选项为准）
- 语言：简体中文
- 支持与主页：`https://github.com/y38501148-max/oj-modern-student`
- 支持页面：`https://github.com/y38501148-max/oj-modern-student/issues`
- 隐私政策：`https://github.com/y38501148-max/oj-modern-student/blob/main/docs/PRIVACY.md`
- 标志：`extension/icons/128.png`（128 × 128 PNG，符合商店最低尺寸）
- 搜索词：Accoding、北航、OJ、程序设计、代码复制、学生

详细说明：

> OJ Modern Student 用于北航 Accoding 学生端，为浏览课程、阅读题目和提交代码提供更清楚的界面。安装后打开北航 Accoding 网站即可使用。
>
> 首页与课程：统一导航和表格样式，课程支持搜索、分组展开，以及进行中和以往课程切换。赛事列表区分比赛标题、课程和时间，长名称可悬停查看全文。
>
> 题目阅读：调整题面排版和公式显示；代码块与文本框均提供框外“复制”按钮，复制时保留空格、缩进和换行。
>
> 代码提交：加宽编辑区，支持字号调整、行数和字符数统计、Tab 缩进及代码复制。普通题目提交后留在题面，右侧显示本题个人提交记录，自动更新 Waiting、Judging 和最终结果。
>
> 评测与源码：比赛和普通题目的右侧分数支持悬停查看数据点数量、逐点得分、耗时及内存。查看代码页提供语法高亮、行号、字号调整和纯源码复制。
>
> 扩展沿用 Accoding 登录状态，代码提交和评测查询使用原站接口。页面内容在本地处理，版本检查读取本项目的公开 GitHub 版本文件；Edge 商店版由浏览器自动更新。
>
> 该插件由个人开发，与北航程序设计课程组无关。

## 权限解释

单一用途说明：改善北航 Accoding 学生端的做题体验，包括页面排版、文本与代码复制、代码编辑，以及本题个人评测记录展示。

按后台列出的权限分别填写：

- `storage`：在本机保存功能设置、版本检查结果及用户暂缓的更新提醒。
- `alarms`：每 6 小时检查一次公开版本文件，提示扩展更新。
- `clipboardWrite`：用户点击“复制”时，将选定代码块、文本框或源码写入剪贴板。
- `https://raw.githubusercontent.com/*`：后台只读取固定地址 `https://raw.githubusercontent.com/y38501148-max/oj-modern-student/main/version.json`，获取版本号；请求不带身份凭证。
- `https://accoding.buaa.edu.cn/*` 内容脚本：调整 Accoding 页面样式，读取当前题目、编辑内容及个人评测记录。代码提交和评测查询发送至 Accoding 原站。

远程代码：不使用。Vue、Ant Design Vue、MathJax 和全部功能代码均随扩展打包；版本文件只包含版本号，不下载或执行脚本。

数据处理说明：题面、代码及评测记录用于当前页面的本地显示；用户主动提交时，代码和语言发送到 Accoding。扩展不向开发者上传这些内容，不提供广告或遥测。完整说明见 [隐私政策](PRIVACY.md)。

## 审核说明

可粘贴以下说明；测试账号如需提供，应填入 Partner Center 私密审核说明，不写入仓库：

> 测试网址：https://accoding.buaa.edu.cn/ 。本扩展用于该站点的学生页面，安装后刷新页面即可使用。
>
> 可检查首页、课程列表和赛事列表的界面；在题目页检查公式排版、代码块或文本框旁的“复制”按钮，在提交窗口检查字号和缩进工具。
>
> 个人提交记录、赛时评测记录和代码提交流程需要 Accoding 账号。扩展不创建站点账号。请勿使用真实课程账号作公开展示。
>
> 更新检查只读取公开版本 JSON，全部可执行代码及公式渲染资源已包含在安装包中。

## 素材与账号资料

必需的扩展标志已提供。截图为可选项，最多 6 张，尺寸为 1280 × 800 或 640 × 480；使用演示数据，避免展示姓名、学号和私人代码。宣传图可选，尺寸为 440 × 280 或 1400 × 560。

当前注册页要求联系人地址及电话号码，并提示联系人地址将显示在开发人员个人资料中。发布者名称、地址和电话由维护者提供；国家/地区与账号类型完成注册后无法更改。

## 更新发布

1. 在 `package.json` 提升版本，同步 CHANGELOG，运行检查与打包。
2. 发布 GitHub Release，取得 `edge` ZIP。
3. 在 Partner Center 更新现有商品，上传新包并提交审核。
4. 商店上线后浏览器负责更新；GitHub 版本提示不代表商店已完成审核。
5. 首次上架成功后，将 README 的“待上架”替换为真实商店链接。

官方参考：[发布扩展](https://learn.microsoft.com/en-us/microsoft-edge/extensions/publish/publish-extension)、[注册开发者账号](https://learn.microsoft.com/en-us/microsoft-edge/extensions/publish/create-dev-account)、[更新扩展](https://learn.microsoft.com/en-us/microsoft-edge/extensions/update/update-extension)。

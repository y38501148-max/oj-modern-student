# 学生端界面

使用 Vue 3、TypeScript、Ant Design Vue 4。Vite 编译 Vue 单文件组件，生成 MV3 扩展可直接运行的本地脚本。

主题通过 ConfigProvider 统一配置，组件前缀为 `oms-ant`。导航使用 Menu，首页使用 Card、Table、Badge、Collapse，设置面板使用 Switch 和 Alert，复制与编辑工具使用 Button、Select。

- 白色侧栏宽 216px，顶部导航高 68px，内容背景为 `#f5f7fb`。
- 主色 `#2563eb`，正文 `#172339`，边框 `#e3e8ef`。
- 首页读取原页面中的题目、榜单、通知和链接，按任务分组展示。
- 题面保留原节点和公式；复制按钮位于对应样例标题右侧，代码框仅包含样例。
- 比赛页保留 Angular 绑定，提交表单沿用原站语言选项和提交校验。
- 提交弹窗主体可滚动，底部操作区保持可见。
- 680px 以下隐藏常驻侧栏，使用 Drawer 导航；宽表局部滚动。
- 页脚采用正常文档流。界面文案使用动作、状态和必要规则。

布局参考 ui-ux-pro-max 的 Minimalism & Swiss Style，并按 Ant Design Vue 的 ConfigProvider 主题规则实现。

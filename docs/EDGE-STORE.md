# Edge Add-ons 上架材料

状态：扩展已按 Manifest V3 打包；尚未提交商店，未取得商店 ID。使用当前仓库维护者的 Microsoft Partner Center 开发者账号提交。

## 提交文件

运行 `npm run package` 后上传 `dist/oj-modern-student-edge-0.2.8.zip`。`manifest.json` 位于 ZIP 根目录，后台和面板均使用本地模块，功能代码随包分发。

## 商店文案

- 名称：OJ Modern Student
- 简短说明：北航 Accoding 学生端：界面美化、文本与代码复制、提交界面优化。
- 分类：开发人员工具 / 生产力（以后台可选项为准）
- 语言：简体中文
- 支持与主页：`https://github.com/y38501148-max/oj-modern-student`
- 隐私政策：`https://github.com/y38501148-max/oj-modern-student/blob/main/docs/PRIVACY.md`

详细说明：

> OJ Modern Student 为北航 Accoding 学生页面提供统一的导航、题面、表格与表单样式；支持一键复制题面中的代码块和文本框；加宽提交弹窗，提供代码字号、行数统计、Tab 缩进与代码复制。
>
> 安装后打开 https://accoding.buaa.edu.cn/ 即可使用，功能可独立关闭。继续使用原站登录和提交流程。扩展在本地处理页面内容，版本检查只访问公开的 GitHub 版本文件。
>
> 本扩展为独立社区项目，与北航及 Accoding 官方无隶属关系。

## 权限解释

见 [隐私政策](PRIVACY.md) 的“权限用途”。单一用途为增强 Accoding 学生端做题体验。

审核测试网址：`https://accoding.buaa.edu.cn/`。部分页面需要原站账号；如果审核方要求测试账号，应通过 Partner Center 私密审核说明提供由维护者授权的测试账号，勿在仓库提交凭据。

提交前补充商店要求的截图、开发者联系信息及账号资料。截图应使用演示账号/模拟数据，隐藏姓名、学号和私人代码。`extension/icons/128.png` 可用作扩展图标；其他商店宣传素材按后台尺寸要求提供。

## 更新发布

1. 在 `package.json` 提升版本，同步 CHANGELOG，运行检查与打包。
2. 发布 GitHub Release，取得 `edge` ZIP。
3. 在 Partner Center 更新现有商品，上传新包并提交审核。
4. 商店上线后浏览器负责更新；GitHub 版本提示不代表商店已完成审核。
5. 首次上架成功后，将 README 的“待上架”替换为真实商店链接。

官方参考：[发布扩展](https://learn.microsoft.com/en-us/microsoft-edge/extensions/publish/publish-extension)、[更新扩展](https://learn.microsoft.com/en-us/microsoft-edge/extensions/update/update-extension)。

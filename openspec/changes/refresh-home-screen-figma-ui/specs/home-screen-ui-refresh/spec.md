## ADDED Requirements

### Requirement: Home screen SHALL render the latest Figma visual system
首页必须按照最新 Figma 首页节点的视觉系统渲染，包括浅色页面底色、白色内容卡片、金色强调色、统一圆角阴影、更新后的标题层级和主按钮样式，同时保持现有首页的区块顺序不变。

#### Scenario: Hero and section styling are refreshed
- **WHEN** 用户进入首页
- **THEN** 页面必须展示与最新 Figma 一致的 Hero 主视觉、标题、副标题、标签组和主 CTA
- **THEN** 愿景、生態架构、核心技术、经济模型、路线图、合作伙伴和联系方式区块必须使用新版卡片化样式呈现
- **THEN** 页面整体仍然按照当前首页既有的纵向信息架构顺序展示

### Requirement: Home screen SHALL preserve existing interaction contracts
首页视觉重构不得破坏当前已接入的交互入口，页面仍然必须保留菜单切换、语言切换、钱包连接、公告详情打开/关闭、认购中心入口以及各 section ref 锚点能力。

#### Scenario: Existing homepage actions still work
- **WHEN** 用户点击菜单、语言切换、钱包连接或认购中心入口
- **THEN** 页面必须继续调用当前 `HomeScreen` 已接收的对应回调，而不是引入新的交互协议
- **THEN** 公告栏及详情抽屉的显示与关闭行为必须保持可用
- **THEN** 各区块 ref 必须仍可用于页面内导航或定位

### Requirement: Home screen SHALL display updated assets and partner/contact content
首页必须承接新版设计所使用的更新资源与展示内容，包括主视觉图片、合作伙伴展示、联系方式区域以及新版设计中已调整的业务信息承载方式。

#### Scenario: Updated homepage resources are rendered
- **WHEN** 首页完成渲染
- **THEN** Hero 图片、合作伙伴资源和联系方式按钮必须显示新版设计对应的内容或等价本地资源
- **THEN** 页面不得继续保留旧版深色首页特有的视觉资源作为主展示
- **THEN** 新资源接入必须兼容当前 React 与 Tailwind 的实现方式，不能依赖 Figma 临时远程资源直接在线渲染

## ADDED Requirements

### Requirement: Side drawer SHALL adopt the refreshed visual language
左侧菜单栏必须采用与新版首页、认购中心和社区页一致的浅色金白视觉体系，包括抽屉背景、品牌头部、钱包状态区、菜单项、选中态、按钮、边框与阴影层次，从而形成统一的产品观感。

#### Scenario: Side drawer matches the refreshed visual system
- **WHEN** 用户打开左侧菜单栏
- **THEN** 抽屉必须展示与新版页面一致的浅色基底、金色强调和高质量卡片层次
- **THEN** 头部品牌区、钱包区和菜单区必须使用统一的新版容器与留白节奏
- **THEN** 抽屉整体视觉必须明显区别于当前旧版深色菜单栏

### Requirement: Side drawer SHALL preserve existing navigation and wallet interactions
左侧菜单栏视觉升级不得破坏现有导航和钱包操作流程，组件必须继续支持关闭抽屉、菜单项切换、钱包连接、切换钱包与断开连接等行为。

#### Scenario: Existing side drawer interactions remain available
- **WHEN** 用户打开抽屉、切换菜单、关闭抽屉或操作钱包按钮
- **THEN** 组件必须继续沿用当前 `SideDrawer` 的状态、回调和数据流
- **THEN** 视觉升级不得引入新的业务前提、额外步骤或破坏当前交互反馈
- **THEN** 组件必须继续兼容已连接钱包和未连接钱包两种状态展示

### Requirement: Side drawer SHALL improve menu clarity and premium presentation
左侧菜单栏必须在保持原有信息结构的前提下，提升菜单导航、当前位置反馈、钱包状态和操作按钮的可读性、层次感与精致度。

#### Scenario: Menu items and wallet actions are easier to scan
- **WHEN** 用户浏览抽屉内的菜单项和钱包状态区
- **THEN** 当前激活菜单项必须具备更清晰的高亮反馈
- **THEN** 钱包状态、连接入口、切换按钮和断开按钮必须保持主次分明且风格统一
- **THEN** 菜单图标、文字和箭头反馈必须延续同一视觉体系，而不是与主页面割裂

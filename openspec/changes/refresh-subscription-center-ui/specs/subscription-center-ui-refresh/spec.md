## ADDED Requirements

### Requirement: Subscription center SHALL adopt the refreshed home visual language
认购中心必须采用与新版首页一致的浅色金白视觉体系，包括页面背景、标题表现、分段容器、方案卡片、重点数据块、CTA 按钮、分隔与阴影层次，从而形成统一的产品观感。

#### Scenario: Subscription screen matches the refreshed visual system
- **WHEN** 用户进入认购中心页面
- **THEN** 页面必须展示与新版首页一致的浅色基底、金色强调和高质量卡片层次
- **THEN** 方案选择区、主方案内容区、说明区和订单区必须使用统一的新版卡片与留白节奏
- **THEN** 页面整体视觉必须明显区别于当前旧版深色认购中心

### Requirement: Subscription center SHALL preserve existing subscription interactions
认购中心视觉升级不得破坏现有认购流程，页面必须继续支持方案拉取、Tab 切换、滑动切换、订单展示、钱包相关状态与认购确认交互。

#### Scenario: Existing subscription workflow remains available
- **WHEN** 用户切换方案、滑动卡片、查看订单或点击认购
- **THEN** 页面必须继续沿用当前 `SubscriptionCenterScreen` 的业务状态、回调与 API 数据流
- **THEN** 视觉升级不得引入新的业务前提、额外步骤或破坏现有确认下单逻辑
- **THEN** 页面必须仍能兼容登录态、未登录态和已购状态展示

### Requirement: Subscription center SHALL improve content clarity and premium presentation
认购中心必须在保持原有信息量的前提下，提升方案差异、权益信息、价格展示、状态反馈与订单信息的可读性和精致度。

#### Scenario: Plan information is easier to scan
- **WHEN** 用户浏览不同认购方案
- **THEN** 方案价格、等级、算力、数量、复投和时间加成等关键字段必须具备更清晰的视觉优先级
- **THEN** 当前选中方案、已购状态和可操作按钮必须具备明显但统一的高品质样式反馈
- **THEN** 订单列表与确认弹层必须延续同一视觉体系，而不是与主页面风格割裂

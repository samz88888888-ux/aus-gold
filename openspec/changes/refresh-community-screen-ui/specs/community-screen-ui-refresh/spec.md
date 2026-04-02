## ADDED Requirements

### Requirement: Community screen SHALL adopt the refreshed visual language
我的社区页面必须采用与新版首页和认购中心一致的浅色金白视觉体系，包括页面背景、标题表现、分段容器、主卡片、强调标签、CTA 按钮、分隔与阴影层次，从而形成统一的产品观感。

#### Scenario: Community screen matches the refreshed visual system
- **WHEN** 用户进入我的社区页面
- **THEN** 页面必须展示与新版首页和认购中心一致的浅色基底、金色强调和高质量卡片层次
- **THEN** 邀请卡、团队统计区和直推列表区必须使用统一的新版容器与留白节奏
- **THEN** 页面整体视觉必须明显区别于当前旧版深色社区页

### Requirement: Community screen SHALL preserve existing community interactions
社区页视觉升级不得破坏现有邀请与团队数据流程，页面必须继续支持用户信息拉取、邀请码展示、邀请链接生成与复制、直推列表展示以及顶部导航相关交互。

#### Scenario: Existing community workflow remains available
- **WHEN** 用户访问社区页、查看邀请链接、复制链接或浏览直推列表
- **THEN** 页面必须继续沿用当前 `CommunityScreen` 的状态、回调与 API 数据流
- **THEN** 视觉升级不得引入新的业务前提、额外步骤或破坏当前复制反馈行为
- **THEN** 页面必须继续兼容加载态、无数据态和已有数据态展示

### Requirement: Community screen SHALL improve information clarity and premium presentation
社区页必须在保持原有信息结构的前提下，提升邀请链接、团队指标与直推成员列表的可读性、层次感和精致度，使用户能更快理解页面重点信息。

#### Scenario: Team and referral information is easier to scan
- **WHEN** 用户浏览邀请卡、团队统计和直推成员列表
- **THEN** 邀请链接、复制按钮、核心人数指标和列表字段必须具备更清晰的视觉优先级
- **THEN** 列表表头、行内容、序号高亮和时间字段必须保持易读且风格统一
- **THEN** 加载态与空态必须延续同一视觉体系，而不是与主页面样式割裂

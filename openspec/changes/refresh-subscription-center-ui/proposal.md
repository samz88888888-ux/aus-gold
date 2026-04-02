## Why

当前 `SubscriptionCenterScreen.tsx` 仍然沿用旧版深色科幻风格，与已经完成改版的首页在背景、卡片、标题层级、按钮和整体气质上明显割裂，影响产品的一致性与精致感。现在需要在不改动认购核心流程的前提下，将认购中心升级为与新版首页统一的高品质视觉风格。

## What Changes

- 按照新版首页的浅色金白设计语言，重构认购中心的背景、标题、卡片、按钮、分隔、阴影和状态样式。
- 提升认购方案切换区域、主方案卡片、收益/权益说明、订单列表和确认弹层的视觉层次，使页面更精致、更有高级感。
- 保留现有认购中心的业务逻辑，包括计划拉取、方案切换、触摸滑动、订单获取、钱包相关状态与确认下单流程。
- 对页面中与首页共用的视觉模式进行复用或对齐，例如顶部导航、浅色卡片体系、金色强调、黑金 CTA 与全局留白节奏。

## Capabilities

### New Capabilities
- `subscription-center-ui-refresh`: 认购中心必须在保留现有认购交互与数据流程的前提下，渲染与新版首页一致的视觉风格和高质量展示效果。

### Modified Capabilities

## Impact

- 受影响代码：`src/features/figma/pages/SubscriptionCenterScreen.tsx`
- 可能受影响代码：`src/features/figma/components/shared.tsx`、`src/features/figma/data.tsx`
- 可能受影响资源：`public/figma` 下认购中心背景、图标、装饰图与相关展示素材
- 不涉及接口协议变更，不新增依赖，不重构认购业务流程

# Codex Agent: old-pages-react-migration

## 角色
你是 `old-pages` 迁移代理。目标是把 `src/features/old-pages/pages/*` 中从 Vue 复制过来的页面，统一到当前 React 主站视觉语言（参考首页/认购中心/我的社区），同时保持业务逻辑与交互行为不变。

## 输入
- 目标页面路径（1~3 个）
- 当前报错或视觉问题描述
- 允许修改的文件范围

## 强约束
1. 不改业务语义：保留 API 调用、字段名、路由参数、onClick 事件语义。
2. 不破坏导航：保留 `onNavigate` 页面流转与参数透传。
3. old-pages 统一头部：页面内部不要直接挂 `TopNavigation`，统一通过 `PageContainer` + `OldPageHeaderProvider` 注入。
4. 视觉统一：优先复用 React 现有主站样式节奏（卡片层级、字号梯度、留白、按钮形态）。
5. 迁移后必须可编译：至少通过 `npm run lint` 和 `npm run build`。

## 执行流程
1. 扫描目标页，拆分为三层：结构层、信息层、行为层。
2. 先锁住行为层（事件、接口、状态），只重写结构层和视觉层。
3. 套用规则文件 `DOCS/codex/old-pages-migration-rules.md`。
4. 对齐视觉基线：`src/features/figma/pages/HomeScreen.tsx`、`SubscriptionCenterScreen.tsx`、`CommunityScreen.tsx`。
5. 检查 old-pages 头部一致性（避免页面单独接 header）。
6. 跑 lint/build，修复静态问题。
7. 输出变更摘要：文件、原因、风险点、验证结果。

## 输出格式
- `Changed files`
- `Behavior preserved`
- `Visual alignment`
- `Validation`
- `Residual risks`

## 可直接复用的提示词
```text
Use $old-pages-react-migration to migrate these pages to current React visual language:
- <page-path-1>
- <page-path-2>
Keep all data logic and navigation behavior unchanged, enforce old-pages shared header, and run lint/build after edits.
```

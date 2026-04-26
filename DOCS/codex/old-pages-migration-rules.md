# Old Pages Migration Rules

## 1) 视觉语言基线
参考页面：
- `src/features/figma/pages/HomeScreen.tsx`
- `src/features/figma/pages/SubscriptionCenterScreen.tsx`
- `src/features/figma/pages/CommunityScreen.tsx`
- `src/features/figma/components/shared.tsx` (`TopNavigation`)

## 2) 布局规则
1. 页面主内容容器统一 `px-4`，顶部留白对齐 `pt-[70px]`（含主站 header 的页面）。
2. 卡片优先圆角 `18/24`，边框为轻边 `border-black/5` 或暗色页的 `border-white/8~10`。
3. 阴影统一柔和金色/中性阴影，不使用高饱和发光块。
4. 信息组织遵循“标题区 -> 核心操作区 -> 列表区 -> 补充说明区”。

## 3) 字号梯度
1. 微标签：`text-[10px]` + `uppercase` + 大 tracking。
2. 主标题：`text-[28px]`（首页可到 `29px`），`font-black`。
3. 二级标题：`text-[20px]` 或 `22px`，`font-black`。
4. 正文：`text-[12px]`~`13px`，行高 `20~24px`。
5. 元信息：`text-[9px]`~`11px`。
6. 主按钮文本：`text-[16px]`~`17px`，`font-bold`。

## 4) 配色规则
1. 主背景：`#f8f8f5` 系浅底 + 顶部金色径向渐变。
2. 强调色：`#fad933`、`#d7ab1e`、`#c58b1f`。
3. 正文黑色体系：`text-black` + 不透明度层级（/30 /45 /58 /65）。
4. 避免纯荧光黄 + 纯黑硬对比的大面积按钮。

## 5) 交互规则
1. 点击态统一 `active:scale-[0.98~0.99]`。
2. 可复制、确认、提交等主操作要有单一明确主按钮。
3. 列表空态和加载态都必须保留。
4. 弹层优先底部 sheet，保留遮罩与关闭路径。

## 6) old-pages 头部规则
1. old-pages 页面内部不直接接 `TopNavigation`。
2. 由 `NavigationShowcase` 在 old-pages 分支统一包裹 `OldPageHeaderProvider`。
3. 页面统一通过 `PageContainer` 承接头部占位与安全区。

## 7) 迁移禁区
1. 不改接口参数、字段名、分页参数、状态机逻辑。
2. 不改页面路由 key 与页面跳转语义。
3. 不删除异常处理与空值兜底。

## 8) 提交前检查
1. `npm run lint`
2. `npm run build`
3. 手动点通关键路径：入口 -> 详情 -> 返回
4. 验证移动端宽度下无文字遮挡/溢出

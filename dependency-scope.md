# 单仓目标依赖与源码范围

## 目标

本文件用于固定 Vben 5.5.9 单仓改造的依赖边界，避免升级或迁移最终会删除的应用、工具和发布能力。

本阶段只确定范围，不升级依赖版本、不删除源码目录、不改变运行行为。

## 唯一目标应用

| 路径 | 当前处理 | 最终处理 |
| --- | --- | --- |
| `apps/web-ele` | 保留并作为唯一目标应用 | 提升到仓库根目录 |
| `apps/backend-mock` | 暂时保留，保障基线可独立运行 | 精简后迁入根目录 `mock/`，只保留登录、用户、菜单等基础接口 |
| `apps/web-antd` | 不再提供根运行脚本 | 删除 |
| `apps/web-naive` | 不再提供根运行脚本 | 删除 |
| `docs` | 不再提供根运行和构建脚本 | 删除，必要的项目文档迁回根目录 |
| `playground` | 不再提供根运行和构建脚本 | 删除 |

## Vben 源码能力映射

下列 `@vben/*` 包只作为迁移来源。单仓完成后不保留 workspace 包边界，也不保留运行时 `@vben/*` 依赖。

| 当前能力 | 当前来源 | 单仓目标位置 | 处理结论 |
| --- | --- | --- | --- |
| 登录与访问控制 | `@vben/access` | `src/core/access` | 保留并本地化 |
| 请求客户端 | `@vben/request` | `src/core/request` | 保留 Token、刷新、错误和下载能力 |
| 用户与应用状态 | `@vben/stores` | `src/stores` | 保留会话、权限、标签页和应用状态 |
| 偏好设置 | `@vben/preferences` | `src/app/preferences` | 保留并精简配置项 |
| 布局、菜单与标签页 | `@vben/layouts`、核心 UI Kit | `src/layouts` | 保留实际使用能力并删除多 UI 适配 |
| 国际化 | `@vben/locales` | `src/locales` | 保留中文、英文和 Element Plus 语言同步 |
| 图标 | `@vben/icons` | `src/components/icon` | 保留 Iconify 与本地图标加载能力 |
| 全局样式 | `@vben/styles` | `src/styles` | 保留设计令牌和必要基础样式 |
| 公共类型 | `@vben/types` | 就近类型或 `src/shared/types` | 拆散，避免新的巨型类型出口 |
| 公共工具 | `@vben/utils` | 就近工具或 `src/shared/utils` | 只迁移实际使用函数 |
| Hooks | `@vben/hooks` | `src/shared/composables` | 只迁移实际使用 Hooks |
| 常量 | `@vben/constants` | 对应业务模块或 `src/shared/constants` | 就近放置 |
| 通用 UI | `@vben/common-ui` | `src/components` | 只保留 Page、Loading、认证和实际使用组件 |
| VXE 集成 | `@vben/plugins/vxe-table` | `src/components/table` | 只为复杂表格保留 |
| ECharts、Motion 等插件 | `@vben/plugins` | 按业务安装 | 不作为基础必选能力 |

## 表单范围

旧 Vben Form 只在迁移期保留，用于保证基线页面正常运行。

最终表单边界固定为：

- TanStack Form 是唯一表单状态和校验内核。
- Zod 负责数据结构、校验和提交转换。
- Tailwind CSS 负责标签、错误、间距、Grid、Flex 和响应式布局。
- Element Plus 只提供 Input、Select、DatePicker、Upload 等输入控件。
- 不使用 `ElForm`、`ElFormItem`、Element Plus rules、`validate()` 或 `resetFields()`。
- 不保留多组件库 Form Adapter。
- 不保留 `packages/@core/ui-kit/form-ui` 作为独立包。

## 最终运行依赖

以下依赖计划在对应升级 PR 中切换到实施当天 npm `latest` 稳定版，并使用明确版本号。

### 核心依赖

- `vue`
- `vue-router`
- `pinia`
- `pinia-plugin-persistedstate`
- `element-plus`
- `@tanstack/vue-query`
- `@tanstack/vue-form`
- `zod`
- `axios`
- `vue-i18n`
- `dayjs`
- `@vueuse/core`
- `@iconify/vue`

### 样式与组合工具

- `tailwind-merge`
- `clsx`

### 交互与页面基础能力

- `nprogress`
- `sortablejs`

### 按场景保留

- `vxe-table`：复杂编辑表格、虚拟滚动和 Excel 风格交互。
- `vxe-pc-ui`：仅在 VXE-Table 当前稳定版本仍要求时保留。
- `echarts`：只有业务仪表盘实际使用时安装。
- `qrcode`：只有二维码登录或业务二维码实际使用时安装。

普通表格统一使用 Element Plus Table，不默认引入专业表格能力。

## 最终开发依赖

### 构建与类型

- `vite`
- `@vitejs/plugin-vue`
- `@vitejs/plugin-vue-jsx`
- `typescript`
- `vue-tsc`
- `@types/node`

### Tailwind CSS

- `tailwindcss`
- `@tailwindcss/vite`

Tailwind CSS 4 接入后删除不再需要的旧 Tailwind 3、PostCSS 和 Autoprefixer 配置。

### 质量检查

- `eslint`
- `eslint-plugin-vue`
- `oxlint`
- `oxfmt`
- `stylelint`
- `cspell`
- `knip`

### 测试

- `vitest`
- `@vue/test-utils`
- `happy-dom`
- `@playwright/test`

### Git 工作流

- `lefthook`
- `@commitlint/cli`
- `@commitlint/config-conventional`
- `rimraf`

## 迁移期保留但最终删除

以下依赖和目录在迁移期仍可能用于运行或校验 Vben 5.5.9，不在当前阶段直接删除：

- `turbo`
- `unbuild`
- `@changesets/*`
- `publint`
- `@vben/vsh`
- `@vben/turbo-run`
- `@vben/*-config`
- `internal/*`
- `scripts/vsh`
- `scripts/turbo-run`
- `packages/@core/*`
- `packages/effects/*`

它们必须在对应能力已迁入根应用、CI 不再依赖后删除。

## 最终删除范围

### 应用和文档

- `apps/web-antd`
- `apps/web-naive`
- `docs`
- `playground`

### 多包和发布体系

- `pnpm-workspace.yaml`
- `turbo.json`
- `.changeset`
- Changesets 脚本
- npm 包发布配置
- `build.config.ts`
- 为独立包生成类型和产物的配置

### 多 UI 框架

- `ant-design-vue`
- `naive-ui`
- 多 UI 应用入口
- 多 UI 组件 Adapter
- 跨 UI 框架统一 Props

### 默认不保留的演示能力

- 富文本编辑器
- PWA
- 水印
- Captcha 演示
- QR Code 演示
- ECharts 演示
- 与最终后台底座无关的示例页面

业务确实需要时，应在对应业务 PR 中按需重新引入。

## 根脚本边界

本阶段删除以下根脚本：

- `build:antd`
- `build:naive`
- `build:docs`
- `build:play`
- `dev:antd`
- `dev:naive`
- `dev:docs`
- `dev:play`

迁移期继续保留：

- `dev:ele`
- `build:ele`
- 原 Vben 5.5.9 lint、typecheck、test 和全仓构建脚本

在根应用建立完成后，再将它们替换为标准单应用脚本：

```text
pnpm dev
pnpm build
pnpm preview
pnpm lint
pnpm typecheck
pnpm test
```

## 依赖升级边界

- 不升级最终会删除的多 UI 应用独占依赖。
- 不升级 docs、Playground、包发布和 Monorepo 工具的独占依赖。
- 先建立单仓入口和本地化运行时代码，再升级最终直接依赖。
- 每个主版本升级独立验证，不与业务重构混在同一 PR。
- 不使用 prerelease 版本。
- 不通过全局关闭类型或 lint 规则掩盖兼容问题。

## 本阶段验收

- 根目录不再提供其他 UI 应用、docs 和 Playground 的直接运行脚本。
- `dev:ele` 和 `build:ele` 仍可用。
- `pnpm-lock.yaml` 不发生变化。
- 不删除任何应用或 workspace 包。
- 不升级任何依赖。
- CI 的 install、lint、typecheck、unit test 和 `build:ele` 全部通过。

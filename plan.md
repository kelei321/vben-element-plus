# Vben 5.5.9 单仓精简与依赖升级约束

## 一、固定基线

源码严格基于：

```text
vbenjs/vue-vben-admin
tag: v5.5.9
目标应用: apps/web-ele
```

Vben 5.5.9 的 `web-ele` 已经使用 Element Plus，但仍依赖 `@vben/access`、`@vben/common-ui`、`@vben/layouts`、`@vben/request`、`@vben/stores` 等多个 `workspace:*` 包。

5.5.9 当前基线主要版本包括：

```text
Element Plus 2.10.2
Vue 3.5.17
Vite 6.3.5
TypeScript 5.8.3
Vue Router 4.5.1
Pinia 3.0.3
Tailwind CSS 3.4.17
TanStack Query 5.81.5
Zod 3.25.67
Vitest 3.2.4
pnpm 10.12.4
```

这些是迁移起点，不是最终保留版本。

---

## 二、最新版本定义

“升级到最新”统一定义为：

- 使用 npm `latest` 标签
- 不使用 `alpha`
- 不使用 `beta`
- 不使用 `rc`
- 不使用 `canary`
- 不使用 `next`
- 不使用 nightly 或 insiders 版本
- `package.json` 使用明确版本号，不使用 `^` 或 `~`
- `pnpm-lock.yaml` 必须重新生成并提交
- 实施当天再次查询版本，不能机械使用计划编写时的版本

传递依赖不逐个人工指定，由最新 pnpm 锁文件解析。只有出现安全、构建或 peer dependency 问题时才允许添加 `overrides`，并必须写明原因。

---

## 三、当前确认的目标版本

截至 2026 年 7 月 22 日，当前核心目标版本为：

| 依赖               |    目标版本 |
| ------------------ | ----------: |
| Node.js            | 24.18.0 LTS |
| pnpm               |     11.15.1 |
| Vue                |      3.5.40 |
| Vue Router         |       5.2.0 |
| Pinia              |       4.0.2 |
| Vite               |       8.1.5 |
| TypeScript         |       7.0.2 |
| Element Plus       |      2.14.3 |
| Tailwind CSS       |       4.3.3 |
| TanStack Vue Query |     5.101.3 |
| TanStack Vue Form  |      1.33.0 |
| Zod                |       4.4.3 |
| Axios              |      1.18.1 |
| Vitest             |      4.1.10 |
| Playwright Test    |      1.61.1 |

Vue、Vite、Element Plus 和 TanStack Query 当前版本分别为 3.5.40、8.1.5、2.14.3 和 5.101.3。

TanStack Vue Form、Tailwind CSS、Vue Router 和 Pinia 当前版本分别为 1.33.0、4.3.3、5.2.0 和 4.0.2。

TypeScript、Zod、Axios、Vitest 和 Playwright Test 当前稳定版本分别为 7.0.2、4.4.3、1.18.1、4.1.10 和 1.61.1。

生产环境使用 Node.js 24 LTS，不使用仍处于 Current 阶段的 Node.js 26；Node.js 官方当前列出的最新 LTS 是 24.18.0。

---

## 四、依赖升级范围

### 最终运行依赖

全部升级到最新稳定版：

```text
vue
vue-router
pinia
pinia-plugin-persistedstate
element-plus
@vueuse/core
@tanstack/vue-query
@tanstack/vue-form
zod
axios
dayjs
vue-i18n
@iconify/vue
vxe-table
vxe-pc-ui
```

只保留项目真实使用的运行依赖。

### 最终开发依赖

全部升级到最新稳定版：

```text
typescript
vue-tsc
vite
@vitejs/plugin-vue
@vitejs/plugin-vue-jsx
@tailwindcss/vite
tailwindcss
vitest
@vue/test-utils
happy-dom
@playwright/test
eslint
eslint-plugin-vue
oxlint
oxfmt
stylelint
lefthook
commitlint
knip
rimraf
```

### 不升级、直接删除

这些依赖属于准备删除的 Monorepo、发布、文档或多组件库体系，不浪费时间升级：

```text
turbo
@changesets/*
publint
unbuild
tsdown
vitepress
docs 相关插件
@vben/turbo-run
@vben/vsh
@vben/*-config
Ant Design Vue
Naive UI
TDesign
其他应用独占依赖
Playground 独占依赖
```

---

## 五、调整后的 PR 顺序

### 执行进度

#### PR1：冻结 Vben 5.5.9 基线

- 状态：已完成
- 实际 PR：#1
- 合并提交：`4288ee89ae799674b75bbf5aa75d90550915b2fa`
- CI：run `29937106014` 的 install、lint、typecheck、unit test、`build:ele` 全部通过
- 范围：未升级依赖或修改业务逻辑

#### PR2：收敛目标依赖图

- 状态：已完成
- 实际 PR：#6
- 合并提交：`09b4f7397cd67dbbbbe2600b932ee1e8301b6901`
- CI：run `29938398165` 的 install、lint、typecheck、unit test、`build:ele` 全部通过
- 范围：仅新增范围文档并删除 8 个非 Element 根脚本

#### PR3：建立单仓运行入口

- 状态：已完成
- 实际 PR：#7
- 最终 head：`6c54cf30400f912e6fd03e7229e758d6529f58f7`
- 合并提交：`96096b2d295acca79f798f4331a419e3e75808af`
- CI：run `29942239473` 的 install、lint、根 typecheck、unit test、根 build 全部通过
- 本地验证：`pnpm dev` 未运行，需要启动后检查登录、菜单、标签页和 Element Plus 页面
- 范围：建立根入口和配置，继续复用 `apps/web-ele` 与 workspace 依赖；未升级依赖、未修改锁文件、未改写业务逻辑

#### PR4：迁入 Vben 必要源码（第一批）

- 状态：已完成，待最终 review 与合并
- 实际 PR：#13
- 已验证实现提交：`5d277550984a2860e11dcee0757ab32af3553262`
- CI：run `29971494647` 的 install、lint、根 typecheck、unit test、根 build 全部通过
- changed files：`apps/web-ele/src/main.ts`、`src/shared/utils/loading.ts`、对应单测、迁移记录和本计划
- 本地验证：`pnpm dev` 与 `pnpm dev:ele` 浏览器冒烟未运行
- 范围：仅本地化 `unmountGlobalLoading`；未升级依赖、未修改锁文件、未改写表单或业务逻辑

更新规则：每个 PR 完成目标改动后，必须先更新本节中的状态、实际 PR、最终 head 或合并提交、真实验证结果和范围结论，并同步更新下方“新会话交接”，再进行最终 review 与合并。

### 新会话交接

- 仓库：`kelei321/vben-element-plus`
- 源码基线：Vben `v5.5.9`，唯一目标应用为 `apps/web-ele`
- 当前 main：`96096b2d295acca79f798f4331a419e3e75808af`
- 唯一功能分支：`feat/vben-559-foundation`
- 已完成：PR #1 导入基线；PR #6 收敛依赖范围；PR #7 建立根 Vite 入口和根 `dev/build/typecheck/test` 命令
- 当前结构：根 `src/main.ts` 仍转发到 `apps/web-ele/src/main`；运行时仍依赖 workspace 包；尚未升级依赖或修改锁文件
- 当前阶段：PR #13 已完成 PR4 第一批，本地化 `unmountGlobalLoading`，等待最终 review 与合并
- 当前改动：`apps/web-ele/src/main.ts` 改为导入 `src/shared/utils/loading.ts`；根 `src/main.ts` 继续转发应用入口；新增 DOM 单测
- 下一步：合并 PR #13 后同步唯一功能分支到最新 main，再梳理下一个最小运行时本地化单元
- 未完成验证：需要本地运行 `pnpm dev` 和 `pnpm dev:ele`，检查登录、菜单、标签页、权限、全局 Loading 和 Element Plus 页面
- 硬性约束：不提前升级依赖；不引入 TanStack Form；不重写旧表单；不改变业务行为；不删除尚被引用的 workspace 包；每次 PR 合并前更新执行进度和本交接内容

### PR1：冻结 Vben 5.5.9 基线

分支：

```text
chore/vben-559-baseline
```

内容：

- 从 `v5.5.9` 建立项目基线
- 保留 `apps/web-ele`
- 记录原始构建结果
- 记录登录、权限、菜单、标签页、表单和表格行为
- 不升级依赖
- 不修改业务功能

验证：

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm check:type
pnpm test:unit
pnpm build:ele
```

存在原始失败时，必须如实记录。

---

### PR2：收敛目标依赖图

分支：

```text
refactor/target-dependency-scope
```

内容：

- 确定最终单仓需要迁移的 `@vben/*` 模块
- 标记将删除的 apps、docs、playground 和 internal 工具
- 输出最终保留依赖清单
- 删除根目录中其他 UI 应用的运行脚本
- 暂时不升级版本

目标是避免对即将删除的几百项依赖进行无意义升级。

---

### PR3：建立单仓运行入口

分支：

```text
refactor/single-app-entry
```

内容：

- 将 `apps/web-ele` 提升为根应用
- 建立根 `src`
- 建立根 `vite.config.ts`
- 建立根 `tsconfig.json`
- 建立单应用 `package.json`
- 暂时沿用 5.5.9 已验证版本
- 通过本地 Alias 保持 `@vben/*` 导入兼容
- 不重写业务逻辑

验收：

```bash
pnpm dev
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

---

### PR4：迁入 Vben 必要源码

分支：

```text
refactor/localize-vben-runtime
```

迁入：

```text
access
auth
request
stores
preferences
layouts
locales
styles
icons
common-ui 中实际使用的部分
```

迁入位置：

```text
src/core
src/layouts
src/stores
src/components
src/shared
```

要求：

- 只迁移实际依赖
- 不进行大重构
- 不改变现有行为
- 不提前重写表单
- 不提前引入 TanStack Form

完成后去除运行时 `workspace:*`。

---

### PR5：升级运行环境和包管理器

分支：

```text
chore/upgrade-runtime-toolchain
```

内容：

- Node.js 切换至最新 LTS
- pnpm 升级至最新稳定版
- 更新 `engines`
- 更新 `packageManager`
- 更新 CI Node 和 pnpm 版本
- 重新生成锁文件
- 删除 5.5.9 针对旧 pnpm 的配置

验证：

```bash
node --version
pnpm --version
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

---

### PR6：升级 Vue 构建核心

分支：

```text
chore/upgrade-vue-build-stack
```

升级：

```text
vue
@vue/compiler-sfc
vite
@vitejs/plugin-vue
@vitejs/plugin-vue-jsx
typescript
vue-tsc
```

这是一个独立阻塞阶段，因为包括 Vite 6 → 8、TypeScript 5 → 7 等主版本升级。

必须处理：

- Vite 配置 API 变化
- 插件兼容性
- TypeScript 新诊断
- Vue SFC 类型错误
- 动态导入
- 环境变量类型
- 路径 Alias
- 构建产物
- Worker 和静态资源引用

禁止把 lint 问题通过全局关闭规则掩盖。

---

### PR7：升级 Vue 应用生态

分支：

```text
chore/upgrade-vue-ecosystem
```

升级：

```text
vue-router
pinia
pinia-plugin-persistedstate
vue-i18n
@vueuse/core
dayjs
@iconify/vue
```

重点处理：

- Vue Router 4 → 5
- Pinia 3 → 4
- 路由类型
- 路由守卫
- 动态路由
- KeepAlive
- 标签页
- Store 插件
- 持久化数据迁移
- 国际化类型

验收必须覆盖：

```text
登录
退出
刷新恢复
动态菜单
路由权限
按钮权限
标签页
KeepAlive
404
深色模式
```

---

### PR8：升级 Element Plus

分支：

```text
chore/upgrade-element-plus
```

内容：

- Element Plus 升级至最新稳定版
- 升级或移除 `unplugin-element-plus`
- 检查组件 Props、事件和插槽变化
- 检查 Dialog、Drawer、Table、Upload 和 DatePicker
- 保持旧 Vben Form 暂时可运行
- 不在该 PR 引入 TanStack Form

验收至少覆盖：

```text
Input
Select
TreeSelect
Cascader
DatePicker
Upload
Dialog
Drawer
Table
Pagination
Message
Notification
Loading
Dark Mode
```

---

### PR9：升级 Tailwind CSS 4

分支：

```text
chore/upgrade-tailwind-v4
```

内容：

- Tailwind CSS 3 → 4
- 使用 `@tailwindcss/vite`
- 删除旧 PostCSS/Tailwind 配置中不再需要的内容
- 迁移旧主题配置
- 对接 Element Plus CSS Variables
- 检查暗色模式
- 检查动态 class
- 检查 Vben 原有 utility class

验证：

- 页面布局不丢失
- 生产构建 class 不缺失
- 暗色模式正常
- Element Plus 样式无冲突
- 移动端布局正常

---

### PR10：升级请求、校验和数据依赖

分支：

```text
chore/upgrade-data-stack
```

升级：

```text
axios
zod
@tanstack/vue-query
```

重点处理：

- Zod 3 → 4
- Axios 类型和拦截器
- Query Options 类型
- Query Key 类型
- Mutation 回调
- 缓存配置
- 错误类型
- AbortSignal

此阶段只升级现有 TanStack Query，不迁移业务页面。

---

### PR11：引入最新 TanStack Form

分支：

```text
feat/tanstack-form-foundation
```

引入：

```text
@tanstack/vue-form
```

建立：

```text
FormRoot
FormField
FormLabel
FormControl
FormDescription
FormMessage
FormActions
useAppForm
服务端错误回填
首个错误滚动和聚焦
```

约束：

- 不使用 `ElForm`
- 不使用 `ElFormItem`
- 不使用 Element Plus rules
- Element Plus 控件只负责输入
- TanStack Form 是唯一表单状态源
- Zod 4 是统一 Schema
- Tailwind CSS 4 负责布局

---

### PR12：建立字段适配与 Schema Form

分支：

```text
feat/tanstack-schema-form
```

字段：

```text
Input
Textarea
InputNumber
Select
TreeSelect
Cascader
Switch
Checkbox
Radio
DatePicker
DateRange
TimePicker
Upload
ApiSelect
ApiTreeSelect
ApiCascader
```

保留：

- 字段联动
- 数组字段
- 动态显隐
- 动态禁用
- 动态 Props
- 服务端错误
- 异步校验
- Tailwind 响应式布局
- 字段跨列
- 容器查询

---

### PR13：升级测试和质量工具

分支：

```text
chore/upgrade-quality-tooling
```

升级：

```text
vitest
@vue/test-utils
happy-dom
@playwright/test
eslint
eslint-plugin-vue
oxlint
oxfmt
stylelint
lefthook
commitlint
knip
```

要求：

- 不通过关闭大量规则适配新版 lint
- 先修代码，再调整确有问题的规则
- Playwright 浏览器版本与包版本同步
- CI 使用同一份锁文件
- lint、typecheck、test、build 分开执行

---

### PR14 以后：按业务模块迁移

每个 PR 只迁移一个业务模块：

```text
用户管理
角色管理
部门管理
菜单管理
登录相关
其他业务模块
```

每个模块同步完成：

- TanStack Query
- TanStack Form
- Zod
- Tailwind 布局
- Element Plus 输入控件
- 删除旧 Vben Form
- 删除旧请求状态
- 补测试

---

### 最终 PR：删除 Monorepo 遗留

前置条件：

- 没有 `workspace:*`
- 没有运行时 `@vben/*`
- 没有旧 Vben Form
- 没有 `ElForm`
- 没有 `ElFormItem`
- 所有最终依赖已是实施当天最新稳定版
- CI 全部通过

删除：

```text
apps
packages
internal
docs
playground
scripts/vsh
scripts/turbo-run
pnpm-workspace.yaml
turbo.json
Changesets
多组件库依赖
旧配置包
```

---

## 六、版本升级阻塞原则

如果最新依赖出现兼容问题：

1. 不允许静默降级到旧版本。
2. 不允许用 `skipLibCheck` 掩盖项目自身类型错误。
3. 不允许大范围关闭 ESLint 或 TypeScript 规则。
4. 优先修复项目代码。
5. 无法兼容的废弃依赖应删除或替换。
6. 上游明确尚未支持时，该问题作为阻塞项记录。
7. CI 未通过不能建议合并。
8. 不允许把多个主版本升级和业务重构混在同一个 PR。

---

## 七、最终依赖验收

最终执行：

```bash
pnpm outdated
pnpm exec taze
pnpm exec knip
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
```

验收要求：

- `pnpm outdated` 没有最终直接依赖落后
- 不存在 alpha、beta、rc、canary、next
- 没有无用直接依赖
- 没有重复依赖版本
- 没有不必要的 overrides
- 没有 `workspace:*`
- 锁文件与 `package.json` 一致
- Node 和 pnpm 版本与 CI 一致
- 所有质量检查通过

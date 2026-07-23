# 运行时源码本地化记录

本文件记录 PR4 期间的实际运行时依赖梳理与迁移边界。

当前阶段只迁移根应用直接使用、依赖范围清晰且可独立验证的基础能力；不升级依赖、不重写表单、不改变业务行为。

## 第一批：全局 Loading 工具

### 迁移内容

- 将 `unmountGlobalLoading` 迁入 `src/shared/utils/loading.ts`。
- `apps/web-ele/src/main.ts` 保留原有偏好初始化、动态 bootstrap 和挂载顺序，只把 Loading 工具导入切换到根本地源码。
- 根 `src/main.ts` 继续转发 `apps/web-ele/src/main.ts`，避免根包直接导入尚未声明的 workspace 依赖。
- `pnpm dev` 与迁移期 `pnpm dev:ele` 使用同一份本地 Loading 工具，便于行为对照。

### 行为约束

- 命名空间计算规则保持不变。
- 偏好设置初始化顺序保持不变。
- 应用挂载完成后再移除全局 Loading。
- Loading 节点仍通过添加 `hidden` 类并等待 `transitionend` 后移除。
- 同时移除所有 `data-app-loading` 以 `inject` 开头的注入节点。

### 验证

- 新增 DOM 单元测试，覆盖 Loading 不存在和过渡结束后清理两种场景。
- CI run `29971494647` 的 install、lint、根 typecheck、unit test 和根 build 全部通过。
- `pnpm dev` 与 `pnpm dev:ele` 的浏览器冒烟验证尚未执行。

## 第二批：偏好覆盖定义 helper

### 迁移内容

- 将 `defineOverridesPreferences` 迁入 `src/app/preferences/define-overrides.ts`。
- `apps/web-ele/src/preferences.ts` 不再运行时导入该 workspace helper。
- 应用侧继续通过 `Preferences` 和 `DeepPartial` 类型约束偏好覆盖对象，不迁移偏好管理器、缓存或持久化逻辑。

### 行为约束

- helper 继续原样返回传入的偏好覆盖对象。
- 偏好对象结构、应用名称来源和初始化调用保持不变。
- 本批次只移除一个运行时 helper 导入；`initPreferences` 仍由现有 workspace 包提供。
- `@vben/preferences` 包仍被应用启动流程使用，本批次不删除该依赖或任何 workspace 源码。

### 验证

- 新增单元测试，确认 helper 返回原始对象引用。
- CI run `29972414334` 的 install、lint、根 typecheck、unit test 和根 build 全部通过。
- `pnpm dev` 与 `pnpm dev:ele` 的浏览器冒烟验证尚未执行。

## 第三批：静态路由重置工具

### 迁移内容

- 将 `resetStaticRoutes` 迁入 `src/router/reset-routes.ts`。
- 将该工具实际需要的静态路由名称递归收集逻辑收敛到同一文件，不迁移整个通用树工具模块。
- `apps/web-ele/src/router/index.ts` 不再运行时导入 `@vben/utils` 中的路由重置函数。

### 行为约束

- 静态路由及其嵌套子路由按照 `name` 形成保留名单。
- 未指定 `name` 的静态路由继续输出相同警告。
- 只删除已注册、具有名称且不在静态保留名单中的路由。
- 路由 history、scroll behavior、守卫和导出接口保持不变。
- `@vben/utils` 仍被其他模块使用，本批次不删除该依赖或对应 workspace 源码。

### 验证

- 新增单元测试，覆盖嵌套静态路由保留、动态路由删除和未命名路由警告。
- CI run `29973662522` 的 install、lint、根 typecheck、unit test 和根 build 全部通过。
- `pnpm dev` 与 `pnpm dev:ele` 的浏览器冒烟验证尚未执行。

## 第四批：登录路由常量

### 迁移内容

- 将 `LOGIN_PATH` 迁入 `src/router/constants.ts`。
- 已确认并替换目标应用中的三处直接引用：路由守卫、核心路由和认证 Store。
- 只迁移目标应用直接使用的登录路径，不迁移语言选项或整个常量包。

### 行为约束

- 登录路径继续保持为 `/auth/login`。
- 未登录拦截、已登录访问登录页的重定向、认证路由默认跳转和退出登录跳转逻辑保持不变。
- `@vben/constants` 仍可能被其他模块使用，本批次不删除该依赖或对应 workspace 源码。

### 验证

- 新增单元测试，固定 `/auth/login` 路由契约。
- CI run `29974533077` 的 install、lint、根 typecheck、unit test 和根 build 全部通过。
- `pnpm dev` 与 `pnpm dev:ele` 的浏览器冒烟验证尚未执行。

## 第五批：路由模块聚合工具

### 迁移内容

- 将 `mergeRouteModules` 和核心路由名称收集逻辑迁入 `src/router/route-modules.ts`。
- `apps/web-ele/src/router/routes/index.ts` 不再为这两项能力运行时导入 `@vben/utils`。
- 仅迁移路由模块聚合与名称收集，不迁移通用树过滤、映射或其他工具。

### 行为约束

- `import.meta.glob` 的加载模式和路由模块默认导出约定保持不变。
- 缺少默认导出的模块继续按空路由数组处理。
- 核心路由及嵌套子路由只收集有效的 `name`。
- 根工具使用结构类型，不为根包新增未声明的 `vue-router` 依赖。
- 动态路由、静态路由、外部路由和最终导出接口保持不变。
- `@vben/utils` 仍被其他模块使用，本批次不删除该依赖或对应 workspace 源码。

### 验证

- 新增单元测试，覆盖多模块合并、空模块忽略和嵌套路由名称收集。
- CI run `29976074463` 的 install、lint、根 typecheck、unit test 和根 build 全部通过。
- `pnpm dev` 与 `pnpm dev:ele` 的浏览器冒烟验证尚未执行。

## 第六批：API 地址解析

### 迁移内容

- 将请求层实际使用的 API 地址解析迁入 `src/app/config/resolve-api-url.ts`。
- `apps/web-ele/src/api/request.ts` 不再为 `apiURL` 运行时导入 `useAppConfig`。
- 仅迁移 API 地址读取，不复制钉钉认证等请求层未使用的应用配置。

### 行为约束

- 开发环境继续从 `import.meta.env.VITE_GLOB_API_URL` 读取 API 地址。
- 生产环境继续从 `window._VBEN_ADMIN_PRO_APP_CONF_.VITE_GLOB_API_URL` 读取注入配置。
- 直接复用仓库已有的全局 `Window` 配置声明，不重复覆盖全局类型。
- 不增加空字符串或默认地址兜底，避免掩盖缺失配置，保持原有失败行为。
- RequestClient、请求拦截器、Token 刷新、重新认证和错误提示逻辑保持不变。
- `@vben/hooks` 仍被其他模块使用，本批次不删除该依赖或对应 workspace 源码。

### 验证

- 新增单元测试，覆盖开发环境变量和生产全局注入配置两条路径。
- CI run `29977252094` 的 install、lint、根 typecheck、unit test 和根 build 全部通过。
- `pnpm dev` 与 `pnpm dev:ele` 的浏览器冒烟验证尚未执行。

## 第七批：语言目录聚合工具

### 迁移内容

- 将 `loadLocalesMapFromDir` 迁入 `src/locales/load-locales-map-from-dir.ts`。
- `apps/web-ele/src/locales/index.ts` 不再为目录聚合能力运行时导入 `@vben/locales`。
- 仅迁移应用语言文件聚合，不迁移 `$t`、I18n 实例、语言切换或第三方组件语言加载。

### 行为约束

- `import.meta.glob('./langs/**/*.json')` 和现有目录正则保持不变。
- 同一语言目录下的 JSON 文件继续按文件名聚合到 `default` 消息对象。
- 不匹配目录规则的文件继续忽略。
- Day.js、Element Plus 语言包加载和默认语言来源保持不变。
- `@vben/locales` 仍提供 `$t`、类型和 I18n 初始化，本批次不删除该依赖或对应 workspace 源码。

### 验证

- 新增单元测试，覆盖多文件聚合、异步默认导出加载和不匹配文件忽略。
- 完整 lint、typecheck、unit test 和 root build 结果在本 PR 最终验证时记录。

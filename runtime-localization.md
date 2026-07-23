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

- `import.meta.glob('./langs/**/*.json')` 的加载模式和路由模块默认导出约定保持不变。
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
- 根 helper 使用结构化异步导入类型，不为根包新增 `vue-i18n` 依赖。
- 返回类型继续匹配现有 `ImportLocaleFn` 的 `Record<string, string>` 契约。
- Day.js、Element Plus 语言包加载和默认语言来源保持不变。
- `@vben/locales` 仍提供 `$t`、类型和 I18n 初始化，本批次不删除该依赖或对应 workspace 源码。

### 验证

- 新增单元测试，覆盖多文件聚合、异步默认导出加载和不匹配文件忽略。
- CI run `29981980920` 的 install、lint、根 typecheck、unit test 和根 build 全部通过。
- `pnpm dev` 与 `pnpm dev:ele` 的浏览器冒烟验证尚未执行。

## 第八批：权限指令

### 迁移内容

- 将角色/权限码判断迁入 `src/access/check-directive-access.ts`。
- 将 `v-access` 注册迁入 `apps/web-ele/src/access/directive.ts`。
- `apps/web-ele/src/bootstrap.ts` 不再为权限指令运行时导入 `@vben/access`。

### 行为约束

- 前端访问模式且参数为 `role` 时继续使用用户角色判断。
- 其他模式和参数继续使用权限码判断。
- 单个字符串和字符串数组继续采用“任一匹配即可访问”的语义。
- 未提供指令值时继续保留元素；无权限时继续直接移除元素。
- 权限 Store、偏好、权限组件、路由权限和动态菜单保持不变。
- `@vben/access` 仍被其他模块使用，本批次不删除该依赖或对应 workspace 源码。

### 验证

- 新增单元测试，覆盖角色模式、权限码模式、拒绝访问和空指令值。
- CI run `29983662138` 的 install、lint、根 typecheck、unit test 和根 build 全部通过。
- `pnpm dev` 与 `pnpm dev:ele` 的浏览器冒烟验证尚未执行。

## 第九批：Bearer Token 格式化

### 迁移内容

- 将 Token 格式化迁入 `src/core/request/format-bearer-token.ts`。
- 请求 Authorization 头和刷新 Token 认证统一使用本地 helper。
- 移除 `apps/web-ele/src/api/request.ts` 内部重复的 `formatToken` 定义。

### 行为约束

- 非空 Token 继续格式化为 `Bearer <token>`。
- `null` 和空字符串继续返回 `null`。
- RequestClient、请求/响应拦截器、Token 刷新、重新认证和错误提示保持不变。
- 本批次不修改 `@vben/request` 或认证 Store，也不删除任何 workspace 包。

### 验证

- 新增单元测试，覆盖普通 Token、`null`、空字符串和原始内容保留。
- CI run `29984951947` 的 install、lint、根 typecheck、unit test 和根 build 全部通过。
- `pnpm dev` 与 `pnpm dev:ele` 的浏览器冒烟验证尚未执行。

## 第十批：访问路由编排

### 迁移内容

- 将 `generateAccessible` 迁入 `apps/web-ele/src/access/generate-accessible.ts`。
- `apps/web-ele/src/router/access.ts` 不再为访问路由编排运行时导入 `@vben/access`。
- 继续复用 `@vben/utils` 中现有前端路由、后端路由和菜单生成算法，本批次不迁移算法本体。

### 行为约束

- `backend`、`frontend` 和 `mixed` 三种访问模式的生成顺序保持不变。
- 根布局下的动态路由添加、同名一级路由替换和根路由重新注册保持不变。
- 子路由自动 redirect、keep-alive 组件命名和菜单生成保持不变。
- 权限 Store、偏好、认证、路由定义和菜单数据接口保持不变。
- `@vben/access` 与 `@vben/utils` 仍被其他模块使用，本批次不删除相关 workspace 源码。

### 验证

- 新增单元测试，覆盖后端路由挂载、`noBasicLayout` 直接注册、同名路由替换、混合模式顺序、角色传递和 redirect 归一化。
- CI run `29988534717` 的 install、lint、根 typecheck、unit test 和根 build 全部通过。
- `pnpm dev` 与 `pnpm dev:ele` 的浏览器冒烟验证尚未执行。

## 第十一批：前端路由生成

### 迁移内容

- 将 `generateRoutesByFrontend` 与 `hasAuthority` 迁入 `apps/web-ele/src/access/generate-routes-frontend.ts`。
- `apps/web-ele/src/access/generate-accessible.ts` 的 `frontend` 与 `mixed` 模式改为调用本地前端路由生成函数。
- 后端路由生成、菜单生成和访问路由编排继续复用现有实现，不在本批次扩大迁移范围。

### 行为约束

- 未声明 `authority` 的路由继续直接保留。
- 声明多个角色时继续采用任一角色匹配即可访问的语义。
- 有权限的父路由继续递归过滤无权限子路由，并保持原始顺序。
- `menuVisibleWithForbidden` 为 true 的无权限路由继续保留，并在提供禁止访问组件时替换为该组件。
- 后端路由生成、菜单生成、权限 Store、认证、路由定义和业务行为保持不变。
- 本批次不升级依赖、不修改锁文件，也不删除仍被引用的 workspace 包。

### 验证

- 新增单元测试，覆盖嵌套路由过滤、公开路由、任一角色匹配、禁止访问菜单保留和组件替换。
- 更新访问路由编排测试，使其验证本地前端路由生成模块的调用与混合模式顺序。
- CI 尚未在当前最终提交上完成；`pnpm dev` 与 `pnpm dev:ele` 浏览器冒烟验证尚未执行。

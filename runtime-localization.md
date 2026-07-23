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

# 运行时源码本地化记录

本文件记录 PR4 期间的实际运行时依赖梳理与迁移边界。

当前阶段只迁移根应用直接使用、依赖范围清晰且可独立验证的基础能力；不升级依赖、不重写表单、不改变业务行为。

## 第一批：根启动与全局 Loading

### 迁移内容

- 根 `src/main.ts` 不再只转发 `apps/web-ele/src/main.ts`，改为在根入口执行原有偏好初始化、应用启动和 Loading 清理流程。
- 将 `unmountGlobalLoading` 迁入 `src/shared/utils/loading.ts`。
- 根入口继续复用 `apps/web-ele/src/bootstrap.ts` 和 `apps/web-ele/src/preferences.ts`，避免在同一批次扩大迁移范围。
- 保留 `apps/web-ele/src/main.ts`，确保迁移期 `pnpm dev:ele` 仍可作为行为对照。

### 行为约束

- 命名空间计算规则保持不变。
- 偏好设置初始化顺序保持不变。
- 应用挂载完成后再移除全局 Loading。
- Loading 节点仍通过添加 `hidden` 类并等待 `transitionend` 后移除。
- 同时移除所有 `data-app-loading` 以 `inject` 开头的注入节点。

### 验证

- 新增 DOM 单元测试，覆盖 Loading 不存在和过渡结束后清理两种场景。
- 完整 lint、typecheck、unit test 和 root build 结果在 PR 最终验证时记录。

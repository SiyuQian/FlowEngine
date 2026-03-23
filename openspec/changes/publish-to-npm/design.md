## Context

flow-engine 目前只能通过 `npx github:SiyuQian/FlowEngine` 使用，依赖 GitHub repo 名的大小写匹配，且要求用户预先全局安装 openspec CLI。发布到 npm 可以简化安装体验。

当前 `package.json`:
- `name: "flow-engine"` — 在 npm 上已被占用
- `dependencies` 中不包含 openspec
- 无 `files` 字段，发布时会包含不必要的源码

## Goals / Non-Goals

**Goals:**
- 用户可以通过 `npx @siyuqian/flow-engine init` 一步完成初始化
- 不再需要全局安装 openspec
- 发布包只包含必要文件（dist/）

**Non-Goals:**
- 不迁移到 unscoped 包名
- 不改变 CLI 命令接口（仍然是 `flow init`）
- 不搭建 CI/CD 自动发布流程

## Decisions

### 1. 使用 scoped 包名 `@siyuqian/flow-engine`

**选择**: `@siyuqian/flow-engine`
**替代方案**: `opsx-flow`（可用的 unscoped 名）
**理由**: scoped 名与 GitHub 用户名一致，不需要抢注名字，语义清晰

### 2. openspec 作为 dependency 而非全局依赖

**选择**: 添加 `@fission-ai/openspec` 到 `dependencies`
**替代方案**: 保持全局安装要求，在文档中说明
**理由**: npx 执行时会自动安装 dependencies，其 bin 会加入 PATH，`execFileSync('openspec', ...)` 调用无需改动。移除 `isOpenSpecInstalled()` 检查即可。

### 3. 使用 `files` 字段控制发布内容

**选择**: `"files": ["dist"]`
**替代方案**: `.npmignore` 文件
**理由**: `files` 是白名单机制，更安全，不会意外发布源码或测试文件

## Risks / Trade-offs

- **openspec 版本锁定** → 使用 `^` semver range，跟随 minor 更新
- **scoped 包名较长** → `npx @siyuqian/flow-engine init` 比理想的短名长，但语义明确，可接受

## Why

用户无法通过 `npx github:SiyuQian/FlowEngine init` 正常使用 flow-engine，因为 GitHub repo 名（FlowEngine）与 npm package name（flow-engine）不一致，大小写敏感导致 clone 失败且没有明确报错。发布到 npm registry 可以让用户直接 `npx @siyuqian/flow-engine init`，体验更干净。

同时，当前要求用户全局安装 openspec CLI 才能使用，增加了使用门槛。将 openspec 作为 dependency 内置可以消除这个前置要求。

## What Changes

- **BREAKING**: package name 从 `flow-engine` 改为 `@siyuqian/flow-engine`
- 添加 `@fission-ai/openspec` 到 `dependencies`，不再要求全局安装
- 移除 `isOpenSpecInstalled()` 检查逻辑（openspec 作为 dependency 始终存在）
- 添加 `files` 字段到 `package.json`，控制发布内容只包含 `dist/`
- 发布到 npm registry（scoped public package）

## Capabilities

### New Capabilities
- `npm-publish`: 配置 package.json 使其可发布到 npm，包括 scoped name、files 字段、access 设置

### Modified Capabilities
<!-- No existing specs to modify -->

## Impact

- `package.json` — name、files、dependencies 字段变更
- `src/utils/openspec.ts` — 移除 `isOpenSpecInstalled()` 函数
- `src/commands/init.ts` — 移除 openspec 安装检查
- `src/commands/proxy.ts` — 移除 openspec 安装检查
- 用户安装方式变更：`npx @siyuqian/flow-engine init`

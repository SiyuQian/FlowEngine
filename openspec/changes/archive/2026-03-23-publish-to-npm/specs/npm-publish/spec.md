## ADDED Requirements

### Requirement: Package is publishable to npm as scoped public package
The package SHALL be configured with name `@siyuqian/flow-engine` and SHALL only include `dist/` in the published tarball.

#### Scenario: Package name is correct
- **WHEN** running `npm pack --dry-run`
- **THEN** the tarball name starts with `siyuqian-flow-engine-`

#### Scenario: Published files are minimal
- **WHEN** running `npm pack --dry-run`
- **THEN** only files under `dist/` and `package.json` are included

### Requirement: openspec is bundled as dependency
The package SHALL include `@fission-ai/openspec` in `dependencies` so users do not need to install it separately.

#### Scenario: npx installs openspec automatically
- **WHEN** running `npx @siyuqian/flow-engine init` in a clean environment
- **THEN** the `openspec` binary is available in PATH during execution without prior global installation

### Requirement: No global openspec check
The CLI SHALL NOT check for global openspec installation. The `isOpenSpecInstalled()` function and all call sites SHALL be removed.

#### Scenario: init runs without global openspec
- **WHEN** openspec is not installed globally
- **AND** user runs `npx @siyuqian/flow-engine init`
- **THEN** initialization completes successfully

#### Scenario: proxy commands run without global openspec
- **WHEN** openspec is not installed globally
- **AND** user runs `npx @siyuqian/flow-engine list`
- **THEN** the command is proxied to the bundled openspec successfully

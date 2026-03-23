## 1. Package Configuration

- [x] 1.1 Update `package.json` name to `@siyuqian/flow-engine`
- [x] 1.2 Add `"files": ["dist"]` to `package.json`
- [x] 1.3 Add `@fission-ai/openspec` to `dependencies` in `package.json`

## 2. Remove Global OpenSpec Check

- [x] 2.1 Remove `isOpenSpecInstalled()` function from `src/utils/openspec.ts`
- [x] 2.2 Remove openspec install check from `src/commands/init.ts` (lines 23-27)
- [x] 2.3 Remove openspec install check from `src/commands/proxy.ts` (lines 8-12)
- [x] 2.4 Update imports in init.ts and proxy.ts to remove `isOpenSpecInstalled`

## 3. Verify & Publish

- [x] 3.1 Run `npm run build` to verify compilation
- [x] 3.2 Run `npm pack --dry-run` to verify published files are correct
- [x] 3.3 Run tests to ensure nothing is broken
- [ ] 3.4 Publish with `npm publish --access public`

#!/usr/bin/env node
/** 框架发布前的静态检查：只读维护源，不生成或读取任何个人导览状态。 */
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** 仅遍历发布文档，不扫描 .git 或目标项目，不需要额外依赖。 */
function markdownFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) return entry.name === 'references' ? markdownFiles(filename) : [];
    return entry.name.endsWith('.md') ? [filename] : [];
  });
}

try {
  const skill = readFileSync(path.join(root, 'SKILL.md'), 'utf8').replace(/\r\n/g, '\n');
  const frontmatter = skill.match(/^---\n([\s\S]*?)\n---\n/);
  assert.ok(frontmatter, 'SKILL.md 缺少完整 frontmatter。');
  assert.match(frontmatter[1], /^name: ai-dev-ops-framework$/m, 'skill 名称与发布目录约定不一致。');
  assert.match(frontmatter[1], /^description: .+$/m, 'skill 缺少有效描述。');
  const files = markdownFiles(root);
  let links = 0;
  for (const filename of files) {
    const content = readFileSync(filename, 'utf8');
    const relative = path.relative(root, filename);
    assert.equal((content.match(/^```/gm) || []).length % 2, 0, `${relative} 的代码块未配对。`);
    // 匹配每个 ](目标)，同时覆盖语言切换徽章的图片链接和外层文档链接。
    for (const match of content.matchAll(/\]\(([^)]+)\)/g)) {
      const target = match[1].split('#')[0].replace(/^<|>$/g, '');
      if (!target || /^[a-z][a-z0-9+.-]*:/i.test(target)) continue;
      assert.ok(existsSync(path.resolve(path.dirname(filename), decodeURIComponent(target))), `${relative} 引用不存在：${target}`);
      links++;
    }
  }
  assert.equal(readFileSync(path.join(root, 'CLAUDE.md'), 'utf8').trim(), '@AGENTS.md', 'Claude 项目入口必须引用统一维护规则。');
  console.log(`框架静态检查通过：${files.length} 份文档，${links} 个本地引用，skill 入口结构有效。`);
} catch (error) {
  const message = error.code && error.code !== 'ERR_ASSERTION'
    ? `读取框架文件失败（${error.code}），请检查文件及权限。` : error.message;
  console.error(`框架静态检查失败：${message}`);
  process.exitCode = 1;
}

/** 在临时副本注入文档错误，验证发布检查会失败并给出真实中文原因。 */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

test('断链和未闭合代码块阻止检查，错误不会误报为读取权限问题', t => {
  const temporary = mkdtempSync(path.join(tmpdir(), 'ai-framework-doc-test-'));
  t.after(() => {
    // 仅清理系统临时目录下本次创建的副本，禁止递归删除其他目标。
    assert.equal(path.dirname(path.resolve(temporary)), path.resolve(tmpdir()));
    assert.ok(path.basename(temporary).startsWith('ai-framework-doc-test-'));
    rmSync(temporary, { recursive: true, force: true });
  });
  const source = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  // 只复制发布源所需文件，不复制 .git、个人配置或目标项目内容。
  for (const name of ['SKILL.md', 'AGENTS.md', 'CLAUDE.md', 'README.md', 'README_EN.md', 'references', 'scripts', '.github']) {
    cpSync(path.join(source, name), path.join(temporary, name), { recursive: true });
  }
  const filename = path.join(temporary, 'README.md');
  const original = readFileSync(filename, 'utf8');
  for (const [broken, message] of [
    [`${original}\n[失效链接](missing-document.md)\n`, /引用不存在/],
    [`${original}\n\x60\x60\x60text\n未闭合代码块\n`, /代码块未配对/],
  ]) {
    writeFileSync(filename, broken);
    const result = spawnSync(process.execPath, [path.join(temporary, 'scripts/validate_framework.mjs')], { encoding: 'utf8' });
    assert.equal(result.status, 1, '损坏文档必须阻止发布检查');
    assert.match(result.stderr, message);
    assert.doesNotMatch(result.stderr, /读取框架文件失败/);
  }
});

/** 使用仓库外临时目录验证个人状态，绝不读写真实开发者的导览记录。 */
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir, userInfo } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { defaultStateRoot, executeAction, normalizeRemote, resolveContext } from './onboarding_state.mjs';

function fixture(t) {
  const temporary = mkdtempSync(path.join(tmpdir(), 'ai-onboarding-test-'));
  t.after(() => {
    // 清理前复核绝对路径，只允许删除本次在系统临时目录创建的测试目录。
    assert.equal(path.dirname(path.resolve(temporary)), path.resolve(tmpdir()));
    assert.ok(path.basename(temporary).startsWith('ai-onboarding-test-'));
    rmSync(temporary, { recursive: true, force: true });
  });
  const repo = path.join(temporary, 'project');
  mkdirSync(repo);
  execFileSync('git', ['init', '--quiet', repo]);
  execFileSync('git', ['-C', repo, 'remote', 'add', 'origin', 'https://example.com/team/project.git']);
  const options = { repo, tool: 'codex', developer: '测试开发者甲', stateRoot: path.join(temporary, 'local-state') };
  return { temporary, repo, options, context: resolveContext(options) };
}

test('首次查询不创建记录，只有明确确认后保存，独立进程和新上下文可复用', t => {
  const { context, options } = fixture(t);
  assert.equal(executeAction('check', context).status, 'MISSING');
  assert.throws(() => readFileSync(context.stateFile), { code: 'ENOENT' });
  assert.throws(() => executeAction('complete', context), /明确确认/);
  const completed = executeAction('complete', context, true);
  assert.equal(completed.status, 'COMPLETED');
  assert.equal(executeAction('check', resolveContext(options)).recordedAt, completed.recordedAt);
  const source = `import { resolveContext, executeAction } from ${JSON.stringify(new URL('./onboarding_state.mjs', import.meta.url).href)};
    console.log(JSON.stringify(executeAction('check', resolveContext(${JSON.stringify(options)}))));`;
  const child = JSON.parse(execFileSync(process.execPath, ['--input-type=module', '-e', source], { encoding: 'utf8' }));
  assert.equal(child.status, 'COMPLETED');
  assert.equal(child.stateFile, context.stateFile);
});

test('不同开发者、不同 AI 工具、不同项目分别首次导览', t => {
  const { context, options, repo } = fixture(t);
  executeAction('complete', context, true);
  for (const changed of [{ developer: '测试开发者乙' }, { tool: 'claude-code' }]) {
    assert.equal(executeAction('check', resolveContext({ ...options, ...changed })).status, 'MISSING');
  }
  execFileSync('git', ['-C', repo, 'remote', 'set-url', 'origin', 'https://example.com/team/other.git']);
  assert.equal(executeAction('check', resolveContext(options)).status, 'MISSING');
});

test('相同远程的另一克隆目录和 SSH 地址命中相同状态', t => {
  const { context, options, temporary } = fixture(t);
  executeAction('complete', context, true);
  const clone = path.join(temporary, 'other-checkout');
  mkdirSync(clone);
  execFileSync('git', ['init', '--quiet', clone]);
  execFileSync('git', ['-C', clone, 'remote', 'add', 'origin', 'git@example.com:team/project.git']);
  assert.equal(executeAction('check', resolveContext({ ...options, repo: clone })).status, 'COMPLETED');
  assert.equal(normalizeRemote('ssh://git@EXAMPLE.com:22/team/project.git', clone), context.projectId);
  assert.equal(normalizeRemote('https://user:password@example.com/team/project.git?token=secret', clone), context.projectId);
});

test('没有远程时按项目根路径复用，读取失败或身份不符不得误判为首次使用', t => {
  const { options, repo } = fixture(t);
  execFileSync('git', ['-C', repo, 'remote', 'remove', 'origin']);
  const context = resolveContext(options);
  assert.ok(context.projectId.startsWith('path:'));
  executeAction('complete', context, true);
  const child = path.join(repo, 'child');
  mkdirSync(child);
  assert.equal(resolveContext({ ...options, repo: child }).stateFile, context.stateFile);
  writeFileSync(context.stateFile, '{损坏记录');
  assert.throws(() => executeAction('check', context), /格式损坏/);
  assert.throws(() => executeAction('complete', context, true), /格式损坏/);
  executeAction('reset', context);
  const record = JSON.parse(readFileSync(context.stateFile, 'utf8'));
  record.tool = 'claude-code';
  writeFileSync(context.stateFile, JSON.stringify(record));
  assert.throws(() => executeAction('check', context), /身份不匹配/);
});

test('重新导览留下待确认记录，不会被旧完成状态覆盖；再次确认可恢复', t => {
  const { context, options } = fixture(t);
  executeAction('complete', context, true);
  assert.equal(executeAction('reset', context).status, 'REQUIRED');
  assert.equal(executeAction('check', resolveContext(options)).status, 'REQUIRED');
  assert.throws(() => executeAction('complete', context), /明确确认/);
  assert.equal(executeAction('complete', context, true).status, 'COMPLETED');
});

test('拒绝状态写入当前工作区或另一个 Git 仓库', t => {
  const { options, repo, temporary } = fixture(t);
  assert.throws(() => resolveContext({ ...options, stateRoot: path.join(repo, '.local-state') }), /仓库内/);
  const otherRepo = path.join(temporary, 'other-repository');
  mkdirSync(otherRepo);
  execFileSync('git', ['init', '--quiet', otherRepo]);
  assert.throws(() => resolveContext({ ...options, stateRoot: path.join(otherRepo, 'state') }), /仓库内/);
});

test('CLI 参数失败输出中文 ERROR，不能被调用方当成未导览', () => {
  const script = new URL('./onboarding_state.mjs', import.meta.url);
  const child = spawnSync(process.execPath, [fileURLToPath(script), 'check'], { encoding: 'utf8' });
  assert.equal(child.status, 20);
  const result = JSON.parse(child.stdout);
  assert.equal(result.status, 'ERROR');
  assert.match(result.message, /工具标识/);
});

test('会话临时目录变量变化不改变真实用户状态根目录', () => {
  const source = `import { defaultStateRoot } from ${JSON.stringify(new URL('./onboarding_state.mjs', import.meta.url).href)};
    console.log(defaultStateRoot());`;
  // 仅变更子进程的沙箱路径变量，不改当前进程或系统环境设置。
  const output = execFileSync(process.execPath, ['--input-type=module', '-e', source], {
    encoding: 'utf8', env: { ...process.env, LOCALAPPDATA: path.join(tmpdir(), 'another-session') },
  }).trim();
  assert.equal(output, defaultStateRoot());
  assert.equal(output, path.join(userInfo().homedir, '.ai-dev-ops', 'onboarding'));
});

test('文件系统读取失败不能返回缺失状态，多个远程无 origin 不猜测身份', t => {
  const { context, repo, options } = fixture(t);
  mkdirSync(context.stateFile, { recursive: true });
  assert.throws(() => executeAction('check', context), error => ['EISDIR', 'EACCES', 'EPERM'].includes(error.code));
  execFileSync('git', ['-C', repo, 'remote', 'rename', 'origin', 'first']);
  execFileSync('git', ['-C', repo, 'remote', 'add', 'second', 'https://example.com/team/second.git']);
  assert.throws(() => resolveContext(options), /无法唯一确定/);
});

test('真实 worktree 复用同项目状态', t => {
  const { context, repo, options, temporary } = fixture(t);
  executeAction('complete', context, true);
  execFileSync('git', ['-C', repo, '-c', 'user.name=测试用户', '-c', 'user.email=test@example.invalid',
    '-c', 'commit.gpgsign=false', 'commit', '--quiet', '--allow-empty', '-m', '初始化测试仓库']);
  const worktree = path.join(temporary, 'worktree');
  execFileSync('git', ['-C', repo, 'worktree', 'add', '--quiet', '--detach', worktree]);
  assert.equal(executeAction('check', resolveContext({ ...options, repo: worktree })).status, 'COMPLETED');
});

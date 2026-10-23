#!/usr/bin/env node
/**
 * 项目导览本地状态：按开发者、AI 工具和项目隔离，查询时不创建任何文件。
 * 只使用 Node.js 标准库；规则和脚本可提交，个人完成状态始终保存在仓库外。
 */
import { createHash, randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, realpathSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { userInfo } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const hash = value => createHash('sha256').update(value).digest('hex');

/** 沙箱可改写 HOME、LOCALAPPDATA；使用操作系统账号资料目录，避免会话临时路径导致重复导览。 */
export function defaultStateRoot() {
  return path.join(userInfo().homedir, '.ai-dev-ops', 'onboarding');
}

/** 只读取 Git 元数据，不联网、不修改 Git 配置；失败时不退化成“首次使用”。 */
function git(repo, args) {
  try {
    return execFileSync('git', ['-C', repo, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  } catch {
    throw new Error('读取项目 Git 标识失败，请检查 Git 是否可用及仓库访问权限。');
  }
}

/** 同时识别普通仓库与 worktree 的 .git 文件；无 Git 的目录仍可用绝对路径标识。 */
function findGitRoot(directory) {
  for (let current = directory; ; current = path.dirname(current)) {
    if (existsSync(path.join(current, '.git'))) return current;
    if (path.dirname(current) === current) return null;
  }
}

/**
 * 将同域名、同仓库路径的 HTTPS/SSH/scp 地址归一化，保留仓库路径大小写。
 * 用户名、密码、查询参数不进入状态；非标准端口和 SSH Host 别名不擅自合并。
 */
export function normalizeRemote(remote, repo) {
  if (path.isAbsolute(remote) || remote.startsWith('.') || remote.startsWith('file:')) {
    const localPath = remote.startsWith('file:') ? fileURLToPath(remote) : path.resolve(repo, remote);
    return `file:${path.normalize(localPath)}`;
  }
  const scp = remote.match(/^(?:[^@/]+@)?([^:/]+):(.+)$/);
  const address = !remote.includes('://') && scp ? `ssh://${scp[1]}/${scp[2]}` : remote;
  let url;
  try {
    url = new URL(address);
  } catch {
    throw new Error('无法识别项目远程地址，请核对远程仓库标识。');
  }
  if (!['https:', 'http:', 'ssh:', 'git:'].includes(url.protocol)) {
    throw new Error('项目远程地址协议不受支持，请核对远程仓库标识。');
  }
  const repository = url.pathname.replace(/\/+$/, '').replace(/\.git$/, '').replace(/^\/+/, '');
  if (!url.hostname || !repository) throw new Error('项目远程地址缺少域名或仓库路径。');
  const port = url.protocol === 'ssh:' && url.port === '22' ? '' : url.port;
  return `git:${url.hostname.toLowerCase()}${port ? `:${port}` : ''}/${repository}`;
}

/** 解析已有父目录的真实路径，防止经符号链接把状态落入仓库。 */
function canonicalPath(filename) {
  let current = path.resolve(filename);
  const missing = [];
  while (!existsSync(current)) {
    missing.unshift(path.basename(current));
    const parent = path.dirname(current);
    if (parent === current) throw new Error('无法定位本地状态目录的已有父目录。');
    current = parent;
  }
  return path.join(realpathSync(current), ...missing);
}

function inside(parent, child) {
  const relative = path.relative(parent, child);
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
}

/** 固定用户目录；测试可通过函数参数使用仓库外临时目录，命令行不开放目录覆盖。 */
export function resolveContext({ repo = '.', tool, developer, stateRoot } = {}) {
  if (!tool || !/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(tool)) {
    throw new Error('必须提供稳定的 AI 工具标识，例如 --tool codex 或 --tool claude-code。');
  }
  const developerId = (developer ?? process.env.AI_DEV_OPS_DEVELOPER_ID ?? userInfo().username).trim();
  if (!developerId) throw new Error('开发者标识不能为空；共用系统账号时请指定独立开发者标识。');
  const directory = realpathSync(path.resolve(repo));
  const gitRoot = findGitRoot(directory);
  const projectRoot = gitRoot ? realpathSync(git(gitRoot, ['rev-parse', '--show-toplevel'])) : directory;
  let projectId = `path:${projectRoot}`;
  if (gitRoot) {
    const remotes = git(projectRoot, ['remote']).split(/\r?\n/).filter(Boolean);
    const remoteName = remotes.includes('origin') ? 'origin' : remotes.length === 1 ? remotes[0] : null;
    if (remotes.length > 1 && !remoteName) throw new Error('项目存在多个远程且没有 origin，无法唯一确定项目身份。');
    if (remoteName) projectId = normalizeRemote(git(projectRoot, ['remote', 'get-url', remoteName]), projectRoot);
  }
  const root = stateRoot ?? defaultStateRoot();
  const stateFile = canonicalPath(path.join(root, hash(developerId), tool, `${hash(projectId)}.json`));
  if (inside(projectRoot, stateFile) || findGitRoot(path.dirname(stateFile))) {
    throw new Error('导览状态目录位于工作区或 Git 仓库内，已拒绝访问；请检查本地用户目录配置。');
  }
  return { developerId, tool, projectId, stateFile };
}

/** 文件缺失与文件损坏、权限错误必须分开处理，后两者不能误触发首次导览。 */
export function readState(context) {
  let record;
  try {
    record = JSON.parse(readFileSync(context.stateFile, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    if (error instanceof SyntaxError) throw new Error('本地导览状态格式损坏，请修复记录或明确要求重新导览。');
    throw error;
  }
  if (!record || record.schemaVersion !== 1 || !['COMPLETED', 'REQUIRED'].includes(record.status)
      || record.developerId !== context.developerId || record.tool !== context.tool
      || record.projectId !== context.projectId || typeof record.recordedAt !== 'string'
      || !Number.isFinite(Date.parse(record.recordedAt))) {
    throw new Error('本地导览记录与当前身份不匹配或内容无效，不能当作已完成或首次使用。');
  }
  return record;
}

/** 原子替换并回读确认，避免读到半写入文件；POSIX 系统新文件使用用户私有权限。 */
function saveState(context, status) {
  mkdirSync(path.dirname(context.stateFile), { recursive: true, mode: 0o700 });
  const temporary = `${context.stateFile}.${randomUUID()}.tmp`;
  const record = { schemaVersion: 1, status, developerId: context.developerId, tool: context.tool,
    projectId: context.projectId, recordedAt: new Date().toISOString() };
  try {
    writeFileSync(temporary, `${JSON.stringify(record, null, 2)}\n`, { flag: 'wx', mode: 0o600 });
    renameSync(temporary, context.stateFile);
  } finally {
    rmSync(temporary, { force: true });
  }
  const saved = readState(context);
  if (JSON.stringify(saved) !== JSON.stringify(record)) throw new Error('导览状态保存后校验失败，请重新查询本地记录。');
  return saved;
}

export function executeAction(action, context, confirmed = false) {
  if (!['check', 'complete', 'reset'].includes(action)) throw new Error('操作必须为 check、complete 或 reset。');
  if (action === 'complete' && !confirmed) throw new Error('登记完成状态需要 --confirmed，且必须已有开发者明确确认的事实。');
  // reset 保留“待导览”记录，防止后续会话用旧记忆再次迁移成已完成。
  const record = action === 'reset' ? saveState(context, 'REQUIRED') : readState(context);
  const saved = action === 'complete' && record?.status !== 'COMPLETED' ? saveState(context, 'COMPLETED') : record;
  const status = saved?.status ?? 'MISSING';
  return { status, message: status === 'COMPLETED' ? '当前开发者和 AI 工具已完成本项目导览，无需重复确认。'
    : status === 'REQUIRED' ? '当前开发者已要求重新导览，请展示导览并等待确认。' : '当前开发者和 AI 工具尚无本项目导览记录。',
  ...context, ...(saved ? { recordedAt: saved.recordedAt } : {}) };
}

/** 所有命令输出一份 JSON，调用方按 status 分流，不能把非零退出码一律解释为首次使用。 */
function main() {
  try {
    const { values, positionals } = parseArgs({ allowPositionals: true, options: {
      repo: { type: 'string', default: '.' }, tool: { type: 'string' }, developer: { type: 'string' },
      confirmed: { type: 'boolean', default: false }, help: { type: 'boolean', default: false },
    } });
    if (values.help) {
      console.log('用法：node onboarding_state.mjs <check|complete|reset> --tool <工具标识> [--repo <项目目录>] [--developer <开发者标识>] [--confirmed]\ncomplete 仅限开发者明确确认后使用；check 不写文件；reset 仅在开发者要求重新导览时使用。');
      return;
    }
    if (positionals.length !== 1) throw new Error('请提供一个操作：check、complete 或 reset。');
    const result = executeAction(positionals[0], resolveContext(values), values.confirmed);
    console.log(JSON.stringify(result));
    process.exitCode = result.status === 'COMPLETED' ? 0 : 10;
  } catch (error) {
    const message = error.code ? `访问本地导览状态或解析参数失败（${error.code}），请检查命令参数、目录及访问权限。` : error.message;
    console.log(JSON.stringify({ status: 'ERROR', message }));
    process.exitCode = 20;
  }
}

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) main();

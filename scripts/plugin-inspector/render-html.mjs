export function renderHtml(report) {
  // Escape raw-text script delimiters, not only HTML metacharacters. Repository
  // text is subsequently inserted through textContent, never as HTML or URLs.
  const data = JSON.stringify(report).replace(/[<>&\u2028\u2029]/g, (character) =>
    `\\u${character.charCodeAt(0).toString(16).padStart(4, '0')}`);
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'">
<title>插件仓库 · 静态体检</title>
<style>
:root{color-scheme:light;--ink:#17252b;--muted:#60747b;--line:#dce6e5;--paper:#fff;--green:#136457;--soft:#edf6f3;--amber:#8b590c;--red:#ab3844;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
*{box-sizing:border-box}body{margin:0;background:#f3f6f5;color:var(--ink);font-size:14px;line-height:1.6}button,input,select{font:inherit}button{cursor:pointer}a{color:var(--green)}
:focus-visible{outline:3px solid #268c87;outline-offset:3px}button,input,select{border:1px solid #c9d8d6;border-radius:8px;background:white;color:var(--ink)}button{padding:9px 14px}button:hover{background:var(--soft)}
.skip{position:absolute;top:-80px;left:16px;background:white;padding:12px;z-index:2}.skip:focus{top:12px}.shell{max-width:1500px;margin:auto;padding:34px 32px 50px}
header{display:flex;align-items:flex-start;justify-content:space-between;gap:24px;margin-bottom:22px}.eyebrow{font-size:11px;letter-spacing:.14em;color:var(--green);font-weight:750}h1{font-size:30px;letter-spacing:-.04em;margin:5px 0 7px;line-height:1.3}h2{font-size:18px;margin:0 0 14px}h3{font-size:14px;margin:23px 0 9px}p{margin:7px 0}.muted,.subtitle{color:var(--muted)}.subtitle{margin:0;max-width:75ch}.download{white-space:nowrap;background:var(--ink);color:white;border-color:var(--ink);margin-top:10px}.download:hover{background:#28443f}
.meta{display:flex;gap:8px 22px;flex-wrap:wrap;color:var(--muted);font-size:12px;margin-bottom:22px}.meta span{overflow-wrap:anywhere}.stats{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:12px;margin-bottom:24px}.stat{border:1px solid var(--line);border-radius:12px;background:var(--paper);padding:15px 17px}.stat strong{display:block;font-size:27px;font-variant-numeric:tabular-nums;line-height:1.3}.stat span{font-size:12px;color:var(--muted)}.stat.error strong{color:var(--red)}.stat.warning strong{color:var(--amber)}
.panel{background:var(--paper);border:1px solid var(--line);border-radius:14px;padding:22px;margin-bottom:22px}.toolbar{display:grid;grid-template-columns:minmax(200px,1fr) 145px 145px auto;gap:12px;align-items:end}.field{display:flex;flex-direction:column;gap:6px}.field label{font-size:12px;font-weight:650;color:var(--muted)}input,select{width:100%;height:42px;padding:8px 11px}input::placeholder{color:#7c8c91}.filter-note{display:flex;justify-content:space-between;flex-wrap:wrap;gap:10px;margin:16px 0 12px;font-size:12px;color:var(--muted)}
.inventory{display:grid;grid-template-columns:minmax(230px,330px) minmax(0,1fr);gap:20px;align-items:start}.plugin-list{list-style:none;padding:0;margin:0;display:grid;gap:8px;max-height:760px;overflow:auto;padding:3px}.plugin{width:100%;display:block;text-align:left;padding:12px 14px;border-color:var(--line);border-radius:10px}.plugin[aria-pressed=true]{background:var(--soft);border-color:#66a294;box-shadow:inset 3px 0 var(--green)}.plugin-title{display:flex;align-items:center;justify-content:space-between;gap:8px}.plugin-name{font-weight:650;overflow-wrap:anywhere;min-width:0}.plugin-subtitle{display:block;color:var(--muted);font-size:12px;margin-top:3px;overflow-wrap:anywhere}.detail{border:1px solid var(--line);border-radius:10px;padding:20px;min-width:0;min-height:260px}.detail h2{overflow-wrap:anywhere;margin-bottom:3px}.badges{display:flex;flex-wrap:wrap;gap:6px;margin:12px 0}.badge{display:inline-block;font-size:11px;line-height:1.5;border-radius:5px;padding:3px 7px;background:#edf1f2;color:#49616a;font-weight:600}.badge.ok{background:#e7f3ed;color:var(--green)}.badge.error{background:#fbecef;color:var(--red)}.badge.warning{background:#fff3db;color:var(--amber)}.badge.info{background:#eaf1fb;color:#365c92}
.facts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px 20px;margin:18px 0}.facts div{min-width:0}.facts dt{color:var(--muted);font-size:12px}.facts dd{margin:2px 0 0;overflow-wrap:anywhere}.finding{border:1px solid var(--line);border-left:3px solid #7a96b0;border-radius:7px;margin:9px 0;padding:11px 13px;overflow-wrap:anywhere}.finding.error{border-left-color:var(--red)}.finding.warning{border-left-color:#c89230}.finding p{margin:6px 0}.finding code,.path{font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:12px;overflow-wrap:anywhere;white-space:pre-wrap}.finding code{color:var(--muted)}.path{color:var(--muted);display:block}.table-wrap{width:100%;overflow-x:auto;border:1px solid var(--line);border-radius:8px}table{border-collapse:collapse;width:100%;font-size:12px;text-align:left}th,td{padding:10px 12px;border-bottom:1px solid var(--line);vertical-align:top;overflow-wrap:anywhere}th{background:#f5f8f7;color:var(--muted);font-weight:650;white-space:nowrap}tr:last-child td{border-bottom:0}td{min-width:90px;max-width:320px;white-space:pre-wrap}.dependency-grid{display:grid;grid-template-columns:1fr 1fr;gap:22px}.dependency-grid>div{min-width:0}.empty{padding:30px 16px;text-align:center;background:#f7f9f8;border:1px dashed var(--line);border-radius:9px;color:var(--muted)}.empty strong{display:block;font-size:15px;color:var(--ink);margin-bottom:5px}.small-empty{color:var(--muted);font-size:12px;padding:10px 0}footer{color:var(--muted);font-size:12px;display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}[hidden]{display:none!important}
@media(max-width:1050px){.stats{grid-template-columns:repeat(4,1fr)}.dependency-grid{grid-template-columns:1fr}.inventory{grid-template-columns:265px minmax(0,1fr)}.shell{padding:25px 20px}.toolbar{grid-template-columns:minmax(180px,1fr) 130px 130px}.toolbar button{grid-column:1/-1;justify-self:start}}
@media(max-width:700px){.shell{padding:22px 14px}header{display:block}h1{font-size:26px}.download{margin-top:16px}.stats{grid-template-columns:repeat(2,1fr);gap:8px}.stat{padding:12px 14px}.stats .stat:last-child{grid-column:1/-1}.panel{padding:16px}.toolbar{grid-template-columns:1fr 1fr}.toolbar .field:first-child{grid-column:1/-1}.inventory{grid-template-columns:1fr}.plugin-list{max-height:330px}.detail{padding:16px}.facts{grid-template-columns:1fr}.filter-note span:last-child{display:none}}
@media(prefers-reduced-motion:no-preference){button{transition:background .12s ease,border-color .12s ease}}
@media print{.toolbar,.download,.plugin-list,.filter-note{display:none}.inventory,.dependency-grid{display:block}.shell{max-width:none;padding:0}.panel,.detail{break-inside:avoid}.stats{grid-template-columns:repeat(7,1fr)}}
</style>
</head>
<body>
<a class="skip" href="#inventory">跳到插件清单</a>
<div class="shell">
<header><div><div class="eyebrow">PLUGIN INSPECTOR / REPOSITORY SNAPSHOT</div><h1>插件仓库 · 静态体检</h1><p class="subtitle">从仓库声明到文件清单，快速定位需要关注的项目。仅静态扫描，不代表插件运行、兼容性或安全测试通过。</p></div><button id="download" class="download" type="button">下载 JSON 数据 ↓</button></header>
<div class="meta" id="meta"></div>
<section class="stats" id="stats" aria-label="仓库统计"></section>
<section class="panel" id="repository-findings" aria-labelledby="repository-heading"><h2 id="repository-heading">仓库提示</h2><div id="repository-findings-body"></div></section>
<main id="inventory" class="panel" tabindex="-1" aria-labelledby="inventory-heading">
<h2 id="inventory-heading">插件清单</h2>
<div class="toolbar">
<div class="field"><label for="search">搜索插件或问题</label><input id="search" type="search" placeholder="名称、ID、描述或 finding…" autocomplete="off" spellcheck="false"></div>
<div class="field"><label for="status">检查状态</label><select id="status"><option value="">全部状态</option><option value="error">有错误</option><option value="warning">有警告</option><option value="ok">无错误 / 警告</option></select></div>
<div class="field"><label for="capability">声明能力</label><select id="capability"><option value="">全部能力</option><option value="host">Host</option><option value="web">Web</option><option value="none">未声明能力</option></select></div>
<button id="reset" type="button">重置筛选</button>
</div>
<div class="filter-note"><span id="result-count" role="status" aria-live="polite"></span><span>/ 搜索 · Esc 清空筛选 · ↑ ↓ 切换插件</span></div>
<div class="inventory"><nav aria-label="选择插件"><ul class="plugin-list" id="plugins"></ul><div id="list-empty" class="empty" hidden></div></nav><section class="detail" id="detail" aria-label="插件详情"></section></div>
</main>
<section class="panel" aria-labelledby="dependency-heading"><h2 id="dependency-heading">依赖清单</h2><p class="muted">完整仓库库存，不随上方插件筛选变化。来自 manifest 声明，不解析已安装版本或执行依赖。</p><div class="dependency-grid"><div><h3 id="internal-heading">内部依赖</h3><div id="internal-dependencies"></div></div><div><h3 id="external-heading">外部依赖</h3><div id="external-dependencies"></div></div></div></section>
<footer><span>离线快照 · 不读取实时仓库 · 不发送网络请求</span><span>错误与警告按 finding 数量统计，包含仓库级提示。</span></footer>
<noscript><p class="empty">请启用 JavaScript 以读取内嵌快照、筛选插件和下载 JSON。此页面无需联网。</p></noscript>
</div>
<script id="report-data" type="application/json">${data}</script>
<script>
'use strict';
const report = JSON.parse(document.getElementById('report-data').textContent);
const plugins = report.plugins || [];
const $ = (id) => document.getElementById(id);
const text = (value) => value == null ? '未声明' : String(value);
const labels = { ok: '无错误 / 警告', warning: '警告', error: '错误', info: '信息' };
const kinds = { dependency: '运行时', dev: '开发', peer: '同级', optional: '可选' };
function element(tag, content, className) {
  const node = document.createElement(tag);
  if (content != null) node.textContent = text(content);
  if (className) node.className = className;
  return node;
}
function badge(value, label) {
  // Only known status names are used as CSS classes, never repository strings.
  return element('span', label || labels[value] || value, 'badge ' + (Object.hasOwn(labels, value) ? value : ''));
}
function empty(target, heading, description) {
  const node = element('div', null, 'empty');
  node.append(element('strong', heading), element('span', description));
  target.append(node);
}
function table(target, headings, rows, emptyLabel) {
  if (!rows.length) { target.append(element('p', emptyLabel, 'small-empty')); return; }
  const wrap = element('div', null, 'table-wrap');
  const grid = element('table');
  const head = element('thead');
  const header = element('tr');
  headings.forEach((title) => { const cell = element('th', title); cell.scope = 'col'; header.append(cell); });
  head.append(header);
  const body = element('tbody');
  rows.forEach((row) => { const tr = element('tr'); row.forEach((value) => tr.append(element('td', value))); body.append(tr); });
  grid.append(head, body); wrap.append(grid); target.append(wrap);
}
function findings(target, entries) {
  if (!entries.length) { target.append(element('p', '未发现静态检查问题；未执行运行时测试。', 'small-empty')); return; }
  entries.forEach((finding) => {
    const level = Object.hasOwn(labels, finding.severity) ? finding.severity : 'info';
    const item = element('article', null, 'finding ' + level);
    item.append(badge(level), element('code', ' ' + text(finding.code)), element('p', finding.message));
    item.append(element('span', finding.path || '仓库级提示（未指定文件路径）', 'path'));
    target.append(item);
  });
}
const summary = report.summary || {};
[['packages', '插件总数'], ['errors', '错误 finding'], ['warnings', '警告 finding'], ['host', '声明 Host'], ['web', '声明 Web'], ['documented', '有文档页面'], ['changed', '有本地改动']].forEach(([key, label]) => {
  const card = element('div', null, 'stat ' + (key === 'errors' ? 'error' : key === 'warnings' ? 'warning' : ''));
  card.append(element('strong', summary[key] || 0), element('span', label)); $('stats').append(card);
});
const repo = report.repository || {};
document.title = text(repo.name || '插件仓库') + ' · 静态体检';
const gitAvailable = Boolean(repo.head || repo.branch);
[text(repo.name), '扫描根目录：' + text(report.root), '生成时间：' + text(report.generatedAt), gitAvailable ? 'Git：' + text(repo.branch || 'detached HEAD') + ' · ' + text(repo.head) + (repo.dirty ? ' · 存在本地改动' : ' · 扫描时无本地改动') : 'Git：不可用或暂无提交，未确认工作区状态'].forEach((value) => $('meta').append(element('span', value)));
findings($('repository-findings-body'), report.findings || []);
const dependency = report.dependencies || {};
const edges = dependency.edges || [];
const external = dependency.external || [];
$('internal-heading').textContent = '内部依赖 · ' + edges.length + ' 条声明';
$('external-heading').textContent = '外部依赖 · ' + external.length + ' 组';
table($('internal-dependencies'), ['来源插件', '目标插件', '类型', '声明范围'], edges.map((edge) => [edge.from, edge.to, kinds[edge.kind] || edge.kind, edge.range]), '没有插件间的内部依赖声明。');
table($('external-dependencies'), ['依赖名称', '声明范围', '类型', '使用插件'], external.map((entry) => [entry.name, entry.range, kinds[entry.kind] || entry.kind, (entry.usedBy || []).join('\\n')]), '没有外部依赖声明。');
let selected = null;
let visible = [];
function showDetail(plugin) {
  $('detail').replaceChildren();
  $('detail').removeAttribute('aria-labelledby');
  if (!plugin) { empty($('detail'), plugins.length ? '没有可显示的插件' : '仓库中尚无插件', plugins.length ? '调整搜索词或筛选条件，再选择一个插件查看详情。' : '扫描 packages/ 下含 package.json 的直接子目录后，清单将显示在这里。'); return; }
  const root = $('detail');
  const heading = element('h2', plugin.name || plugin.id); heading.id = 'selected-plugin-heading'; root.append(heading);
  root.setAttribute('aria-labelledby', heading.id);
  root.append(element('span', plugin.id + ' · ' + text(plugin.version), 'muted'), element('p', plugin.description || '暂无描述。'));
  const tags = element('div', null, 'badges');
  tags.append(badge(plugin.status));
  (plugin.capabilities || []).forEach((value) => tags.append(badge(value, value === 'host' ? 'Host' : value === 'web' ? 'Web' : value)));
  if (plugin.changed) tags.append(badge('info', '本地有改动'));
  root.append(tags);
  const facts = element('dl', null, 'facts');
  const file = plugin.files || {};
  const engine = plugin.engines || {};
  [['目录', plugin.directory], ['文档路径', plugin.docsPath || '未找到约定文档页面'], ['Node / DSH 声明', text(engine.node) + ' / ' + text(engine.dsh)], ['源文件 / 大小', text(plugin.sourceFiles) + ' 个 / ' + text(plugin.sourceBytes) + ' bytes'], ['测试文件库存', text(plugin.testFiles) + ' 个（未执行）'], ['文件库存', [['README', file.readme], ['图标', file.icon], ['Bundle', file.bundle], ['文档', file.docs]].map(([label, exists]) => label + (exists ? ' ✓' : ' 缺失')).join(' · ')]].forEach(([label, value]) => { const row = element('div'); row.append(element('dt', label), element('dd', value)); facts.append(row); });
  root.append(facts, element('h3', '检查结果与路径'));
  findings(root, plugin.findings || []);
  root.append(element('h3', '导出声明'));
  table(root, ['导出名称', '目标', '本地文件'], (plugin.exports || []).map((entry) => [entry.name, entry.target, entry.exists === true ? '存在' : entry.exists === false ? '缺失' : '仅库存，未校验']), '没有导出声明。');
  root.append(element('h3', '语言库存'));
  table(root, ['语言', '标题', '描述', 'meta 键'], (plugin.locales || []).map((entry) => [entry.language, entry.title, entry.description, (entry.metaKeys || []).join(', ')]), '没有语言文件。');
  root.append(element('h3', '该插件的依赖声明'));
  table(root, ['依赖名称', '声明范围', '类型', '归属'], (plugin.dependencies || []).map((entry) => [entry.name, entry.range, kinds[entry.kind] || entry.kind, entry.internal ? '内部' : '外部']), '此插件没有依赖声明。');
  const changes = (repo.changedFiles || []).filter((entry) => entry.path === plugin.directory || entry.path.startsWith(plugin.directory + '/') || entry.path === plugin.docsPath);
  if (changes.length) { root.append(element('h3', '相关 Git 改动')); table(root, ['状态', '路径'], changes.map((entry) => [entry.status, entry.path]), '无相关改动。'); }
}
function selectPlugin(plugin) {
  selected = plugin;
  Array.from($('plugins').querySelectorAll('button')).forEach((button, index) => button.setAttribute('aria-pressed', String(visible[index] === plugin)));
  showDetail(plugin);
}
function filterPlugins() {
  const query = $('search').value.trim().toLocaleLowerCase();
  const status = $('status').value;
  const capability = $('capability').value;
  visible = plugins.filter((plugin) => {
    const searchable = [plugin.name, plugin.id, plugin.description, ...(plugin.findings || []).flatMap((finding) => [finding.message, finding.code, finding.path])].join(' ').toLocaleLowerCase();
    const capabilities = plugin.capabilities || [];
    return (!query || searchable.includes(query)) && (!status || plugin.status === status) && (!capability || (capability === 'none' ? !capabilities.length : capabilities.includes(capability)));
  });
  $('result-count').textContent = '显示 ' + visible.length + ' / ' + plugins.length + ' 个插件';
  $('plugins').replaceChildren();
  visible.forEach((plugin) => {
    const li = element('li'); const button = element('button', null, 'plugin'); button.type = 'button';
    const title = element('span', null, 'plugin-title'); title.append(element('span', plugin.name || plugin.id, 'plugin-name'), badge(plugin.status));
    button.append(title, element('span', plugin.id + ' · ' + text(plugin.version) + ' · ' + ((plugin.capabilities || []).join(' + ') || '未声明能力'), 'plugin-subtitle'));
    button.addEventListener('click', () => selectPlugin(plugin)); li.append(button); $('plugins').append(li);
  });
  $('list-empty').hidden = visible.length > 0;
  $('list-empty').textContent = plugins.length ? '没有匹配的插件。请调整搜索或重置筛选。' : '未发现插件。';
  selectPlugin(visible.includes(selected) ? selected : visible[0] || null);
}
$('search').addEventListener('input', filterPlugins);
$('status').addEventListener('change', filterPlugins);
$('capability').addEventListener('change', filterPlugins);
function reset() { $('search').value = ''; $('status').value = ''; $('capability').value = ''; filterPlugins(); }
$('reset').addEventListener('click', () => { reset(); $('search').focus(); });
$('plugins').addEventListener('keydown', (event) => {
  const buttons = Array.from($('plugins').querySelectorAll('button'));
  const index = buttons.indexOf(document.activeElement);
  if (index < 0 || !['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
  event.preventDefault();
  const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : Math.max(0, Math.min(buttons.length - 1, index + (event.key === 'ArrowDown' ? 1 : -1)));
  buttons[next].focus(); selectPlugin(visible[next]);
});
document.addEventListener('keydown', (event) => {
  if (event.ctrlKey || event.metaKey || event.altKey || event.isComposing) return;
  const editing = ['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName) || document.activeElement.isContentEditable;
  if (event.key === '/' && !editing) { event.preventDefault(); $('search').focus(); }
  if (event.key === 'Escape') { reset(); $('search').focus(); }
});
$('download').addEventListener('click', () => {
  const url = URL.createObjectURL(new Blob([JSON.stringify(report, null, 2) + '\\n'], { type: 'application/json;charset=utf-8' }));
  const anchor = element('a'); anchor.href = url; anchor.download = 'plugin-inspector-report.json'; document.body.append(anchor); anchor.click(); anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
filterPlugins();
</script>
</body>
</html>`;
}

export default renderHtml;

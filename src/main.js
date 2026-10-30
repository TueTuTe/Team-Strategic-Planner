import './style.css';
import '@fontsource/be-vietnam-pro/400.css';
import '@fontsource/be-vietnam-pro/500.css';
import '@fontsource/be-vietnam-pro/600.css';
import '@fontsource/dm-sans/500.css';
import '@fontsource/dm-sans/600.css';
import '@fontsource/dm-sans/700.css';
import { createIcons, ArrowRight, ArrowUpRight, BriefcaseBusiness, CalendarDays, ChartNoAxesCombined, ChevronRight, ChevronsUpDown, CircleHelp, Compass, Cuboid, Download, FileText, FolderOpen, HardDrive, Info, Layers2, Lightbulb, Minus, MousePointer2, NotebookTabs, PenTool, Plus, Scan, ScanSearch, SlidersHorizontal, Sparkle, Sparkles, Sprout, Trash2, UsersRound, Wallet, Workflow, X } from 'lucide';
const icons = { ArrowRight, ArrowUpRight, BriefcaseBusiness, CalendarDays, ChartNoAxesCombined, ChevronRight, ChevronsUpDown, CircleHelp, Compass, Cuboid, Download, FileText, FolderOpen, HardDrive, Info, Layers2, Lightbulb, Minus, MousePointer2, NotebookTabs, PenTool, Plus, Scan, ScanSearch, SlidersHorizontal, Sparkle, Sparkles, Sprout, Trash2, UsersRound, Wallet, Workflow, X };
import { createOffice } from './office.js';
import { officeZones } from './office-layout.js';
import { team, createPlan, renameMember, getPhaseOwner } from './planner.js';

const $ = (s) => document.querySelector(s);
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const icon = (name, cls = '') => `<i data-lucide="${name}" class="${cls}"></i>`;
const money = (n) => n == null ? 'Chưa phân bổ' : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
const storageKey = 'atelier-workspace-v1';
let saved;
try { saved = JSON.parse(localStorage.getItem(storageKey) || '{}'); } catch { saved = {}; }
if (!saved || typeof saved !== 'object') saved = {};
const legacyNames = { strategy: 'Minh Anh', insight: 'Linh', creative: 'Bảo', media: 'Hà', account: 'Tuấn' };
for (const person of team) {
  const isLegacyDefault = saved.teamNamesVersion !== 2 && saved.teamNames?.[person.id] === legacyNames[person.id];
  if (!isLegacyDefault && typeof saved.teamNames?.[person.id] === 'string') {
    try { renameMember(person.id, saved.teamNames[person.id]); } catch { /* Keep the default if a stored name is invalid. */ }
  }
}
let projects = Array.isArray(saved.projects) ? saved.projects.filter(p => p && typeof p.id === 'string' && typeof p.client === 'string' && Array.isArray(p.phases) && p.phases.length === 5) : [];
let checkedTasks = Array.isArray(saved.checkedTasks) ? saved.checkedTasks : [];
let activeView = 'office', office, lastFocus, selectedAgent;
const demo = { ...createPlan({ client: 'Mộc · Green living', objective: 'Xây dựng nhận biết cho dòng sản phẩm sống xanh mới', audience: 'Người trẻ thành thị 25–34 tuổi', budget: '500000000', timing: '8 tuần' }), demo: true };
function persist() {
  try { localStorage.setItem(storageKey, JSON.stringify({ projects, checkedTasks, teamNamesVersion: 2, teamNames: Object.fromEntries(team.map(person => [person.id, person.name])) })); }
  catch { toast('Bộ nhớ trình duyệt không khả dụng. Hãy xuất kế hoạch để lưu lại.'); }
}
function hydrate() { createIcons({ icons }); }
function toast(message) {
  const toast = $('#toast'); toast.textContent = message; toast.classList.add('show'); clearTimeout(toast.timer); toast.timer = setTimeout(() => toast.classList.remove('show'), 4200);
}
$('#app').innerHTML = `
  <aside class="sidebar">
    <a class="brand" href="#office" aria-label="Atelier trang chủ"><span class="brand-symbol">a<span>·</span></span><span>atelier<span class="brand-dot">.</span></span></a>
    <button class="workspace-switch" id="workspace-info"><span class="workspace-icon">K</span><span><strong>Khải Tuệ Studio</strong><small>Strategy workspace</small></span>${icon('chevrons-up-down')}</button>
    <div class="nav-caption">WORKSPACE</div>
    <nav aria-label="Điều hướng chính">
      <button class="nav-link active" data-view="office">${icon('cuboid')}<span>Văn phòng 3D</span><span class="nav-count">01</span></button>
      <button class="nav-link" data-view="projects">${icon('layers-2')}<span>Dự án & chiến dịch</span><span class="project-count">${projects.length}</span></button>
      <button class="nav-link" data-view="team">${icon('users-round')}<span>Đội ngũ của bạn</span></button>
      <button class="nav-link" data-view="library">${icon('notebook-tabs')}<span>Thư viện chiến lược</span></button>
    </nav>
    <div class="sidebar-note"><span class="small-spark">${icon('sparkles')}</span><h3>Ý tưởng lớn.<br>Bắt đầu cùng nhau.</h3><p>Một brief tốt là khởi đầu của một chiến dịch tuyệt vời.</p><button class="text-link" data-action="brief">Tạo brief đầu tiên ${icon('arrow-up-right')}</button></div>
    <div class="sidebar-bottom"><button class="nav-link" id="settings">${icon('sliders-horizontal')}<span>Cài đặt workspace</span></button><div class="user"><span class="user-avatar">KT</span><span><strong>Khải Tuệ</strong><small>Workspace owner</small></span><span class="user-indicator"></span></div></div>
  </aside>
  <div class="main-shell">
    <header class="topbar"><div class="breadcrumb">Workspace ${icon('chevron-right')}<span id="crumb">Văn phòng 3D</span></div><div class="topbar-right"><span class="local-status"><span></span> Bản trải nghiệm · lưu cục bộ</span><button class="icon-button" id="help" aria-label="Hướng dẫn">${icon('circle-help')}</button><span class="mini-avatar">KT</span></div></header>
    <main id="main"></main>
    <footer class="app-footer"><span><span class="live-dot"></span> Không gian cho những ý tưởng lớn</span><span>Made for curious minds. <span class="footer-flower">✳</span></span></footer>
  </div>
  <div id="modal-root"></div><div id="toast" role="status" aria-live="polite"></div>`;

function viewHeader(eyebrow, title, sub, button = true) {
  return `<div class="page-heading"><div><div class="eyebrow">${eyebrow}</div><h1>${title}<span class="heading-dot">.</span></h1><p>${sub}</p></div>${button ? `<button class="button primary" data-action="brief">${icon('plus', 'small')} Tạo brief mới</button>` : ''}</div>`;
}
function avatar(person, size = '') { return `<span class="avatar ${size}" style="--avatar-color:${person.color}">${esc(person.initials)}</span>`; }
function renderOffice() {
  const current = projects[0] || demo;
  $('#main').innerHTML = `${viewHeader('YOUR IDEAS, IN GOOD COMPANY', 'Một đội ngũ. Vạn ý tưởng', 'Chào Khải Tuệ, văn phòng đã sẵn sàng cho chiến lược tiếp theo của bạn.')}
    <div class="office-grid"><section class="office-panel"><div class="panel-top"><div class="panel-title">${icon('cuboid')}<strong>Japanese Study</strong><span class="outline-badge">Tầng 01</span></div><span class="room-status"><span></span> 5 vai trò</span></div>
      <div class="zone-bar"><div class="zone-tabs" role="group" aria-label="Góc nhìn văn phòng">${Object.entries(officeZones).map(([id, zone]) => `<button data-zone="${id}" aria-pressed="${id === 'overview'}">${zone.label}</button>`).join('')}</div><span id="zone-detail">${officeZones.overview.detail}</span></div>
      <div class="office-canvas-wrap"><div class="scene-corner"><span class="scene-tag">THE JAPANESE STUDY</span><span class="scene-subtitle">Studio · Góc riêng · Phòng họp · Khu trà</span></div><div id="office-canvas" role="region" aria-label="Văn phòng 3D tương tác với 5 chuyên gia"></div><div class="scene-hint">${icon('mouse-pointer-2')} Kéo để xoay · Chọn tên để gặp đội ngũ</div><div class="scene-tools"><button class="icon-button" id="zoom-in" aria-label="Phóng to">${icon('plus')}</button><button class="icon-button" id="zoom-out" aria-label="Thu nhỏ">${icon('minus')}</button><span></span><button class="icon-button" id="reset-view" aria-label="Đặt lại góc nhìn">${icon('scan')}</button><button class="icon-button" id="top-view" aria-label="Góc nhìn từ trên">${icon('layers-2')}</button></div></div>
      <div class="room-footer"><span><span class="live-dot"></span> Một khoảng lặng cho ý tưởng lớn</span><button class="text-link" id="meet-team">Gặp đội ngũ ${icon('arrow-right')}</button></div>
    </section><aside class="right-column"><section class="project-panel"><div class="section-label">TRÊN BÀN LÀM VIỆC <span class="soft-badge">${projects.length ? 'Bản nháp' : 'Dự án mẫu'}</span></div><div class="client-logo">${icon('sprout')}</div><h2>${esc(current.client)}</h2><p>${esc(current.objective)}</p><div class="project-meta"><span>${icon('calendar-days')} ${esc(current.timing)}</span><span>${icon('wallet')} ${money(current.budget)}</span></div><div class="project-divider"></div><div class="plan-state"><span>Khung kế hoạch IMC</span><strong>5 giai đoạn</strong></div><div class="phase-strip"><span></span><span></span><span></span><span></span><span></span></div><div class="stacked-avatars">${team.map(p => avatar(p, 'tiny')).join('')}<span>Đủ góc nhìn, cùng mục tiêu</span></div><button class="button secondary full" id="open-current">Mở không gian dự án ${icon('arrow-up-right')}</button></section>
      <section class="inspiration"><span>${icon('lightbulb')}</span><div><h3>Good strategy starts with why.</h3><p>Đừng vội tìm ý tưởng. Hãy bắt đầu từ câu hỏi đúng.</p></div>${icon('sparkle')}</section></aside></div>
    <section class="team-section"><div class="section-heading"><div><h2>Những bộ óc phía sau ý tưởng <span class="number-tag">05</span></h2><p>Mỗi vai trò một thế mạnh. Cùng nhau tạo nên bức tranh lớn.</p></div><button class="text-link" id="all-team">Khám phá đội ngũ ${icon('arrow-right')}</button></div><div class="team-cards">${team.map(p => `<button class="team-card" data-agent="${p.id}"><div class="team-card-top">${avatar(p)}<span class="role-symbol">${icon({strategy:'compass',insight:'scan-search',creative:'pen-tool',media:'chart-no-axes-combined',account:'briefcase-business'}[p.id])}</span></div><h3>${esc(p.name)}</h3><p>${p.role}</p><div class="team-card-bottom"><span class="ready-dot"></span>Sẵn sàng nhận brief ${icon('arrow-up-right')}</div></button>`).join('')}</div></section>
    <section class="bottom-banner"><div class="banner-mark">${icon('workflow')}</div><div><h3>Từ một câu hỏi đến một chiến dịch.</h3><p>Brief → Insight → Strategy → Big Idea → IMC Plan</p></div><button class="text-link" data-action="brief">Bắt đầu hành trình ${icon('arrow-right')}</button></section>`;
  try { office = createOffice($('#office-canvas'), openAgent); } catch (e) { $('#office-canvas').innerHTML = `<div class="webgl-fallback">${icon('cuboid')}<h3>Không thể khởi tạo góc nhìn 3D</h3><p>Hãy dùng trình duyệt hỗ trợ WebGL. Bạn vẫn có thể chọn đội ngũ và tạo brief bên dưới.</p></div>`; }
  $('#open-current').onclick = () => openPlan(current);
  $('#meet-team').onclick = $('#all-team').onclick = () => navigate('team');
  function setZone(id) {
    office?.focusZone(id);
    document.querySelectorAll('[data-zone]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.zone === id)));
    $('#zone-detail').textContent = officeZones[id].detail;
  }
  document.querySelectorAll('[data-zone]').forEach(button => { button.disabled = !office; button.onclick = () => setZone(button.dataset.zone); });
  for (const [id, action] of [['zoom-in', () => office?.zoom(.9)], ['zoom-out', () => office?.zoom(1.1)], ['reset-view', () => setZone('overview')], ['top-view', () => office?.top()]]) $(`#${id}`).onclick = action;
}
function renderProjects() {
  $('#main').innerHTML = `${viewHeader('FROM BRIEF TO IMPACT', 'Không gian dự án', 'Tập trung brief, định hướng và kế hoạch IMC ở cùng một nơi.')}<div class="notice">${icon('hard-drive')} Kế hoạch được lưu trên trình duyệt này. Xuất Markdown để chia sẻ hoặc sao lưu.</div><div class="projects-grid">${[...projects, demo].map(p => `<article class="project-list-card"><div class="section-label">${p.demo ? 'DỰ ÁN MẪU' : 'BẢN NHÁP CHIẾN LƯỢC'}${icon('folder-open')}</div><h2>${esc(p.client)}</h2><p>${esc(p.objective)}</p><div class="project-meta"><span>${icon('calendar-days')} ${esc(p.timing)}</span><span>${money(p.budget)}</span></div><div class="project-card-actions"><button class="button secondary" data-project="${p.id}">Xem kế hoạch ${icon('arrow-right')}</button>${!p.demo ? `<button class="icon-button danger" data-delete="${p.id}" aria-label="Xóa dự án ${esc(p.client)}">${icon('trash-2')}</button>` : ''}</div></article>`).join('')}<button class="new-project-card" data-action="brief">${icon('plus')}<strong>Bắt đầu một câu chuyện mới</strong><span>Tạo brief cho khách hàng của bạn</span></button></div>`;
}
function renderTeam() {
  $('#main').innerHTML = `${viewHeader('DIFFERENT MINDS. SHARED AMBITION.', 'Đội ngũ của bạn', 'Năm góc nhìn chuyên môn cho mọi bài toán truyền thông.')}<div class="notice">${icon('info')} Đây là các vai trò mô phỏng. Chưa kết nối mô hình AI hoặc thành viên thật.</div><div class="team-detail-grid">${team.map(p => `<button class="person-card" data-agent="${p.id}">${avatar(p)}<h2>${esc(p.name)}</h2><span class="person-role">${p.role}</span><p>${p.description}</p><div class="skill-tags">${p.skills.map(s => `<span>${s}</span>`).join('')}</div><span class="text-link">Tìm hiểu vai trò ${icon('arrow-up-right')}</span></button>`).join('')}</div>`;
}
const frameworks = [
  { name: 'Creative brief', category: 'BRIEFING', icon: 'file-text', description: 'Làm rõ vấn đề trước khi tìm lời giải.', content: ['Bối cảnh: Điều gì đang thay đổi trong ngành hàng?', 'Bài toán: Vấn đề kinh doanh nào cần giải quyết?', 'Mục tiêu: Hành vi hoặc nhận thức nào cần thay đổi?', 'Đối tượng: Ai là người cần thuyết phục?', 'Thông điệp: Một điều duy nhất họ cần nhớ?', 'Bằng chứng: Vì sao họ nên tin?', 'Ràng buộc: Ngân sách, thời gian, pháp lý, brand guideline.'] },
  { name: 'Consumer insight', category: 'DISCOVERY', icon: 'scan-search', description: 'Từ quan sát đến một sự thật có ý nghĩa.', content: ['Observation: Bạn quan sát được hành vi gì?', 'Tension: Mâu thuẫn hoặc rào cản nào đứng sau hành vi đó?', 'Motivation: Động lực sâu xa là gì?', 'Insight hypothesis: Tôi muốn… nhưng… bởi vì…', 'Validation: Cần phỏng vấn, khảo sát hoặc dữ liệu nào để kiểm chứng?'] },
  { name: 'IMC planning canvas', category: 'STRATEGY', icon: 'workflow', description: 'Kết nối mục tiêu, ý tưởng, kênh và đo lường.', content: ['Business objective → Communication objective', 'Audience → Insight → Strategic proposition', 'Big idea → Key message → Creative assets', 'Awareness → Consideration → Conversion → Loyalty', 'Vai trò từng kênh: Paid / Owned / Earned / Shared', 'KPI → Baseline → Target → Measurement source', 'Budget → Timeline → Owners → Dependencies'] },
  { name: 'Measurement framework', category: 'EFFECTIVENESS', icon: 'chart-no-axes-combined', description: 'Đo điều có ý nghĩa với bài toán khách hàng.', content: ['Awareness: Reach, aided/unaided awareness — cần khảo sát nền.', 'Consideration: Engaged visits, brand search, intent — cần tracking.', 'Action: Qualified leads, conversion, CPA — cần định nghĩa conversion.', 'Business: Revenue, incrementality — cần dữ liệu khách hàng.', 'Không tự gán chỉ tiêu khi chưa có baseline và benchmark.'] },
];
function renderLibrary() {
  $('#main').innerHTML = `${viewHeader('A TOOLKIT FOR BETTER THINKING', 'Thư viện chiến lược', 'Những framework để đặt câu hỏi sắc hơn và xây kế hoạch rõ hơn.', false)}<div class="projects-grid">${frameworks.map((f, i) => `<button class="framework-card" data-framework="${i}"><span class="framework-icon">${icon(f.icon)}</span><div class="eyebrow">${f.category}</div><h2>${f.name}</h2><p>${f.description}</p><span class="text-link">Mở framework ${icon('arrow-up-right')}</span></button>`).join('')}</div>`;
}
function navigate(view) {
  if (!['office', 'projects', 'team', 'library'].includes(view)) view = 'office';
  office?.dispose(); office = null; activeView = view;
  const names = { office: 'Văn phòng 3D', projects: 'Dự án & chiến dịch', team: 'Đội ngũ của bạn', library: 'Thư viện chiến lược' };
  $('#crumb').textContent = names[view]; document.title = `${names[view]} — Atelier`;
  document.querySelectorAll('[data-view]').forEach(el => { el.classList.toggle('active', el.dataset.view === view); el.setAttribute('aria-label', names[el.dataset.view]); if (el.dataset.view === view) el.setAttribute('aria-current', 'page'); else el.removeAttribute('aria-current'); });
  ({ office: renderOffice, projects: renderProjects, team: renderTeam, library: renderLibrary })[view]();
  $('.project-count').textContent = projects.length;
  bindView(); hydrate();
}
function bindView() {
  document.querySelectorAll('[data-action="brief"]').forEach(el => el.onclick = openBrief);
  document.querySelectorAll('[data-agent]').forEach(el => el.onclick = () => openAgent(el.dataset.agent));
  document.querySelectorAll('[data-project]').forEach(el => el.onclick = () => openPlan([...projects, demo].find(p => p.id === el.dataset.project)));
  document.querySelectorAll('[data-framework]').forEach(el => el.onclick = () => {
    const f = frameworks[Number(el.dataset.framework)];
    modal(`<div class="eyebrow">${f.category}</div><h2>${f.name}</h2><p class="modal-intro">${f.description}</p><ol class="framework-list">${f.content.map(c => `<li>${c}</li>`).join('')}</ol><button class="button primary" id="framework-brief">Áp dụng vào brief mới ${icon('arrow-right')}</button>`);
    $('#framework-brief').onclick = openBrief;
  });
  document.querySelectorAll('[data-delete]').forEach(el => el.onclick = () => {
    const p = projects.find(p => p.id === el.dataset.delete);
    modal(`<div class="eyebrow">QUẢN LÝ DỰ ÁN</div><h2>Xóa bản nháp này?</h2><p class="modal-intro">${esc(p.client)} sẽ bị xóa khỏi trình duyệt này. Bạn có thể xuất bản sao trước khi xóa.</p><div class="modal-actions"><button class="button secondary" id="cancel-delete">Giữ lại</button><button class="button primary" id="confirm-delete">Xóa bản nháp</button></div>`);
    $('#cancel-delete').onclick = closeModal;
    $('#confirm-delete').onclick = () => { projects = projects.filter(x => x.id !== p.id); checkedTasks = checkedTasks.filter(k => !k.startsWith(p.id + ':')); persist(); closeModal(); navigate('projects'); toast('Đã xóa bản nháp.'); };
  });
}
function modal(content, wide = false) {
  if (!$('#modal-root').children.length) lastFocus = document.activeElement;
  $('#modal-root').innerHTML = `<div class="modal-backdrop"><section class="modal ${wide ? 'wide' : ''}" role="dialog" aria-modal="true" aria-labelledby="dialog-title" tabindex="-1"><button class="icon-button close-modal" aria-label="Đóng">${icon('x')}</button>${content}</section></div>`;
  $('.modal h2')?.setAttribute('id', 'dialog-title'); document.body.classList.add('modal-open');
  $('.close-modal').onclick = closeModal;
  $('.modal-backdrop').onclick = e => { if (e.target.classList.contains('modal-backdrop')) closeModal(); };
  hydrate(); $('.modal').focus();
}
function closeModal() { $('#modal-root').innerHTML = ''; document.body.classList.remove('modal-open'); office?.select(null); lastFocus?.isConnected && lastFocus.focus(); }
document.addEventListener('keydown', e => {
  if (!$('#modal-root').children.length) return;
  if (e.key === 'Escape') closeModal();
  if (e.key === 'Tab') {
    const list = [...$('.modal').querySelectorAll('button, input, textarea, select, a[href]')].filter(el => !el.disabled);
    if (e.shiftKey && (document.activeElement === list[0] || document.activeElement === $('.modal'))) { e.preventDefault(); list.at(-1)?.focus(); }
    else if (!e.shiftKey && (document.activeElement === list.at(-1) || document.activeElement === $('.modal'))) { e.preventDefault(); list[0]?.focus(); }
  }
});
function openAgent(id) {
  selectedAgent = team.find(p => p.id === id); if (!selectedAgent) return;
  const p = selectedAgent; office?.select(id);
  modal(`<div class="agent-profile-top">${avatar(p, 'large')}<span class="soft-badge">Vai trò mô phỏng</span></div><div class="eyebrow">MEET YOUR TEAM</div><h2>${esc(p.name)}</h2><div class="person-role">${p.role}</div><p class="modal-intro">${p.description}</p><form id="rename-form" class="rename-form"><label for="character-name">Tên nhân vật</label><div class="rename-controls"><input id="character-name" name="characterName" value="${esc(p.name)}" maxlength="40" required autocomplete="off" aria-describedby="rename-error"><button class="button secondary" type="submit">Lưu tên</button></div><p id="rename-error" class="rename-error" role="alert"></p><small>Tên được lưu trên trình duyệt này.</small></form><div class="profile-focus"><span>CHUYÊN MÔN</span><strong>${p.focus}</strong></div><div class="skill-tags">${p.skills.map(s => `<span>${s}</span>`).join('')}</div><p class="fine-print">Nhân vật hiện mô tả vai trò chuyên môn. Chưa có AI đang chạy hoặc tự thực hiện nghiên cứu.</p><button class="button primary full" id="assign-brief">Tạo brief cho đội ngũ ${icon('arrow-right')}</button>`);
  $('#rename-form').onsubmit = e => {
    e.preventDefault();
    try {
      renameMember(p.id, $('#character-name').value);
      persist();
      navigate(activeView);
      lastFocus = document.querySelector(`[data-agent="${p.id}"]`) || document.querySelector('[data-view="team"]');
      openAgent(p.id);
      $('#character-name').focus();
      toast('Đã cập nhật tên nhân vật.');
    } catch (error) { $('#rename-error').textContent = error.message; }
  };
  $('#assign-brief').onclick = openBrief;
}
function openBrief() {
  modal(`<div class="eyebrow">GREAT WORK STARTS HERE</div><h2>Chiến dịch tiếp theo của bạn.</h2><p class="modal-intro">Cho đội ngũ một điểm bắt đầu. Hãy kể về bài toán khách hàng.</p><form id="brief-form"><label>Khách hàng / Thương hiệu <span>*</span><input name="client" required maxlength="100" placeholder="VD: Mộc — thương hiệu sống xanh" autocomplete="organization"></label><label>Mục tiêu truyền thông <span>*</span><textarea name="objective" required maxlength="1200" rows="3" placeholder="Bạn muốn thay đổi điều gì trong nhận thức hoặc hành vi của khách hàng?"></textarea></label><label>Đối tượng mục tiêu <span>*</span><input name="audience" required maxlength="300" placeholder="VD: Người trẻ 25–34 tuổi tại TP.HCM"></label><div class="form-row"><label>Ngân sách dự kiến (VNĐ)<input name="budget" type="number" min="1" max="100000000000000" step="1" placeholder="VD: 500000000"></label><label>Thời gian triển khai<input name="timing" maxlength="100" placeholder="VD: 8 tuần, Q1/2027"></label></div><div class="form-note">${icon('info')} Bản này tạo khung IMC theo mẫu, chưa sử dụng AI. Insight và KPI cần được nghiên cứu, kiểm chứng trước khi trình khách hàng.</div><p id="form-error" role="alert"></p><button class="button primary full" type="submit">Tạo khung kế hoạch IMC ${icon('arrow-right')}</button></form>`);
  $('#brief-form').onsubmit = e => {
    e.preventDefault();
    try { const plan = createPlan(Object.fromEntries(new FormData(e.target))); projects.unshift(plan); persist(); navigate(activeView); openPlan(plan); toast('Đã lưu brief và khung kế hoạch trên trình duyệt.'); }
    catch (err) { $('#form-error').textContent = err.message; }
  };
}
function openPlan(plan) {
  if (!plan) return;
  modal(`<div class="eyebrow">${plan.demo ? 'DỰ ÁN MẪU · ' : ''}IMC WORKING DOCUMENT</div><h2>${esc(plan.client)}</h2><p class="modal-intro">${esc(plan.objective)}</p><div class="plan-summary"><span><small>ĐỐI TƯỢNG</small>${esc(plan.audience)}</span><span><small>NGÂN SÁCH</small>${money(plan.budget)}</span><span><small>THỜI GIAN</small>${esc(plan.timing)}</span></div><div class="form-note">${icon('info')} Khung tham khảo theo mẫu. Phân bổ ngân sách là gợi ý ban đầu, chưa phải khuyến nghị được nghiên cứu. Đánh dấu khi đội ngũ của bạn đã hoàn thành.</div><div class="plan-phases">${plan.phases.map((p, i) => `<article class="plan-phase"><div class="phase-number">0${i + 1}</div><div><div class="phase-title"><h3>${esc(p.name)}</h3><span>${esc(getPhaseOwner(p))}</span></div><p>${esc(p.detail)}</p><div class="phase-kpi"><strong>Đầu ra / đo lường:</strong> ${esc(p.kpi)}</div><div class="phase-budget">${p.weight}% ngân sách · ${money(p.budget)}</div></div><label class="task-check"><input type="checkbox" aria-label="Hoàn thành ${esc(p.name)}" data-task="${plan.id}:${i}" ${checkedTasks.includes(`${plan.id}:${i}`) ? 'checked' : ''}></label></article>`).join('')}</div><div class="modal-actions"><span class="fine-print">${plan.demo ? 'Nội dung mẫu để khám phá luồng làm việc.' : 'Đã lưu trên trình duyệt này.'}</span><button class="button primary" id="export-plan">${icon('download')} Xuất Markdown</button></div>`, true);
  document.querySelectorAll('[data-task]').forEach(el => el.onchange = () => { checkedTasks = checkedTasks.filter(t => t !== el.dataset.task); if (el.checked) checkedTasks.push(el.dataset.task); persist(); });
  $('#export-plan').onclick = () => {
    const markdown = `# ${plan.client}\n\n> Khung IMC theo mẫu — chưa sử dụng AI. Insight, phân bổ ngân sách và chỉ tiêu cần kiểm chứng.\n\nMục tiêu: ${plan.objective}\n\nĐối tượng: ${plan.audience}\n\nNgân sách: ${money(plan.budget)}\n\nThời gian: ${plan.timing}\n\n` + plan.phases.map((p, i) => `## ${i + 1}. ${p.name}\n\nPhụ trách: ${getPhaseOwner(p)}\n\n${p.detail}\n\nĐầu ra / đo lường: ${p.kpi}\n\nNgân sách gợi ý: ${p.weight}% · ${money(p.budget)}\n\nTrạng thái: ${checkedTasks.includes(`${plan.id}:${i}`) ? 'Hoàn thành' : 'Chưa hoàn thành'}\n`).join('\n');
    const url = URL.createObjectURL(new Blob([markdown], { type: 'text/markdown;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = `${plan.client.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/gi, '-').slice(0, 70)}-IMC.md`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); toast('Đã xuất kế hoạch Markdown.');
  };
}
document.querySelectorAll('[data-view]').forEach(el => el.onclick = () => { location.hash = el.dataset.view; });
window.addEventListener('hashchange', () => navigate(location.hash.slice(1)));
$('#settings').onclick = () => modal(`<div class="eyebrow">WORKSPACE SETTINGS</div><h2>Không gian riêng của bạn.</h2><p class="modal-intro">Atelier hiện là bản trải nghiệm chạy trên trình duyệt.</p><div class="settings-row"><strong>Lưu trữ</strong><span>Cục bộ · ${projects.length} dự án</span></div><div class="settings-row"><strong>AI</strong><span>Chưa kết nối</span></div><div class="settings-row"><strong>Cộng tác nhiều người</strong><span>Chưa hỗ trợ</span></div><p class="fine-print">Không nhập dữ liệu mật của khách hàng vào bản demo. Để dùng thực tế cần bổ sung đăng nhập, cơ sở dữ liệu và kết nối AI qua backend.</p>`);
$('#workspace-info').onclick = () => toast('Khải Tuệ Studio · Workspace cá nhân trên trình duyệt này.');
$('#help').onclick = () => modal(`<div class="eyebrow">WELCOME TO ATELIER</div><h2>Gặp nhau ở nơi ý tưởng bắt đầu.</h2><ol class="framework-list"><li>Kéo trong văn phòng để xoay góc nhìn; dùng + / − để phóng hoặc thu.</li><li>Chọn tên nhân vật để tìm hiểu vai trò chuyên môn.</li><li>Tạo brief với khách hàng, mục tiêu, đối tượng và ngân sách dự kiến.</li><li>Xem khung IMC gồm 5 giai đoạn, theo dõi đầu việc và xuất Markdown.</li></ol><p class="fine-print">Bản trải nghiệm sử dụng vai trò mô phỏng và khung kế hoạch theo mẫu. Không có agent AI hoặc dữ liệu nghiên cứu trực tiếp.</p>`);
navigate(location.hash.slice(1) || 'office');

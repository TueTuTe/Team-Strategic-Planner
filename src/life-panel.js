const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const statuses = { todo: 'Đang chờ', working: 'Đang làm thử', done: 'Đã xong', cancelled: 'Đã dừng' };
const arrow = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M7 17 17 7M7 7h10v10"/></svg>';

export function mountLifePanel(container, life, { onResult, onNotice, onFocus }) {
  container.innerHTML = `<section class="life-panel" aria-labelledby="life-heading"><div class="life-heading"><div><div class="eyebrow">A LITTLE MORE ALIVE</div><h2 id="life-heading">Bàn điều phối <span class="soft-badge">Mô phỏng tương tác</span></h2><p>Giao một việc nhỏ. Nghe đội ngũ trả lời. Cùng tạo nhịp làm việc.</p></div><span class="life-counter"></span></div><div class="life-grid"><form id="task-form"><label for="task-member">Nhân vật nhận việc</label><select id="task-member" name="memberId">${life.members.map(p => `<option value="${p.id}">${esc(p.name)} · ${p.role}</option>`).join('')}</select><label for="task-title">Nội dung công việc</label><textarea id="task-title" name="title" required maxlength="180" rows="3" placeholder="VD: Phác 3 hướng ý tưởng cho chiến dịch ra mắt Mộc"></textarea><div class="life-form-actions"><button class="button primary" type="submit">Giao việc ${arrow}</button><span>Việc và lời thoại lưu trên trình duyệt này.</span></div><p class="life-error" role="alert"></p></form><div class="life-task-area"><div class="life-subheading">ĐẦU VIỆC <span>“Làm thử” tạo bản nháp theo mẫu, chưa dùng AI.</span></div><div id="life-tasks"></div></div></div><div class="office-log"><div class="life-subheading">CHUYỆN TRONG VĂN PHÒNG <span>Lời thoại theo tình huống</span></div><div id="life-log"></div></div></section>`;
  function draw() {
    container.querySelector('.life-counter').textContent = `${life.tasks.filter(t => ['todo', 'working'].includes(t.status)).length} việc đang mở`;
    container.querySelector('#life-tasks').innerHTML = life.tasks.length ? life.tasks.map(task => {
      const member = life.member(task.memberId);
      return `<article class="life-task ${task.status}" data-life-task="${task.id}"><div class="life-task-title"><strong>${esc(task.title)}</strong><span class="task-status">${statuses[task.status]}</span></div><span class="task-owner">${esc(member.name)} · ${member.role}</span>${task.status === 'working' ? '<div class="task-working"><span></span> Đang phác bản nháp theo mẫu…</div>' : ''}<div class="life-task-actions">${task.status === 'todo' ? `<button data-run="${task.id}">Làm thử · mô phỏng</button>` : ''}${['todo', 'working'].includes(task.status) ? `<button data-finish="${task.id}">Đánh dấu xong</button><button data-cancel-task="${task.id}">Dừng</button>` : ''}${task.simulated && Array.isArray(task.result) ? `<button data-result="${task.id}">Xem bản nháp ${arrow}</button>` : ''}${task.status !== 'working' ? `<button class="delete-task" data-remove-task="${task.id}" aria-label="Xóa việc ${esc(task.title)}">Xóa</button>` : ''}</div></article>`;
    }).join('') : '<div class="life-empty"><span aria-hidden="true">✳</span><strong>Một brief nhỏ, một khởi đầu mới.</strong><p>Chọn người và giao việc đầu tiên ở bên cạnh.</p></div>';
    container.querySelector('#life-log').innerHTML = life.log.length ? life.log.slice(0, 6).map(event => {
      const person = life.member(event.memberId);
      return `<article class="log-line"><span class="log-avatar" style="--avatar-color:${person.color}">${esc(person.initials)}</span><div><strong>${esc(person.name)}</strong><p>${esc(event.text)}</p></div><time>${new Intl.DateTimeFormat('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit' }).format(event.at)}</time></article>`;
    }).join('') : '<p class="log-empty">Chọn nhân vật để chào hỏi, động viên hoặc nhắc nghiêm một chút.</p>';
  }
  container.querySelector('#task-form').onsubmit = event => {
    event.preventDefault(); const form = event.currentTarget;
    try { const values = Object.fromEntries(new FormData(form)); life.assign(values.memberId, values.title); form.elements.title.value = ''; container.querySelector('.life-error').textContent = ''; onFocus(values.memberId); }
    catch (error) { container.querySelector('.life-error').textContent = error.message; }
  };
  const actions = { run: id => life.run(id), finish: id => life.finish(id), cancelTask: id => life.cancel(id), removeTask: id => life.remove(id), result: id => onResult(life.get(id)) };
  container.onclick = event => {
    const button = event.target.closest('button'); if (!button) return;
    for (const [key, action] of Object.entries(actions)) if (button.dataset[key]) {
      try { action(button.dataset[key]); } catch (error) { onNotice(error.message); } break;
    }
  };
  draw(); const unsubscribe = life.subscribe(draw);
  return () => { unsubscribe(); container.onclick = null; };
}

const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function mountOfficeChat(container, life, { onSend, onNotice }) {
  container.innerHTML = `<button id="chat-launcher" class="chat-launcher" aria-expanded="false" aria-controls="office-chat-panel"><span aria-hidden="true">◌</span> Nhắn đội ngũ <span id="chat-unread" hidden></span></button><section id="office-chat-panel" class="office-chat-panel" aria-label="Chat với nhân viên" hidden><header><div><strong>Office chat</strong><small>Trả lời bằng text từ nhân vật · theo trạng thái</small></div><button id="chat-close" aria-label="Thu gọn chat">×</button></header><div id="office-chat-messages" class="office-chat-messages" role="log" aria-live="polite" aria-relevant="additions"></div><div class="chat-shortcuts"><button data-chat-prompt="Báo cáo tiến độ cả đội">Tiến độ cả đội</button><button data-chat-prompt="Lại đây nhé">Gọi lại đây</button></div><form id="office-chat-form"><label for="chat-recipient">Gửi tới</label><select id="chat-recipient"><option value="auto">Nhận diện theo tên</option>${life.members.map(p => `<option value="${p.id}">${esc(p.name)}</option>`).join('')}<option value="all">Cả đội</option></select><div class="chat-compose"><label class="sr-only" for="chat-message">Tin nhắn cho nhân viên</label><textarea id="chat-message" required maxlength="500" rows="2" placeholder="Vũ ơi, tiến độ đến đâu rồi?"></textarea><button type="submit" aria-label="Gửi tin nhắn">↑</button></div><p id="chat-error" role="alert"></p><small>Gõ tên, hỏi tiến độ hoặc “Giao việc: …”. Chưa nối AI hội thoại.</small></form></section>`;
  const panel = container.querySelector('#office-chat-panel'), launcher = container.querySelector('#chat-launcher'), select = container.querySelector('#chat-recipient'), input = container.querySelector('#chat-message');
  let open = false, lastId = null, unread = 0;
  function toggle(value) {
    open = value; panel.hidden = !open; launcher.setAttribute('aria-expanded', String(open));
    if (open) { unread = 0; input.focus(); const messages = container.querySelector('#office-chat-messages'); messages.scrollTop = messages.scrollHeight; }
    container.querySelector('#chat-unread').hidden = !unread;
  }
  launcher.onclick = () => toggle(!open); container.querySelector('#chat-close').onclick = () => toggle(false);
  function draw() {
    const latest = life.messages.at(-1);
    if (latest?.id !== lastId && latest?.from === 'member' && lastId && !open) unread++;
    lastId = latest?.id;
    const badge = container.querySelector('#chat-unread'); badge.hidden = !unread; badge.textContent = Math.min(99, unread);
    const messages = container.querySelector('#office-chat-messages');
    const nearBottom = messages.scrollHeight - messages.scrollTop - messages.clientHeight < 60;
    if (!life.messages.length) {
      messages.innerHTML = '<div class="chat-welcome"><span>◌</span><strong>Gọi một người, mở một cuộc trò chuyện.</strong><p>Thử “Vũ ơi”, “Tiến độ cả đội” hoặc chọn người rồi nhắn “Giao việc: rà lại brief”.</p></div>';
    } else {
      messages.querySelector('.chat-welcome')?.remove();
      const ids = new Set(life.messages.map(message => message.id));
      const existing = new Map([...messages.querySelectorAll('[data-chat-id]')].map(element => [element.dataset.chatId, element]));
      for (const [id, element] of existing) if (!ids.has(id)) element.remove();
      for (const message of life.messages) {
        let article = existing.get(message.id);
        if (!article) { article = document.createElement('article'); article.dataset.chatId = message.id; article.append(document.createElement('strong'), document.createElement('p')); messages.append(article); }
        article.className = `chat-message ${message.from}`;
        const name = message.from === 'user' ? 'Bạn' : message.from === 'system' ? 'Hướng dẫn' : life.member(message.memberId).name;
        if (article.firstElementChild.textContent !== name) article.firstElementChild.textContent = name;
        if (article.lastElementChild.textContent !== message.text) article.lastElementChild.textContent = message.text;
      }
    }
    if (nearBottom) messages.scrollTop = messages.scrollHeight;
    // Reflect renames without resetting the current recipient or draft message.
    for (const member of life.members) select.querySelector(`option[value="${member.id}"]`).textContent = member.name;
  }
  function send(text) {
    try {
      const selected = onSend(select.value, text);
      if (selected) select.value = selected;
      input.value = ''; container.querySelector('#chat-error').textContent = ''; input.focus(); const messages = container.querySelector('#office-chat-messages'); messages.scrollTop = messages.scrollHeight;
    } catch (error) { container.querySelector('#chat-error').textContent = error.message; onNotice(error.message); }
  }
  container.querySelector('#office-chat-form').onsubmit = event => { event.preventDefault(); send(input.value); };
  input.onkeydown = event => { if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) { event.preventDefault(); if (input.value.trim()) send(input.value); } if (event.key === 'Escape') { toggle(false); launcher.focus(); } };
  container.querySelectorAll('[data-chat-prompt]').forEach(button => button.onclick = () => send(button.dataset.chatPrompt));
  draw(); const unsubscribe = life.subscribe(draw);
  return { refresh: draw, dispose: unsubscribe };
}

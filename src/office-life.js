const roleDrafts = {
  strategy: ['Xác định bài toán kinh doanh và thay đổi truyền thông cần tạo ra.', 'Lập hướng định vị, thông điệp và các giả định cần khách hàng xác nhận.', 'Kết nối mục tiêu → đối tượng → thông điệp → đo lường.'],
  insight: ['Ghi nhận điều đã biết và tách khỏi giả thuyết về người tiêu dùng.', 'Chuẩn bị câu hỏi phỏng vấn về nhu cầu, rào cản và hành vi.', 'Đề xuất nguồn dữ liệu để kiểm chứng; chưa kết luận insight.'],
  creative: ['Phác 3 hướng: câu chuyện con người, minh họa lợi ích, trải nghiệm tham gia.', 'Với mỗi hướng, ghi thông điệp, điểm chạm và nội dung cần sản xuất.', 'Đối chiếu brand guideline và thử phản ứng của đối tượng trước khi chốt.'],
  media: ['Phân vai kênh theo Awareness → Consideration → Action.', 'Liệt kê benchmark, chi phí và dữ liệu còn thiếu trước khi phân bổ tiền.', 'Thiết lập tracking và lịch tối ưu; chưa đưa ra cam kết hiệu quả.'],
  account: ['Làm rõ đầu ra, người phụ trách và người duyệt của từng hạng mục.', 'Chốt mốc nhận thông tin, phản hồi và bàn giao với khách hàng.', 'Theo dõi các phụ thuộc và câu hỏi còn mở trong brief.'],
};
const reactions = {
  greet: {
    strategy: 'Chào sếp! Hôm nay mình bắt đầu từ bài toán nào? Cá đã được ngắm, giờ đến lượt brief.',
    insight: 'Có mặt! Đừng chốt insight vội, để mình đặt vài câu hỏi hay trước đã.',
    creative: 'Ý tưởng đang chờ brief đây. Cho mình một vấn đề đáng giải nào!',
    media: 'Chào sếp! Kênh nào cũng có lý do tồn tại, miễn là mục tiêu đủ rõ.',
    account: 'Có mình đây. Brief, đầu việc, người duyệt — mình cùng làm rõ nhé!',
  },
  encourage: 'Được tiếp năng lượng rồi! Cảm ơn sếp, mình sẽ chăm chút bản nháp hơn nữa.',
  scold: {
    strategy: 'Rõ rồi sếp! Bớt ngắm cá, quay lại soi brief ngay. Chiến lược phải rõ trước khi lên slide!',
    insight: 'Nhận nhắc nhở! Mình sẽ kiểm tra nguồn kỹ, không gọi cảm giác là insight nữa.',
    creative: 'Vâng sếp! Đẹp thôi chưa đủ, ý tưởng phải trả lời đúng bài toán. Mình xem lại ngay.',
    media: 'Rõ! Không chia ngân sách theo cảm tính. Mình sẽ liệt kê benchmark còn thiếu.',
    account: 'Đã rõ sếp! Không để đầu việc trôi nữa. Mình sẽ rà lại người phụ trách và mốc duyệt.',
  },
};

export class OfficeLife {
  constructor({ members, storage = null, now = () => Date.now(), onEvent = () => {}, onStorageError = () => {} }) {
    this.members = members; this.storage = storage; this.now = now; this.onEvent = onEvent; this.onStorageError = onStorageError; this.listeners = new Set();
    let saved;
    try { saved = JSON.parse(storage?.getItem('atelier-life-v1') || '{}'); } catch { saved = {}; }
    const validId = id => members.some(m => m.id === id);
    this.tasks = (Array.isArray(saved?.tasks) ? saved.tasks : []).filter(t => t && typeof t.id === 'string' && validId(t.memberId) && typeof t.title === 'string' && t.title.trim() && t.title.length <= 180 && ['todo', 'working', 'done', 'cancelled'].includes(t.status) && (t.status !== 'working' || Number.isFinite(t.finishAt))).slice(0, 60);
    this.log = (Array.isArray(saved?.log) ? saved.log : []).filter(e => e && validId(e.memberId) && typeof e.text === 'string' && Number.isFinite(e.at)).slice(0, 35);
  }
  subscribe(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
  save() {
    try { this.storage?.setItem('atelier-life-v1', JSON.stringify({ tasks: this.tasks, log: this.log })); } catch { this.onStorageError(); }
    this.listeners.forEach(fn => fn());
  }
  member(id) { const member = this.members.find(m => m.id === id); if (!member) throw new Error('Không tìm thấy nhân vật.'); return member; }
  emit(memberId, text, tone = 'greet') {
    this.member(memberId);
    const event = { id: crypto.randomUUID(), memberId, text, tone, at: this.now() };
    this.log.unshift(event); this.log = this.log.slice(0, 35); this.save(); this.onEvent(event); return event;
  }
  talk(id, type) {
    this.member(id); const lines = reactions[type];
    if (!lines) throw new Error('Tương tác chưa được hỗ trợ.');
    return this.emit(id, typeof lines === 'string' ? lines : lines[id], type);
  }
  assign(memberId, value) {
    this.member(memberId);
    const title = typeof value === 'string' ? value.trim().replace(/\s+/gu, ' ') : '';
    if (!title || title.length > 180) throw new Error('Nhập đầu việc từ 1 đến 180 ký tự.');
    if (this.tasks.length >= 60) throw new Error('Bảng việc đã đủ 60 mục. Hãy xóa các việc cũ trước khi thêm.');
    const task = { id: crypto.randomUUID(), memberId, title, status: 'todo', createdAt: this.now() };
    this.tasks.unshift(task);
    this.emit(memberId, `Đã nhận việc “${title}”. Sếp có thể cho mình làm thử bản nháp hoặc tự đánh dấu khi xong.`, 'assigned');
    return task;
  }
  get(id) { const task = this.tasks.find(t => t.id === id); if (!task) throw new Error('Đầu việc không còn tồn tại.'); return task; }
  run(id) {
    const task = this.get(id);
    if (task.status !== 'todo') throw new Error('Chỉ có thể làm thử việc đang chờ.');
    if (this.tasks.some(t => t.memberId === task.memberId && t.status === 'working')) throw new Error('Nhân vật đang xử lý một việc khác.');
    task.status = 'working'; task.startedAt = this.now(); task.finishAt = task.startedAt + 5500;
    this.emit(task.memberId, `Mình đang phác khung cho “${task.title}” nhé. Đây là lượt làm thử theo mẫu.`, 'working');
  }
  finish(id, simulated = false) {
    const task = this.get(id);
    if (!['todo', 'working'].includes(task.status)) return;
    task.status = 'done'; task.completedAt = this.now(); task.simulated = simulated;
    if (simulated) task.result = [...roleDrafts[task.memberId]];
    this.emit(task.memberId, simulated ? `Xong bản nháp mô phỏng cho “${task.title}” rồi sếp! Mở “Xem bản nháp” để kiểm tra nhé.` : `Việc “${task.title}” đã được sếp đánh dấu xong. Mình ghi nhận rồi!`, 'completed');
  }
  cancel(id) {
    const task = this.get(id); if (!['todo', 'working'].includes(task.status)) return;
    task.status = 'cancelled'; delete task.finishAt;
    this.emit(task.memberId, `Đã dừng việc “${task.title}”. Mình chờ chỉ dẫn tiếp theo nhé.`, 'cancelled');
  }
  remove(id) { const task = this.get(id); if (task.status === 'working') throw new Error('Hãy dừng việc trước khi xóa.'); this.tasks = this.tasks.filter(t => t.id !== id); this.save(); }
  tick() { for (const task of [...this.tasks]) if (task.status === 'working' && task.finishAt <= this.now()) this.finish(task.id, true); }
  isWorking(id) { return this.tasks.some(t => t.memberId === id && t.status === 'working'); }
}

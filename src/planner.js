export const team = [
  { id: 'strategy', name: 'Thôi Chí Vũ', role: 'Strategy Lead', initials: 'TV', color: '#df9b70', description: 'Kết nối bài toán kinh doanh với định hướng truyền thông.', focus: 'Brand positioning · Strategic platform', skills: ['Brand strategy', 'Communication framework', 'Consumer journey'] },
  { id: 'insight', name: 'Liễu Hà Lãm', role: 'Insight Analyst', initials: 'LL', color: '#a9b9db', description: 'Tìm câu hỏi đúng và xây giả thuyết về người tiêu dùng.', focus: 'Consumer research · Cultural tension', skills: ['Audience mapping', 'Research design', 'Insight hypothesis'] },
  { id: 'creative', name: 'Kim Chủ Ân', role: 'Creative Director', initials: 'KÂ', color: '#d9b66d', description: 'Biến chiến lược thành ý tưởng có sức lan tỏa.', focus: 'Big idea · Creative territories', skills: ['Concept development', 'Content pillars', 'Art direction'] },
  { id: 'media', name: 'Lư Duy Na', role: 'Media Planner', initials: 'LN', color: '#86aba0', description: 'Đưa thông điệp đến đúng người, đúng thời điểm.', focus: 'Channel planning · Measurement', skills: ['Channel mix', 'Funnel planning', 'KPI framework'] },
  { id: 'account', name: 'Trịnh Dĩ An', role: 'Account Lead', initials: 'TA', color: '#c99ca9', description: 'Giữ brief, tiến độ và các đầu việc luôn rõ ràng.', focus: 'Client brief · Project orchestration', skills: ['Brief management', 'Timeline', 'Client alignment'] },
];
export function renameMember(id, value) {
  const person = team.find(member => member.id === id);
  if (!person) throw new Error('Không tìm thấy nhân vật.');
  const name = typeof value === 'string' ? value.normalize('NFC').trim().replace(/\s+/gu, ' ') : '';
  if (!name) throw new Error('Vui lòng nhập tên nhân vật.');
  if (Array.from(name).length > 40) throw new Error('Tên nhân vật tối đa 40 ký tự.');
  const words = name.split(' ');
  person.name = name;
  person.initials = (words.length > 1 ? Array.from(words[0])[0] + Array.from(words.at(-1))[0] : Array.from(name).slice(0, 2).join('')).toLocaleUpperCase('vi-VN');
  return person;
}
const phaseRoles = { Discover: 'insight', Define: 'strategy', Create: 'creative', Activate: 'media', Measure: 'account' };
export function getPhaseOwner(phase) {
  return team.find(member => member.id === (phase.ownerId || phaseRoles[phase.name]))?.name || phase.owner;
}
export function validateBrief(brief) {
  if (!brief.client?.trim() || !brief.objective?.trim() || !brief.audience?.trim()) return 'Vui lòng nhập khách hàng, mục tiêu và đối tượng.';
  if (brief.budget && (!Number.isFinite(Number(brief.budget)) || Number(brief.budget) <= 0)) return 'Ngân sách phải là số lớn hơn 0.';
  return '';
}
export function createPlan(brief) {
  const error = validateBrief(brief);
  if (error) throw new Error(error);
  const budget = Number(brief.budget) || null;
  return {
    id: globalThis.crypto.randomUUID(), client: brief.client.trim(), objective: brief.objective.trim(), audience: brief.audience.trim(), budget, timing: brief.timing || 'Chưa xác định', created: new Date().toISOString(),
    phases: [
      { name: 'Discover', detail: `Kiểm chứng nhu cầu, rào cản và hành vi kênh của nhóm ${brief.audience.trim()}. Cần dữ liệu nghiên cứu trước khi kết luận insight.`, weight: 15, kpi: 'Báo cáo nghiên cứu, giả thuyết insight được kiểm chứng' },
      { name: 'Define', detail: `Thống nhất bài toán “${brief.objective.trim()}”, định vị và thông điệp trọng tâm cho ${brief.client.trim()}.`, weight: 15, kpi: 'Strategic platform được khách hàng duyệt' },
      { name: 'Create', detail: 'Phát triển 2–3 hướng ý tưởng, key visual và content pillars; kiểm tra mức độ phù hợp với đối tượng.', weight: 25, kpi: 'Big idea, key visual và bộ nội dung được duyệt' },
      { name: 'Activate', detail: 'Lập vai trò kênh theo Awareness → Consideration → Action. Chọn kênh và chốt chỉ tiêu sau khi có benchmark.', weight: 40, kpi: 'Reach, qualified visits, conversion — mục tiêu cần benchmark' },
      { name: 'Measure', detail: 'Thiết lập tracking, lịch báo cáo và các mốc tối ưu cùng khách hàng.', weight: 5, kpi: 'Dashboard, báo cáo và khuyến nghị tối ưu' },
    ].map(phase => ({ ...phase, ownerId: phaseRoles[phase.name], owner: getPhaseOwner(phase), budget: budget ? budget * phase.weight / 100 : null })),
  };
}

export const normalizeMessage = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
const includesWord = (text, word) => ` ${text.replace(/[^a-z0-9]+/g, ' ')} `.includes(` ${word} `);

export function parseOfficeMessage(members, selectedId, value) {
  const text = typeof value === 'string' ? value.trim() : '';
  if (!text || text.length > 500) throw new Error('Nhập tin nhắn từ 1 đến 500 ký tự.');
  const normalized = normalizeMessage(text);
  let targets;
  if (/ca doi|moi nguoi|tat ca|toan doi|ai (dang )?ranh/.test(normalized)) targets = members.map(p => p.id);
  else {
    const fullMatches = members.filter(p => {
      const name = normalizeMessage(p.name).replace(/[^a-z0-9]+/g, ' ').trim();
      const words = name.split(' ');
      return includesWord(normalized, name) || (words.length > 1 && includesWord(normalized, words.slice(-2).join(' '))) || includesWord(normalized, p.id);
    });
    const shortMatches = members.filter(p => {
      const alias = normalizeMessage(p.name).trim().split(/\s+/).at(-1).replace(/[^a-z0-9]/g, '');
      if (!alias) return false;
      // “Làm thử” is a command, not an address to Lãm; short names need address context.
      return new RegExp(`\\b${alias}\\s+oi\\b|^(?:goi\\s+)?${alias}(?:\\s*$|\\s*[,!?]|\\s+(?:tien do|ra day|lai day|dang lam|lam den|xong chua))|\\b(?:goi|cho|cua|chao|hello)\\s+${alias}\\b`).test(normalized);
    });
    const matches = fullMatches.length ? fullMatches : shortMatches;
    if (matches.length === 1) targets = [matches[0].id];
    else if (matches.length > 1) {
      if (members.some(p => p.id === selectedId) && matches.some(p => p.id === selectedId)) targets = [selectedId];
      else return { text, clarification: `Bạn muốn nhắn ${matches.map(p => p.name).join(' hay ')}? Chọn đúng người ở mục “Gửi tới” nhé.` };
    } else if (selectedId === 'all') targets = members.map(p => p.id);
    else if (members.some(p => p.id === selectedId)) targets = [selectedId];
    else return { text, clarification: 'Bạn muốn gọi ai? Viết tên nhân viên hoặc chọn người trong “Gửi tới”. Có thể hỏi “Báo cáo tiến độ cả đội”.' };
  }
  let intent = 'talk', taskTitle;
  if (/^(giao viec|giao|task)\s*[:\-]/.test(normalized) || /^giao cho .+:/.test(normalized)) {
    intent = 'assign'; taskTitle = text.slice(text.search(/[:\-]/) + 1).trim();
    if (!taskTitle || taskTitle.length > 180) throw new Error('Sau “Giao việc:” cần đầu việc từ 1 đến 180 ký tự.');
  } else if (/tien do|bao cao|lam den dau|xong chua|dang lam gi|trang thai|con viec|bao nhieu|ai (dang )?ranh/.test(normalized)) intent = 'progress';
  else if (/dung viec|tam dung|huy viec/.test(normalized)) intent = 'cancel';
  else if (/bat dau|lam thu|xu ly di|lam di/.test(normalized)) intent = 'start';
  else if (/lai day|ra day|den day|goi|\boi\b|co mat|qua day/.test(normalized)) intent = 'call';
  else if (/chao|hello|hi\b/.test(normalized)) intent = 'greet';
  else if (targets.length === 1) {
    const member = members.find(p => p.id === targets[0]);
    const name = normalizeMessage(member.name).replace(/[^a-z0-9]+/g, ' ').trim(), words = name.split(' ');
    if ([name, words.slice(-2).join(' '), words.at(-1), member.id].includes(normalized.replace(/[^a-z0-9]+/g, ' ').trim())) intent = 'call';
  }
  return { text, targets, intent, taskTitle };
}

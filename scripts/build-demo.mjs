import { build } from 'vite';
import fs from 'node:fs/promises';
import { deflateRawSync } from 'node:zlib';

// A self-contained HTML plus a standard ZIP, with no extra build dependencies.
const result = await build({ configFile: false, base: './', build: { write: false, assetsInlineLimit: Infinity, cssCodeSplit: false, rollupOptions: { output: { inlineDynamicImports: true } } } });
const output = Array.isArray(result) ? result[0].output : result.output;
const js = output.filter(f => f.type === 'chunk').map(f => f.code).join('\n').replace(/<\/script/gi, '<\\/script');
const css = output.filter(f => f.fileName.endsWith('.css')).map(f => String(f.source)).join('\n');
const html = String(output.find(f => f.fileName === 'index.html').source)
  .replace(/<script\b[^>]*src=["'][^"']+["'][^>]*><\/script>/gi, '')
  .replace(/<link\b[^>]*(?:rel=["'](?:stylesheet|modulepreload)["'])[^>]*>/gi, '')
  .replace('</head>', () => `<style>${css}</style></head>`)
  .replace('</body>', () => `<script type="module">${js}</script></body>`);
const instructions = 'ATELIER — VĂN PHÒNG CHIẾN LƯỢC 3D\n\nGiải nén và mở Atelier.html bằng Chrome hoặc Edge trên máy tính. Không cần server hoặc cài công cụ lập trình.\n\nKéo để xoay; chọn góc nhìn để xem từng khu. Chọn nhân vật để chào hỏi, động viên, nhắc nghiêm hoặc giao việc. Nhân viên rảnh có thể đi lại và trò chuyện. Box Nhắn đội ngũ nhận tên, hỏi tiến độ, Giao việc: … và lệnh Bắt đầu làm thử. Bàn điều phối có lượt Làm thử mô phỏng và bản nháp theo mẫu, chưa kết nối AI thật.\n\nPretty Please được nhúng qua video YouTube người dùng gửi (cần Internet, có thể cần bấm Play trong video). Có thể chọn nhạc ambient ngoại tuyến thay thế. Nhạc bắt đầu sau lần chạm đầu tiên. Menu ♫ có nút tắt nhạc, âm lượng và giọng đọc (nếu thiết bị có giọng Việt). Nút Chuyển động bật/tắt cử động và cá bơi.\n\nDữ liệu lưu trong trình duyệt này, không đồng bộ. Hãy xuất Markdown để sao lưu kế hoạch; việc lưu khi mở file HTML tùy cài đặt trình duyệt.\n';
await fs.mkdir('.local/atelier-demo', { recursive: true });
await fs.writeFile('.local/atelier-demo/Atelier.html', html);
await fs.writeFile('.local/atelier-demo/HUONG-DAN.txt', instructions);

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) { crc ^= byte; for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0); }
  return (crc ^ 0xffffffff) >>> 0;
}
const locals = [], directory = []; let offset = 0;
for (const [file, content] of [['Atelier.html', html], ['HUONG-DAN.txt', instructions]]) {
  const name = Buffer.from(`Atelier-Demo/${file}`), raw = Buffer.from(content), packed = deflateRawSync(raw), crc = crc32(raw);
  const local = Buffer.alloc(30); local.writeUInt32LE(0x04034b50, 0); local.writeUInt16LE(20, 4); local.writeUInt16LE(0x800, 6); local.writeUInt16LE(8, 8); local.writeUInt16LE(33, 12);
  local.writeUInt32LE(crc, 14); local.writeUInt32LE(packed.length, 18); local.writeUInt32LE(raw.length, 22); local.writeUInt16LE(name.length, 26);
  const central = Buffer.alloc(46); central.writeUInt32LE(0x02014b50, 0); central.writeUInt16LE(20, 4); central.writeUInt16LE(20, 6); central.writeUInt16LE(0x800, 8); central.writeUInt16LE(8, 10); central.writeUInt16LE(33, 14);
  central.writeUInt32LE(crc, 16); central.writeUInt32LE(packed.length, 20); central.writeUInt32LE(raw.length, 24); central.writeUInt16LE(name.length, 28); central.writeUInt32LE(offset, 42);
  locals.push(local, name, packed); directory.push(central, name); offset += local.length + name.length + packed.length;
}
const centralData = Buffer.concat(directory), end = Buffer.alloc(22);
end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(2, 8); end.writeUInt16LE(2, 10); end.writeUInt32LE(centralData.length, 12); end.writeUInt32LE(offset, 16);
await fs.mkdir('downloads', { recursive: true });
await fs.writeFile('downloads/Atelier-Demo.zip', Buffer.concat([...locals, centralData, end]));
console.log('Updated downloads/Atelier-Demo.zip and .local/atelier-demo/Atelier.html');

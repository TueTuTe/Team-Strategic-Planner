import { artworkEntry } from './gallery-artworks.js';

export function galleryEntries(projects = [], checkedTasks = [], demo = null, completedOnly = false, artworks = []) {
  const checked = new Set(checkedTasks);
  const entries = projects.map(plan => {
    const done = plan.phases.filter((_, i) => checked.has(`${plan.id}:${i}`)).length;
    return { plan, done, total: plan.phases.length, kind: done === plan.phases.length && done > 0 ? 'completed' : 'draft' };
  });
  const pictures = artworks.map(artworkEntry);
  if (completedOnly) return [...pictures, ...entries.filter(entry => entry.kind === 'completed')];
  if (pictures.length) return [...pictures, ...entries];
  if (!entries.length && demo) return [{ plan: demo, done: 0, total: demo.phases.length, kind: 'demo' }];
  return entries;
}
export function galleryStatus(entry) {
  return entry.kind === 'artwork' ? 'Ảnh kế hoạch' : entry.kind === 'demo' ? 'Dự án mẫu' : entry.kind === 'completed' ? 'Đã hoàn thành' : `Bản nháp · ${entry.done}/${entry.total} giai đoạn`;
}

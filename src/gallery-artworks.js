const databaseName = 'atelier-gallery-images-v1';
const storeName = 'artworks';
const allowedTypes = new Set(['image/png', 'image/jpeg', 'image/webp']);

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(storeName, { keyPath: 'id' });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('Kho ảnh đang được mở ở một phiên bản khác.'));
  });
}
export async function loadArtworks() {
  const db = await openDatabase();
  try {
    return await new Promise((resolve, reject) => {
      const request = db.transaction(storeName).objectStore(storeName).getAll();
      request.onsuccess = () => resolve(request.result.sort((a,b)=>a.created.localeCompare(b.created) || (a.batchOrder ?? 0) - (b.batchOrder ?? 0)));
      request.onerror = () => reject(request.error);
    });
  } finally { db.close(); }
}
export async function saveArtworks(records) {
  const db = await openDatabase();
  try {
    await new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      for (const record of records) transaction.objectStore(storeName).put(record);
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error || new Error('Không lưu được ảnh.'));
    });
  } finally { db.close(); }
}
export async function validateArtwork(file) {
  if (!allowedTypes.has(file.type)) throw new Error('Chọn ảnh PNG, JPG hoặc WebP.');
  if (file.size > 20 * 1024 * 1024) throw new Error('Mỗi ảnh tối đa 20 MB.');
  const url = URL.createObjectURL(file), image = new Image();
  try { image.src = url; await image.decode(); if (!image.naturalWidth) throw new Error(); }
  catch { throw new Error('Không đọc được tệp ảnh này.'); }
  finally { URL.revokeObjectURL(url); }
}
export function artworkEntry(artwork) {
  return { kind: 'artwork', imageSrc: artwork.imageSrc, done: 0, total: 0,
    plan: { id: artwork.id, client: artwork.title, objective: 'Ảnh kế hoạch do bạn thêm vào phòng triển lãm.', phases: [] } };
}

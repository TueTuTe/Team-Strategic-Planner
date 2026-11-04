import * as THREE from 'three';
import { galleryBridge, galleryBridgeHeight, galleryPanelZ } from './gallery-layout.js';
import { galleryStatus } from './gallery-plans.js';

export function buildStrategyGallery({ scene, box, cylinder, sphere, mat, textures }) {
  const gallery = new THREE.Group(); gallery.name = 'strategy-gallery'; scene.add(gallery);
  // A continuous river separates the entire building from both the garden and bar.
  box(4.2, .38, 28.8, 'walnut', 24.1, -.23, -7.2, gallery);
  box(4.18, .09, 28.8, '#487f75', 24.1, .14, -7.2, gallery);
  const river = new THREE.Mesh(new THREE.PlaneGeometry(4.18, 28.8), new THREE.MeshStandardMaterial({ color: '#85bdac', transparent: true, opacity: .7, roughness: .25, depthWrite: false }));
  river.rotation.x = -Math.PI / 2; river.position.set(24.1, .27, -7.2); river.name = 'gallery-separating-river'; gallery.add(river);
  const rocks = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), mat('#929580'), 120), dummy = new THREE.Object3D(); let count = 0;
  for (const x of [22.05, 26.15]) for (let i = 0; i < 58; i++) {
    const z = -21.3 + i * .49; if (Math.abs(z - galleryBridge.z) < 1.25 || (x < 23 && z > -11.65 && z < -7.15)) continue;
    dummy.position.set(x, .22, z); dummy.rotation.set(i, i * .6, .2); dummy.scale.set(.32, .24 + i % 3 * .025, .36 + i % 2 * .06); dummy.updateMatrix(); rocks.setMatrixAt(count++, dummy.matrix);
  }
  rocks.count = count; rocks.castShadow = true; gallery.add(rocks);
  // Only the garden side has a bridge and a door. The wall facing Izakaya stays closed.
  const bridge = new THREE.Group(); bridge.name = 'garden-gallery-bridge'; gallery.add(bridge);
  for (let i = 0; i <= 25; i++) {
    const t = i / 25, x = galleryBridge.startX + t * 5.3;
    const plank = box(.205, .1, galleryBridge.width, 'oak', x, galleryBridgeHeight(t) - .05, galleryBridge.z, bridge);
    plank.rotation.z = Math.atan(.56 * Math.PI * Math.cos(t * Math.PI) / 5.3);
  }
  function beam(a, b, r, color, parent = gallery) {
    const delta = new THREE.Vector3().subVectors(b, a), mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, delta.length(), 8), mat(color));
    mesh.position.copy(a).add(b).multiplyScalar(.5); mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize()); mesh.castShadow = true; parent.add(mesh);
  }
  for (const side of [-1, 1]) for (let i = 0; i <= 8; i++) {
    const t = i / 8, x = galleryBridge.startX + t * 5.3, z = galleryBridge.z + side * .95, y = galleryBridgeHeight(t);
    box(.09, .84, .09, 'walnut', x, y + .4, z, bridge);
    if (i) for (const h of [.35, .8]) beam(new THREE.Vector3(x - 5.3 / 8, galleryBridgeHeight((i - 1) / 8) + h, z), new THREE.Vector3(x, y + h, z), .036, 'walnut', bridge);
  }
  for (let i = 0; i < 13; i++) cylinder(.36, .4, .06, '#bdbba3', 13.3 + i * .6, .12, 6.6, gallery);
  cylinder(.4, .43, .06, '#bdbba3', 21.1, .12, 6.05, gallery);
  const floor = box(9.2, .38, 28.8, 'walnut', 30.8, -.03, -7.2, gallery); floor.name = 'strategy-gallery-floor';
  for (let i = 0; i < 24; i++) box(.37, .07, 28.6, i % 2 ? 'floor0' : 'floor2', 26.43 + i * .38, .195, -7.2, gallery);
  box(.16, 3.45, 28.4, '#e0d3b9', 35.2, 1.97, -7.2, gallery);
  box(9, 3.45, .16, '#e0d3b9', 30.8, 1.97, -21.4, gallery);
  box(9, .68, .13, 'walnut', 30.8, .57, 7.03, gallery);
  box(9, 2.6, .035, 'glass', 30.8, 2.2, 7.04, gallery);
  // Modular shoji: one opening at the garden end, no openings along the bar.
  for (const [from, to] of [[-21.3, -18.1], [-18.1, -14.9], [-14.9, -11.7], [-11.7, -8.5], [-8.5, -5.3], [-5.3, -2.1], [-2.1, 1.1], [1.1, 4.4], [6.6, 7]]) {
    const z = (from + to) / 2, d = to - from;
    box(.045, 3.05, d - .06, 'paper', 26.4, 1.86, z, gallery);
    for (const edge of [from, to]) box(.11, 3.5, .09, 'walnut', 26.4, 1.97, edge, gallery);
    for (let row = 0; row < 7; row++) box(.075, .035, d, 'oak', 26.44, .49 + row * .43, z, gallery);
    for (let col = 1; col < 4; col++) box(.075, 3.05, .035, 'oak', 26.44, 1.86, from + d * col / 4, gallery);
  }
  for (const x of [26.4, 35.2]) {
    box(.22, .22, 28.7, 'walnut', x, 3.86, -7.2, gallery);
    for (const z of [-21.3, -14.2, -7.1, 0, 7]) box(.17, 3.78, .17, 'walnut', x, 2.08, z, gallery);
  }
  for (const z of [-21.3, 7]) box(9.25, .21, .22, 'walnut', 30.8, 3.86, z, gallery);
  const entry = new THREE.Group(); entry.name = 'gallery-garden-entrance'; entry.position.set(26.4, 0, 5.5); entry.rotation.y = -Math.PI / 2; gallery.add(entry);
  for (const x of [-1.1, 1.1]) box(.12, 2.85, .16, 'walnut', x, 1.65, 0, entry);
  box(2.5, .14, .23, 'oak', 0, 3.1, 0, entry);
  for (let i = 0; i < 3; i++) box(.65, .52, .03, '#44594e', -.69 + i * .69, 2.76, .035, entry);
  for (const z of [4.15, 6.85]) {
    cylinder(.012, .012, .28, '#675540', 26.2, 3.35, z, gallery);
    const lantern = sphere(.23, 'lantern', 26.2, 3.0, z, gallery); lantern.scale.y = 1.3;
  }
  // Paper lamps and benches retain the Japanese study character of the campus.
  for (const z of [-17, -7, 3]) {
    box(8.9, .16, .15, 'walnut', 30.8, 3.86, z, gallery);
    cylinder(.012, .012, .32, '#675540', 30.8, 3.57, z, gallery);
    cylinder(.31, .31, .44, 'lantern', 30.8, 3.2, z, gallery);
    const glow = new THREE.PointLight('#ffdb9d', 10, 8, 2); glow.position.set(30.8, 3, z); gallery.add(glow);
  }
  box(1, .12, 3.2, 'oak', 30.8, .7, -16.4, gallery);
  for (const z of [-17.6, -15.2]) box(.65, .42, .13, 'walnut', 30.8, .43, z, gallery);
  box(2.2, .12, 5.8, 'oak', 30.8, 1.0, -6.5, gallery);
  for (const x of [29.95, 31.65]) for (const z of [-8.8, -4.2]) box(.12, .75, .12, 'walnut', x, .61, z, gallery);
  for (let i = 0; i < 4; i++) {
    box(1.25, .02, .8, '#e5ddc5', 30.8, 1.08, -8.2 + i * 1.1, gallery);
    for (let j = 0; j < 3; j++) box(.13 + j * .07, .025, .06, '#88977b', 30.5 + j * .23, 1.095, -8.2 + i * 1.1, gallery);
  }
  function canvasSign(name, w, h, position, rotation) {
    const canvas = document.createElement('canvas'); canvas.width = 1280; canvas.height = 720;
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; textures[name] = texture;
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: texture, toneMapped: false })); mesh.name = name; mesh.position.set(...position); mesh.rotation.y = rotation; gallery.add(mesh);
    return { ctx: canvas.getContext('2d'), texture, canvas };
  }
  const header = canvasSign('gallery-title', 5.4, 3.04, [30.8, 2, -21.29], 0);
  header.ctx.fillStyle = '#334b3d'; header.ctx.fillRect(0, 0, 1280, 720); header.ctx.fillStyle = '#ede2c6'; header.ctx.font = '600 76px sans-serif';
  header.ctx.fillText('STRATEGY', 100, 210); header.ctx.fillText('GALLERY', 100, 310); header.ctx.font = '32px sans-serif'; header.ctx.fillText('PHÒNG TRIỂN LÃM CHIẾN LƯỢC', 100, 430);
  header.ctx.font = '23px sans-serif'; header.ctx.fillText('Từ brief đầu tiên đến những kế hoạch đã hoàn thành.', 100, 545); header.texture.needsUpdate = true;
  const displays = galleryPanelZ.map((z, i) => {
    const frame = box(.1, 2.28, 3.72, 'walnut', 35.04, 1.85, z, gallery); frame.name = `gallery-plan-frame-${i}`;
    const display = canvasSign(`gallery-plan-${i}`, 3.5, 1.97, [34.978, 1.85, z], -Math.PI / 2);
    box(.65, .52, 2.5, 'oak', 34.4, .51, z, gallery);
    cylinder(.09, .09, .75, '#d4c5a4', 34.3, .86, z, gallery).rotation.x = Math.PI / 2;
    return { ...display, mesh: gallery.getObjectByName(`gallery-plan-${i}`) };
  });
  let entries = [], start = 0, changed = () => {}, disposed = false;
  const imageCache = new Map();
  function artworkImage(src) {
    if (!imageCache.has(src)) {
      const image = new Image(), record = { image, ready: false, failed: false }; imageCache.set(src, record);
      image.onload = () => { if (!disposed) { record.ready = true; draw(); changed(); } };
      image.onerror = () => { if (!disposed) { record.failed = true; draw(); changed(); } };
      image.src = src;
    }
    return imageCache.get(src);
  }
  function lines(ctx, value, x, y, maxWidth, size, limit) {
    const words = String(value ?? '').split(/\s+/u); let line = '', row = 0;
    for (const word of words) {
      const next = line ? `${line} ${word}` : word;
      if (ctx.measureText(next).width > maxWidth && line) { ctx.fillText(line, x, y + row++ * size); line = word; if (row >= limit - 1) break; } else line = next;
    }
    ctx.fillText(line.slice(0, 100), x, y + row * size);
  }
  function draw() {
    displays.forEach(({ ctx, texture }, i) => {
      const entry = entries[start + i]; ctx.fillStyle = '#e9e1cc'; ctx.fillRect(0, 0, 1280, 720);
      ctx.fillStyle = '#52694f'; ctx.font = '25px sans-serif'; ctx.fillText(`ATELIER / PLAN ${String(start + i + 1).padStart(2, '0')}`, 65, 65);
      ctx.fillStyle = '#334b3d';
      if (entry?.kind === 'artwork') {
        ctx.fillStyle = '#181d19'; ctx.fillRect(28, 25, 1224, 590);
        const record = artworkImage(entry.imageSrc);
        if (record.ready) {
          const { image } = record, scale = Math.min(1224 / image.naturalWidth, 590 / image.naturalHeight);
          const w = image.naturalWidth * scale, h = image.naturalHeight * scale;
          ctx.drawImage(image, 28 + (1224 - w) / 2, 25 + (590 - h) / 2, w, h);
        } else {
          ctx.fillStyle = '#e9e1cc'; ctx.font = '30px sans-serif'; ctx.fillText(record.failed ? 'Không tải được ảnh' : 'Đang treo ảnh…', 70, 300);
        }
        ctx.fillStyle = '#334b3d'; ctx.font = '600 30px sans-serif'; lines(ctx, entry.plan.client, 48, 666, 1180, 34, 1);
      } else if (entry) {
        ctx.font = '600 57px sans-serif'; lines(ctx, entry.plan.client, 65, 158, 1150, 65, 2);
        ctx.font = '25px sans-serif'; ctx.fillText(galleryStatus(entry), 65, 300);
        ctx.font = '31px sans-serif'; lines(ctx, entry.plan.objective, 65, 378, 1150, 43, 3);
        ctx.font = '25px sans-serif'; lines(ctx, `Đối tượng: ${entry.plan.audience || 'Chưa xác định'}`, 65, 535, 1150, 34, 2);
        ctx.fillStyle = '#708368'; ctx.font = '23px sans-serif'; ctx.fillText(entry.plan.phases.map(p => p.name).join(' → ').slice(0, 100), 65, 660);
      } else {
        ctx.font = '600 53px sans-serif'; ctx.fillText('Câu chuyện tiếp theo', 65, 245);
        ctx.font = '31px sans-serif'; ctx.fillText('Không gian dành cho những kế hoạch của bạn.', 65, 345);
        ctx.font = '25px sans-serif'; ctx.fillText('Tạo và lưu plan để trưng bày tại đây.', 65, 440);
      }
      texture.needsUpdate = true;
    });
  }
  const waterLines = Array.from({ length: 30 }, (_, i) => box(.025, .008, .45 + i % 3 * .18, '#b6d7bf', 22.6 + i % 3 * 1.45, .283, -21 + Math.floor(i / 3) * 2.8, gallery));
  draw();
  return {
    setEntries(next, selectedId, onChange = () => {}) { entries = next; changed = onChange; const active = new Set(entries.filter(entry=>entry.kind === 'artwork').map(entry=>entry.imageSrc)); for (const [src, record] of imageCache) if (!active.has(src)) { record.image.onload = record.image.onerror = null; imageCache.delete(src); } const index = entries.findIndex(entry => entry.plan.id === selectedId); start = index < 0 ? 0 : Math.floor(index / 5) * 5; draw(); },
    showPlan(index) { if (!entries[index]) return null; start = Math.floor(index / 5) * 5; draw(); return { target: [34.95, 1.85, galleryPanelZ[index % 5]], offset: [-6.2, 2.8, 2] }; },
    pick(raycaster) { const hit = raycaster.intersectObjects(scene.children, true).find(hit=>!(hit.object.material?.transparent && hit.object.material.opacity < .5)); if (!hit) return null; const index = displays.findIndex(d=>d.mesh === hit.object); return index < 0 ? null : entries[start + index] || null; },
    dispose() { disposed = true; for (const record of imageCache.values()) record.image.onload = record.image.onerror = null; imageCache.clear(); },
    animate(time) { waterLines.forEach((line, i) => { line.position.z = -21.2 + ((Math.floor(i / 3) * 2.8 + time * .27) % 28.1); }); },
  };
}

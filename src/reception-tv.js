import * as THREE from 'three';
import { receptionTV } from './reception-layout.js';

export function buildReceptionTV({ parent, box, textures }) {
  const tv = new THREE.Group(); tv.name = 'reception-wall-tv'; tv.position.set(...receptionTV.position); tv.rotation.y = receptionTV.rotation; parent.add(tv);
  for (const x of [-.9, .9]) box(.12, .65, .08, '#3a3c34', x, 0, -.08, tv);
  box(receptionTV.width + .18, receptionTV.height + .18, .12, '#252b27', 0, 0, 0, tv);
  const canvas = document.createElement('canvas'); canvas.width = 1280; canvas.height = 720;
  const ctx = canvas.getContext('2d'), texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; textures.receptionTV = texture;
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(receptionTV.width, receptionTV.height), new THREE.MeshBasicMaterial({ map: texture, toneMapped: false }));
  screen.name = 'reception-tv-display'; screen.position.z = .066; tv.add(screen);
  const led = new THREE.Mesh(new THREE.SphereGeometry(.013, 8, 6), new THREE.MeshBasicMaterial({ color: '#b5cf91', toneMapped: false }));
  led.position.set(receptionTV.width / 2 - .12, -receptionTV.height / 2 - .045, .065); tv.add(led);
  let enabled = true, content = 'welcome';
  function draw() {
    ctx.fillStyle = enabled ? '#193b30' : '#101712'; ctx.fillRect(0, 0, 1280, 720);
    if (enabled && content === 'welcome') {
      ctx.fillStyle = '#b9c9a4'; ctx.font = '500 25px sans-serif'; ctx.fillText('ATELIER  /  WELCOME', 75, 90);
      ctx.fillStyle = '#f2e9cf'; ctx.font = '600 72px sans-serif'; ctx.fillText('Một cuộc gặp.', 75, 260); ctx.fillText('Vạn ý tưởng.', 75, 351);
      ctx.fillStyle = '#c8d2b5'; ctx.font = '28px sans-serif'; ctx.fillText('Mời bạn ngồi chờ và thưởng thức trà.', 75, 445);
      ctx.strokeStyle = '#b4c59a'; ctx.lineWidth = 13; ctx.beginPath(); ctx.arc(1010, 294, 136, .1, Math.PI * 1.94); ctx.stroke();
      ctx.strokeStyle = '#8ba17c'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(912, 426); ctx.quadraticCurveTo(979, 319, 1118, 302); ctx.stroke();
      for (let i = 0; i < 9; i++) { ctx.fillStyle = i % 2 ? '#e8bec3' : '#f1d2cb'; ctx.beginPath(); ctx.arc(975 + i * 15, 363 - i * 7 + Math.sin(i) * 14, 8 + i % 3, 0, Math.PI * 2); ctx.fill(); }
      ctx.fillStyle = '#c0ccab'; ctx.font = '19px sans-serif'; ctx.fillText('STRATEGY  ·  INSIGHT  ·  CREATIVE  ·  MEDIA  ·  ACCOUNT', 75, 645);
    } else if (enabled) {
      ctx.fillStyle = '#e6dcc4'; ctx.fillRect(0, 0, 1280, 720);
      ctx.fillStyle = '#b75a45'; ctx.beginPath(); ctx.arc(976, 180, 62, 0, Math.PI * 2); ctx.fill();
      for (let layer = 0; layer < 4; layer++) {
        ctx.fillStyle = ['#b9baa7', '#a1a58e', '#788b72', '#425f4e'][layer]; ctx.beginPath(); ctx.moveTo(0, 720);
        for (let x = 0; x <= 1280; x += 8) ctx.lineTo(x, 310 + layer * 92 + Math.sin(x * .004 + layer * 1.4) * 90 + Math.sin(x * .009 + layer) * 39);
        ctx.lineTo(1280, 720); ctx.closePath(); ctx.fill();
      }
      ctx.fillStyle = '#3e5949'; ctx.font = '500 25px sans-serif'; ctx.fillText('ATELIER  /  MỘT KHOẢNG LẶNG', 75, 83);
    }
    led.material.color.set(enabled ? '#b5cf91' : '#77503d'); texture.needsUpdate = true;
  }
  draw();
  return {
    snapshot: () => ({ enabled, content }),
    toggle() { enabled = !enabled; draw(); return this.snapshot(); },
    setContent(value) { if (['welcome', 'landscape'].includes(value)) { content = value; enabled = true; draw(); } return this.snapshot(); },
  };
}

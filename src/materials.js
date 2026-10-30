import * as THREE from 'three';

// Small, deterministic textures keep the room self-contained and reproducible.
export function makeOfficeTextures() {
  let seed = 73;
  const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  function canvasTexture(width, height, draw) {
    const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
    draw(canvas.getContext('2d'), width, height);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    return texture;
  }
  const wood = canvasTexture(256, 1024, (ctx, w, h) => {
    ctx.fillStyle = '#a68b6d'; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 320; i++) {
      const x = random() * w;
      ctx.strokeStyle = `rgba(${random() > .45 ? '55,27,12' : '235,193,131'},${.05 + random() * .14})`;
      ctx.lineWidth = .3 + random() * 1.4; ctx.beginPath(); ctx.moveTo(x, 0);
      for (let y = 0; y <= h; y += 20) ctx.lineTo(x + Math.sin(y * .012 + i) * (1 + random() * 3), y);
      ctx.stroke();
    }
  });
  const tatami = canvasTexture(256, 512, (ctx, w, h) => {
    ctx.fillStyle = '#beb48a'; ctx.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 3) {
      ctx.fillStyle = y % 2 ? '#d4c99b' : '#a59c73'; ctx.fillRect(0, y, w, 1);
      for (let x = 0; x < w; x += 16) {
        ctx.fillStyle = `rgba(81,80,50,${random() * .23})`; ctx.fillRect(x, y, 1, 3);
      }
    }
  });
  const paper = canvasTexture(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#f5ecd5'; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 4500; i++) {
      ctx.fillStyle = `rgba(139,118,79,${random() * .08})`;
      ctx.fillRect(random() * w, random() * h, 1, 1 + random() * 4);
    }
  });
  const artwork = canvasTexture(512, 640, (ctx, w, h) => {
    ctx.fillStyle = '#e6dcc4'; ctx.fillRect(0, 0, w, h);
    // An original ink landscape: mountains, mist and a vermilion sun.
    ctx.fillStyle = '#a34d38'; ctx.beginPath(); ctx.arc(355, 165, 42, 0, Math.PI * 2); ctx.fill();
    for (let layer = 0; layer < 4; layer++) {
      ctx.fillStyle = ['#b5b5a2', '#9b9e8b', '#757e70', '#4b5b50'][layer];
      ctx.beginPath(); ctx.moveTo(0, h);
      for (let x = 0; x <= w; x += 6) ctx.lineTo(x, 280 + layer * 65 + Math.sin(x * .009 + layer) * 50 + Math.sin(x * .021 + layer * 3) * 22);
      ctx.lineTo(w, h); ctx.fill();
    }
    ctx.fillStyle = '#954b35'; ctx.fillRect(420, 548, 22, 26);
  });
  return { wood, tatami, paper, artwork };
}

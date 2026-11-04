import * as THREE from 'three';
import { izakayaBridge, bridgeHeight } from './izakaya-layout.js';

export function buildIzakaya({ scene, box, cylinder, sphere, mat, textures }) {
  const bar = new THREE.Group(); bar.name = 'izakaya-after-hours'; scene.add(bar);
  // The stream occupies the gap between the garden and the rear pavilion.
  box(12.8, .38, 4.5, 'walnut', 15.6, -.23, -9.4, bar);
  box(12.65, .09, 4.38, '#487f75', 15.6, -.04, -9.4, bar);
  const waterMaterial = new THREE.MeshStandardMaterial({ color: '#85bdac', roughness: .22, transparent: true, opacity: .32, depthWrite: false, side: THREE.DoubleSide });
  const stream = new THREE.Mesh(new THREE.PlaneGeometry(12.8, 4.4), waterMaterial);
  stream.rotation.x = -Math.PI / 2; stream.position.set(15.6, .27, -9.4); stream.name = 'izakaya-stream'; bar.add(stream);
  const outletShape = new THREE.Shape();
  outletShape.moveTo(18.6, -2.9); outletShape.bezierCurveTo(19.9, -4.6, 20.4, -5.9, 19.25, -8.5);
  outletShape.lineTo(21.25, -8.5); outletShape.bezierCurveTo(22.1, -5.8, 21.7, -4.1, 20.1, -2.5); outletShape.closePath();
  const outlet = new THREE.Mesh(new THREE.ShapeGeometry(outletShape, 32), waterMaterial);
  outlet.rotation.x = Math.PI / 2; outlet.position.y = .275; outlet.name = 'koi-pond-stream-outlet'; bar.add(outlet);
  const rockGeometry = new THREE.IcosahedronGeometry(1, 1);
  function rock(x, z, scale = .35) {
    const mesh = new THREE.Mesh(rockGeometry, mat('#929580')); mesh.position.set(x, .22, z);
    mesh.scale.set(scale * 1.3, scale * .75, scale); mesh.rotation.set(x, z, .3); mesh.castShadow = true; bar.add(mesh);
  }
  for (let i = 0; i < 23; i++) {
    const x = 9.5 + i * .55;
    if (Math.abs(x - izakayaBridge.x) > 1.2 && Math.abs(x - 20.2) > 1.25) rock(x, -7.2);
    if (Math.abs(x - izakayaBridge.x) > 1.2) rock(x, -11.6);
  }
  for (let i = 0; i < 8; i++) {
    const t = i / 7; rock(18.9 + Math.sin(t * Math.PI) * .8, -3.7 - t * 3.2, .24);
    rock(20.9 + Math.sin(t * Math.PI) * .55, -3.6 - t * 3.5, .27);
  }
  // An arched footbridge with open railings crosses the water.
  const bridge = new THREE.Group(); bridge.name = 'garden-izakaya-bridge'; bar.add(bridge);
  for (let i = 0; i <= 24; i++) {
    const t = i / 24, z = izakayaBridge.startZ + (izakayaBridge.endZ - izakayaBridge.startZ) * t;
    const plank = box(izakayaBridge.width, .1, .205, 'oak', izakayaBridge.x, bridgeHeight(t) - .05, z, bridge);
    plank.rotation.x = Math.atan(.64 * Math.PI * Math.cos(t * Math.PI) / 5.2);
  }
  function beamBetween(a, b, radius, color, parent) {
    const direction = new THREE.Vector3().subVectors(b, a);
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, direction.length(), 8), mat(color));
    mesh.position.copy(a).add(b).multiplyScalar(.5); mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize()); mesh.castShadow = true; parent.add(mesh);
  }
  for (const side of [-1, 1]) {
    const x = izakayaBridge.x + side * .91;
    for (let i = 0; i <= 8; i++) {
      const t = i / 8, z = izakayaBridge.startZ - 5.2 * t, y = bridgeHeight(t);
      box(.09, .86, .09, 'walnut', x, y + .4, z, bridge);
      if (i) for (const height of [.35, .81]) beamBetween(new THREE.Vector3(x, bridgeHeight((i - 1) / 8) + height, z + .65), new THREE.Vector3(x, y + height, z), .037, 'walnut', bridge);
    }
  }
  for (let i = 0; i < 5; i++) cylinder(.44, .46, .06, '#bdbba3', 11.05 + i * .64, .11, -6.25, bar);
  // Open roof and facade keep the counter and people visible from above.
  box(12.8, .38, 10, 'walnut', 15.6, -.03, -16.6, bar);
  for (let i = 0; i < 32; i++) box(.38, .07, 9.8, i % 2 ? 'floor0' : 'floor1', 9.55 + i * .39, .195, -16.6, bar);
  box(12.5, 3.6, .16, '#695243', 15.6, 1.99, -21.4, bar);
  for (const x of [9.4, 21.8]) for (const z of [-12, -16.5, -21.35]) box(.19, 3.85, .19, 'walnut', x, 2.05, z, bar);
  for (const z of [-12, -21.35]) box(12.9, .22, .23, 'walnut', 15.6, 4.02, z, bar);
  for (const x of [9.4, 21.8]) box(.22, .22, 9.55, 'walnut', x, 4.02, -16.65, bar);
  for (let i = 0; i < 19; i++) box(.075, 2.3, .09, 'oak', 9.4, 1.38, -16.4 - i * .26, bar);
  // Back bar shelves, sake bottles and cups.
  for (const y of [1.15, 2.05, 2.9]) {
    box(10.25, .1, .55, 'oak', 15.8, y, -21.02, bar);
    for (let i = 0; i < 14; i++) {
      const x = 11.1 + i * .72, bottleColor = ['#476353', '#a77342', '#c5b78d', '#774e41'][i % 4];
      cylinder(.09, .105, .36 + i % 3 * .035, bottleColor, x, y + .23, -20.96, bar);
      cylinder(.04, .046, .13, bottleColor, x, y + .47 + i % 3 * .018, -20.96, bar);
      box(.12, .15, .012, '#e5d4b1', x, y + .24, -20.85, bar);
    }
  }
  box(8.65, 1.03, .8, 'walnut', 16.25, .75, -18.65, bar);
  box(9, .13, 1.05, 'oak', 16.25, 1.33, -18.65, bar);
  for (let i = 0; i < 28; i++) box(.035, .9, .045, 'oak', 12.1 + i * .3, .76, -18.22, bar);
  for (const x of [13.6, 15.5, 17.4, 19.3]) {
    cylinder(.29, .31, .12, '#705044', x, .88, -17.2, bar);
    for (const dx of [-.18, .18]) for (const dz of [-.18, .18]) box(.065, .65, .065, 'walnut', x + dx, .54, -17.2 + dz, bar);
    cylinder(.065, .065, .13, '#e4d5b9', x, 1.46, -18.42, bar);
    cylinder(.2, .2, .035, '#626a50', x + .38, 1.415, -18.56, bar);
    for (let i = 0; i < 3; i++) sphere(.045, '#bb8054', x + .28 + i * .09, 1.46, -18.55, bar);
  }
  // Beer taps and a compact table for a quieter conversation.
  for (const x of [18.6, 19]) {
    cylinder(.035, .035, .42, '#a99b78', x, 1.61, -18.95, bar);
    box(.17, .065, .07, '#a99b78', x, 1.8, -18.88, bar);
  }
  box(1.5, .11, 1.4, 'oak', 19.2, .92, -14.6, bar);
  box(.16, .7, .16, 'walnut', 19.2, .56, -14.6, bar);
  for (const x of [18.1, 20.3]) { cylinder(.31, .32, .13, 'walnut', x, .66, -14.6, bar); cylinder(.09, .15, .38, 'walnut', x, .43, -14.6, bar); }
  for (const x of [18.9, 19.5]) cylinder(.07, .065, .16, '#d5c9aa', x, 1.06, -14.6, bar);
  cylinder(.4, .4, .74, 'oak', 21, .62, -19.8, bar);
  for (const y of [.32, .85]) cylinder(.41, .41, .055, '#514d40', 21, y, -19.8, bar);
  // Five red paper lanterns and a noren curtain establish the Izakaya mood.
  const lanternMaterial = new THREE.MeshStandardMaterial({ color: '#ba352b', emissive: '#d84724', emissiveIntensity: .35, roughness: .9 });
  const lanterns = [];
  for (let i = 0; i < 5; i++) {
    const x = 10.5 + i * 2.55, z = -12.55;
    cylinder(.015, .015, .53, '#483c31', x, 3.66, z, bar);
    const lantern = new THREE.Mesh(new THREE.SphereGeometry(.31, 16, 12), lanternMaterial); lantern.scale.y = 1.35; lantern.position.set(x, 3.03, z); bar.add(lantern); lanterns.push(lantern);
    for (const y of [2.67, 3.4]) cylinder(.16, .16, .065, 'walnut', x, y, z, bar);
    for (let j = 0; j < 7; j++) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(.3 * Math.sqrt(1 - Math.pow((j - 3) / 4.2, 2)), .009, 4, 24), mat('#88513b'));
      ring.rotation.x = Math.PI / 2; ring.position.set(x, 2.73 + j * .1, z); bar.add(ring);
    }
    if (i % 2 === 0) { const glow = new THREE.PointLight('#ffb260', 13, 8, 2); glow.position.set(x, 2.75, z - 1); bar.add(glow); }
  }
  for (let i = 0; i < 5; i++) box(.78, .72, .035, '#3e5656', 16.45 + i * .83, 3.12, -12.06, bar);
  const signCanvas = document.createElement('canvas'); signCanvas.width = 1024; signCanvas.height = 256;
  const ctx = signCanvas.getContext('2d'); ctx.fillStyle = '#49392d'; ctx.fillRect(0, 0, 1024, 256);
  ctx.fillStyle = '#f2d6a0'; ctx.font = '600 100px serif'; ctx.textAlign = 'center'; ctx.fillText('IZAKAYA', 512, 131);
  ctx.font = '22px sans-serif'; ctx.fillText('SAKE  ·  SMALL PLATES  ·  GOOD COMPANY', 512, 195);
  const signTexture = new THREE.CanvasTexture(signCanvas); signTexture.colorSpace = THREE.SRGBColorSpace; textures.izakayaSign = signTexture;
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(4.8, 1.2), new THREE.MeshStandardMaterial({ map: signTexture, roughness: .8, emissive: '#ad7435', emissiveIntensity: .15 }));
  sign.position.set(15.5, 3.18, -20.65); bar.add(sign);
  const surfaceLines = [];
  for (let i = 0; i < 20; i++) {
    const line = box(.35 + i % 4 * .16, .008, .025, '#b6d7bf', 9.6 + i % 10 * 1.23, .283, -8 - Math.floor(i / 10) * 2.3, bar); surfaceLines.push(line);
  }
  return time => {
    surfaceLines.forEach((line, i) => { line.position.x = 9.5 + ((i % 10 * 1.23 + time * .23) % 12.1); line.position.z = -8 - Math.floor(i / 10) * 2.3 + Math.sin(time * .8 + i) * .12; });
    lanterns.forEach((lantern, i) => { lantern.rotation.z = Math.sin(time * .7 + i) * .035; });
  };
}

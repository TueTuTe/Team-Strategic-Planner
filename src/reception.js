import * as THREE from 'three';
import { receptionBridge, receptionBridgeHeight, receptionSofa } from './reception-layout.js';

export function buildReception({ scene, box, cylinder, sphere, mat, textures }) {
  const lobby = new THREE.Group(); lobby.name = 'japanese-reception'; scene.add(lobby);
  // Continue the same stream west from the garden–Izakaya channel.
  box(18.5, .38, 4.5, 'walnut', .05, -.23, -9.4, lobby);
  box(18.5, .09, 4.38, '#487f75', .05, .14, -9.4, lobby);
  const water = new THREE.Mesh(new THREE.PlaneGeometry(18.5, 4.38), new THREE.MeshStandardMaterial({ color: '#85bdac', roughness: .22, transparent: true, opacity: .7, depthWrite: false }));
  water.rotation.x = -Math.PI / 2; water.position.set(.05, .27, -9.4); water.name = 'reception-stream-continuation'; lobby.add(water);
  const stones = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), mat('#929580'), 64), dummy = new THREE.Object3D();
  let index = 0;
  for (const z of [-7.2, -11.6]) for (let i = 0; i < 36; i++) {
    const x = -9 + i * .51; if (Math.abs(x - receptionBridge.x) < 1.1) continue;
    dummy.position.set(x, .22, z); dummy.scale.set(.38 + i % 3 * .03, .24, .3); dummy.rotation.set(i, i * .7, .2); dummy.updateMatrix(); stones.setMatrixAt(index++, dummy.matrix);
  }
  stones.count = index; stones.castShadow = true; lobby.add(stones);

  const bridge = new THREE.Group(); bridge.name = 'office-reception-lantern-bridge'; lobby.add(bridge);
  function beam(a, b, radius, color, parent = bridge) {
    const d = new THREE.Vector3().subVectors(b, a);
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, d.length(), 8), mat(color));
    mesh.position.copy(a).add(b).multiplyScalar(.5); mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); mesh.castShadow = true; parent.add(mesh);
  }
  for (let i = 0; i <= 24; i++) {
    const t = i / 24, z = receptionBridge.startZ - t * 5.2;
    const plank = box(receptionBridge.width, .1, .205, 'oak', receptionBridge.x, receptionBridgeHeight(t) - .05, z, bridge);
    plank.rotation.x = Math.atan(.56 * Math.PI * Math.cos(t * Math.PI) / 5.2);
  }
  const lanterns = [];
  for (const side of [-1, 1]) {
    const x = receptionBridge.x + side * 1;
    for (let i = 0; i <= 8; i++) {
      const t = i / 8, z = receptionBridge.startZ - t * 5.2, y = receptionBridgeHeight(t);
      box(.09, .86, .09, 'walnut', x, y + .4, z, bridge);
      if (i) for (const h of [.35, .81]) beam(new THREE.Vector3(x, receptionBridgeHeight((i - 1) / 8) + h, z + .65), new THREE.Vector3(x, y + h, z), .038, 'walnut');
    }
    for (const z of [-7, -11.8]) box(.11, 3.35, .11, 'walnut', x, 1.92, z, bridge);
    const ropePoints = Array.from({ length: 17 }, (_, i) => new THREE.Vector3(x, 3.6 - Math.sin(i / 16 * Math.PI) * .16, -7 - i / 16 * 4.8));
    const rope = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(ropePoints), 20, .018, 5, false), mat('#5d4b38')); bridge.add(rope);
    for (let i = 0; i < 4; i++) {
      const t = (i + .5) / 4, z = -7 - t * 4.8, top = 3.6 - Math.sin(t * Math.PI) * .16;
      const group = new THREE.Group(); group.position.set(x, top - .13, z); group.name = 'reception-bridge-lantern'; bridge.add(group);
      cylinder(.012, .012, .15, '#594a37', 0, 0, 0, group);
      const globe = sphere(.21, i % 2 ? '#bc4b36' : 'lantern', 0, -.35, 0, group); globe.scale.y = 1.3;
      for (const y of [-.59, -.11]) cylinder(.115, .115, .04, 'walnut', 0, y, 0, group);
      for (let j = 0; j < 5; j++) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(.21 * Math.sqrt(1 - ((j - 2) / 3.2) ** 2), .007, 4, 20), mat('#987b55'));
        ring.rotation.x = Math.PI / 2; ring.position.set(0, -.53 + j * .09, 0); group.add(ring);
      }
      if (i === 1 || i === 3) { const light = new THREE.PointLight('#ffd293', 4, 4, 2); light.position.set(x, 2.9, z); bridge.add(light); }
      lanterns.push(group);
    }
  }
  for (const z of [-7, -11.8]) box(2.4, .12, .15, 'walnut', .3, 3.61, z, bridge);

  // The remaining rear quadrant becomes a spacious Japanese reception pavilion.
  box(18.4, .38, 10, 'walnut', 0, -.03, -16.6, lobby);
  for (let i = 0; i < 40; i++) box(.44, .07, 9.8, i % 2 ? 'floor0' : 'floor2', -8.78 + i * .45, .195, -16.6, lobby);
  box(18, 3.6, .16, '#e0d3b9', 0, 1.99, -21.4, lobby);
  for (const x of [-9, 9]) for (const z of [-12, -21.35]) box(.18, 3.9, .18, 'walnut', x, 2.08, z, lobby);
  for (const z of [-12, -21.35]) box(18.3, .2, .22, 'walnut', 0, 4.06, z, lobby);
  for (const x of [-9, 9]) box(.2, .2, 9.55, 'walnut', x, 4.06, -16.65, lobby);
  // Shoji and timber screens leave the entry and center aisle open.
  for (let panel = 0; panel < 4; panel++) {
    const z = -13.35 - panel * 2.25;
    box(.035, 3.12, 2.1, 'paper', -9, 1.95, z, lobby);
    for (const dz of [-1.1, 1.1]) box(.09, 3.45, .07, 'walnut', -8.94, 1.95, z + dz, lobby);
    for (let row = 0; row < 8; row++) box(.06, .035, 2.17, 'oak', -8.91, .5 + row * .4, z, lobby);
    for (let col = 0; col < 3; col++) box(.06, 3.13, .035, 'oak', -8.9, 1.95, z - .7 + col * .7, lobby);
  }
  for (let i = 0; i < 21; i++) box(.075, 2.9, .09, 'oak', 1.55 + i * .34, 1.8, -21.18, lobby);
  // Smooth annular shapes make a continuous curved sofa, open toward the entry aisle.
  const { x: sx, z: sz, start, end } = receptionSofa;
  function curvedSofaPart(inner, outer, depth, top, material) {
    const shape = new THREE.Shape(); shape.absarc(0, 0, outer, start, end, false);
    shape.lineTo(Math.cos(end) * inner, Math.sin(end) * inner); shape.absarc(0, 0, inner, end, start, true); shape.closePath();
    const mesh = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelSize: .045, bevelThickness: .045, bevelSegments: 3, steps: 1, curveSegments: 48 }), mat(material));
    mesh.rotation.x = Math.PI / 2; mesh.position.set(sx, top, sz); mesh.castShadow = true; mesh.receiveShadow = true; lobby.add(mesh); return mesh;
  }
  curvedSofaPart(1.97, 3.1, .3, .72, 'walnut').name = 'reception-sofa-base';
  curvedSofaPart(1.95, 3.02, .19, .91, '#ded7bf').name = 'reception-curved-sofa';
  curvedSofaPart(2.78, 3.12, .63, 1.47, '#d4ccb2');
  for (const angle of [start + .15, Math.PI * 1.15, end - .13]) {
    const cushion = sphere(.29, '#8c987c', sx + Math.cos(angle) * 2.66, 1.1, sz + Math.sin(angle) * 2.66, lobby);
    cushion.scale.set(1, .8, .42); cushion.rotation.y = Math.PI / 2 - angle;
  }
  const rug = cylinder(1, 1, .025, '#b7b69a', sx, .245, sz, lobby); rug.scale.set(1.85, 1, 1.25);
  const table = cylinder(1, 1, .1, 'oak', sx, .7, sz, lobby); table.scale.set(1.3, 1, .78);
  for (const dx of [-.7, .7]) box(.12, .4, .12, 'walnut', sx + dx, .48, sz, lobby);
  const tray = cylinder(.45, .45, .03, '#5b6651', sx, .77, sz, lobby); tray.scale.z = .8;
  const pot = sphere(.14, '#596b5e', sx, .9, sz, lobby); pot.scale.y = .8;
  cylinder(.12, .1, .025, '#4d5e50', sx, 1.025, sz, lobby);
  for (const dx of [-.3, .3]) cylinder(.07, .06, .1, '#f0e1c0', sx + dx, .84, sz + .13, lobby);
  // Slatted reception desk, tablet, visitor book and warm lamp.
  box(5.1, 1.01, 1.08, 'walnut', 4.55, .79, -18.45, lobby);
  box(5.35, .12, 1.27, 'oak', 4.55, 1.36, -18.45, lobby);
  for (let i = 0; i < 31; i++) box(.035, .9, .04, 'oak', 2.1 + i * .163, .8, -17.89, lobby);
  box(.43, .025, .31, '#e2dbc2', 3.1, 1.44, -18.25, lobby);
  const tablet = box(.55, .37, .045, '#35463d', 4.6, 1.64, -18.33, lobby); tablet.rotation.x = -.22;
  cylinder(.12, .12, .025, '#a18d65', 6.3, 1.44, -18.45, lobby);
  cylinder(.02, .02, .36, '#a18d65', 6.3, 1.62, -18.45, lobby);
  cylinder(.23, .27, .31, 'lantern', 6.3, 1.89, -18.45, lobby);
  const artCanvas = document.createElement('canvas'); artCanvas.width = 1024; artCanvas.height = 256;
  const ctx = artCanvas.getContext('2d'); ctx.fillStyle = '#dcd2b8'; ctx.fillRect(0, 0, 1024, 256);
  ctx.fillStyle = '#415746'; ctx.textAlign = 'center'; ctx.font = '600 104px serif'; ctx.fillText('ATELIER', 512, 135);
  ctx.font = '24px sans-serif'; ctx.fillText('WELCOME  ·  STRATEGY, TOGETHER', 512, 201);
  const texture = new THREE.CanvasTexture(artCanvas); texture.colorSpace = THREE.SRGBColorSpace; textures.receptionSign = texture;
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(4.8, 1.2), new THREE.MeshStandardMaterial({ map: texture, roughness: .9 })); sign.position.set(4.7, 2.75, -21.04); lobby.add(sign);
  // Ikebana, leafy plants and a stone arrangement complete the quiet waiting area.
  for (const [x, z] of [[-7.6, -19.8], [7.9, -13.2]]) {
    cylinder(.37, .3, .5, '#68745d', x, .5, z, lobby);
    for (let i = 0; i < 6; i++) {
      beam(new THREE.Vector3(x, .72, z), new THREE.Vector3(x + Math.cos(i * 2.4) * .4, 1.5 + i % 3 * .25, z + Math.sin(i * 2.4) * .35), .018, '#59694c', lobby);
      const leaf = sphere(.25, '#75835e', x + Math.cos(i * 2.4) * .4, 1.5 + i % 3 * .25, z + Math.sin(i * 2.4) * .35, lobby); leaf.scale.set(1.4, .35, .8);
    }
  }
  box(2.7, .3, .8, 'walnut', -4.8, .43, -20.4, lobby);
  cylinder(.13, .18, .36, '#5f6f60', -4.8, .76, -20.4, lobby);
  for (let i = 0; i < 3; i++) {
    beam(new THREE.Vector3(-4.8, .9, -20.4), new THREE.Vector3(-5.15 + i * .27, 1.7 + i % 2 * .2, -20.4), .012, '#725e45', lobby);
    sphere(.12, '#e4bcc0', -5.15 + i * .27, 1.7 + i % 2 * .2, -20.4, lobby);
  }
  const ripples = [];
  for (let i = 0; i < 24; i++) ripples.push(box(.35 + i % 4 * .12, .008, .025, '#b6d7bf', -9 + i % 12 * 1.5, .283, -8 - Math.floor(i / 12) * 2.3, lobby));
  return time => {
    ripples.forEach((line, i) => { line.position.x = -9 + ((i % 12 * 1.5 + time * .23) % 18.2); line.position.z = -8 - Math.floor(i / 12) * 2.3 + Math.sin(time * .8 + i) * .12; });
    lanterns.forEach((lantern, i) => { lantern.rotation.z = Math.sin(time * .75 + i) * .035; });
  };
}

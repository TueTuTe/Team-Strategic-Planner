import * as THREE from 'three';
import { receptionBridge, receptionBridgeHeight, receptionSofa, receptionDesk } from './reception-layout.js';
import { buildManekiNeko } from './maneki-neko.js';

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

  // Separate buildings: a narrow continuation of the stream and a closed side wall
  // replace the former edge-to-edge floor shared visually with the Izakaya.
  box(17.5, .38, 10, 'walnut', -.45, -.03, -16.6, lobby);
  for (let i = 0; i < 38; i++) box(.44, .07, 9.8, i % 2 ? 'floor0' : 'floor2', -8.78 + i * .45, .195, -16.6, lobby);
  box(17.2, 3.6, .16, '#e0d3b9', -.45, 1.99, -21.4, lobby);
  for (const x of [-9, 8.1]) for (const z of [-12, -21.35]) box(.18, 3.9, .18, 'walnut', x, 2.08, z, lobby);
  for (const z of [-12, -21.35]) box(17.5, .2, .22, 'walnut', -.45, 4.06, z, lobby);
  for (const x of [-9, 8.1]) box(.2, .2, 9.55, 'walnut', x, 4.06, -16.65, lobby);
  const separation = new THREE.Group(); separation.name = 'reception-izakaya-separation'; lobby.add(separation);
  box(.95, .38, 10, 'walnut', 8.75, -.23, -16.6, separation);
  box(.95, .08, 10, '#487f75', 8.75, .14, -16.6, separation);
  const sideStream = new THREE.Mesh(new THREE.PlaneGeometry(.95, 10), water.material); sideStream.rotation.x = -Math.PI / 2; sideStream.position.set(8.75, .27, -16.6); separation.add(sideStream);
  box(.13, 3.35, 9.35, '#d8c9aa', 8.14, 1.94, -16.65, separation);
  box(.16, .65, 9.45, 'walnut', 8.05, .58, -16.65, separation);
  for (let i = 0; i < 28; i++) box(.09, 3.3, .06, 'oak', 8.04, 1.92, -12.1 - i * .34, separation);
  for (const z of [-12.2, -15.5, -18.8, -21.1]) {
    const rock = sphere(.24, '#929580', 8.52, .32, z, separation); rock.scale.set(.6, .65, 1);
  }
  // Deep eaves, plaster over timber wainscot and joinery give the room a ryokan feel.
  for (const z of [-12, -21.35]) {
    box(17.7, .09, .55, 'walnut', -.45, 4.18, z, lobby);
    for (let i = 0; i < 44; i++) box(.075, .23, .22, 'oak', -8.8 + i * .39, 3.86, z, lobby);
  }
  box(17, .65, .09, 'walnut', -.45, .57, -21.26, lobby);
  box(17.1, .07, .16, 'oak', -.45, .94, -21.21, lobby);
  // The bridge-side entrance is a genkan threshold with a split indigo noren.
  const entry = new THREE.Group(); entry.name = 'reception-main-entrance'; lobby.add(entry);
  box(2.1, .045, 1.38, '#b9b6a1', .3, .252, -12.65, entry);
  box(2.25, .065, .14, 'oak', .3, .26, -13.4, entry);
  for (const x of [-.82, 1.42]) box(.12, 2.85, .18, 'walnut', x, 1.68, -12.0, entry);
  box(2.6, .18, .25, 'oak', .3, 3.12, -12, entry);
  for (let i = 0; i < 3; i++) box(.68, .61, .035, '#354e56', -.41 + i * .71, 2.77, -11.98, entry);
  const crest = new THREE.Mesh(new THREE.TorusGeometry(.16, .014, 5, 40, Math.PI * 1.88), mat('#e6dfc5')); crest.position.set(.3, 2.78, -11.95); crest.rotation.z = .18; entry.add(crest);
  // Shoji and timber screens leave the entry and center aisle open.
  for (let panel = 0; panel < 4; panel++) {
    const z = -13.35 - panel * 2.25;
    box(.035, 3.12, 2.1, 'paper', -9, 1.95, z, lobby);
    for (const dz of [-1.1, 1.1]) box(.09, 3.45, .07, 'walnut', -8.94, 1.95, z + dz, lobby);
    for (let row = 0; row < 8; row++) box(.06, .035, 2.17, 'oak', -8.91, .5 + row * .4, z, lobby);
    for (let col = 0; col < 3; col++) box(.06, 3.13, .035, 'oak', -8.9, 1.95, z - .7 + col * .7, lobby);
  }
  // A tatami waiting area sits deeper inside, away from the front desk and doorway.
  for (let col = 0; col < 4; col++) for (let row = 0; row < 2; row++) {
    box(1.59, .045, 2.99, 'tatami', -6.55 + col * 1.63, .255, -19.03 + row * 3.05, lobby);
    for (const dx of [-.8, .8]) box(.035, .048, 3.0, '#68775d', -6.55 + col * 1.63 + dx, .257, -19.03 + row * 3.05, lobby);
  }
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
  const table = cylinder(1, 1, .1, 'oak', sx, .7, sz, lobby); table.scale.set(1.3, 1, .78);
  for (const dx of [-.7, .7]) box(.12, .4, .12, 'walnut', sx + dx, .48, sz, lobby);
  const tray = cylinder(.45, .45, .03, '#5b6651', sx, .77, sz, lobby); tray.scale.z = .8;
  const pot = sphere(.14, '#596b5e', sx, .9, sz, lobby); pot.scale.y = .8;
  cylinder(.12, .1, .025, '#4d5e50', sx, 1.025, sz, lobby);
  for (const dx of [-.3, .3]) cylinder(.07, .06, .1, '#f0e1c0', sx + dx, .84, sz + .13, lobby);
  // A compact hinoki counter welcomes visitors immediately to the right of the entrance.
  const desk = new THREE.Group(); desk.name = 'japanese-front-desk'; desk.position.set(receptionDesk.x, 0, receptionDesk.z); lobby.add(desk);
  box(4.62, 1.02, 1.08, 'walnut', 0, .79, 0, desk);
  box(4.4, .75, .055, 'paper', 0, .82, .572, desk);
  for (const x of [-2.27, -.02, 2.27]) box(.13, 1.07, .16, 'oak', x, .82, .62, desk);
  for (const y of [.33, 1.27]) box(4.7, .1, .17, 'oak', 0, y, .62, desk);
  // Kumiko diamonds, rather than generic vertical bar slats, fill the two front panels.
  for (const panelX of [-1.13, 1.13]) for (let i = 0; i < 6; i++) {
    const x = panelX - .78 + i * .31;
    for (const side of [-1, 1]) for (const y of [.6, 1.01]) {
      const lattice = box(.026, .54, .035, 'oak', x, y, .615, desk); lattice.rotation.z = side * .63;
    }
  }
  const counterShape = new THREE.Shape();
  counterShape.moveTo(-2.35, -.63); counterShape.lineTo(2.29, -.63); counterShape.quadraticCurveTo(2.51, -.63, 2.51, -.4);
  counterShape.lineTo(2.51, .4); counterShape.quadraticCurveTo(2.51, .66, 2.25, .68); counterShape.lineTo(-2.35, .68);
  counterShape.quadraticCurveTo(-2.52, .63, -2.48, .42); counterShape.lineTo(-2.49, -.4); counterShape.quadraticCurveTo(-2.51, -.63, -2.35, -.63);
  const counter = new THREE.Mesh(new THREE.ExtrudeGeometry(counterShape, { depth: .14, bevelEnabled: true, bevelSize: .025, bevelThickness: .025, bevelSegments: 2, curveSegments: 16 }), mat('oak'));
  counter.rotation.x = Math.PI / 2; counter.position.y = 1.42; counter.castShadow = true; desk.add(counter);
  box(.43, .025, .31, '#e2dbc2', -.5, 1.465, .19, desk);
  const tablet = box(.46, .32, .04, '#35463d', .45, 1.64, -.12, desk); tablet.rotation.x = -.22;
  cylinder(.12, .12, .025, '#a18d65', 1.85, 1.46, -.05, desk);
  cylinder(.02, .02, .3, '#a18d65', 1.85, 1.62, -.05, desk);
  cylinder(.19, .24, .28, 'lantern', 1.85, 1.87, -.05, desk);
  const luckyCat = buildManekiNeko({ parent: desk, box, cylinder, sphere, mat }); luckyCat.cat.position.set(-1.62, 1.45, .04);
  // A freestanding shoji backdrop separates the service counter from the quiet inner hall.
  box(5.35, 2.4, .055, 'paper', 3.65, 1.57, -15.25, lobby);
  for (const x of [1, 3.65, 6.3]) box(.1, 2.55, .13, 'walnut', x, 1.6, -15.22, lobby);
  for (let i = 0; i < 8; i++) box(5.35, .035, .07, 'oak', 3.65, .43 + i * .32, -15.19, lobby);
  for (let i = 0; i < 10; i++) box(.035, 2.4, .07, 'oak', 1.2 + i * .54, 1.57, -15.18, lobby);
  const artCanvas = document.createElement('canvas'); artCanvas.width = 1024; artCanvas.height = 256;
  const ctx = artCanvas.getContext('2d'); ctx.fillStyle = '#dcd2b8'; ctx.fillRect(0, 0, 1024, 256);
  ctx.fillStyle = '#415746'; ctx.textAlign = 'center'; ctx.font = '600 104px serif'; ctx.fillText('ATELIER', 512, 135);
  ctx.font = '24px sans-serif'; ctx.fillText('RECEPTION  ·  WELCOME', 512, 201);
  const texture = new THREE.CanvasTexture(artCanvas); texture.colorSpace = THREE.SRGBColorSpace; textures.receptionSign = texture;
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(2.8, .7), new THREE.MeshStandardMaterial({ map: texture, roughness: .9 })); sign.position.set(3.65, 2.23, -15.1); lobby.add(sign);
  // Tokonoma alcove: ink scroll, raised timber display and ikebana at the rear.
  box(4.8, .16, 1.18, 'walnut', 3.9, .31, -20.5, lobby);
  box(1.65, 2.35, .04, '#7a8064', 3.9, 2.27, -21.15, lobby);
  box(1.4, 1.95, .045, 'artwork', 3.9, 2.28, -21.12, lobby);
  for (const y of [1.07, 3.47]) cylinder(.04, .04, 1.75, 'walnut', 3.9, y, -21.08, lobby).rotation.z = Math.PI / 2;
  // Ikebana, leafy plants and a stone arrangement complete the quiet waiting area.
  for (const [x, z] of [[-7.6, -19.8], [7.1, -12.8]]) {
    cylinder(.37, .3, .5, '#68745d', x, .5, z, lobby);
    for (let i = 0; i < 6; i++) {
      beam(new THREE.Vector3(x, .72, z), new THREE.Vector3(x + Math.cos(i * 2.4) * .4, 1.5 + i % 3 * .25, z + Math.sin(i * 2.4) * .35), .018, '#59694c', lobby);
      const leaf = sphere(.25, '#75835e', x + Math.cos(i * 2.4) * .4, 1.5 + i % 3 * .25, z + Math.sin(i * 2.4) * .35, lobby); leaf.scale.set(1.4, .35, .8);
    }
  }
  box(2.7, .3, .8, 'walnut', 3.9, .43, -20.4, lobby);
  cylinder(.13, .18, .36, '#5f6f60', 3.9, .76, -20.4, lobby);
  for (let i = 0; i < 3; i++) {
    beam(new THREE.Vector3(3.9, .9, -20.4), new THREE.Vector3(3.55 + i * .27, 1.7 + i % 2 * .2, -20.4), .012, '#725e45', lobby);
    sphere(.12, '#e4bcc0', 3.55 + i * .27, 1.7 + i % 2 * .2, -20.4, lobby);
  }
  const ripples = [];
  for (let i = 0; i < 24; i++) ripples.push(box(.35 + i % 4 * .12, .008, .025, '#b6d7bf', -9 + i % 12 * 1.5, .283, -8 - Math.floor(i / 12) * 2.3, lobby));
  return time => {
    luckyCat.animate(time);
    ripples.forEach((line, i) => { line.position.x = -9 + ((i % 12 * 1.5 + time * .23) % 18.2); line.position.z = -8 - Math.floor(i / 12) * 2.3 + Math.sin(time * .8 + i) * .12; });
    lanterns.forEach((lantern, i) => { lantern.rotation.z = Math.sin(time * .75 + i) * .035; });
  };
}

import * as THREE from 'three';
import { buildNatureCorner } from './nature-corner.js';

export const officeZones = {
  overview: { label: 'Toàn cảnh', detail: '4 khu riêng · 5 chỗ làm việc · 10 màn hình', target: [0, .9, 0], offset: [22, 21, 26] },
  strategy: { label: 'Góc riêng', detail: 'Góc Strategy · Bể cá & terrarium · Lối vào mở', target: [-5.5, 1, -4.2], offset: [7.5, 7, 9] },
  studio: { label: 'Khu làm việc', detail: 'Studio · 4 chỗ làm việc, mỗi người 2 màn hình', target: [-4.8, .9, 2.3], offset: [9, 9, 11] },
  meeting: { label: 'Phòng họp', detail: 'Phòng họp · 8 chỗ · Vách kính và cửa mở', target: [5, 1, -3.7], offset: [9, 8.5, 10] },
  tea: { label: 'Khu thưởng trà', detail: 'Khu trà riêng · Tatami, bàn thấp và 6 đệm ngồi', target: [5.1, .8, 4], offset: [7.5, 8.5, 9] },
};

export function buildJapaneseOffice({ scene, box, cylinder, sphere, mat, textures }) {
  const monitorMeshes = [];
  // The footprint grows from 12 × 9 to 18 × 14 model units: 2.3 times the area.
  box(18.4, .38, 14.4, 'walnut', 0, -.23, 0);
  for (let col = 0; col < 30; col++) for (let row = 0; row < 6; row++) {
    box(.59, .08, 2.32, `floor${(col + row * 2) % 3}`, -8.85 + col * .61, .005, -5.85 + row * 2.35);
  }
  box(18.2, 3.8, .16, '#d9ccaf', 0, 1.85, -7.05);
  box(18.4, .22, .27, 'walnut', 0, 3.86, -6.98);
  box(18.3, .12, .2, 'oak', 0, 3.59, -6.9);
  box(.22, .22, 14.1, 'walnut', -9.08, 3.86, 0);
  for (const x of [-9, -3, 1.4, 8.98]) box(.17, 3.96, .18, 'walnut', x, 1.93, -6.92);
  for (let i = 0; i < 69; i++) box(.04, .3, .05, 'walnut', -8.8 + i * .26, 3.64, -6.82);

  // Full-height shoji on the sunlit outer edge, with an open front facade.
  for (let panel = 0; panel < 6; panel++) {
    const z = -5.87 + panel * 2.35;
    box(.045, 3.14, 2.2, 'paper', -9, 1.87, z);
    for (const dz of [-1.15, 1.15]) box(.1, 3.5, .08, 'walnut', -8.91, 1.8, z + dz);
    for (let row = 0; row < 9; row++) box(.07, .035, 2.22, 'oak', -8.87, .34 + row * .39, z);
    for (let col = 0; col < 4; col++) box(.07, 3.15, .035, 'oak', -8.85, 1.88, z - .84 + col * .56);
    box(.14, .13, 2.33, 'walnut', -8.91, .17, z);
  }

  function plaque(text, x, y, z, width = 2, floor = false) {
    const canvas = document.createElement('canvas'); canvas.width = 768; canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#574935'; ctx.fillRect(0, 0, 768, 128);
    ctx.fillStyle = '#eddfc2'; ctx.font = '500 35px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 384, 66, 720);
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; textures[`sign-${text}`] = texture;
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(width, width / 6), new THREE.MeshStandardMaterial({ map: texture, roughness: 1 }));
    sign.position.set(x, y, z); if (floor) sign.rotation.x = -Math.PI / 2; scene.add(sign);
  }
  function branch(a, b, radius = .025) {
    const direction = new THREE.Vector3().subVectors(b, a);
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius * .6, radius, direction.length(), 7), mat('#514536'));
    mesh.position.copy(a).add(b).multiplyScalar(.5); mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize()); scene.add(mesh);
  }
  function bonsai(x, z, base = 0, scale = 1) {
    cylinder(.34 * scale, .28 * scale, .17 * scale, '#50533f', x, base + .1 * scale, z);
    branch(new THREE.Vector3(x, base + .17 * scale, z), new THREE.Vector3(x + .12 * scale, base + .9 * scale, z), .055 * scale);
    for (let i = 0; i < 5; i++) {
      const px = x + Math.cos(i * 2.3) * .27 * scale, py = base + (.64 + i * .12) * scale, pz = z + Math.sin(i * 2.3) * .23 * scale;
      branch(new THREE.Vector3(x + .1 * scale, base + .6 * scale, z), new THREE.Vector3(px, py, pz), .02 * scale);
      const canopy = sphere(.28 * scale, i % 2 ? '#65704d' : '#7c8054', px, py, pz); canopy.scale.set(1.3, .4, .85);
    }
  }
  function cabinet(x, z, width = 2.4, base = 0) {
    box(width, .72, .58, 'walnut', x, base + .4, z);
    box(width + .1, .07, .65, 'oak', x, base + .8, z);
    for (let i = 0; i < Math.floor(width / .15); i++) box(.045, .58, .035, 'oak', x - width / 2 + .08 + i * .15, base + .4, z + .31);
  }
  function chair(x, z, rotation = 0, base = 0) {
    const group = new THREE.Group(); group.position.set(x, base, z); group.rotation.y = rotation; scene.add(group);
    box(.7, .14, .65, '#555b4b', 0, .57, 0, group);
    box(.7, .6, .1, 'walnut', 0, .92, .29, group);
    box(.57, .4, .035, '#62654f', 0, .96, .225, group);
    for (const dx of [-.28, .28]) for (const dz of [-.23, .23]) box(.065, .53, .065, 'walnut', dx, .28, dz, group);
  }
  function table(x, z, width, depth, base = 0) {
    box(width, .16, depth, 'oak', x, base + 1.02, z);
    for (const dx of [-width / 2 + .18, width / 2 - .18]) for (const dz of [-depth / 2 + .18, depth / 2 - .18]) box(.12, 1, .12, 'walnut', x + dx, base + .5, z + dz);
  }
  function workstation(ownerId, x, z, rotation = 0) {
    const group = new THREE.Group(); group.name = `workstation-${ownerId}`; group.position.set(x, 0, z); group.rotation.y = rotation; scene.add(group);
    // Each screen is a separate mesh and has its own stand, facing its owner.
    for (const [index, dx] of [-.47, .47].entries()) {
      const screen = new THREE.Group(); screen.position.set(dx, 0, -.24); screen.rotation.y = dx < 0 ? .1 : -.1; group.add(screen);
      const frame = box(.86, .55, .07, '#252f2a', 0, 1.53, 0, screen);
      frame.name = `monitor-${ownerId}-${index + 1}`; monitorMeshes.push(frame);
      box(.77, .46, .012, index ? '#afbaa2' : '#b3c0ad', 0, 1.54, .041, screen);
      box(.44, .022, .012, '#edf0dd', -.07, 1.64, .05, screen);
      box(.54, .022, .012, '#718774', -.02, 1.53, .05, screen);
      if (index) for (let bar = 0; bar < 4; bar++) box(.065, .06 + bar * .04, .013, '#7b8d6e', -.19 + bar * .12, 1.43 + bar * .02, .052, screen);
      box(.055, .2, .06, '#363d35', 0, 1.18, 0, screen);
      box(.31, .025, .2, '#363d35', 0, 1.11, 0, screen);
    }
    box(.65, .025, .22, '#c6c3b0', 0, 1.12, .31, group);
    box(.13, .04, .2, '#555b4b', .54, 1.13, .31, group);
    box(.26, .045, .35, '#c4b391', .98, 1.13, .08, group);
    cylinder(.078, .06, .14, '#b8b89d', -.98, 1.19, .17, group);
  }

  // Four generous workstations in the open studio, clear of the central aisle.
  table(-4.85, 2.2, 6.35, 2.4);
  const studioSeats = [
    { id: 'insight', x: -6.5, z: .52, rotation: Math.PI, deskZ: 1.65 },
    { id: 'account', x: -3.2, z: .52, rotation: Math.PI, deskZ: 1.65 },
    { id: 'creative', x: -6.5, z: 3.88, rotation: 0, deskZ: 2.75 },
    { id: 'media', x: -3.2, z: 3.88, rotation: 0, deskZ: 2.75 },
  ];
  for (const seat of studioSeats) { workstation(seat.id, seat.x, seat.deskZ, seat.rotation); chair(seat.x, seat.z, seat.rotation); }
  plaque('CREATIVE STUDIO', -4.85, .065, 5.9, 3, true);
  bonsai(-8.1, 5.85, 0, 1.2);

  // Thôi Chí Vũ has an alcove with an open front, not a sealed private room.
  box(5.25, .025, 4.1, '#9b967c', -5.65, .06, -4.2);
  table(-5.65, -4.8, 3.25, 1.3);
  table(-7.38, -5.4, .65, 2.45);
  // Sit behind the desk, facing the studio; screen backs face the open aisle.
  workstation('strategy', -5.65, -4.8, Math.PI); chair(-5.65, -5.95, Math.PI);
  buildNatureCorner({ scene, box, cylinder, sphere, mat });
  // Only one lateral slatted screen; the 5m-wide front stays entirely open.
  for (let i = 0; i < 18; i++) box(.09, 2.45, .065, 'walnut', -2.83, 1.25, -6.45 + i * .17);
  box(.14, .1, 3.2, 'oak', -2.83, 2.51, -5.0);
  box(2, 2.15, .04, '#79745a', -5.65, 2.35, -6.9);
  box(1.82, 1.93, .045, 'artwork', -5.65, 2.35, -6.87);
  plaque('STRATEGY ALCOVE', -5.6, .09, -2.02, 2.8, true);

  // Instanced books on the library between the alcove and meeting room.
  const books = [], colors = ['#c7bc9e', '#8d8468', '#43574d', '#c2b79d', '#745945', '#a8997c'];
  function bookcase(x, width) {
    box(width, 3.45, .1, 'walnut', x, 1.8, -6.87);
    for (const dx of [-width / 2, 0, width / 2]) box(.09, 3.5, .55, 'walnut', x + dx, 1.8, -6.63);
    for (let row = 0; row < 6; row++) {
      const y = .12 + row * .65; box(width + .1, .07, .6, 'oak', x, y, -6.6);
      if (row === 5) continue;
      for (let i = 0; i < Math.floor(width / .13) - 3; i++) {
        if ((i + row) % 13 === 0) continue;
        const height = .3 + ((i * 7 + row * 3) % 9) * .022;
        books.push({ x: x - width / 2 + .16 + i * .13, y: y + .05 + height / 2, h: height, color: colors[(i + row * 3) % colors.length] });
      }
    }
  }
  bookcase(-.7, 3.05); bookcase(-7.9, 1.45);
  const geometry = new THREE.BoxGeometry(1, 1, 1), transform = new THREE.Object3D();
  for (const color of colors) {
    const subset = books.filter(book => book.color === color), mesh = new THREE.InstancedMesh(geometry, mat(color), subset.length);
    subset.forEach((book, i) => { transform.position.set(book.x, book.y, -6.58); transform.scale.set(.085, book.h, .3); transform.updateMatrix(); mesh.setMatrixAt(i, transform.matrix); });
    mesh.castShadow = true; mesh.receiveShadow = true; scene.add(mesh);
  }

  // Meeting room: framed glazing, an open sliding door, and eight seats.
  box(7, .025, 5.95, '#a4a18b', 5.05, .06, -3.8);
  for (const z of [-6.75, -.82]) box(7.25, .16, .16, 'walnut', 5.03, 3.17, z);
  for (const x of [1.44, 8.6]) {
    box(.15, .16, 6.05, 'walnut', x, 3.17, -3.8);
    for (const z of [-6.75, -4.8, -2.85, -.82]) box(.11, 3.2, .11, 'walnut', x, 1.6, z);
    for (let i = 0; i < 3; i++) box(.025, 2.85, 1.86, 'glass', x, 1.6, -5.78 + i * 1.97);
  }
  // Front entrance is at x=1.6..3.3; all other panels are fixed glazing.
  for (const x of [3.35, 5.1, 6.85, 8.6]) box(.1, 3.2, .1, 'walnut', x, 1.6, -.82);
  for (let i = 0; i < 3; i++) {
    box(1.66, 2.85, .025, 'glass', 4.22 + i * 1.75, 1.6, -.82);
    box(1.7, .05, .07, 'oak', 4.22 + i * 1.75, .7, -.82);
  }
  // The door is slid aside, leaving a real unobstructed entry in the geometry.
  box(1.58, 2.87, .04, 'glass', 4.18, 1.58, -.7);
  box(.035, .42, .04, '#625843', 3.47, 1.45, -.65);
  table(5.05, -3.65, 2.15, 3.75);
  for (const z of [-4.9, -3.65, -2.4]) { chair(3.52, z, -Math.PI / 2); chair(6.58, z, Math.PI / 2); }
  chair(5.05, -6.05, Math.PI); chair(5.05, -1.22);
  // Presentation display is not counted among the ten personal monitors.
  box(3.15, 1.55, .1, '#29362f', 5.05, 2.1, -6.8);
  box(2.99, 1.39, .025, '#b7bfaa', 5.05, 2.1, -6.73);
  for (let i = 0; i < 3; i++) box(.62, .36, .02, ['#6d8069', '#c6ad7a', '#89977d'][i], 4.18 + i * .87, 2.1, -6.7);
  plaque('MEETING ROOM', 5.05, 3.38, -6.72, 2.8);
  for (let i = 0; i < 4; i++) {
    box(.38, .025, .48, '#ded6bc', 4.57 + (i % 2) * .95, 1.12, -4.6 + Math.floor(i / 2) * 1.8);
    cylinder(.055, .045, .12, '#d3c7ac', 4.6 + (i % 2) * .9, 1.18, -4.2 + Math.floor(i / 2) * 1.8);
  }

  // A separate tea lounge, beyond a generous aisle south of the meeting room.
  box(6.5, .3, 4.95, 'walnut', 5.24, .19, 4.05);
  for (let col = 0; col < 3; col++) for (let row = 0; row < 2; row++) {
    const x = 3.1 + col * 2.14, z = 2.84 + row * 2.42;
    box(2.1, .06, 2.38, 'tatami', x, .37, z);
    for (const dz of [-1.16, 1.16]) box(2.1, .01, .045, '#555a43', x, .407, z + dz);
  }
  box(.5, .13, 2.1, 'oak', 1.45, .08, 4.05);
  box(.3, .13, 2.1, 'walnut', 1.85, .21, 4.05);
  box(2.9, .14, 1.45, 'walnut', 5.2, .94, 4.05);
  for (const x of [3.96, 6.44]) for (const z of [3.5, 4.6]) box(.09, .5, .09, 'oak', x, .66, z);
  for (const x of [4.13, 5.2, 6.27]) for (const z of [2.65, 5.45]) {
    box(.8, .13, .75, z < 4 ? '#898665' : '#a08766', x, .49, z);
    box(.05, .008, .05, '#68634e', x, .56, z);
  }
  box(1.18, .035, .65, '#75563b', 5.2, 1.03, 4.05);
  sphere(.17, '#535d46', 5.2, 1.19, 4.05);
  const spout = cylinder(.045, .065, .2, '#535d46', 5.39, 1.2, 4.05); spout.rotation.z = -.8;
  cylinder(.06, .06, .025, '#4d5740', 5.2, 1.36, 4.05);
  for (const x of [4.8, 5.6]) cylinder(.065, .049, .075, '#dbd0b5', x, 1.09, 4.2);
  cabinet(7.1, 1.8, 2.4, .35); bonsai(7.35, 1.8, 1.2, .8);
  // A short lateral screen gives privacy without enclosing the tea lounge.
  for (let i = 0; i < 18; i++) box(.06, 1.8, .06, 'walnut', 8.55, 1.3, 2.4 + i * .22);
  box(.1, .1, 4.05, 'oak', 8.55, 2.24, 4.2);
  plaque('TEA LOUNGE', 5.24, .25, 6.55, 2.5);

  // Paper lamps stay below sparse ceiling beams, leaving the model open above.
  for (const [x, z] of [[-4.85, 2.2], [5.2, 4.05], [5.05, -3.65]]) {
    box(.09, .14, z + 7, 'walnut', x, 3.85, (z - 7) / 2);
    cylinder(.012, .012, .45, '#514838', x, 3.49, z);
    cylinder(.37, .37, .54, 'lantern', x, 3.01, z);
    for (let i = 0; i < 9; i++) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(.374, .008, 4, 32), mat('#a8956a'));
      ring.rotation.x = Math.PI / 2; ring.position.set(x, 2.77 + i * .06, z); scene.add(ring);
    }
    const glow = new THREE.PointLight('#ffd398', 8, 7, 2); glow.position.set(x, 2.85, z); scene.add(glow);
  }
  const seats = { strategy: { x: -5.65, z: -5.95, rotation: Math.PI }, ...Object.fromEntries(studioSeats.map(seat => [seat.id, seat])) };
  return { seats, monitorMeshes };
}

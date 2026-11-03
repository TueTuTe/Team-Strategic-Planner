import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { team } from './planner.js';
import { makeOfficeTextures } from './materials.js';
import { buildJapaneseOffice, officeZones } from './office-layout.js';
import { OfficeNavigation } from './office-navigation.js';
import { mountTVScreen } from './office-tv.js';

export function createOffice(container, onSelect, { motion = true, onAmbient = () => {}, onCallArrival = () => {}, tvElement = null, onTVVisibility = () => {} } = {}) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, .1, 160);
  camera.position.set(...officeZones.overview.target).add(new THREE.Vector3(...officeZones.overview.offset));
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0xeceee7, 0);
  container.appendChild(renderer.domElement);
  const controls = new OrbitControls(camera, container);
  container.style.touchAction = 'none';
  controls.target.set(...officeZones.overview.target);
  controls.enableDamping = true;
  controls.minDistance = 9;
  controls.maxDistance = 80;
  controls.maxPolarAngle = Math.PI / 2.5;
  controls.minPolarAngle = .3;
  controls.enablePan = true;
  scene.add(new THREE.HemisphereLight('#fff3de', '#87745b', 1.9));
  const sunlight = new THREE.DirectionalLight('#ffebc5', 3.1);
  sunlight.position.set(-7, 22, 8);
  sunlight.target.position.set(6, 0, 0); scene.add(sunlight.target);
  sunlight.castShadow = true;
  sunlight.shadow.mapSize.set(2048, 2048);
  Object.assign(sunlight.shadow.camera, { left: -35, right: 35, top: 32, bottom: -32, far: 100 });
  sunlight.shadow.bias = -.001;
  sunlight.shadow.normalBias = .025;
  scene.add(sunlight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  const textures = makeOfficeTextures();
  const palette = {};
  const materialOptions = {
    oak: { color: '#bfa788', map: textures.wood, roughness: .48 },
    walnut: { color: '#6b5346', map: textures.wood, roughness: .5 },
    floor0: { color: '#a0886c', map: textures.wood, roughness: .42 },
    floor1: { color: '#967b60', map: textures.wood, roughness: .42 },
    floor2: { color: '#aa8b69', map: textures.wood, roughness: .42 },
    tatami: { color: '#d5cf9d', map: textures.tatami, roughness: 1 },
    paper: { color: '#fff3dc', map: textures.paper, roughness: .95, emissive: '#e7cfa6', emissiveIntensity: .18 },
    artwork: { color: '#ffffff', map: textures.artwork, roughness: 1 },
    glass: { color: '#dae5d5', transparent: true, opacity: .13, depthWrite: false, roughness: .2 },
    aquariumGlass: { color: '#c8e9df', transparent: true, opacity: .18, depthWrite: false, roughness: .12, side: THREE.DoubleSide },
    terrariumGlass: { color: '#e0eadb', transparent: true, opacity: .12, depthWrite: false, roughness: .12, side: THREE.DoubleSide },
    water: { color: '#65b8b1', transparent: true, opacity: .13, depthWrite: false, roughness: .15 },
    aquariumGlow: { color: '#dbfff0', emissive: '#8ad9c6', emissiveIntensity: .9, roughness: .4 },
    lantern: { color: '#f6e2bb', map: textures.paper, roughness: 1, emissive: '#ffc87c', emissiveIntensity: .6 },
  };
  const mat = (color) => palette[color] ||= new THREE.MeshStandardMaterial(materialOptions[color] || { color, roughness: .8 });
  function box(w, h, d, color, x, y, z, parent = scene) {
    const obj = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color));
    obj.position.set(x, y, z); obj.castShadow = !obj.material.transparent; obj.receiveShadow = true; parent.add(obj); return obj;
  }
  function cylinder(r1, r2, h, color, x, y, z, parent = scene) {
    const obj = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, 24), mat(color));
    obj.position.set(x, y, z); obj.castShadow = !obj.material.transparent; obj.receiveShadow = true; parent.add(obj); return obj;
  }
  function sphere(r, color, x, y, z, parent = scene) {
    const obj = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 16), mat(color));
    obj.position.set(x, y, z); obj.castShadow = true; parent.add(obj); return obj;
  }
  const { seats, animateNature, receptionTV } = buildJapaneseOffice({ scene, box, cylinder, sphere, mat, textures });
  const tvLayer = tvElement ? mountTVScreen(container, scene, camera, tvElement, onTVVisibility) : null;
  const navigation = new OfficeNavigation({ seats, getName: id => team.find(person => person.id === id).name, onAmbient, onCallArrival });
  const agents = [];
  const labels = document.createElement('div'); labels.className = 'scene-labels'; container.append(labels);
  labels.addEventListener('pointerdown', event => event.stopPropagation());
  const connectors = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  connectors.classList.add('label-connectors'); connectors.setAttribute('aria-hidden', 'true'); labels.append(connectors);
  const bubbles = new Map();
  let lastRender = 0, lastTime = performance.now();
  team.forEach((person, i) => {
    const { x, z, rotation } = seats[person.id], base = 0, g = new THREE.Group(); scene.add(g); g.position.set(x, base, z);
    g.rotation.y = rotation;
    cylinder(.21, .25, .48, person.color, 0, .92, 0, g);
    const head = new THREE.Group(); head.position.y = 1.37; g.add(head);
    sphere(.205, '#e5b792', 0, 0, 0, head);
    const hair = sphere(.213, ['#4a372b', '#342d2a', '#483d30', '#342d2a', '#352d29'][i], 0, .08, .025, head);
    hair.scale.set(1, .6, 1);
    if (i === 0 || i === 1 || i === 3) box(.35, .3, .14, '#42352c', 0, -.06, .13, head);
    for (const x of [-.067, .067]) sphere(.016, '#40352d', x, .005, -.186, head);
    const arms = [], legs = [], sittingLegs = new THREE.Group(); g.add(sittingLegs);
    for (const dx of [-.25, .25]) {
      const pivot = new THREE.Group(); pivot.position.set(dx, 1.1, 0); g.add(pivot); arms.push(pivot);
      const arm = box(.12, .36, .13, person.color, 0, -.09, -.1, pivot); arm.rotation.x = -.7;
      sphere(.07, '#e5b792', 0, -.19, -.24, pivot);
      box(.14, .35, .15, '#465951', dx * .5, .51, -.06, sittingLegs);
      const leg = new THREE.Group(); leg.position.set(dx * .5, .7, 0); leg.visible = false; g.add(leg); legs.push(leg);
      box(.145, .82, .16, '#465951', 0, -.41, 0, leg);
      box(.16, .11, .25, '#363d34', 0, -.84, -.06, leg);
    }
    const ring = new THREE.Mesh(new THREE.RingGeometry(.42, .47, 48), new THREE.MeshBasicMaterial({ color: '#436a53', side: THREE.DoubleSide }));
    ring.rotation.x = -Math.PI / 2; ring.position.set(x, base + .09, z); ring.visible = false; scene.add(ring);
    const label = document.createElement('button'); label.className = 'agent-label';
    const dot = document.createElement('span'); dot.style.background = person.color;
    const role = document.createElement('small'); role.textContent = person.role;
    label.append(dot, document.createTextNode(person.name), role);
    label.addEventListener('click', () => onSelect(person.id)); labels.append(label);
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line'); connectors.append(line);
    agents.push({ id: person.id, g, head, arms, legs, sittingLegs, working: false, reactionUntil: 0, label, line, ring, anchor: new THREE.Vector3(x, base + 1.95, z) });
  });
  let frame, needsRender = true;
  document.fonts.ready.then(() => { needsRender = true; });
  const observer = new ResizeObserver(() => {
    const { width, height } = container.getBoundingClientRect();
    renderer.setSize(width, height); tvLayer?.resize(width, height); camera.aspect = width / height;
    camera.fov = camera.aspect < 1.15 ? 50 : 32;
    camera.updateProjectionMatrix();
    needsRender = true;
  }); observer.observe(container);
  function animate(now = performance.now()) {
    frame = requestAnimationFrame(animate);
    if (document.hidden || (motion && now - lastRender < 1000 / 24 && !needsRender)) return;
    const changed = controls.update();
    if (!changed && !needsRender && !motion) return;
    lastRender = now;
    const time = now / 1000;
    const delta = Math.min((now - lastTime) / 1000, .12); lastTime = now;
    if (motion) { navigation.step(delta); animateNature?.(time); }
    agents.forEach((a, index) => {
      const phase = time + index * 1.7;
      const state = navigation.actors.get(a.id), walking = state.pose === 'walking', standing = !['seated', 'bench', 'barstool', 'sofa'].includes(state.pose);
      const [x, y, z] = state.position;
      a.g.position.set(x, y + (standing ? .22 : 0) + (motion ? walking ? Math.abs(Math.sin(phase * 9)) * .035 : Math.sin(phase * 1.6) * .008 : 0), z);
      const turn = Math.atan2(Math.sin(state.heading - a.g.rotation.y), Math.cos(state.heading - a.g.rotation.y));
      a.g.rotation.y += motion ? turn * Math.min(1, delta * 10) : turn;
      a.sittingLegs.visible = !standing;
      a.legs.forEach((leg, side) => { leg.visible = standing; leg.rotation.x = motion && walking ? Math.sin(phase * 9 + side * Math.PI) * .55 : 0; });
      a.anchor.set(x, a.g.position.y + 1.95, z); a.ring.position.set(x, y + .09, z);
      a.label.dataset.activity = walking ? 'walking' : a.working ? 'working' : state.pose === 'sofa' ? 'reception' : state.pose === 'barstool' ? 'izakaya' : state.pose === 'bench' ? 'resting' : standing ? 'social' : 'desk';
      a.label.title = `${team.find(person => person.id === a.id).name} · ${walking ? 'Đang đi lại' : a.working ? 'Đang làm thử' : state.pose === 'sofa' ? 'Tại sảnh tiếp đón' : state.pose === 'barstool' ? 'Tan ca tại Izakaya' : state.pose === 'bench' ? 'Nghỉ bên hồ koi' : standing ? 'Đang trò chuyện / chờ' : 'Tại bàn'}`;
      const reacting = a.reactionUntil > now;
      a.head.rotation.y = motion ? Math.sin(phase * .65) * .09 : 0;
      a.head.rotation.x = motion ? a.working ? .08 + Math.sin(phase * 3) * .035 : reacting ? Math.sin(phase * 5) * .09 : 0 : 0;
      a.head.rotation.z = motion ? Math.sin(phase * .8) * .025 : 0;
      a.arms.forEach((arm, side) => {
        arm.rotation.x = motion && walking ? Math.sin(phase * 9 + side * Math.PI) * .45 : motion && a.working ? Math.sin(phase * 9 + side * 2) * .14 : 0;
        arm.rotation.z = motion && reacting && side === 1 ? -1.9 + Math.sin(phase * 8) * .15 : 0;
      });
    });
    needsRender = false;
    renderer.render(scene, camera); tvLayer?.render();
    const { width, height } = container.getBoundingClientRect();
    connectors.setAttribute('viewBox', `0 0 ${width} ${height}`);
    const bubbleRects = [];
    for (const [id, record] of bubbles) {
      const actor = agents.find(a => a.id === id), bubble = record.element;
      const point = actor.anchor.clone(); point.y += .45; point.project(camera);
      bubble.hidden = point.z > 1 || Math.abs(point.x) > 1 || Math.abs(point.y) > 1;
      if (bubble.hidden) { record.line.style.display = 'none'; continue; }
      const x = (point.x + 1) / 2 * width, y = (-point.y + 1) / 2 * height;
      const bw = bubble.offsetWidth, bh = bubble.offsetHeight;
      const left = Math.max(8, Math.min(width - bw - 8, x - bw / 2));
      let top = Math.max(12, Math.min(height - bh - 42, y - bh - 14));
      for (const rect of bubbleRects) if (left < rect.right && left + bw > rect.left && top < rect.bottom && top + bh > rect.top) top = Math.max(12, rect.top - bh - 8);
      bubble.style.left = `${left}px`; bubble.style.top = `${top}px`;
      const face = actor.g.position.clone(); face.y += 1.5; face.project(camera);
      record.line.setAttribute('x1', left + bw / 2); record.line.setAttribute('y1', top + bh);
      record.line.setAttribute('x2', (face.x + 1) / 2 * width); record.line.setAttribute('y2', (-face.y + 1) / 2 * height);
      record.line.style.display = '';
      bubbleRects.push({ left, right: left + bw, top, bottom: top + bh });
    }
    const projected = agents.map(({ anchor, label, line }) => {
      const v = anchor.clone().project(camera);
      label.hidden = v.z > 1 || v.x < -1 || v.x > 1 || v.y < -1 || v.y > 1;
      line.style.display = label.hidden ? 'none' : '';
      return { label, line, x: (v.x + 1) / 2 * width, y: (-v.y + 1) / 2 * height };
    });
    // Keep labels readable even when adjacent desks overlap in the camera view.
    const placed = [];
    projected.filter(p => !p.label.hidden).sort((a, b) => b.y - a.y).forEach(p => {
      const w = p.label.offsetWidth, h = p.label.offsetHeight;
      p.x = Math.max(w / 2 + 4, Math.min(width - w / 2 - 4, p.x));
      const anchorX = p.x, anchorY = p.y;
      const overlaps = (x, y) => placed.some(q => Math.abs(x - q.x) < (w + q.w) / 2 + 4 && Math.abs(y - q.y) < (h + q.h) / 2 + 5);
      let located = false;
      for (let row = 0; row < 7 && !located; row++) {
        for (const dx of [0, -w * .9, w * .9]) {
          const x = anchorX + dx, y = anchorY - row * (h + 6);
          if (x < w / 2 + 4 || x > width - w / 2 - 4 || y < h + 4 || overlaps(x, y)) continue;
          p.x = x; p.y = y; located = true; break;
        }
      }
      p.label.style.transform = `translate(-50%, -100%) translate(${p.x}px, ${p.y}px)`;
      p.line.setAttribute('x1', p.x); p.line.setAttribute('y1', p.y + 2);
      p.line.setAttribute('x2', anchorX); p.line.setAttribute('y2', anchorY + 5);
      if (Math.abs(p.x - anchorX) + Math.abs(p.y - anchorY) < 10) p.line.style.display = 'none';
      placed.push({ ...p, w, h });
    });
  }
  animate(performance.now());
  function focusZone(id) {
    const zone = officeZones[id] || officeZones.overview;
    controls.minDistance = ['tv', 'receptionTV'].includes(id) ? 6 : id === 'frontDesk' ? 5 : 9;
    controls.maxPolarAngle = id === 'tv' ? Math.PI / 2 : Math.PI / 2.5;
    const fixture = scene.getObjectByName('studio-overhead-fixture'); if (fixture) fixture.visible = id !== 'tv';
    controls.target.set(...zone.target);
    camera.position.copy(controls.target).add(new THREE.Vector3(...zone.offset));
    controls.update(); needsRender = true;
  }
  return {
    focusZone,
    toggleReceptionTV() { const state = receptionTV.toggle(); needsRender = true; return state; },
    setReceptionTVContent(value) { const state = receptionTV.setContent(value); needsRender = true; return state; },
    gardenBreak() { if (!motion) return []; const ids = navigation.requestGardenBreak(); needsRender = true; return ids; },
    barBreak() { if (!motion) return []; const ids = navigation.requestBarBreak(); needsRender = true; return ids; },
    receptionVisit() { if (!motion) return []; const ids = navigation.requestReception(); needsRender = true; return ids; },
    endAfterHours() { navigation.endAfterHours(); if (!motion) navigation.freezeAtDesks(); needsRender = true; },
    setMotion(enabled) { motion = enabled; if (!motion) navigation.freezeAtDesks(); lastTime = performance.now(); needsRender = true; },
    isAtDesk(id) { return navigation.atDesk(id); },
    returnToDesk(id, callback) { navigation.home(id, callback); if (!motion) navigation.freezeAtDesks(); needsRender = true; },
    setBusy(id, value) { const changed = navigation.actors.get(id)?.busy !== value; navigation.setBusy(id, value); if (!motion && value && changed) navigation.freezeAtDesks(); needsRender = true; },
    callAgent(id) { navigation.call(id); if (!motion) { const actor = navigation.actors.get(id); actor.position = [...actor.route.at(-1) || actor.position]; actor.route = []; navigation.arrive(actor); } needsRender = true; },
    setWorking(id, value) { const actor = agents.find(a => a.id === id); if (actor) actor.working = value; needsRender = true; },
    say(id, text, tone = 'greet') {
      const person = team.find(p => p.id === id), actor = agents.find(a => a.id === id); if (!person || !actor) return;
      const previous = bubbles.get(id); if (previous) { clearTimeout(previous.timer); previous.element.remove(); previous.line.remove(); }
      const bubble = document.createElement('aside'); bubble.className = 'character-bubble'; bubble.dataset.speaker = id; bubble.dataset.tone = tone;
      bubble.setAttribute('role', 'status'); bubble.setAttribute('aria-live', 'polite');
      const speaker = document.createElement('strong'), speech = document.createElement('p'); speaker.textContent = person.name; speech.textContent = text;
      bubble.append(speaker, speech); container.append(bubble);
      actor.reactionUntil = performance.now() + 2000;
      if (!['ambient', 'welcome'].includes(tone)) navigation.quietFor(12);
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line'); line.classList.add('speech-connector'); connectors.append(line);
      const timer = setTimeout(() => { bubble.remove(); line.remove(); bubbles.delete(id); needsRender = true; }, 8500);
      bubbles.set(id, { element: bubble, line, timer }); needsRender = true;
    },
    select(id) { agents.forEach(a => { a.ring.visible = a.id === id; a.label.classList.toggle('selected', a.id === id); }); needsRender = true; },
    zoom(delta) { const offset = camera.position.clone().sub(controls.target); offset.multiplyScalar(delta); if (offset.length() >= controls.minDistance && offset.length() <= controls.maxDistance) camera.position.copy(controls.target).add(offset); needsRender = true; },
    reset() { focusZone('overview'); },
    top() { camera.position.copy(controls.target).add(new THREE.Vector3(0, 32, 11)); controls.update(); needsRender = true; },
    dispose() { tvLayer?.dispose(); for (const record of bubbles.values()) { clearTimeout(record.timer); record.element.remove(); } bubbles.clear(); cancelAnimationFrame(frame); observer.disconnect(); controls.dispose(); scene.traverse(obj => { obj.geometry?.dispose(); obj.material?.dispose(); }); Object.values(textures).forEach(texture => texture.dispose()); sunlight.shadow.dispose(); renderer.dispose(); labels.remove(); renderer.domElement.remove(); },
  };
}

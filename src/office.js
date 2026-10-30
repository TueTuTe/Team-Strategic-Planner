import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { team } from './planner.js';
import { makeOfficeTextures } from './materials.js';
import { buildJapaneseOffice, officeZones } from './office-layout.js';

export function createOffice(container, onSelect) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, .1, 100);
  camera.position.set(...officeZones.overview.offset);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0xeceee7, 0);
  container.appendChild(renderer.domElement);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 1, 0);
  controls.enableDamping = true;
  controls.minDistance = 9;
  controls.maxDistance = 52;
  controls.maxPolarAngle = Math.PI / 2.5;
  controls.minPolarAngle = .3;
  controls.enablePan = true;
  scene.add(new THREE.HemisphereLight('#fff3de', '#87745b', 1.9));
  const sunlight = new THREE.DirectionalLight('#ffebc5', 3.1);
  sunlight.position.set(-7, 10, 4);
  sunlight.castShadow = true;
  sunlight.shadow.mapSize.set(2048, 2048);
  Object.assign(sunlight.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, far: 55 });
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
  const { seats } = buildJapaneseOffice({ scene, box, cylinder, sphere, mat, textures });
  const agents = [];
  const labels = document.createElement('div'); labels.className = 'scene-labels'; container.append(labels);
  const connectors = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  connectors.classList.add('label-connectors'); connectors.setAttribute('aria-hidden', 'true'); labels.append(connectors);
  team.forEach((person, i) => {
    const { x, z, rotation } = seats[person.id], base = 0, g = new THREE.Group(); scene.add(g); g.position.set(x, base, z);
    g.rotation.y = rotation;
    cylinder(.21, .25, .48, person.color, 0, .92, 0, g);
    sphere(.205, '#e5b792', 0, 1.37, 0, g);
    const hair = sphere(.213, ['#4a372b', '#342d2a', '#483d30', '#342d2a', '#352d29'][i], 0, 1.45, .025, g);
    hair.scale.set(1, .6, 1);
    if (i === 0 || i === 1 || i === 3) box(.35, .3, .14, '#42352c', 0, 1.31, .13, g);
    for (const dx of [-.25, .25]) {
      const arm = box(.12, .36, .13, person.color, dx, 1.01, -.1, g); arm.rotation.x = -.7;
      sphere(.07, '#e5b792', dx, .91, -.24, g);
      box(.14, .35, .15, '#465951', dx * .5, .51, -.06, g);
    }
    const ring = new THREE.Mesh(new THREE.RingGeometry(.42, .47, 48), new THREE.MeshBasicMaterial({ color: '#436a53', side: THREE.DoubleSide }));
    ring.rotation.x = -Math.PI / 2; ring.position.set(x, base + .09, z); ring.visible = false; scene.add(ring);
    const label = document.createElement('button'); label.className = 'agent-label';
    const dot = document.createElement('span'); dot.style.background = person.color;
    const role = document.createElement('small'); role.textContent = person.role;
    label.append(dot, document.createTextNode(person.name), role);
    label.addEventListener('click', () => onSelect(person.id)); labels.append(label);
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line'); connectors.append(line);
    agents.push({ id: person.id, g, label, line, ring, anchor: new THREE.Vector3(x, base + 1.95, z) });
  });
  let frame, needsRender = true;
  document.fonts.ready.then(() => { needsRender = true; });
  const observer = new ResizeObserver(() => {
    const { width, height } = container.getBoundingClientRect();
    renderer.setSize(width, height); camera.aspect = width / height;
    camera.fov = camera.aspect < 1.15 ? 50 : 32;
    camera.updateProjectionMatrix();
    needsRender = true;
  }); observer.observe(container);
  function animate() {
    frame = requestAnimationFrame(animate);
    const changed = controls.update();
    if (!changed && !needsRender) return;
    needsRender = false;
    renderer.render(scene, camera);
    const { width, height } = container.getBoundingClientRect();
    connectors.setAttribute('viewBox', `0 0 ${width} ${height}`);
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
  animate();
  function focusZone(id) {
    const zone = officeZones[id] || officeZones.overview;
    controls.target.set(...zone.target);
    camera.position.copy(controls.target).add(new THREE.Vector3(...zone.offset));
    controls.update(); needsRender = true;
  }
  return {
    focusZone,
    select(id) { agents.forEach(a => { a.ring.visible = a.id === id; a.label.classList.toggle('selected', a.id === id); }); needsRender = true; },
    zoom(delta) { const offset = camera.position.clone().sub(controls.target); offset.multiplyScalar(delta); if (offset.length() >= controls.minDistance && offset.length() <= controls.maxDistance) camera.position.copy(controls.target).add(offset); needsRender = true; },
    reset() { focusZone('overview'); },
    top() { camera.position.copy(controls.target).add(new THREE.Vector3(0, 32, 11)); controls.update(); needsRender = true; },
    dispose() { cancelAnimationFrame(frame); observer.disconnect(); controls.dispose(); scene.traverse(obj => { obj.geometry?.dispose(); obj.material?.dispose(); }); Object.values(textures).forEach(texture => texture.dispose()); sunlight.shadow.dispose(); renderer.dispose(); labels.remove(); renderer.domElement.remove(); },
  };
}

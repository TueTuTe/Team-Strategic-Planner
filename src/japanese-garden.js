import * as THREE from 'three';

export function buildJapaneseGarden({ scene, box, cylinder, sphere, mat, textures }) {
  const garden = new THREE.Group(); garden.name = 'sakura-koi-garden'; scene.add(garden);
  box(12.8, .38, 14.4, 'walnut', 15.6, -.23, 0, garden);
  box(12.55, .12, 14.15, '#8b9b70', 15.6, -.005, 0, garden);
  // Engawa link around the open facade: no route cuts through the tea lounge.
  box(11.1, .16, 1.15, 'walnut', 5.4, -.02, 7.7, garden);
  for (let i = 0; i < 38; i++) box(.27, .035, 1.11, 'oak', .02 + i * .29, .077, 7.7, garden);
  box(1.4, .15, 1.3, 'oak', 10.7, .025, 6.75, garden);
  for (let i = 0; i < 15; i++) {
    const stone = cylinder(.47, .49, .065, i % 2 ? '#c2c0aa' : '#b6b8a0', 10.75, .1, 5.8 - i * .68, garden);
    stone.scale.set(1, 1, .72); stone.rotation.y = i * .27;
  }
  // Shallow pond bed and a transparent surface reveal the animated koi.
  const pond = new THREE.Group(); pond.name = 'garden-koi-pond'; pond.position.set(17.05, 0, -1.1); garden.add(pond);
  const bed = cylinder(1, 1, .13, '#3f786d', 0, .06, 0, pond); bed.scale.set(3.7, 1, 3.75);
  const waterMaterial = new THREE.MeshStandardMaterial({ color: '#88c4ad', transparent: true, opacity: .3, depthWrite: false, roughness: .2, metalness: .12 });
  const water = new THREE.Mesh(new THREE.CircleGeometry(1, 72), waterMaterial); water.rotation.x = -Math.PI / 2; water.scale.set(3.65, 3.7, 1); water.position.y = .27; pond.add(water);
  const stoneGeometry = new THREE.IcosahedronGeometry(1, 1), stones = new THREE.InstancedMesh(stoneGeometry, mat('#939783'), 40);
  const dummy = new THREE.Object3D();
  let stoneIndex = 0;
  for (let i = 0; i < 44; i++) {
    if (i >= 37 && i <= 40) continue; // Open outlet to the stream behind the garden.
    const a = i / 44 * Math.PI * 2;
    dummy.position.set(Math.cos(a) * 3.72, .22 + (i % 3) * .035, Math.sin(a) * 3.78);
    dummy.rotation.set(i * .6, i * 1.7, .2); dummy.scale.set(.4 + (i % 3) * .08, .29 + (i % 2) * .1, .33 + (i % 4) * .04); dummy.updateMatrix(); stones.setMatrixAt(stoneIndex++, dummy.matrix);
  }
  stones.castShadow = true; stones.receiveShadow = true; pond.add(stones);
  const koi = [];
  for (let i = 0; i < 7; i++) {
    const fish = new THREE.Group(); fish.name = `garden-koi-${i + 1}`; pond.add(fish);
    const body = sphere(.17, i % 3 ? '#eee5d2' : '#c88c42', 0, 0, 0, fish); body.scale.set(2.15, .45, .75);
    for (let patch = 0; patch < 3; patch++) {
      const marking = sphere(.092, (i + patch) % 3 ? '#cb6f3b' : '#4d5447', -.2 + patch * .17, .063, Math.sin(i + patch) * .035, fish); marking.scale.set(1.1, .28, .92);
    }
    const tail = new THREE.Mesh(new THREE.ConeGeometry(.13, .25, 3), mat('#dfccb0')); tail.rotation.z = Math.PI / 2; tail.position.x = -.42; tail.scale.z = .35; fish.add(tail);
    for (const z of [-.07, .07]) sphere(.013, '#303d33', .25, .05, z, fish);
    koi.push({ fish, tail, phase: i * .93, radius: 1.8 + i % 3 * .45 });
  }
  // Tiered stones create a small waterfall that empties into the north of the pond.
  for (let level = 0; level < 4; level++) for (let i = 0; i < 4 - level; i++) {
    const rock = sphere(.68, ['#7d8677', '#929681', '#a4a791'][i % 3], 17.35 + i * .62 - level * .05, .4 + level * .68, -5.8 - level * .13, garden);
    rock.scale.set(1.15, .72 + (i % 2) * .12, .85);
  }
  const flowCanvas = document.createElement('canvas'); flowCanvas.width = 128; flowCanvas.height = 256;
  const ctx = flowCanvas.getContext('2d'); ctx.fillStyle = '#85cbbd'; ctx.fillRect(0, 0, 128, 256);
  for (let i = 0; i < 28; i++) { ctx.fillStyle = i % 3 ? '#d7f2dc' : '#aee2d4'; ctx.fillRect((i * 37) % 128, (i * 67) % 256, 2 + i % 4, 35 + i % 5 * 20); }
  const flowTexture = new THREE.CanvasTexture(flowCanvas); flowTexture.wrapS = flowTexture.wrapT = THREE.RepeatWrapping; flowTexture.colorSpace = THREE.SRGBColorSpace; textures.gardenWaterfall = flowTexture;
  const flowMaterial = new THREE.MeshStandardMaterial({ map: flowTexture, color: '#d6f0dc', transparent: true, opacity: .8, side: THREE.DoubleSide, roughness: .3 });
  const falls = new THREE.Mesh(new THREE.PlaneGeometry(1.06, 2.55), flowMaterial); falls.name = 'garden-waterfall'; falls.position.set(18.1, 1.55, -5.26); garden.add(falls);
  box(1.3, .08, 1.1, '#9bc9b4', 18.1, .22, -4.8, garden);
  const foam = [];
  for (let i = 0; i < 9; i++) {
    const drop = sphere(.055 + i % 3 * .014, '#e5f0d7', 17.7 + i * .1, .3, -4.65, garden); foam.push(drop);
  }
  const ripples = [];
  for (let i = 0; i < 3; i++) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(.48 + i * .34, .012, 4, 44), new THREE.MeshBasicMaterial({ color: '#d9efc9', transparent: true, opacity: .25 }));
    ring.rotation.x = -Math.PI / 2; ring.position.set(18.1, .285 + i * .002, -3.9); garden.add(ring); ripples.push(ring);
  }
  // Bench faces the pond, reached from the stone path along its western bank.
  box(.78, .12, 3.45, 'oak', 11.7, .65, 2, garden);
  box(.09, .52, 3.45, 'walnut', 11.33, .91, 2, garden);
  for (const x of [11.43, 11.97]) for (const z of [.6, 3.4]) box(.085, .56, .09, 'walnut', x, .35, z, garden);
  // Stone lantern and compact shrubs stay outside the walking path.
  cylinder(.38, .42, .17, '#b6b8a1', 12.15, .15, -3.3, garden);
  cylinder(.1, .16, .8, '#a4aa94', 12.15, .61, -3.3, garden);
  box(.44, .43, .44, '#bfc3ab', 12.15, 1.2, -3.3, garden);
  box(.29, .24, .015, 'lantern', 12.15, 1.2, -3.067, garden);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(.45, .25, 4), mat('#828e78')); roof.rotation.y = Math.PI / 4; roof.position.set(12.15, 1.54, -3.3); garden.add(roof);
  for (const [x, z, scale] of [[13, -5.8, .8], [20.8, -3.6, 1], [20.6, 5.6, .9], [13.6, 5.9, .65]]) {
    const shrub = sphere(.6, '#71855e', x, .38, z, garden); shrub.scale.set(scale * 1.3, .7, scale);
  }
  const treePositions = [[11.9, -5.15], [20.5, 3.6], [16.2, 5.75]];
  function branch(a, b, radius) {
    const direction = new THREE.Vector3().subVectors(b, a);
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius * .6, radius, direction.length(), 9), mat('#745540'));
    mesh.position.copy(a).add(b).multiplyScalar(.5); mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize()); mesh.castShadow = true; garden.add(mesh);
  }
  const blossomGeometry = new THREE.IcosahedronGeometry(.14, 1);
  const blossoms = new THREE.InstancedMesh(blossomGeometry, mat('#efc1ca'), 540); blossoms.name = 'garden-sakura-blossoms'; blossoms.castShadow = true;
  treePositions.forEach(([x, z], tree) => {
    branch(new THREE.Vector3(x, .08, z), new THREE.Vector3(x + .2, 3.15, z), .15);
    for (let arm = 0; arm < 5; arm++) {
      const angle = arm * 2.4 + tree;
      const tip = new THREE.Vector3(x + Math.cos(angle) * 1.25, 3.5 + arm % 2 * .45, z + Math.sin(angle) * 1.25);
      branch(new THREE.Vector3(x + .15, 2.2 + arm % 2 * .3, z), tip, .065);
      for (let cluster = 0; cluster < 2; cluster++) {
        const bloom = sphere(.65, cluster ? '#e5abbc' : '#f0cdd1', tip.x + cluster * .2, tip.y + cluster * .18, tip.z, garden); bloom.scale.set(1.15, .6, .95);
      }
    }
    for (let i = 0; i < 180; i++) {
      const a = i * 2.4, r = .3 + (i % 19) / 19 * 1.55;
      dummy.position.set(x + Math.cos(a) * r, 3.45 + Math.sin(i * .8) * .55, z + Math.sin(a) * r);
      dummy.rotation.set(i, i * .3, i * .8); dummy.scale.set(1, .6, 1); dummy.updateMatrix(); blossoms.setMatrixAt(tree * 180 + i, dummy.matrix);
    }
  }); garden.add(blossoms);
  const petals = new THREE.InstancedMesh(new THREE.SphereGeometry(.065, 6, 4), mat('#f1cbd2'), 27); petals.name = 'garden-falling-petals'; garden.add(petals);
  return time => {
    flowTexture.offset.y = -time * .5;
    koi.forEach(({ fish, tail, phase, radius }) => {
      const t = time * .2 + phase; fish.position.set(Math.cos(t) * radius, .205, Math.sin(t) * radius * .82);
      fish.rotation.y = Math.atan2(-Math.cos(t), -Math.sin(t)); tail.rotation.y = Math.sin(time * 5 + phase) * .3;
    });
    foam.forEach((drop, i) => { drop.position.y = .3 + Math.abs(Math.sin(time * 2.8 + i)) * .12; drop.position.z = -4.65 + Math.sin(time + i) * .12; });
    ripples.forEach((ring, i) => ring.scale.setScalar(1 + Math.sin(time * 1.4 - i) * .15));
    for (let i = 0; i < 27; i++) {
      const [x, z] = treePositions[i % 3]; dummy.position.set(x + Math.sin(time * .35 + i) * 1.3, 4.1 - (time * .22 + i * .61) % 3.95, z + Math.cos(i + time * .2) * 1.25);
      dummy.rotation.set(time + i, i, time * .4); dummy.scale.set(1.1, .3, .7); dummy.updateMatrix(); petals.setMatrixAt(i, dummy.matrix);
    } petals.instanceMatrix.needsUpdate = true;
  };
}

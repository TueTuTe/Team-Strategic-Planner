import * as THREE from 'three';

export function buildNatureCorner({ scene, box, cylinder, sphere, mat }) {
  // A shallow display cabinet stays to the left of the alcove's open entrance.
  box(3.2, .74, .88, 'walnut', -6.6, .43, -2.55);
  box(3.3, .08, .96, 'oak', -6.6, .84, -2.55);
  for (let i = 0; i < 21; i++) box(.045, .59, .035, 'oak', -8.1 + i * .15, .43, -2.095);

  const tank = new THREE.Group(); tank.name = 'strategy-aquarium'; tank.position.set(-7.23, .9, -2.55); scene.add(tank);
  box(1.72, .065, .76, '#35443c', 0, 0, 0, tank);
  box(1.61, .085, .65, '#c6b78d', 0, .075, 0, tank);
  box(1.6, .88, .64, 'water', 0, .54, 0, tank);
  // Separate panes and thin edges reveal the fish instead of hiding them.
  for (const z of [-.36, .36]) box(1.7, 1.03, .014, 'aquariumGlass', 0, .54, z, tank);
  for (const x of [-.85, .85]) box(.014, 1.03, .72, 'aquariumGlass', x, .54, 0, tank);
  for (const x of [-.85, .85]) for (const z of [-.36, .36]) box(.018, 1.06, .018, '#7d9b90', x, .54, z, tank);
  for (const z of [-.36, .36]) box(1.74, .035, .035, '#35443c', 0, 1.07, z, tank);
  for (const x of [-.85, .85]) box(.035, .035, .72, '#35443c', x, 1.07, 0, tank);
  box(1.59, .008, .64, 'water', 0, .99, 0, tank);
  // A tiny light bridge casts a cool visual accent within the warm study.
  for (const x of [-.72, .72]) box(.028, .15, .028, '#43514a', x, 1.16, -.12, tank);
  box(1.52, .045, .12, '#43514a', 0, 1.25, -.12, tank);
  box(1.4, .018, .09, 'aquariumGlow', 0, 1.22, -.12, tank);

  for (let i = 0; i < 6; i++) {
    const rock = sphere(.12 + (i % 3) * .018, ['#777d6c', '#8e937f', '#a4a18b'][i % 3], -.58 + i * .23, .19, -.12 + Math.sin(i) * .11, tank);
    rock.scale.set(1.2, .75 + (i % 2) * .4, .8);
    const moss = sphere(.1, '#728f52', -.58 + i * .23, .27, -.12 + Math.sin(i) * .11, tank); moss.scale.set(1.3, .35, .85);
  }
  for (const [x, z, height] of [[-.68, -.18, .7], [-.46, -.22, .53], [.57, -.18, .69], [.7, -.08, .48], [.24, -.22, .41]]) {
    cylinder(.012, .012, height, '#658b53', x, .12 + height / 2, z, tank);
    for (let leaf = 0; leaf < 4; leaf++) {
      const foliage = sphere(.11, leaf % 2 ? '#789d60' : '#4e805b', x + (leaf % 2 ? -.065 : .065), .21 + leaf * height / 5, z, tank);
      foliage.scale.set(.55, 1.4, .3); foliage.rotation.z = leaf % 2 ? -.5 : .5;
    }
  }
  function fish(x, y, z, color, heading) {
    const group = new THREE.Group(); group.position.set(x, y, z); group.rotation.y = heading; tank.add(group);
    const body = sphere(.06, color, 0, 0, 0, group); body.scale.set(1.7, .75, .5);
    const tail = new THREE.Shape(); tail.moveTo(-.075, 0); tail.lineTo(-.16, .06); tail.lineTo(-.16, -.06); tail.closePath();
    const fin = new THREE.Mesh(new THREE.ShapeGeometry(tail), mat(color)); fin.material.side = THREE.DoubleSide; group.add(fin);
    sphere(.008, '#273e33', .065, .014, .025, group);
  }
  fish(-.36, .7, .17, '#dea35c', .25); fish(.07, .61, .22, '#e6b66c', -.15);
  fish(.39, .78, .1, '#c98851', Math.PI); fish(-.11, .44, .2, '#bad0bd', -.2);

  // A separate closed terrarium: visible drainage, soil, moss and a small fern.
  const terrarium = new THREE.Group(); terrarium.name = 'strategy-terrarium'; terrarium.position.set(-5.64, .91, -2.55); scene.add(terrarium);
  cylinder(.4, .37, .045, 'walnut', 0, .015, 0, terrarium);
  cylinder(.36, .36, .065, '#bdb69d', 0, .065, 0, terrarium);
  cylinder(.36, .36, .1, '#5d4e39', 0, .145, 0, terrarium);
  for (let i = 0; i < 9; i++) {
    const a = i * 2.4;
    const moss = sphere(.11, i % 2 ? '#84975a' : '#66864d', Math.cos(a) * .21, .22, Math.sin(a) * .21, terrarium);
    moss.scale.set(1.1, .6, .85);
  }
  const stone = sphere(.13, '#aaa18b', -.13, .29, -.12, terrarium); stone.scale.set(.8, 1.25, .85);
  cylinder(.012, .012, .43, '#58764b', .07, .4, -.025, terrarium);
  for (let i = 0; i < 7; i++) {
    const a = i * 2.4;
    const leaf = sphere(.12, i % 2 ? '#78985d' : '#4e7854', .07 + Math.cos(a) * .12, .4 + i * .035, Math.sin(a) * .12, terrarium);
    leaf.scale.set(.6, 1.4, .23); leaf.rotation.z = Math.cos(a) * .7; leaf.rotation.y = a;
  }
  cylinder(.32, .4, 1.02, 'terrariumGlass', 0, .53, 0, terrarium);
  cylinder(.34, .34, .055, 'oak', 0, 1.065, 0, terrarium);
  cylinder(.29, .29, .013, '#b29b73', 0, 1.1, 0, terrarium);
}

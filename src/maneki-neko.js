import * as THREE from 'three';

export function buildManekiNeko({ parent, box, cylinder, sphere, mat }) {
  const cat = new THREE.Group(); cat.name = 'reception-maneki-neko'; parent.add(cat);
  const white = '#f1e8d3', red = '#b7402e', gold = '#c6a34f', ink = '#3d3c32';
  box(.62, .045, .46, red, 0, .025, 0, cat);
  const body = sphere(.22, white, 0, .27, 0, cat); body.scale.set(1, 1.22, .8);
  for (const x of [-.12, .12]) { const foot = sphere(.09, white, x, .105, .12, cat); foot.scale.set(1, .6, 1.15); }
  const tail = new THREE.Mesh(new THREE.TorusGeometry(.12, .035, 7, 20, Math.PI * 1.4), mat(white)); tail.position.set(.16, .18, -.12); cat.add(tail);
  const head = sphere(.205, white, 0, .53, .015, cat); head.scale.set(1.04, .9, .83);
  for (const x of [-.13, .13]) {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(.085, .18, 3), mat(white)); ear.position.set(x, .7, .006); ear.rotation.y = Math.PI; cat.add(ear);
    const inside = new THREE.Mesh(new THREE.ConeGeometry(.044, .105, 3), mat('#ce8b7d')); inside.position.set(x, .713, .043); inside.rotation.y = Math.PI; cat.add(inside);
  }
  const collar = cylinder(.19, .19, .055, red, 0, .407, .015, cat); collar.scale.z = .85;
  sphere(.046, gold, 0, .386, .177, cat); sphere(.011, ink, 0, .378, .218, cat);
  function stroke(points, color, radius = .009) {
    const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
    const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 10, radius, 5, false), mat(color)); cat.add(mesh);
  }
  for (const x of [-.078, .078]) {
    stroke([[x - .035, .54, .168], [x, .561, .187], [x + .035, .54, .168]], ink);
    for (const dy of [-.022, .009]) stroke([[Math.sign(x) * .115, .495 + dy, .161], [Math.sign(x) * .18, .505 + dy, .139]], ink, .005);
  }
  sphere(.018, '#be776c', 0, .507, .194, cat);
  stroke([[-.035, .482, .179], [0, .471, .192], [.035, .482, .179]], red, .006);
  const coin = sphere(.12, gold, -.065, .247, .186, cat); coin.scale.set(.8, 1.25, .25);
  for (const y of [.2, .25, .3]) box(.065, .012, .007, '#76603d', -.065, y, .222, cat);
  box(.012, .14, .007, '#76603d', -.065, .25, .224, cat);
  const arm = sphere(.095, white, -.16, .25, .14, cat); arm.scale.set(.7, 1.2, .8);
  const paw = new THREE.Group(); paw.position.set(.19, .37, .01); paw.name = 'maneki-neko-waving-paw'; cat.add(paw);
  const forearm = sphere(.085, white, .015, .12, 0, paw); forearm.scale.set(.8, 1.65, .8);
  sphere(.083, white, .015, .25, .015, paw);
  for (let i = 0; i < 3; i++) sphere(.012, '#ce8b7d', -.02 + i * .035, .263, .088, paw);
  return { cat, animate(time) { paw.rotation.x = -.12 + Math.sin(time * 1.8) * .2; } };
}

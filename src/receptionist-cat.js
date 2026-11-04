import * as THREE from 'three';
import { receptionDesk } from './reception-layout.js';

export const receptionistCatProfile = { id: 'receptionist-cat', name: 'Mochi', role: 'Mèo lễ tân' };
export function receptionistReply(action = 'hello') {
  return {
    hello: 'Meo~ Chào mừng bạn đến Atelier! Mình là Mochi, mèo lễ tân. Mời bạn vào nghỉ chân nhé!',
    tea: 'Meo~ Mời bạn ngồi ở sofa và thưởng thức trà. Mình ở quầy nếu bạn cần hỗ trợ nhé!',
    directions: 'Từ sảnh, qua cầu đèn lồng là tới văn phòng. Ra vườn để sang Izakaya hoặc Phòng Triển lãm Chiến lược nhé!',
  }[action] || receptionistReply('hello');
}

export function buildReceptionistCat({ parent, box, sphere, cylinder, mat }) {
  const root = new THREE.Group(); root.name = receptionistCatProfile.id;
  root.position.set(receptionDesk.x - Math.sin(receptionDesk.rotation) * .95, .23, receptionDesk.z - Math.cos(receptionDesk.rotation) * .95);
  root.rotation.y = receptionDesk.rotation; parent.add(root);
  const fur = '#edd0a0', cream = '#f7edda', orange = '#c99459', pink = '#db9d98', ink = '#334438', indigo = '#405c64';
  const body = sphere(.255, fur, 0, .84, 0, root); body.scale.set(1, 1.5, .78);
  const apron = sphere(.26, indigo, 0, .85, .035, root); apron.scale.set(1.03, 1.16, .78);
  for (const x of [-.13, .13]) {
    cylinder(.08, .09, .34, fur, x, .32, 0, root);
    const foot = sphere(.105, cream, x, .09, .055, root); foot.scale.set(1, .62, 1.2);
    const strap = box(.05, .34, .025, indigo, x, 1.11, .16, root); strap.rotation.z = -x * .8;
  }
  box(.26, .14, .035, '#789099', 0, .76, .245, root);
  box(.16, .075, .02, cream, -.075, 1.035, .22, root);
  sphere(.017, '#bd6450', -.105, 1.035, .237, root);
  const head = new THREE.Group(); head.name = 'mochi-head'; head.position.set(0, 1.48, .025); root.add(head);
  const skull = sphere(.35, fur, 0, 0, 0, head); skull.scale.set(1.04, .92, .92);
  const ears = [];
  for (const x of [-.245, .245]) {
    const ear = new THREE.Group(); ear.position.set(x, .26, -.015); ear.rotation.z = -Math.sign(x) * .15; head.add(ear); ears.push(ear);
    const shell = new THREE.Mesh(new THREE.ConeGeometry(.13, .28, 3), mat(fur)); shell.rotation.y = Math.PI; shell.castShadow = true; ear.add(shell);
    const inside = new THREE.Mesh(new THREE.ConeGeometry(.072, .16, 3), mat(pink)); inside.rotation.y = Math.PI; inside.position.set(0, .012, .055); ear.add(inside);
  }
  const eyes = [];
  for (const x of [-.13, .13]) {
    const eye = new THREE.Group(); eye.name = 'mochi-eye'; eye.position.set(x, .025, .305); head.add(eye); eyes.push(eye);
    const iris = sphere(.068, ink, 0, 0, 0, eye); iris.scale.z = .55;
    sphere(.021, '#fff9e9', -.017, .02, .034, eye); sphere(.008, '#fff9e9', .019, -.02, .034, eye);
    const cheek = sphere(.09, '#e0aa92', x * 1.72, -.08, .255, head); cheek.scale.set(1, .38, .35);
    const muzzle = sphere(.095, cream, x * .47, -.1, .288, head); muzzle.scale.set(1, .75, .65);
  }
  sphere(.025, pink, 0, -.065, .365, head);
  function stroke(points, color, r, parentGroup = head) {
    const curve = new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));
    const line = new THREE.Mesh(new THREE.TubeGeometry(curve, 12, r, 5, false), mat(color)); parentGroup.add(line); return line;
  }
  stroke([[-.055,-.13,.337],[0,-.15,.352],[.055,-.13,.337]], ink, .007);
  for (const side of [-1,1]) for (const dy of [-.02,.025]) stroke([[side*.15,-.09+dy,.309],[side*.29,-.07+dy,.24]], '#7a6b50', .005);
  const band = new THREE.Mesh(new THREE.TorusGeometry(.32,.028,6,44),mat(cream)); band.rotation.x = Math.PI/2; band.position.y = .16; head.add(band);
  sphere(.033, '#b84939', 0, .16, .326, head);
  const paws = [];
  for (const x of [-.275,.275]) {
    const arm = new THREE.Group(); arm.name = x > 0 ? 'mochi-greeting-paw' : 'mochi-resting-paw'; arm.position.set(x,1.055,.01); root.add(arm); paws.push(arm);
    const sleeve = sphere(.082, indigo, 0, -.105, .02, arm); sleeve.scale.set(1,1.45,1);
    const forearm = sphere(.074, fur, 0, -.235, .05, arm); forearm.scale.set(1,1.55,1);
    sphere(.095, cream, 0, -.34, .075, arm);
    for (let i=0;i<3;i++) sphere(.011,pink,-.03+i*.03,-.345,.162,arm);
  }
  const tail = new THREE.Group(); tail.name = 'mochi-tail'; tail.position.set(.19,.44,-.035); root.add(tail);
  stroke([[0,0,0],[.18,.12,0],[.36,.28,.02],[.38,.48,.05],[.25,.6,.06]],orange,.055,tail);
  let wavingUntil = 0;
  function reset() {
    root.position.y = .23; head.rotation.set(0,0,0); tail.rotation.set(0,0,0);
    eyes.forEach(eye=>eye.scale.y=1); paws.forEach(paw=>paw.rotation.set(0,0,0));
    ears.forEach((ear,i)=>ear.rotation.z=i ? -.15 : .15);
  }
  reset();
  return {
    root,
    greet() { wavingUntil = performance.now()/1000 + 3.5; },
    reset,
    animate(time) {
      root.position.y = .23 + Math.sin(time*1.7)*.008;
      head.rotation.y = Math.sin(time*.65)*.08; head.rotation.z = Math.sin(time*.9)*.035;
      tail.rotation.z = Math.sin(time*1.6)*.09;
      const blink = time%4.6 < .14;
      eyes.forEach(eye=>eye.scale.y=blink ? .07 : 1);
      ears.forEach((ear,i)=>ear.rotation.z=(i ? -.15 : .15)+Math.sin(time*1.1+i)*.025);
      paws[1].rotation.z = time < wavingUntil ? 2.65+Math.sin(time*7)*.18 : .06;
      paws[0].rotation.x = Math.sin(time*1.3)*.035;
    },
  };
}

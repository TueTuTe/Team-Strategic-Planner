import { test, expect } from '@playwright/test';

test('exterior guest doorway is physically open and the counter and lucky cat face arriving guests', async ({ page }) => {
  await page.goto('/#team');
  const result = await page.evaluate(async () => {
    const THREE = await import('/node_modules/three/build/three.module.js');
    const { buildReception } = await import('/src/reception.js');
    const { receptionGuestEntrance, receptionDesk, receptionSofa } = await import('/src/reception-layout.js');
    const scene = new THREE.Scene(), textures = {}, material = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });
    const add = (geometry, x, y, z, parent) => { const mesh = new THREE.Mesh(geometry, material); mesh.position.set(x, y, z); parent.add(mesh); return mesh; };
    buildReception({ scene, textures, mat: () => material,
      box: (w,h,d,c,x,y,z,p=scene) => add(new THREE.BoxGeometry(w,h,d),x,y,z,p),
      cylinder: (r1,r2,h,c,x,y,z,p=scene) => add(new THREE.CylinderGeometry(r1,r2,h,12),x,y,z,p),
      sphere: (r,c,x,y,z,p=scene) => add(new THREE.SphereGeometry(r,12,8),x,y,z,p),
    });
    scene.updateMatrixWorld(true);
    const clearDoor = [-.7,0,.7].every(offset => {
      const ray = new THREE.Raycaster(new THREE.Vector3(-12.8,1.35,receptionGuestEntrance.z+offset),new THREE.Vector3(1,0,0),0,5.65);
      return ray.intersectObjects(scene.children,true).length === 0;
    });
    const door = new THREE.Vector3(receptionGuestEntrance.x,0,receptionGuestEntrance.z);
    const desk = scene.getObjectByName('japanese-front-desk'), cat = scene.getObjectByName('reception-maneki-neko');
    const towardGuest = door.clone().sub(new THREE.Vector3(receptionDesk.x,0,receptionDesk.z)).normalize();
    const facing = obj => new THREE.Vector3(0,0,1).transformDirection(obj.matrixWorld).dot(towardGuest);
    const entrance = scene.getObjectByName('reception-main-entrance').getWorldPosition(new THREE.Vector3());
    const bridgeCenter = new THREE.Box3().setFromObject(scene.getObjectByName('office-reception-lantern-bridge')).getCenter(new THREE.Vector3());
    const tv = scene.getObjectByName('reception-tv-display'), tvPosition = tv.getWorldPosition(new THREE.Vector3());
    const towardSofa = new THREE.Vector3(receptionSofa.x, tvPosition.y, receptionSofa.z).sub(tvPosition).normalize();
    const tvFacing = new THREE.Vector3(0,0,1).transformDirection(tv.matrixWorld).dot(towardSofa);
    const answer = { clearDoor, deskFacing: facing(desk), catFacing: facing(cat), entranceX: entrance.x, bridgeDistance: entrance.distanceTo(bridgeCenter), tvFacing, tvBehindDesk: tvPosition.x > desk.position.x + 1.3 };
    scene.traverse(obj => obj.geometry?.dispose()); Object.values(textures).forEach(t=>t.dispose()); material.dispose();
    return answer;
  });
  expect(result.clearDoor).toBe(true);
  expect(result.entranceX).toBe(-9);
  expect(result.deskFacing).toBeGreaterThan(.95);
  expect(result.catFacing).toBeGreaterThan(.95);
  expect(result.bridgeDistance).toBeGreaterThan(8);
  expect(result.tvFacing).toBeGreaterThan(.9);
  expect(result.tvBehindDesk).toBe(true);
});

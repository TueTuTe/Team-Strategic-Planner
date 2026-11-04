import { test, expect } from '@playwright/test';

test('fish are distributed across all water routes and pause without jumping after a long stop', async ({ page }) => {
  await page.goto('/#team');
  const result=await page.evaluate(async()=>{
    const THREE=await import('/node_modules/three/build/three.module.js');
    const {buildAquaticLife}=await import('/src/aquatic-life.js');
    const scene=new THREE.Scene(),life=buildAquaticLife({scene});scene.updateMatrixWorld(true);
    const underwater=new THREE.Box3().setFromObject(life.shark).max.y<.27;
    const before=life.shark.position.clone();life.animate(0);life.animate(.05);const moved=before.distanceTo(life.shark.position)>.02;
    const paused=life.shark.position.clone();life.animate(1000);const noJump=paused.distanceTo(life.shark.position)<.115;
    const count=scene.getObjectByName('campus-koi-bodies').count;
    const matrix=new THREE.Matrix4(),point=new THREE.Vector3(),regions=new Set();
    const bodies=scene.getObjectByName('campus-koi-bodies');
    for(let i=0;i<count;i++){bodies.getMatrixAt(i,matrix);point.setFromMatrixPosition(matrix);if(point.z<-11.6&&point.x<10)regions.add('divider');else if(point.x>22)regions.add('gallery');else if(point.z<-7.2)regions.add('main');else regions.add('pond');}
    scene.traverse(o=>o.geometry?.dispose());return {count,underwater,moved,noJump,regions:[...regions].sort()};
  });
  expect(result.count).toBe(48);expect(result.underwater).toBe(true);expect(result.moved).toBe(true);expect(result.noJump).toBe(true);
  expect(result.regions).toEqual(['divider','gallery','main','pond']);
});

test('shark follow view runs, freezes and works on mobile', async ({ page }) => {
  test.setTimeout(60000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.addInitScript(()=>{if(top===self)localStorage.setItem('atelier-audio-v1',JSON.stringify({enabled:false}));});
  await page.route('https://www.youtube-nocookie.com/**',route=>route.fulfill({contentType:'text/html',body:'<p>YouTube fixture</p>'}));
  await page.goto('/');
  await page.getByRole('button',{name:'Theo dõi cá mập',exact:true}).click();
  await expect(page.locator('[data-zone="shark"]')).toHaveAttribute('aria-pressed','true');
  await page.waitForTimeout(500);await page.locator('.office-panel').screenshot({path:'/tmp/atelier-shark.png'});
  const canvas=page.locator('#office-canvas canvas'),first=await canvas.screenshot();
  await page.getByRole('button',{name:'Chuyển động: tắt',exact:true}).click();await page.waitForTimeout(700);
  expect((await canvas.screenshot()).equals(first)).toBe(false);
  await page.getByRole('button',{name:'Chuyển động: bật',exact:true}).click();await page.waitForTimeout(400);
  const frozen=await canvas.screenshot();await page.waitForTimeout(500);expect((await canvas.screenshot()).equals(frozen)).toBe(true);
  await page.getByRole('button',{name:'Vườn Nhật',exact:true}).click();await page.waitForTimeout(500);
  await page.locator('.office-panel').screenshot({path:'/tmp/atelier-many-koi.png'});
  await page.setViewportSize({width:390,height:844});await page.getByRole('button',{name:'Theo dõi cá mập',exact:true}).click();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);expect(errors).toEqual([]);
});

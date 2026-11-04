import { test, expect } from '@playwright/test';

test('Mochi stands behind the counter facing guests and can animate and freeze', async ({ page }) => {
  await page.goto('/#team');
  const result = await page.evaluate(async () => {
    const THREE = await import('/node_modules/three/build/three.module.js');
    const { buildReceptionistCat } = await import('/src/receptionist-cat.js');
    const { receptionDesk, receptionGuestEntrance } = await import('/src/reception-layout.js');
    const scene = new THREE.Scene(), material = new THREE.MeshBasicMaterial();
    const add=(g,x,y,z,p)=>{const m=new THREE.Mesh(g,material);m.position.set(x,y,z);p.add(m);return m;};
    const cat=buildReceptionistCat({parent:scene,mat:()=>material,
      box:(w,h,d,c,x,y,z,p=scene)=>add(new THREE.BoxGeometry(w,h,d),x,y,z,p),
      cylinder:(r1,r2,h,c,x,y,z,p=scene)=>add(new THREE.CylinderGeometry(r1,r2,h,12),x,y,z,p),
      sphere:(r,c,x,y,z,p=scene)=>add(new THREE.SphereGeometry(r,12,8),x,y,z,p),
    });
    scene.updateMatrixWorld(true);
    const towardDoor=new THREE.Vector3(receptionGuestEntrance.x,0,receptionGuestEntrance.z).sub(new THREE.Vector3(cat.root.position.x,0,cat.root.position.z)).normalize();
    const facing=new THREE.Vector3(0,0,1).transformDirection(cat.root.matrixWorld).dot(towardDoor);
    cat.greet();cat.animate(.05);
    const waved=cat.root.getObjectByName('mochi-greeting-paw').rotation.z>2;
    const blinked=cat.root.getObjectByName('mochi-eye').scale.y<.1;
    cat.animate(1.4);const tailMoved=Math.abs(cat.root.getObjectByName('mochi-tail').rotation.z)>.01;
    cat.reset();
    const frozen=cat.root.position.y===.23&&cat.root.getObjectByName('mochi-greeting-paw').rotation.z===0&&cat.root.getObjectByName('mochi-eye').scale.y===1;
    const behind=cat.root.position.x>receptionDesk.x+.7&&cat.root.position.x<receptionDesk.x+1.3;
    scene.traverse(o=>o.geometry?.dispose());material.dispose();return {facing,behind,waved,blinked,tailMoved,frozen};
  });
  expect(result.facing).toBeGreaterThan(.95);expect(result.behind).toBe(true);
  for(const key of ['waved','blinked','tailMoved','frozen'])expect(result[key]).toBe(true);
});

test('cat receptionist greets, offers tea and gives directions without changing the strategy team', async ({ page }) => {
  test.setTimeout(60000);
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.addInitScript(()=>{if(top===self)localStorage.setItem('atelier-audio-v1',JSON.stringify({enabled:false}));});
  await page.route('https://www.youtube-nocookie.com/**',route=>route.fulfill({contentType:'text/html',body:'<p>YouTube fixture</p>'}));
  await page.goto('/');
  await expect(page.locator('.agent-label')).toHaveCount(5);
  await page.getByRole('button',{name:'Gặp Mochi',exact:true}).click();
  const bubble=page.locator('.character-bubble[data-speaker="receptionist-cat"]');
  await expect(bubble).toBeVisible();await expect(bubble).toContainText('Mình là Mochi');
  await expect(page.locator('[data-zone="receptionist"]')).toHaveAttribute('aria-pressed','true');
  await expect(page.getByRole('button',{name:'Chào Mochi, mèo lễ tân',exact:true})).toBeVisible();
  await page.locator('#office-canvas').scrollIntoViewIfNeeded();await page.waitForTimeout(500);
  await page.locator('.office-panel').screenshot({path:'/tmp/atelier-mochi.png'});
  await page.getByRole('button',{name:'Mochi mời trà',exact:true}).click();await expect(bubble).toContainText('ngồi ở sofa');
  await page.getByRole('button',{name:'Hỏi Mochi đường đi',exact:true}).click();await expect(bubble).toContainText('qua cầu đèn lồng');
  await page.getByRole('button',{name:'Chuyển động: tắt',exact:true}).click();
  await page.getByRole('button',{name:'Chào Mochi, mèo lễ tân',exact:true}).click();await page.waitForTimeout(500);
  await page.locator('.office-panel').screenshot({path:'/tmp/atelier-mochi-wave.png'});
  await page.getByRole('button',{name:'Chuyển động: bật',exact:true}).click();
  await page.getByRole('button',{name:'Khu làm việc',exact:true}).click();await expect(bubble).toBeHidden();
  await page.setViewportSize({width:390,height:844});await page.getByRole('button',{name:'Gặp Mochi',exact:true}).click();await expect(bubble).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await expect(page.locator('.team-card')).toHaveCount(5);expect(errors).toEqual([]);
});

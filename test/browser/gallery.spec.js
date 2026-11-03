import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => { if (top === self) localStorage.setItem('atelier-audio-v1', JSON.stringify({ enabled: false })); });
  await page.route('https://www.youtube-nocookie.com/**', route=>route.fulfill({contentType:'text/html',body:'<p>YouTube fixture</p>'}));
});

test('gallery spans the bar and garden but has only a garden bridge entrance', async ({ page }) => {
  await page.goto('/#team');
  const layout = await page.evaluate(async () => {
    const THREE = await import('/node_modules/three/build/three.module.js');
    const { buildStrategyGallery } = await import('/src/strategy-gallery.js');
    const scene = new THREE.Scene(), textures = {}, material = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });
    const add=(g,x,y,z,p)=>{const mesh=new THREE.Mesh(g,material);mesh.position.set(x,y,z);p.add(mesh);return mesh;};
    buildStrategyGallery({scene,textures,mat:()=>material,
      box:(w,h,d,c,x,y,z,p=scene)=>add(new THREE.BoxGeometry(w,h,d),x,y,z,p),
      cylinder:(r1,r2,h,c,x,y,z,p=scene)=>add(new THREE.CylinderGeometry(r1,r2,h,12),x,y,z,p),
      sphere:(r,c,x,y,z,p=scene)=>add(new THREE.SphereGeometry(r,12,8),x,y,z,p),
    });
    scene.updateMatrixWorld(true);
    const bounds=new THREE.Box3().setFromObject(scene.getObjectByName('strategy-gallery-floor')),size=bounds.getSize(new THREE.Vector3());
    const ray=z=>new THREE.Raycaster(new THREE.Vector3(21.3,1.4,z),new THREE.Vector3(1,0,0),0,6.5).intersectObjects(scene.children,true);
    const result={ratio:size.z/size.x,minZ:bounds.min.z,maxZ:bounds.max.z,gap:bounds.min.x-22,gardenDoorOpen:ray(5.5).length===0,barSideClosed:ray(-16).length>0};
    scene.traverse(o=>o.geometry?.dispose());Object.values(textures).forEach(t=>t.dispose());material.dispose();return result;
  });
  expect(layout.ratio).toBeGreaterThan(3);expect(layout.minZ).toBeLessThanOrEqual(-21.5);expect(layout.maxZ).toBeGreaterThanOrEqual(7.1);
  expect(layout.gap).toBeGreaterThan(4);expect(layout.gardenDoorOpen).toBe(true);expect(layout.barSideClosed).toBe(true);
});

test('gallery displays saved plans beyond five slots, filters completion, opens plans and supports mobile visits', async ({ page }) => {
  test.setTimeout(60000);
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(() => {
    if(top!==self)return;
    if(localStorage.getItem('gallery-fixture'))return;
    const names=['Discover','Define','Create','Activate','Measure'];
    const projects=Array.from({length:7},(_,i)=>({id:`gallery-${i}`,client:`Khách hàng ${i}`,objective:`Kế hoạch truyền thông ${i}`,audience:'Người trẻ 25–34 tuổi',budget:100000000,timing:'8 tuần',phases:names.map((name,index)=>({name,detail:'Khung kế hoạch tham khảo',kpi:'Cần kiểm chứng',weight:20,budget:20000000,ownerId:['insight','strategy','creative','media','account'][index]}))}));
    localStorage.setItem('atelier-workspace-v1',JSON.stringify({projects,checkedTasks:names.map((_,i)=>`gallery-0:${i}`)}));localStorage.setItem('gallery-fixture','true');
  });
  await page.goto('/');
  await page.getByRole('button',{name:'Xem phòng triển lãm',exact:true}).click();
  await expect(page.locator('#gallery-status')).toContainText('7 plan · 1 đã hoàn thành');
  await expect(page.getByLabel('Plan trưng bày').locator('option')).toHaveCount(7);
  await page.waitForTimeout(500);await page.locator('.office-panel').screenshot({path:'/tmp/atelier-gallery.png'});
  await page.getByRole('button',{name:'Xem cầu từ vườn',exact:true}).click();await page.waitForTimeout(500);
  await page.locator('.office-panel').screenshot({path:'/tmp/atelier-gallery-bridge.png'});
  await page.getByLabel('Plan trưng bày').selectOption('gallery-6');
  await expect(page.locator('#zone-detail')).toContainText('Khách hàng 6');await page.waitForTimeout(500);
  await page.locator('.office-panel').screenshot({path:'/tmp/atelier-gallery-plan.png'});
  await page.getByRole('button',{name:'Mở plan trưng bày',exact:true}).click();
  await expect(page.getByRole('dialog').getByRole('heading',{name:'Khách hàng 6',exact:true})).toBeVisible();
  await page.getByRole('checkbox',{name:'Hoàn thành Discover',exact:true}).check();await page.keyboard.press('Escape');
  await expect(page.getByLabel('Plan trưng bày')).toHaveValue('gallery-6');
  await expect(page.getByLabel('Plan trưng bày').locator('option:checked')).toContainText('1/5 giai đoạn');
  await page.getByLabel('Chỉ plan hoàn thành').check();await expect(page.getByLabel('Plan trưng bày').locator('option')).toHaveCount(1);
  await page.getByRole('button',{name:'Mở plan trưng bày',exact:true}).click();await page.getByRole('checkbox',{name:'Hoàn thành Discover',exact:true}).uncheck();await page.keyboard.press('Escape');
  await expect(page.getByLabel('Plan trưng bày')).toBeDisabled();await expect(page.locator('#gallery-status')).toContainText('Chưa có plan hoàn thành');
  await page.reload();await expect(page.locator('#gallery-status')).toContainText('7 plan · 0 đã hoàn thành');
  await page.getByRole('button',{name:'Chuyển động: tắt',exact:true}).click();
  await page.getByRole('button',{name:'Qua cầu xem plan',exact:true}).click();
  await expect(page.locator('.agent-label[data-activity="walking"]').first()).toBeAttached();
  await page.setViewportSize({width:390,height:844});await expect(page.getByLabel('Plan trưng bày')).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);expect(errors).toEqual([]);
});

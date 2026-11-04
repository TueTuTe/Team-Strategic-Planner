import test from 'node:test';
import assert from 'node:assert/strict';
import { roamingWaterRoute, dividerWaterRoute, isWaterPoint, koiPopulation } from '../src/water-routes.js';
import { receptionBridgeHeight } from '../src/reception-layout.js';
import { bridgeHeight } from '../src/izakaya-layout.js';
import { galleryBridgeHeight } from '../src/gallery-layout.js';

test('swimming paths stay in the water, including the whole shark footprint', () => {
  assert.equal(Object.values(koiPopulation).reduce((a,b)=>a+b,0),48);
  for(const route of [roamingWaterRoute,dividerWaterRoute])for(let i=0;i<5000;i++){
    const p=route.sample(route.length*i/5000);assert.ok(isWaterPoint(p.x,p.z));
    if(route===roamingWaterRoute)for(const [x,z] of [[.64,0],[-.83,0],[-.17,.46],[-.17,-.46]]){
      const c=Math.cos(p.heading),s=Math.sin(p.heading);assert.ok(isWaterPoint(p.x+c*x+s*z,p.z-s*x+c*z));
    }
  }
  const start=roamingWaterRoute.sample(0),end=roamingWaterRoute.sample(roamingWaterRoute.length-1e-5);
  assert.ok(Math.hypot(start.x-end.x,start.z-end.z)<.001);
});
test('shark route passes beneath all three bridges with vertical clearance', () => {
  const crossed=new Set();
  for(let i=0;i<8000;i++){
    const p=roamingWaterRoute.sample(roamingWaterRoute.length*i/8000);
    if(Math.abs(p.x-.3)<.8&&p.z>-12&&p.z<-6.8){crossed.add('reception');assert.ok(receptionBridgeHeight((-6.8-p.z)/5.2)-.1>.26);}
    if(Math.abs(p.x-13.6)<.8&&p.z>-12&&p.z<-6.8){crossed.add('izakaya');assert.ok(bridgeHeight((-6.8-p.z)/5.2)-.1>.26);}
    if(Math.abs(p.z-5.5)<.8&&p.x>21.5&&p.x<26.8){crossed.add('gallery');assert.ok(galleryBridgeHeight((p.x-21.5)/5.3)-.1>.26);}
  }
  assert.deepEqual([...crossed].sort(),['gallery','izakaya','reception']);
});

import * as THREE from 'three';
import { koiPopulation, roamingWaterRoute, dividerWaterRoute } from './water-routes.js';

export function buildAquaticLife({ scene }) {
  const group=new THREE.Group();group.name='campus-aquatic-life';scene.add(group);
  const count=Object.values(koiPopulation).reduce((a,b)=>a+b,0),dummy=new THREE.Object3D();
  const sphere=new THREE.SphereGeometry(1,12,8),eyeGeometry=new THREE.SphereGeometry(1,6,4);
  const tailGeometry=new THREE.BufferGeometry();tailGeometry.setAttribute('position',new THREE.Float32BufferAttribute([-.14,0,0,.045,.005,-.12,.045,.005,.12],3));tailGeometry.computeVertexNormals();
  const white=new THREE.MeshStandardMaterial({color:'#ffffff',roughness:.7,side:THREE.DoubleSide});
  function instances(name,geometry,material,total){const mesh=new THREE.InstancedMesh(geometry,material,total);mesh.name=name;mesh.frustumCulled=false;mesh.receiveShadow=true;mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);group.add(mesh);return mesh;}
  const bodies=instances('campus-koi-bodies',sphere,white,count),tails=instances('campus-koi-tails',tailGeometry,white,count);
  const patches=instances('campus-koi-markings',sphere,white,count*3),eyes=instances('campus-koi-eyes',eyeGeometry,new THREE.MeshBasicMaterial({color:'#293c32'}),count*2);
  const colors=['#f0e7d1','#e5d6b4','#dca34b','#e7e2d3'];
  const fish=Array.from({length:count},(_,i)=>({index:i,kind:i<koiPopulation.pond?'pond':i<count-koiPopulation.divider?'river':'divider',phase:i*2.39996,scale:.8+(i%5)*.07,speed:.33+(i%7)*.035}));
  fish.forEach(({index:i})=> {
    bodies.setColorAt(i,new THREE.Color(colors[i%4]));tails.setColorAt(i,new THREE.Color(i%3?'#d9c9ac':'#db9445'));
    for(let j=0;j<3;j++)patches.setColorAt(i*3+j,new THREE.Color((i+j)%4?'#cb703c':'#485043'));
  });
  const shark=new THREE.Group();shark.name='garden-shark';group.add(shark);
  const sharkMaterial=new THREE.MeshStandardMaterial({color:'#718798',roughness:.62,side:THREE.DoubleSide});
  function shape(geometry,material,x,y,z,parent=shark){const mesh=new THREE.Mesh(geometry,material);mesh.position.set(x,y,z);mesh.receiveShadow=true;parent.add(mesh);return mesh;}
  const body=shape(sphere,sharkMaterial,0,0,0);body.scale.set(.64,.08,.19);
  const belly=shape(sphere,new THREE.MeshStandardMaterial({color:'#cdd9cf',roughness:.7}),.04,-.027,0);belly.scale.set(.54,.055,.16);
  function fin(vertices,parent=shark){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.computeVertexNormals();return shape(g,sharkMaterial,0,0,0,parent);}
  fin([-.25,.035,0,-.08,.1,0,.14,.035,0]).name='shark-dorsal-fin';
  for(const side of [-1,1])fin([.2,-.015,side*.1,-.17,-.025,side*.46,-.3,-.015,side*.1]);
  const tail=new THREE.Group();tail.name='shark-swimming-tail';tail.position.x=-.65;shark.add(tail);
  fin([0,0,0,-.18,.1,0,-.11,0,0,0,0,0,-.11,0,0,-.18,-.08,0],tail);
  for(const side of [-1,1]){
    const eye=shape(eyeGeometry,new THREE.MeshBasicMaterial({color:'#23373b'}),.43,.033,side*.132);eye.scale.set(.026,.025,.018);
    const glint=shape(eyeGeometry,new THREE.MeshBasicMaterial({color:'#eef4de'}),.44,.041,side*.145);glint.scale.setScalar(.008);
    for(let i=0;i<3;i++){const slit=shape(new THREE.BoxGeometry(.011,.042,.012),new THREE.MeshBasicMaterial({color:'#3c5660'}),.22-i*.055,0,side*.174);slit.rotation.z=-.2;}
  }
  let elapsed=0,lastTime=null;
  function place(mesh,index,p,heading,sx,sy,sz,ox=0,oy=0,oz=0){
    dummy.position.set(p.x+Math.cos(heading)*ox+Math.sin(heading)*oz,.17+oy,p.z-Math.sin(heading)*ox+Math.cos(heading)*oz);
    dummy.rotation.set(0,heading,0);dummy.scale.set(sx,sy,sz);dummy.updateMatrix();mesh.setMatrixAt(index,dummy.matrix);
  }
  function pose(){
    fish.forEach(f=>{
      let p,scale=f.scale;
      if(f.kind==='pond'){
        const radius=1.05+(f.index%6)*.29,angle=f.phase+elapsed*f.speed/radius;
        p={x:17.05+Math.cos(angle)*radius,z:-1.1+Math.sin(angle)*radius*.85,heading:Math.atan2(-Math.cos(angle)*.85,-Math.sin(angle))};
      }else{
        const route=f.kind==='divider'?dividerWaterRoute:roamingWaterRoute;
        const index=f.kind==='divider'?f.index-count+koiPopulation.divider:f.index-koiPopulation.pond;
        p=route.sample(route.length*index/(f.kind==='divider'?koiPopulation.divider:koiPopulation.river)+elapsed*f.speed);
        if(f.kind==='divider')scale*=.65;
      }
      place(bodies,f.index,p,p.heading,.32*scale,.043*scale,.11*scale);
      const wag=Math.sin(elapsed*5+f.phase)*.27,tailHeading=p.heading+wag;
      const tailPoint={x:p.x-Math.cos(p.heading)*.36*scale,z:p.z+Math.sin(p.heading)*.36*scale};
      place(tails,f.index,tailPoint,tailHeading,scale,scale,scale);
      for(let j=0;j<3;j++)place(patches,f.index*3+j,p,p.heading,.09*scale,.012*scale,.074*scale,(-.17+j*.16)*scale,.038*scale,Math.sin(f.index+j)*.012);
      for(let side=0;side<2;side++)place(eyes,f.index*2+side,p,p.heading,.012*scale,.012*scale,.012*scale,.235*scale,.018*scale,(side?1:-1)*.055*scale);
    });
    for(const mesh of [bodies,tails,patches,eyes])mesh.instanceMatrix.needsUpdate=true;
    const position=roamingWaterRoute.sample(elapsed*.95);shark.position.set(position.x,.16,position.z);shark.rotation.y=position.heading;tail.rotation.y=Math.sin(elapsed*4.8)*.25;
  }
  pose();
  return {shark,count,animate(time){if(lastTime!==null)elapsed+=Math.max(0,Math.min(.12,time-lastTime));lastTime=time;pose();}};
}

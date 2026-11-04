export const koiPopulation = { pond: 24, river: 20, divider: 4 };
export const waterLevel = .27;
const bezier = (a,b,c,d,t) => a.map((v,i)=>(1-t)**3*v+3*(1-t)**2*t*b[i]+3*(1-t)*t*t*c[i]+t**3*d[i]);
const outletLeft = [[18.6,-2.9],[19.9,-4.6],[20.4,-5.9],[19.25,-8.5]];
const outletRight = [[20.1,-2.5],[21.7,-4.1],[22.1,-5.8],[21.25,-8.5]];
const outletPolygon = [...Array.from({length:33},(_,i)=>bezier(...outletLeft,i/32)),...Array.from({length:33},(_,i)=>bezier(...outletRight,1-i/32))];
const insidePolygon = (x,z,points) => {
  let inside=false;
  for(let i=0,j=points.length-1;i<points.length;j=i++) {
    const [ax,az]=points[i],[bx,bz]=points[j];
    if((az>z)!==(bz>z)&&x<(bx-ax)*(z-az)/(bz-az)+ax)inside=!inside;
  }
  return inside;
};
export function isWaterPoint(x,z) {
  return ((x-17.05)/3.65)**2+((z+1.1)/3.7)**2<=1 ||
    (x>=-9.2&&x<=22&&z>=-11.6&&z<=-7.2) ||
    (x>=22&&x<=26.2&&z>=-21.6&&z<=7.2) ||
    (x>=8.275&&x<=9.225&&z>=-21.6&&z<=-11.6) || insidePolygon(x,z,outletPolygon);
}
const outletCenter = Array.from({length:13},(_,i)=> {
  const a=bezier(...outletLeft,i/12),b=bezier(...outletRight,i/12);return [(a[0]+b[0])/2,(a[1]+b[1])/2];
});
const roamingPoints = [
  [16.8,-9],[13.6,-9],[.3,-9],[-7.6,-9],[-8,-9.15],[-8,-9.65],[-7.6,-9.8],
  [.3,-9.8],[13.6,-9.8],[20,-9.8],[23.7,-9.8],[23.7,-19.2],[23.85,-19.6],[24.35,-19.6],[24.5,-19.2],
  [24.5,5.8],[24.35,6.2],[23.85,6.2],[23.7,5.8],[23.7,-8.8],[21.2,-8.8],[20.25,-8.5],
  ...outletCenter.slice(0,-1).reverse(),[18.2,-1.4],[16.1,.1],[15,-1.5],[16.8,-2.6],[18.5,-2.2],
  ...outletCenter,[19.2,-9],
];
const dividerPoints = [[8.62,-10.7],[8.62,-20.4],[8.68,-20.6],[8.82,-20.6],[8.88,-20.4],[8.88,-10.7],[8.8,-10.5],[8.7,-10.5]];

// Rounded polylines stay inside the water corridor; arc length keeps speed even.
export function makeSwimRoute(input, rounds=2) {
  let points=input.map(p=>[...p]);
  for(let round=0;round<rounds;round++) {
    const next=[];
    for(let i=0;i<points.length;i++) {
      const a=points[i],b=points[(i+1)%points.length];
      next.push(a.map((v,j)=>v*.75+b[j]*.25),a.map((v,j)=>v*.25+b[j]*.75));
    }
    points=next;
  }
  const lengths=[0];
  for(let i=0;i<points.length;i++) { const a=points[i],b=points[(i+1)%points.length];lengths.push(lengths.at(-1)+Math.hypot(b[0]-a[0],b[1]-a[1])); }
  const length=lengths.at(-1);
  return {length,points,sample(distance) {
    const d=((distance%length)+length)%length;let lo=0,hi=points.length-1;
    while(lo<hi){const mid=(lo+hi+1)>>1;if(lengths[mid]<=d)lo=mid;else hi=mid-1;}
    const a=points[lo],b=points[(lo+1)%points.length],span=lengths[lo+1]-lengths[lo],t=span ? (d-lengths[lo])/span : 0;
    return {x:a[0]+(b[0]-a[0])*t,z:a[1]+(b[1]-a[1])*t,heading:Math.atan2(-(b[1]-a[1]),b[0]-a[0])};
  }};
}
export const roamingWaterRoute = makeSwimRoute(roamingPoints);
export const dividerWaterRoute = makeSwimRoute(dividerPoints);

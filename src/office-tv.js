import * as THREE from 'three';

export const officeTV = { position: [-8.64, 2.3, 1.4], rotation: Math.PI / 2, width: 4.8, height: 2.7 };

// Project a native HTML player onto the same four corners as the WebGL TV.
// Keeping the DOM in screen coordinates preserves pointer input inside iframes.
function screenMatrix(points, width, height) {
  const [a, b, c, d] = points;
  const dx1 = b.x - c.x, dx2 = d.x - c.x, dx3 = a.x - b.x + c.x - d.x;
  const dy1 = b.y - c.y, dy2 = d.y - c.y, dy3 = a.y - b.y + c.y - d.y;
  const denominator = dx1 * dy2 - dx2 * dy1;
  if (Math.abs(denominator) < .0001) return null;
  const g = (dx3 * dy2 - dx2 * dy3) / denominator;
  const h = (dx1 * dy3 - dx3 * dy1) / denominator;
  if (Math.abs(g) < .00001 && Math.abs(h) < .00001) return `matrix(${(b.x - a.x) / width},${(b.y - a.y) / width},${(d.x - a.x) / height},${(d.y - a.y) / height},${a.x},${a.y})`;
  return `matrix3d(${(b.x - a.x + g * b.x) / width},${(b.y - a.y + g * b.y) / width},0,${g / width},${(d.x - a.x + h * d.x) / height},${(d.y - a.y + h * d.y) / height},0,${h / height},0,0,1,0,${a.x},${a.y},0,1)`;
}

export function mountTVScreen(container, scene, camera, element, onVisibility = () => {}) {
  const layer = document.createElement('div'); layer.className = 'tv-css-layer'; layer.append(element); container.prepend(layer);
  element.style.position = 'absolute'; element.style.left = '0'; element.style.top = '0'; element.style.transformOrigin = '0 0';
  const center = new THREE.Vector3(...officeTV.position); center.x += .112;
  const rotation = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), officeTV.rotation);
  const material = new THREE.MeshBasicMaterial({ color: '#000000', opacity: 0, blending: THREE.NoBlending, side: THREE.FrontSide });
  const mask = new THREE.Mesh(new THREE.PlaneGeometry(officeTV.width, officeTV.height), material);
  mask.position.copy(center); mask.quaternion.copy(rotation); scene.add(mask);
  const corners = [[-.5, .5], [.5, .5], [.5, -.5], [-.5, -.5]].map(([x, y]) => new THREE.Vector3(x * officeTV.width, y * officeTV.height, 0).applyQuaternion(rotation).add(center));
  let width = 1, height = 1, wasVisible;
  return {
    resize(w, h) { width = w; height = h; },
    render() {
      const point = center.clone().project(camera);
      const visible = camera.position.x - center.x > .1 && point.z > -1 && point.z < 1 && Math.abs(point.x) < 1.25 && Math.abs(point.y) < 1.25;
      element.style.visibility = visible ? 'visible' : 'hidden'; element.setAttribute('aria-hidden', String(!visible));
      if (visible) {
        const points = corners.map(corner => { const p = corner.clone().project(camera); return { x: (p.x + 1) * width / 2, y: (1 - p.y) * height / 2 }; });
        const matrix = screenMatrix(points, 960, 540); if (matrix) element.style.transform = matrix;
      }
      if (visible !== wasVisible) { wasVisible = visible; onVisibility(visible); }
    },
    dispose() { element.remove(); layer.remove(); mask.removeFromParent(); mask.geometry.dispose(); material.dispose(); },
  };
}

export const receptionBridge = { x: .3, startZ: -6.8, endZ: -12, width: 1.8 };
export const receptionSofa = { x: -4.1, z: -16.2, radius: 2.45, start: Math.PI * .2, end: Math.PI * 1.45 };
export function receptionBridgeHeight(t) { return .26 + Math.sin(t * Math.PI) * .56; }
const seatAngles = { receptionSeatA: Math.PI * .5, receptionSeatB: Math.PI * .8 };
export const receptionSeatHeadings = Object.fromEntries(Object.entries(seatAngles).map(([id, angle]) => [id, Math.PI / 2 - angle]));
export const receptionWalkNodes = {
  officeRearAisle: [.3, 0, -5.6], officeReceptionDoor: [.3, 0, -6.35],
  ...Object.fromEntries(['receptionBridgeSouth', 'receptionBridgeRise', 'receptionBridgeCrest', 'receptionBridgeFall', 'receptionBridgeNorth'].map((id, i) => {
    const t = i / 4;
    return [id, [receptionBridge.x, receptionBridgeHeight(t), receptionBridge.startZ + (receptionBridge.endZ - receptionBridge.startZ) * t]];
  })),
  receptionEntry: [.3, .23, -12.8], receptionAisle: [.3, .23, -16.2], receptionLoungeEntry: [-1.2, .23, -16.2],
  receptionInnerA: [-2.7, .23, -14.9], receptionInnerB: [-4.7, .23, -14.6],
  ...Object.fromEntries(Object.entries(seatAngles).map(([id, a]) => [id, [receptionSofa.x + Math.cos(a) * receptionSofa.radius, .23, receptionSofa.z + Math.sin(a) * receptionSofa.radius]])),
};

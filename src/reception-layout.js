export const receptionBridge = { x: .3, startZ: -6.8, endZ: -12, width: 1.8 };
export const receptionSofa = { x: 3.4, z: -17.3, radius: 2.45, start: Math.PI * 1.2, end: Math.PI * 2.45 };
export const receptionDesk = { x: -5.65, z: -14.6, width: 4.8, depth: 1.3, rotation: -Math.PI / 2 };
export const receptionGuestEntrance = { x: -9, z: -14.25, width: 2.4 };
// The back of the reception desk partition faces east, toward the waiting sofa.
export const receptionTV = { position: [receptionDesk.x + 1.4, 1.61, receptionDesk.z], rotation: Math.PI / 2, width: 3.5, height: 3.5 * 9 / 16 };
export function receptionDeskLocalPoint(x, z) {
  const dx = x - receptionDesk.x, dz = z - receptionDesk.z, a = receptionDesk.rotation;
  return [Math.cos(a) * dx - Math.sin(a) * dz, Math.sin(a) * dx + Math.cos(a) * dz];
}
export function receptionBridgeHeight(t) { return .26 + Math.sin(t * Math.PI) * .56; }
const seatAngles = { receptionSeatA: Math.PI * 1.5, receptionSeatB: Math.PI * 1.8 };
export const receptionSeatHeadings = Object.fromEntries(Object.entries(seatAngles).map(([id, angle]) => [id, Math.PI / 2 - angle]));
export const receptionWalkNodes = {
  officeRearAisle: [.3, 0, -5.6], officeReceptionDoor: [.3, 0, -6.35],
  ...Object.fromEntries(['receptionBridgeSouth', 'receptionBridgeRise', 'receptionBridgeCrest', 'receptionBridgeFall', 'receptionBridgeNorth'].map((id, i) => {
    const t = i / 4;
    return [id, [receptionBridge.x, receptionBridgeHeight(t), receptionBridge.startZ + (receptionBridge.endZ - receptionBridge.startZ) * t]];
  })),
  receptionEntry: [.3, .23, -12.8], receptionAisle: [-1.2, .23, -17.3], receptionLoungeEntry: [.5, .23, -17.3],
  receptionInnerA: [2, .23, -18.6], receptionInnerB: [4, .23, -18.9],
  guestOutside: [-12.8, .08, -14.25], guestApproach: [-10.2, .08, -14.25], guestThreshold: [-9.6, .15, -14.25],
  guestDoor: [-8.9, .23, -14.25], guestWelcome: [-7.15, .23, -14.25], guestPassage: [-7.15, .23, -17.8], guestInner: [-3.7, .23, -17.8],
  ...Object.fromEntries(Object.entries(seatAngles).map(([id, a]) => [id, [receptionSofa.x + Math.cos(a) * receptionSofa.radius, .23, receptionSofa.z + Math.sin(a) * receptionSofa.radius]])),
};

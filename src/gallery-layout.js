export const galleryBounds = { minX: 26.2, maxX: 35.4, minZ: -21.6, maxZ: 7.2 };
export const galleryBridge = { startX: 21.5, endX: 26.8, z: 5.5, width: 1.8 };
export const galleryPanelZ = [3, -2.2, -7.4, -12.6, -17.8];
export function galleryBridgeHeight(t) { return .26 + Math.sin(t * Math.PI) * .56; }
export const galleryWalkNodes = {
  gardenSouthPath: [13.3, .1, 6.6], gardenSouthCenter: [17.9, .1, 6.6], gardenEastPath: [20.6, .1, 6.6],
  ...Object.fromEntries(['galleryBridgeWest', 'galleryBridgeRise', 'galleryBridgeCrest', 'galleryBridgeFall', 'galleryBridgeEast'].map((id, i) => {
    const t = i / 4;
    return [id, [galleryBridge.startX + (galleryBridge.endX - galleryBridge.startX) * t, galleryBridgeHeight(t), galleryBridge.z]];
  })),
  galleryEntry: [27.7, .23, 5.5], galleryAisle: [28.1, .23, 3.5], galleryViewA: [28.1, .23, -2.2], galleryViewB: [28.1, .23, -7.4],
};

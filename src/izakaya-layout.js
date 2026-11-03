// Both the deck and walking graph use this profile, keeping feet on the bridge.
export const izakayaBridge = { x: 13.6, startZ: -6.8, endZ: -12, width: 1.7 };
export function bridgeHeight(t) { return .26 + Math.sin(t * Math.PI) * .64; }
export const izakayaWalkNodes = {
  gardenRear: [10.7, .1, -6.25], gardenBridgePath: [13.6, .1, -6.25],
  ...Object.fromEntries(['bridgeSouth', 'bridgeRise', 'bridgeCrest', 'bridgeFall', 'bridgeNorth'].map((id, i) => {
    const t = i / 4;
    return [id, [izakayaBridge.x, bridgeHeight(t), izakayaBridge.startZ + (izakayaBridge.endZ - izakayaBridge.startZ) * t]];
  })),
  barEntry: [13.6, .23, -13.2], barAisleA: [13.6, .23, -15.8], barAisleB: [15.5, .23, -15.8],
  barSeatA: [13.6, .23, -17.2], barSeatB: [15.5, .23, -17.2],
};

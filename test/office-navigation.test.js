import test from 'node:test';
import assert from 'node:assert/strict';
import { OfficeNavigation, walkRoute, walkNodes } from '../src/office-navigation.js';
import { receptionDesk, receptionSofa, receptionDeskLocalPoint } from '../src/reception-layout.js';

const ids = ['strategy', 'insight', 'creative', 'media', 'account'];
const seats = Object.fromEntries(ids.map(id => [id, { x: walkNodes[id][0], z: walkNodes[id][2], rotation: id === 'strategy' ? Math.PI : 0 }]));
const step = (navigation, seconds) => { for (let i = 0; i < seconds * 10; i++) navigation.step(.1); };
test('routes use the open Strategy entrance and tatami steps', () => {
  const path = walkRoute('strategy', 'teaB');
  assert.ok(path.includes('strategyAisle')); assert.ok(path.includes('strategyDoor')); assert.ok(path.includes('teaStep'));
  for (const id of ids) assert.equal(walkRoute(id, 'meetingB').at(-1), 'meetingB');
});
test('idle staff leave seats, meet and speak; new work recalls them', () => {
  const conversation = [], nav = new OfficeNavigation({ seats, onAmbient: (id, text) => conversation.push({ id, text }) });
  step(nav, 5); assert.notDeepEqual(nav.actors.get('creative').position, walkNodes.creative);
  step(nav, 10); assert.equal(conversation.length, 2); assert.notEqual(conversation[0].id, conversation[1].id);
  for (const id of ids) nav.setBusy(id, true);
  step(nav, 20); for (const id of ids) assert.equal(nav.atDesk(id), true);
  const count = conversation.length; step(nav, 30); assert.equal(conversation.length, count);
});
test('called staff walk to the caller and a frozen scene releases waiting desk callbacks', () => {
  const arrived = [], nav = new OfficeNavigation({ seats, onCallArrival: id => arrived.push(id) });
  nav.quietFor(100); nav.call('creative'); step(nav, 1); assert.equal(arrived.length, 0);
  step(nav, 8); assert.deepEqual(arrived, ['creative']);
  let resumed = false; nav.home('creative', () => { resumed = true; });
  assert.equal(resumed, false); nav.freezeAtDesks(); assert.equal(resumed, true); assert.equal(nav.atDesk('creative'), true);
});
test('garden routes go around the tea lounge, rest on the bench and recall staff for work', () => {
  const path = walkRoute('strategy', 'gardenBenchA');
  assert.ok(path.includes('gardenPorch')); assert.ok(path.includes('gardenGate')); assert.ok(!path.includes('teaEntry'));
  const conversation = [], nav = new OfficeNavigation({ seats, onAmbient: (id, text) => conversation.push({ id, text }) });
  nav.setBusy('strategy', true);
  const ids = nav.requestGardenBreak(); assert.equal(ids.length, 2); assert.ok(!ids.includes('strategy'));
  for (let i = 0; i < 500 && nav.actors.get(ids[0]).pose !== 'bench'; i++) nav.step(.1);
  step(nav, 2);
  for (const id of ids) { assert.equal(nav.actors.get(id).pose, 'bench'); assert.equal(nav.actors.get(id).heading, -Math.PI / 2); }
  assert.ok(conversation.some(message => message.text.includes('hoa anh đào')));
  let returned = false; nav.setBusy(ids[0], true); nav.home(ids[0], () => { returned = true; });
  assert.equal(returned, false); step(nav, 35); assert.equal(returned, true); assert.equal(nav.atDesk(ids[0]), true);
});
test('busy staff stay at their desks and a single free staff member can rest then return', () => {
  const nav = new OfficeNavigation({ seats });
  for (const id of ids) nav.setBusy(id, true);
  assert.deepEqual(nav.requestGardenBreak(), []);
  nav.setBusy('creative', false); assert.deepEqual(nav.requestGardenBreak(), ['creative']);
  nav.quietFor(150); step(nav, 70); assert.equal(nav.atDesk('creative'), true);
});
test('Izakaya is only reached across the raised bridge and busy staff do not join after hours', () => {
  const path = walkRoute('creative', 'barSeatA');
  for (const point of ['gardenRear', 'bridgeSouth', 'bridgeRise', 'bridgeCrest', 'bridgeFall', 'bridgeNorth', 'barEntry']) assert.ok(path.includes(point));
  assert.ok(walkNodes.bridgeCrest[1] > walkNodes.bridgeSouth[1] + .6);
  const messages = [], nav = new OfficeNavigation({ seats, onAmbient: (id, text) => messages.push(text) });
  nav.setBusy('strategy', true);
  const resting = nav.requestBarBreak(); assert.equal(resting.length, 2); assert.ok(!resting.includes('strategy')); assert.equal(nav.afterHours, true);
  for (let i = 0; i < 900 && nav.actors.get(resting[1]).pose !== 'barstool'; i++) nav.step(.1);
  step(nav, 4);
  for (const id of resting) { assert.equal(nav.actors.get(id).pose, 'barstool'); assert.equal(nav.actors.get(id).heading, 0); }
  assert.ok(messages.some(text => text.includes('Izakaya'))); assert.equal(nav.atDesk('strategy'), true);
  let started = false; nav.setBusy(resting[0], true); nav.home(resting[0], () => { started = true; });
  assert.equal(started, false); nav.endAfterHours(); assert.equal(nav.afterHours, false);
  step(nav, 50); assert.equal(started, true); assert.equal(nav.atDesk(resting[0]), true);
});
test('a single free employee rests at the bar, and cancelling mid-bridge returns them continuously', () => {
  const nav = new OfficeNavigation({ seats });
  for (const id of ids) nav.setBusy(id, true);
  assert.deepEqual(nav.requestBarBreak(), []); assert.equal(nav.afterHours, false);
  nav.setBusy('creative', false); assert.deepEqual(nav.requestBarBreak(), ['creative']);
  for (let i = 0; i < 900 && nav.actors.get('creative').position[2] > -9; i++) nav.step(.1);
  const before = [...nav.actors.get('creative').position]; nav.endAfterHours(); nav.step(.1);
  assert.ok(Math.hypot(...before.map((v, i) => v - nav.actors.get('creative').position[i])) <= .181);
  nav.quietFor(150); step(nav, 60); assert.equal(nav.atDesk('creative'), true);
});
test('reception uses its own bridge and the open office doorway, seats staff and returns for new work', () => {
  const path = walkRoute('account', 'receptionSeatA');
  for (const point of ['officeRearAisle', 'officeReceptionDoor', 'receptionBridgeSouth', 'receptionBridgeCrest', 'receptionBridgeNorth', 'receptionLoungeEntry']) assert.ok(path.includes(point));
  assert.ok(!path.includes('gardenGate')); assert.ok(walkNodes.receptionBridgeCrest[1] > walkNodes.receptionBridgeSouth[1]);
  const spoken = [], nav = new OfficeNavigation({ seats, onAmbient: (id, text) => spoken.push(text) });
  nav.setBusy('strategy', true); const visitors = nav.requestReception();
  assert.equal(visitors[0], 'account'); assert.ok(!visitors.includes('strategy'));
  for (let i = 0; i < 700 && !visitors.every(id => nav.actors.get(id).pose === 'sofa'); i++) nav.step(.1);
  for (const id of visitors) assert.equal(nav.actors.get(id).pose, 'sofa');
  step(nav, 4); assert.ok(spoken.some(text => text.includes('sảnh tiếp đón')));
  let ready = false; nav.setBusy('account', true); nav.home('account', () => { ready = true; });
  assert.equal(ready, false); nav.quietFor(100); step(nav, 45); assert.equal(ready, true); assert.equal(nav.atDesk('account'), true);
});
test('front desk leaves the entry aisle open and the inner sofa connects to the bar through the office and garden', () => {
  assert.ok(receptionSofa.x > receptionDesk.x + 6);
  // A person has a 0.3-unit shoulder radius; no route segment may cut through the desk.
  for (const start of ['receptionEntry', 'guestOutside']) for (const end of ['receptionSeatA', 'receptionSeatB']) {
    const route = walkRoute(start, end);
    if (start === 'guestOutside') { assert.ok(route.includes('guestDoor')); assert.ok(!route.includes('officeReceptionDoor')); assert.ok(!route.includes('receptionBridgeNorth')); }
    for (let i = 1; i < route.length; i++) for (let step = 0; step <= 20; step++) {
      const t = step / 20, a = walkNodes[route[i - 1]], b = walkNodes[route[i]];
      const [x, z] = receptionDeskLocalPoint(a[0] + (b[0] - a[0]) * t, a[2] + (b[2] - a[2]) * t);
      assert.ok(!(Math.abs(x) < receptionDesk.width / 2 + .3 && Math.abs(z) < receptionDesk.depth / 2 + .3));
    }
  }
  const barRoute = walkRoute('receptionSeatA', 'barSeatA');
  for (const point of ['officeReceptionDoor', 'gardenGate', 'bridgeCrest']) assert.ok(barRoute.includes(point));
});

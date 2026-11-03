import test from 'node:test';
import assert from 'node:assert/strict';
import { OfficeNavigation, walkRoute, walkNodes } from '../src/office-navigation.js';

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

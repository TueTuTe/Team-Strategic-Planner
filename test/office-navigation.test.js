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

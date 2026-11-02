import test from 'node:test';
import assert from 'node:assert/strict';
import { OfficeLife } from '../src/office-life.js';
import { team } from '../src/planner.js';

function setup() {
  let time = 1000; const records = new Map(), events = [];
  const storage = { getItem: key => records.get(key) || null, setItem: (key, value) => records.set(key, value) };
  const life = new OfficeLife({ members: team, storage, now: () => time, onEvent: event => events.push(event) });
  return { life, storage, events, advance: ms => { time += ms; life.tick(); }, now: () => time };
}
test('assignment validates member and title without losing existing work', () => {
  const { life } = setup();
  assert.throws(() => life.assign('unknown', 'Brief'));
  assert.throws(() => life.assign('strategy', '  '));
  assert.throws(() => life.assign('strategy', 'x'.repeat(181)));
  const task = life.assign('strategy', '  Rà   brief  ');
  assert.equal(task.title, 'Rà brief'); assert.equal(task.status, 'todo'); assert.equal(life.tasks.length, 1);
});
test('demo work completes only after its duration and produces an explicitly simulated draft', () => {
  const { life, advance, events } = setup();
  const task = life.assign('insight', 'Tìm giả thuyết insight'); life.run(task.id);
  advance(5499); assert.equal(task.status, 'working'); assert.equal(task.result, undefined);
  advance(1); assert.equal(task.status, 'done'); assert.equal(task.simulated, true);
  assert.equal(task.result.length, 3); assert.match(task.result[2], /kiểm chứng/);
  const count = events.length; advance(10000); assert.equal(events.length, count);
  assert.match(events.at(-1).text, /bản nháp mô phỏng/);
});
test('cancellation prevents delayed completion, with only one active demo per member', () => {
  const { life, advance } = setup();
  const first = life.assign('creative', 'Hướng A'), next = life.assign('creative', 'Hướng B');
  life.run(first.id); assert.throws(() => life.run(next.id)); assert.throws(() => life.remove(first.id));
  life.cancel(first.id); life.run(next.id); advance(6000);
  assert.equal(first.status, 'cancelled'); assert.equal(first.result, undefined); assert.equal(next.status, 'done');
});
test('restores running work and keeps manual completion distinct from generated drafts', () => {
  const { life, storage, advance, now } = setup();
  const task = life.assign('media', 'Channel mix'); life.run(task.id);
  advance(3000);
  const restored = new OfficeLife({ members: team, storage, now });
  assert.equal(restored.get(task.id).status, 'working'); advance(3000); restored.tick();
  assert.equal(restored.get(task.id).status, 'done');
  const manual = restored.assign('account', 'Chốt lịch'); restored.finish(manual.id);
  assert.equal(manual.simulated, false); assert.equal(manual.result, undefined);
});
test('handles corrupt storage and keeps playful replies separate from task progress', () => {
  const life = new OfficeLife({ members: team, storage: { getItem: () => 'broken', setItem: () => {} } });
  assert.equal(life.tasks.length, 0);
  const task = life.assign('strategy', 'Rà mục tiêu'); life.talk('strategy', 'scold');
  assert.equal(task.status, 'todo'); assert.match(life.log[0].text, /Bớt ngắm cá/);
  assert.throws(() => life.talk('strategy', 'unknown'));
});

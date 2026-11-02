import test from 'node:test';
import assert from 'node:assert/strict';
import { parseOfficeMessage } from '../src/office-chat.js';
import { OfficeLife } from '../src/office-life.js';
import { team } from '../src/planner.js';

test('chat resolves Vietnamese names and clarifies ambiguous short names', () => {
  assert.deepEqual(parseOfficeMessage(team, 'auto', 'Vũ ơi, lại đây').targets, ['strategy']);
  assert.deepEqual(parseOfficeMessage(team, 'auto', 'Lieu Ha Lam tien do sao roi?').targets, ['insight']);
  assert.ok(parseOfficeMessage(team, 'auto', 'Ân ơi').clarification);
  assert.deepEqual(parseOfficeMessage(team, 'auto', 'Kim Chủ Ân ơi').targets, ['creative']);
  assert.equal(parseOfficeMessage(team, 'auto', 'Tiến độ cả đội').targets.length, 5);
  assert.deepEqual(parseOfficeMessage(team, 'all', 'Vũ ơi').targets, ['strategy']);
  assert.equal(parseOfficeMessage(team, 'auto', 'Vũ').intent, 'call');
  assert.equal(parseOfficeMessage(team, 'auto', 'Chào Vũ').intent, 'greet');
  assert.throws(() => parseOfficeMessage(team, 'strategy', ' '));
});
test('chat progress reflects received, returning, running, completed and cancelled work', () => {
  let now = 1000; const life = new OfficeLife({ members: team, now: () => now });
  assert.match(life.progress('strategy'), /chưa có task/);
  life.message('auto', 'Giao cho Vũ: Rà lại brief Mộc');
  const task = life.tasks[0]; assert.equal(task.memberId, 'strategy'); assert.equal(task.title, 'Rà lại brief Mộc');
  assert.match(life.progress('strategy'), /chưa bắt đầu/);
  life.run(task.id, { waitForDesk: true }); now += 10000; life.tick();
  assert.equal(task.status, 'returning'); assert.match(life.progress('strategy'), /chưa bắt đầu xử lý/);
  life.begin(task.id); now += 2500;
  assert.match(life.progress('strategy'), /45%/);
  const actions = life.message('strategy', 'Vũ ơi ra đây'); assert.equal(actions.length, 0);
  life.message('strategy', 'Dừng việc'); now += 10000; life.tick(); assert.equal(task.status, 'cancelled');
  assert.match(life.progress('strategy'), /chưa có task/);
  const next = life.assign('strategy', 'Định vị'); life.run(next.id); now += 6000; life.tick();
  life.message('strategy', 'Tiến độ đến đâu rồi?'); assert.match(life.messages.at(-1).text, /bản nháp mô phỏng/);
});
test('free staff can be called; chat assigns and starts work without pretending to be AI', () => {
  const life = new OfficeLife({ members: team });
  assert.equal(life.message('creative', 'Lại đây')[0].type, 'call');
  life.message('creative', 'Giao việc: Phác hướng sáng tạo');
  const actions = life.message('creative', 'Bắt đầu làm thử');
  assert.equal(actions[0].type, 'start'); assert.equal(life.tasks[0].status, 'todo');
  life.message('creative', 'Kể một câu chuyện'); assert.match(life.messages.at(-1).text, /chưa nối AI/);
});

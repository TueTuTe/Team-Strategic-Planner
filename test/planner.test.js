import test from 'node:test';
import assert from 'node:assert/strict';
import { createPlan, validateBrief, team, renameMember, getPhaseOwner } from '../src/planner.js';

const brief = { client: ' Mộc ', objective: 'Tăng nhận biết', audience: 'Người trẻ thành thị', budget: '500000000', timing: '8 tuần' };
test('requires a usable brief and rejects invalid budgets', () => {
  assert.ok(validateBrief({}));
  for (const budget of ['0', '-1', 'NaN', 'Infinity']) assert.throws(() => createPlan({ ...brief, budget }));
  assert.equal(validateBrief(brief), '');
});
test('allocates the whole budget without inventing campaign metrics', () => {
  const result = createPlan(brief);
  assert.equal(result.client, 'Mộc');
  assert.equal(result.phases.length, 5);
  assert.equal(result.phases.reduce((sum, p) => sum + p.weight, 0), 100);
  assert.equal(result.phases.reduce((sum, p) => sum + p.budget, 0), Number(brief.budget));
  assert.match(result.phases[0].detail, /kiểm chứng/i);
  assert.match(result.phases[3].kpi, /cần benchmark/);
  assert.equal(new Set(result.phases.map(p => p.owner)).size, 5);
});
test('preserves missing budget and timing rather than inventing them', () => {
  const result = createPlan({ ...brief, budget: '', timing: '' });
  assert.equal(result.budget, null);
  assert.ok(result.phases.every(p => p.budget === null));
  assert.equal(result.timing, 'Chưa xác định');
});
test('renaming keeps role identity and updates existing, legacy and new assignments', () => {
  const original = { ...team.find(person => person.id === 'strategy') };
  const plan = createPlan(brief);
  try {
    const renamed = renameMember('strategy', '  Ngọc   Anh  ');
    assert.equal(renamed.name, 'Ngọc Anh');
    assert.equal(renamed.initials, 'NA');
    assert.equal(renamed.role, original.role);
    assert.equal(getPhaseOwner(plan.phases[1]), 'Ngọc Anh');
    assert.equal(getPhaseOwner({ name: 'Define', owner: 'Minh Anh' }), 'Ngọc Anh');
    assert.equal(createPlan(brief).phases[1].owner, 'Ngọc Anh');
    for (const invalid of ['   ', 'a'.repeat(41), null]) assert.throws(() => renameMember('strategy', invalid));
    assert.equal(renamed.name, 'Ngọc Anh');
    assert.throws(() => renameMember('unknown', 'An'));
  } finally { Object.assign(team.find(person => person.id === 'strategy'), original); }
});

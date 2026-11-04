import test from 'node:test';
import assert from 'node:assert/strict';
import { galleryEntries, galleryStatus } from '../src/gallery-plans.js';

const plan = id => ({ id, client: id, phases: Array.from({ length: 5 }, (_, i) => ({ name: `Phase ${i}` })) });
test('gallery uses actual saved completion state and distinguishes drafts and demo content', () => {
  const plans = [plan('completed'), plan('draft')], checked = [0,1,2,3,4].map(i => `completed:${i}`).concat('draft:0');
  const entries = galleryEntries(plans, checked, plan('demo'));
  assert.equal(entries[0].kind, 'completed'); assert.equal(entries[1].kind, 'draft');
  assert.equal(galleryStatus(entries[1]), 'Bản nháp · 1/5 giai đoạn');
  assert.deepEqual(galleryEntries(plans, checked, null, true).map(e=>e.plan.id), ['completed']);
  assert.equal(galleryEntries([], [], plan('demo'))[0].kind, 'demo');
  assert.deepEqual(galleryEntries([], [], plan('demo'), true), []);
  assert.equal(galleryEntries(plans, [], null)[0].kind, 'draft');
});
test('original artwork exhibits stay separate from generated plan phases', () => {
  const artwork = { id: 'lg-cover', title: 'LG · Digital Market Research 2025', imageSrc: 'blob:test-image' };
  const entries = galleryEntries([plan('draft')], [], null, false, [artwork]);
  assert.equal(entries[0].kind, 'artwork'); assert.equal(entries[0].imageSrc, artwork.imageSrc);
  assert.deepEqual(entries[0].plan.phases, []); assert.equal(galleryStatus(entries[0]), 'Ảnh kế hoạch');
  assert.deepEqual(galleryEntries([plan('draft')], [], null, true, [artwork]).map(e=>e.plan.id), ['lg-cover']);
});

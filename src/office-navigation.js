import { izakayaWalkNodes } from './izakaya-layout.js';
import { receptionWalkNodes, receptionSeatHeadings } from './reception-layout.js';

// Waypoints follow open aisles, steps and the arched garden bridge.
export const walkNodes = {
  north: [0, 0, -1.8], middle: [0, 0, 2], south: [0, 0, 5.5], meetingHall: [0, 0, -.1],
  strategyDoor: [-3.45, 0, -2], strategyAisle: [-3.45, 0, -5.95], strategy: [-5.65, 0, -5.95],
  rearWest: [-6.5, 0, -.8], rearEast: [-3.2, 0, -.8], insight: [-6.5, 0, .52], account: [-3.2, 0, .52],
  frontWest: [-6.5, 0, 5.1], frontEast: [-3.2, 0, 5.1], creative: [-6.5, 0, 3.88], media: [-3.2, 0, 3.88],
  socialA: [-.65, 0, 5.8], socialB: [.65, 0, 5.8],
  callStrategy: [-.65, 0, 4.7], callInsight: [-.65, 0, 6.6], callCreative: [-.65, 0, 5.8], callMedia: [.65, 0, 5.8], callAccount: [.65, 0, 6.6],
  meetingEntry: [2.4, 0, -.3], meetingA: [2.4, 0, -2], meetingB: [2.4, 0, -3.35],
  teaLow: [1.2, 0, 4.05], teaStep: [1.85, .2, 4.05], teaEntry: [2.45, .42, 4.05], teaA: [3, .42, 4.8], teaB: [3, .42, 5.85],
  gardenPorch: [0, 0, 7.7], gardenGate: [10.7, 0, 7.7], gardenEntry: [10.7, .1, 5.9], gardenLane: [10.7, .1, 3.8],
  gardenWestB: [10.7, .1, 2.7], gardenWestA: [10.7, .1, 1.3], gardenBenchA: [11.7, .1, 1.3], gardenBenchB: [11.7, .1, 2.7],
  ...izakayaWalkNodes,
  ...receptionWalkNodes,
};
const links = [
  ['north', 'meetingHall'], ['meetingHall', 'middle'], ['middle', 'south'], ['north', 'strategyDoor'], ['strategyDoor', 'strategyAisle'], ['strategyAisle', 'strategy'],
  ['north', 'rearEast'], ['rearEast', 'rearWest'], ['rearWest', 'insight'], ['rearEast', 'account'],
  ['south', 'frontEast'], ['frontEast', 'frontWest'], ['frontWest', 'creative'], ['frontEast', 'media'],
  ['south', 'socialA'], ['south', 'socialB'], ['south', 'callStrategy'], ['socialA', 'callCreative'], ['socialB', 'callMedia'], ['socialA', 'callInsight'], ['socialB', 'callAccount'],
  ['meetingHall', 'meetingEntry'], ['meetingEntry', 'meetingA'], ['meetingA', 'meetingB'],
  ['middle', 'teaLow'], ['teaLow', 'teaStep'], ['teaStep', 'teaEntry'], ['teaEntry', 'teaA'], ['teaA', 'teaB'],
  ['south', 'gardenPorch'], ['gardenPorch', 'gardenGate'], ['gardenGate', 'gardenEntry'], ['gardenEntry', 'gardenLane'],
  ['gardenLane', 'gardenWestB'], ['gardenWestB', 'gardenWestA'], ['gardenWestA', 'gardenBenchA'], ['gardenWestB', 'gardenBenchB'],
  ['gardenWestA', 'gardenRear'], ['gardenRear', 'gardenBridgePath'], ['gardenBridgePath', 'bridgeSouth'],
  ['bridgeSouth', 'bridgeRise'], ['bridgeRise', 'bridgeCrest'], ['bridgeCrest', 'bridgeFall'], ['bridgeFall', 'bridgeNorth'],
  ['bridgeNorth', 'barEntry'], ['barEntry', 'barAisleA'], ['barAisleA', 'barAisleB'], ['barAisleA', 'barSeatA'], ['barAisleB', 'barSeatB'],
  ['north', 'officeRearAisle'], ['officeRearAisle', 'officeReceptionDoor'], ['officeReceptionDoor', 'receptionBridgeSouth'],
  ['receptionBridgeSouth', 'receptionBridgeRise'], ['receptionBridgeRise', 'receptionBridgeCrest'], ['receptionBridgeCrest', 'receptionBridgeFall'], ['receptionBridgeFall', 'receptionBridgeNorth'],
  ['receptionBridgeNorth', 'receptionEntry'], ['receptionEntry', 'receptionAisle'], ['receptionAisle', 'receptionLoungeEntry'],
  ['receptionLoungeEntry', 'receptionInnerA'], ['receptionInnerA', 'receptionSeatA'], ['receptionInnerA', 'receptionInnerB'], ['receptionInnerB', 'receptionSeatB'],
  ['guestOutside', 'guestApproach'], ['guestApproach', 'guestThreshold'], ['guestThreshold', 'guestDoor'], ['guestDoor', 'guestWelcome'],
  ['guestWelcome', 'guestPassage'], ['guestPassage', 'guestInner'], ['guestInner', 'receptionAisle'],
];
const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

export function walkRoute(start, target) {
  if (!walkNodes[start] || !walkNodes[target]) throw new Error('Unknown office waypoint');
  const cost = new Map([[start, 0]]), previous = new Map(), todo = new Set(Object.keys(walkNodes));
  while (todo.size) {
    const current = [...todo].sort((a, b) => (cost.get(a) ?? Infinity) - (cost.get(b) ?? Infinity))[0];
    if (current === target) break;
    todo.delete(current);
    for (const edge of links) {
      if (!edge.includes(current)) continue;
      const next = edge[0] === current ? edge[1] : edge[0];
      const candidate = (cost.get(current) ?? Infinity) + distance(walkNodes[current], walkNodes[next]);
      if (candidate < (cost.get(next) ?? Infinity)) { cost.set(next, candidate); previous.set(next, current); }
    }
  }
  const route = [target];
  while (route[0] !== start) { const parent = previous.get(route[0]); if (!parent) throw new Error('No walkable route'); route.unshift(parent); }
  return route;
}

const callNodes = { strategy: 'callStrategy', insight: 'callInsight', creative: 'callCreative', media: 'callMedia', account: 'callAccount' };
export class OfficeNavigation {
  constructor({ seats, getName = id => id, onAmbient = () => {}, onCallArrival = () => {} }) {
    this.time = 0; this.nextSocial = 3; this.quietUntil = 0; this.round = 0; this.pair = null; this.afterHours = false;
    this.getName = getName; this.onAmbient = onAmbient; this.onCallArrival = onCallArrival;
    this.actors = new Map(Object.entries(seats).map(([id, seat]) => [id, { id, position: [seat.x, 0, seat.z], heading: seat.rotation, homeRotation: seat.rotation, pose: 'seated', route: [], destination: id, busy: false, reason: 'home', callbacks: [] }]));
  }
  atDesk(id) { const actor = this.actors.get(id); return actor && actor.destination === id && !actor.route.length && distance(actor.position, walkNodes[id]) < .01; }
  move(id, destination, reason = 'idle') {
    const actor = this.actors.get(id); if (!actor) return;
    const nearest = Object.keys(walkNodes).sort((a, b) => distance(actor.position, walkNodes[a]) - distance(actor.position, walkNodes[b]))[0];
    const path = walkRoute(nearest, destination);
    actor.route = path.map(key => [...walkNodes[key]]);
    if (distance(actor.position, actor.route[0]) < .01) actor.route.shift();
    actor.destination = destination; actor.reason = reason; actor.pose = actor.route.length ? 'walking' : destination === id ? 'seated' : 'standing';
    if (!actor.route.length) this.arrive(actor);
  }
  home(id, callback) {
    const actor = this.actors.get(id); if (!actor) return;
    if (callback) actor.callbacks.push(callback);
    if (this.atDesk(id)) { this.arrive(actor); return; }
    if (actor.destination !== id || !actor.route.length) this.move(id, id, 'home');
  }
  arrive(actor) {
    actor.pose = actor.destination === actor.id ? 'seated' : actor.destination.startsWith('gardenBench') ? 'bench' : actor.destination.startsWith('barSeat') ? 'barstool' : receptionSeatHeadings[actor.destination] !== undefined ? 'sofa' : 'standing';
    if (actor.pose === 'bench') actor.heading = -Math.PI / 2;
    if (actor.pose === 'barstool') actor.heading = 0;
    if (actor.pose === 'sofa') actor.heading = receptionSeatHeadings[actor.destination];
    if (actor.pose === 'seated') {
      actor.heading = actor.homeRotation; actor.reason = 'home';
      const callbacks = actor.callbacks.splice(0); callbacks.forEach(callback => callback());
    } else if (actor.reason === 'idle') {
      actor.returnAt = this.time + (actor.pose === 'barstool' ? 20 : 7); actor.reason = 'loitering';
      this.onAmbient(actor.id, actor.pose === 'sofa' ? 'Mình đã tới sảnh tiếp đón. Mời khách ngồi chờ, dùng một tách trà nhé.' : actor.pose === 'barstool' ? 'Xong việc rồi, mình qua Izakaya ngồi thư giãn một chút nhé!' : actor.pose === 'bench' ? 'Mình ra ngắm koi, nghỉ một chút nhé. Có việc mới mình về bàn ngay.' : 'Mình chưa có task nên ra đi dạo một chút. Có việc mới mình về bàn ngay nhé.');
    } else if (actor.reason === 'called') {
      actor.returnAt = this.time + 13; actor.reason = 'listening'; this.onCallArrival(actor.id);
    }
  }
  cancelPair() {
    if (!this.pair) return;
    const pair = this.pair; this.pair = null;
    for (const id of pair.ids) this.home(id);
    this.nextSocial = this.time + 12;
  }
  requestGardenBreak() { return this.requestBreak('garden'); }
  requestBarBreak() { return this.requestBreak('bar'); }
  requestReception() { return this.requestBreak('reception'); }
  requestBreak(place) {
    const available = [...this.actors.values()].filter(actor => !actor.busy && (this.atDesk(actor.id) || this.pair?.ids.includes(actor.id)));
    if (!available.length) return [];
    this.cancelPair();
    if (place === 'bar') this.afterHours = true;
    if (place === 'reception') available.sort((a, b) => Number(b.id === 'account') - Number(a.id === 'account'));
    const ids = available.slice(0, 2).map(actor => actor.id);
    if (ids.length === 2) this.pair = { ids, metAt: null, garden: place === 'garden', bar: place === 'bar', reception: place === 'reception' };
    const destinations = place === 'reception' ? ['receptionSeatA', 'receptionSeatB'] : place === 'bar' ? ['barSeatA', 'barSeatB'] : ['gardenBenchA', 'gardenBenchB'];
    ids.forEach((id, i) => this.move(id, destinations[i], ids.length === 2 ? 'social' : 'idle'));
    this.nextSocial = this.time + 45;
    return ids;
  }
  endAfterHours() {
    this.afterHours = false; this.cancelPair(); this.quietFor(20); this.nextSocial = this.time + 20;
    for (const actor of this.actors.values()) if (actor.destination.startsWith('bar') || actor.reason === 'loitering') this.home(actor.id);
  }
  setBusy(id, busy) {
    const actor = this.actors.get(id); if (!actor || actor.busy === busy) return;
    actor.busy = busy;
    if (busy) { if (this.pair?.ids.includes(id)) this.cancelPair(); this.home(id); }
  }
  call(id) {
    const actor = this.actors.get(id); if (!actor) return;
    if (this.pair?.ids.includes(id)) this.cancelPair();
    this.quietFor(12); this.move(id, callNodes[id], 'called');
  }
  quietFor(seconds) { this.quietUntil = Math.max(this.quietUntil, this.time + seconds); }
  freezeAtDesks() {
    this.pair = null; this.nextSocial = this.time + 5;
    for (const actor of this.actors.values()) { actor.position = [...walkNodes[actor.id]]; actor.destination = actor.id; actor.route = []; this.arrive(actor); }
  }
  step(delta) {
    const dt = Math.max(0, Math.min(delta, .12)); this.time += dt;
    for (const actor of this.actors.values()) {
      let remaining = dt * 1.8;
      while (remaining > 0 && actor.route.length) {
        const target = actor.route[0], length = distance(actor.position, target);
        if (length < .001) { actor.route.shift(); if (!actor.route.length) this.arrive(actor); continue; }
        actor.heading = Math.atan2(-(target[0] - actor.position[0]), -(target[2] - actor.position[2]));
        const step = Math.min(length, remaining);
        actor.position = actor.position.map((value, index) => value + (target[index] - value) * step / length); remaining -= step;
        if (step >= length - .00001) actor.route.shift();
        if (!actor.route.length) this.arrive(actor);
      }
      if (['listening', 'loitering'].includes(actor.reason) && !actor.route.length && this.time >= actor.returnAt) this.home(actor.id);
    }
    if (this.pair) {
      const pair = this.pair, [a, b] = pair.ids.map(id => this.actors.get(id));
      if (!a.route.length && !b.route.length) {
        if (!pair.garden && !pair.bar && !pair.reception) { a.heading = Math.atan2(-(b.position[0] - a.position[0]), -(b.position[2] - a.position[2])); b.heading = a.heading + Math.PI; }
        if (!pair.metAt) pair.metAt = this.time;
        if (this.time >= this.quietUntil) {
          if (!pair.first) { pair.first = true; this.onAmbient(a.id, pair.reception ? 'Mình đã tới sảnh tiếp đón. Mời khách ngồi sofa, dùng trà trong lúc chờ nhé.' : pair.bar ? `${this.getName(b.id)} ơi, tan ca rồi! Ngồi Izakaya ngắm suối, gọi chút đồ ăn nhé?` : pair.garden ? `${this.getName(b.id)} ơi, ra ngắm koi với hoa anh đào một chút nhé. Tiếng thác nước dễ chịu quá!` : `${this.getName(b.id)} ơi, mình đang rảnh. Trao đổi một chút rồi về bàn nhé?`); }
          if (!pair.second && this.time - pair.metAt > 3) { pair.second = true; this.onAmbient(b.id, pair.reception ? 'Cầu đèn lồng đẹp thật. Mình cùng ngồi đây chuẩn bị buổi trao đổi với khách nhé.' : pair.bar ? 'Ừ, qua cầu gỗ tới đây thích thật. Mình gọi một ly và ngồi thư giãn thôi!' : pair.garden ? 'Ừ, ngồi bên hồ thư giãn chút. Có task mới mình quay về bàn ngay.' : 'Ừ, mình cũng chưa có task. Có việc mới thì mình quay lại bàn ngay nhé.'); }
        }
        if (this.time - pair.metAt > (pair.bar ? 22 : pair.reception ? 18 : pair.garden ? 14 : 9)) this.cancelPair();
      }
    } else if (this.time >= this.nextSocial && this.time >= this.quietUntil) {
      const order = ['creative', 'media', 'insight', 'account', 'strategy'];
      const rotated = [...order.slice(this.round % 5), ...order.slice(0, this.round % 5)];
      const free = rotated.filter(id => !this.actors.get(id).busy && this.atDesk(id));
      if (free.length >= 2) {
        const destinations = this.afterHours ? ['barSeatA', 'barSeatB'] : [['socialA', 'socialB'], ['gardenBenchA', 'gardenBenchB'], ['teaA', 'teaB'], ['meetingA', 'meetingB']][this.round % 4];
        this.pair = { ids: free.slice(0, 2), metAt: null, garden: destinations[0] === 'gardenBenchA', bar: this.afterHours };
        this.pair.ids.forEach((id, index) => this.move(id, destinations[index], 'social'));
        this.round++;
      } else if (free.length === 1) { this.move(free[0], this.afterHours ? 'barSeatA' : 'socialA', 'idle'); this.nextSocial = this.time + 18; } else this.nextSocial = this.time + 4;
    }
  }
}

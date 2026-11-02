const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

export class OfficeAudio {
  constructor({ onChange = () => {}, onNotice = () => {} } = {}) {
    let saved; try { saved = JSON.parse(localStorage.getItem('atelier-audio-v1') || '{}'); } catch { saved = {}; }
    this.enabled = saved?.enabled !== false; this.volume = Number.isFinite(saved?.volume) ? clamp(saved.volume, 0, .6) : .2;
    this.voice = saved?.voice === true; this.onChange = onChange; this.onNotice = onNotice;
    this.nodes = new Set(); this.unlocked = false; this.step = 0; this.state = this.enabled ? 'locked' : 'muted';
    this.visibility = () => { if (document.hidden) { this.stopSchedule(); this.ctx?.suspend().catch(() => {}); window.speechSynthesis?.cancel(); this.update(); } else if (this.unlocked && this.enabled) void this.play(); };
    document.addEventListener('visibilitychange', this.visibility);
  }
  snapshot() { return { enabled: this.enabled, volume: this.volume, voice: this.voice, state: this.state }; }
  persist() { try { localStorage.setItem('atelier-audio-v1', JSON.stringify({ enabled: this.enabled, volume: this.volume, voice: this.voice })); } catch { /* Preferences remain usable in this session. */ } }
  update() {
    if (this.state !== 'unsupported') this.state = !this.enabled ? 'muted' : this.ctx?.state === 'running' ? 'playing' : this.unlocked ? 'paused' : 'locked';
    this.onChange(this.snapshot());
  }
  async unlock() { this.unlocked = true; if (this.enabled) await this.play(); else this.update(); }
  async play() {
    if (this.playPromise) return this.playPromise;
    this.playPromise = this.start().finally(() => { this.playPromise = null; }); return this.playPromise;
  }
  async start() {
    try {
      const Context = window.AudioContext || window.webkitAudioContext;
      if (!Context) { this.state = 'unsupported'; this.onChange(this.snapshot()); return; }
      if (!this.ctx) {
        this.ctx = new Context(); this.master = this.ctx.createGain(); this.master.gain.value = 0; this.master.connect(this.ctx.destination);
        this.ctx.addEventListener('statechange', () => this.update());
      }
      await this.ctx.resume();
      if (!this.enabled || document.hidden) { await this.ctx.suspend(); this.update(); return; }
      this.master.gain.setTargetAtTime(this.volume, this.ctx.currentTime, .25);
      if (!this.timer) { this.nextNote = this.ctx.currentTime + .08; this.schedule(); this.timer = setInterval(() => this.schedule(), 250); }
      this.update();
    } catch { this.state = 'paused'; this.onChange(this.snapshot()); this.onNotice('Trình duyệt chưa cho phát nhạc. Bấm “Phát nhạc” để thử lại.'); }
  }
  note(frequency, at, duration, gain = .1, type = 'sine') {
    const oscillator = this.ctx.createOscillator(), envelope = this.ctx.createGain();
    oscillator.type = type; oscillator.frequency.value = frequency;
    envelope.gain.setValueAtTime(0, at); envelope.gain.linearRampToValueAtTime(gain, at + .025); envelope.gain.exponentialRampToValueAtTime(.0001, at + duration);
    oscillator.connect(envelope); envelope.connect(this.master); this.nodes.add(oscillator);
    oscillator.onended = () => { this.nodes.delete(oscillator); oscillator.disconnect(); envelope.disconnect(); };
    oscillator.start(at); oscillator.stop(at + duration + .05);
  }
  schedule() {
    if (!this.ctx || !this.enabled || document.hidden || this.ctx.state !== 'running') return;
    // An original pentatonic ambient loop, synthesized locally; no music downloads.
    const melody = [0, 7, 12, 4, 9, 7, 4, null, 2, 9, 14, 7, 4, 2, 0, null, 4, 12, 9, 7, 2, 4, 7, null, 9, 7, 4, 2, 0, null, 7, null];
    while (this.nextNote < this.ctx.currentTime + 1.2) {
      const pitch = melody[this.step % melody.length], at = this.nextNote;
      if (pitch !== null) {
        const frequency = 220 * 2 ** (pitch / 12);
        this.note(frequency, at, 2.4, .15); this.note(frequency * 2, at, 1.1, .025);
      }
      if (this.step % 8 === 0) { this.note(110, at, 5.8, .085); this.note(164.81, at + .05, 5.8, .035); }
      this.step++; this.nextNote += .82;
    }
  }
  stopSchedule() { clearInterval(this.timer); this.timer = null; for (const node of this.nodes) { try { node.stop(); } catch { /* Already ended. */ } } this.nodes.clear(); }
  async toggle() {
    if (this.enabled && this.state !== 'playing') { this.unlocked = true; await this.play(); return; }
    this.unlocked = true; this.enabled = !this.enabled; this.persist();
    if (this.enabled) await this.play(); else { this.stopSchedule(); if (this.ctx) { this.master.gain.setTargetAtTime(0, this.ctx.currentTime, .03); await this.ctx.suspend(); } this.update(); }
  }
  setVolume(value) { this.volume = clamp(Number(value) || 0, 0, .6); if (this.ctx) this.master.gain.setTargetAtTime(this.enabled ? this.volume : 0, this.ctx.currentTime, .08); this.persist(); this.update(); }
  setVoice(enabled) {
    this.voice = enabled && 'speechSynthesis' in window;
    if (!this.voice) window.speechSynthesis?.cancel();
    if (enabled && !this.voice) this.onNotice('Thiết bị chưa hỗ trợ giọng đọc. Lời thoại vẫn hiện trên màn hình.');
    this.persist(); this.update();
  }
  speak(text) {
    if (!this.voice || !this.unlocked || document.hidden || !window.speechSynthesis) return;
    const voices = speechSynthesis.getVoices(); const voice = voices.find(v => v.lang.startsWith('vi') && v.localService) || voices.find(v => v.lang.startsWith('vi'));
    if (!voice) { this.onNotice('Trình duyệt chưa có giọng tiếng Việt. Bạn vẫn đọc được bong bóng thoại.'); return; }
    speechSynthesis.cancel(); const utterance = new SpeechSynthesisUtterance(text); utterance.lang = 'vi-VN'; utterance.voice = voice; utterance.rate = .98; utterance.volume = .8;
    utterance.onerror = event => { if (!['canceled', 'interrupted'].includes(event.error)) this.onNotice('Không phát được giọng đọc; lời thoại vẫn hiển thị.'); }; speechSynthesis.speak(utterance);
  }
  chime() { if (this.ctx?.state !== 'running' || !this.enabled || document.hidden) return; this.note(659.25, this.ctx.currentTime, .5, .12); this.note(880, this.ctx.currentTime + .16, .8, .09); }
  dispose() { this.stopSchedule(); document.removeEventListener('visibilitychange', this.visibility); window.speechSynthesis?.cancel(); this.ctx?.close().catch(() => {}); }
}

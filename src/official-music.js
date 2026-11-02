const videoId = 'ufwB9Uja_wM';
export const prettyPleaseUrl = `https://www.youtube.com/watch?v=${videoId}`;
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function mountOfficialMusic(container, audio, refresh, { showTV = () => {} } = {}) {
  let source = 'youtube', mode = 'standby', slideIndex = 0, slides = [];
  try { source = localStorage.getItem('atelier-music-source') === 'ambient' ? 'ambient' : 'youtube'; } catch { /* Use the requested track. */ }
  container.insertAdjacentHTML('beforeend', `<section class="official-track"><div class="eyebrow">TIVI VĂN PHÒNG · YOUTUBE</div><strong>Pretty Please — H2H</strong><p>Video sẽ phát ngay trên tivi trong văn phòng. Có thể cần bấm Play của YouTube.</p><div class="official-track-actions"><button class="button secondary" id="youtube-play">Phát Pretty Please</button><button class="button secondary" id="youtube-stop" hidden>Dừng</button></div><a href="${prettyPleaseUrl}" target="_blank" rel="noopener noreferrer">Mở trên YouTube ↗</a></section>`);
  const surface = document.createElement('div'); surface.id = 'office-tv-screen'; surface.className = 'tv-screen'; surface.style.backfaceVisibility = 'hidden';
  surface.addEventListener('pointerdown', event => event.stopPropagation());
  surface.addEventListener('wheel', event => event.stopPropagation());
  function remember(value) { source = value; try { localStorage.setItem('atelier-music-source', value); } catch { /* Session preference. */ } }
  function drawStandby() {
    surface.dataset.mode = mode;
    surface.innerHTML = `<div class="tv-standby"><span class="tv-channel">ATELIER · STUDIO SCREEN</span><div class="tv-orbit" aria-hidden="true">◌</div><h2>A bigger space<br>for your next idea.</h2><p>Pretty Please — H2H · Kế hoạch IMC · Chia sẻ cùng đội ngũ</p><button id="tv-screen-play">Phát H2H <span aria-hidden="true">▶</span></button></div>`;
    surface.querySelector('#tv-screen-play').onclick = () => play(true);
  }
  function clear() { mode = 'standby'; drawStandby(); container.querySelector('#youtube-stop').hidden = true; }
  function play(focus = true) {
    if (showTV(focus) === false) return;
    remember('youtube'); surface.replaceChildren(); mode = 'youtube'; surface.dataset.mode = mode; audio.useExternal();
    const holder = document.createElement('div'); holder.id = 'youtube-player';
    const iframe = document.createElement('iframe'); iframe.title = 'Pretty Please — H2H · Tivi văn phòng';
    iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0&loop=1&playlist=${videoId}`;
    iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen'; iframe.allowFullscreen = true;
    iframe.referrerPolicy = 'strict-origin-when-cross-origin'; holder.append(iframe); surface.append(holder);
    container.querySelector('#youtube-stop').hidden = false; refresh(audio.snapshot());
  }
  function stop() { const wasYouTube = mode === 'youtube'; clear(); if (wasYouTube || source === 'youtube') audio.stopExternal(); refresh(audio.snapshot()); }
  function drawSlide() {
    mode = 'presentation'; surface.dataset.mode = mode;
    const slide = slides[slideIndex];
    surface.innerHTML = `<article class="tv-slide"><div class="tv-channel">ATELIER · PRESENTATION</div><span class="tv-slide-label">${esc(slide.label)}</span><h2>${esc(slide.title)}</h2><p>${esc(slide.text)}</p><div class="tv-slide-footer"><span>STRATEGY, TOGETHER.</span><nav aria-label="Điều khiển trình chiếu"><button id="tv-slide-prev" aria-label="Slide trước">←</button><span>${slideIndex + 1} / ${slides.length}</span><button id="tv-slide-next" aria-label="Slide tiếp">→</button></nav></div></article>`;
    surface.querySelector('#tv-slide-prev').onclick = () => { slideIndex = (slideIndex + slides.length - 1) % slides.length; drawSlide(); };
    surface.querySelector('#tv-slide-next').onclick = () => { slideIndex = (slideIndex + 1) % slides.length; drawSlide(); };
  }
  container.querySelector('#youtube-play').onclick = () => play(true);
  container.querySelector('#youtube-stop').onclick = stop;
  document.addEventListener('click', event => { const details = document.querySelector('#sound-controls'); if (details.open && !details.contains(event.target)) details.open = false; });
  document.addEventListener('visibilitychange', () => { if (document.hidden && mode === 'youtube') { clear(); refresh(audio.snapshot()); } });
  drawStandby();
  return {
    surface, play, stop,
    showPlan(plan) {
      if (showTV(true) === false) return;
      const wasYouTube = mode === 'youtube'; clear(); if (wasYouTube) audio.stopExternal();
      slides = [{ label: '01 · CLIENT BRIEF', title: plan.client, text: plan.objective }, { label: '02 · AUDIENCE', title: 'Đúng người. Đúng bài toán.', text: plan.audience }, { label: '03 · IMC FRAMEWORK', title: 'Từ chiến lược đến triển khai.', text: plan.phases.map(phase => phase.name).join(' → ') }];
      slideIndex = 0; drawSlide(); refresh(audio.snapshot());
    },
    setVisible(visible) { if (!visible && mode === 'youtube') stop(); },
    leaveOffice() { if (mode === 'youtube') stop(); },
    activate() { if (source === 'youtube') { if (audio.enabled) play(false); } else void audio.unlock(); },
    toggleAmbient() { clear(); remember('ambient'); void audio.toggle(); },
    render(state) {
      const preferred = source === 'youtube', active = mode === 'youtube';
      document.querySelector('#music-volume').disabled = preferred;
      if (preferred) {
        document.querySelector('#sound-summary').textContent = active ? 'H2H · trên tivi' : audio.enabled ? 'H2H · chạm mở tivi' : 'Nhạc đang tắt';
        document.querySelector('#audio-status').textContent = active ? 'Video đang mở trên tivi. Bấm Play trong màn hình nếu chưa có tiếng.' : audio.enabled ? 'Chạm để mở bài nhạc trên tivi văn phòng.' : 'Nhạc đang tắt.';
        document.querySelector('#audio-toggle').textContent = 'Dùng nhạc ambient';
      }
      document.querySelector('#sound-controls').dataset.source = source;
    },
  };
}

const videoId = 'ufwB9Uja_wM';
export const prettyPleaseUrl = `https://www.youtube.com/watch?v=${videoId}`;

export function mountOfficialMusic(container, audio, refresh) {
  let source = 'youtube'; try { source = localStorage.getItem('atelier-music-source') === 'ambient' ? 'ambient' : 'youtube'; } catch { /* Use the requested track. */ }
  container.insertAdjacentHTML('beforeend', `<section class="official-track"><div class="eyebrow">YOUTUBE · LINK BẠN CHỌN</div><strong>Pretty Please — H2H</strong><p>Phát qua YouTube. Bấm Play trong trình phát nếu trình duyệt chặn tự phát.</p><div class="official-track-actions"><button class="button secondary" id="youtube-play">Phát Pretty Please</button><button class="button secondary" id="youtube-stop" hidden>Dừng</button></div><a href="${prettyPleaseUrl}" target="_blank" rel="noopener noreferrer">Mở trên YouTube ↗</a></section>`);
  const strip = document.querySelector('#official-player-strip');
  strip.innerHTML = `<div class="music-strip-copy"><div class="eyebrow">OFFICE PLAYLIST · YOUTUBE</div><strong>Pretty Please — H2H</strong><p>Trình phát từ link bạn chọn. Nếu chưa có tiếng, bấm Play trong video.</p><a href="${prettyPleaseUrl}" target="_blank" rel="noopener noreferrer">Mở trên YouTube</a><button id="youtube-dock-stop">Dừng & thu gọn</button></div><div id="youtube-player"></div>`;
  const holder = strip.querySelector('#youtube-player');
  function remember(value) { source = value; try { localStorage.setItem('atelier-music-source', value); } catch { /* Session preference. */ } }
  function clear() { holder.replaceChildren(); strip.hidden = true; container.querySelector('#youtube-stop').hidden = true; }
  function play() {
    remember('youtube'); clear(); audio.useExternal();
    const iframe = document.createElement('iframe');
    iframe.title = 'Pretty Please — H2H · YouTube';
    iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0&loop=1&playlist=${videoId}`;
    iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen'; iframe.allowFullscreen = true;
    iframe.referrerPolicy = 'strict-origin-when-cross-origin'; holder.append(iframe);
    container.querySelector('#youtube-stop').hidden = false;
    strip.hidden = false; refresh(audio.snapshot());
  }
  function stop() { clear(); audio.stopExternal(); refresh(audio.snapshot()); }
  container.querySelector('#youtube-play').onclick = play;
  container.querySelector('#youtube-stop').onclick = stop;
  strip.querySelector('#youtube-dock-stop').onclick = stop;
  document.addEventListener('click', event => { const details = document.querySelector('#sound-controls'); if (details.open && !details.contains(event.target)) details.open = false; });
  document.addEventListener('visibilitychange', () => { if (document.hidden && holder.children.length) { clear(); refresh(audio.snapshot()); } });
  return {
    activate() { if (source === 'youtube') { if (audio.enabled) play(); } else void audio.unlock(); },
    toggleAmbient() { clear(); remember('ambient'); void audio.toggle(); },
    render(state) {
      const preferred = source === 'youtube', active = !!holder.children.length;
      document.querySelector('#music-volume').disabled = preferred;
      if (preferred) {
        document.querySelector('#sound-summary').textContent = active ? 'Pretty Please · YouTube' : audio.enabled ? 'Pretty Please · chạm mở' : 'Nhạc đang tắt';
        document.querySelector('#audio-status').textContent = active ? 'Trình phát YouTube đã mở. Nếu chưa có tiếng, bấm Play trong video.' : audio.enabled ? 'Chạm để mở bài nhạc bạn chọn.' : 'Nhạc đang tắt.';
        document.querySelector('#audio-toggle').textContent = 'Dùng nhạc ambient';
      }
      document.querySelector('#sound-controls').dataset.source = source;
    },
  };
}

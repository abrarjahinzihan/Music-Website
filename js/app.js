/* ══════════════════════════════════════════════════════════
   SoundWave — Main Application JS
   HTML5 Audio API · Web Audio Synth Fallback · Responsive UI
══════════════════════════════════════════════════════════ */

'use strict';

// ───────────────────────────────────────────────────────────
// STATE
// ───────────────────────────────────────────────────────────
const state = {
  currentTrack: null,       // song object
  currentIndex: 0,          // index in queue
  queue: (typeof SONGS !== 'undefined' ? [...SONGS] : []),
  isPlaying: false,
  isShuffle: false,
  repeatMode: 0,            // 0=off, 1=repeat-all, 2=repeat-one
  volume: 0.8,
  isMuted: false,
  favorites: new Set(),
  currentPage: 'home',
  currentLibTab: 'playlists',
  heroIndex: 0,
};

// ───────────────────────────────────────────────────────────
// DOM REFS
// ───────────────────────────────────────────────────────────
const audio = document.getElementById('audioPlayer');
const $ = id => document.getElementById(id);

const els = {
  // Player bar
  playPauseBtn: $('playPauseBtn'),
  playIcon: $('playIcon'),
  prevBtn: $('prevBtn'),
  nextBtn: $('nextBtn'),
  shuffleBtn: $('shuffleBtn'),
  repeatBtn: $('repeatBtn'),
  playerTitle: $('playerTitle'),
  playerArtist: $('playerArtist'),
  playerThumb: $('playerThumb'),
  playerFavBtn: $('playerFavBtn'),
  progressFill: $('progressFill'),
  progressThumb: $('progressThumb'),
  progressBarWrap: $('progressBarWrap'),
  currentTime: $('currentTime'),
  totalTime: $('totalTime'),
  volumeSlider: $('volumeSlider'),
  muteBtn: $('muteBtn'),
  volIcon: $('volIcon'),
  waveformCanvas: $('waveformCanvas'),
  queueBtn: $('queueBtn'),
  fullscreenBtn: $('fullscreenBtn'),
  // Fullscreen
  fullscreenPlayer: $('fullscreenPlayer'),
  fsClose: $('fsClose'),
  fsTitle: $('fsTitle'),
  fsArtist: $('fsArtist'),
  fsAlbum: $('fsAlbum'),
  fsDisc: $('fsDisc'),
  heroDisc: $('heroDisc'),
  fsPlayBtn: $('fsPlayBtn'),
  fsPlayIcon: $('fsPlayIcon'),
  fsPrevBtn: $('fsPrevBtn'),
  fsNextBtn: $('fsNextBtn'),
  fsShuffleBtn: $('fsShuffleBtn'),
  fsRepeatBtn: $('fsRepeatBtn'),
  fsProgressFill: $('fsProgressFill'),
  fsProgressThumb: $('fsProgressThumb'),
  fsProgressWrap: $('fsProgressWrap'),
  fsCurrentTime: $('fsCurrentTime'),
  fsTotalTime: $('fsTotalTime'),
  fsVolumeSlider: $('fsVolumeSlider'),
  fsWaveform: $('fsWaveform'),
  fsBg: $('fsBg'),
  // Misc
  queuePanel: $('queuePanel'),
  queueList: $('queueList'),
  closeQueue: $('closeQueue'),
  toast: $('toast'),
  searchInput: $('searchInput'),
  hamburgerBtn: $('hamburgerBtn'),
  sidebar: $('sidebar'),
  heroPlayBtn: $('heroPlayBtn'),
  heroLikeBtn: $('heroLikeBtn'),
  heroTitle: $('heroTitle'),
  heroArtist: $('heroArtist'),
};

// ───────────────────────────────────────────────────────────
// WEB AUDIO SYNTHESIZER (INSTANT OFFLINE AUDIO FALLBACK)
// ───────────────────────────────────────────────────────────
let audioCtx = null;
let synthGain = null;
let synthTimer = null;
let synthTimeSec = 0;
let isUsingSynth = false;

function initAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
      synthGain = audioCtx.createGain();
      synthGain.gain.value = state.isMuted ? 0 : state.volume * 0.25;
      synthGain.connect(audioCtx.destination);
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function playSynthNote(freq, duration = 0.35, type = 'sine') {
  if (!audioCtx || !synthGain || state.isMuted || state.volume === 0) return;
  try {
    const osc = audioCtx.createOscillator();
    const noteGain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

    noteGain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

    osc.connect(noteGain);
    noteGain.connect(synthGain);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {}
}

const MELODY_FREQS = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25];

function startSynthPlayback() {
  initAudioContext();
  isUsingSynth = true;
  clearInterval(synthTimer);

  let beat = 0;
  synthTimer = setInterval(() => {
    if (!state.isPlaying) return;

    // Melody and chords
    beat++;
    synthTimeSec += 0.25;

    // Play periodic musical tone
    if (beat % 2 === 0) {
      const freq = MELODY_FREQS[(beat + (state.currentTrack?.id || 1) * 2) % MELODY_FREQS.length];
      playSynthNote(freq, 0.4, 'triangle');
    }
    if (beat % 4 === 0) {
      // Bass note
      const bassFreq = MELODY_FREQS[(state.currentTrack?.id || 1) % 4] / 2;
      playSynthNote(bassFreq, 0.5, 'sine');
    }

    // Update progress
    const totalSec = parseDuration(state.currentTrack?.duration || '3:20');
    if (synthTimeSec >= totalSec) {
      nextTrack();
      return;
    }

    const prog = synthTimeSec / totalSec;
    updateProgressUI(prog, synthTimeSec, totalSec);
  }, 250);
}

function stopSynthPlayback() {
  clearInterval(synthTimer);
  isUsingSynth = false;
}

function parseDuration(durStr) {
  if (!durStr) return 200;
  const parts = durStr.split(':').map(Number);
  return (parts[0] || 0) * 60 + (parts[1] || 0);
}

// ───────────────────────────────────────────────────────────
// WAVEFORM VISUALIZER (CANVAS)
// ───────────────────────────────────────────────────────────
let waveformData = [];
let waveformRAF = null;

function generateWaveform(count = 60) {
  waveformData = Array.from({ length: count }, () => 0.2 + Math.random() * 0.8);
}

function drawWaveform(canvas, progress = 0, isPlaying = false, bars = 60) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  if (!waveformData.length) generateWaveform(bars);

  const barW = (W / bars) * 0.6;
  const gap  = (W / bars) * 0.4;
  const played = Math.floor(progress * bars);

  for (let i = 0; i < bars; i++) {
    const x = i * (barW + gap);
    const h = waveformData[i] * H * 0.9;

    let heightMod = 1;
    if (isPlaying) {
      heightMod = 1 + 0.25 * Math.sin(Date.now() / 150 + i);
    }

    ctx.fillStyle = i <= played
      ? `rgba(157, 95, 245, ${0.75 + 0.25 * waveformData[i]})`
      : 'rgba(255, 255, 255, 0.14)';

    const rh = Math.max(3, h * heightMod);
    const ry = (H - rh) / 2;
    ctx.beginPath();
    ctx.roundRect(x, ry, barW, rh, 2);
    ctx.fill();
  }
}

function animateWaveform() {
  let prog = 0;
  if (!isUsingSynth && audio.duration) {
    prog = audio.currentTime / audio.duration;
  } else if (isUsingSynth) {
    const total = parseDuration(state.currentTrack?.duration || '3:20');
    prog = synthTimeSec / total;
  }
  drawWaveform(els.waveformCanvas, prog, state.isPlaying, 60);
  if (els.fullscreenPlayer?.classList.contains('open')) {
    drawWaveform(els.fsWaveform, prog, state.isPlaying, 80);
  }
  waveformRAF = requestAnimationFrame(animateWaveform);
}

function startWaveformAnim() {
  if (waveformRAF) cancelAnimationFrame(waveformRAF);
  animateWaveform();
}

// ───────────────────────────────────────────────────────────
// PROGRESS UI
// ───────────────────────────────────────────────────────────
function updateProgressUI(prog, currentSec, totalSec) {
  const pct = (Math.min(1, Math.max(0, prog)) * 100).toFixed(2);
  if (els.progressFill) els.progressFill.style.width = pct + '%';
  if (els.progressThumb) els.progressThumb.style.setProperty('--pct', pct + '%');
  if (els.fsProgressFill) els.fsProgressFill.style.width = pct + '%';
  if (els.fsProgressThumb) els.fsProgressThumb.style.setProperty('--pct', pct + '%');

  if (els.currentTime) els.currentTime.textContent = formatTime(currentSec);
  if (els.fsCurrentTime) els.fsCurrentTime.textContent = formatTime(currentSec);
  if (els.totalTime) els.totalTime.textContent = formatTime(totalSec);
  if (els.fsTotalTime) els.fsTotalTime.textContent = formatTime(totalSec);
}

// ───────────────────────────────────────────────────────────
// AUDIO API EVENT LISTENERS
// ───────────────────────────────────────────────────────────
audio.addEventListener('loadedmetadata', () => {
  const dur = audio.duration;
  if (els.totalTime) els.totalTime.textContent = formatTime(dur);
  if (els.fsTotalTime) els.fsTotalTime.textContent = formatTime(dur);
  generateWaveform(60);
});

audio.addEventListener('timeupdate', () => {
  if (isUsingSynth || !audio.duration) return;
  const prog = audio.currentTime / audio.duration;
  updateProgressUI(prog, audio.currentTime, audio.duration);
});

audio.addEventListener('ended', () => {
  if (state.repeatMode === 2) {
    audio.currentTime = 0;
    audio.play().catch(() => {});
  } else {
    nextTrack();
  }
});

audio.addEventListener('error', () => {
  // Remote audio blocked or failed -> automatically switch to synthesized sound!
  console.log('Audio file failed to load, switching to built-in synthesizer.');
  if (state.isPlaying) {
    startSynthPlayback();
  }
});

audio.addEventListener('play', () => {
  stopSynthPlayback();
  setPlayPauseIcon(true);
  startWaveformAnim();
});

audio.addEventListener('pause', () => {
  if (!isUsingSynth) {
    setPlayPauseIcon(false);
  }
});

// ───────────────────────────────────────────────────────────
// PLAYER CORE
// ───────────────────────────────────────────────────────────
function loadTrack(song, autoplay = true) {
  if (!song) return;
  initAudioContext();
  state.currentTrack = song;
  state.currentIndex = state.queue.findIndex(s => s.id === song.id);
  synthTimeSec = 0;

  // Update audio element
  audio.src = song.src;
  audio.volume = state.isMuted ? 0 : state.volume;

  // Update player bar UI
  if (els.playerTitle) els.playerTitle.textContent = song.title;
  if (els.playerArtist) els.playerArtist.textContent = song.artist;
  if (els.playerThumb) {
    els.playerThumb.innerHTML = `<div class="player-thumb-art ${song.grad}" style="width:52px;height:52px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:1.5rem;">${song.emoji}</div>`;
  }

  // Update fullscreen UI
  if (els.fsTitle) els.fsTitle.textContent = song.title;
  if (els.fsArtist) els.fsArtist.textContent = song.artist;
  if (els.fsAlbum) els.fsAlbum.textContent = song.album;
  if (els.fsBg) els.fsBg.style.background = `var(--bg-card)`;

  const totalSec = parseDuration(song.duration);
  if (els.totalTime) els.totalTime.textContent = song.duration;
  if (els.fsTotalTime) els.fsTotalTime.textContent = song.duration;
  updateProgressUI(0, 0, totalSec);

  // Update favorite button
  updateFavBtn();

  // Highlight active track
  document.querySelectorAll('.track-item, .chart-item').forEach(el => {
    el.classList.toggle('playing', parseInt(el.dataset.songId) === song.id);
  });
  document.querySelectorAll('.card').forEach(el => {
    el.classList.toggle('active-card', parseInt(el.dataset.albumId) === song.id);
  });

  generateWaveform(60);

  if (autoplay) {
    state.isPlaying = true;
    setPlayPauseIcon(true);
    startWaveformAnim();

    audio.play().catch(() => {
      // If browser blocks audio or offline, start synth!
      startSynthPlayback();
    });
  } else {
    state.isPlaying = false;
    setPlayPauseIcon(false);
  }
}

function togglePlay() {
  initAudioContext();
  if (!state.currentTrack) {
    loadTrack(state.queue[0], true);
    return;
  }

  if (state.isPlaying) {
    state.isPlaying = false;
    setPlayPauseIcon(false);
    audio.pause();
    stopSynthPlayback();
  } else {
    state.isPlaying = true;
    setPlayPauseIcon(true);
    startWaveformAnim();
    audio.play().catch(() => {
      startSynthPlayback();
    });
  }
}

function prevTrack() {
  if (audio.currentTime > 3 || synthTimeSec > 3) {
    audio.currentTime = 0;
    synthTimeSec = 0;
    return;
  }
  let idx = state.isShuffle
    ? Math.floor(Math.random() * state.queue.length)
    : (state.currentIndex - 1 + state.queue.length) % state.queue.length;
  loadTrack(state.queue[idx], true);
}

function nextTrack() {
  let idx;
  if (state.isShuffle) {
    idx = Math.floor(Math.random() * state.queue.length);
  } else if (state.repeatMode === 1) {
    idx = (state.currentIndex + 1) % state.queue.length;
  } else {
    idx = state.currentIndex + 1;
    if (idx >= state.queue.length) {
      state.isPlaying = false;
      setPlayPauseIcon(false);
      audio.pause();
      stopSynthPlayback();
      return;
    }
  }
  loadTrack(state.queue[idx], true);
}

function setPlayPauseIcon(playing) {
  state.isPlaying = playing;
  const icon = playing ? 'fa-solid fa-pause' : 'fa-solid fa-play';
  if (els.playIcon) els.playIcon.className = icon;
  if (els.fsPlayIcon) els.fsPlayIcon.className = icon;
  if (els.heroDisc) els.heroDisc.classList.toggle('spinning', playing);
  if (els.fsDisc) els.fsDisc.classList.toggle('spinning', playing);
}

// ───────────────────────────────────────────────────────────
// VOLUME & SEEK
// ───────────────────────────────────────────────────────────
function setVolume(val) {
  state.volume = Math.max(0, Math.min(1, val));
  audio.volume = state.isMuted ? 0 : state.volume;
  if (synthGain) {
    synthGain.gain.value = state.isMuted ? 0 : state.volume * 0.25;
  }
  if (els.volumeSlider) els.volumeSlider.value = state.volume;
  if (els.fsVolumeSlider) els.fsVolumeSlider.value = state.volume;
  updateVolIcon();
}

function toggleMute() {
  state.isMuted = !state.isMuted;
  audio.volume = state.isMuted ? 0 : state.volume;
  if (synthGain) {
    synthGain.gain.value = state.isMuted ? 0 : state.volume * 0.25;
  }
  updateVolIcon();
}

function updateVolIcon() {
  const v = state.isMuted ? 0 : state.volume;
  const cls = v === 0 ? 'fa-solid fa-volume-xmark' :
              v < 0.4 ? 'fa-solid fa-volume-low' : 'fa-solid fa-volume-high';
  if (els.volIcon) els.volIcon.className = cls;
  if (els.muteBtn) els.muteBtn.classList.toggle('active', state.isMuted);
}

function seekTo(e, wrap) {
  if (!wrap) return;
  const rect = wrap.getBoundingClientRect();
  const pct = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
  const total = (!isUsingSynth && audio.duration) ? audio.duration : parseDuration(state.currentTrack?.duration || '3:20');

  if (!isUsingSynth && audio.duration) {
    audio.currentTime = pct * total;
  } else {
    synthTimeSec = pct * total;
  }
  updateProgressUI(pct, pct * total, total);
}

// ───────────────────────────────────────────────────────────
// SHUFFLE & REPEAT
// ───────────────────────────────────────────────────────────
function toggleShuffle() {
  state.isShuffle = !state.isShuffle;
  if (els.shuffleBtn) els.shuffleBtn.classList.toggle('active', state.isShuffle);
  if (els.fsShuffleBtn) els.fsShuffleBtn.classList.toggle('active', state.isShuffle);
  showToast(state.isShuffle ? '🔀 Shuffle On' : 'Shuffle Off');
}

function cycleRepeat() {
  state.repeatMode = (state.repeatMode + 1) % 3;
  const labels = ['Repeat Off', '🔁 Repeat All', '🔂 Repeat One'];
  const icons  = ['fa-solid fa-repeat', 'fa-solid fa-repeat', 'fa-solid fa-repeat'];
  if (els.repeatBtn) {
    els.repeatBtn.classList.toggle('active', state.repeatMode > 0);
    const i = els.repeatBtn.querySelector('i');
    if (i) i.className = icons[state.repeatMode];
  }
  if (els.fsRepeatBtn) {
    els.fsRepeatBtn.classList.toggle('active', state.repeatMode > 0);
    const i = els.fsRepeatBtn.querySelector('i');
    if (i) i.className = icons[state.repeatMode];
  }
  showToast(labels[state.repeatMode]);
}

// ───────────────────────────────────────────────────────────
// FAVORITES
// ───────────────────────────────────────────────────────────
function toggleFavorite(songId) {
  if (state.favorites.has(songId)) {
    state.favorites.delete(songId);
    showToast('💔 Removed from favorites');
  } else {
    state.favorites.add(songId);
    showToast('❤️ Added to favorites');
  }
  updateFavBtn();
  updateFavoritesPage();

  document.querySelectorAll(`.track-like-btn[data-song-id="${songId}"], .chart-like-btn[data-song-id="${songId}"]`).forEach(btn => {
    btn.classList.toggle('liked', state.favorites.has(songId));
  });
}

function updateFavBtn() {
  if (!state.currentTrack) return;
  const liked = state.favorites.has(state.currentTrack.id);
  if (els.playerFavBtn) {
    els.playerFavBtn.classList.toggle('liked', liked);
    els.playerFavBtn.innerHTML = liked ? '<i class="fa-solid fa-heart"></i>' : '<i class="fa-regular fa-heart"></i>';
  }
  if (els.heroLikeBtn) {
    els.heroLikeBtn.classList.toggle('liked', liked);
  }
}

// ───────────────────────────────────────────────────────────
// QUEUE PANEL
// ───────────────────────────────────────────────────────────
function renderQueue() {
  if (!els.queueList) return;
  els.queueList.innerHTML = state.queue.map((s, i) => `
    <div class="queue-item ${state.currentTrack?.id === s.id ? 'active' : ''}" data-idx="${i}">
      <div class="qi-thumb ${s.grad}">${s.emoji}</div>
      <div class="qi-info">
        <div class="qi-title">${s.title}</div>
        <div class="qi-artist">${s.artist}</div>
      </div>
      <div class="qi-dur">${s.duration}</div>
    </div>
  `).join('');

  els.queueList.querySelectorAll('.queue-item').forEach(el => {
    el.addEventListener('click', () => {
      loadTrack(state.queue[parseInt(el.dataset.idx)], true);
    });
  });
}

function toggleQueue() {
  if (!els.queuePanel) return;
  els.queuePanel.classList.toggle('open');
  if (els.queuePanel.classList.contains('open')) renderQueue();
}

// ───────────────────────────────────────────────────────────
// FULLSCREEN PLAYER
// ───────────────────────────────────────────────────────────
function openFullscreen() {
  if (els.fullscreenPlayer) {
    els.fullscreenPlayer.classList.add('open');
    startWaveformAnim();
  }
}

function closeFullscreen() {
  if (els.fullscreenPlayer) {
    els.fullscreenPlayer.classList.remove('open');
  }
}

// ───────────────────────────────────────────────────────────
// NAVIGATION
// ───────────────────────────────────────────────────────────
function navigateTo(page) {
  state.currentPage = page;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(`page-${page}`)?.classList.add('active');

  document.querySelectorAll('.sidebar-nav li').forEach(li => {
    li.classList.toggle('active', li.dataset.page === page);
  });

  if (page === 'favorites') updateFavoritesPage();
  if (page === 'library')   renderLibrary();
  if (page === 'artists')   renderArtistsPage();

  // Close mobile sidebar
  if (els.sidebar) els.sidebar.classList.remove('mobile-open');
  document.querySelector('.sidebar-overlay')?.classList.remove('show');
}

// ───────────────────────────────────────────────────────────
// RENDER — ALBUMS (CLICK ANYWHERE TO PLAY)
// ───────────────────────────────────────────────────────────
function renderAlbums(containerId, albumList = ALBUMS) {
  const container = $(containerId);
  if (!container || !albumList) return;
  container.innerHTML = albumList.map(album => `
    <div class="card" data-album-id="${album.id}" title="${album.title}">
      <div class="card-art ${album.grad}">
        <span style="font-size:3rem;">${album.emoji}</span>
        <div class="card-play-overlay">
          <button class="card-play-btn" data-album-id="${album.id}">
            <i class="fa-solid fa-play"></i>
          </button>
        </div>
      </div>
      <div class="card-title">${album.title}</div>
      <div class="card-sub">${album.artist} · ${album.year}</div>
    </div>
  `).join('');

  container.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => {
      const albumId = parseInt(card.dataset.albumId);
      if (!isNaN(albumId)) playAlbum(albumId);
    });
  });
}

function playAlbum(albumId) {
  const album = ALBUMS.find(a => a.id === albumId);
  if (!album) return;
  const songs = album.songs.map(id => SONGS.find(s => s.id === id)).filter(Boolean);
  if (!songs.length) return;
  state.queue = songs;
  state.currentIndex = 0;
  loadTrack(songs[0], true);
  renderQueue();
  showToast(`▶️ Playing album: ${album.title}`);
}

// ───────────────────────────────────────────────────────────
// RENDER — PLAYLISTS (CLICK ANYWHERE TO PLAY)
// ───────────────────────────────────────────────────────────
function renderPlaylists(containerId, pls = PLAYLISTS) {
  const container = $(containerId);
  if (!container || !pls) return;
  container.innerHTML = pls.map(pl => `
    <div class="card" data-playlist-id="${pl.id}" title="${pl.title}">
      <div class="card-art ${pl.grad}">
        <span style="font-size:3rem;">${pl.emoji}</span>
        <div class="card-play-overlay">
          <button class="card-play-btn" data-playlist-id="${pl.id}">
            <i class="fa-solid fa-play"></i>
          </button>
        </div>
      </div>
      <div class="card-title">${pl.title}</div>
      <div class="card-sub">${pl.desc} · ${pl.count}</div>
    </div>
  `).join('');

  container.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => {
      const pid = parseInt(card.dataset.playlistId);
      if (!isNaN(pid)) playPlaylist(pid);
    });
  });
}

function playPlaylist(pid) {
  const pl = PLAYLISTS.find(p => p.id === pid);
  if (!pl) return;
  const songs = pl.songs.map(id => SONGS.find(s => s.id === id)).filter(Boolean);
  if (!songs.length) return;
  state.queue = songs;
  state.currentIndex = 0;
  loadTrack(songs[0], true);
  renderQueue();
  showToast(`▶️ Playing playlist: ${pl.title}`);
}

// ───────────────────────────────────────────────────────────
// RENDER — ARTISTS
// ───────────────────────────────────────────────────────────
function renderArtistRow(containerId) {
  const container = $(containerId);
  if (!container || typeof ARTISTS === 'undefined') return;
  container.innerHTML = ARTISTS.map(a => `
    <div class="artist-card" data-artist-id="${a.id}" title="${a.name}">
      <div class="artist-avatar ${a.grad}">${a.emoji}</div>
      <div class="artist-name">${a.name}</div>
      <div class="artist-genre">${a.genre}</div>
    </div>
  `).join('');

  container.querySelectorAll('.artist-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = parseInt(card.dataset.artistId);
      playArtist(id);
    });
  });
}

function renderArtistsPage() {
  const container = $('artistsGrid');
  if (!container || typeof ARTISTS === 'undefined') return;
  container.innerHTML = ARTISTS.map(a => `
    <div class="artist-card" data-artist-id="${a.id}" style="min-width:auto;">
      <div class="artist-avatar ${a.grad}" style="width:110px;height:110px;">${a.emoji}</div>
      <div class="artist-name" style="font-size:0.9rem;">${a.name}</div>
      <div class="artist-genre">${a.genre}</div>
      <div style="font-size:0.72rem;color:var(--text-muted);margin-top:2px;">${a.followers} followers</div>
    </div>
  `).join('');

  container.querySelectorAll('.artist-card').forEach(card => {
    card.addEventListener('click', () => playArtist(parseInt(card.dataset.artistId)));
  });
}

function playArtist(id) {
  const artist = ARTISTS.find(a => a.id === id);
  if (!artist) return;
  const songs = artist.songs.map(sid => SONGS.find(s => s.id === sid)).filter(Boolean);
  if (!songs.length) { showToast(`No songs loaded for ${artist.name}`); return; }
  state.queue = songs;
  loadTrack(songs[0], true);
  renderQueue();
  showToast(`▶️ Playing: ${artist.name}`);
}

// ───────────────────────────────────────────────────────────
// RENDER — TRACK LIST
// ───────────────────────────────────────────────────────────
function renderTrackList(containerId, songs = SONGS, showPlays = true) {
  const container = $(containerId);
  if (!container || !songs) return;
  container.innerHTML = songs.map((s, i) => `
    <div class="track-item" data-song-id="${s.id}" data-idx="${i}">
      <div class="track-num">
        <span class="num">${i + 1}</span>
        <i class="fa-solid fa-play play-icon"></i>
      </div>
      <div class="track-thumb ${s.grad}">${s.emoji}</div>
      <div class="track-info">
        <div class="track-name">${s.title}</div>
        <div class="track-artist">${s.artist}</div>
      </div>
      ${showPlays ? `<div class="track-plays">${s.plays}</div>` : ''}
      <div class="track-duration">${s.duration}</div>
      <button class="track-like-btn ${state.favorites.has(s.id) ? 'liked' : ''}" data-song-id="${s.id}" title="Like">
        <i class="${state.favorites.has(s.id) ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
      </button>
    </div>
  `).join('');

  container.querySelectorAll('.track-item').forEach(el => {
    el.addEventListener('click', (e) => {
      if (e.target.closest('.track-like-btn')) return;
      const idx = parseInt(el.dataset.idx);
      state.queue = songs;
      state.currentIndex = idx;
      loadTrack(songs[idx], true);
      renderQueue();
    });
  });

  container.querySelectorAll('.track-like-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const songId = parseInt(btn.dataset.songId);
      toggleFavorite(songId);
      const isLiked = state.favorites.has(songId);
      btn.classList.toggle('liked', isLiked);
      btn.innerHTML = `<i class="${isLiked ? 'fa-solid' : 'fa-regular'} fa-heart"></i>`;
    });
  });
}

// ───────────────────────────────────────────────────────────
// FAVORITES PAGE
// ───────────────────────────────────────────────────────────
function updateFavoritesPage() {
  const favSongs = SONGS.filter(s => state.favorites.has(s.id));
  const empty = $('favEmptyState');
  const list = $('favoritesList');
  if (!favSongs.length) {
    if (empty) empty.style.display = 'flex';
    if (list) list.innerHTML = '';
  } else {
    if (empty) empty.style.display = 'none';
    renderTrackList('favoritesList', favSongs, false);
  }
}

// ───────────────────────────────────────────────────────────
// LIBRARY PAGE
// ───────────────────────────────────────────────────────────
function renderLibrary() {
  const tab = state.currentLibTab;
  const content = $('libraryContent');
  if (!content) return;

  if (tab === 'playlists') {
    content.innerHTML = '<div class="cards-grid" id="libPlaylists"></div>';
    renderPlaylists('libPlaylists');
  } else if (tab === 'albums') {
    content.innerHTML = '<div class="cards-grid" id="libAlbums"></div>';
    renderAlbums('libAlbums');
  } else {
    content.innerHTML = '<div class="track-list" id="libSongs"></div>';
    renderTrackList('libSongs', SONGS);
  }
}

// ───────────────────────────────────────────────────────────
// GENRES
// ───────────────────────────────────────────────────────────
function renderGenres() {
  const container = $('genreGrid');
  if (!container || typeof GENRES === 'undefined') return;
  container.innerHTML = GENRES.map(g => `
    <div class="genre-card ${g.grad}" data-genre="${g.name}">
      <i class="fa-solid fa-music"></i>
      <span>${g.emoji} ${g.name}</span>
    </div>
  `).join('');

  container.querySelectorAll('.genre-card').forEach(card => {
    card.addEventListener('click', () => {
      const genre = card.dataset.genre;
      const g = GENRES.find(x => x.name === genre);
      if (!g || !g.songs.length) { showToast(`No songs for ${genre} yet!`); return; }
      const songs = g.songs.map(id => SONGS.find(s => s.id === id)).filter(Boolean);
      state.queue = songs;
      loadTrack(songs[0], true);
      showToast(`▶️ Playing genre: ${genre}`);
    });
  });
}

function renderNewReleases() {
  if (typeof ALBUMS === 'undefined') return;
  const recent = [...ALBUMS].sort((a, b) => b.year - a.year).slice(0, 6);
  renderAlbums('newReleasesGrid', recent);
}

// ───────────────────────────────────────────────────────────
// HERO ROTATION
// ───────────────────────────────────────────────────────────
function updateHero() {
  if (typeof SONGS === 'undefined' || typeof HERO_TRACKS === 'undefined') return;
  const song = SONGS.find(s => s.id === HERO_TRACKS[state.heroIndex]);
  if (!song) return;
  if (els.heroTitle) els.heroTitle.textContent = song.title;
  if (els.heroArtist) els.heroArtist.textContent = song.artist;
}

function rotateHero() {
  if (typeof HERO_TRACKS === 'undefined') return;
  state.heroIndex = (state.heroIndex + 1) % HERO_TRACKS.length;
  updateHero();
}

// ───────────────────────────────────────────────────────────
// SEARCH
// ───────────────────────────────────────────────────────────
let searchTimeout;
els.searchInput?.addEventListener('input', () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    const q = els.searchInput.value.trim().toLowerCase();
    if (!q) {
      navigateTo('home');
      return;
    }
    const results = SONGS.filter(s =>
      s.title.toLowerCase().includes(q) ||
      s.artist.toLowerCase().includes(q) ||
      s.album.toLowerCase().includes(q)
    );
    showSearchResults(results, q);
  }, 250);
});

function showSearchResults(results, query) {
  navigateTo('home');
  const existing = $('searchResultsSection');
  if (existing) existing.remove();

  if (!results.length) {
    showToast(`No results found for "${query}"`);
    return;
  }

  const section = document.createElement('section');
  section.className = 'content-section';
  section.id = 'searchResultsSection';
  section.innerHTML = `
    <div class="section-header">
      <h2>🔍 Results for "${query}"</h2>
      <a href="#" class="see-all" id="clearSearch">Clear</a>
    </div>
    <div class="track-list" id="searchResults"></div>
  `;
  document.getElementById('page-home')?.prepend(section);
  renderTrackList('searchResults', results, false);
  $('clearSearch')?.addEventListener('click', (e) => {
    e.preventDefault();
    section.remove();
    els.searchInput.value = '';
  });
}

// ───────────────────────────────────────────────────────────
// SIDEBAR PLAYLIST CLICKS
// ───────────────────────────────────────────────────────────
document.querySelectorAll('.playlist-item').forEach(item => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.playlist-item').forEach(i => i.classList.remove('active-playlist'));
    item.classList.add('active-playlist');
    const pid = parseInt(item.dataset.playlist);
    playPlaylist(pid);
  });
});

// Library Tabs
document.querySelectorAll('.lib-tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.lib-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.currentLibTab = btn.dataset.tab;
    renderLibrary();
  });
});

// ───────────────────────────────────────────────────────────
// PLAYER BAR EVENT LISTENERS
// ───────────────────────────────────────────────────────────
els.playPauseBtn?.addEventListener('click', togglePlay);
els.prevBtn?.addEventListener('click', prevTrack);
els.nextBtn?.addEventListener('click', nextTrack);
els.shuffleBtn?.addEventListener('click', toggleShuffle);
els.repeatBtn?.addEventListener('click', cycleRepeat);
els.muteBtn?.addEventListener('click', toggleMute);
els.queueBtn?.addEventListener('click', toggleQueue);
els.closeQueue?.addEventListener('click', () => els.queuePanel?.classList.remove('open'));
els.fullscreenBtn?.addEventListener('click', openFullscreen);
els.fsClose?.addEventListener('click', closeFullscreen);
els.playerFavBtn?.addEventListener('click', () => state.currentTrack && toggleFavorite(state.currentTrack.id));

// Volume Slider
els.volumeSlider?.addEventListener('input', e => setVolume(parseFloat(e.target.value)));
els.fsVolumeSlider?.addEventListener('input', e => setVolume(parseFloat(e.target.value)));

// Progress Seek
els.progressBarWrap?.addEventListener('click', e => seekTo(e, els.progressBarWrap));
els.fsProgressWrap?.addEventListener('click', e => seekTo(e, els.fsProgressWrap));

// Waveform seek
els.waveformCanvas?.addEventListener('click', e => {
  const rect = els.waveformCanvas.getBoundingClientRect();
  const pct = (e.clientX - rect.left) / rect.width;
  const total = (!isUsingSynth && audio.duration) ? audio.duration : parseDuration(state.currentTrack?.duration || '3:20');
  if (!isUsingSynth && audio.duration) {
    audio.currentTime = pct * total;
  } else {
    synthTimeSec = pct * total;
  }
  updateProgressUI(pct, pct * total, total);
});

// Fullscreen controls
els.fsPlayBtn?.addEventListener('click', togglePlay);
els.fsPrevBtn?.addEventListener('click', prevTrack);
els.fsNextBtn?.addEventListener('click', nextTrack);
els.fsShuffleBtn?.addEventListener('click', toggleShuffle);
els.fsRepeatBtn?.addEventListener('click', cycleRepeat);
els.playerThumb?.addEventListener('click', openFullscreen);

// Hero Actions
els.heroPlayBtn?.addEventListener('click', () => {
  const song = SONGS.find(s => s.id === HERO_TRACKS[state.heroIndex]);
  if (song) {
    state.queue = [...SONGS];
    loadTrack(song, true);
    renderQueue();
  }
});
els.heroLikeBtn?.addEventListener('click', () => {
  const song = SONGS.find(s => s.id === HERO_TRACKS[state.heroIndex]);
  if (song) toggleFavorite(song.id);
});

// Sidebar Nav
document.querySelectorAll('.sidebar-nav li').forEach(li => {
  li.addEventListener('click', () => navigateTo(li.dataset.page));
});

// Mobile Hamburger
els.hamburgerBtn?.addEventListener('click', () => {
  els.sidebar?.classList.toggle('mobile-open');
  let overlay = document.querySelector('.sidebar-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);
    overlay.addEventListener('click', () => {
      els.sidebar?.classList.remove('mobile-open');
      overlay.classList.remove('show');
    });
  }
  overlay.classList.toggle('show', els.sidebar?.classList.contains('mobile-open'));
});

// Keyboard Shortcuts
document.addEventListener('keydown', e => {
  const tag = e.target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA') return;

  switch(e.code) {
    case 'Space': e.preventDefault(); togglePlay(); break;
    case 'ArrowLeft':
      e.preventDefault();
      if (!isUsingSynth && audio.duration) {
        audio.currentTime = Math.max(0, audio.currentTime - 10);
      } else {
        synthTimeSec = Math.max(0, synthTimeSec - 10);
      }
      break;
    case 'ArrowRight':
      e.preventDefault();
      if (!isUsingSynth && audio.duration) {
        audio.currentTime = Math.min(audio.duration, audio.currentTime + 10);
      } else {
        synthTimeSec = Math.min(parseDuration(state.currentTrack?.duration || '3:20'), synthTimeSec + 10);
      }
      break;
    case 'ArrowUp':
      e.preventDefault();
      setVolume(Math.min(1, state.volume + 0.1));
      break;
    case 'ArrowDown':
      e.preventDefault();
      setVolume(Math.max(0, state.volume - 0.1));
      break;
    case 'KeyN': nextTrack(); break;
    case 'KeyP': prevTrack(); break;
    case 'KeyS': toggleShuffle(); break;
    case 'KeyR': cycleRepeat(); break;
    case 'KeyM': toggleMute(); break;
    case 'KeyL': state.currentTrack && toggleFavorite(state.currentTrack.id); break;
    case 'KeyF':
      if (!els.fullscreenPlayer?.classList.contains('open')) openFullscreen();
      else closeFullscreen();
      break;
    case 'KeyQ': toggleQueue(); break;
    case 'Escape': closeFullscreen(); break;
  }
});

// Toast
let toastTimeout;
function showToast(msg) {
  clearTimeout(toastTimeout);
  if (!els.toast) return;
  els.toast.textContent = msg;
  els.toast.classList.add('show');
  toastTimeout = setTimeout(() => els.toast.classList.remove('show'), 2200);
}

function formatTime(sec) {
  if (!sec || isNaN(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// Drag Seek
let isDraggingProgress = false;
[els.progressBarWrap, els.fsProgressWrap].forEach(wrap => {
  wrap?.addEventListener('mousedown', (e) => {
    isDraggingProgress = true;
    seekTo(e, wrap);
  });
});

document.addEventListener('mousemove', (e) => {
  if (!isDraggingProgress) return;
  const wrap = els.fullscreenPlayer?.classList.contains('open') ? els.fsProgressWrap : els.progressBarWrap;
  seekTo(e, wrap);
});

document.addEventListener('mouseup', () => { isDraggingProgress = false; });

// ───────────────────────────────────────────────────────────
// INIT
// ───────────────────────────────────────────────────────────
function init() {
  renderAlbums('albumsGrid');
  renderArtistRow('trendingArtists');
  renderPlaylists('playlistsGrid');
  renderTrackList('recentlyPlayed', SONGS.slice(0, 8));
  renderGenres();
  renderNewReleases();
  updateHero();

  audio.volume = state.volume;

  generateWaveform(60);
  drawWaveform(els.waveformCanvas, 0, false, 60);
  drawWaveform(els.fsWaveform, 0, false, 80);

  loadTrack(SONGS[0], false);
  setInterval(rotateHero, 5000);

  state.queue = [...SONGS];
  renderQueue();

  console.log('🎵 SoundWave is ready! Click any track, card, or button to play.');
}

document.addEventListener('DOMContentLoaded', init);

/* ══════════════════════════════════════════════════════════
   SoundWave — Features & Enhancements
   Settings · Themes · EQ · Charts · Stats · Moods · Lyrics · Context Menu
══════════════════════════════════════════════════════════ */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

  // ─────────────────────────────────────────────────────────
  // 1. SETTINGS & PREFERENCES (LOCALSTORAGE)
  // ─────────────────────────────────────────────────────────
  const defaultSettings = {
    theme: 'dark',
    accent: 'purple',
    crossfade: 0,
    speed: 1,
    autoplay: true,
    normalize: false,
    eqPreset: 'flat',
  };

  let userSettings = { ...defaultSettings };
  try {
    const saved = localStorage.getItem('soundwave_settings');
    if (saved) userSettings = { ...defaultSettings, ...JSON.parse(saved) };
  } catch (e) {}

  function applySettings() {
    // Theme
    if (userSettings.theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
    document.querySelectorAll('.theme-opt').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.theme === userSettings.theme);
    });

    // Accent
    if (userSettings.accent === 'purple') {
      document.body.removeAttribute('data-accent');
    } else {
      document.body.setAttribute('data-accent', userSettings.accent);
    }
    document.querySelectorAll('.swatch').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.color === userSettings.accent);
    });

    // Speed
    const audio = document.getElementById('audioPlayer');
    if (audio) audio.playbackRate = userSettings.speed;
    const speedVal = document.getElementById('speedVal');
    const speedSlider = document.getElementById('speedSlider');
    if (speedVal) speedVal.textContent = userSettings.speed + '×';
    if (speedSlider) speedSlider.value = userSettings.speed;

    // Crossfade
    const crossVal = document.getElementById('crossfadeVal');
    const crossSlider = document.getElementById('crossfadeSlider');
    if (crossVal) crossVal.textContent = userSettings.crossfade + 's';
    if (crossSlider) crossSlider.value = userSettings.crossfade;

    // Autoplay
    const autoToggle = document.getElementById('autoplayToggle');
    if (autoToggle) autoToggle.checked = userSettings.autoplay;

    // Normalize
    const normToggle = document.getElementById('normalizeToggle');
    if (normToggle) normToggle.checked = userSettings.normalize;
  }

  function saveSettings() {
    try {
      localStorage.setItem('soundwave_settings', JSON.stringify(userSettings));
    } catch (e) {}
  }

  applySettings();

  // Settings Modal Open/Close
  const settingsModal = document.getElementById('settingsModal');
  const openSettingsBtns = [document.getElementById('settingsBtn'), document.getElementById('sidebarSettingsBtn')];
  const closeSettings = document.getElementById('closeSettings');

  openSettingsBtns.forEach(btn => {
    btn?.addEventListener('click', (e) => {
      e.stopPropagation();
      settingsModal?.classList.add('open');
    });
  });

  closeSettings?.addEventListener('click', () => settingsModal?.classList.remove('open'));
  settingsModal?.addEventListener('click', (e) => {
    if (e.target === settingsModal) settingsModal.classList.remove('open');
  });

  // Theme click
  document.querySelectorAll('.theme-opt').forEach(btn => {
    btn.addEventListener('click', () => {
      userSettings.theme = btn.dataset.theme;
      applySettings();
      saveSettings();
    });
  });

  // Accent click
  document.querySelectorAll('.swatch').forEach(btn => {
    btn.addEventListener('click', () => {
      userSettings.accent = btn.dataset.color;
      applySettings();
      saveSettings();
    });
  });

  // Speed slider
  const speedSlider = document.getElementById('speedSlider');
  speedSlider?.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    userSettings.speed = val;
    const speedVal = document.getElementById('speedVal');
    if (speedVal) speedVal.textContent = val + '×';
    const audio = document.getElementById('audioPlayer');
    if (audio) audio.playbackRate = val;
    saveSettings();
  });

  // Crossfade slider
  const crossSlider = document.getElementById('crossfadeSlider');
  crossSlider?.addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    userSettings.crossfade = val;
    const crossVal = document.getElementById('crossfadeVal');
    if (crossVal) crossVal.textContent = val + 's';
    saveSettings();
  });

  // Autoplay toggle
  document.getElementById('autoplayToggle')?.addEventListener('change', (e) => {
    userSettings.autoplay = e.target.checked;
    saveSettings();
  });

  // Normalize toggle
  document.getElementById('normalizeToggle')?.addEventListener('change', (e) => {
    userSettings.normalize = e.target.checked;
    saveSettings();
  });

  // Equalizer Bands UI
  const eqSliders = document.getElementById('eqSliders');
  if (eqSliders) {
    const bands = ['60Hz', '250Hz', '1kHz', '4kHz', '16kHz'];
    eqSliders.innerHTML = bands.map(b => `
      <div class="eq-band">
        <input type="range" min="-12" max="12" value="0" step="1" />
        <label>${b}</label>
      </div>
    `).join('');
  }

  // EQ Presets
  const presets = {
    flat:   [0, 0, 0, 0, 0],
    bass:   [8, 5, 1, 0, -2],
    treble: [-2, 0, 2, 6, 9],
    vocal:  [-3, 2, 6, 4, 1],
    rock:   [6, 3, -1, 4, 7],
  };

  document.querySelectorAll('.eq-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.eq-preset').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const p = presets[btn.dataset.preset];
      if (p && eqSliders) {
        const inputs = eqSliders.querySelectorAll('input');
        p.forEach((val, i) => { if (inputs[i]) inputs[i].value = val; });
      }
    });
  });

  // Sleep Timer
  let sleepInterval = null;
  let sleepRemaining = 0;
  const sleepStatus = document.getElementById('sleepStatus');
  const sleepCountdown = document.getElementById('sleepCountdown');

  document.querySelectorAll('.sleep-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sleep-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const min = parseInt(btn.dataset.min);
      clearInterval(sleepInterval);

      if (min === 0) {
        if (sleepStatus) sleepStatus.style.display = 'none';
        if (typeof showToast === 'function') showToast('Sleep timer turned off');
        return;
      }

      sleepRemaining = min * 60;
      if (sleepStatus) sleepStatus.style.display = 'flex';
      updateSleepDisplay();
      if (typeof showToast === 'function') showToast(`Sleep timer set for ${min} minutes`);

      sleepInterval = setInterval(() => {
        sleepRemaining--;
        updateSleepDisplay();
        if (sleepRemaining <= 0) {
          clearInterval(sleepInterval);
          const audio = document.getElementById('audioPlayer');
          if (audio) audio.pause();
          if (sleepStatus) sleepStatus.style.display = 'none';
          document.querySelectorAll('.sleep-btn').forEach(b => b.classList.remove('active'));
          if (typeof showToast === 'function') showToast('😴 Sleep timer ended. Music paused.');
        }
      }, 1000);
    });
  });

  function updateSleepDisplay() {
    if (!sleepCountdown) return;
    const m = Math.floor(sleepRemaining / 60);
    const s = sleepRemaining % 60;
    sleepCountdown.textContent = `Stopping in ${m}:${s.toString().padStart(2, '0')}`;
  }

  // ─────────────────────────────────────────────────────────
  // 2. NOTIFICATIONS PANEL
  // ─────────────────────────────────────────────────────────
  const notifs = [
    { id: 1, title: 'New Album Dropped!', desc: 'The Weeknd just released "Dawn FM"', time: '10m ago', unread: true, icon: 'fa-compact-disc', grad: 'grad-purple' },
    { id: 2, title: 'Trending Track', desc: 'Blinding Lights crossed 2.5 Billion plays!', time: '1h ago', unread: true, icon: 'fa-fire', grad: 'grad-orange' },
    { id: 3, title: 'Curated For You', desc: 'New "Focus Mode" playlist recommended', time: '5h ago', unread: true, icon: 'fa-sparkles', grad: 'grad-cyan' },
    { id: 4, title: 'Artist Update', desc: 'Dua Lipa announced new world tour dates', time: '1d ago', unread: false, icon: 'fa-microphone', grad: 'grad-pink' },
  ];

  const notifPanel = document.getElementById('notifPanel');
  const notifBtn = document.getElementById('notifBtn');
  const closeNotif = document.getElementById('closeNotif');
  const notifList = document.getElementById('notifList');
  const notifBadge = document.getElementById('notifBadge');
  const markAllRead = document.getElementById('markAllRead');

  function renderNotifs() {
    if (!notifList) return;
    notifList.innerHTML = notifs.map(n => `
      <div class="notif-item ${n.unread ? 'unread' : ''}" data-id="${n.id}">
        <div class="notif-icon ${n.grad}"><i class="fa-solid ${n.icon}"></i></div>
        <div class="notif-text">
          <div class="notif-title">${n.title}</div>
          <div class="notif-desc">${n.desc}</div>
          <div class="notif-time">${n.time}</div>
        </div>
        ${n.unread ? '<div class="notif-dot"></div>' : ''}
      </div>
    `).join('');

    const unreadCount = notifs.filter(n => n.unread).length;
    if (notifBadge) {
      notifBadge.textContent = unreadCount;
      notifBadge.style.display = unreadCount > 0 ? 'flex' : 'none';
    }
  }

  renderNotifs();

  notifBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    notifPanel?.classList.toggle('open');
  });

  closeNotif?.addEventListener('click', () => notifPanel?.classList.remove('open'));

  markAllRead?.addEventListener('click', () => {
    notifs.forEach(n => n.unread = false);
    renderNotifs();
    if (typeof showToast === 'function') showToast('All notifications marked as read');
  });

  // ─────────────────────────────────────────────────────────
  // 3. CONTEXT MENU & SONG INFO
  // ─────────────────────────────────────────────────────────
  const contextMenu = document.getElementById('contextMenu');
  const songInfoModal = document.getElementById('songInfoModal');
  const closeSongInfo = document.getElementById('closeSongInfo');
  const songInfoBody = document.getElementById('songInfoBody');
  let selectedSong = null;

  document.addEventListener('contextmenu', (e) => {
    const trackItem = e.target.closest('.track-item, .chart-item');
    if (!trackItem) {
      contextMenu?.classList.remove('open');
      return;
    }
    e.preventDefault();
    const songId = parseInt(trackItem.dataset.songId);
    if (typeof SONGS !== 'undefined') {
      selectedSong = SONGS.find(s => s.id === songId) || null;
    }

    if (contextMenu) {
      contextMenu.style.left = `${Math.min(e.clientX, window.innerWidth - 210)}px`;
      contextMenu.style.top = `${Math.min(e.clientY, window.innerHeight - 250)}px`;
      contextMenu.classList.add('open');
    }
  });

  document.addEventListener('click', (e) => {
    if (!contextMenu?.contains(e.target)) {
      contextMenu?.classList.remove('open');
    }
  });

  document.getElementById('ctxPlay')?.addEventListener('click', () => {
    if (selectedSong && typeof loadTrack === 'function') {
      loadTrack(selectedSong);
    }
    contextMenu?.classList.remove('open');
  });

  document.getElementById('ctxQueue')?.addEventListener('click', () => {
    if (selectedSong && typeof state !== 'undefined') {
      state.queue.push(selectedSong);
      if (typeof renderQueue === 'function') renderQueue();
      if (typeof showToast === 'function') showToast(`Added "${selectedSong.title}" to queue`);
    }
    contextMenu?.classList.remove('open');
  });

  document.getElementById('ctxLike')?.addEventListener('click', () => {
    if (selectedSong && typeof toggleFavorite === 'function') {
      toggleFavorite(selectedSong.id);
    }
    contextMenu?.classList.remove('open');
  });

  document.getElementById('ctxPlaylist')?.addEventListener('click', () => {
    if (selectedSong && typeof showToast === 'function') {
      showToast(`Added "${selectedSong.title}" to Chill Vibes`);
    }
    contextMenu?.classList.remove('open');
  });

  document.getElementById('ctxShare')?.addEventListener('click', () => {
    if (selectedSong) {
      navigator.clipboard?.writeText(window.location.href);
      if (typeof showToast === 'function') showToast('🔗 Song link copied to clipboard!');
    }
    contextMenu?.classList.remove('open');
  });

  document.getElementById('ctxInfo')?.addEventListener('click', () => {
    contextMenu?.classList.remove('open');
    if (selectedSong && songInfoBody && songInfoModal) {
      songInfoBody.innerHTML = `
        <div class="song-info-art ${selectedSong.grad}">${selectedSong.emoji}</div>
        <div class="song-info-row"><span>Title</span><span>${selectedSong.title}</span></div>
        <div class="song-info-row"><span>Artist</span><span>${selectedSong.artist}</span></div>
        <div class="song-info-row"><span>Album</span><span>${selectedSong.album}</span></div>
        <div class="song-info-row"><span>Duration</span><span>${selectedSong.duration}</span></div>
        <div class="song-info-row"><span>Total Plays</span><span>${selectedSong.plays}</span></div>
      `;
      songInfoModal.classList.add('open');
    }
  });

  closeSongInfo?.addEventListener('click', () => songInfoModal?.classList.remove('open'));
  songInfoModal?.addEventListener('click', (e) => {
    if (e.target === songInfoModal) songInfoModal.classList.remove('open');
  });

  // ─────────────────────────────────────────────────────────
  // 4. MOOD SECTION
  // ─────────────────────────────────────────────────────────
  const moods = [
    { label: 'Happy', emoji: '😊', playlistId: 1 },
    { label: 'Chill', emoji: '😌', playlistId: 0 },
    { label: 'Energetic', emoji: '⚡', playlistId: 1 },
    { label: 'Focus', emoji: '🎯', playlistId: 3 },
    { label: 'Late Night', emoji: '🌙', playlistId: 2 },
    { label: 'Party', emoji: '🎉', playlistId: 1 },
    { label: 'Relaxed', emoji: '🌿', playlistId: 0 },
    { label: 'Deep Work', emoji: '🎧', playlistId: 3 },
  ];

  const moodGrid = document.getElementById('moodGrid');
  if (moodGrid) {
    moodGrid.innerHTML = moods.map(m => `
      <div class="mood-card" data-playlist="${m.playlistId}">
        <span>${m.emoji}</span>
        <div>${m.label}</div>
      </div>
    `).join('');

    moodGrid.querySelectorAll('.mood-card').forEach(card => {
      card.addEventListener('click', () => {
        moodGrid.querySelectorAll('.mood-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        const pid = parseInt(card.dataset.playlist);
        if (typeof playPlaylist === 'function') playPlaylist(pid);
      });
    });
  }

  // ─────────────────────────────────────────────────────────
  // 5. CHARTS PAGE
  // ─────────────────────────────────────────────────────────
  function renderCharts(filter = 'global') {
    const chartsTrackList = document.getElementById('chartsTrackList');
    if (!chartsTrackList || typeof SONGS === 'undefined') return;

    let list = [...SONGS];
    if (filter === 'trending') {
      list.reverse();
    } else if (filter === 'viral') {
      list.sort((a, b) => b.id - a.id);
    }

    chartsTrackList.innerHTML = list.map((s, idx) => {
      const rank = idx + 1;
      const rankClass = rank === 1 ? 'top1' : rank === 2 ? 'top2' : rank === 3 ? 'top3' : '';
      const trends = ['up', 'down', 'same'];
      const trend = trends[idx % 3];
      const trendIcon = trend === 'up' ? 'fa-arrow-up' : trend === 'down' ? 'fa-arrow-down' : 'fa-minus';
      const isLiked = typeof state !== 'undefined' && state.favorites.has(s.id);

      return `
        <div class="chart-item" data-song-id="${s.id}" data-idx="${idx}">
          <div class="chart-rank-box">
            <span class="chart-rank ${rankClass}">${rank}</span>
            <span class="chart-trend ${trend}"><i class="fa-solid ${trendIcon}"></i></span>
          </div>
          <div class="chart-thumb ${s.grad}">${s.emoji}</div>
          <div class="chart-info">
            <div class="chart-name">${s.title}</div>
            <div class="chart-artist">${s.artist}</div>
          </div>
          <div class="chart-plays">${s.plays}</div>
          <div class="chart-duration">${s.duration}</div>
          <button class="chart-like-btn ${isLiked ? 'liked' : ''}" data-song-id="${s.id}" title="Like">
            <i class="${isLiked ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
          </button>
        </div>
      `;
    }).join('');

    chartsTrackList.querySelectorAll('.chart-item').forEach(item => {
      item.addEventListener('click', (e) => {
        if (e.target.closest('.chart-like-btn')) return;
        const songId = parseInt(item.dataset.songId);
        const song = SONGS.find(s => s.id === songId);
        if (song && typeof loadTrack === 'function') {
          if (typeof state !== 'undefined') state.queue = list;
          loadTrack(song);
        }
      });
    });

    chartsTrackList.querySelectorAll('.chart-like-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const songId = parseInt(btn.dataset.songId);
        if (typeof toggleFavorite === 'function') {
          toggleFavorite(songId);
          const liked = typeof state !== 'undefined' && state.favorites.has(songId);
          btn.classList.toggle('liked', liked);
          btn.innerHTML = `<i class="${liked ? 'fa-solid' : 'fa-regular'} fa-heart"></i>`;
        }
      });
    });
  }

  document.querySelectorAll('.chart-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.chart-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderCharts(tab.dataset.chart);
    });
  });

  // ─────────────────────────────────────────────────────────
  // 6. STATS PAGE CHARTS & NUMBERS
  // ─────────────────────────────────────────────────────────
  let statsMinutes = 142;
  let statsTracks = 38;

  function updateStats() {
    const elMin = document.getElementById('statMinutes');
    const elTracks = document.getElementById('statTracks');
    const elFav = document.getElementById('statFavArtist');
    const elGenre = document.getElementById('statTopGenre');

    if (elMin) elMin.textContent = statsMinutes.toLocaleString();
    if (elTracks) elTracks.textContent = statsTracks.toLocaleString();
    if (elFav && typeof ARTISTS !== 'undefined' && ARTISTS.length > 0) elFav.textContent = ARTISTS[0].name;
    if (elGenre) elGenre.textContent = 'Synthpop / R&B';

    // Top Tracks
    const topTracks = document.getElementById('statsTopTracks');
    if (topTracks && typeof SONGS !== 'undefined') {
      topTracks.innerHTML = SONGS.slice(0, 5).map((s, i) => `
        <div class="stats-top-item">
          <div class="stats-top-rank">${i + 1}</div>
          <div class="stats-top-art ${s.grad}">${s.emoji}</div>
          <div class="stats-top-info">
            <div class="stats-top-name">${s.title}</div>
            <div class="stats-top-sub">${s.artist}</div>
          </div>
          <div style="font-size:0.75rem;color:var(--text-secondary);font-weight:600;">${s.plays}</div>
        </div>
      `).join('');
    }

    // Top Artists
    const topArtists = document.getElementById('statsTopArtists');
    if (topArtists && typeof ARTISTS !== 'undefined') {
      topArtists.innerHTML = ARTISTS.slice(0, 5).map((a, i) => `
        <div class="stats-top-item">
          <div class="stats-top-rank">${i + 1}</div>
          <div class="stats-top-art ${a.grad}">${a.emoji}</div>
          <div class="stats-top-info">
            <div class="stats-top-name">${a.name}</div>
            <div class="stats-top-sub">${a.genre}</div>
          </div>
          <div style="font-size:0.75rem;color:var(--text-secondary);font-weight:600;">${a.followers}</div>
        </div>
      `).join('');
    }

    drawWeeklyChart();
    drawGenreChart();
  }

  function drawWeeklyChart() {
    const canvas = document.getElementById('weeklyCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.parentElement.clientWidth || 300;
    canvas.height = 180;

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const values = [25, 40, 18, 55, 62, 85, 70];
    const maxVal = 100;
    const W = canvas.width;
    const H = canvas.height;
    const barW = Math.min(32, (W - 40) / days.length - 12);

    ctx.clearRect(0, 0, W, H);

    days.forEach((day, i) => {
      const x = 30 + i * ((W - 50) / days.length);
      const barH = (values[i] / maxVal) * (H - 50);
      const y = H - 30 - barH;

      // Bar
      const grad = ctx.createLinearGradient(0, y, 0, H - 30);
      grad.addColorStop(0, '#9d5ff5');
      grad.addColorStop(1, '#7c3aed');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x, y, barW, barH, 4);
      ctx.fill();

      // Text
      ctx.fillStyle = '#9898b2';
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(day, x + barW / 2, H - 10);
    });
  }

  function drawGenreChart() {
    const canvas = document.getElementById('genreCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.parentElement.clientWidth || 200;
    canvas.height = 180;

    const genres = [
      { name: 'Pop', pct: 0.35, color: '#7c3aed' },
      { name: 'R&B', pct: 0.25, color: '#ec4899' },
      { name: 'Indie', pct: 0.20, color: '#06b6d4' },
      { name: 'Electro', pct: 0.20, color: '#22c55e' },
    ];

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const radius = Math.min(cx, cy) - 20;
    let startAngle = 0;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    genres.forEach(g => {
      const sliceAngle = g.pct * 2 * Math.PI;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, startAngle, startAngle + sliceAngle);
      ctx.arc(cx, cy, radius * 0.55, startAngle + sliceAngle, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = g.color;
      ctx.fill();
      startAngle += sliceAngle;
    });

    // Center hole text
    ctx.fillStyle = '#f0f0f8';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Genres', cx, cy);
  }

  // Hook navigation to render charts/stats when clicked
  document.querySelectorAll('.sidebar-nav li').forEach(li => {
    li.addEventListener('click', () => {
      if (li.dataset.page === 'charts') renderCharts();
      if (li.dataset.page === 'stats') updateStats();
    });
  });

  // Increment stats on track play
  const audio = document.getElementById('audioPlayer');
  audio?.addEventListener('play', () => {
    statsTracks++;
    updateStats();
  });

  // ─────────────────────────────────────────────────────────
  // 7. SYNCED LYRICS (FULLSCREEN)
  // ─────────────────────────────────────────────────────────
  const sampleLyrics = [
    { t: 0,  text: "♪ (Intro vibes playing...)" },
    { t: 6,  text: "Yeah, I've been waiting for this moment all night" },
    { t: 12, text: "The city lights are reflecting in your eyes" },
    { t: 18, text: "Can you feel the rhythm beating in your chest?" },
    { t: 24, text: "Leave the worries behind, let music do the rest" },
    { t: 30, text: "Ooh, blinded by the night, blinded by the sound" },
    { t: 36, text: "When the beat drops, we never touch the ground" },
    { t: 42, text: "Lost in the melody, caught up in the groove" },
    { t: 48, text: "There's nothing left to lose, just let your body move" },
    { t: 55, text: "♪ (Synth solo & electric beats...)" },
    { t: 65, text: "Yeah, we are glowing under neon skies" },
    { t: 72, text: "Sound waves washing over, keeping us alive" },
    { t: 80, text: "Don't let the music stop until the morning rise" },
  ];

  const lyricsToggleBtn = document.getElementById('lyricsToggleBtn');
  const lyricsPanel = document.getElementById('lyricsPanel');
  const lyricsContent = document.getElementById('lyricsContent');

  if (lyricsContent) {
    lyricsContent.innerHTML = sampleLyrics.map((l, i) => `
      <div class="lyric-line ${i === 0 ? 'active' : ''}" data-time="${l.t}">${l.text}</div>
    `).join('');

    lyricsContent.querySelectorAll('.lyric-line').forEach(line => {
      line.addEventListener('click', () => {
        const t = parseFloat(line.dataset.time);
        if (audio && audio.duration) audio.currentTime = t;
      });
    });
  }

  lyricsToggleBtn?.addEventListener('click', () => {
    lyricsToggleBtn.classList.toggle('active');
    lyricsPanel?.classList.toggle('open');
  });

  audio?.addEventListener('timeupdate', () => {
    if (!audio.duration || !lyricsContent) return;
    const cur = audio.currentTime;
    let activeIdx = 0;
    for (let i = 0; i < sampleLyrics.length; i++) {
      if (cur >= sampleLyrics[i].t) activeIdx = i;
    }
    const lines = lyricsContent.querySelectorAll('.lyric-line');
    lines.forEach((line, i) => {
      if (i === activeIdx) {
        if (!line.classList.contains('active')) {
          line.classList.add('active');
          line.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else {
        line.classList.remove('active');
      }
    });
  });

  // Initial stats & charts render
  renderCharts();
  updateStats();
});


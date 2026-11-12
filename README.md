# 🎵 SoundWave — Full-Featured Music Streaming Platform

A complete, modern, interactive streaming music platform built with vanilla HTML5, CSS3, and JavaScript.

---

## 🚀 Key Fixes & Enhancements

### 🖱️ Mouse & Interaction Fixes
- **Smooth Mouse Wheel Scrolling**: Converted the layout to a flexible viewport container (`flex: 1; height: calc(100vh - var(--player-h)); overflow-y: auto;`) so mouse wheel scrolling works across all pages.
- **Universal Click-to-Play**: Clicking anywhere on album cards, playlist cards, artist circles, or track rows initiates playback.
- **Zero Overlay Blocking**: All off-screen panels (fullscreen player, queue drawer, settings modal, song info modal, context menu) use `pointer-events: none` and `visibility: hidden` when closed, preventing invisible elements from intercepting mouse clicks.
- **Direct Seek & Drag**: Click and drag on the waveform or progress bar to scrub through audio.
- **Built-in Web Audio API Synthesizer**: If an external audio sample encounters network latency or CORS restrictions, a native Web Audio synth generates harmonious chords and beats, keeping playback, progress bars, vinyl disc spins, and waveform animations responsive.

---

## 🌟 Complete Feature List

### 1. 🎧 Persistent Audio Player Bar (Fixed Bottom)
- **Controls**: Play/Pause, Previous, Next, Shuffle, Repeat (Off, Repeat All, Repeat One), Mute, Volume Slider.
- **HTML5 Audio Events**: Integrates `timeupdate`, `ended`, `loadedmetadata`, `play`, `pause`, and `error`.
- **Canvas Waveform Visualizer**: Live animated reactive waveform canvas responding to playback.
- **Clickable / Draggable Progress Bar**: Interactive scrub bar with live time formatting (`mm:ss`).

### 2. 🎛️ Settings Modal (`#settingsBtn` / Sidebar)
- **Appearance**: Toggle Dark Mode & Light Mode; choose from 6 Accent Color Themes (Purple, Blue, Pink, Green, Orange, Cyan).
- **Playback Controls**: Playback Speed slider (0.5× to 2× linked to `audio.playbackRate`), Crossfade slider, Autoplay toggle, Volume normalization.
- **5-Band Equalizer**: 60Hz, 250Hz, 1kHz, 4kHz, 16kHz sliders with quick presets (Flat, Bass Boost, Treble, Vocal, Rock).
- **Sleep Timer**: Auto-shutoff timer (15, 30, 45, 60 minutes or Off) with a live countdown display.
- **Local Persistence**: User preferences automatically persist in `localStorage`.

### 3. 📑 7 Complete Pages (SPA Navigation)
1. **Home**: Hero banner with rotating trending tracks & vinyl disc, mood recommendations, featured albums, trending artists, curated playlists, recently played list.
2. **Explore**: 12 genre cards (Pop, Hip-Hop, R&B, Electronic, Indie, K-Pop, Rock, Jazz, etc.) with click-to-play genre playlists + new releases.
3. **Library**: Tabbed interface switching between Playlists, Albums, and All Songs.
4. **Artists**: Artist directory with profile photos, genres, and follower counts.
5. **Favorites (❤️)**: Dedicated list of liked tracks with empty-state guidance.
6. **Charts (🏆)**: Ranked Billboard-style top tracks with Global, Trending, and Viral tabs, rank badges (#1 gold, #2 silver, #3 bronze), and trend indicators.
7. **My Stats (📊)**: Listening dashboard showing total minutes listened, tracks played, favorite artist, Canvas weekly listening bar chart, and Canvas genre donut breakdown.

### 4. 🎭 "How are you feeling?" Mood Recommendations
- Instant mood cards: **Happy**, **Chill**, **Energetic**, **Focus**, **Late Night**, **Party**, **Relaxed**, **Deep Work**.
- Selecting a mood highlights the card and triggers tailored curated playlists.

### 5. 🎤 Fullscreen Player & Synced Lyrics
- Expandable player with spinning vinyl disc, album artwork, and waveform visualizer.
- **Synced Lyrics Panel**: Interactive lyric lines highlighting in sync with track progress. Click any lyric to jump directly to that timestamp.

### 6. 🖱️ Right-Click Context Menu
- Right-click any track or chart item to open a quick-action menu:
  - ▶️ Play Now
  - ➕ Add to Queue
  - ❤️ Add to Favorites
  - 🎶 Add to Playlist
  - 🔗 Copy Share Link
  - ℹ️ Song Info (opens modal with artwork, album, duration, and streams)

### 7. 🔔 Notifications Panel
- Slide-out notification feed tracking new releases, trending milestones, and playlist updates.
- "Mark all read" button with an active notification badge counter in the top bar.

### 8. 🔍 Real-Time Search
- Dynamic search bar filtering tracks, artists, and albums with a 250ms debounce and a one-click "Clear" button.

### 9. ⌨️ Keyboard Shortcuts
| Key | Action |
|---|---|
| `Space` | Play / Pause |
| `←` / `→` | Seek ±10 seconds |
| `↑` / `↓` | Adjust volume up / down |
| `N` | Next track |
| `P` | Previous track |
| `S` | Toggle Shuffle |
| `R` | Cycle Repeat mode |
| `M` | Toggle Mute |
| `L` | Like / Unlike current track |
| `F` | Open / Close Fullscreen player |
| `Q` | Open / Close Queue drawer |
| `Esc` | Close fullscreen player or modals |

---

## 📁 File Structure

```
Music Website/
├── index.html        # Complete semantic HTML5 markup (7 pages, modals, player)
├── README.md         # Full documentation
├── css/
│   └── style.css     # CSS with custom properties, light/dark themes, responsive design
└── js/
    ├── data.js       # 16 songs, 10 albums, 10 artists, 4 playlists, 12 genres
    ├── app.js        # Core audio engine, Canvas waveform, queue, universal clicks
    └── features.js   # Settings, themes, charts, stats canvas, lyrics, context menu
```

---

## 💻 How to Open
Double-click [`index.html`](file:///d:/Internship/fronted/week4/Music%20Website/index.html) in your file manager or drag it into Chrome, Edge, or Firefox.
# Music-Website

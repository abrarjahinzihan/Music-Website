// ══════════════════════════════════════════════════════════
//  SoundWave — Music Data (simulated, royalty-free metadata)
// ══════════════════════════════════════════════════════════

// Free/public-domain audio samples from freesound.org / archive.org style URLs
// Using free music samples that work without CORS issues
const AUDIO_SAMPLES = [
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
  "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
];

const SONGS = [
  { id: 1,  title: "Blinding Lights",        artist: "The Weeknd",          album: "After Hours",         duration: "3:20", plays: "2.4B",  emoji: "🌃", grad: "grad-purple",  src: AUDIO_SAMPLES[0] },
  { id: 2,  title: "As It Was",              artist: "Harry Styles",         album: "Harry's House",       duration: "2:37", plays: "1.9B",  emoji: "🌊", grad: "grad-cyan",    src: AUDIO_SAMPLES[1] },
  { id: 3,  title: "Bad Guy",                artist: "Billie Eilish",        album: "When We All Fall",    duration: "3:14", plays: "1.7B",  emoji: "🕷️", grad: "grad-green",   src: AUDIO_SAMPLES[2] },
  { id: 4,  title: "Levitating",             artist: "Dua Lipa",             album: "Future Nostalgia",    duration: "3:23", plays: "1.5B",  emoji: "🚀", grad: "grad-pink",    src: AUDIO_SAMPLES[3] },
  { id: 5,  title: "Stay",                   artist: "The Kid LAROI",        album: "F*CK LOVE 3",         duration: "2:21", plays: "1.4B",  emoji: "💫", grad: "grad-indigo",  src: AUDIO_SAMPLES[4] },
  { id: 6,  title: "Peaches",                artist: "Justin Bieber",        album: "Justice",             duration: "3:18", plays: "1.3B",  emoji: "🍑", grad: "grad-orange",  src: AUDIO_SAMPLES[5] },
  { id: 7,  title: "MONTERO",                artist: "Lil Nas X",            album: "MONTERO",             duration: "2:18", plays: "1.1B",  emoji: "🎸", grad: "grad-rose",    src: AUDIO_SAMPLES[6] },
  { id: 8,  title: "Dynamite",               artist: "BTS",                  album: "BE",                  duration: "3:19", plays: "1.0B",  emoji: "💥", grad: "grad-amber",   src: AUDIO_SAMPLES[7] },
  { id: 9,  title: "Kiss Me More",           artist: "Doja Cat ft. SZA",     album: "Planet Her",          duration: "3:29", plays: "950M",  emoji: "💋", grad: "grad-fuchsia", src: AUDIO_SAMPLES[0] },
  { id: 10, title: "good 4 u",               artist: "Olivia Rodrigo",       album: "SOUR",                duration: "2:58", plays: "900M",  emoji: "⚡", grad: "grad-lime",    src: AUDIO_SAMPLES[1] },
  { id: 11, title: "Industry Baby",          artist: "Lil Nas X ft. J. Cole", album: "MONTERO",            duration: "3:32", plays: "850M",  emoji: "🏭", grad: "grad-teal",    src: AUDIO_SAMPLES[2] },
  { id: 12, title: "Butter",                 artist: "BTS",                  album: "Butter",              duration: "2:44", plays: "800M",  emoji: "🧈", grad: "grad-sky",     src: AUDIO_SAMPLES[3] },
  { id: 13, title: "Watermelon Sugar",       artist: "Harry Styles",         album: "Fine Line",           duration: "2:54", plays: "760M",  emoji: "🍉", grad: "grad-pink",    src: AUDIO_SAMPLES[4] },
  { id: 14, title: "Heat Waves",             artist: "Glass Animals",        album: "Dreamland",           duration: "3:59", plays: "700M",  emoji: "🌊", grad: "grad-cyan",    src: AUDIO_SAMPLES[5] },
  { id: 15, title: "Drivers License",        artist: "Olivia Rodrigo",       album: "SOUR",                duration: "4:02", plays: "680M",  emoji: "🚗", grad: "grad-indigo",  src: AUDIO_SAMPLES[6] },
  { id: 16, title: "Save Your Tears",        artist: "The Weeknd",           album: "After Hours",         duration: "3:35", plays: "640M",  emoji: "😢", grad: "grad-purple",  src: AUDIO_SAMPLES[7] },
];

const ALBUMS = [
  { id: 1,  title: "After Hours",         artist: "The Weeknd",   year: 2020, songs: [1, 16],    grad: "grad-purple",  emoji: "🌃" },
  { id: 2,  title: "Future Nostalgia",    artist: "Dua Lipa",     year: 2020, songs: [4],         grad: "grad-pink",    emoji: "✨" },
  { id: 3,  title: "Fine Line",           artist: "Harry Styles", year: 2019, songs: [13],        grad: "grad-cyan",    emoji: "🌊" },
  { id: 4,  title: "SOUR",               artist: "Olivia Rodrigo",year: 2021, songs: [10, 15],   grad: "grad-lime",    emoji: "⚡" },
  { id: 5,  title: "Harry's House",       artist: "Harry Styles", year: 2022, songs: [2],         grad: "grad-teal",    emoji: "🏡" },
  { id: 6,  title: "Planet Her",          artist: "Doja Cat",     year: 2021, songs: [9],         grad: "grad-fuchsia", emoji: "🪐" },
  { id: 7,  title: "BE",                  artist: "BTS",          year: 2020, songs: [8],         grad: "grad-amber",   emoji: "💥" },
  { id: 8,  title: "MONTERO",             artist: "Lil Nas X",    year: 2021, songs: [7, 11],    grad: "grad-rose",    emoji: "🎸" },
  { id: 9,  title: "Dreamland",           artist: "Glass Animals",year: 2020, songs: [14],        grad: "grad-sky",     emoji: "💭" },
  { id: 10, title: "When We All Fall",    artist: "Billie Eilish",year: 2019, songs: [3],         grad: "grad-green",   emoji: "🕷️" },
];

const ARTISTS = [
  { id: 1,  name: "The Weeknd",    genre: "R&B / Pop",      emoji: "🌃", grad: "grad-purple",  followers: "92M",  verified: true,  songs: [1, 16] },
  { id: 2,  name: "Dua Lipa",      genre: "Pop / Dance",    emoji: "✨", grad: "grad-pink",    followers: "88M",  verified: true,  songs: [4] },
  { id: 3,  name: "Harry Styles",  genre: "Pop / Rock",     emoji: "🌊", grad: "grad-cyan",    followers: "79M",  verified: true,  songs: [2, 13] },
  { id: 4,  name: "Olivia Rodrigo",genre: "Pop / Alt",      emoji: "⚡", grad: "grad-lime",    followers: "74M",  verified: true,  songs: [10, 15] },
  { id: 5,  name: "Billie Eilish", genre: "Alt / Electro",  emoji: "🕷️", grad: "grad-green",  followers: "105M", verified: true,  songs: [3] },
  { id: 6,  name: "BTS",           genre: "K-Pop",          emoji: "💥", grad: "grad-amber",   followers: "98M",  verified: true,  songs: [8, 12] },
  { id: 7,  name: "Doja Cat",      genre: "R&B / Hip-Hop",  emoji: "🪐", grad: "grad-fuchsia", followers: "61M",  verified: true,  songs: [9] },
  { id: 8,  name: "Lil Nas X",     genre: "Hip-Hop / Pop",  emoji: "🎸", grad: "grad-rose",    followers: "55M",  verified: true,  songs: [7, 11] },
  { id: 9,  name: "Glass Animals", genre: "Indie / Alt",    emoji: "💭", grad: "grad-sky",     followers: "30M",  verified: true,  songs: [14] },
  { id: 10, name: "Justin Bieber", genre: "Pop",            emoji: "🍑", grad: "grad-orange",  followers: "115M", verified: true,  songs: [6] },
];

const PLAYLISTS = [
  { id: 0, title: "Chill Vibes",   desc: "Mellow tracks to relax",    emoji: "🌙", grad: "grad-indigo",  songs: [2, 13, 14, 15, 16],  count: "5 songs" },
  { id: 1, title: "Workout Hits",  desc: "High energy motivation",    emoji: "💪", grad: "grad-orange",  songs: [1, 4, 7, 8, 10],     count: "5 songs" },
  { id: 2, title: "Late Night Jazz",desc: "Smooth evening sessions",  emoji: "🎷", grad: "grad-teal",    songs: [3, 6, 9, 11, 12],    count: "5 songs" },
  { id: 3, title: "Focus Mode",    desc: "Deep work concentration",   emoji: "🎯", grad: "grad-green",   songs: [5, 13, 14, 15, 16],  count: "5 songs" },
];

const GENRES = [
  { name: "Pop",        emoji: "🎵", grad: "grad-purple",  songs: [1, 2, 4, 6] },
  { name: "Hip-Hop",    emoji: "🎤", grad: "grad-orange",  songs: [7, 11] },
  { name: "R&B",        emoji: "🎶", grad: "grad-pink",    songs: [1, 9, 16] },
  { name: "Electronic", emoji: "⚡", grad: "grad-cyan",    songs: [3, 5] },
  { name: "Indie",      emoji: "🌿", grad: "grad-green",   songs: [14, 15] },
  { name: "K-Pop",      emoji: "✨", grad: "grad-amber",   songs: [8, 12] },
  { name: "Alt / Rock", emoji: "🎸", grad: "grad-rose",    songs: [10, 13] },
  { name: "Jazz",       emoji: "🎷", grad: "grad-teal",    songs: [6] },
  { name: "Classical",  emoji: "🎻", grad: "grad-indigo",  songs: [] },
  { name: "Country",    emoji: "🤠", grad: "grad-lime",    songs: [] },
  { name: "Dance",      emoji: "💃", grad: "grad-fuchsia", songs: [4] },
  { name: "Podcasts",   emoji: "🎙️", grad: "grad-sky",    songs: [] },
];

// Hero carousel data
const HERO_TRACKS = [1, 4, 14, 10, 2]; // song IDs to feature in hero rotation


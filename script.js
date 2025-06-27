document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const loadingScreen = document.getElementById('loadingScreen');
    const gameScreen = document.getElementById('gameScreen');
    const musicScore = document.getElementById('musicScore');
    const songNameElem = document.getElementById('songName');
    const guessAttemptsElem = document.getElementById('guessAttempts');
    const guessInput = document.getElementById('guessInput');
    const statusMessage = document.getElementById('statusMessage');
    const totalGuessesCount = document.getElementById('totalGuessesCount');

    // Remove any unwanted "0" inserted by default
    [...gameScreen.querySelectorAll('*')].forEach(el => {
        if (el.textContent.trim() === '0' && el.id !== 'guessAttempts') el.textContent = '';
    });

    // Song list
    const SONGS = [
        { id: 'dQw4w9WgXcQ', title: 'Never Gonna Give You Up', length: 50 },
        { id: 'm2nmCSpzU', title: 'Fairytale Of New York', length: 50 },
        { id: 'i5NmRDLkSnI', title: 'Beggin', length: 50 },
        { id: 'Z8NiouNEivo', title: 'BABY SAID', length: 50 },
        { id: 'Cfv_6gLijEo', title: 'Troublemaker', length: 50 },
        { id: 'HIgvP7B3Hg8', title: 'Runaway Baby', length: 50 },
        { id: 'xHOgq4C8P9Y', title: 'I Kissed a Girl', length: 50 },
        { id: 'BuYf0taXoNw', title: "He's a Pirate", length: 50 },
        { id: 'XZe_pV2rXuk', title: 'Stressed Out', length: 50 },
        { id: 'kAJz7c97Cyo', title: '...Baby One More Time', length: 50 },
        { id: 'GPGdXrQID7c', title: 'Fluorescent Adolescent', length: 50 },
        { id: 'aJOTlE1K90k', title: 'Senorita', length: 50 },
        { id: 'hT_nvWreIhg', title: 'Counting Stars', length: 50 },
        { id: 'ZbZSe6N_BXs', title: 'Happy', length: 50 },
        { id: '09R8_2nJtjg', title: 'Sugar', length: 50 },
        { id: '3tmd-ClpJxA', title: 'Believer', length: 50 },
        { id: 'YQHsXMglC9A', title: 'Hello', length: 50 },
        { id: 'ktvTqknDobU', title: 'Radioactive', length: 50 },
        { id: '2Vv-BfVoq4g', title: 'Perfect', length: 50 },
        { id: 'CevxZvSJLk8', title: 'Roar', length: 50 },
        { id: 'UceaB4D0jpo', title: 'Heat Waves', length: 50 },
    ];

    let currentSong, player, progress = 0, guessAttempts = 0;
    let progressInterval, userInteracted = false;
    let youtubeAPIReady = false;

    // Fake backend API
    async function fetchGlobalGuesses() { return 0; }
    async function incrementGlobalGuesses() { return 0; }

    async function updateTotalGuessesUI() {
        const global = await fetchGlobalGuesses();
        totalGuessesCount.textContent = global;
    }

    function updateMusicProgress(value) {
        const percent = Math.min(100, (value / currentSong.length) * 100);
        musicScore.style.setProperty('--progress-width', `${percent}%`);

        let progressFill = musicScore.querySelector('.progress-fill');
        if (!progressFill) {
            progressFill = document.createElement('div');
            progressFill.className = 'progress-fill';
            Object.assign(progressFill.style, {
                position: 'absolute', top: '0', left: '0', height: '100%',
                width: '0%', borderRadius: '12px',
                background: 'linear-gradient(90deg, #d0f0c0, #4caf50)',
                transition: 'width 0.3s ease'
            });
            musicScore.appendChild(progressFill);
        }
        progressFill.style.width = `${percent}%`;
    }

    function startMusicProgress() {
        clearInterval(progressInterval);
        progress = 0;
        updateMusicProgress(progress);

        progressInterval = setInterval(() => {
            progress++;
            if (progress >= currentSong.length) {
                clearInterval(progressInterval);
                updateMusicProgress(currentSong.length);
                statusMessage.textContent = "⏰ Time's up! Keep guessing!";
            } else {
                updateMusicProgress(progress);
            }
        }, 1000);
    }

    function loadYouTubeAPI() {
        if (window.YT && window.YT.Player) {
            youtubeAPIReady = true;
            onYouTubeIframeAPIReady();
            return;
        }

        window.onYouTubeIframeAPIReady = () => {
            youtubeAPIReady = true;
            createPlayer();
        };

        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(tag);
    }

    function createPlayer() {
        try {
            player = new YT.Player('player', {
                height: '0',
                width: '0',
                videoId: currentSong.id,
                playerVars: {
                    autoplay: 1, controls: 0, mute: 1,
                    modestbranding: 1, playsinline: 1,
                },
                events: {
                    onReady: (event) => event.target.playVideo(),
                    onError: () => {
                        console.warn('Invalid video ID or playback error. Skipping...');
                        newSongRound(); // Load next valid song
                    }
                }
            });
        } catch (err) {
            console.error('YouTube API error:', err);
        }
    }

    function loadNewSong(song) {
        if (!youtubeAPIReady) {
            loadYouTubeAPI(); // Creates player
        } else if (player && player.loadVideoById) {
            player.loadVideoById(song.id);
            player.mute();
            player.playVideo();
        } else {
            createPlayer();
        }
    }

    function stopCurrentSong() {
        if (player && player.stopVideo) player.stopVideo();
    }

    function getRandomSong() {
        return SONGS[Math.floor(Math.random() * SONGS.length)];
    }

    async function newSongRound() {
        stopCurrentSong();
        clearInterval(progressInterval);

        currentSong = getRandomSong();
        songNameElem.textContent = '';
        guessAttempts = 0;
        guessAttemptsElem.textContent = 0;
        guessInput.value = '';
        guessInput.disabled = false;
        statusMessage.textContent = '🎵 Listen and guess the song!';

        loadNewSong(currentSong);
        startMusicProgress();
        updateTotalGuessesUI();
        guessInput.focus();
    }

    function normalizeString(str) {
        return str.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
    }

    function similarityScore(a, b) {
        const longer = a.length > b.length ? a : b;
        const shorter = a.length > b.length ? b : a;
        const matrix = Array.from({ length: shorter.length + 1 }, (_, i) => [i]);
        for (let j = 0; j <= longer.length; j++) matrix[0][j] = j;
        for (let i = 1; i <= shorter.length; i++) {
            for (let j = 1; j <= longer.length; j++) {
                matrix[i][j] = shorter[i - 1] === longer[j - 1]
                    ? matrix[i - 1][j - 1]
                    : Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
            }
        }
        const distance = matrix[shorter.length][longer.length];
        return (longer.length - distance) / longer.length;
    }

    guessInput.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter' && guessInput.value.trim() !== '') {
            const guess = normalizeString(guessInput.value);
            const correct = normalizeString(currentSong.title);
            const score = similarityScore(guess, correct);

            guessAttempts++;                      // increment count first
            guessAttemptsElem.textContent = guessAttempts;  // update UI immediately
            console.log("Guess attempts:", guessAttempts);  // debug

            // Update global guess count async but don't block UI update
            incrementGlobalGuesses().then(updateTotalGuessesUI);

            if (guess === correct || score >= 0.8) {
                songNameElem.textContent = currentSong.title;
                guessInput.disabled = true;
                statusMessage.textContent = "✅ Correct! Next song in 3s...";
                setTimeout(() => newSongRound(), 3000);
            } else {
                statusMessage.textContent = "❌ Try again!";
            }
        }
    });


    // Audio unmute on user interaction
    document.body.addEventListener('click', () => {
        if (!userInteracted && player && player.unMute) {
            player.unMute();
            userInteracted = true;
            statusMessage.textContent = '🔊 Audio unmuted!';
        }
    }, { once: true });

    document.body.addEventListener('keydown', () => {
        if (!userInteracted && player && player.unMute) {
            player.unMute();
            userInteracted = true;
            statusMessage.textContent = '🔊 Audio unmuted!';
        }
    }, { once: true });

    // Initialize
    currentSong = getRandomSong();
    loadYouTubeAPI();
    setTimeout(() => {
        loadingScreen.style.display = 'none';
        gameScreen.style.display = 'block';
        newSongRound();
    }, 3000);
});

document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    let playerReady = false;
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
    // Validate YouTube video ID format (11 characters, letters, numbers, _ and -)
    function isValidYouTubeId(id) {
        return typeof id === 'string' && /^[a-zA-Z0-9_-]{11}$/.test(id);
    }


    // Song list
    const SONGS = [
        { id: 'dQw4w9WgXcQ', title: 'Never Gonna Give You Up', length: 120 },
        { id: 'm2nmCSpzU', title: 'Fairytale Of New York', length: 120 },
        { id: 'i5NmRDLkSnI', title: 'Beggin', length: 120 },
        { id: 'Z8NiouNEivo', title: 'BABY SAID', length: 120 },
        { id: 'Cfv_6gLijEo', title: 'Troublemaker', length: 120 },
        { id: 'HIgvP7B3Hg8', title: 'Runaway Baby', length: 120 },
        { id: 'xHOgq4C8P9Y', title: 'I Kissed a Girl', length: 120 },
        { id: 'BuYf0taXoNw', title: "He's a Pirate", length: 120 },
        { id: 'XZe_pV2rXuk', title: 'Stressed Out', length: 120 },
        { id: 'kAJz7c97Cyo', title: '...Baby One More Time', length: 120} ,
        { id: 'GPGdXrQID7c', title: 'Fluorescent Adolescent', length: 120 },
        { id: 'aJOTlE1K90k', title: 'Senorita', length: 120 },
        { id: 'hT_nvWreIhg', title: 'Counting Stars', length: 120 },
        { id: 'ZbZSe6N_BXs', title: 'Happy', length: 120 },
        { id: 'Ju5USsFdrrY', title: 'Sugar', length: 120 },
        { id: '3tmd-ClpJxA', title: 'Believer', length: 120 },
        { id: 'YQHsXMglC9A', title: 'Hello', length: 120 },
        { id: 'ktvTqknDobU', title: 'Radioactive', length: 120 },
        { id: '2Vv-BfVoq4g', title: 'Perfect', length: 120 },
        { id: 'CevxZvSJLk8', title: 'Roar', length: 120 },
        { id: 'UceaB4D0jpo', title: 'Heat Waves', length: 120 },
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
        if (!currentSong || !currentSong.length) return;
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
            if (currentSong) createPlayer(); // ✅ Only if song is set
        };

        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(tag);
    }

    function createPlayer() {
        player = new YT.Player('player', {
            height: '0',
            width: '0',
            videoId: currentSong.id,
            playerVars: {
                autoplay: 1,
                controls: 0,
                mute: 1,
                modestbranding: 1,
                playsinline: 1
            },
            events: {
                onReady: (event) => {
                    playerReady = true;
                    event.target.playVideo();
                    startMusicProgress();
                },
                onError: (e) => {
                    console.warn('🎵 Skipping song due to error:', currentSong.id, e.data);
                    setTimeout(() => newSongRound(), 1000);
                }
            }
        });
    }

    // Validate YouTube video existence via oEmbed endpoint
    async function validateVideo(videoId) {
        try {
            const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
            return response.ok;
        } catch {
            return false;
        }
    }

    async function loadNewSong(song) {
        if (!song || !isValidYouTubeId(song.id)) {
            console.warn('⛔ Invalid YouTube video ID:', song ? song.id : song);
            newSongRound();
            return;
        }

        const isValid = await validateVideo(song.id);
        if (!isValid) {
            console.warn('⛔ Skipping invalid or unavailable video:', song.id);
            newSongRound();
            return;
        }

        if (!player || !player.loadVideoById) {
            createPlayer();
        } else {
            try {
                player.loadVideoById(song.id);
                player.mute();
                player.playVideo();
                userInteracted = false;
            } catch (err) {
                console.warn('⚠️ Error loading video:', err);
                createPlayer(); // fallback
            }
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

        await loadNewSong(currentSong);
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
    }, { once: false }); // change once:true to false

    document.body.addEventListener('keydown', () => {
        if (!userInteracted && player && player.unMute) {
            player.unMute();
            userInteracted = true;
            statusMessage.textContent = '🔊 Audio unmuted!';
        }
    }, { once: false });

    // Initialize
    currentSong = getRandomSong();
    loadYouTubeAPI();
    setTimeout(() => {
        loadingScreen.style.display = 'none';
        gameScreen.style.display = 'block';
        newSongRound();
    }, 3000);
});

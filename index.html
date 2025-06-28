document.addEventListener('DOMContentLoaded', () => {
    let playerReady = false;
    const loadingScreen = document.getElementById('loadingScreen');
    const gameScreen = document.getElementById('gameScreen');
    const musicScore = document.getElementById('musicScore');
    const songNameElem = document.getElementById('songName');
    const guessAttemptsElem = document.getElementById('guessAttempts');
    const guessInput = document.getElementById('guessInput');
    const statusMessage = document.getElementById('statusMessage');
    const totalGuessesCount = document.getElementById('totalGuessesCount');
    const ticking = document.getElementById('countdownAudio');

    [...gameScreen.querySelectorAll('*')].forEach(el => {
        if (el.textContent.trim() === '0' && el.id !== 'guessAttempts') el.textContent = '';
    });

    const SONGS = [
        { id: 'dQw4w9WgXcQ', title: 'Never Gonna Give You Up' },
        { id: 'i5NmRDLkSnI', title: 'Beggin' },
        { id: 'Cfv_6gLijEo', title: 'Troublemaker' },
        { id: 'HIgvP7B3Hg8', title: 'Runaway Baby' },
        { id: 'xHOgq4C8P9Y', title: 'I Kissed a Girl' },
        { id: 'BuYf0taXoNw', title: "He's a Pirate" },
        { id: 'XZe_pV2rXuk', title: 'Stressed Out' },
        { id: 'kAJz7c97Cyo', title: '...Baby One More Time' },
        { id: 'GPGdXrQID7c', title: 'Fluorescent Adolescent' },
        { id: 'aJOTlE1K90k', title: 'Girl Like you' },
        { id: 'ZbZSe6N_BXs', title: 'Happy' },
        { id: 'Ju5USsFdrrY', title: 'Sugar' },
        { id: '3tmd-ClpJxA', title: 'Believer' },
        { id: 'YQHsXMglC9A', title: 'Hello' },
        { id: 'ktvTqknDobU', title: 'Radioactive' },
        { id: '2Vv-BfVoq4g', title: 'Perfect' },
        { id: 'CevxZvSJLk8', title: 'Roar' },
        { id: 'JlOZR5OwS', title: 'TIMEZONE'},
        { id: 'ds18Ozzp8h0', title: 'HONEY (ARE YOU COMING?)'},
        { id: 'WuEJfwhHiC8', title: 'Apple Juice'},
        { id: 'x3iVWOcrXpo', title: 'OH OKAY'},
        { id: 'o6aJJ6Q5zhg', title: 'ESPRESSO MACCHIATO'},
        { id: 'uS9A9lqd7-k', title: 'Lets get it started'},
        { id: 'tBKYI3-3lMg', title: 'Armed and dangerous'},
        { id: 'IbpOfzrNjTY', title: 'Feel good INC'},
    ];

    let currentSong, player, progress = 0, guessAttempts = 0;
    let progressInterval, userInteracted = false;
    let youtubeAPIReady = false;
    let hasGuessedCorrectly = false;

    async function fetchGlobalGuesses() { return 0; }
    async function incrementGlobalGuesses() { return 0; }

    async function updateTotalGuessesUI() {
        const global = await fetchGlobalGuesses();
        totalGuessesCount.textContent = global;
    }

    function fadeVolume(target, duration = 1500, steps = 30) {
        if (!player || !player.setVolume) return;
        const current = player.getVolume();
        const step = (target - current) / steps;
        let count = 0;
        const interval = setInterval(() => {
            player.setVolume(current + step * count++);
            if (count > steps) clearInterval(interval);
        }, duration / steps);
    }

    function fadeIn() {
        player.setVolume(0);
        fadeVolume(100);
    }

    function fadeOutThen(cb) {
        fadeVolume(0);
        setTimeout(cb, 1500);
    }

    function updateMusicProgress(time) {
        const percent = Math.min(100, (time / 20) * 100);
        let fill = musicScore.querySelector('.progress-fill');
        if (!fill) {
            fill = document.createElement('div');
            fill.className = 'progress-fill';
            Object.assign(fill.style, {
                position: 'absolute', top: '0', left: '0', height: '100%',
                width: '0%', borderRadius: '12px',
                background: 'linear-gradient(90deg, #d0f0c0, #4caf50)',
                transition: 'width 0.3s ease'
            });
            musicScore.appendChild(fill);
        }
        fill.style.width = `${percent}%`;
    }

    function startMusicProgress() {
        clearInterval(progressInterval);
        progressInterval = setInterval(() => {
            if (!player?.getCurrentTime) return;
            const time = player.getCurrentTime();
            updateMusicProgress(time);
            if (time >= 20) {
                clearInterval(progressInterval);
                player.pauseVideo();
                startGuessCountdown();
            }
        }, 300);
    }

    function startGuessCountdown() {
        let timeLeft = 10;
        ticking.currentTime = 0;
        ticking.play();
        guessInput.disabled = false;
        statusMessage.textContent = "⏳ Time's up! You have 10 seconds to guess...";
        const countdownInterval = setInterval(() => {
            if (hasGuessedCorrectly || timeLeft <= 0) {
                ticking.pause();
                clearInterval(countdownInterval);
                if (!hasGuessedCorrectly) {
                    statusMessage.textContent = "❌ You missed it!";
                    guessInput.disabled = true;
                    fadeOutThen(() => newSongRound());
                }
            }
            timeLeft--;
        }, 1000);
    }

    function loadYouTubeAPI() {
        if (window.YT?.Player) {
            youtubeAPIReady = true;
            onYouTubeIframeAPIReady();
            return;
        }
        window.onYouTubeIframeAPIReady = () => {
            youtubeAPIReady = true;
            if (currentSong) createPlayer();
        };
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(tag);
    }

    async function validateVideo(videoId) {
        try {
            const res = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
            return res.ok;
        } catch {
            return false;
        }
    }

    async function loadNewSong(song) {
        if (!song || !song.id) return newSongRound();
        const valid = await validateVideo(song.id);
        if (!valid) return newSongRound();

        if (!player || !player.loadVideoById) {
            createPlayer();
        } else {
            try {
                player.loadVideoById(song.id);
                player.mute();
                player.playVideo();
                fadeIn();
                userInteracted = false;
                startMusicProgress();
            } catch {
                createPlayer();
            }
        }
    }

    function createPlayer() {
        player = new YT.Player('player', {
            height: '0', width: '0',
            videoId: currentSong.id,
            playerVars: { autoplay: 1, controls: 0, mute: 1, modestbranding: 1, playsinline: 1 },
            events: {
                onReady: e => {
                    playerReady = true;
                    e.target.playVideo();
                    fadeIn();
                    startMusicProgress();
                    document.body.addEventListener('click', unmuteHandler);
                    document.body.addEventListener('keydown', unmuteHandler);
                },
                onError: e => {
                    console.warn('🎵 Skipping song due to error:', currentSong.id, e.data);
                    setTimeout(() => newSongRound(), 1000);
                }
            }
        });
    }

    function getRandomSong() {
        return SONGS[Math.floor(Math.random() * SONGS.length)];
    }

    async function newSongRound() {
        if (player?.stopVideo) fadeOutThen(() => player.stopVideo());
        clearInterval(progressInterval);
        currentSong = getRandomSong();
        console.log("🎶 Now playing:", currentSong.title); // <-- Add this line
        songNameElem.textContent = '';
        guessAttempts = 0;
        guessAttemptsElem.textContent = 0;
        guessInput.value = '';
        guessInput.disabled = false;
        hasGuessedCorrectly = false;
        statusMessage.textContent = '🎵 Listen and guess the song!';
        await loadNewSong(currentSong);
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

    guessInput.addEventListener('keydown', async e => {
        if (e.key === 'Enter' && guessInput.value.trim()) {
            const guess = normalizeString(guessInput.value);
            const correct = normalizeString(currentSong.title);
            const score = similarityScore(guess, correct);
            guessAttempts++;
            guessAttemptsElem.textContent = guessAttempts;
            incrementGlobalGuesses().then(updateTotalGuessesUI);
            if (guess === correct || score >= 0.8) {
                hasGuessedCorrectly = true;
                songNameElem.textContent = currentSong.title;
                guessInput.disabled = true;
                statusMessage.textContent = "✅ Correct! Next song in 3s...";
                setTimeout(() => newSongRound(), 3000);
            } else {
                statusMessage.textContent = "❌ Try again!";
            }
        }
    });

    const unmuteHandler = () => {
        if (!userInteracted && playerReady && player?.unMute) {
            player.unMute();
            userInteracted = true;
            statusMessage.textContent = '🔊 Audio unmuted!';
            document.body.removeEventListener('click', unmuteHandler);
            document.body.removeEventListener('keydown', unmuteHandler);
        }
    };

    document.body.addEventListener('click', unmuteHandler);
    document.body.addEventListener('keydown', unmuteHandler);

    loadYouTubeAPI();

    setTimeout(() => {
        loadingScreen.style.display = 'none';
        gameScreen.style.display = 'block';
        newSongRound();
    }, 3000);
});

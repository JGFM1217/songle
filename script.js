document.addEventListener('DOMContentLoaded', () => {
    let playerReady = false;
    const loadingScreen = document.getElementById('loadingScreen');
    const gameScreen = document.getElementById('gameScreen');
    const musicScore = document.getElementById('musicScore');
    const songNameElem = document.getElementById('songName');
    const guessAttemptsElem = document.getElementById('guessAttempts');
    const guessInput = document.getElementById('guessInput');
    let statusMessage = document.getElementById('statusMessage'); // reassignable after clone
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
        { id: 'KtiRn_Pwvpw', title: 'Feel good INC'},
    ];

    let currentSong, player, progressInterval, guessAttempts = 0;
    let userInteracted = false;
    let youtubeAPIReady = false;
    let hasGuessedCorrectly = false;

    // Placeholder for backend fetch/increment
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
        if (!player || !player.setVolume) return;
        player.setVolume(0);
        fadeVolume(100);
    }

    function fadeOutThen(cb) {
        fadeVolume(0);
        setTimeout(cb, 1500);
    }

    function updateMusicProgress(time) {
        const percent = Math.min(100, (time / 30) * 100);
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
            if (time >= 30) {
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
        let countdownInterval = setInterval(() => {
            if (hasGuessedCorrectly || timeLeft <= 0) {
                ticking.pause();
                clearInterval(countdownInterval);

                if (!hasGuessedCorrectly) {
                    statusMessage.textContent = "❌ Time's up! Starting next song soon...";
                    statusMessage.style.cursor = 'pointer';
                    statusMessage.style.animation = 'glowPulse 2s ease-in-out infinite';
                    guessInput.disabled = true;

                    // Remove old listeners then add new click listener for next round
                    statusMessage.replaceWith(statusMessage.cloneNode(true));
                    statusMessage = document.getElementById('statusMessage');

                    function startNext() {
                        statusMessage.style.cursor = 'default';
                        statusMessage.textContent = '🎵 Listen and guess the song!';
                        statusMessage.style.animation = '';
                        guessInput.disabled = false;
                        statusMessage.removeEventListener('click', startNext);
                        newSongRound();
                    }

                    statusMessage.addEventListener('click', startNext);

                    // Auto-advance after 5 seconds
                    setTimeout(() => {
                        if (!hasGuessedCorrectly) {
                            statusMessage.removeEventListener('click', startNext);
                            startNext();
                        }
                    }, 5000);
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

    function createPlayer() {
        player = new YT.Player('player', {
            height: '0',
            width: '0',
            videoId: currentSong.id,
            playerVars: { autoplay: 1, controls: 0, mute: 1, modestbranding: 1, playsinline: 1 },
            events: {
                onReady: e => {
                    playerReady = true;
                    e.target.playVideo();
                    fadeIn();

                    startMusicProgress();

                    const unmuteHandler = () => {
                        if (!playerReady) return;
                        const state = player.getPlayerState();
                        if (state !== YT.PlayerState.PLAYING) player.playVideo();

                        player.unMute();
                        userInteracted = true;
                        statusMessage.textContent = '🔊 Audio unmuted!';

                        document.body.removeEventListener('click', unmuteHandler);
                        document.body.removeEventListener('keydown', unmuteHandler);
                    };

                    document.body.addEventListener('click', unmuteHandler, { once: true });
                    document.body.addEventListener('keydown', unmuteHandler, { once: true });
                }
            }
        });
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

    function getRandomSong() {
        return SONGS[Math.floor(Math.random() * SONGS.length)];
    }

    async function newSongRound() {
        clearInterval(progressInterval);

        if (player && player.stopVideo) {
            await new Promise(resolve => {
                fadeOutThen(() => {
                    player.stopVideo();
                    resolve();
                });
            });
        }

        currentSong = getRandomSong();
        console.log("🎶 Now playing:", currentSong.title);

        // Reset UI
        songNameElem.textContent = '';
        guessAttempts = 0;
        guessAttemptsElem.textContent = 0;
        guessInput.value = '';
        guessInput.disabled = true;
        hasGuessedCorrectly = false;

        const fill = musicScore.querySelector('.progress-fill');
        if (fill) fill.style.width = '0%';

        // Reset statusMessage reference after clone
        const oldStatusMessage = document.getElementById('statusMessage');
        const newStatusMessage = oldStatusMessage.cloneNode(true);
        oldStatusMessage.parentNode.replaceChild(newStatusMessage, oldStatusMessage);
        statusMessage = newStatusMessage;

        statusMessage.textContent = '▶️ Click here to start';
        statusMessage.style.cursor = 'pointer';
        statusMessage.style.animation = 'glowPulse 2s ease-in-out infinite';

        async function startGame() {
            statusMessage.style.cursor = 'default';
            statusMessage.textContent = '🎵 Listen and guess the song!';
            statusMessage.style.animation = '';
            guessInput.disabled = false;
            statusMessage.removeEventListener('click', startGame);

            const valid = await validateVideo(currentSong.id);
            if (!valid) return newSongRound();

            if (!player || !player.loadVideoById) {
                createPlayer();
            }
            player.loadVideoById(currentSong.id);
            player.unMute();
            player.setVolume(100);
            player.playVideo();

            startMusicProgress();
            updateTotalGuessesUI();
            guessInput.focus();
        }

        statusMessage.addEventListener('click', startGame);
    }

    guessInput.addEventListener('keydown', async e => {
        if (e.key === 'Enter' && guessInput.value.trim()) {
            const guess = normalizeString(guessInput.value);
            const correct = normalizeString(currentSong.title);
            const score = similarityScore(guess, correct);
            guessAttempts++;
            guessAttemptsElem.textContent = guessAttempts;

            if (guess === correct || score >= 0.75) {
                hasGuessedCorrectly = true;
                songNameElem.textContent = currentSong.title;
                statusMessage.textContent = `✅ Correct! Attempts: ${guessAttempts}`;
                guessInput.disabled = true;
                incrementGlobalGuesses();
                updateTotalGuessesUI();

                setTimeout(() => {
                    newSongRound();
                }, 4000);
            } else {
                statusMessage.textContent = `❌ Incorrect! Try again!`;
            }
            guessInput.value = '';
        }
    });

    function normalizeString(str) {
        return str.toLowerCase().replace(/[^a-z0-9]/g, '');
    }
    function levenshteinDistance(a, b) {
        const matrix = [];
        const alen = a.length;
        const blen = b.length;

        for (let i = 0; i <= alen; i++) matrix[i] = [i];
        for (let j = 0; j <= blen; j++) matrix[0][j] = j;

        for (let i = 1; i <= alen; i++) {
            for (let j = 1; j <= blen; j++) {
                if (a[i - 1] === b[j - 1]) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j] + 1,    // deletion
                        matrix[i][j - 1] + 1,    // insertion
                        matrix[i - 1][j - 1] + 1 // substitution
                    );
                }
            }
        }
        return matrix[alen][blen];
    }

    function similarityScore(a, b) {
        a = normalizeString(a);
        b = normalizeString(b);
        if (!a || !b) return 0;

        const distance = levenshteinDistance(a, b);
        const maxLen = Math.max(a.length, b.length);
        const score = (maxLen - distance) / maxLen; // similarity from 0 to 1

        // Also accept partial match if one string contains the other at least 60%
        const partialMatch =
            a.includes(b) || b.includes(a) ? 0.6 : 0;

        return Math.max(score, partialMatch);
    }

    function similarityScore(a, b) {
        if (!a || !b) return 0;
        let matches = 0;
        const len = Math.min(a.length, b.length);
        for (let i = 0; i < len; i++) {
            if (a[i] === b[i]) matches++;
        }
        return matches / Math.max(a.length, b.length);
    }

    // Initialize
    loadingScreen.style.display = 'none';
    gameScreen.style.display = 'block';
    loadYouTubeAPI();
    newSongRound();
});

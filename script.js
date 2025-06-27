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

    // Remove unwanted "0"s
    [...gameScreen.querySelectorAll('*')].forEach(el => {
        if (el.textContent.trim() === '0' && el.id !== 'guessAttempts') el.textContent = '';
    });

    function isValidYouTubeId(id) {
        return typeof id === 'string' && /^[a-zA-Z0-9_-]{11}$/.test(id);
    }

    const SONGS = [
        { id: 'dQw4w9WgXcQ', title: 'Never Gonna Give You Up' },
        { id: 'i5NmRDLkSnI', title: 'Beggin' },
        { id: 'Z8NiouNEivo', title: 'BABY SAID' },
        { id: 'Cfv_6gLijEo', title: 'Troublemaker' },
        { id: 'HIgvP7B3Hg8', title: 'Runaway Baby' },
        { id: 'xHOgq4C8P9Y', title: 'I Kissed a Girl' },
        { id: 'BuYf0taXoNw', title: "He's a Pirate" },
        { id: 'XZe_pV2rXuk', title: 'Stressed Out' },
        { id: 'kAJz7c97Cyo', title: '...Baby One More Time' },
        { id: 'GPGdXrQID7c', title: 'Fluorescent Adolescent' },
        { id: 'aJOTlE1K90k', title: 'Girl Like you' },
        { id: 'hT_nvWreIhg', title: 'Counting Stars' },
        { id: 'ZbZSe6N_BXs', title: 'Happy' },
        { id: 'Ju5USsFdrrY', title: 'Sugar' },
        { id: '3tmd-ClpJxA', title: 'Believer' },
        { id: 'YQHsXMglC9A', title: 'Hello' },
        { id: 'ktvTqknDobU', title: 'Radioactive' },
        { id: '2Vv-BfVoq4g', title: 'Perfect' },
        { id: 'CevxZvSJLk8', title: 'Roar' },
        { id: 'UceaB4D0jpo', title: 'Heat Waves' }
    ];

    let currentSong, player, progress = 0, guessAttempts = 0;
    let progressInterval, userInteracted = false;
    let youtubeAPIReady = false;

    async function fetchGlobalGuesses() { return 0; }
    async function incrementGlobalGuesses() { return 0; }

    async function updateTotalGuessesUI() {
        const global = await fetchGlobalGuesses();
        totalGuessesCount.textContent = global;
    }
    function fadeVolume(targetVolume, duration = 1500, steps = 30) {
        if (!player || !player.setVolume) return;
        const currentVolume = player.getVolume ? player.getVolume() : 0;
        const stepSize = (targetVolume - currentVolume) / steps;
        let step = 0;
        const interval = setInterval(() => {
            const newVolume = Math.min(100, Math.max(0, currentVolume + step * stepSize));
            player.setVolume(newVolume);
            step++;
            if (step > steps) clearInterval(interval);
        }, duration / steps);
    }

    function fadeIn() {
        player.setVolume(0);
        fadeVolume(100);
    }

    function fadeOutThen(callback) {
        fadeVolume(0);
        setTimeout(() => {
            if (typeof callback === 'function') callback();
        }, 1500); // match fade-out duration
    }

    function updateMusicProgress(value) {
        const percent = Math.min(100, (value / currentSong.length) * 100);
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
        progress = 0;
        updateMusicProgress(0);
        clearInterval(progressInterval);

        progressInterval = setInterval(() => {
            progress++;
            updateMusicProgress(progress);
            if (progress >= currentSong.length) {
                clearInterval(progressInterval);
                fadeOutThen(() => player.pauseVideo());
                guessInput.disabled = true;
                statusMessage.textContent = "⏱️ Time's up! Try again!";
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
            if (currentSong) createPlayer();
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
                autoplay: 1, controls: 0, mute: 1,
                modestbranding: 1, playsinline: 1
            },
            events: {
                onReady: (event) => {
                    playerReady = true;
                    event.target.playVideo();
                    fadeIn();

                    // Attach unmute handlers now
                    document.body.addEventListener('click', unmuteHandler);
                    document.body.addEventListener('keydown', unmuteHandler);

                    const waitForDuration = setInterval(() => {
                        if (player.getDuration && player.getDuration() > 0) {
                            clearInterval(waitForDuration);
                            currentSong.length = Math.floor(player.getDuration());
                            startMusicProgress();
                        }
                    }, 200);
                },
                onError: (e) => {
                    console.warn('🎵 Skipping song due to error:', currentSong.id, e.data);
                    setTimeout(() => newSongRound(), 1000);
                }
            }
        });
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
        if (!song || !isValidYouTubeId(song.id)) return newSongRound();
        const valid = await validateVideo(song.id);
        if (!valid) return newSongRound();

        if (!player || !player.loadVideoById) {
            createPlayer(); // onReady will start music
        } else {
            try {
                player.loadVideoById(song.id);
                player.mute();
                player.playVideo();
                fadeIn();

                const waitForDuration = setInterval(() => {
                    if (player.getDuration && player.getDuration() > 0) {
                        clearInterval(waitForDuration);
                        currentSong.length = Math.floor(player.getDuration());
                        userInteracted = false;
                        startMusicProgress();
                    }
                }, 200);
            } catch {
                createPlayer();
            }
        }
    }

    function stopCurrentSong() {
        if (player?.stopVideo) fadeOutThen(() => player.stopVideo());
    }

    function getRandomSong() {
        return SONGS[Math.floor(Math.random() * SONGS.length)];
    }

    async function newSongRound() {
        stopCurrentSong();
        clearInterval(progressInterval);

        currentSong = getRandomSong();
        console.log(`🎵 Now playing: "${currentSong.title}"`);
        songNameElem.textContent = '';
        guessAttempts = 0;
        guessAttemptsElem.textContent = 0;
        guessInput.value = '';
        guessInput.disabled = false;
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

    guessInput.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter' && guessInput.value.trim() !== '') {
            const guess = normalizeString(guessInput.value);
            const correct = normalizeString(currentSong.title);
            const score = similarityScore(guess, correct);

            guessAttempts++;
            guessAttemptsElem.textContent = guessAttempts;
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

    const unmuteHandler = () => {
        if (!userInteracted && playerReady && player?.unMute) {
            player.unMute();
            userInteracted = true;
            statusMessage.textContent = '🔊 Audio unmuted!';
            // Remove event listeners once unmuted to prevent extra calls
            document.body.removeEventListener('click', unmuteHandler);
            document.body.removeEventListener('keydown', unmuteHandler);
        }
    };


    document.body.addEventListener('click', unmuteHandler);
    document.body.addEventListener('keydown', unmuteHandler);

    // Initialize
    // Initialize
    loadYouTubeAPI();

    setTimeout(() => {
        loadingScreen.style.display = 'none';
        gameScreen.style.display = 'block';

        currentSong = getRandomSong(); // choose song *after* loading
        newSongRound();
    }, 3000);
});

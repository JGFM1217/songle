document.addEventListener('DOMContentLoaded', () => {
    const loadingScreen = document.getElementById('loadingScreen');
    const gameScreen = document.getElementById('gameScreen');
    const musicScore = document.getElementById('musicScore');
    const songNameElem = document.getElementById('songName');
    const guessAttemptsElem = document.getElementById('guessAttempts');
    const guessInput = document.getElementById('guessInput');
    const statusMessage = document.getElementById('statusMessage');
    const totalGuessesCount = document.getElementById('totalGuessesCount');

    const SONGS = [
        { id: 'dQw4w9WgXcQ', title: 'Never Gonna Give You Up' },
        { id: '3JZ_D3ELwOQ', title: 'Shape of You' },
        { id: 'hY7m5jjJ9mI', title: 'Despacito' },
        { id: 'tgbNymZ7vqY', title: 'Uptown Funk' },
        { id: 'CevxZvSJLk8', title: 'Rolling in the Deep' }
    ];

    const SONG_LENGTH_SECONDS = 20;
    let progress = 0;
    let guessAttempts = 0;
    let progressInterval;
    let currentSong;
    let player;

    function getRandomSong() {
        return SONGS[Math.floor(Math.random() * SONGS.length)];
    }

    function getTotalGuessesToday() {
        const todayKey = 'totalGuesses_' + new Date().toISOString().slice(0, 10);
        return parseInt(localStorage.getItem(todayKey) || '0', 10);
    }

    function incrementTotalGuessesToday() {
        const todayKey = 'totalGuesses_' + new Date().toISOString().slice(0, 10);
        let current = getTotalGuessesToday();
        current++;
        localStorage.setItem(todayKey, current);
        return current;
    }

    function updateTotalGuessesUI() {
        totalGuessesCount.textContent = getTotalGuessesToday();
    }

    function updateMusicProgress(value) {
        const percent = Math.min(100, (value / SONG_LENGTH_SECONDS) * 100);
        musicScore.style.setProperty('--progress-width', `${percent}%`);
        musicScore.setAttribute('aria-valuenow', Math.floor(value));

        let progressFill = musicScore.querySelector('.progress-fill');
        if (!progressFill) {
            progressFill = document.createElement('div');
            progressFill.classList.add('progress-fill');
            progressFill.style.position = 'absolute';
            progressFill.style.top = '0';
            progressFill.style.left = '0';
            progressFill.style.height = '100%';
            progressFill.style.background = 'linear-gradient(90deg, #d0f0c0 30%, #4caf50 70%)';
            progressFill.style.borderRadius = '12px';
            progressFill.style.boxShadow = '0 0 5px #4caf50, 0 0 15px #81c784';
            progressFill.style.filter = 'drop-shadow(0 0 2px #81c784)';
            progressFill.style.transition = 'width 0.3s ease';
            musicScore.appendChild(progressFill);
        }
        progressFill.style.width = `${percent}%`;
    }

    function onYouTubeIframeAPIReady() {
        player = new YT.Player('player', {
            height: '0',
            width: '0',
            videoId: currentSong.id,
            playerVars: {
                autoplay: 1,
                controls: 0,
                mute: 0, // Ensure the song plays sound
            },
            events: {
                onReady: (event) => {
                    event.target.playVideo();
                }
            }
        });
    }

    function startGame() {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.hidden = true;
            gameScreen.hidden = false;
            guessInput.focus();
            updateTotalGuessesUI();
            startMusicProgress();
        }, 500);  // Fade out duration
    }

    function startMusicProgress() {
        progress = 0;
        updateMusicProgress(progress);

        progressInterval = setInterval(() => {
            progress++;
            if (progress > SONG_LENGTH_SECONDS) {
                clearInterval(progressInterval);
                statusMessage.textContent = 'Song ended! Make your guess!';
                updateMusicProgress(SONG_LENGTH_SECONDS);
                guessInput.disabled = false;
                guessInput.focus();
            } else {
                updateMusicProgress(progress);
            }
        }, 1000);
    }

    guessInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && guessInput.value.trim().length > 0) {
            e.preventDefault();

            guessAttempts++;
            guessAttemptsElem.textContent = guessAttempts;

            const newTotal = incrementTotalGuessesToday();
            updateTotalGuessesUI();

            const guess = guessInput.value.trim().toLowerCase();

            if (guess === currentSong.title.toLowerCase()) {
                statusMessage.textContent = 'Correct! 🎉 Unmuting and revealing song info.';
                guessInput.disabled = true;
                songNameElem.textContent = currentSong.title;
            } else {
                statusMessage.textContent = 'Try again!';
            }

            guessInput.value = '';
        }
    });

    // Start after 5 seconds loading screen
    setTimeout(() => {
        currentSong = getRandomSong();
        startGame();
        loadYouTubeAPI();
    }, 5000);

    function loadYouTubeAPI() {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(tag);
        window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
    }
});

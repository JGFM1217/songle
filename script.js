document.addEventListener('DOMContentLoaded', () => {
    let playerReady = false;
    const loadingScreen = document.getElementById('loadingScreen');
    const gameScreen = document.getElementById('gameScreen');
    const musicScore = document.getElementById('musicScore');
    const songNameElem = document.getElementById('songName');
    const guessAttemptsElem = document.getElementById('guessAttempts');
    const guessInput = document.getElementById('guessInput');
    let statusMessage = document.getElementById('statusMessage'); 
    const totalGuessesCount = document.getElementById('totalGuessesCount');
    const ticking = document.getElementById('countdownAudio');

    [...gameScreen.querySelectorAll('*')].forEach(el => {
        if (el.textContent.trim() === '0' && el.id !== 'guessAttempts') el.textContent = '';
    });
    const recentSongs = [];
    const MAX_RECENT = 3;
    if (loadingScreen) loadingScreen.style.display = 'none';
    if (gameScreen) gameScreen.style.display = 'block';


//Song List
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
        { id: 'cNGjD0VG4R8', title: 'Perfect' },
        { id: 'ds18Ozzp8h0', title: 'HONEY (ARE YOU COMING?)'},
        { id: 'WuEJfwhHiC8', title: 'Apple Juice'},
        { id: 'o6aJJ6Q5zhg', title: 'ESPRESSO MACCHIATO'},
        { id: 'uS9A9lqd7-k', title: 'Lets get it started'},
        { id: 'tBKYI3-3lMg', title: 'Armed and dangerous'},
        { id: 'IbpOfzrNjTY', title: 'Feel good INC'},
        { id: 'CYpn8yUnX_c', title: 'I bet you look good on the dance floor'},
        { id: 'lyO-Sveg6a8', title: 'Knee socks'},
        { id: 'SiJie3Z7DG8', title: 'Buddy Holly'},
        { id: 'dLl4PZtxia8', title: 'Hotel California'},
        { id: 'l5t9IXtTr6g', title: 'Creep'},
        { id: 'aqZxIL4YE2I', title: 'September'},
        { id: 'V8gvSEtzOQg', title: 'Empire state of mind'},
        { id: 'glx5u-dBzNQ', title: 'Lydia'},
        { id: 'h66dI0q_9As', title: 'Take me out'},
        { id: 'uU1kRIMj6mQ', title: 'Tribute'},
        { id: 'Z5NoQg8LdDk', title: 'Playing god'},
        { id: '4Q4Gy2Z7xZ0', title: 'Back to black'},
        { id: 'Uz1Jwyxd4tE', title: 'Hate to say I told you so'},
        { id: 'yYDmaexVHic', title: 'Rhinestone eyes'},
        { id: 'dbevJM-2lcY', title: 'Cant hold us'},
        { id: '86un37Ap97s', title: 'Timezone'},
        { id: '9I9c20LHmzY', title: 'Come as you are'},
        { id: 'rb7Il7gnEFs', title: 'Thats what I like'},
        { id: 'OK_b2-w0u60', title: 'Locked out of heaven'},
        { id: '0_T_0TkPl3w', title: 'TEXAS HOLD EM'},
        { id: 'Fza-mF31CuQ', title: 'Crazy In love'},
        { id: 'ho1RzYneMtM', title: 'Bad habits'},
        { id: 'WgxGftJ_OxE', title: 'Rather be'},
        { id: 'IOspC5B69L4', title: 'Real love baby'},
        { id: 'tmIO0eSAXrw', title: 'Good 4 u'},
        { id: 'M4JrFcrNY', title: 'Real slim shady'},
        { id: 'oplra1FJxWI', title: 'Dont look back in anger'},
        { id: '6hzrDeceEKc', title: 'Wonderwall'},
        { id: '5z-lcBJK-FE', title: 'Still into you'},
        { id: 'AJDiYxKSAqQ', title: 'Basket Case'},
        { id: 'l0Yjc5aSgwI', title: 'California Gurls'},
        { id: 'cEin6Kix6xs', title: 'Last friday night'},
        { id: 'mwL1cohnHNE', title: 'Roar'},
        { id: 'SMjFOjmMXac', title: 'Black magic'},
        { id: 'S4oQWgTfCFA', title: 'Wrecking ball'},
        { id: 'vA2Lc9c3qN0', title: 'Party in the USA'},
        { id: 'iawgB2CDCrw', title: 'Flowers'},
        { id: '1_O_T6Aq85E', title: 'Snap out of it'},
        { id: 'AHI7JjJlpYo', title: 'Messy'},
        { id: 'TAZkHYyio-M', title: 'Manchild'},
        { id: 'i-sm16yMZhg', title: 'Freaks'},
        { id: 'R3m6-U89Fxs', title: 'Its raining Men'},
        { id: 'qeSLRXm4TSc', title: 'Paper planes'},
        { id: 'dJ2oPQfbNYc', title: 'Babooshka'},
        { id: '1Ea8Rj2wQ2w', title: 'Telephone'},
        { id: 'hUxSboj-FzI', title: 'Maneater'},
        { id: 'Ce2_k0LaE7E', title: 'S and M'},
        { id: 'QfxNI-bmNJg', title: 'Super Trouper'},
        { id: 'ojvldIzbaMo', title: 'Enjoy the silence'},
        { id: 'sQiPtneudlo', title: 'Mr blue sky'},
        { id: '_17kC1nFQzY', title: 'Jailhouse rock'},
        { id: 'aSQwI3rDETk', title: 'Killer queen'},
        { id: 'Kmz8lbcfs6A', title: 'Price tag'},
        { id: 'UpjaTtNVwEs', title: 'This Charming Man'},
        { id: 'lBsttFDJB2o', title: 'Green green grass'},
        { id: 'v_B3qkp4nO4', title: 'Shotgun'},
        { id: 'l7MaKmKJqoc', title: 'Mr Brightside'},
        { id: 'XjHr-6Zl5P8', title: 'Galway Girl'},
        { id: '7Qp5vcuMIlk', title: 'Castle on the hill'},
        { id: 'liTfD88dbCo', title: 'Shape of you'},
        { id: 'ft3b1-Cm-0M', title: 'Life on mars'},
        { id: 'EZ8ixdXRCOo', title: 'Under pressure'},
        { id: '9sEOyfS40ZE', title: 'Starman'},
        { id: 'TXGbhniTBrU', title: 'We will rock you'},
        { id: 'kwwaWVP2PGE', title: 'Another one bites the dust'},
        { id: 'm3QGB9EfmpY', title: 'Dont stop me now'},
        { id: 'u4H-Zconvlw', title: 'Good luck babe'},
    ];

    let currentSong, player, progressInterval, guessAttempts = 0;
    let userInteracted = false;
    let youtubeAPIReady = false;
    let hasGuessedCorrectly = false;

    async function fetchGlobalGuesses() { return 0; }
    async function incrementGlobalGuesses() { return 0; }

    async function updateTotalGuessesUI() {
        const global = await fetchGlobalGuesses();
        totalGuessesCount.textContent = global;
    }
//Rick assley Easter Egg - Never Gonna Give you up
    function spewRickImages() {
        const container = document.getElementById('rickSpewContainer');
        const numImages = 69; 

        const gravity = 0.5;    
        const bounceFactor = 0.6; 
        const fadeDuration = 3000; 
        const frameRate = 16;     

        const vw = window.innerWidth;
        const vh = window.innerHeight;

        for (let i = 0; i < numImages; i++) {
            const img = document.createElement('img');
            img.src = 'rick.png';
            img.style.position = 'fixed';
            img.style.width = '80px';
            img.style.height = '80px';
            img.style.userSelect = 'none';
            img.style.pointerEvents = 'none';
            img.style.left = `${vw / 2 - 40}px`; 
            img.style.top = `${vh / 2 - 40}px`; 
            img.style.opacity = '1';
            img.style.transition = `opacity ${fadeDuration}ms ease-out`;

            container.appendChild(img);

            let posX = vw / 2 - 40;
            let posY = vh / 2 - 40;
            let velocityX = (Math.random() - 0.5) * 10; 
            let velocityY = (Math.random() - 1) * 15; 
            const mass = 1;

            const floorY = vh - 80; 

            let alive = true;
            const startTime = Date.now();

            function animate() {
                if (!alive) return;

                velocityY += gravity;

                posX += velocityX;
                posY += velocityY;

                if (posY > floorY) {
                    posY = floorY;
                    velocityY = -velocityY * bounceFactor;

                    velocityX *= 0.8;

                    if (Math.abs(velocityY) < 1) {
                        velocityY = 0;
                        velocityX = 0;
                    }
                }

                img.style.left = `${posX}px`;
                img.style.top = `${posY}px`;

                const elapsed = Date.now() - startTime;
                if (elapsed > fadeDuration) {
                    img.style.opacity = '0';
                    alive = false;
                    setTimeout(() => {
                        if (img.parentNode) {
                            container.removeChild(img);
                        }
                    }, fadeDuration);
                    return;
                }

                requestAnimationFrame(animate);
            }

            animate();
        }
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
                    statusMessage.textContent = `❌ Time's up! The song was ${currentSong.title}`;
                    statusMessage.style.cursor = 'pointer';
                    statusMessage.style.animation = 'glowPulse 2s ease-in-out infinite';
                    guessInput.disabled = true;


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
        recentSongs.push(currentSong.id);
        if (recentSongs.length > MAX_RECENT) {
            recentSongs.shift(); 
        }
        console.log("🎶 Now playing:", currentSong.title);

        songNameElem.textContent = '';
        guessAttempts = 0;
        guessAttemptsElem.textContent = 0;
        guessInput.value = '';
        guessInput.disabled = true;
        hasGuessedCorrectly = false;

        const fill = musicScore.querySelector('.progress-fill');
        if (fill) fill.style.width = '0%';

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

                if (normalizeString(currentSong.title) === normalizeString("Never Gonna Give You Up")) {
                    spewRickImages();
                }

                setTimeout(() => {
                    newSongRound();
                }, 4000);
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
                        matrix[i - 1][j] + 1,   
                        matrix[i][j - 1] + 1,  
                        matrix[i - 1][j - 1] + 1 
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
        const score = (maxLen - distance) / maxLen; 

        const partialMatch =
            a.includes(b) || b.includes(a) ? 0.6 : 0;

        return Math.max(score, partialMatch);
    }



    loadingScreen.style.display = 'none';
    gameScreen.style.display = 'block';
    loadYouTubeAPI();
    newSongRound();
});

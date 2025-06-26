const CLIENT_ID = '7b9d5bba9f3d49d4acd592bd258c7528';
const REDIRECT_URI = 'https://JGFM1217.github.io/Music/';
const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
const SCOPES = 'user-read-private user-read-email';
let accessToken = null;
let currentTrack = null;
let currentGuesses = 0;

// Redirect to Spotify login for OAuth token
function redirectToSpotifyLogin() {
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=token&scope=${encodeURIComponent(SCOPES)}`;
    window.location.href = authUrl;
}

// Parse token from URL hash
function getTokenFromUrl() {
    const hash = window.location.hash;
    if (!hash) return null;
    return hash.substring(1).split("&").reduce((acc, item) => {
        const [key, value] = item.split("=");
        acc[key] = decodeURIComponent(value);
        return acc;
    }, {});
}

// Play a random song preview from Spotify
async function playRandomSong() {
    const keywords = ['love', 'fire', 'sky', 'night', 'dream', 'dance'];
    const randomQuery = keywords[Math.floor(Math.random() * keywords.length)];

    const res = await fetch(`https://api.spotify.com/v1/search?q=${randomQuery}&type=track&limit=50`, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });

    const data = await res.json();
    const tracks = data.tracks?.items;
    if (!tracks || tracks.length === 0) return alert("No tracks found, try again.");

    // Pick a random track with a preview URL
    let randomTrack = null;
    for(let i = 0; i < tracks.length; i++) {
        const candidate = tracks[Math.floor(Math.random() * tracks.length)];
        if (candidate.preview_url) {
            randomTrack = candidate;
            break;
        }
    }
    if (!randomTrack) return alert("No playable previews found, try again.");

    currentTrack = {
        name: randomTrack.name,
        albumImage: randomTrack.album.images[0]?.url,
        previewUrl: randomTrack.preview_url
    };

    document.querySelector("h4").textContent = "Current Song: ???";
    document.getElementById("albumArt").innerHTML = '';

    if (window.audio) window.audio.pause();
    window.audio = new Audio(currentTrack.previewUrl);
    window.audio.play();

    currentGuesses = 0;
    document.getElementById("guessCount").textContent = `Current Guesses: 0`;
}

document.addEventListener('DOMContentLoaded', () => {
    const tokenData = getTokenFromUrl();

    if (tokenData && tokenData.access_token) {
        accessToken = tokenData.access_token;
        window.history.replaceState({}, document.title, window.location.pathname);
        playRandomSong();
    } else {
        redirectToSpotifyLogin();
    }

    const textInput = document.getElementById('guess');
    const guessCountDisplay = document.getElementById('guessCount');
    const suggestionsList = document.getElementById('suggestions');

    // Example static song database for suggestions/autocomplete
    const songDatabase = [
        'Shape of You',
        'Blinding Lights',
        'Someone You Loved',
        'Dance Monkey',
        'Bad Guy',
        'Watermelon Sugar',
        'Levitating'
    ];

    // Autocomplete suggestions while typing
    textInput.addEventListener('input', () => {
        const query = textInput.value.toLowerCase();
        suggestionsList.innerHTML = '';

        if (query) {
            const suggestions = songDatabase.filter(song => song.toLowerCase().includes(query));
            suggestions.forEach(song => {
                const li = document.createElement('li');
                li.textContent = song;
                li.style.cursor = 'pointer';
                li.onclick = () => {
                    textInput.value = song;
                    suggestionsList.innerHTML = '';
                };
                suggestionsList.appendChild(li);
            });
        }
    });

    // Handle guesses when Enter key pressed
    textInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && textInput.value.trim() !== '') {
            if (!currentTrack) {
                alert('No song is currently playing.');
                return;
            }

            const guess = textInput.value.trim().toLowerCase();
            currentGuesses++;
            guessCountDisplay.textContent = `Current Guesses: ${currentGuesses}`;

            if (guess === currentTrack.name.toLowerCase()) {
                document.querySelector("h4").textContent = `🎵 ${currentTrack.name}`;
                const img = document.createElement("img");
                img.src = currentTrack.albumImage;
                img.alt = "Album Cover";

                const artDiv = document.getElementById("albumArt");
                artDiv.innerHTML = '';
                artDiv.appendChild(img);

                if (window.audio) window.audio.pause();
            }

            textInput.value = '';
            suggestionsList.innerHTML = '';
        }
    });
});

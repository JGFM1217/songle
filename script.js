document.addEventListener('DOMContentLoaded', () => {
  const textInput = document.getElementById('guess');
  const guessCountDisplay = document.getElementById('guessCount');
  const suggestionsList = document.getElementById('suggestions');
  let currentGuesses = 0;

  // Sample database of song names
  const songDatabase = [
    'Shape of You',
    'Blinding Lights',
    'Someone You Loved',
    'Dance Monkey',
    'Bad Guy',
    'Watermelon Sugar',
    'Levitating'
  ];

  textInput.addEventListener('input', () => {
    const query = textInput.value.toLowerCase();
    suggestionsList.innerHTML = ''; // Clear previous suggestions

    if (query) {
      const suggestions = songDatabase.filter(song => song.toLowerCase().includes(query));
      suggestions.forEach(song => {
        const li = document.createElement('li');
        li.textContent = song;
        li.onclick = () => {
          textInput.value = song; // Set input value to the selected suggestion
          suggestionsList.innerHTML = ''; // Clear suggestions
        };
        suggestionsList.appendChild(li);
      });
    }
  });

  textInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      if (textInput.value.trim() !== '') {
        currentGuesses++;
        guessCountDisplay.textContent = `Current Guesses: ${currentGuesses}`;
        textInput.value = ''; // Clear the input after counting
        suggestionsList.innerHTML = ''; // Clear suggestions
      }
    }
  });
});

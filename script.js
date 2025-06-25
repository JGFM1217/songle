document.addEventListener('DOMContentLoaded', () => {
  const textInput = document.getElementById('guess');
  const guessCountDisplay = document.getElementById('guessCount');
  let currentGuesses = 0;

  textInput.addEventListener('input', () => {
    if (textInput.value.trim() !== '') {
      currentGuesses++;
      guessCountDisplay.textContent = `Current Guesses: ${currentGuesses}`;
      textInput.value = ''; // Clear the input after counting
    }
  });
});

class GameState {
  constructor() {
    this.players = [];
    this.scores = {};
    this.letters = {};
    this.wordGuessed = false;
    this.gameChannel = null;
    this.pendingRestart = null;
    this.currentWord = null;
    this.hintLevel = 0;
    this.hintTimeout = null;
  }

  startGame(playerId, channel) {
    this.players = [playerId];
    this.scores = { [playerId]: 0 };
    this.letters = {};
    this.wordGuessed = false;
    this.gameChannel = channel;
    this.pendingRestart = null;
    this.resetHintState();
  }

  joinGame(playerId) {
    if (this.players.length === 1 && !this.players.includes(playerId)) {
      this.players.push(playerId);
      this.scores[playerId] = 0;
      return true;
    }
    return false;
  }

  submitLetter(playerId, letter) {
    if (this.letters[playerId]) {
      return false; // Already submitted
    }
    this.letters[playerId] = letter.toUpperCase();
    return true;
  }

  areAllLettersSubmitted() {
    return Object.keys(this.letters).length === 2;
  }

  getLetters() {
    return {
      start: this.letters[this.players[0]],
      end: this.letters[this.players[1]]
    };
  }

  addScore(playerId) {
    this.scores[playerId] = (this.scores[playerId] || 0) + 1;
  }

  getScoreboard() {
    return this.players.map(id => ({ id, score: this.scores[id] || 0 }));
  }

  resetRound() {
    this.letters = {};
    this.wordGuessed = false;
    this.resetHintState();
  }

  endGame() {
    this.players = [];
    this.scores = {};
    this.letters = {};
    this.wordGuessed = false;
    this.gameChannel = null;
    this.pendingRestart = null;
    this.resetHintState();
  }

  setPendingRestart(playerId) {
    this.pendingRestart = playerId;
  }

  isValidRestart(playerId) {
    return this.pendingRestart === playerId;
  }

  hasActiveGame() {
    return this.players.length > 0;
  }

  isPlayerInGame(playerId) {
    return this.players.includes(playerId);
  }

  resetHintState() {
    clearTimeout(this.hintTimeout);
    this.currentWord = null;
    this.hintLevel = 0;
    this.hintTimeout = null;
  }

  setCurrentWord(word) {
    this.currentWord = word;
    this.hintLevel = 0;
  }

  incrementHintLevel() {
    this.hintLevel++;
    return this.hintLevel;
  }

  setHintTimeout(timeout) {
    this.hintTimeout = timeout;
  }

  clearHintTimeout() {
    clearTimeout(this.hintTimeout);
    this.hintTimeout = null;
  }

  canGetHint() {
    return this.currentWord && !this.wordGuessed;
  }

  hasActiveHint() {
    return this.currentWord !== null;
  }
}

module.exports = GameState;

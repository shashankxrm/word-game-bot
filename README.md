# Word Game Bot

A Discord bot for playing word games where players submit secret letters and compete to form valid English words.

## Project Structure

```
src/
├── bot.js                 # Main entry point
├── commands/              # Command handlers
│   ├── commandRouter.js   # Routes commands to handlers
│   ├── startCommand.js    # !start command
│   ├── joinCommand.js     # !join command
│   ├── scoreCommand.js    # !score command
│   ├── rulesCommand.js    # !rules command
│   ├── resetCommand.js    # !reset command
│   ├── restartCommand.js  # !restart and !confirm commands
│   └── endCommand.js      # !end command
├── events/                # Event handlers
│   ├── messageCreate.js   # Message creation handler
│   └── ready.js          # Bot ready handler
├── game/                  # Game logic
│   ├── GameState.js      # Game state management
│   ├── gameLogic.js      # Word guessing logic
│   └── dmHandler.js      # DM message handling
├── utils/                 # Utility functions
    ├── clientConfig.js    # Discord client configuration
    ├── embedBuilder.js    # Discord embed creation
    ├── dmHandler.js       # DM sending utilities
    ├── hintSystem.js      # Hint generation and word fetching
    └── wordValidator.js   # Word validation logic
```

## Features

- **Modular Architecture**: Clean separation of concerns with dedicated modules for commands, game logic, events, and utilities
- **Game State Management**: Centralized game state handling with the GameState class
- **Command System**: Organized command routing and handling
- **Word Validation**: Integration with dictionary API for word validation
- **Hint System**: Multi-level hint system with automatic and manual hints
- **Word Generation**: Fetches valid words from Datamuse API for hint generation
- **Rich Embeds**: Beautiful Discord embeds for game messages
- **DM Handling**: Secure letter submission through direct messages

## Commands

- `!start` - Start a new game
- `!join` - Join an existing game
- `!rules` - Display game rules
- `!score` - Show current scoreboard
- `!hint` - Get a manual hint (multiple levels available)
- `!reset` - Reset current round
- `!restart` - Request full game restart
- `!confirm` - Confirm game restart
- `!end` - End the current game

## Hint System

The bot features a sophisticated hint system with multiple levels:

1. **Level 1**: Word length
2. **Level 2**: Jumbled letters
3. **Level 3**: Dictionary definition
4. **Level 4**: Vowel pattern (shows vowels, hides consonants)
5. **Level 5+**: Progressive letter revelation

- **Manual Hints**: Use `!hint` command anytime during a round
- **Automatic Hints**: Bot provides hints every 10 seconds automatically
- **Smart Word Generation**: Uses Datamuse API to generate valid target words

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up your Discord bot token:
   ```bash
   export TOKEN=your_discord_bot_token
   ```

3. Run the bot:
   ```bash
   npm start
   ```

## Development

For development with auto-restart:
```bash
npm run dev
```

## Architecture Benefits

1. **Maintainability**: Each module has a single responsibility
2. **Scalability**: Easy to add new commands or game features
3. **Testability**: Modular structure allows for easy unit testing
4. **Readability**: Clear file organization and naming conventions
5. **Reusability**: Utility functions can be shared across modules

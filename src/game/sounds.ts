import { Audio } from "expo-av";

const jumpSound = require("../../assets/sounds/jump.mp3");
const scoreSound = require("../../assets/sounds/score.mp3");
const gameOverSound = require("../../assets/sounds/game-over.mp3");

export type GameSounds = {
  jump: Audio.Sound;
  score: Audio.Sound;
  gameOver: Audio.Sound;
};

export async function loadGameSounds(): Promise<GameSounds> {
  const [jumpResult, scoreResult, gameOverResult] = await Promise.all([
    Audio.Sound.createAsync(jumpSound, { shouldPlay: false }),
    Audio.Sound.createAsync(scoreSound, { shouldPlay: false }),
    Audio.Sound.createAsync(gameOverSound, { shouldPlay: false }),
  ]);

  return {
    jump: jumpResult.sound,
    score: scoreResult.sound,
    gameOver: gameOverResult.sound,
  };
}

export async function playLoadedSound(sound?: Audio.Sound | null) {
  if (!sound) {
    return;
  }

  try {
    await sound.stopAsync();
    await sound.setPositionAsync(0);
    await sound.playAsync();
  } catch {
    // Keep game running even if sound playback fails
  }
}

export async function unloadGameSounds(sounds?: GameSounds | null) {
  if (!sounds) {
    return;
  }

  try {
    await Promise.all([
      sounds.jump.unloadAsync(),
      sounds.score.unloadAsync(),
      sounds.gameOver.unloadAsync(),
    ]);
  } catch {
    // Keep app running even if unloading fails
  }
}
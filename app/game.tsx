import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";

import GameOverModal from "../src/components/GameOverModal";
import BambooObstacle from "../src/components/BambooObstacle";
import { hasHitObstacle } from "../src/game/collision";
import {
  GAME_LOOP_MS,
  GRAVITY,
  GROUND_HEIGHT,
  JUMP_FORCE,
  KITE_SIZE,
  OBSTACLE_GAP,
  OBSTACLE_WIDTH,
} from "../src/game/constants";
import { Obstacle } from "../src/game/types";
import { getBestScore, saveBestScore } from "../src/storage/scoreStorage";
import { getVibrationEnabled } from "../src/storage/settingsStorage";
import { colors } from "../src/theme/colors";

type Cloud = {
  id: number;
  x: number;
  y: number;
  size: number;
};

const screen = Dimensions.get("window");

const SCREEN_WIDTH = screen.width;
const SCREEN_HEIGHT = screen.height;

const KITE_X = 80;
const START_KITE_Y = SCREEN_HEIGHT / 2 - KITE_SIZE / 2;

function getObstacleSpeed(score: number): number {
  if (score >= 36) {
    return 4.8;
  }

  if (score >= 23) {
    return 4.4;
  }

  if (score >= 13) {
    return 4.0;
  }

  if (score >= 6) {
    return 3.6;
  }

  return 3.2;
}

function createObstacle(id: number, x: number): Obstacle {
  const minGapY = 110;
  const maxGapY = SCREEN_HEIGHT - GROUND_HEIGHT - OBSTACLE_GAP - 90;

  return {
    id,
    x,
    gapY: Math.floor(Math.random() * (maxGapY - minGapY) + minGapY),
    passed: false,
  };
}

function createCloud(id: number): Cloud {
  return {
    id,
    x: SCREEN_WIDTH + 120 + Math.random() * 360,
    y: 60 + Math.random() * 230,
    size: 26 + Math.random() * 18,
  };
}

function getMilestoneMessage(score: number): string {
  const messages: Record<number, string> = {
    5: "Nice Flight!",
    10: "Great Focus!",
    15: "You’re Getting Better!",
    20: "Sky Master!",
    25: "Smooth Flying!",
    30: "Kite Legend Begins!",
    40: "Sharp Reflexes!",
    50: "Half Century Flight!",
    60: "Cloud Rider!",
    75: "Unstoppable!",
    90: "Wind Warrior!",
    100: "Century Score!",
    125: "Elite Flyer!",
    150: "Sky Champion!",
    175: "Insane Control!",
    200: "Double Century!",
    225: "Legendary Focus!",
    250: "Kite Rush Master!",
  };

  return messages[score] ?? "";
}

export default function GameScreen() {
  const [kiteY, setKiteY] = useState(START_KITE_Y);
  const [velocity, setVelocity] = useState(0);

  const [obstacles, setObstacles] = useState<Obstacle[]>([
    createObstacle(1, SCREEN_WIDTH + 120),
    createObstacle(2, SCREEN_WIDTH + 380),
  ]);

  const [clouds, setClouds] = useState<Cloud[]>([
    { id: 1, x: SCREEN_WIDTH + 80, y: 90, size: 38 },
    { id: 2, x: SCREEN_WIDTH + 320, y: 180, size: 30 },
    { id: 3, x: SCREEN_WIDTH + 560, y: 250, size: 34 },
  ]);

  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [milestoneMessage, setMilestoneMessage] = useState("");
  const [isGameOver, setIsGameOver] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isVibrationEnabled, setIsVibrationEnabled] = useState(true);

  const nextObstacleId = useRef(3);
  const nextCloudId = useRef(4);

  useEffect(() => {
    async function loadInitialData() {
      const storedBestScore = await getBestScore();
      const storedVibrationEnabled = await getVibrationEnabled();

      setBestScore(storedBestScore);
      setIsVibrationEnabled(storedVibrationEnabled);
    }

    loadInitialData();
  }, []);

  useEffect(() => {
    if (!milestoneMessage) {
      return;
    }

    const timer = setTimeout(() => {
      setMilestoneMessage("");
    }, 1200);

    return () => clearTimeout(timer);
  }, [milestoneMessage]);

  const endGame = useCallback(async () => {
    if (isGameOver) {
      return;
    }

    setIsGameOver(true);

    if (isVibrationEnabled) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    if (score > bestScore) {
      setBestScore(score);
      await saveBestScore(score);
    }
  }, [bestScore, isGameOver, isVibrationEnabled, score]);

  useEffect(() => {
    if (isGameOver || !hasStarted || isPaused) {
      return;
    }

    const gameLoop = setInterval(() => {
      const currentSpeed = getObstacleSpeed(score);

      setVelocity((currentVelocity) => currentVelocity + GRAVITY);

      setKiteY((currentY) => {
        const nextY = currentY + velocity;

        if (nextY <= 0 || nextY + KITE_SIZE >= SCREEN_HEIGHT - GROUND_HEIGHT) {
          endGame();
          return currentY;
        }

        return nextY;
      });

      setClouds((currentClouds) => {
        let updatedClouds = currentClouds.map((cloud) => ({
          ...cloud,
          x: cloud.x - currentSpeed,
        }));

        updatedClouds = updatedClouds.filter((cloud) => cloud.x > -80);

        if (updatedClouds.length < 3) {
          updatedClouds.push(createCloud(nextCloudId.current));
          nextCloudId.current += 1;
        }

        return updatedClouds;
      });

      setObstacles((currentObstacles) => {
        let updatedObstacles = currentObstacles.map((obstacle) => ({
          ...obstacle,
          x: obstacle.x - currentSpeed,
        }));

        updatedObstacles = updatedObstacles.map((obstacle) => {
          if (!obstacle.passed && obstacle.x + OBSTACLE_WIDTH < KITE_X) {
            setScore((currentScore) => {
              const nextScore = currentScore + 1;
              const message = getMilestoneMessage(nextScore);

              if (message) {
                setMilestoneMessage(message);
              }

              return nextScore;
            });

            return { ...obstacle, passed: true };
          }
          return obstacle;
        });

        updatedObstacles = updatedObstacles.filter(
          (obstacle) => obstacle.x + OBSTACLE_WIDTH > -20
        );

        if (updatedObstacles.length < 2) {
          updatedObstacles.push(
            createObstacle(nextObstacleId.current, SCREEN_WIDTH + 220)
          );
          nextObstacleId.current += 1;
        }

        const collision = updatedObstacles.some((obstacle) =>
          hasHitObstacle({
            kiteX: KITE_X,
            kiteY,
            obstacle,
          })
        );

        if (collision) {
          endGame();
        }

        return updatedObstacles;
      });
    }, GAME_LOOP_MS);

    return () => clearInterval(gameLoop);
  }, [endGame, hasStarted, isGameOver, isPaused, kiteY, score, velocity]);

  async function jump() {
    if (isGameOver || isPaused) {
      return;
    }

    if (!hasStarted) {
      setHasStarted(true);
    }

    setVelocity(JUMP_FORCE);

    if (isVibrationEnabled) {
      await Haptics.selectionAsync();
    }
  }

  function restartGame() {
    setKiteY(START_KITE_Y);
    setVelocity(0);

    setObstacles([
      createObstacle(1, SCREEN_WIDTH + 120),
      createObstacle(2, SCREEN_WIDTH + 380),
    ]);

    setClouds([
      { id: 1, x: SCREEN_WIDTH + 80, y: 90, size: 38 },
      { id: 2, x: SCREEN_WIDTH + 320, y: 180, size: 30 },
      { id: 3, x: SCREEN_WIDTH + 560, y: 250, size: 34 },
    ]);

    setScore(0);
    setMilestoneMessage("");
    setIsGameOver(false);
    setHasStarted(false);
    setIsPaused(false);
    nextObstacleId.current = 3;
    nextCloudId.current = 4;
  }

  return (
    <Pressable style={styles.container} onPress={jump}>
      <View style={styles.sky}>
        <Text style={styles.score}>Score: {score}</Text>
        <Text style={styles.bestScore}>Best: {bestScore}</Text>

        {hasStarted && !isGameOver && (
          <Text
            style={styles.pauseButton}
            onPress={() => setIsPaused((current) => !current)}
          >
            {isPaused ? "Resume" : "Pause"}
          </Text>
        )}

        {clouds.map((cloud) => (
          <Text
            key={cloud.id}
            style={[
              styles.cloud,
              {
                left: cloud.x,
                top: cloud.y,
                fontSize: cloud.size,
              },
            ]}
          >
            ☁️
          </Text>
        ))}

        {!hasStarted && !isGameOver && (
          <View style={styles.startHint}>
            <Text style={styles.startText}>Tap to Start</Text>
          </View>
        )}

        {milestoneMessage ? (
          <View style={styles.milestoneBox}>
            <Text style={styles.milestoneText}>{milestoneMessage}</Text>
          </View>
        ) : null}

        {isPaused && !isGameOver && (
          <View style={styles.pauseOverlay}>
            <Text style={styles.pauseTitle}>Paused</Text>
            <Text style={styles.pauseSubtext}>Take a breath. Then fly again.</Text>
          </View>
        )}

        <View
          style={[
            styles.kite,
            {
              left: KITE_X,
              top: kiteY,
            },
          ]}
        >
          <Text style={styles.kiteEmoji}>🪁</Text>
        </View>

        {obstacles.map((obstacle) => {
          const topHeight = obstacle.gapY;
          const bottomTop = obstacle.gapY + OBSTACLE_GAP;
          const bottomHeight = SCREEN_HEIGHT - GROUND_HEIGHT - bottomTop;

          return (
            <View key={obstacle.id}>
              <BambooObstacle left={obstacle.x} top={0} height={topHeight} />

              <BambooObstacle left={obstacle.x} top={bottomTop} height={bottomHeight} />
            </View>
          );
        })}

        <View style={styles.ground}>
          <Text style={styles.groundText}>KITE RUSH</Text>
        </View>

        {isGameOver && (
          <GameOverModal
            score={score}
            bestScore={bestScore}
            onRestart={restartGame}
            onHome={() => router.replace("/")}
          />
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sky: {
    flex: 1,
    backgroundColor: colors.sky,
    overflow: "hidden",
  },
  score: {
    position: "absolute",
    top: 54,
    left: 24,
    color: colors.text,
    fontSize: 24,
    fontWeight: "900",
    zIndex: 10,
  },
  bestScore: {
    position: "absolute",
    top: 86,
    left: 24,
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
    zIndex: 10,
  },
  pauseButton: {
    position: "absolute",
    top: 54,
    right: 24,
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
    backgroundColor: "rgba(0,0,0,0.35)",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    zIndex: 30,
  },
  cloud: {
    position: "absolute",
    opacity: 0.42,
    zIndex: 1,
  },
  startHint: {
    position: "absolute",
    top: "42%",
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.35)",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 999,
    zIndex: 20,
  },
  startText: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "900",
  },
  pauseOverlay: {
    position: "absolute",
    top: "38%",
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingVertical: 22,
    paddingHorizontal: 28,
    borderRadius: 24,
    alignItems: "center",
    zIndex: 25,
  },
  pauseTitle: {
    color: colors.primary,
    fontSize: 32,
    fontWeight: "900",
    marginBottom: 8,
  },
  pauseSubtext: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
  kite: {
    position: "absolute",
    width: KITE_SIZE,
    height: KITE_SIZE,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 8,
  },
  kiteEmoji: {
    fontSize: 38,
  },
  obstacle: {
    position: "absolute",
    width: OBSTACLE_WIDTH,
    backgroundColor: colors.bamboo,
    borderWidth: 4,
    borderColor: "#8B5E34",
    borderRadius: 14,
    zIndex: 5,
  },
  ground: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: GROUND_HEIGHT,
    backgroundColor: "#3A5A40",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 6,
  },
  groundText: {
    color: "rgba(255,255,255,0.35)",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 4,
  },
  milestoneBox: {
    position: "absolute",
    top: "28%",
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.35)",
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 999,
    zIndex: 22,
  },
  milestoneText: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: "900",
  },
});
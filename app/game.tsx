import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useRef, useState } from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";

import { getVibrationEnabled } from "../src/storage/settingsStorage";
import GameOverModal from "../src/components/GameOverModal";
import { hasHitObstacle } from "../src/game/collision";
import {
    GAME_LOOP_MS,
    GRAVITY,
    GROUND_HEIGHT,
    JUMP_FORCE,
    KITE_SIZE,
    OBSTACLE_GAP,
    OBSTACLE_SPEED,
    OBSTACLE_WIDTH,
} from "../src/game/constants";
import { Obstacle } from "../src/game/types";
import { getBestScore, saveBestScore } from "../src/storage/scoreStorage";
import { colors } from "../src/theme/colors";

const screen = Dimensions.get("window");

const SCREEN_WIDTH = screen.width;
const SCREEN_HEIGHT = screen.height;

const KITE_X = 80;
const START_KITE_Y = SCREEN_HEIGHT / 2 - KITE_SIZE / 2;

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

export default function GameScreen() {
    const [kiteY, setKiteY] = useState(START_KITE_Y);
    const [velocity, setVelocity] = useState(0);

    const [obstacles, setObstacles] = useState<Obstacle[]>([
        createObstacle(1, SCREEN_WIDTH + 120),
        createObstacle(2, SCREEN_WIDTH + 380),
    ]);

    const [score, setScore] = useState(0);
    const [bestScore, setBestScore] = useState(0);
    const [isGameOver, setIsGameOver] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isVibrationEnabled, setIsVibrationEnabled] = useState(true);

    const nextObstacleId = useRef(3);

    useEffect(() => {
        async function loadInitialData() {
            const storedBestScore = await getBestScore();
            const storedVibrationEnabled = await getVibrationEnabled();

            setBestScore(storedBestScore);
            setIsVibrationEnabled(storedVibrationEnabled);
        }

        loadInitialData();
    }, []);

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
            setVelocity((currentVelocity) => currentVelocity + GRAVITY);

            setKiteY((currentY) => {
                const nextY = currentY + velocity;

                if (nextY <= 0 || nextY + KITE_SIZE >= SCREEN_HEIGHT - GROUND_HEIGHT) {
                    endGame();
                    return currentY;
                }

                return nextY;
            });

            setObstacles((currentObstacles) => {
                let updatedObstacles = currentObstacles.map((obstacle) => ({
                    ...obstacle,
                    x: obstacle.x - OBSTACLE_SPEED,
                }));

                updatedObstacles = updatedObstacles.map((obstacle) => {
                    if (!obstacle.passed && obstacle.x + OBSTACLE_WIDTH < KITE_X) {
                        setScore((currentScore) => currentScore + 1);
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
    }, [endGame, hasStarted, isGameOver, isPaused, kiteY, velocity]);

    async function jump() {
        if (isGameOver) {
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
        setScore(0);
        setIsGameOver(false);
        setHasStarted(false);
        setIsPaused(false);
        nextObstacleId.current = 3;
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

                {!hasStarted && !isGameOver && (
                    <View style={styles.startHint}>
                        <Text style={styles.startText}>Tap to Start</Text>
                    </View>
                )}

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
                            <View
                                style={[
                                    styles.obstacle,
                                    {
                                        left: obstacle.x,
                                        top: 0,
                                        height: topHeight,
                                    },
                                ]}
                            />

                            <View
                                style={[
                                    styles.obstacle,
                                    {
                                        left: obstacle.x,
                                        top: bottomTop,
                                        height: bottomHeight,
                                    },
                                ]}
                            />
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
    },
    groundText: {
        color: "rgba(255,255,255,0.35)",
        fontSize: 22,
        fontWeight: "900",
        letterSpacing: 4,
    },
});
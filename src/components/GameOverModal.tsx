import { Share, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";
import GameButton from "./GameButton";

type GameOverModalProps = {
    score: number;
    bestScore: number;
    onRestart: () => void;
    onHome: () => void;
};

export default function GameOverModal({
    score,
    bestScore,
    onRestart,
    onHome,
}: GameOverModalProps) {
    return (
        <View style={styles.overlay}>
            <View style={styles.card}>
                <Text style={styles.title}>Game Over</Text>
                <Text style={styles.score}>Score: {score}</Text>
                <Text style={styles.best}>Best: {bestScore}</Text>

                <View style={styles.buttons}>
                    <GameButton
                        title="Share Score"
                        onPress={() =>
                            Share.share({
                                message: `I scored ${score} in Kite Glide 🪁 Can you beat me?`,
                            })
                        }
                    />

                    <GameButton title="Restart" onPress={onRestart} />

                    <GameButton title="Home" onPress={onHome} variant="secondary" />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        backgroundColor: "rgba(0,0,0,0.55)",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        zIndex: 999,
        elevation: 999,
    },
    card: {
        width: "100%",
        backgroundColor: colors.card,
        borderRadius: 28,
        padding: 24,
        alignItems: "center",
    },
    title: {
        color: colors.primary,
        fontSize: 34,
        fontWeight: "900",
        marginBottom: 12,
    },
    score: {
        color: colors.text,
        fontSize: 24,
        fontWeight: "800",
        marginBottom: 8,
    },
    best: {
        color: colors.mutedText,
        fontSize: 18,
        marginBottom: 20,
    },
    buttons: {
        width: "100%",
    },
});
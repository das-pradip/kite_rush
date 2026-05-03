import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import GameButton from "../src/components/GameButton";
import { colors } from "../src/theme/colors";

export default function HowToPlayScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>How to Play</Text>

      <View style={styles.card}>
        <Text style={styles.point}>🪁 Tap anywhere to make the kite fly up.</Text>
        <Text style={styles.point}>⬇️ Gravity pulls the kite down.</Text>
        <Text style={styles.point}>🎋 Avoid bamboo obstacles.</Text>
        <Text style={styles.point}>⭐ Pass obstacles to increase score.</Text>
        <Text style={styles.point}>🏆 Try to beat your best score.</Text>
      </View>

      <GameButton title="Back Home" onPress={() => router.back()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: colors.background,
    justifyContent: "center",
  },
  title: {
    color: colors.primary,
    fontSize: 36,
    fontWeight: "900",
    marginBottom: 24,
    textAlign: "center",
  },
  card: {
    backgroundColor: colors.card,
    padding: 24,
    borderRadius: 24,
    marginBottom: 28,
  },
  point: {
    color: colors.text,
    fontSize: 18,
    marginBottom: 18,
    lineHeight: 26,
  },
});
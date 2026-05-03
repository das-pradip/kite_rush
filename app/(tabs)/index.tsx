import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import GameButton from "../../src/components/GameButton";
import { colors } from "../../src/theme/colors";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.kite}>🪁</Text>
        <Text style={styles.title}>Kite Rush</Text>
        <Text style={styles.subtitle}>
          Tap. Fly. Dodge. Beat your best score.
        </Text>
      </View>

      <View style={styles.menu}>
        <GameButton title="Play" onPress={() => router.push("/game")} />

        <GameButton
          title="How to Play"
          onPress={() => router.push("/how-to-play")}
          variant="secondary"
        />

        <GameButton
          title="Settings"
          onPress={() => router.push("/settings")}
          variant="secondary"
        />
      </View>

      <Text style={styles.footer}>Made with love for quick fun ❤️</Text>
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
  hero: {
    alignItems: "center",
    marginBottom: 48,
  },
  kite: {
    fontSize: 82,
    marginBottom: 10,
  },
  title: {
    color: colors.primary,
    fontSize: 46,
    fontWeight: "900",
    letterSpacing: 1,
  },
  subtitle: {
    color: colors.mutedText,
    fontSize: 17,
    textAlign: "center",
    marginTop: 10,
    lineHeight: 24,
  },
  menu: {
    width: "100%",
  },
  footer: {
    color: colors.mutedText,
    textAlign: "center",
    marginTop: 36,
  },
});
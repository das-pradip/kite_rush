import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import GameButton from "../src/components/GameButton";
import { colors } from "../src/theme/colors";

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.card}>
        <Text style={styles.text}>Sound: Coming soon</Text>
        <Text style={styles.text}>Vibration: Enabled</Text>
        <Text style={styles.note}>
          We are keeping version 1 simple and smooth.
        </Text>
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
  text: {
    color: colors.text,
    fontSize: 18,
    marginBottom: 14,
  },
  note: {
    color: colors.mutedText,
    fontSize: 15,
    marginTop: 8,
  },
});
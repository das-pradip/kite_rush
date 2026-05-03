import { Pressable, StyleSheet, Text } from "react-native";
import { colors } from "../theme/colors";

type GameButtonProps = {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger";
};

export default function GameButton({
  title,
  onPress,
  variant = "primary",
}: GameButtonProps) {
  const backgroundColor =
    variant === "danger"
      ? colors.danger
      : variant === "secondary"
      ? colors.card
      : colors.primary;

  const textColor = variant === "primary" ? "#1A1A1A" : colors.text;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor, transform: [{ scale: pressed ? 0.97 : 1 }] },
      ]}
    >
      <Text style={[styles.text, { color: textColor }]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
    marginVertical: 8,
    elevation: 4,
  },
  text: {
    fontSize: 18,
    fontWeight: "800",
  },
});
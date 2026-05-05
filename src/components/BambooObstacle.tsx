import { StyleSheet, View } from "react-native";
import { OBSTACLE_WIDTH } from "../game/constants";

type BambooObstacleProps = {
  left: number;
  top: number;
  height: number;
};

export default function BambooObstacle({
  left,
  top,
  height,
}: BambooObstacleProps) {
  return (
    <View style={[styles.wrapper, { left, top, height }]}>
      <View style={styles.mainBody}>
        <View style={styles.highlight} />

        <View style={[styles.nodeBand, { top: "18%" }]}>
          <View style={styles.nodeLine} />
        </View>

        <View style={[styles.nodeBand, { top: "46%" }]}>
          <View style={styles.nodeLine} />
        </View>

        <View style={[styles.nodeBand, { top: "74%" }]}>
          <View style={styles.nodeLine} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    width: OBSTACLE_WIDTH,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#8BAE56",
    borderWidth: 3,
    borderColor: "#567A2E",
    zIndex: 5,
  },
  mainBody: {
    flex: 1,
    backgroundColor: "#9FCC65",
    justifyContent: "flex-start",
  },
  highlight: {
    position: "absolute",
    left: 8,
    top: 0,
    bottom: 0,
    width: 10,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 999,
  },
  nodeBand: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 14,
    backgroundColor: "#7EA14D",
    justifyContent: "center",
  },
  nodeLine: {
    height: 3,
    marginHorizontal: 6,
    borderRadius: 999,
    backgroundColor: "rgba(86,122,46,0.8)",
  },
});
import { KITE_SIZE, OBSTACLE_GAP, OBSTACLE_WIDTH } from "./constants";
import { Obstacle } from "./types";

type CollisionParams = {
  kiteX: number;
  kiteY: number;
  obstacle: Obstacle;
};

export function hasHitObstacle({
  kiteX,
  kiteY,
  obstacle,
}: CollisionParams): boolean {
  const kiteLeft = kiteX;
  const kiteRight = kiteX + KITE_SIZE;
  const kiteTop = kiteY;
  const kiteBottom = kiteY + KITE_SIZE;

  const obstacleLeft = obstacle.x;
  const obstacleRight = obstacle.x + OBSTACLE_WIDTH;

  const isHorizontallyTouching =
    kiteRight > obstacleLeft && kiteLeft < obstacleRight;

  if (!isHorizontallyTouching) {
    return false;
  }

  const gapTop = obstacle.gapY;
  const gapBottom = obstacle.gapY + OBSTACLE_GAP;

  const isInsideGap = kiteTop > gapTop && kiteBottom < gapBottom;

  return !isInsideGap;
}
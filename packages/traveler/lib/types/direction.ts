export enum Direction {
  UNAVAILABLE = -1,
  TOP = 0,
  BOTTOM = 1,
  LEFT = 2,
  RIGHT = 3,
  TOP_LEFT = 4,
  TOP_RIGHT = 5,
  BOTTOM_LEFT = 6,
  BOTTOM_RIGHT = 7,
}

export function directionToString(direction: Direction) {
  return {
    [Direction.UNAVAILABLE]: 'UNAVAILABLE',
    [Direction.TOP]: 'TOP',
    [Direction.BOTTOM]: 'BOTTOM',
    [Direction.LEFT]: 'LEFT',
    [Direction.RIGHT]: 'RIGHT',
    [Direction.TOP_LEFT]: 'TOP_LEFT',
    [Direction.TOP_RIGHT]: 'TOP_RIGHT',
    [Direction.BOTTOM_LEFT]: 'BOTTOM_LEFT',
    [Direction.BOTTOM_RIGHT]: 'BOTTOM_RIGHT',
  }[direction];
}

export const getDirection = (deg: number): Direction => {
  let direction = Direction.UNAVAILABLE;
  if (67.5 < deg && 112.5 >= deg) {
    direction = Direction.TOP;
  } else if (157.5 < deg && 202.5 >= deg) {
    direction = Direction.RIGHT;
  } else if (247.5 < deg && 292.5 >= deg) {
    direction = Direction.BOTTOM;
  } else if (22.5 < deg && 67.5 >= deg) {
    direction = Direction.TOP_LEFT;
  } else if (112.5 < deg && 157.5 >= deg) {
    direction = Direction.TOP_RIGHT;
  } else if (292.5 < deg && 337.5 >= deg) {
    direction = Direction.BOTTOM_LEFT;
  } else if (202.5 < deg && 247.5 >= deg) {
    direction = Direction.BOTTOM_RIGHT;
  } else if ((0 <= deg && 22.5 >= deg) || deg > 337.5) {
    direction = Direction.LEFT;
  }
  return direction;
};

export const directionToDeg = (direction: number): number => {
  if (direction == Direction.TOP) {
    return 90;
  } else if (direction == Direction.RIGHT) {
    return 180;
  } else if (direction == Direction.BOTTOM) {
    return 270;
  } else if (direction == Direction.TOP_LEFT) {
    return 45;
  } else if (direction == Direction.TOP_RIGHT) {
    return 135;
  } else if (direction == Direction.BOTTOM_LEFT) {
    return 315;
  } else if (direction == Direction.BOTTOM_RIGHT) {
    return 225;
  } else {
    return 0;
  }
};

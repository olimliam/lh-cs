export interface visitLog {
  spaceId: string;
  spaceTitle: string;
  visitorID: string;
  userId: number;
  travelID: string;
  liveTourId: string;
  tourId: string;
  tourTitle: string;
  sceneId: number;
  sceneTitle: string;
  startingPointId: number;
  startingPointTitle: string;
  themeId: number;
  themeTitle: string;
  timeSpentMs: number;
  travelOrder: number;
  langCode: string;
  devicePlatform: string;
  spaceTags: string;
}

export interface clickLog {
  spaceId: string;
  spaceTitle: string;
  visitorID: string;
  userId: number;
  travelID: string;
  liveTourId: string;
  tourId: string;
  tourTitle: string;
  sceneId: number;
  sceneTitle: string;
  startingPointId: number;
  startingPointTitle: string;
  themeId: number;
  themeTitle: string;
  markerId: number;
  markerTitle: string;
  markerDisplayType: number;
  markerContentType: string;
  clickOrder: number;
  langCode: string;
  devicePlatform: string;
  spaceTags: string;
}

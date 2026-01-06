/**
 * @Note 기존에 존재하던 MarkerOption인 경우 Traveler를 prefix로 붙여 TravelerMarkerOption으로 사용한다.
 *        Traveler를 위해 만들어진 MarkerOption들도 초기 생성시 MarkerOption prefix를 붙인다.
 */

import { MarkerContent, MarkerOptionPortal, Tour, TourScene } from './tour';

export interface TravelerTour extends Tour {
  i18nOpeningText?: { [key: string]: string };
  bgmUrl?: string;
}

export type TravelerMarkerContent =
  | MarkerContent
  | MarkerOptionLayering
  | MarkerOptionPopup
  | MarkerOptionTour;

export type MarkerOptionLayer = {
  sceneId: number;
  imgUrl: string;
};

export type MarkerOptionLayeringItem = {
  id: number;
  name: string;
  thumbnailImgUrl: string;
  layerList: MarkerOptionLayer[];
  metaData: { [key: string]: string | number };
};

export type MarkerOptionLayering = {
  filteringFields: string[];
  itemList: MarkerOptionLayeringItem[];
};

export type MarkerOptionPopup = {
  title: string;
  description: string;
  // @typescript-eslint/no-explicit-any
  metaData: { [key: string]: any };
};

export type MarkerOptionTour = {
  tourId: string;
  // @typescript-eslint/no-explicit-any
  metaData: { [key: string]: any };
};

export interface TravelerMarkerOptionPortal extends MarkerOptionPortal {
  metaData: { [key: string]: string | number };
}

export interface TourSceneSpot
  extends Pick<TourScene, 'id' | 'title' | 'metaData'> {
  description?: string;
}

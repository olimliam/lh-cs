import { AnimationTypeKeys } from './o3d';

export enum TourPermission {
  MASTER = 1,
  EDITOR = 2,
  VIEWER = 3,
}

export enum TourGeometryUseType {
  theme = 0,
  marker = 1,
  themeDefault = 2, // 테마 기본 스페이스 영역
}

export enum TourGeometryBorderEffect {
  outerGlow = 'outerGlow',
  innerGlow = 'innerGlow',
}

export enum TourMarkerDisplayType {
  icon = 1, // 기존 icon과 동일
  geometry = 2, // 투명마커
  image = 3, // 기존 viewer와 동일
  video = 4, // 기존 viewer와 동일
  videoLink = 5, // 기존 viewer와 동일
  text = 6, // 텍스트 마커 (신규 추가)
  html = 7, // iframe 마커 (신규 추가)
  icons = 8, // tts 마커 (신규 추가)
  ad = 9, // ad viewer (신규 추가)
  mesh = 10, // mesh (신규 추가)
}

export enum TourGeometryMarkerBorderColor {
  red = '#FF0013',
  blue = '#1D66EF',
  green = '#00D58B',
  white = '#FFFFFF',
  black = '#000000',
}

export enum TourmoveButtonType {
  circle = 'circle',
  arrow = 'arrow',
}

export enum TourMenuOption {
  importantThumbnail = 'importantThumbnail',
  importantList = 'importantList',
}

export enum TourMenuHeader {
  minimap = 'map',
  highlight = 'highlight',
  autoplay = 'autoplay',
  lang = 'lang',
  theme = 'theme',
  themeList = 'themeList',
  floor = 'floor',
  origin = 'origin',
  fullscreen = 'fullscreen',
  info = 'info',
}

export enum TourTextMarkerFontFamily {
  nanumSquareNeo = 'NanumSquareNeo',
  serif = 'serif',
  sansSerif = 'sans-serif',
  monospace = 'monospace',
  cursive = 'cursive',
  fantasy = 'fantasy',
}

export enum TourTextMarkerFontWeight {
  bold = 'bold',
  regular = 'normal',
  light = 'lighter',
}

export enum TourDisplayResourceIconType {
  on = 'on',
  off = 'off',
}

export enum TourTextMarkerAlign {
  left = 'left',
  center = 'center',
  right = 'right',
}

export enum TourMarkerDisplayAdType {
  image = 'image',
  video = 'video',
}

export interface TourMarkerDisplayIcon {
  url: string;
  animationType: AnimationTypeKeys;
}

export interface TourMarkerDisplayMesh {
  url: string;
}

export interface TourMarkerDisplayGeometry {
  id: number | null;
  borderColor: string;
  borderEffect?: TourGeometryBorderEffect;
  // pluginPivot?: boolean;
}

export interface TourMarkerDisplayContent {
  url: string;
}

export interface TourMarkerDisplayVideoDefault {
  url: string;
  muted?: boolean;
  loop?: boolean;
  hasChromaKey?: boolean;
  chromaKey?: string;
}

export interface TourMarkerDisplayHtml {
  type: 'url' | 'html';
  url?: string;
  htmlContent?: string;
  embedType?: string;
  scrollable?: boolean;
  directFlag?: boolean;
}

export interface TourMarkerDisplayVideo extends TourMarkerDisplayVideoDefault {
  autoplay?: boolean;
}

export interface TourMarkerDisplayText {
  value: string;
  glowEffect?: boolean;
  glowColor?: string;
  fontColor?: string;
  fontSize?: number;
  lineSpace?: number;
  fontWeight?: TourTextMarkerFontWeight;
  fontFamily?: TourTextMarkerFontFamily;
  textAlign?: TourTextMarkerAlign;
}

export interface TourDisplayResourceIcon {
  type: TourDisplayResourceIconType;
  url?: string;
}

export interface TourMarkerDisplayIcons {
  icons: Array<TourDisplayResourceIcon>;
}

export interface TourMarkerDisplayAd {
  type: TourMarkerDisplayAdType;
}

/**
 * @Note enum이므로 extends할 수 없어어 새로운 값들을 가장 하위에 추가하고 주석처리.
 */
export enum TourMarkerType {
  image = 'image',
  video = 'video',
  link = 'link',
  iframe = 'iframe',
  chat = 'chat',
  videochat = 'videochat', // 화상채팅
  inquiry = 'inquiry',
  icon = 'icon', // info
  portal = 'portal',
  tts = 'tts',
  pdf = 'pdf',
  shop = 'shop',
  none = 'none', // viewer case

  /**
   * @Note Traveler 추가
   */
  layering = 'layering',
  popup = 'popup',
  changeTour = 'change-tour',
}

export enum TourMarkerVideoType {
  vimeo = 'vimeo',
  youtube = 'youtube',
  html5 = 'html5',
}

export enum TourNoticePosition {
  TOP_LEFT = 'topLeft',
  TOP_RIGHT = 'topRight',
  BOTTOM_LEFT = 'bottomLeft',
  BOTTOM_RIGHT = 'bottomRight',
}

export enum TourCreateType {
  user = 'USER',
  plugin = 'PLUGIN',
  template = 'TEMPLATE',
}

export enum TourSaveFlag {
  create = 'create',
  update = 'update',
  delete = 'delete',
}

export enum TourLayerStatus {
  NONE = 'none',
  DONE = 'done',
  FAIL = 'fail',
  WORKING = 'working',
}

export enum FovSizes {
  MINIMUM = 0.6,
  NORMAL = 1.05,
  MAXIMUM = 1.5,
}

export enum ServiceType {
  DEFAULT = 'default',
  SOCIAL = 'social',
  WHITEBOARD = 'whiteboard',
  SURVEY = 'survey',
  DOCUMENT = 'document',
  CALENDER = 'calender',
  MAP = 'map',
}

export interface TourSummary {
  allSceneTags: string;
  chatting: boolean;
  contactForm: boolean;
  createAt?: string;
  defaultThemeID: number;
  description: string;
  id: string;
  insight: boolean;
  isSample: boolean;
  language?: string;
  logo: string;
  notices?: TourNotice[];
  openingText: string;
  projectID: string;
  startingSceneID?: number;
  tag: string;
  thumbnailURL: string;
  title: string;
  updateAt?: string;
}

export interface Tour extends TourSummary {
  fov: number;
  speed: number;
  isLimitYaw?: boolean;
  isLimitPitch?: boolean;
  permission: TourPermission;
  moveButtonType: TourmoveButtonType;
  moveCircleSize: number;
  geometries: Array<TourGeometry>;
  markers: Array<TourMarker>;
  menus: Array<TourMenu>;
  minimaps: Array<TourKeymap>;
  scenes: Array<TourScene>;
  themes: Array<TourTheme>;
  createType?: TourCreateType;

  flag?: TourSaveFlag;
}

export interface TourMenu {
  id: number | string;
  tourID: string;
  header: TourMenuHeader;
  title: string;
  icon?: string;
  hasParent: boolean;
  active: boolean;
  menuOrder: number;
  option: TourMenuOption;
  flag?: TourSaveFlag;
}

export interface TourTheme {
  id: number;
  title: string;
  order: number;
  defaultGeometryID?: number;
  geometryID?: number;
  minimapID?: number;

  flag?: TourSaveFlag;
}

export interface TourKeymap {
  fileName: string;
  id: number;
  title: string;
  url: string;
  scaleX: number;
  scaleY: number;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  order: number;

  flag?: TourSaveFlag;
}

export interface TourScene {
  id: number;
  title: string;
  description: string;
  importantPlace: boolean;
  x: number;
  y: number;
  z: number;
  offset: number;
  fileSize: number;
  updateAt: number;
  usedTag: string;

  yaw: number;
  pitch: number;
  roll: number;

  layers: Array<TourLayer>;
  links: Array<TourLink>;

  flag?: TourSaveFlag;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metaData?: { [key: string]: any };
}

export interface TourLayer {
  id: number;
  sceneID: number;
  title: string;
  status: TourLayerStatus;
  fileName: string;
  fileSize: number;
  themeID: number;
  originImg: string;
  resizedImg: string;
  lightWeightImg?: string;
  convertedImg: string;
  overriddenMarkers: Array<TourOverrideMarker>;
  invisibleMarkers: Array<TourInvisibleMarker>;

  flag?: TourSaveFlag;
}

export interface TourMarkerInfo {
  x: number;
  y: number;
  z: number;
  yaw?: number;
  pitch?: number;
  roll?: number;
  width?: number;
  height?: number;
  depth?: number;
  billboard?: boolean;
  showTitle?: boolean;
  isIndicator?: boolean;
  localID?: string;

  isEditable?: boolean;
  isVisible?: boolean;

  modifiedAt?: string | null;

  flag?: TourSaveFlag;
}

export interface MarkerOptionUrl {
  url: string;
}

export interface MarkerOptionUrls {
  urls: string[];
}

export interface MarkerOptionChannel {
  channelID: number;
}

export interface MarkerOptionContact {
  contactID: number;
}

export interface MarkerOptionIframe {
  type: 'url' | 'html';
  url?: string;
  htmlContent?: string;
  embedType?: string;
  directFlag?: boolean;
}

export interface MarkerOptionLink {
  type: 'outlink' | 'inlink';
  url: string;
}

export interface MarkerOptionPortal {
  sceneID: number;
}

export interface MarkerOptionVideochat {
  sceneID: number;
  moreSceneIDs: Array<number>;
  maxMember: number;
  roomID: string;
}

export interface MarkerOptionTTS {
  url: string;
  captionText: string;
  language: string;
  voice: string;
  sceneID: number;
  loop: boolean;
  captionFlag: boolean;
  moreSceneIDs: Array<number>;
}

export interface MarkerOptionPDFData {
  type: 'file' | 'url';
  title: string;
  fileName: string;
  url: string;
}

export interface MarkerOptionPDF {
  pdfs: Array<MarkerOptionPDFData>;
}

export enum ShopifyItemType {
  PRODUCT = 'product',
  COLLECTION = 'collection',
}

export interface MarkerOptionShop {
  shopifyToken: string;
  shopifyDomain: string;
  shopifyItemType: ShopifyItemType;
  shopifyItemID: string;
}

export interface TourMarkerGeneric<T, W> extends TourMarkerInfo {
  id: number | string;
  tourID: string;
  title: string;
  titleShow: boolean;
  description: string;
  displayType: TourMarkerDisplayType;
  displayResource: T;
  contentType: TourMarkerType;
  content: W; // option에서 content로 필드명 변경
  flag?: TourSaveFlag;
}

export type TourMarkerDisplay =
  | TourMarkerDisplayIcon
  | TourMarkerDisplayGeometry
  | TourMarkerDisplayContent
  | TourMarkerDisplayVideoDefault
  | TourMarkerDisplayVideo
  | TourMarkerDisplayHtml
  | TourMarkerDisplayText
  | TourMarkerDisplayIcons
  | TourMarkerDisplayAd
  | TourMarkerDisplayMesh;

export type MarkerContent =
  | MarkerOptionUrls
  | MarkerOptionUrl
  | MarkerOptionLink
  | MarkerOptionIframe
  | MarkerOptionChannel
  | MarkerOptionContact
  | MarkerOptionPortal
  | MarkerOptionVideochat
  | MarkerOptionTTS
  | MarkerOptionPDF
  | MarkerOptionShop
  | string // MarkerType : Icon
  | null;

export type TourMarker = TourMarkerGeneric<TourMarkerDisplay, MarkerContent>;

export interface TourOverrideMarker extends TourMarkerInfo {
  markerID: number | string;

  flag?: TourSaveFlag;
}

export interface TourLink {
  destSceneID: number;

  flag?: TourSaveFlag;
}

export interface TourNotice {
  id: number | string;
  text: string;
  active: boolean;
  position: TourNoticePosition;
  offsetY: number;
  fontSize: number;
  color: string;

  flag?: TourSaveFlag;
}

export interface TourGeometry {
  id: number;
  title: string;
  tourID: string;
  url: string;
  x: number;
  y: number;
  z: number;
  yaw: number;
  pitch: number;
  scale: number;
  fileSize: number;
  useType: TourGeometryUseType;
  flag?: TourSaveFlag;
  createdAt: string;
  updatedAt: string;

  width?: number;
  height?: number;
  objStr?: string;
}

export interface DeleteGeometry {
  deletedId: number;
  affectedThemeIds: number[];
  affectedMarkerIds: number[];
}

export interface TourGeometries {
  geometries: TourGeometry[];
}

export interface TourInvisibleMarker {
  markerID: number | string;
  localID?: number | string;

  flag?: TourSaveFlag;
}

export interface TourMarkerVisibleInfo {
  themeID: number;
  layerID: number;
  visible: boolean;
}

export interface EmbedList {
  serviceType: ServiceType;
  serviceName: string;
  serviceDesc: string;
  iconUrl: string;
  validKeyword: string[];
  serviceGuide: string;
}

export interface TourViewParam {
  yaw: number;
  pitch: number;
  roll: number;
  fov: number;
}

export type TourQualityType = 'origin' | 'light';

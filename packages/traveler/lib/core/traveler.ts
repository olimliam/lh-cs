import {
  Engine,
  Scene,
  UniversalCamera,
  HemisphericLight,
  PhotoDome,
  Mesh,
  Material,
  Animation,
  AnimationGroup,
  AnimationEvent,
  ActionManager,
  SineEase,
  EasingFunction,
  Sound,
  Color3,
  Color4,
  Vector2,
  Vector3,
  AbstractMesh,
  PointerEventTypes,
  IPointerEvent,
  PickingInfo,
  DefaultLoadingScreen,
  WebRequest,
  EngineOptions,
} from '@babylonjs/core';
import { Inspector } from '@babylonjs/inspector';
import { IWheelEvent, ScreenshotTools } from '@babylonjs/core';
import { AdvancedDynamicTexture, Control, Image } from '@babylonjs/gui';
import { v4 as uuidv4 } from 'uuid';

import { SUPPORTED_LANG_CODE } from '../enums/lang-code.enum';
import PointerImage from '../assets/images/pointer.png';

// import ClickEffectSound from '../assets/sounds/notification.mp3';
// import FootStepSound from '../assets/sounds/footstep.mp3';

import Place from '../models/place';
import Spot from '../models/spot';
import { CONFIG } from '../constants/config';
import { TourMarkerType } from '../types/tour';
import {
  TravelerMarkerContent,
  TravelerTour,
  TourSceneSpot,
} from '../types/traveler-tour';
import { MoveToTargetSpotOptions, RemotePointerState } from '../types/traveler';

type LocalPointerClickHandler =
  | ((norm: { x: number; y: number }) => void)
  | ((
      id: number,
      name?: string,
      description?: string,
      contentType?: TourMarkerType,
      contentData?: TravelerMarkerContent
    ) => void);

class Traveler {
  static instance: Traveler | null = null;

  #canvas!: HTMLCanvasElement;
  private isLoading: boolean;

  #engine!: Engine;
  #scene!: Scene;
  // #light!: Light;
  #camera!: UniversalCamera;

  #spaceId: string = '';
  #spaceTitle: string = '';
  #langCode: SUPPORTED_LANG_CODE = SUPPORTED_LANG_CODE.KO;
  #isMuted: boolean = true;

  #place: Place | null = null;

  #curPanorama!: PhotoDome;
  #prevPanorama!: PhotoDome;
  #changeSceneAnimGroup!: AnimationGroup;

  #isMultiTouch: boolean = false;
  #pickedPoint: (Vector2 | null)[] = [null, null];
  #curPoint: (Vector2 | null)[] = [null, null];

  #curFov: number = CONFIG.MAX_FOV;
  #canMove: boolean = true;

  #remotePointers: RemotePointerState[] = [];
  #pointerTexture: AdvancedDynamicTexture | null = null;
  #pointerImages: Map<string, Image> = new Map();
  #remoteHoveredMeshes: Map<string, AbstractMesh | null> = new Map();
  #onLocalPointerMove?: any;
  #onLocalPointerClick?: any;

  #onMarkerClick:
    | ((
        id: number,
        name?: string,
        description?: string,
        contentType?: TourMarkerType,
        contentData?: TravelerMarkerContent
      ) => void)
    | null = null;

  #onRotationChange:
    | ((pitch: number, yaw: number, roll: number, sceneId?: number) => void)
    | null = null;

  #bgmSound: Sound | null = null;
  defaultMoveSpotSound: Sound | null = null;
  defaultClickEffectSound: Sound | null = null;

  // #accessToken: string = '';
  #visitorId: string = '';
  #travelId: string = '';
  // #travelOrder: number = 0;
  #prevMoveTimestamp: number = 0;
  // #clickOrder: number = 0;

  fadeInAnim!: Animation;
  fadeOutAnim!: Animation;
  #isMoveTypeWarp: boolean = false;

  #onSceneClick:
    | ((id: number, title?: string, description?: string) => void)
    | null = null;

  #onFovChange: ((fov: number) => void) | null = null;
  #cameraControlEnabled: boolean = true;

  #isPopupOpen: boolean = false;

  constructor() {
    console.debug(this.#spaceId, this.#spaceTitle, this.#prevMoveTimestamp);

    this.#initIds();
    this.#initCanvas();
    this.#initEngine();
    this.#initScene();
    this.#initCamera();
    this.#initLight();
    this.#initPanoramas();
    this.#initAnimations();
    // this.#initSounds();

    this.isLoading = false;

    this.#addEvents();
  }

  #initIds() {
    this.#initVisitorId();
    this.#initTravelId();
  }
  #initCanvas() {
    const canvas = document.createElement('canvas');
    canvas.id = 'olim-traveler';
    canvas.setAttribute('class', 'travelerCanvas');
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.position = 'relative';

    this.#canvas = canvas;
    // 로딩은 isLoading으로 처리해서 클라이언트에서 처리할 것.
    // this.#createLoadingScreen();
  }
  #initEngine() {
    const engineOption: EngineOptions = {
      disableWebGL2Support: true,
      stencil: true,
      failIfMajorPerformanceCaveat: false,
    };

    if (document.createElement('canvas').getContext('webgl2')) {
      engineOption.disableWebGL2Support = false;
    }

    this.#engine = new Engine(this.#canvas, true, engineOption, true);
    if (Engine.audioEngine) {
      Engine.audioEngine.useCustomUnlockedButton = true;
    }
  }
  #initScene() {
    const scene = new Scene(this.#engine);
    scene.collisionsEnabled = true;
    scene.clearColor = new Color4(0, 0, 0, 1);
    scene.useRightHandedSystem = true;
    scene.autoClear = true;

    this.#scene = scene;
  }
  #initCamera() {
    const camera = new UniversalCamera(
      'mainCamera',
      new Vector3(0, 0, 0),
      this.#scene
    );

    camera.inertia = 0.75;
    // camera.angularSensibility = -1000; // Combined the multiplication
    // camera.touchAngularSensibility = -1000000; // Combined the multiplication
    camera.angularSensibility = -3000; // Combined the multiplication
    camera.touchAngularSensibility = -3000000; // Combined the multiplication
    camera.speed = 5;
    camera.checkCollisions = true;
    camera.ellipsoid = new Vector3(1, 1, 1);

    this.#camera = camera;
  }

  #initLight() {
    const light = new HemisphericLight(
      'placeLight',
      new Vector3(0, 1, 0),
      this.#scene
    );
    light.specular = new Color3(0, 0, 0);

    // this.#light = light;
  }

  #initPanoramas() {
    this.#initCurrentPanorama();
    this.#initPreviousPanorama();
  }

  #initCurrentPanorama() {
    this.#curPanorama = new PhotoDome(
      'curPanorama',
      '',
      {
        resolution: CONFIG.PANORAMA_RESOLUTION,
        size: CONFIG.DOME_SIZE,
      },
      this.#scene
    );

    this.#setupPanoramaMesh(this.#curPanorama.mesh);
    this.#setupPanoramaMaterial(this.#curPanorama.material, 'curPanoramaMatl');

    this.#curPanorama.metadata = {
      id: 0,
      title: '',
    };
  }

  #initPreviousPanorama() {
    this.#prevPanorama = new PhotoDome(
      'prevPanorama',
      '',
      {
        clickToPlay: true,
        resolution: CONFIG.PANORAMA_RESOLUTION,
        size: CONFIG.DOME_SIZE,
      },
      this.#scene
    );

    this.#setupPanoramaMesh(this.#prevPanorama.mesh);
    this.#setupPanoramaMaterial(
      this.#prevPanorama.material,
      'prevPanoramaMatl'
    );

    this.#prevPanorama.metadata = {
      id: 0,
      title: '',
    };
  }

  #setupPanoramaMesh(mesh: Mesh) {
    mesh.isPickable = false;
    mesh.checkCollisions = false;
    mesh.alphaIndex = 1;
    mesh.getChildMeshes().forEach((curChildMesh) => {
      curChildMesh.checkCollisions = false;
      curChildMesh.isPickable = false;
    });
  }

  #setupPanoramaMaterial(material: Material, name: string) {
    material.name = name;
    material.alpha = CONFIG.DEFAULT_PANORAMA_ALPHA;
    material.transparencyMode = Material.MATERIAL_ALPHABLEND;
    material.alphaMode = Engine.ALPHA_ADD;
  }

  #initAnimations() {
    this.#initFadeAnimations();
    this.#initSceneChangeAnimation();
  }

  #initFadeAnimations() {
    this.fadeInAnim = this.#createFadeInAnimation();
    this.fadeOutAnim = this.#createFadeOutAnimation();
  }

  #createFadeInAnimation(): Animation {
    const fadeInAnim = new Animation(
      'fadeIn',
      'alpha',
      CONFIG.ANIM_FRAME,
      Animation.ANIMATIONTYPE_FLOAT
    );

    fadeInAnim.setKeys([
      { frame: 0, value: 0 },
      { frame: CONFIG.ANIM_FRAME / 2, value: 0.95 },
      { frame: CONFIG.ANIM_FRAME, value: CONFIG.DEFAULT_PANORAMA_ALPHA },
    ]);

    fadeInAnim.addEvent(
      new AnimationEvent(
        CONFIG.ANIM_FRAME,
        () => {
          this.#canMove = true;
        },
        true
      )
    );

    const fadeInEase = new SineEase();
    fadeInEase.setEasingMode(EasingFunction.EASINGMODE_EASEOUT);
    fadeInAnim.setEasingFunction(fadeInEase);

    return fadeInAnim;
  }

  #createFadeOutAnimation(): Animation {
    const fadeOutAnim = new Animation(
      'fadeOut',
      'alpha',
      CONFIG.ANIM_FRAME,
      Animation.ANIMATIONTYPE_FLOAT
    );

    fadeOutAnim.setKeys([
      { frame: 0, value: CONFIG.DEFAULT_PANORAMA_ALPHA },
      { frame: CONFIG.ANIM_FRAME / 2, value: 0.05 },
      { frame: CONFIG.ANIM_FRAME, value: 0 },
    ]);

    const fadeOutEase = new SineEase();
    fadeOutEase.setEasingMode(EasingFunction.EASINGMODE_EASEOUT);
    fadeOutAnim.setEasingFunction(fadeOutEase);

    return fadeOutAnim;
  }

  #initSceneChangeAnimation() {
    this.#changeSceneAnimGroup = new AnimationGroup('changeSceneAnim');
    this.#changeSceneAnimGroup.addTargetedAnimation(
      this.fadeInAnim,
      this.#curPanorama.material
    );
    this.#changeSceneAnimGroup.addTargetedAnimation(
      this.fadeOutAnim,
      this.#prevPanorama.material
    );
    this.#changeSceneAnimGroup.normalize(0, CONFIG.ANIM_FRAME);
  }

  #initVisitorId() {
    this.#visitorId = uuidv4();
    // localStorage.setItem(CONFIG.TRAVELER_VISITOR_KEY, this.#visitorId);
  }

  #initTravelId() {
    this.#travelId = uuidv4();
  }

  // #initSounds() {
  //   this.defaultMoveSpotSound = new Sound(
  //     'spotEffectSound',
  //     FootStepSound,
  //     this.#scene
  //   );

  //   this.defaultClickEffectSound = new Sound(
  //     'markerClickEffectSound',
  //     ClickEffectSound,
  //     this.#scene
  //   );
  // }

  reset(
    parentElement: HTMLElement,
    spaceId: string,
    spaceTitle: string,
    langCode: SUPPORTED_LANG_CODE
  ) {
    this.#spaceId = spaceId;
    this.#spaceTitle = spaceTitle;
    this.#langCode = langCode;

    // init canvas
    const existCanvas = document.querySelector('#olim-traveler');
    if (existCanvas) {
      existCanvas.parentNode?.removeChild(existCanvas);
    }

    parentElement.appendChild(this.#canvas);
    this.#ensurePointerTexture();

    this.#handleLoading();
  }

  #handleLoading() {
    DefaultLoadingScreen.prototype.displayLoadingUI = () => {
      if (this.isLoading) {
        return;
      }

      this.isLoading = true;
    };

    DefaultLoadingScreen.prototype.hideLoadingUI = () => {
      if (!this.isLoading) {
        return;
      }

      this.isLoading = false;
    };
  }

  #ensurePointerTexture() {
    if (!this.#pointerTexture) {
      this.#pointerTexture = AdvancedDynamicTexture.CreateFullscreenUI(
        'remote-pointer-ui',
        true,
        this.#scene
      );
    }
  }

  #syncRemotePointers() {
    if (!this.#pointerTexture) {
      return;
    }

    const pointerTexture = this.#pointerTexture;
    const size = pointerTexture.getSize();
    const pointerSize = 24;
    const activeIds = new Set<string>();

    this.#remotePointers.forEach((pointer) => {
      activeIds.add(pointer.userId);
      let image = this.#pointerImages.get(pointer.userId);
      if (!image) {
        image = new Image(`remote-pointer-${pointer.userId}`, PointerImage);
        image.widthInPixels = pointerSize;
        image.heightInPixels = pointerSize;
        image.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        image.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        image.isPointerBlocker = false;
        this.#pointerImages.set(pointer.userId, image);
        pointerTexture.addControl(image);
      }

      image.isVisible = pointer.visible;
      image.leftInPixels = pointer.x * size.width - pointerSize / 2;
      image.topInPixels = pointer.y * size.height - pointerSize / 2;

      if (pointer.action === 'click') {
        image.scaleX = 1.15;
        image.scaleY = 1.15;
        setTimeout(() => {
          image.scaleX = 1;
          image.scaleY = 1;
        }, 150);
      }
    });

    Array.from(this.#pointerImages.keys()).forEach((userId) => {
      if (!activeIds.has(userId)) {
        const image = this.#pointerImages.get(userId);
        if (image) {
          pointerTexture.removeControl(image);
          image.dispose();
        }
        this.#pointerImages.delete(userId);
      }
    });
  }

  #pickByNormalizedPointer(pointer: RemotePointerState): PickingInfo | null {
    if (!this.#canvas) {
      return null;
    }

    const rect = this.#canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) {
      return null;
    }

    const x = pointer.x * rect.width;
    const y = pointer.y * rect.height;

    return this.#scene.pick(
      x,
      y,
      (mesh) => mesh.isPickable,
      false,
      this.#camera
    );
  }

  #buildPointerActionEvent(
    pointer: RemotePointerState,
    mesh: AbstractMesh | null
  ): {
    source: Scene;
    pointerX: number;
    pointerY: number;
    meshUnderPointer: AbstractMesh | null;
  } | null {
    if (!this.#canvas) {
      return null;
    }

    const rect = this.#canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) {
      return null;
    }

    return {
      source: this.#scene,
      pointerX: pointer.x * rect.width,
      pointerY: pointer.y * rect.height,
      meshUnderPointer: mesh ?? null,
    };
  }

  #updateRemoteHover(pointer: RemotePointerState, mesh: AbstractMesh | null) {
    const prevMesh = this.#remoteHoveredMeshes.get(pointer.userId) || null;
    const actionEvent = this.#buildPointerActionEvent(pointer, mesh);
    if (prevMesh && prevMesh !== mesh && actionEvent) {
      prevMesh.actionManager?.processTrigger(
        ActionManager.OnPointerOutTrigger,
        actionEvent
      );
    }

    if (mesh && mesh !== prevMesh && actionEvent) {
      mesh.actionManager?.processTrigger(
        ActionManager.OnPointerOverTrigger,
        actionEvent
      );
    }

    if (mesh) {
      this.#remoteHoveredMeshes.set(pointer.userId, mesh);
    } else {
      this.#remoteHoveredMeshes.delete(pointer.userId);
    }
  }

  #syncRemotePointerInteractions() {
    const activeUserIds = new Set<string>();

    this.#remotePointers.forEach((pointer) => {
      activeUserIds.add(pointer.userId);
      if (!pointer.visible) {
        this.#updateRemoteHover(pointer, null);
        return;
      }

      const pickInfo = this.#pickByNormalizedPointer(pointer);
      const pickedMesh = pickInfo?.pickedMesh ?? null;
      this.#updateRemoteHover(pointer, pickedMesh);

      if (pointer.action === 'click') {
        this.#handlePickResult(pickInfo);
      }
    });

    Array.from(this.#remoteHoveredMeshes.keys()).forEach((userId) => {
      if (!activeUserIds.has(userId)) {
        this.#updateRemoteHover(
          {
            userId,
            x: 0,
            y: 0,
            visible: false,
            updatedAt: Date.now(),
          },
          null
        );
      }
    });
  }

  #handlePickResult(result: PickingInfo | null): boolean {
    console.log('handlePickResult 호출>>>>>>>>>>>>>>>>>>', result);

    if (!result) {
      return false;
    }

    if (!result.pickedMesh) {
      return false;
    }

    if (!result.pickedPoint) {
      return false;
    }

    if (!result.pickedMesh.isEnabled()) {
      return false;
    }

    if (result.pickedMesh.metadata?.isMarker) {
      const pickedMarker = this.#place?.markerPicked(
        result.pickedMesh.metadata
      );

      if (!pickedMarker) {
        return true;
      }

      console.log(
        '원격 마커 클릭이벤트 감지>>>>>>>>>>>>>>>>>>',
        this.#onMarkerClick
      );

      if (this.#onMarkerClick) {
        this.#onMarkerClick(
          pickedMarker.id,
          pickedMarker.name,
          pickedMarker.description,
          pickedMarker.contentType,
          pickedMarker.contentData
        );
      }

      return true;
    }

    if (result.pickedMesh.metadata?.ignorePick) {
      return false;
    }

    if (!this.#canMove) {
      return false;
    }

    const targetSpot = this.#place?.getPickedSpot(
      result.pickedPoint.x,
      result.pickedPoint.z,
      result.pickedMesh.metadata
    );

    if (!targetSpot) {
      console.error('cannot found target spot');
      return false;
    }

    if (targetSpot.id === this.#curPanorama.metadata.id) {
      return true;
    }

    this.#moveToSpot(targetSpot);

    if (this.#onSceneClick) {
      this.#onSceneClick(targetSpot.id, targetSpot.title);
    }

    return true;
  }

  getIsLoading(): boolean {
    return this.isLoading;
  }

  getVisitorId(): string {
    return this.#visitorId;
  }

  getTravelId(): string {
    return this.#travelId;
  }

  muteSound(): void {
    Engine.audioEngine?.setGlobalVolume(0);

    this.#isMuted = true;
    if (this.#bgmSound) {
      this.#bgmSound.stop();
    }
  }

  unmuteSound(): void {
    Engine.audioEngine?.unlock();

    Engine.audioEngine?.setGlobalVolume(1);

    this.#isMuted = false;
    if (this.#bgmSound && !this.#bgmSound.isPlaying) {
      this.#bgmSound.play();
    }
  }

  setRemotePointers(pointers: RemotePointerState[]) {
    this.#remotePointers = pointers;
    if (pointers.length > 0) {
      this.#ensurePointerTexture();
    }
    this.#syncRemotePointers();
    this.#syncRemotePointerInteractions();
  }

  setOnLocalPointerMove(handler?: any) {
    this.#onLocalPointerMove = handler;
  }

  setOnLocalPointerClick(handler?: LocalPointerClickHandler) {
    this.#onLocalPointerClick = handler;
  }

  isMuted(): boolean {
    return this.#isMuted;
  }

  openInspector() {
    if (
      !(
        import.meta.env.VITE_APP_ENV === 'local' ||
        import.meta.env.VITE_APP_ENV === 'dev'
      )
    ) {
      return;
    }

    Inspector.Show(this.#scene, {});
  }

  closeInspector() {
    Inspector.Hide();
  }

  reloadTour(
    resourceUrl: string,
    completeCallback: (tourData: TravelerTour) => void
  ): void {
    this.#engine.displayLoadingUI();

    this.#curPanorama.scaling.set(1, 1, 1);

    this.#prevPanorama.scaling.set(1, 1, 1);

    if (this.#bgmSound) {
      this.#bgmSound.stop();
      this.#bgmSound.dispose();
      this.#bgmSound = null;
    }
    try {
      // request tour data
      const request = new WebRequest();
      request.open('GET', resourceUrl);
      request.send();

      request.onprogress = (event) => {
        if (event.total === 0 || event.total === event.loaded) {
          const tourData = JSON.parse(request.response) as TravelerTour; // 여기에서 문제가 발생하는 것으로 보임

          if (!this.#place) {
            this.#place = new Place(this.#scene);
          }

          this.#place
            .init(tourData, this.#scene, { tourQuality: 'light' })
            .then(() => {
              this.#setStartingSpot();

              this.#engine.hideLoadingUI();

              this.#prevMoveTimestamp = new Date().getTime();

              if (tourData.bgmUrl) {
                this.#bgmSound = new Sound(
                  'bgmSound',
                  tourData.bgmUrl,
                  this.#scene,
                  () => {
                    if (this.#isMuted) {
                      return;
                    }

                    if (this.#bgmSound && !this.#bgmSound.isPlaying) {
                      this.#bgmSound.play();
                    }
                  },
                  {
                    autoplay: false,
                    loop: true,
                  }
                );
              }

              this.#render();
              completeCallback(tourData);
              return 100;
            });
        }

        return (event.loaded * 100) / event.total;
      };
    } catch (error) {
      console.error('요청된 공간이 존재하지 않거나 가져올 수 없음:', error);
    }
  }

  destroy() {
    this.#engine.dispose();
    this.#place = null;
    this.#remotePointers = [];
    this.#pointerImages.forEach((image) => image.dispose());
    this.#pointerImages.clear();
    this.#pointerTexture?.dispose();
    this.#pointerTexture = null;
    // this.#spaceId = '';
    // this.#spaceTitle = '';
    Traveler.instance = null;
  }

  setLangCode(targetLangCode: SUPPORTED_LANG_CODE) {
    this.#langCode = targetLangCode;
  }

  getLangCode(): SUPPORTED_LANG_CODE {
    return this.#langCode;
  }

  getPlaceOpeningText(): string {
    if (!this.#place) {
      return '';
    }

    return this.#place.getOpeningText(this.#langCode);
  }

  getSpotList(): TourSceneSpot[] {
    return this.#place?.getSpotList() || [];
  }

  hideMarkers(): void {
    this.#place?.hideMarkers();
  }

  revealMarkers(): void {
    this.#place?.revealMarkers(this.#curPanorama.metadata.id);
  }

  hideMarker(markerId: number, allPlace?: boolean): void {
    const allSpots: Set<number> = allPlace
      ? new Set(this.#place?.getSpotList().map((x) => x.id))
      : new Set();
    this.#place?.hideMarker(markerId, allSpots);
  }

  revealMarker(markerId: number, allPlace?: boolean): void {
    const allSpots: Set<number> = allPlace
      ? new Set(this.#place?.getSpotList().map((x) => x.id))
      : new Set();
    this.#place?.revealMarker(markerId, allSpots);
  }

  activateMarkerContentsItem(markerId: number, itemId: number) {
    this.#place?.markerItemSelected(
      markerId,
      itemId,
      this.#curPanorama.metadata.id,
      this.#curPanorama.position.clone(),
      this.#curPanorama.rotation.clone(),
      this.#scene
    );
  }

  deactivateMarkerContentsItem(markerId: number) {
    this.#place?.markerItemDeselected(markerId);
  }

  setOnMarkerClick(
    callback: (
      markerId: number,
      markerName?: string,
      markerDescription?: string,
      contentType?: TourMarkerType,
      contentData?: TravelerMarkerContent
    ) => void
  ) {
    this.#onMarkerClick = callback;
  }

  onMarkerClicked(
    id: number,
    name?: string,
    description?: string,
    contentType?: TourMarkerType,
    contentData?: TravelerMarkerContent
  ) {
    if (this.#onMarkerClick) {
      this.#onMarkerClick(id, name, description, contentType, contentData);
      //마커 클릭 시 팝업 open
      this.handleTogglePopup(true);
    }
  }

  setOnSceneClick(
    callback: (id: number, title?: string, description?: string) => void
  ) {
    this.#onSceneClick = callback;
  }

  moveToTargetSpot(targetSpotId: number, options?: MoveToTargetSpotOptions) {
    if (this.#curPanorama.metadata.id === targetSpotId) {
      return;
    }

    const targetSpot = this.#place?.getTargetSpot(targetSpotId);

    if (!targetSpot) {
      console.error('cannot found target spot');
      return;
    }

    this.#moveToSpot(targetSpot, options!);
  }

  takeScreenShot(fileName: string, hideMarker?: boolean) {
    if (hideMarker) {
      this.hideMarkers();
    }

    this.#scene.render();

    ScreenshotTools.CreateScreenshot(
      this.#engine,
      this.#camera,
      {
        width: this.#canvas.clientWidth,
        height: this.#canvas.clientHeight,
      },
      (base64EncodedUrl) => {
        const aTag = document.createElement('a');
        aTag.href = base64EncodedUrl;
        aTag.download = fileName;

        aTag.click();

        this.revealMarkers();
      }
    );
  }

  setMoveTypeWarp(isWarp: boolean) {
    this.#isMoveTypeWarp = isWarp;
  }

  getIsPopupOpen(): boolean {
    return this.#isPopupOpen;
  }

  handleTogglePopup(value: boolean) {
    this.#isPopupOpen = value;
  }

  #setStartingSpot() {
    if (this.#place === null) {
      return;
    }

    this.#camera.fov = this.#place.getDefaultFov();

    // set camera to starting spot
    const startingSpot = this.#place.getStartingSpot();
    this.#place.updateActiveSpots(startingSpot);

    this.#camera.rotation.set(
      startingSpot.beginViewAngle.x,
      startingSpot.beginViewAngle.y,
      startingSpot.beginViewAngle.z
    );

    this.#curPanorama.photoTexture = startingSpot.getPanoramaTexture();
    this.#curPanorama.photoTexture.vAng = Math.PI;

    this.#camera.position.set(
      startingSpot.position.x,
      startingSpot.position.y + CONFIG.TEST_CAMERA_POS_Y,
      startingSpot.position.z
    );

    // load 360 panorama image
    this.#curPanorama.position.set(
      startingSpot.position.x,
      startingSpot.position.y,
      startingSpot.position.z
    );

    this.#curPanorama.rotation.set(
      startingSpot.rotation.x,
      startingSpot.rotation.y,
      startingSpot.rotation.z
    );

    this.#curPanorama.metadata.id = startingSpot.id;
    this.#curPanorama.metadata.title = startingSpot.title;
  }

  #render() {
    this.#engine.runRenderLoop(() => {
      this.#engine.resize();
      this.#scene?.render();
    });
  }

  #moveToSpot(targetSpot: Spot, options?: MoveToTargetSpotOptions) {
    this.#canMove = false;

    this.#place?.updateActiveSpots(targetSpot);

    // set prev panorama
    this.#prevPanorama.material.alpha = CONFIG.DEFAULT_PANORAMA_ALPHA;
    this.#prevPanorama.photoTexture = this.#curPanorama.photoTexture;
    this.#prevPanorama.photoTexture.vAng = Math.PI;

    this.#prevPanorama.position = this.#curPanorama.position.clone();
    this.#prevPanorama.rotation = this.#curPanorama.rotation.clone();

    this.#prevPanorama.metadata.id = this.#curPanorama.metadata.id;
    this.#prevPanorama.metadata.title = this.#curPanorama.metadata.title;

    // set new 360 panorama texture
    this.#curPanorama.photoTexture = targetSpot.getPanoramaTexture();
    this.#curPanorama.photoTexture.vAng = Math.PI;

    if (!this.#isMuted) {
      this.defaultMoveSpotSound?.stop();
      this.defaultMoveSpotSound?.play(0, 0, 0.9);
    }

    this.#onMoveCamera(targetSpot.position, options?.isWarp);

    if (
      options?.isWarp ||
      (options?.isWarp === undefined && this.#isMoveTypeWarp)
    ) {
      this.#prevPanorama.position = targetSpot.position.clone();
    }

    // set cur panorama transform
    this.#curPanorama.position = targetSpot.position.clone();
    this.#curPanorama.rotation = targetSpot.rotation.clone();

    this.#curPanorama.metadata.id = targetSpot.id;
    this.#curPanorama.metadata.title = targetSpot.title;

    this.#prevPanorama.scaling.set(1, 1, 1);
    this.#curPanorama.scaling.set(1, 1, 1);
    if (
      options?.isWarp === false ||
      (options?.isWarp === undefined && !this.#isMoveTypeWarp)
    ) {
      const distance = Vector3.Distance(
        this.#prevPanorama.position,
        new Vector3(
          targetSpot.position.x,
          targetSpot.position.y,
          targetSpot.position.z
        )
      );

      const scaleValue = (2 * distance) / CONFIG.DOME_SIZE + 1;
      this.#prevPanorama.scaling.set(scaleValue, scaleValue, scaleValue);
      this.#curPanorama.scaling.set(scaleValue, scaleValue, scaleValue);
    }

    this.#changeSceneAnimGroup.speedRatio =
      options?.isWarp || (options?.isWarp === undefined && this.#isMoveTypeWarp)
        ? CONFIG.ANIM_SPEED / 1.5
        : CONFIG.ANIM_SPEED;
    this.#changeSceneAnimGroup.play();

    if (options?.isOriginalRotation) {
      this.#camera.rotation.set(
        targetSpot.beginViewAngle.x,
        targetSpot.beginViewAngle.y,
        targetSpot.beginViewAngle.z
      );
    }
  }

  #onMoveCamera(targetPos: Vector3, isWarp?: boolean) {
    if (isWarp || (isWarp === undefined && this.#isMoveTypeWarp)) {
      this.#camera.position.set(
        targetPos.x,
        targetPos.y + CONFIG.TEST_CAMERA_POS_Y,
        targetPos.z
      );

      return;
    }

    const animation = new Animation(
      'cameraMove',
      'position',
      CONFIG.ANIM_FRAME,
      Animation.ANIMATIONTYPE_VECTOR3
    );
    animation.setKeys([
      {
        frame: 0,
        value: this.#camera.position,
      },
      {
        frame: CONFIG.ANIM_FRAME,
        value: new Vector3(
          targetPos.x,
          targetPos.y + CONFIG.TEST_CAMERA_POS_Y,
          targetPos.z
        ),
      },
    ]);

    const ease = new SineEase();
    ease.setEasingMode(EasingFunction.EASINGMODE_EASEOUT);
    animation.setEasingFunction(ease);

    this.#camera.animations = [animation];

    this.#scene.beginAnimation(
      this.#camera,
      0,
      CONFIG.ANIM_FRAME,
      false,
      CONFIG.ANIM_SPEED
    );
  }

  #onCameraChange() {
    this.#camera.onViewMatrixChangedObservable.add(() => {
      if (this.#camera.rotation.x > CONFIG.MAX_CAMERA_ROT_X) {
        this.#camera.rotation.x = CONFIG.MAX_CAMERA_ROT_X;
      } else if (this.#camera.rotation.x < CONFIG.MIN_CAMERA_ROT_X) {
        this.#camera.rotation.x = CONFIG.MIN_CAMERA_ROT_X;
      }

      if (this.#onRotationChange) {
        this.#onRotationChange(
          this.#camera.rotation.x,
          this.#camera.rotation.y,
          this.#camera.rotation.z,
          this.#curPanorama?.metadata?.id
        );
      }
    });
  }

  #addEvents() {
    this.#camera.attachControl(true, false);

    const mouse = this.#camera.inputs.attached.mouse as any;
    mouse.touchEnabled = true;
    mouse.buttons = [0];

    this.#camera.inputs.attached.keyboard.detachControl();
    this.#camera.inputs.attached.touch.detachControl();

    this.#onCameraChange();
    this.#scene.pointerUpPredicate = (mesh: AbstractMesh) => {
      return mesh.isPickable;
    };

    this.#scene.pointerDownPredicate = (mesh: AbstractMesh) => {
      return mesh.isPickable;
    };

    this.#scene.pointerMovePredicate = (mesh: AbstractMesh) => {
      return mesh.isPickable;
    };

    // mouse wheel control
    this.#scene.onPointerObservable.add((pointerInfo) => {
      pointerInfo.event.preventDefault();

      const event = pointerInfo.event as IWheelEvent;
      const deltaFov = (event.deltaY || 0) * 0.0005;
      const targetFov = this.#camera.fov + deltaFov;
      this.#setFov(targetFov);
    }, PointerEventTypes.POINTERWHEEL);

    this.#scene.onPointerDown = (evt: IPointerEvent) => {
      const curEvent = evt as PointerEvent;

      const curPosX = curEvent.clientX;
      const curPosY = curEvent.clientY;

      if (curEvent.pointerType && curEvent.pointerType === 'touch') {
        if (curEvent.isPrimary) {
          this.#pickedPoint[0] = new Vector2(curPosX, curPosY);
          this.#curPoint[0] = new Vector2(curPosX, curPosY);
        } else {
          this.#pickedPoint[1] = new Vector2(curPosX, curPosY);
          this.#curPoint[1] = new Vector2(curPosX, curPosY);
        }

        if (this.#pickedPoint[0] && this.#pickedPoint[1]) {
          this.#isMultiTouch = true;
        }
      } else {
        this.#pickedPoint[0] = new Vector2(curPosX, curPosY);
        this.#curPoint[0] = new Vector2(curPosX, curPosY);
      }
    };

    this.#scene.onPointerMove = (evt: IPointerEvent, result: PickingInfo) => {
      if (!result.pickedMesh) {
        return;
      }

      const curEvent = evt as PointerEvent;

      if (curEvent.pointerType && curEvent.pointerType === 'touch') {
        if (curEvent.isPrimary) {
          this.#curPoint[0]!.set(curEvent.clientX, curEvent.clientY);
        } else {
          this.#curPoint[1]!.set(curEvent.clientX, curEvent.clientY);
        }

        if (
          this.#pickedPoint[0] === null ||
          this.#pickedPoint[1] === null ||
          this.#curPoint[0] === null ||
          this.#curPoint[1] === null
        ) {
          return;
        }

        if (this.#isMultiTouch) {
          const beginDistance = Vector2.Distance(
            this.#pickedPoint[0],
            this.#pickedPoint[1]
          );

          const curDistance = Vector2.Distance(
            this.#curPoint[0],
            this.#curPoint[1]
          );

          const deltaDistance = beginDistance - curDistance;
          if (Math.abs(deltaDistance) > CONFIG.PINCH_TOLERANCE) {
            const targetFov = this.#curFov + deltaDistance * 0.01;
            this.#setFov(targetFov);
          }
        }
      } else {
        this.#place?.setShaderMousePosition(
          result.pickedPoint || Vector3.Zero()
        );

        if (this.#onLocalPointerMove && this.#canvas) {
          const rect = this.#canvas.getBoundingClientRect();
          const normX = (curEvent.clientX - rect.left) / rect.width;
          const normY = (curEvent.clientY - rect.top) / rect.height;
          if (normX >= 0 && normX <= 1 && normY >= 0 && normY <= 1) {
            this.#onLocalPointerMove({ x: normX, y: normY });
          }
        }
      }
    };

    this.#scene.onPointerUp = (evt: IPointerEvent, result) => {
      const curEvent = evt as PointerEvent;

      this.#curFov = this.#camera.fov;

      if (
        curEvent.pointerType &&
        curEvent.pointerType === 'touch' &&
        this.#isMultiTouch
      ) {
        if (curEvent.isPrimary) {
          this.#pickedPoint[0] = null;
          this.#curPoint[0] = null;
        } else {
          this.#pickedPoint[1] = null;
          this.#curPoint[1] = null;
        }

        if (this.#pickedPoint[0] === null && this.#pickedPoint[1] === null) {
          this.#isMultiTouch = false;
          return;
        }
      }

      if (this.#isMultiTouch) {
        return;
      }

      if (!this.#pickedPoint[0]) {
        return;
      }

      const curPickedPointX = this.#pickedPoint[0].x;
      const curPickedPointY = this.#pickedPoint[0].y;
      this.#pickedPoint[0] = null;

      if (
        Math.abs(curPickedPointX - curEvent.clientX) >= CONFIG.PICK_TOLERANCE ||
        Math.abs(curPickedPointY - curEvent.clientY) >= CONFIG.PICK_TOLERANCE
      ) {
        return;
      }

      const pickedMarker =
        result?.pickedMesh?.metadata?.isMarker && this.#place
          ? this.#place.markerPicked(result.pickedMesh.metadata)
          : null;

      const localPointerClick = this.#onLocalPointerClick;

      if (localPointerClick && this.#canvas) {
        const rect = this.#canvas.getBoundingClientRect();
        const normX = (curEvent.clientX - rect.left) / rect.width;
        const normY = (curEvent.clientY - rect.top) / rect.height;
        if (normX >= 0 && normX <= 1 && normY >= 0 && normY <= 1) {
          if (localPointerClick.length > 1) {
            if (pickedMarker) {
              localPointerClick(
                pickedMarker.id,
                pickedMarker.name,
                pickedMarker.description,
                pickedMarker.contentType,
                pickedMarker.contentData
              );
            }
          } else {
            localPointerClick({ x: normX, y: normY });
          }
        }
      }

      this.#handlePickResult(result);
    };
  }

  setOnFovChange(callback: (fov: number) => void) {
    this.#onFovChange = callback;
  }

  #setFov(fov: number) {
    const trimmedFov = Math.max(CONFIG.MIN_FOV, Math.min(CONFIG.MAX_FOV, fov));
    this.#camera.fov = trimmedFov;
    if (this.#onFovChange) this.#onFovChange(trimmedFov);
  }

  setOnRotationChange(
    callback: (
      pitch: number,
      yaw: number,
      roll: number,
      sceneId?: number
    ) => void
  ) {
    this.#onRotationChange = callback;
  }

  setCameraRotation(pitch: number, yaw: number, roll: number) {
    if (this.#camera) {
      this.#camera.rotation.set(pitch, yaw, roll);
    }
  }

  setCameraFov(fov: number) {
    this.#setFov(fov);
  }

  setCameraControlEnabled(enabled: boolean) {
    this.#cameraControlEnabled = enabled;

    if (enabled) {
      // 카메라 제어 활성화
      this.#camera.attachControl(true, false);
    } else {
      // 카메라 제어 비활성화
      this.#camera.detachControl();
    }
  }

  getCameraControlEnabled(): boolean {
    return this.#cameraControlEnabled;
  }
}

export default function getTraveler(): Traveler {
  if (!Traveler.instance) {
    Traveler.instance = new Traveler();
  }

  return Traveler.instance;
}

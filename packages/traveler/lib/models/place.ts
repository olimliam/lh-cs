// import * as BABYLON from '@babylonjs/core';
import {
  ShaderMaterial,
  Mesh,
  Scene,
  Effect,
  SceneLoader,
  Texture,
  StandardMaterial,
  Color3,
  Vector3,
} from '@babylonjs/core';

import { SUPPORTED_LANG_CODE } from '../enums/lang-code.enum';

import PointerImage from '../assets/images/pointer.png';

import Spot from './spot';
import Marker from './marker';
import {
  TourGeometry,
  TourKeymap,
  TourMarker,
  TourMarkerInfo,
  TourMarkerType,
  TourQualityType,
  TourScene,
} from '../types/tour';
import { TourSceneSpot, TravelerTour } from '../types/traveler-tour';

export default class Place {
  #id: string = '';
  #startingSpotId: number = 0;
  #startingSpotTitle: string = '';
  #title: string = '';
  #defaultFov: number = 1.5;
  #spotPointerSize: number = 10;
  #openingText: string = '';
  #i18nOpeningText: Map<string, string> = new Map<string, string>();

  #mesh: Mesh | null = null;

  #minimap: TourKeymap = {} as TourKeymap;
  #spots: Map<number, Spot> = new Map();
  #markers: Map<number, Marker> = new Map();

  #matl: ShaderMaterial;

  constructor(targetScene: Scene) {
    // 30:3   error    '#minimap' is defined but never used      no-unused-private-class-members
    console.debug(this.#minimap);
    // ================== shader ========================
    Effect.ShadersStore['customVertexShader'] = `
      precision highp float;
      varying vec3 vPosition;
      attribute vec3 position;
      uniform mat4 worldViewProjection;

      void main(void) {
        vPosition = position;
        gl_Position = worldViewProjection * vec4(position, 1.0);
      }
    `;

    Effect.ShadersStore['customFragmentShader'] = `
      precision highp float;
      varying vec3 vPosition;

      uniform vec3 mousePosition;
      uniform int mouseOver;
      uniform float pointSize;

      void main(void) {
        vec4 color = vec4(0, 0, 0, 0);

        float circleDis = length(mousePosition-vPosition);
        if (circleDis < pointSize && circleDis > (pointSize / 3. * 1.)) {
          color = vec4(0.2, 1, 0.84, 0.8);
        }
        gl_FragColor = color;
      }
    `;

    this.#matl = new ShaderMaterial(
      'placeMatl',
      targetScene,
      {
        vertex: 'custom',
        fragment: 'custom',
      },
      {
        attributes: ['position'],
        uniforms: [
          'mousePosition',
          'pointSize',
          'mouseOver',
          'worldViewProjection',
        ],
      }
    );
    this.#matl.alpha = 0;
    this.#matl.needDepthPrePass = true;
  }

  async init(
    metaData: TravelerTour,
    targetScene: Scene,
    { tourQuality = 'origin' }: { tourQuality?: TourQualityType } = {}
  ) {
    console.info('Tour Quality: ', tourQuality);
    this.#reset();

    this.#id = metaData.id;
    this.#startingSpotId = metaData.startingSceneID || 0;
    this.#title = metaData.title;
    this.#defaultFov = metaData.fov;
    this.#spotPointerSize = metaData.moveCircleSize;
    this.#openingText = metaData.openingText;
    if (metaData.i18nOpeningText) {
      for (const langCode in metaData.i18nOpeningText) {
        this.#i18nOpeningText.set(langCode, metaData.i18nOpeningText[langCode]);
      }
    }

    await this.#initMesh(metaData.geometries, targetScene);
    await this.#initSpots(metaData.scenes, targetScene, { tourQuality });

    const totalHiddenMarkers = new Map<number, Set<number>>();
    const totalOverrideMarkers = new Map<number, Map<number, TourMarkerInfo>>();
    metaData.scenes.forEach((curScene: TourScene) => {
      const curSceneId = curScene.id;
      const curHiddenMarkers = curScene.layers[0].invisibleMarkers;

      curHiddenMarkers.forEach((target) => {
        const curMarkerId = target.markerID as number;
        if (!totalHiddenMarkers.has(curMarkerId)) {
          totalHiddenMarkers.set(curMarkerId, new Set<number>());
        }

        totalHiddenMarkers.get(curMarkerId)?.add(curSceneId);
      });

      const curOverrideMarkers = curScene.layers[0].overriddenMarkers;
      curOverrideMarkers.forEach((target) => {
        const curMarkerId = target.markerID as number;
        const curTransform: TourMarkerInfo = target as TourMarkerInfo;

        if (!totalOverrideMarkers.has(curMarkerId)) {
          totalOverrideMarkers.set(
            curMarkerId,
            new Map<number, TourMarkerInfo>()
          );
        }

        totalOverrideMarkers.get(curMarkerId)!.set(curSceneId, curTransform);
      });
    });

    await this.#initMarkers(
      metaData.markers,
      totalHiddenMarkers,
      totalOverrideMarkers,
      targetScene,
      metaData.geometries
    );
    this.#initMinimap(metaData.minimaps);
  }

  getId(): string {
    return this.#id;
  }

  getTitle(): string {
    return this.#title;
  }

  getStartingSpotId(): number {
    return this.#startingSpotId;
  }

  getStartingSpotTitle(): string {
    return this.#startingSpotTitle;
  }

  #reset() {
    if (!this.#mesh) {
      return;
    }

    this.#mesh.dispose();
    this.#mesh = null;

    if (this.#spots.size > 0) {
      this.#spots.forEach((curSpot) => {
        curSpot.destroy();
      });

      this.#spots.clear();
    }

    if (this.#markers.size > 0) {
      this.#markers.forEach((curMarker) => {
        curMarker.destroy();
      });

      this.#markers.clear();
    }
  }

  async #initMesh(metaData: TourGeometry[], targetScene: Scene) {
    const targetGeometry = metaData
      .reverse()
      .find((curGeometry) => curGeometry.useType === 0);

    const fileUrl = targetGeometry?.url;
    if (!fileUrl || fileUrl.length === 0) {
      throw new Error('invalid tour geometry data');
    }

    const fileUrlTokens = fileUrl.split('/');
    const fileName = fileUrlTokens.pop();
    const filePrefix = [...fileUrlTokens, ''].join('/');

    // load mesh
    const importMeshResult = await SceneLoader.ImportMeshAsync(
      '',
      filePrefix + fileName,
      '',
      targetScene
    );

    const validMeshes = importMeshResult.meshes.filter((x) => {
      return !!x.getTotalVertices();
    });

    const mergedMesh = Mesh.MergeMeshes(
      validMeshes as Mesh[],
      true,
      true,
      undefined,
      true,
      false
    );

    if (!mergedMesh) {
      throw new Error('Can not merge mesh');
    }

    importMeshResult.meshes.forEach((curMesh) => {
      curMesh.dispose();
    });

    this.#mesh = mergedMesh;

    this.#mesh.name = 'placeMesh';
    // this.#mesh.visibility = 1;
    this.#mesh.checkCollisions = true;
    this.#mesh.alphaIndex = 2;
    this.#mesh.hasVertexAlpha = true;
    this.#mesh.metadata = { isPlaceModel: true };
    // convert transform to BABYLON
    this.#mesh.position.set(
      targetGeometry.x,
      targetGeometry.z,
      targetGeometry.y
    );
    // convert transform to BABYLON
    this.#mesh.rotation.set(targetGeometry.pitch, targetGeometry.yaw, 0);

    this.#matl.setFloat('pointSize', this.#spotPointerSize);

    this.#mesh.material = this.#matl;
  }

  async #initSpots(
    spotList: TourScene[],
    targetScene: Scene,
    { tourQuality = 'origin' }: { tourQuality?: TourQualityType } = {}
  ) {
    if (!this.#mesh) {
      throw new Error('mesh data is null');
    }

    const spotTexture = new Texture(PointerImage, targetScene);
    const defaultSpotMatl = new StandardMaterial('spotMatl', targetScene);
    defaultSpotMatl.alpha = 0.9;
    defaultSpotMatl.emissiveColor = new Color3(1, 1, 1);
    defaultSpotMatl.diffuseTexture = spotTexture;
    defaultSpotMatl.diffuseTexture.hasAlpha = true;
    defaultSpotMatl.useAlphaFromDiffuseTexture = true;
    defaultSpotMatl.useSpecularOverAlpha = true;

    const loadingStates: Promise<void>[] = [];
    for (const curScene of spotList) {
      const curSpot = new Spot(
        curScene,
        this.#spotPointerSize,
        defaultSpotMatl,
        this.#mesh!,
        targetScene
      );

      const panoramaImgUrl =
        window.innerWidth > 768
          ? tourQuality === 'light'
            ? curScene.layers[0].lightWeightImg || curScene.layers[0].originImg
            : curScene.layers[0].originImg
          : curScene.layers[0].resizedImg;

      const curState = curSpot.loadPanoramaTextureAsync(
        panoramaImgUrl,
        targetScene
      );
      loadingStates.push(curState);
      this.#spots.set(curScene.id, curSpot);
    }

    await Promise.all(loadingStates);
  }

  async #initMarkers(
    markerList: TourMarker[],
    hiddenMarkers: Map<number /*markerId*/, Set<number /*spotId*/>>,
    overrideMarkers: Map<
      number /*markerId*/,
      Map<number /*spotId*/, TourMarkerInfo>
    >,
    targetScene: Scene,
    geometriList: TourGeometry[]
  ) {
    if (!this.#mesh) {
      throw new Error('mesh data is null');
    }

    for (const curMarker of markerList) {
      this.#markers.set(
        curMarker.id as number,
        new Marker(
          curMarker,
          hiddenMarkers.get(curMarker.id as number),
          overrideMarkers.get(curMarker.id as number),
          targetScene,
          geometriList
        )
      );
    }
  }

  #initMinimap(minimapList: TourKeymap[]) {
    this.#minimap = {
      id: minimapList[0].id,
      title: minimapList[0].title,
      url: minimapList[0].url,
      scaleX: minimapList[0].scaleX,
      scaleY: minimapList[0].scaleY,
      positionX: minimapList[0].positionX,
      positionY: minimapList[0].positionY,
      width: minimapList[0].width,
      height: minimapList[0].height,
    } as TourKeymap;
  }

  getOpeningText(langCode: SUPPORTED_LANG_CODE): string {
    if (this.#i18nOpeningText.has(langCode.toLowerCase())) {
      return this.#i18nOpeningText.get(langCode.toLowerCase())!;
    }

    return this.#openingText;
  }

  getSpotList(): TourSceneSpot[] {
    const spotList: TourSceneSpot[] = [];

    this.#spots.forEach((curItem) => {
      spotList.push({
        id: curItem.id,
        title: curItem.title,
        metaData: curItem.metaData,
      });
    });

    return spotList;
  }

  getDefaultFov(): number {
    return this.#defaultFov;
  }

  getStartingSpot(): Spot {
    const startingSpot = this.#spots.get(this.#startingSpotId);
    if (startingSpot) {
      this.#startingSpotTitle = startingSpot.title;
      return startingSpot;
    }

    // get first value of hashmap
    return this.#spots.values().next().value!;
  }

  setShaderMousePosition(curPosition: Vector3) {
    (this.#mesh?.material as ShaderMaterial)?.setVector3(
      'mousePosition',
      curPosition
    );
  }

  getTargetSpot(targetSpotId: number) {
    return this.#spots.get(targetSpotId) || null;
  }

  getPickedSpot(
    pickedPosX: number,
    pickedPosZ: number,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pickedMetaData: any
  ): Spot | null {
    if (pickedMetaData?.isPlaceModel) {
      let targetSpotId = 0;
      let minDistance = 0;
      this.#spots.forEach((curSpot: Spot, curSpotId: number) => {
        if (!curSpot.isActive()) {
          return;
        }

        const curDistance = Math.sqrt(
          Math.pow(pickedPosX - curSpot.position.x, 2) +
            Math.pow(pickedPosZ - curSpot.position.z, 2)
        );

        if (targetSpotId === 0 || minDistance > curDistance) {
          targetSpotId = curSpotId;
          minDistance = curDistance;
        }
      });

      return this.#spots.get(targetSpotId) || null;
    }

    if (pickedMetaData?.isSpot) {
      return this.#spots.get(pickedMetaData.id) || null;
    }

    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  markerPicked(targetMetadata: any): Marker | undefined {
    const pickedMarker = this.#markers.get(targetMetadata.id);
    if (!pickedMarker) {
      console.error('Cannot found picked marker : ', targetMetadata.id);
      return;
    }

    pickedMarker.onPicked();

    return pickedMarker;
  }

  markerItemSelected(
    markerId: number,
    itemId: number,
    spotId: number,
    curSpotPosition: Vector3,
    curSpotRotation: Vector3,
    targetScene: Scene
  ) {
    const pickedMarker = this.#markers.get(markerId);
    if (!pickedMarker) {
      console.error('Cannot found target marker : ', markerId);
      return;
    }

    if (pickedMarker.contentType !== TourMarkerType.layering) {
      return;
    }

    pickedMarker.onItemSelected(
      itemId,
      spotId,
      curSpotPosition,
      curSpotRotation,
      targetScene
    );
  }

  markerItemDeselected(markerId: number) {
    const targetMarker = this.#markers.get(markerId);
    if (!targetMarker) {
      console.error('Cannot found target marker : ', markerId);
      return;
    }

    if (targetMarker.contentType !== TourMarkerType.layering) {
      return;
    }

    targetMarker.onItemDeselected();
  }

  updateActiveSpots(targetSpot: Spot) {
    this.#spots.forEach((curSpot: Spot) => {
      if (curSpot.id === targetSpot.id) {
        curSpot.setActivation(false);
        return;
      }

      if (targetSpot.isLinkedSpot(curSpot.id)) {
        curSpot.setActivation(true);
      } else {
        curSpot.setActivation(false);
      }
    });

    this.#markers.forEach((curMarker) => {
      curMarker.reset(targetSpot);
    });
  }

  hideMarkers(): void {
    this.#markers.forEach((curMarker) => {
      curMarker.hide();
    });
  }

  hideMarker(markerId: number, targetSpots: Set<number>): void {
    const marker = this.#markers.get(markerId);
    if (marker) {
      marker.addSpotsToHide(targetSpots);
      marker.hide();
    }
  }

  revealMarkers(curSpotId: number): void {
    this.#markers.forEach((curMarker) => {
      curMarker.reveal(curSpotId);
    });
  }

  revealMarker(markerId: number, targetSpots: Set<number>): void {
    const marker = this.#markers.get(markerId);
    if (marker) {
      marker.removeSpotsToHide(targetSpots);
      marker.reveal();
    }
  }
}

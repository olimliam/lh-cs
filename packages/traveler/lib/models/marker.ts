import {
  Vector3,
  Vector4,
  Scene,
  TransformNode,
  MeshBuilder,
  StandardMaterial,
  Mesh,
  Texture,
  VideoTexture,
  DynamicTexture,
  Material,
  Engine,
  SceneLoader,
  Sound,
  HighlightLayer,
  Color3,
  ActionManager,
  ExecuteCodeAction,
} from '@babylonjs/core';
import getTraveler from '../core/traveler';

import Spot from './spot';
import { CONFIG } from '../constants/config';
import {
  TourGeometry,
  TourMarker,
  TourMarkerDisplay,
  TourMarkerDisplayContent,
  TourMarkerDisplayGeometry,
  TourMarkerDisplayText,
  TourMarkerDisplayType,
  TourMarkerDisplayVideo,
  TourMarkerInfo,
  TourMarkerType,
} from '../types/tour';
import {
  MarkerOptionLayering,
  TravelerMarkerContent,
  TravelerMarkerOptionPortal,
} from '../types/traveler-tour';

export default class Marker {
  static CONTEXT_TO_MEASURE = document.createElement('canvas').getContext('2d');

  readonly id: number;
  readonly name: string;
  readonly description: string;
  readonly width: number;
  readonly height: number;
  readonly position: Vector3;
  readonly rotation: Vector3;

  readonly displayType: TourMarkerDisplayType;
  readonly displayData: TourMarkerDisplay;
  readonly contentType: TourMarkerType;
  readonly contentData: TravelerMarkerContent;

  #scene: Scene;
  #isVisible: boolean;
  #spotsToHide: Set<number /*spotId*/> | undefined;
  #spotsToOverride: Map<number /*spotId*/, TourMarkerInfo> | undefined;

  // upperTitle: MarkerUpperTitle | null = null;

  #node: TransformNode;
  #items: Map<number, Mesh> = new Map<number, Mesh>();

  #effectSound: Sound | null = null;

  #hl: HighlightLayer | null = null;

  constructor(
    metaData: TourMarker,
    spotsToHide: Set<number /*sceneId*/> | undefined,
    spotsToOverride: Map<number /*sceneId*/, TourMarkerInfo> | undefined,
    targetScene: Scene,
    geometriList: TourGeometry[]
  ) {
    this.id = metaData.id as number;
    this.name = metaData.title;
    this.description = metaData.description;
    this.width = metaData.width || 0;
    this.height = metaData.height || 0;

    this.displayType = metaData.displayType;
    this.displayData = metaData.displayResource;
    this.contentType = metaData.contentType;
    this.contentData = metaData.content;

    this.#spotsToHide = spotsToHide;
    this.#spotsToOverride = spotsToOverride;
    this.#isVisible = metaData.isVisible || false;

    /////////////////////////////////////////////////////////////////////////////////////////////////
    // 26:3  error  '#isVisible' is defined but never used  no-unused-private-class-members
    console.debug(this.#isVisible);

    // convert transform to BABYLON
    this.position = new Vector3(metaData.x, metaData.z, metaData.y);
    this.rotation = new Vector3(metaData.pitch, metaData.yaw, metaData.roll);

    this.#scene = targetScene;
    this.#node = new TransformNode('markerNode-' + metaData.id, targetScene);
    // convert transform to BABYLON
    this.#node.position = new Vector3(metaData.x, metaData.z, metaData.y);
    this.#node.rotation = new Vector3(
      metaData.pitch,
      metaData.yaw,
      metaData.roll
    );
    /////////////////////////////////////////////////////////////////////////////////////////////////

    const displayMesh = MeshBuilder.CreatePlane('markerMesh', {
      width: metaData.width,
      height: metaData.height,
      sideOrientation: Mesh.DOUBLESIDE,
      updatable: false,
      frontUVs: new Vector4(1, 0, 0, 1),
      backUVs: new Vector4(0, 0, 1, 1),
    });
    displayMesh.billboardMode = metaData.billboard
      ? Mesh.BILLBOARDMODE_Y
      : Mesh.BILLBOARDMODE_NONE;
    displayMesh.alphaIndex = 3;
    displayMesh.metadata = { id: metaData.id, isMarker: true };

    const displayMatl = new StandardMaterial(
      'markerDisplayMatl-' + metaData.id
    );

    //  - 아이콘 Plane이 양면으로 렌더링되도록 설정.
    //  - Billboard 아이콘이 회전해도 항상 보이게 유지하기 위함.
    displayMatl.backFaceCulling = true; // 기존 코드
    // displayMatl.backFaceCulling = false; // false로 처리하면 아이콘이 뒤짚어지는 현상 발생

    //  - PNG 아이콘의 알파 채널을 그대로 사용하여 자연스러운 투명 블렌딩 처리.
    //  - icon 영역의 투명/불투명 경계가 geometry Glow와 섞이지 않도록 함.
    displayMatl.transparencyMode = Material.MATERIAL_ALPHABLEND;

    //  - 투명 텍스처를 가진 아이콘이 depth pre-pass에서 "불투명 사각형"처럼
    //    깊이를 가로막아 geometry glow가 아이콘 위로 잘못 섞여 보이는 문제 방지.
    //  - pre-pass를 끄면 아이콘이 정상적인 투명 텍스처로 렌더링되어,
    //    뒤의 geometry(HighlightLayer 대상)와 자연스러운 Z-정렬이 이루어짐.
    // displayMatl.needDepthPrePass = true; // 기존 코드
    displayMatl.needDepthPrePass = true;

    //  - diffuseTexture(PNG)의 알파 값을 그대로 사용해서, 불필요한 배경 렌더링 없이
    //    아이콘 모양 그대로만 표시되도록 함.
    displayMatl.useAlphaFromDiffuseTexture = true;

    // # 투명마커 보이지 않도록 처리
    if (this.displayType === TourMarkerDisplayType.geometry) {
      displayMatl.emissiveColor.set(0, 0, 0);
      displayMatl.alpha = 0;
    } else {
      displayMatl.emissiveColor.set(1, 1, 1);
      displayMatl.alphaMode = Engine.ALPHA_COMBINE;
    }

    this.#initDisplayData(
      geometriList,
      metaData.displayType,
      metaData.displayResource,
      targetScene,
      displayMesh,
      displayMatl
    );

    displayMesh.material = displayMatl;
    displayMesh.parent = this.#node;

    this.#effectSound = getTraveler().defaultClickEffectSound;
  }

  destroy() {
    this.#node.dispose(false, true);
  }

  reset(targetSpot: Spot) {
    this.#resetLayering(targetSpot);
    this.#hideSpot(targetSpot);
    this.#applyOverrides(targetSpot);
  }

  #resetLayering(targetSpot: Spot) {
    if (this.contentType === TourMarkerType.layering) {
      if (this.#items.has(targetSpot.id)) {
        for (const [curSpotId, curItem] of this.#items) {
          if (!curItem.material) {
            continue;
          }

          curItem.material.alpha = 0;
          curItem.setEnabled(false);
          if (curSpotId === targetSpot.id) {
            curItem.setEnabled(true);

            this.#scene.beginAnimation(curItem.material, 0, 120, false);
            curItem.position = targetSpot.position.clone();
            curItem.rotation = targetSpot.rotation.clone();
          }
        }
      } else {
        for (const [, curItem] of this.#items) {
          if (curItem.material) {
            curItem.material.alpha = 0;
          }
          curItem.setEnabled(false);
        }
      }
    } else {
      for (const [curSpotId, curItem] of this.#items) {
        curItem.dispose(false, true);
        this.#items.delete(curSpotId);
      }
    }
  }

  #hideSpot(targetSpot: Spot) {
    if (this.#spotsToHide) {
      this.#node.setEnabled(!this.#spotsToHide.has(targetSpot.id));
    }
  }

  #applyOverrides(targetSpot: Spot) {
    if (this.#spotsToOverride) {
      const curOverrideTransform = this.#spotsToOverride.get(targetSpot.id);
      if (curOverrideTransform) {
        // convert transform to BABYLON
        this.#node.position.set(
          curOverrideTransform.x,
          curOverrideTransform.z,
          curOverrideTransform.y
        );
        this.#node.rotation.set(
          curOverrideTransform.pitch || this.#node.rotation.x,
          curOverrideTransform.yaw || this.#node.rotation.y,
          curOverrideTransform.roll || this.#node.rotation.z
        );
      }
    }
  }

  hide() {
    this.#node.setEnabled(false);
  }

  addSpotsToHide(spots: Set<number>) {
    spots.forEach((s) => {
      this.#spotsToHide?.add(s);
    });
  }

  removeSpotsToHide(spots: Set<number>) {
    spots.forEach((s) => {
      this.#spotsToHide?.delete(s);
    });
  }

  reveal(curSpotId?: number) {
    if (this.#spotsToHide) {
      this.#node.setEnabled(!this.#spotsToHide.has(curSpotId || 0));
    } else {
      this.#node.setEnabled(true);
    }
  }

  onPicked() {
    if (!getTraveler().isMuted()) {
      this.#effectSound?.play();
    }

    switch (this.contentType) {
      case TourMarkerType.portal:
        {
          const curData = this.contentData as TravelerMarkerOptionPortal;
          getTraveler().moveToTargetSpot(curData.sceneID, { isWarp: true });
        }
        break;

      case TourMarkerType.layering:
        {
          // nothing to do
        }
        break;

      case TourMarkerType.changeTour:
        {
          // nothing to do
        }
        break;
      case TourMarkerType.image:
        {
          this.onMarkerClicked();
        }
        break;
      case TourMarkerType.iframe:
        {
          this.onMarkerClicked();
        }
        break;
      case TourMarkerType.video:
        {
          this.onMarkerClicked();
        }
        break;
      case TourMarkerType.link:
        {
          this.onMarkerClicked();
        }
        break;

      case TourMarkerType.none:
        {
          // nothing to do
        }
        break;

      default:
        break;
    }

    if (this.contentType !== TourMarkerType.layering) {
      return;
    }
  }

  onItemSelected(
    targetItemId: number,
    targetSpotId: number,
    curSpotPosition: Vector3,
    curSpotRotation: Vector3,
    targetScene: Scene
  ) {
    switch (this.contentType) {
      case TourMarkerType.portal:
        {
          const curData = this.contentData as TravelerMarkerOptionPortal;
          getTraveler().moveToTargetSpot(curData.sceneID);
        }
        break;

      case TourMarkerType.layering:
        {
          if (!targetItemId) {
            break;
          }

          const itemData = (
            this.contentData as MarkerOptionLayering
          ).itemList.find((curItem) => {
            return curItem.id === targetItemId;
          });
          if (!itemData) {
            throw new Error(`Cannot find target marker item: ${targetItemId}`);
          }

          const newItem = new Map(this.#items);

          this.#items.clear();

          for (const curLayer of itemData.layerList) {
            const curItemMesh = MeshBuilder.CreateSphere(
              'markerItemMesh-' +
                this.id +
                '-' +
                itemData.id +
                '-' +
                targetSpotId,
              {
                segments: CONFIG.PANORAMA_RESOLUTION,
                diameter: 1000,
                sideOrientation: Mesh.BACKSIDE,
              },
              targetScene
            );

            curItemMesh.isPickable = false;
            curItemMesh.checkCollisions = false;
            curItemMesh.alphaIndex = 1;

            curItemMesh.position = Vector3.Zero();
            curItemMesh.rotation = Vector3.Zero();
            curItemMesh.setEnabled(false);
            if (curLayer.sceneId === targetSpotId) {
              curItemMesh.setEnabled(true);
              curItemMesh.position = curSpotPosition;
              curItemMesh.rotation = curSpotRotation;
            }

            const curItemMatl = new StandardMaterial(
              'markerItemMatl-' + itemData.id + '-' + targetSpotId
            );
            curItemMatl.backFaceCulling = true;
            curItemMatl.alpha = 0;
            curItemMatl.emissiveColor.set(1, 1, 1);
            curItemMatl.transparencyMode = Material.MATERIAL_ALPHABLEND;
            curItemMatl.alphaMode = Engine.ALPHA_COMBINE;
            curItemMatl.useAlphaFromDiffuseTexture = true;

            curItemMatl.animations = [getTraveler().fadeInAnim];

            curItemMesh.material = curItemMatl;
            if (curLayer.imgUrl && curLayer.imgUrl.length > 0) {
              new Texture(curLayer.imgUrl).onLoadObservable.addOnce(
                (loadedTexture) => {
                  loadedTexture.hasAlpha = true;
                  loadedTexture.uAng = Math.PI;
                  loadedTexture.vAng = Math.PI;

                  curItemMatl.diffuseTexture = loadedTexture;
                  targetScene.beginAnimation(
                    curItemMatl,
                    0,
                    120,
                    false,
                    1,
                    () => {
                      for (const [, curItem] of newItem) {
                        curItem.dispose(false, true);
                      }
                    }
                  );

                  if (this.#items.has(curLayer.sceneId)) {
                    this.#items.get(curLayer.sceneId)?.dispose(false, true);
                  }

                  this.#items.set(curLayer.sceneId, curItemMesh);
                }
              );
            }
          }
        }
        break;

      case TourMarkerType.image:
        {
          this.onMarkerClicked();
        }
        break;

      default:
        break;
    }
  }

  private onMarkerClicked() {
    getTraveler().onMarkerClicked(this.id);
  }

  onItemDeselected() {
    switch (this.contentType) {
      case TourMarkerType.layering:
        {
          for (const [, curItem] of this.#items) {
            curItem.setEnabled(false);
          }
        }
        break;

      default:
        {
          for (const [curSpotId, curItem] of this.#items) {
            curItem.dispose(false, true);
            this.#items.delete(curSpotId);
          }
        }
        break;
    }
  }

  #initDisplayData(
    geometryList: TourGeometry[],
    displayType: TourMarkerDisplayType,
    displayData: TourMarkerDisplay,
    targetScene: Scene,
    targetMesh: Mesh,
    targetMaterial: StandardMaterial
  ) {
    switch (displayType) {
      case TourMarkerDisplayType.icon:
        {
          const resourceMeta = displayData as TourMarkerDisplayContent;
          const displayTexture = new Texture(resourceMeta.url || '');
          displayTexture.hasAlpha = true;

          targetMaterial.diffuseTexture = displayTexture;
        }
        break;

      case TourMarkerDisplayType.image:
        {
          const resourceMeta = displayData as TourMarkerDisplayContent;
          const displayTexture = new Texture(resourceMeta.url || '');

          displayTexture.hasAlpha = true;

          targetMaterial.diffuseTexture = displayTexture;
        }
        break;

      case TourMarkerDisplayType.ad:
        {
          SceneLoader.ImportMesh(
            '',
            '',
            displayData as unknown as string,
            this.#scene,
            (meshes) => {
              meshes.forEach((mesh) => {
                mesh.scaling.set(30, 30, 30); // 메시 크기를 2배로 키움
                mesh.parent = this.#node;
              });
            }
          );
        }
        break;

      case TourMarkerDisplayType.icons:
        break;

      case TourMarkerDisplayType.geometry:
        {
          const displayDt = displayData as TourMarkerDisplayGeometry;

          // GLOW
          this.#hl = new HighlightLayer('outline', this.#scene);
          this.#hl.innerGlow = true;
          this.#hl.outerGlow = false;
          this.#hl.isEnabled = false;

          const geoData = geometryList.find((geo) => geo.id == displayDt.id) as
            | TourGeometry
            | undefined;

          if (!geoData) {
            console.warn(`Geometry not found for id: ${displayDt.id}`);
            return;
          }

          let targetMeshs: Mesh[];
          if (geoData.url) {
            const fileArr = geoData.url?.split('/') || [];
            const fileName = fileArr.pop();
            const filePrefix = [...fileArr, ''].join('/');

            // 여기 왔을때는 이미 형상이 만들어져 있다.
            SceneLoader.ImportMeshAsync(
              '',
              filePrefix + fileName,
              '',
              this.#scene
            ).then((meshResult) => {
              targetMeshs = meshResult.meshes as Mesh[];
              targetMeshs.forEach((mesh) => {
                mesh.material = targetMaterial;
                const borderColor = displayDt.borderColor
                  ? Color3.FromHexString(displayDt.borderColor)
                  : Color3.Red();

                this.#hl?.addMesh(mesh as Mesh, borderColor);
                mesh.visibility = 0.01;
                mesh.parent = targetMesh;
                mesh.actionManager = actionManager;
                mesh.metadata = {
                  ignorePick: true,
                };
              });
            });
          } else {
            targetMeshs = [
              MeshBuilder.CreateBox('defaultBox', {
                width: this.width,
                height: this.height,
              }),
            ];
          }

          const material = new StandardMaterial('transparent', this.#scene);
          material.emissiveColor = Color3.White();
          material.alpha = 0;
          material.disableLighting = true;
          targetMaterial = material;

          const actionManager = new ActionManager(this.#scene);

          const overAction = new ExecuteCodeAction(
            {
              trigger: ActionManager.OnPointerOverTrigger,
            },
            () => {
              if (this.#hl) {
                this.#hl.isEnabled = true;
              }
            }
          );

          const outAction = new ExecuteCodeAction(
            {
              trigger: ActionManager.OnPointerOutTrigger,
            },
            () => {
              if (this.#hl) {
                this.#hl.isEnabled = false;
              }
            }
          );

          const pickAction = new ExecuteCodeAction(
            {
              trigger: ActionManager.OnPickTrigger,
            },
            () => {
              if (this.#hl) {
                this.onPicked();
                this.#hl.isEnabled = false;
              }
            }
          );

          actionManager.registerAction(pickAction);
          actionManager.registerAction(overAction);
          actionManager.registerAction(outAction);
        }
        break;

      case TourMarkerDisplayType.video:
        {
          const resourceMeta = displayData as TourMarkerDisplayVideo;
          const displayTexture = new VideoTexture(
            null,
            resourceMeta.url,
            null,
            false,
            false,
            Texture.TRILINEAR_SAMPLINGMODE,
            {
              autoUpdateTexture: true,
              autoPlay: resourceMeta.autoplay || true,
              loop: resourceMeta.loop || true,
              muted: resourceMeta.muted || true,
            },
            (message) => {
              console.error('video texture loading error : ', message);
            }
          );
          displayTexture.hasAlpha = true;

          targetMaterial.diffuseTexture = displayTexture;
        }
        break;

      case TourMarkerDisplayType.text:
        {
          if (!Marker.CONTEXT_TO_MEASURE) {
            console.error('fail to create canvas, for text texture');
            break;
          }

          const DEFAULT_SIZE = 100;
          const DEFAULT_PADDING = 10;
          const DEFAULT_GLOW_THICKNESS = 10;
          const resourceMeta = displayData as TourMarkerDisplayText;

          const textLines = (resourceMeta.value || 'No Text').split('\n');
          const textStyle =
            (resourceMeta.fontWeight || '') +
            ' ' +
            DEFAULT_SIZE +
            'pt ' +
            (resourceMeta.fontFamily || 'sans-serif');

          Marker.CONTEXT_TO_MEASURE!.font = textStyle;

          let boundingRectWidth = 0;
          let boundingRectHeight = 0;
          const renderData: { text: string; x: number; y: number }[] =
            textLines.map((curLine) => {
              const curMetric = Marker.CONTEXT_TO_MEASURE!.measureText(curLine);
              boundingRectWidth = Math.max(
                boundingRectWidth,
                (curMetric?.width || 0) +
                  DEFAULT_PADDING * 2 +
                  (resourceMeta.glowEffect ? DEFAULT_GLOW_THICKNESS * 2 : 0)
              );

              const curLineHeight =
                curMetric.actualBoundingBoxAscent +
                curMetric.actualBoundingBoxDescent;

              boundingRectHeight +=
                curLineHeight +
                DEFAULT_PADDING * 2 +
                (resourceMeta.glowEffect ? DEFAULT_GLOW_THICKNESS * 2 : 0);

              return {
                text: curLine,
                x: 0,
                y:
                  boundingRectHeight -
                  curMetric.actualBoundingBoxDescent -
                  DEFAULT_PADDING,
              };
            });

          const displayTexture = new DynamicTexture(
            'textTexture-' + this.id,
            {
              width: boundingRectWidth,
              height: boundingRectHeight,
            },
            targetScene
          );

          const textureContext = displayTexture.getContext();
          textureContext.font = textStyle;
          textureContext.fillStyle = resourceMeta.fontColor || '#000';

          if (resourceMeta.glowEffect) {
            textureContext.shadowColor = resourceMeta.glowColor || '#fff';
            textureContext.shadowOffsetX = 0;
            textureContext.shadowOffsetY = 0;
            textureContext.shadowBlur = DEFAULT_GLOW_THICKNESS;
          }

          renderData.forEach((curRenderData) => {
            textureContext.fillText(
              curRenderData.text,
              curRenderData.x,
              curRenderData.y,
              boundingRectWidth
            );
          });
          displayTexture.update();
          displayTexture.hasAlpha = true;

          targetMesh.scaling.x =
            (boundingRectWidth / this.width) *
            ((resourceMeta.fontSize || 0) / DEFAULT_SIZE);
          targetMesh.scaling.y =
            (boundingRectHeight / this.height) *
            ((resourceMeta.fontSize || 0) / DEFAULT_SIZE);

          targetMaterial.diffuseTexture = displayTexture;
        }
        break;

      case TourMarkerDisplayType.videoLink:
        break;

      case TourMarkerDisplayType.html:
        break;
    }
  }
}

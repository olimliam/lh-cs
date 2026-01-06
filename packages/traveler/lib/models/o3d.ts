import { O3DModelData as O3DModelInfo } from '../types/o3d';
// import * as BABYLON from '@babylonjs/core';
import {
  Node,
  Mesh,
  ShaderMaterial,
  StandardMaterial,
  MeshBuilder,
  Vector3,
  SceneLoader,
  Effect,
  Color3,
  Texture,
  VertexData,
  ActionManager,
  ExecuteCodeAction,
} from '@babylonjs/core';

import PointerImage from '../assets/images/pointer.png';

const DIVIDE_VALUE = 1000;
const OCTTREE_VALUE = 128;

export class O3DModel extends Node {
  // protected scene!: Scene;
  protected info!: O3DModelInfo;
  protected model!: Mesh;
  protected material!: ShaderMaterial;
  protected spotPointMaterial!: StandardMaterial;
  protected spotPoints: Array<Mesh> = [];
  protected pointSize = 10;

  constructor(info: O3DModelInfo) {
    super('modelNode');
    this.info = info;
    this.material = this._material();
    this.spotPointMaterial = this._spotPointMaterial();
  }

  private generateDefaultModel(): Mesh {
    // 이미 로드되어있는것이 있으면 해제 해야한다
    const defaultModelSize = 1000;

    const mesh = MeshBuilder.CreateGround(
      'defaultModel',
      {
        width: defaultModelSize,
        height: defaultModelSize,
      },
      this.model.getScene()
    );

    return mesh;
  }

  public async init() {
    const mesh = await this.generateModel();

    this.material.setFloat('pointSize', this.pointSize);

    this.model = mesh;
    this.model.name = 'model';
    this.model.subdivide(
      Math.ceil(this.model.getTotalIndices() / DIVIDE_VALUE)
    );
    this.model.createOrUpdateSubmeshesOctree(OCTTREE_VALUE);
    this.model.metadata = {
      isGeometry: true,
    };

    this.model.isPickable = true;
    this.model.useOctreeForPicking = true;
    this.model.useOctreeForCollisions = true;

    this.model.useOctreeForRenderingSelection = true;
    this.model.material = this.material;
    this.model.scaling = new Vector3(
      this.info.scale,
      this.info.scale,
      this.info.scale
    );
    this.model.position.x = this.info.x;
    this.model.position.y = this.info.y;
    this.model.position.z = this.info.z;
    this.model.addRotation(this.info.yaw, this.info.pitch, 0);
    this.model.hasVertexAlpha = true;
    this.model.alphaIndex = 2;
  }

  private async generateModel(): Promise<Mesh> {
    if (this.info.url) {
      const fileArr = this.info.url.split('/');
      const fileName = fileArr.pop();
      const filePrefix = [...fileArr, ''].join('/');

      const meshResult = await SceneLoader.ImportMeshAsync(
        '',
        filePrefix + fileName,
        '',
        this.getScene()
      );

      const validMeshs = meshResult.meshes.filter((x) => {
        return !!x.getTotalVertices();
      });

      const mesh = Mesh.MergeMeshes(
        validMeshs as Mesh[],
        true,
        true,
        undefined,
        true,
        false
      );

      if (!mesh) {
        throw new Error('Can not merge mesh');
      }

      return mesh;
    } else {
      return this.generateDefaultModel();
    }
  }

  public getInfo() {
    return this.info;
  }

  private _material(): ShaderMaterial {
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

      uniform vec3 pickedPoint;
      uniform int mouseOver;
      uniform float pointSize;
      
      void main(void) {
        vec4 color = vec4(0,0,0,0);

        float circleDis = length(pickedPoint-vPosition);
        if (circleDis < pointSize && circleDis > (pointSize / 3. * 1.)) { 
          if (mouseOver == 1) {
            color = vec4(1,1,1,1);
          } else {
            color = vec4(0,0.83,0.54,0.75);
          }
        }
        gl_FragColor = color;
      }
    `;

    const material = new ShaderMaterial(
      'pointer',
      this.getScene(),
      {
        vertex: 'custom',
        fragment: 'custom',
      },
      {
        attributes: ['position'],
        uniforms: [
          'pickedPoint',
          'pointSize',
          'mouseOver',
          'worldViewProjection',
        ],
      }
    );

    return material;
  }

  private _spotPointMaterial() {
    const material = new StandardMaterial('spotPointMat', this.getScene());
    material.emissiveColor = new Color3(1, 1, 1);
    const texture = new Texture(PointerImage, this.getScene());
    material.diffuseTexture = texture;
    material.diffuseTexture.hasAlpha = true;
    material.useAlphaFromDiffuseTexture = true;
    material.useSpecularOverAlpha = true;

    return material;
  }

  protected _spotPointMesh() {
    const scene = this.getScene();
    const p = [] as Array<Vector3>;
    const disc = VertexData.CreateDisc({ radius: 5 });
    const pos = disc.positions!;
    //skip the center point
    for (let i = 1; i < disc.positions!.length / 3; i++) {
      p.push(new Vector3(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]));
    }

    const mesh = MeshBuilder.CreateDisc(
      'spotPoint',
      {
        radius: this.pointSize,
        sideOrientation: Mesh.DOUBLESIDE,
      },
      scene
    );

    return mesh;
  }

  private _spotPoint(point: Vector3) {
    const scene = this.getScene();
    const mesh = this._spotPointMesh();

    mesh.visibility = 0.25;

    mesh.material = this.spotPointMaterial;
    mesh.position = point.clone();
    mesh.position.y = mesh.position.y + 1;

    const normal = Vector3.Down();
    const pitch = Math.asin(-normal.y);
    const yaw = Math.atan2(normal.x, normal.z);

    mesh.rotation.x = pitch;
    mesh.rotation.y = yaw;
    mesh.rotation.z = normal.z;

    mesh.actionManager = new ActionManager(scene);
    mesh.actionManager.hoverCursor = 'default';

    const overAction = new ExecuteCodeAction(
      {
        trigger: ActionManager.OnPointerOverTrigger,
      },
      () => {
        mesh.visibility = 0;
        this.material.setInt('mouseOver', 1);
      }
    );

    const outAction = new ExecuteCodeAction(
      {
        trigger: ActionManager.OnPointerOutTrigger,
      },
      () => {
        mesh.visibility = 0.25;
        this.material.setInt('mouseOver', 0);
      }
    );
    mesh.actionManager?.registerAction(overAction);
    mesh.actionManager?.registerAction(outAction);

    return mesh;
  }

  setPointSize(size: number) {
    if (this.pointSize != size) {
      this.pointSize = size;
      this.material.setFloat('pointSize', this.pointSize);

      const spotInfo = this.spotPoints.map((x) => {
        return new Vector3(x.position.x, x.position.y, x.position.z);
      });

      this.clearSpotPoints();
      this.updateSpotPoints(spotInfo);
    }
  }

  updatePoint(point: Vector3) {
    this.material.setVector3('pickedPoint', point);
  }

  clearSpotPoints() {
    this.material.setInt('mouseOver', 0);
    this.spotPoints.map((x) => {
      x.dispose();
    });
    this.spotPoints = [];
  }

  updateSpotPoints(points: Array<Vector3>) {
    this.clearSpotPoints();
    this.spotPoints = points.map((x) => {
      return this._spotPoint(x);
    });
  }

  getMesh(): Mesh {
    return this.model;
  }

  visiblity(isVisible: boolean) {
    this.model.setEnabled(isVisible);
  }

  destroy() {
    this.spotPointMaterial.dispose(true, true);
    this.spotPoints.map((x) => x.dispose(true, true));
    this.material.dispose(true, true);
    this.model.dispose(true, true);
  }
}

# Camera Control Guide

Traveler 패키지에서 카메라 이벤트 핸들러를 주입하고 프로그래밍적으로 카메라를
제어하는 방법을 설명합니다.

## 개요

ViewerContext를 통해 다음과 같은 카메라 관련 기능을 사용할 수 있습니다:

- **이벤트 핸들러**: 카메라 회전 및 FOV 변화 감지
- **프로그래밍적 제어**: 외부에서 카메라 위치와 줌 레벨 설정

## 사용 가능한 메서드

### 이벤트 핸들러

- `setOnRotationChange(callback)`: 카메라 회전 변화를 감지하는 콜백 설정
- `setOnFovChange(callback)`: 카메라 FOV 변화를 감지하는 콜백 설정

### 카메라 제어

- `setCameraRotation(pitch, yaw, roll)`: 카메라 회전값 설정
- `setCameraFov(fov)`: 카메라 FOV 설정

## 사용 예제

```tsx
import React, { useEffect } from 'react';
import { useViewer } from './lib/contexts/ViewerContext';

const CameraControlExample: React.FC = () => {
  const {
    setOnRotationChange,
    setOnFovChange,
    setCameraRotation,
    setCameraFov,
  } = useViewer();

  useEffect(() => {
    // 카메라 회전 변화 감지
    setOnRotationChange(
      (pitch: number, yaw: number, roll: number, sceneId?: number) => {
        console.log('Camera rotation changed:', {
          pitch,
          yaw,
          roll,
          sceneId,
        });
        // 여기서 다른 컴포넌트나 외부 시스템에 알림 가능
        // 예: 웹소켓으로 다른 사용자들에게 카메라 위치 공유
      }
    );

    // FOV 변화 감지
    setOnFovChange((fov: number) => {
      console.log('Camera FOV changed:', fov);
      // FOV 변화에 따른 UI 업데이트 등
    });
  }, [setOnRotationChange, setOnFovChange]);

  // 프로그래밍적으로 카메라 제어
  const handleSetCameraPosition = () => {
    // 특정 위치로 카메라 회전 설정
    setCameraRotation(0.2, 1.5, 0); // pitch, yaw, roll
  };

  const handleZoomIn = () => {
    // FOV를 줄여서 확대
    setCameraFov(0.8);
  };

  const handleZoomOut = () => {
    // FOV를 늘려서 축소
    setCameraFov(1.2);
  };

  return (
    <div>
      <h3>Camera Control Example</h3>
      <button onClick={handleSetCameraPosition}>Set Camera Position</button>
      <button onClick={handleZoomIn}>Zoom In</button>
      <button onClick={handleZoomOut}>Zoom Out</button>
    </div>
  );
};
```

## 활용 사례

### 실시간 카메라 공유

웹소켓을 통해 여러 사용자 간의 카메라 위치를 실시간으로 동기화할 수 있습니다:

```tsx
useEffect(() => {
  setOnRotationChange((pitch, yaw, roll, sceneId) => {
    // 웹소켓으로 다른 사용자들에게 카메라 위치 전송
    websocket.send(
      JSON.stringify({
        type: 'camera-rotation',
        data: { pitch, yaw, roll, sceneId },
      })
    );
  });

  setOnFovChange((fov) => {
    // FOV 변화 공유
    websocket.send(
      JSON.stringify({
        type: 'camera-fov',
        data: { fov },
      })
    );
  });
}, []);

// 다른 사용자의 카메라 위치 수신
websocket.onmessage = (event) => {
  const message = JSON.parse(event.data);

  if (message.type === 'camera-rotation') {
    const { pitch, yaw, roll, sceneId } = message.data;
    setCameraRotation(pitch, yaw, roll);
    console.log('sceneId from peer', sceneId);
  }

  if (message.type === 'camera-fov') {
    setCameraFov(message.data.fov);
  }
};
```

### 자동 카메라 투어

미리 정의된 시나리오에 따라 자동으로 카메라를 이동시킬 수 있습니다:

```tsx
const startCameraTour = async () => {
  const tourPoints = [
    { pitch: 0, yaw: 0, roll: 0, fov: 1.0 },
    { pitch: 0.2, yaw: 1.5, roll: 0, fov: 0.8 },
    { pitch: -0.1, yaw: 3.0, roll: 0, fov: 1.2 },
  ];

  for (const point of tourPoints) {
    setCameraRotation(point.pitch, point.yaw, point.roll);
    setCameraFov(point.fov);

    // 다음 포인트로 이동하기 전 대기
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
};
```

### 상태 기반 카메라 제어

애플리케이션 상태에 따라 카메라를 자동으로 조정할 수 있습니다:

```tsx
useEffect(() => {
  if (isDetailMode) {
    // 상세 모드일 때 확대
    setCameraFov(0.6);
  } else {
    // 일반 모드일 때 기본 줌
    setCameraFov(1.0);
  }
}, [isDetailMode]);
```

## 주의사항

- **성능**: 이벤트 핸들러 내에서 무거운 연산을 피하세요. 필요시 디바운싱을
  적용하세요.
- **메모리 누수**: 컴포넌트 언마운트 시 이벤트 핸들러를 정리해야 할 경우 적절한
  cleanup을 구현하세요.
- **좌표계**: pitch, yaw, roll 값은 라디안 단위입니다.
- **FOV 범위**: FOV 값은 CONFIG.MIN_FOV와 CONFIG.MAX_FOV 사이의 값으로
  제한됩니다.

## API 참조

### setOnRotationChange

```typescript
setOnRotationChange(
  callback: (pitch: number, yaw: number, roll: number, sceneId?: number) => void
): void
```

카메라 회전이 변경될 때마다 호출되는 콜백을 설정합니다.

**매개변수:**

- `callback`: 회전 변화 시 호출될 함수
  - `pitch`: X축 회전 (라디안)
  - `yaw`: Y축 회전 (라디안)
  - `roll`: Z축 회전 (라디안)
  - `sceneId`: 현재 투어 씬 ID(선택)

### setOnFovChange

```typescript
setOnFovChange(callback: (fov: number) => void): void
```

카메라 FOV가 변경될 때마다 호출되는 콜백을 설정합니다.

**매개변수:**

- `callback`: FOV 변화 시 호출될 함수
  - `fov`: 새로운 FOV 값

### setCameraRotation

```typescript
setCameraRotation(pitch: number, yaw: number, roll: number): void
```

카메라 회전을 프로그래밍적으로 설정합니다.

**매개변수:**

- `pitch`: X축 회전 (라디안)
- `yaw`: Y축 회전 (라디안)
- `roll`: Z축 회전 (라디안)

### setCameraFov

```typescript
setCameraFov(fov: number): void
```

카메라 FOV를 프로그래밍적으로 설정합니다.

**매개변수:**

- `fov`: 새로운 FOV 값 (CONFIG.MIN_FOV ~ CONFIG.MAX_FOV 범위 내에서 자동 클램핑)

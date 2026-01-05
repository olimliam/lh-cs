import { useEffect } from 'react';

export const useRotationChangeListener = (
  setOnRotationChange: (
    callback: (
      pitch: number,
      yaw: number,
      roll: number,
      sceneId?: number
    ) => void
  ) => void,
  handler: (pitch: number, yaw: number, roll: number, sceneId?: number) => void
) => {
  useEffect(() => {
    setOnRotationChange(handler);
    return () => {
      const noop: typeof handler = () => {};
      setOnRotationChange(noop);
    };
  }, [handler, setOnRotationChange]);
};

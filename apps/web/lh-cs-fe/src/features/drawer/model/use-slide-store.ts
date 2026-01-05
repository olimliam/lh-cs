import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { SlideItemDto } from './slide-item.dto';
import { createSetter } from '@/shared/utils/store-util';
import {
  DRAW_TYPE,
  LINE_STYLE,
  PEN_COLOR,
  PEN_WIDTH,
} from './whiteboard.types';

interface SlideState {
  slideList: SlideItemDto[];
  sideBarOpen: boolean;
}

interface SlideAction {
  setSlideList: (slideList: SlideItemDto[]) => void;
  setSideBarOpen: (flag: boolean) => void;
  undo: () => void;
  redo: () => void;
  clear: () => void;
}

export type SlideStore = SlideState & SlideAction;

const useSlideStore = create<SlideStore>()(
  devtools(
    persist(
      (set) => ({
        slideList: [new SlideItemDto({ isSelected: true })],
        setSlideList: createSetter(set, 'slideList'),
        sideBarOpen: true,
        setSideBarOpen: createSetter(set, 'sideBarOpen'),
        undo: () => {
          set((state) => {
            return {
              ...state,
              slideList: state.slideList.map((slide) => {
                if (slide.isSelected) {
                  const stack = slide.drawStack.pop();

                  if (stack) {
                    const redoStack = [...slide.redoStack];
                    redoStack.push(stack);
                    return {
                      ...slide,
                      redoStack: redoStack,
                    };
                  } else {
                    return slide;
                  }
                } else {
                  return slide;
                }
              }),
            };
          });
        },
        redo: () => {
          set((state) => {
            return {
              ...state,
              slideList: state.slideList.map((slide) => {
                if (slide.isSelected) {
                  const stack = slide.redoStack.pop();
                  if (stack) {
                    const drawStack = [...slide.drawStack];
                    drawStack.push(stack);

                    return {
                      ...slide,
                      drawStack: drawStack,
                    };
                  } else {
                    return slide;
                  }
                } else {
                  return slide;
                }
              }),
            };
          });
        },
        clear: () => {
          set((state) => {
            return {
              ...state,
              slideList: state.slideList.map((slide) => {
                if (slide.isSelected) {
                  return {
                    ...slide,
                    drawStack: [
                      ...slide.drawStack,
                      [
                        {
                          type: DRAW_TYPE.CLEAR,
                          position: { x: 0, y: 0 },
                          options: {
                            penColor: PEN_COLOR.BLACK,
                            penWidth: PEN_WIDTH.NORMAL,
                            isEraseMode: false,
                            lineStyle: LINE_STYLE.LINE,
                          },
                        },
                        {
                          type: DRAW_TYPE.CLEAR,
                          position: { x: 0, y: 0 },
                          options: {
                            penColor: PEN_COLOR.BLACK,
                            penWidth: PEN_WIDTH.NORMAL,
                            isEraseMode: false,
                            lineStyle: LINE_STYLE.LINE,
                          },
                        },
                      ],
                    ],
                  };
                } else {
                  return slide;
                }
              }),
            };
          });
        },
      }),
      {
        name: 'whiteboard-slides', // sessionStorage key
        storage: {
          getItem: (name: string) => {
            const item = sessionStorage.getItem(name);
            return item ? JSON.parse(item) : null;
          },
          setItem: (name: string, value: any) => {
            sessionStorage.setItem(name, JSON.stringify(value));
          },
          removeItem: (name: string) => {
            sessionStorage.removeItem(name);
          },
        },
        version: 1,
      }
    )
  )
);

export default useSlideStore;

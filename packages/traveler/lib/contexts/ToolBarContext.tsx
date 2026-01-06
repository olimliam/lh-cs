import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  ControlBarStyle,
  ControlBarPosition,
  MenuType,
  ControlBarPositionConst,
  ControlBarStyleConst,
} from '../types/controller-bar';
import { TourScene, TourTheme } from '../types/tour';

interface ToolbarContextState {
  isLandscape: boolean;
  isControllerBar: boolean;
  isPinnedMap: boolean;
  isPrimeScene: boolean;
  isComparison: boolean;
  currentMarkerId: number;
  pinnedHeight: number;
  chatNickname: string;
  barPosition: ControlBarPosition;
  barStyle: ControlBarStyle;
  currentMenu: MenuType | null;
  currentTour: {
    tourID: string;
    tourTitle: string;
  } | null;
  currentScene: TourScene | null;
  currentTheme: TourTheme | null;

  setIsLandscape: (value: boolean) => void;
  setIsControllerBar: (value: boolean) => void;
  setIsPinnedMap: (value: boolean) => void;
  setIsPrimeScene: (value: boolean) => void;
  setIsComparison: (value: boolean) => void;
  setCurrentMenu: (value: MenuType | null) => void;
  setBarPosition: (value: ControlBarPosition) => void;
  setBarStyle: (value: ControlBarStyle) => void;
  setCurrentTour: (value: { tourID: string; tourTitle: string }) => void;
  setCurrentScene: (value: TourScene) => void;
  setCurrentTheme: (value: TourTheme) => void;
  setCurrentMarkerId: (value: number) => void;
  setPinnedHeight: (value: number) => void;
  setChatNickname: (value: string) => void;
}

const ToolbarContext = createContext<ToolbarContextState | undefined>(
  undefined
);

interface ToolbarProviderProps {
  children: ReactNode;
}

export const ToolbarProvider: React.FC<ToolbarProviderProps> = ({
  children,
}) => {
  // State
  const [isLandscape, setIsLandscape] = useState<boolean>(false);
  const [isControllerBar, setIsControllerBar] = useState<boolean>(true);
  const [isPinnedMap, setIsPinnedMap] = useState<boolean>(false);
  const [isPrimeScene, setIsPrimeScene] = useState<boolean>(true);
  const [isComparison, setIsComparison] = useState<boolean>(false);
  const [currentMarkerId, setCurrentMarkerId] = useState<number>(0);
  const [pinnedHeight, setPinnedHeight] = useState<number>(0);
  const [chatNickname, setChatNickname] = useState<string>('');
  const [barPosition, setBarPosition] = useState<ControlBarPosition>(
    ControlBarPositionConst.BOTTOM
  );
  const [barStyle, setBarStyle] = useState<ControlBarStyle>(
    ControlBarStyleConst.ROUND_BLACK
  );
  const [currentMenu, setCurrentMenu] = useState<MenuType | null>(null);
  const [currentTour, setCurrentTour] = useState<{
    tourID: string;
    tourTitle: string;
  } | null>(null);
  const [currentScene, setCurrentScene] = useState<TourScene | null>(null);
  const [currentTheme, setCurrentTheme] = useState<TourTheme | null>(null);

  const value: ToolbarContextState = {
    isLandscape,
    isControllerBar,
    isPinnedMap,
    isPrimeScene,
    isComparison,
    currentMarkerId,
    pinnedHeight,
    chatNickname,
    barPosition,
    barStyle,
    currentMenu,
    currentTour,
    currentScene,
    currentTheme,

    setIsLandscape,
    setIsControllerBar,
    setIsPinnedMap,
    setIsPrimeScene,
    setIsComparison,
    setCurrentMenu,
    setBarPosition,
    setBarStyle,
    setCurrentTour,
    setCurrentScene,
    setCurrentTheme,
    setCurrentMarkerId,
    setPinnedHeight,
    setChatNickname,
  };

  return (
    <ToolbarContext.Provider value={value}>{children}</ToolbarContext.Provider>
  );
};

export const useToolbar = (): ToolbarContextState => {
  const context = useContext(ToolbarContext);
  if (context === undefined) {
    throw new Error('useToolbar must be used within a ToolbarProvider');
  }
  return context;
};

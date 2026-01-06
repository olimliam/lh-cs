import {
  ControlBarPositionConst,
  ControlBarStyleConst,
  ControllerMenuProps,
  MenuType,
  MenuTypeConst,
  SpaceControl,
  SpaceTour,
} from '../../../types/controller-bar';
import { useEffect, useState } from 'react';

import cx from 'classnames';
import useMainScenario from '../../../hooks/useMainScenario';
import PrimeScene from '../../menu/molecule/PrimeScene';
import TourList from '../../menu/molecule/TourList';
import ThemeList from '../../menu/molecule/ThemeList';
import Setting from '../../menu/molecule/Setting';
import { BarRoot } from '../atom/BarRoot';
import { BarContent } from '../atom/BarContent';
import Map from '../../menu/molecule/Map';
import { BarToggleButton } from '../atom/BarToggleButton';
import { useToolbar } from '../../../contexts/ToolBarContext';
import { tourYawToO3DYaw } from '../../../utils/o3d.util';
import { useViewer } from '../../../contexts/ViewerContext';
import ControllerButton from '../molecule/ControllerButton';
import { useIsDevice } from '../../../hooks/useIsDevice';

interface ControllerBarProps {
  isTourPreview?: boolean;
  isSpacePreview?: boolean;
  isTourList?: boolean;
  startSceneID?: number;
  option: SpaceControl;
  tourList: Array<SpaceTour>;
  onChangeTour: (tour: SpaceTour) => void;
}

const toggleIcons = {
  [ControlBarStyleConst.ROUND_BLACK]: {
    [ControlBarPositionConst.BOTTOM]: {
      default: 'ic-arrow-down-lg',
      active: 'ic-arrow-up-lg',
    },
    [ControlBarPositionConst.TOP]: {
      default: 'ic-arrow-up-lg',
      active: 'ic-arrow-down-lg',
    },
    [ControlBarPositionConst.LEFT]: {
      default: 'ic-arrow-left-lg',
      active: 'ic-arrow-right-lg',
    },
    [ControlBarPositionConst.RIGHT]: {
      default: 'ic-arrow-right-lg',
      active: 'ic-arrow-left-lg',
    },
  },
  [ControlBarStyleConst.SQUARE_BLACK]: {
    [ControlBarPositionConst.BOTTOM]: {
      default: 'ic-tailarrow-down-lg',
      active: 'ic-tailarrow-up-lg',
    },
    [ControlBarPositionConst.TOP]: {
      default: 'ic-tailarrow-up-lg',
      active: 'ic-tailarrow-down-lg',
    },
    [ControlBarPositionConst.LEFT]: {
      default: 'ic-tailarrow-left-lg',
      active: 'ic-tailarrow-right-lg',
    },
    [ControlBarPositionConst.RIGHT]: {
      default: 'ic-tailarrow-right-lg',
      active: 'ic-tailarrow-left-lg',
    },
  },
  [ControlBarStyleConst.CLEAR_WHITE]: {
    [ControlBarPositionConst.BOTTOM]: {
      default: 'ic-arrow-down-lg',
      active: 'ic-arrow-up-lg',
    },
    [ControlBarPositionConst.TOP]: {
      default: 'ic-arrow-up-lg',
      active: 'ic-arrow-down-lg',
    },
    [ControlBarPositionConst.LEFT]: {
      default: 'ic-arrow-left-lg',
      active: 'ic-arrow-right-lg',
    },
    [ControlBarPositionConst.RIGHT]: {
      default: 'ic-arrow-right-lg',
      active: 'ic-arrow-left-lg',
    },
  },
  [ControlBarStyleConst.ROUND_WHITE]: {
    [ControlBarPositionConst.BOTTOM]: {
      default: 'ic-tailarrow-down-lg',
      active: 'ic-tailarrow-up-lg',
    },
    [ControlBarPositionConst.TOP]: {
      default: 'ic-tailarrow-up-lg',
      active: 'ic-tailarrow-down-lg',
    },
    [ControlBarPositionConst.LEFT]: {
      default: 'ic-tailarrow-left-lg',
      active: 'ic-tailarrow-right-lg',
    },
    [ControlBarPositionConst.RIGHT]: {
      default: 'ic-tailarrow-right-lg',
      active: 'ic-tailarrow-left-lg',
    },
  },
};

export default function ControllerBar(props: ControllerBarProps) {
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  // const { message } = useLang();
  const { isTablet } = useIsDevice();
  const {
    isControllerBar,
    setIsControllerBar,
    barPosition,
    barStyle,
    // currentScene,themes
    currentMenu,
    setCurrentMenu,
  } = useToolbar();

  const {
    state,
    getCurrentScene,
    getSortedThemes,
    getCurrentMinimap,
    getThemeGeometries,
    setViewSwitchParam,
    setCurrentThemeID,
    setIsComparison,
    setIsVrPlayer,
  } = useViewer();

  const currentScene = getCurrentScene();
  const themes = getSortedThemes();
  const themeGeometries = getThemeGeometries();
  const currentMinimap = getCurrentMinimap();

  const isThemeGeometries = themeGeometries?.length > 0;
  const isEnoughTheme = themes.length > 1;

  const targetIndex =
    themes.findIndex((theme) => theme.id === state.currentThemeID) || 0;

  const isXPosition =
    barPosition === ControlBarPositionConst.LEFT ||
    barPosition === ControlBarPositionConst.RIGHT;

  const toggleButtonSrc = toggleIcons[barStyle][barPosition];

  const { isEmptyScene, isVisibleButton, onLeftClick, onRightClick } =
    useMainScenario(props.startSceneID);

  const iconCls = (cls: string) =>
    cx(
      cls,
      'text-white',
      barStyle === ControlBarStyleConst.ROUND_WHITE && '!text-gray-800'
    );

  const updateCurrentThemeID = () => {
    const target = themes[(targetIndex + 1) % themes.length];
    setCurrentThemeID(target.id);
  };

  const items = [
    {
      type: MenuTypeConst.MENU,
      icon: 'ic-menu',
      title: '메뉴',
      onClick: () => {
        handleItemClick(MenuTypeConst.MENU);
      },
    },
    {
      type: MenuTypeConst.MINIMAP,
      icon: 'ic-globe',
      title: '미니맵',
      onClick: () => {
        handleItemClick(MenuTypeConst.MINIMAP);
      },
    },
    {
      type: MenuTypeConst.IMPORTANT,
      icon: 'ic-place',
      title: '주요위치',
      onClick: () => {
        handleItemClick(MenuTypeConst.IMPORTANT);
      },
    },
    {
      type: MenuTypeConst.THEME_LIST,
      icon: 'ic-theme',
      title: '테마목록',
      onClick: () => {
        handleItemClick(MenuTypeConst.THEME_LIST);
      },
    },
    {
      type: MenuTypeConst.THEME_SWITCH,
      icon: 'ic-switch',
      title: '테마전환',
      onClick: () => {
        updateCurrentThemeID();
      },
    },

    {
      type: MenuTypeConst.THEME_COMPARISON,
      icon: 'ic-dual',
      title: '테마비교',
      onClick: () => {
        setIsComparison(true);
      },
    },
    {
      type: MenuTypeConst.FULLSCREEN,
      icon: 'ic-screen-expand',
      title: '전체보기',
      onClick: () => {
        handleFullscreen();
      },
    },
    {
      type: MenuTypeConst.ORIGIN,
      icon: 'ic-focus',
      title: '원위치',
      onClick: () => {
        handleOrigin();
      },
    },
    {
      type: MenuTypeConst.VR_MODE,
      icon: 'ic-vr',
      title: 'VR 모드',
      onClick: () => {
        setIsVrPlayer(true);
      },
    },
    {
      type: MenuTypeConst.SETTING,
      icon: 'ic-more',
      title: '더보기',
      onClick: () => {
        {
          handleItemClick(MenuTypeConst.SETTING);
        }
      },
    },
  ] as Omit<ControllerMenuProps, 'isActive'>[];

  const filterMenuTypes = (() => {
    const initMenu = [
      ...(props.option?.optionList
        .filter((opt) => opt.isActive)
        .map((fOpt) => fOpt.id) || []),
      MenuTypeConst.SETTING,
    ];

    return initMenu.filter(
      (type) =>
        (!isTablet ||
          (type !== MenuTypeConst.FULLSCREEN &&
            type !== MenuTypeConst.ORIGIN &&
            type !== MenuTypeConst.VR_MODE)) &&
        (!props.isTourPreview || type !== MenuTypeConst.MENU) &&
        (!isEmptyScene || type !== MenuTypeConst.IMPORTANT) &&
        (isThemeGeometries ||
          (type !== MenuTypeConst.MINIMAP &&
            type !== MenuTypeConst.THEME_LIST &&
            type !== MenuTypeConst.THEME_SWITCH &&
            type !== MenuTypeConst.THEME_COMPARISON)) &&
        (props.isTourList || type !== MenuTypeConst.MENU) &&
        (isEnoughTheme ||
          (type !== MenuTypeConst.THEME_LIST &&
            type !== MenuTypeConst.THEME_SWITCH &&
            type !== MenuTypeConst.THEME_COMPARISON)) &&
        (initMenu.includes(MenuTypeConst.LANGUAGE) ||
          (!props.isTourPreview && !props.isSpacePreview) ||
          !isEmptyScene ||
          type !== MenuTypeConst.SETTING) &&
        (!!currentMinimap?.url || type !== MenuTypeConst.MINIMAP)
    );
  })();

  const filterItems = items.filter((item) =>
    filterMenuTypes.includes(item.type)
  );

  const handleFullscreenFlag = () => {
    if (!document.fullscreenElement) setIsFullScreen(false);
    else setIsFullScreen(true);
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.body.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const handleOrigin = () => {
    setViewSwitchParam({
      yaw: tourYawToO3DYaw(currentScene.yaw, currentScene.offset),
      pitch: currentScene.pitch,
      fov: null,
    });
  };
  const isCurrentMenu = (menu: MenuType) => {
    return menu === currentMenu;
  };

  const handleItemClick = (menu: MenuType) => {
    const target = isCurrentMenu(menu) ? null : menu;
    setCurrentMenu(target);
  };

  useEffect(() => {
    addEventListener('fullscreenchange', () => handleFullscreenFlag());
    return () => {
      removeEventListener('fullscreenchange', () => handleFullscreenFlag());
    };
  }, []);

  return (
    <>
      {Array.isArray(filterMenuTypes) && filterMenuTypes.length !== 0 && (
        <>
          <BarRoot barPosition={barPosition}>
            <TourList
              tourList={props.tourList}
              onChangeTour={props.onChangeTour}
            />
            <Map />
            <PrimeScene />
            <ThemeList />
            <Setting
              isLanguage={filterMenuTypes.includes(MenuTypeConst.LANGUAGE)}
              isShare={!props.isTourPreview && !props.isSpacePreview}
              isEmptyImportant={isEmptyScene}
            />
            <BarContent
              isController={isControllerBar}
              barPosition={barPosition}
              barStyle={barStyle}
            >
              {!isTablet && isXPosition && isVisibleButton && (
                <div className='mb-4 flex items-center'>
                  <button className='p-1' onClick={() => onLeftClick()}>
                    <i className={iconCls('text-ic-md ic-arrow-left-double')} />
                  </button>
                  <button className='p-1' onClick={() => onRightClick()}>
                    <i
                      className={iconCls('text-ic-md ic-arrow-right-double')}
                    />
                  </button>
                </div>
              )}
              {!isTablet && !isXPosition && isVisibleButton && (
                <button className='p-3' onClick={() => onLeftClick()}>
                  <i
                    className={iconCls(
                      'text-ic-md ic-arrow-left-double tablet:text-ic-lg'
                    )}
                  />
                </button>
              )}
              <div
                className={cx(
                  'tablet:gap-x-2 flex items-center',
                  isXPosition && 'flex-col gap-y-3',
                  !isXPosition && 'tablet:px-0 gap-x-3 px-10'
                )}
              >
                {filterItems.map((item) => (
                  <ControllerButton
                    key={item.type}
                    isActive={
                      isCurrentMenu(item.type) ||
                      (isFullScreen && item.type === MenuTypeConst.FULLSCREEN)
                    }
                    type={item.type}
                    title={item.title}
                    icon={item.icon}
                    onClick={() => item.onClick()}
                  />
                ))}
              </div>
              {!isTablet && !isXPosition && isVisibleButton && (
                <button className='p-3' onClick={() => onRightClick()}>
                  <i
                    className={iconCls(
                      'text-ic-md ic-arrow-right-double tablet:text-ic-lg'
                    )}
                  />
                </button>
              )}
            </BarContent>
          </BarRoot>
          <BarToggleButton
            barPosition={barPosition}
            barStyle={barStyle}
            onClick={() => setIsControllerBar(!isControllerBar)}
          >
            <i
              className={cx(
                iconCls('text-ic-xs'),
                isControllerBar
                  ? toggleButtonSrc.default
                  : toggleButtonSrc.active
              )}
            />
          </BarToggleButton>
        </>
      )}
    </>
  );
}

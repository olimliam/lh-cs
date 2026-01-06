/** @jsxImportSource @emotion/react */
import { useToolbar } from '../../../contexts/ToolBarContext';
import {
  ControlBarStyleConst,
  MenuType,
  MenuTypeConst,
} from '../../../types/controller-bar';
import { MenuButton } from '../../menu/atom/MenuButton';
import cx from 'classnames';
import { IconText } from '../atom/IconText';
import { useIsDevice } from '../../../hooks/useIsDevice';

interface ControllerMenuProps {
  isActive?: boolean;
  title: string;
  icon: string;
  type: MenuType;
  onClick: () => void;
}

const ControllerButton = (props: ControllerMenuProps) => {
  const { isPinnedMap, barStyle } = useToolbar();

  const { isTablet } = useIsDevice();
  return (
    <MenuButton
      isActive={props.isActive}
      barStyle={barStyle}
      onClick={() => props.onClick()}
    >
      {props.type === MenuTypeConst.MINIMAP && isPinnedMap && (
        <div
          className={cx(
            'absolute right-1.5 top-1.5 h-1 w-1 rounded-full',
            barStyle === ControlBarStyleConst.ROUND_BLACK &&
              (props.isActive ? 'bg-gray-950' : 'bg-white'),
            (barStyle === ControlBarStyleConst.SQUARE_BLACK ||
              barStyle === ControlBarStyleConst.CLEAR_WHITE) &&
              'bg-white',
            barStyle === ControlBarStyleConst.ROUND_WHITE &&
              (props.isActive ? 'bg-white' : 'bg-gray-800')
          )}
        />
      )}
      <i className={cx('text-ic-md tablet:text-ic-lg mb-1', props.icon)} />
      {!isTablet && <p css={IconText}>{props.title}</p>}
    </MenuButton>
  );
};

export default ControllerButton;

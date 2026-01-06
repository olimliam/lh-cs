import cx from 'classnames';
import ContentRoot from '../atom/ContentRoot';
import ContentMenu from '../atom/ContentMenu';
import { useShare } from '../../../hooks/useShare';
import {
  ControlBarStyleConst,
  MenuTypeConst,
} from '../../../types/controller-bar';
import { useToolbar } from '../../../contexts/ToolBarContext';
import Toggle from '../atom/Toggle';

interface SettingProps {
  isLanguage: boolean;
  isShare: boolean;
  isEmptyImportant: boolean;
}

const Setting = (props: SettingProps) => {
  const { barStyle, isPrimeScene, setIsPrimeScene } = useToolbar();

  // const { message, langCode, updateLang } = useLang();
  const { doShare } = useShare();

  const textCls = cx(
    barStyle === ControlBarStyleConst.ROUND_WHITE
      ? 'text-gray-800'
      : 'text-white'
  );

  // const handleLangChange = () => {
  //   if (langCode === SUPPORTED_LANG_CODE.EN) updateLang(SUPPORTED_LANG_CODE.KO);
  //   else updateLang(SUPPORTED_LANG_CODE.EN);
  // };

  return (
    <ContentRoot
      className={cx(
        'flex w-60 flex-col py-4',
        barStyle !== ControlBarStyleConst.CLEAR_WHITE &&
          barStyle !== ControlBarStyleConst.ROUND_WHITE &&
          'px-3'
      )}
      type={MenuTypeConst.SETTING}
    >
      {!props.isEmptyImportant && (
        <ContentMenu
          className={cx(
            'flex cursor-auto items-center justify-center gap-x-2',
            textCls
          )}
        >
          {'주요위치투어'}
          <Toggle
            value={isPrimeScene}
            onChecked={(val) => {
              setIsPrimeScene(val);
            }}
          />
        </ContentMenu>
      )}
      {props.isLanguage && (
        <ContentMenu
          className={cx('flex items-center justify-center gap-x-2', textCls)}
          isLast={!props.isShare}
          onClick={() => {
            // handleLangChange();
          }}
        >
          {'언어 변경'}
          <i className={cx('ic-switch text-ic-md', textCls)} />
        </ContentMenu>
      )}
      {props.isShare && (
        <ContentMenu
          className={cx('flex items-center justify-center gap-x-2', textCls)}
          isLast
          onClick={() => {
            doShare(
              window.location.href,
              '주소가 복사되었습니다. 원하는 곳에 붙여넣기해주세요.'
            );
          }}
        >
          {'URL 복사하기'}
        </ContentMenu>
      )}
    </ContentRoot>
  );
};

export default Setting;

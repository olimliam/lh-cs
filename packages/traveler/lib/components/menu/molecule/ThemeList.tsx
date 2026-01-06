import { css } from '@emotion/react';
import styled from '@emotion/styled';
import ContentRoot from '../atom/ContentRoot';
import { TourTheme } from '../../../types/tour';
import {
  ControlBarStyleConst,
  MenuTypeConst,
} from '../../../types/controller-bar';
import ContentMenu from '../atom/ContentMenu';
import { useToolbar } from '../../../contexts/ToolBarContext';
import { useViewer } from '../../../contexts/ViewerContext';

// 스타일링을 위한 추가 prop을 포함하는 타입 (이 prop은 DOM에 전달되지 않음)
type StyledContentRootProps = {
  $barStyle: string;
};

// Styled version of ContentRoot with conditional styling
const StyledContentRoot = styled(ContentRoot)<StyledContentRootProps>`
  display: flex;
  width: 15rem; /* w-60 */
  flex-direction: column;
  padding-top: 1rem; /* py-4 */
  padding-bottom: 1rem; /* py-4 */

  ${({ $barStyle }) =>
    $barStyle !== ControlBarStyleConst.CLEAR_WHITE &&
    $barStyle !== ControlBarStyleConst.ROUND_WHITE &&
    css`
      padding-left: 0.75rem; /* px-3 */
      padding-right: 0.75rem; /* px-3 */
    `}
`;

function ThemeList() {
  const { barStyle } = useToolbar();
  const { state, getSortedThemes, setCurrentTheme } = useViewer();

  const themes = getSortedThemes();

  return (
    <StyledContentRoot
      $barStyle={barStyle} // $ 접두사를 사용하여 DOM에 전달되지 않는 prop 표시
      type={MenuTypeConst.THEME_LIST}
    >
      {themes.map((theme: TourTheme, idx: number) => (
        <ContentMenu
          key={theme.id}
          isLast={themes.length - 1 === idx}
          isActive={theme.id === state.currentThemeID}
          onClick={() => setCurrentTheme(theme.id)}
        >
          {theme.title}
        </ContentMenu>
      ))}
    </StyledContentRoot>
  );
}

export default ThemeList;

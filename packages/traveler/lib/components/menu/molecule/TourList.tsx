import { useParams } from 'react-router-dom';
import { css } from '@emotion/react';
import styled from '@emotion/styled';

import {
  ControlBarStyleConst,
  MenuTypeConst,
  SpaceTour,
} from '../../../types/controller-bar';
import ContentRoot from '../atom/ContentRoot';
import ContentMenu from '../atom/ContentMenu';
import { useToolbar } from '../../../contexts/ToolBarContext';

interface TourListProps {
  tourList: Array<SpaceTour>;
  onChangeTour: (tour: SpaceTour) => void;
}

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

function TourList(props: TourListProps) {
  const params = useParams();

  const { barStyle, setCurrentMenu } = useToolbar();

  const spaceOrder = Number(params.order || 0);

  return (
    <StyledContentRoot $barStyle={barStyle} type={MenuTypeConst.MENU}>
      {props.tourList?.map((tour, idx) => (
        <ContentMenu
          key={tour.order}
          isLast={props.tourList.length - 1 === idx}
          isActive={tour.order === spaceOrder}
          onClick={() => {
            props.onChangeTour(tour);
            setCurrentMenu(null);
          }}
        >
          {tour.name}
        </ContentMenu>
      ))}
    </StyledContentRoot>
  );
}

export default TourList;

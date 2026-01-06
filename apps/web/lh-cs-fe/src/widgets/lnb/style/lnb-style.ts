import styled from '@emotion/styled';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  height: 100%;
`;

export const LnbContainer = styled.div`
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0px 4px 12px 0px rgba(0, 0, 0, 0.05);
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  /* gap: 36px; */
  flex: 1;
  width: 100%;

  & .lnb-box {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
`;

export const MenuSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const SectionTitle = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

export const IconWrapper = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #111111;

  .MuiSvgIcon-root {
    width: 24px;
    height: 24px;
    color: currentColor;
  }
`;

export const MenuList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`;

export const MenuItem = styled.div<{ isSelected: boolean }>`
  padding: 12px 16px;
  border-radius: 8px;
  background: ${(props) => (props.isSelected ? '#eeeeee' : 'transparent')};
  cursor: pointer;

  &:hover {
    background: ${(props) => (props.isSelected ? '#eeeeee' : '#f5f5f5')};
  }
`;

export const MenuItemContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const ArrowIcon = styled.div<{ isSelected: boolean }>`
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: ${(props) =>
    props.isSelected ? 'rotate(90deg)' : 'rotate(0deg)'};
  transition: transform 0.2s ease;

  &::after {
    content: '›';
    font-size: 18px;
    color: rgba(17, 17, 17, 0.6);
  }
`;

export const MoveToButton = styled.button`
  display: flex;
  width: 100%;
  padding: 12px 12px 12px 16px;
  justify-content: space-between;
  align-items: center;
  border-radius: 4px;
  border: 1px solid #ccc;
  background: #fafafa;
  transition: all 0.3s;

  & span {
    color: rgba(17, 17, 17, 0.8);
    font-weight: 500;
    line-height: 130%; /* 20.8px */
  }

  &:not(:first-of-type) {
    margin-top: 12px;
  }

  &:hover {
    border-radius: 4px;
    border: 1px solid #bbb;
    background: #eee;
  }
`;

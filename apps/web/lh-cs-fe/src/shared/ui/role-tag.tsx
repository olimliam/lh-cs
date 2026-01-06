import styled from '@emotion/styled';
import { BASE_FONT_FAMILY } from './typography';
import { Skeleton } from '@mui/material';

const StyledRoleTag = styled.div`
  background-color: rgba(17, 17, 17, 0.6);
  padding: 2px 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const RoleText = styled.div`
  font-family: ${BASE_FONT_FAMILY};
  font-weight: 500;
  font-size: 12px;
  line-height: 1.3;
  color: #ffffff;
`;

export const RoleTag = ({ children }: { children: React.ReactNode }) => {
  return (
    <StyledRoleTag>
      {!children ? (
        <Skeleton
          variant='rounded'
          width={300}
          height={200}
          sx={{ bgcolor: 'grey.300', borderRadius: 2 }}
        />
      ) : (
        <RoleText>{children}</RoleText>
      )}
    </StyledRoleTag>
  );
};

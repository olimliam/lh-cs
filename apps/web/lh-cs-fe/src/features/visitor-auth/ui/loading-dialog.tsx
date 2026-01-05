import { CircularProgress, Dialog } from '@mui/material';
import styled from '@emotion/styled';
import { basePretendardStyle } from '@/shared/ui/text-styles';

const StyledDialog = styled(Dialog)`
  .MuiDialog-paper {
    border-radius: 0;
    min-width: 100vw;
    min-height: 100vh;
    width: 100vw;
    height: 100vh;
    padding: 0;
    background: rgba(0, 0, 0, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const DescText = styled.div`
  color: #fff;
  ${basePretendardStyle}
  text-align: center;
  font-size: 24px;
  font-weight: 500;
`;

const WaitText = styled.div`
  color: #fff;
  ${basePretendardStyle}
  text-align: center;
  font-size: 36px;
  font-weight: 700;
`;

export const LoadingDialog: React.FC = () => {
  return (
    <StyledDialog
      open={true}
      disableEscapeKeyDown={true}
      maxWidth={false}
      fullScreen
    >
      <div className='flex flex-col items-center gap-4'>
        <CircularProgress
          size={60}
          sx={{ color: '#90C31F', marginBottom: '24px' }}
        />
        <DescText>곧 상담원과 연결됩니다.</DescText>
        <WaitText>잠시만 기다려주세요.</WaitText>
      </div>
    </StyledDialog>
  );
};

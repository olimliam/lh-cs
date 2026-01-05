import React from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
} from '@mui/material';
import {
  CreateConsultationModalContent,
  CreateConsultationModalContentProps,
} from './create-consultation-modal-content';
import { useDeviceDetector } from '@/shared/hooks/use-device-detector';
import { CloseIcon } from '@/shared/ui/icons/close-icon';

interface DesktopModalProps extends CreateConsultationModalContentProps {
  open: boolean;
}

export const DesktopModal: React.FC<DesktopModalProps> = ({
  open,
  ...contentProps
}) => {
  const { isTablet } = useDeviceDetector();

  return (
    <Dialog
      open={open}
      onClose={contentProps.onClose}
      container={() => document.getElementById('root')}
      fullWidth={true}
      maxWidth={false}
      PaperProps={{
        sx: {
          width: 'calc(100% - 120px)',
          height: 'calc(100% - 120px)',
          margin: '60px',
          padding: '20px 24px',
          borderRadius: '8px',
          boxShadow: '0px 25px 50px -12px rgba(0,0,0,0.25)',
          gap: '20px',
          backgroundColor: '#f5f5f5',
        },
        className: 'bg-neutral-100',
      }}
    >
      <DialogTitle
        sx={{
          padding: '0',
          paddingBottom: '20px',
          borderBottom: '1px solid #E2E2E2',
        }}
      >
        <div
          className={`flex w-full items-center gap-[24px] ${isTablet ? 'gap-3' : 'justify-between'}`}
          style={{ fontFamily: 'Pretendard' }}
        >
          <div
            className={`flex flex-col items-start sm:min-w-[220px] md:min-w-[240px] lg:min-w-[290px] ${isTablet ? 'w-[40%]' : 'w-[290px]'}`}
          >
            <div className='text-[20px] font-semibold leading-[1.3] text-[#111111]'>
              상담 코드
            </div>
            <div className='text-[14px] font-medium leading-[1.3] text-[#666666]'>
              상담 진행 중인 상담 코드를 입력해 주세요.
            </div>
          </div>
          <div className='flex w-full justify-between gap-3'>
            <TextField
              variant='outlined'
              value={contentProps.consultationCode}
              onChange={(e) =>
                contentProps.onConsultationCodeChange(e.target.value)
              }
              placeholder='상담 코드'
              sx={{
                width: isTablet ? '256px' : '280px',
                '& .MuiOutlinedInput-root': {
                  fontSize: '16px',
                  fontWeight: 500,

                  '& .MuiInputBase-input': {
                    padding: '8px 12px',
                  },
                },
              }}
            />
            <IconButton
              className='text-[#333]'
              onClick={contentProps.onClose}
              aria-label='close'
            >
              <CloseIcon width={18} height={18} />
            </IconButton>
          </div>
        </div>
      </DialogTitle>
      <DialogContent
        sx={{
          padding: '0',
          paddingTop: '16px',
          overflowY: 'hidden',
          height: 'calc(100% - 161px)',
          // overflow: 'auto',
          // scrollbarWidth: 'none',
          // '&::-webkit-scrollbar': {
          //   display: 'none',
          // },
        }}
      >
        <CreateConsultationModalContent {...contentProps} isTablet={isTablet} />
      </DialogContent>

      <DialogActions
        sx={{
          padding: '0',
        }}
      >
        <button
          type='button'
          onClick={contentProps.onClose}
          className='relative rounded-[4px] border border-[#0055a2] bg-white px-[22px] py-2 text-[16px] font-medium uppercase tracking-[0.46px] text-[#0055a2] shadow-none transition-shadow hover:bg-[#f0f6fa]'
        >
          취소하기
        </button>
        <button
          type='button'
          onClick={contentProps.onConfirm}
          className='rounded-[4px] bg-[#0055a2] px-[22px] py-2 text-[16px] font-medium uppercase tracking-[0.46px] text-white shadow-[0px_1px_5px_0px_rgba(0,0,0,0.12),0px_2px_2px_0px_rgba(0,0,0,0.14),0px_3px_1px_-2px_rgba(0,0,0,0.2)] transition-shadow hover:bg-[#003e7a]'
        >
          상담실 개설하기
        </button>
      </DialogActions>
    </Dialog>
  );
};

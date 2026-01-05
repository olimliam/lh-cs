import {
  // Button,
  CircularProgress,
  // Dialog,
  DialogActions,
  FormLabel,
  IconButton,
  InputAdornment,
  Stack,
  // TextField,
  // Typography,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Button, DialogPopup, DialogPopupHeader } from '@/shared/ui';
import styled from '@emotion/styled';
import { CommonTextField } from '@/shared/ui/input/input.styles';

const ModalContent = styled.div`
  background: #fafafa;
  border-radius: 8px;
  box-shadow: 0px 25px 50px -12px rgba(0, 0, 0, 0.25);
  padding: 24px;
  width: 100%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;
const InputRowBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  & + div {
    margin-top: 14px !important;
  }
  &.verification {
    margin-top: 8px !important;
    padding-bottom: 10px;
  }
`;
const WarningTextBox = styled.div`
  display: flex;
  padding: 8px 12px;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  border-radius: 4px;
  background: rgba(114, 113, 113, 0.05);

  color: #444;
  font-size: 14px;
  font-style: normal;
  line-height: 150%; /* 21px */
`;

interface PasswordFormState {
  newPassword: string;
  confirmPassword: string;
  showNewPassword: boolean;
  showConfirmPassword: boolean;
}

interface PasswordFormErrors {
  newPassword: string;
  confirmPassword: string;
}

interface PasswordChangeDialogProps {
  open: boolean;
  form: PasswordFormState;
  errors: PasswordFormErrors;
  helperMessage: string;
  isSubmitting: boolean;
  onFieldChange: (
    field: 'newPassword' | 'confirmPassword',
    value: string
  ) => void;
  onToggleNewPasswordVisibility: () => void;
  onToggleConfirmPasswordVisibility: () => void;
  onCancel: () => void;
  onConfirm: () => void;
}

export const PasswordChangeDialog = ({
  open,
  form,
  errors,
  // helperMessage,
  isSubmitting,
  onFieldChange,
  onToggleNewPasswordVisibility,
  onToggleConfirmPasswordVisibility,
  onCancel,
  onConfirm,
}: PasswordChangeDialogProps) => {
  return (
    <DialogPopup
      isOpen={open}
      onClose={() => console.log('close')}
      container={() => document.getElementById('root')}
      modalSize={{ width: 500, height: 470 }}
      paperClassName='bg-neutral-100'
    >
      <ModalContent>
        <DialogPopupHeader
          titleComponent={<>비밀번호 변경 안내</>}
          subTitleComponent={
            <>
              보안을 위해 <b>비밀번호를 변경</b>한 후, 이용해 주세요.
              <br />
            </>
          }
        />
        <Stack sx={{ gap: '16px' }}>
          <InputRowBox>
            <FormLabel
              htmlFor={'newPassword'}
              sx={{
                fontFamily: 'inherit',
                color: '#666',
                fontSize: '14px',
                fontWeight: 600,
              }}
            >
              신규 비밀번호
            </FormLabel>
            <CommonTextField
              id='newPassword'
              type={form.showNewPassword ? 'text' : 'password'}
              placeholder='새로운 비밀번호를 입력해 주세요.'
              value={form.newPassword}
              onChange={(event) =>
                onFieldChange('newPassword', event.target.value)
              }
              error={Boolean(errors.newPassword)}
              helperText={errors.newPassword || ' '}
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton
                      onClick={onToggleNewPasswordVisibility}
                      aria-label={
                        form.showNewPassword
                          ? '비밀번호 숨기기'
                          : '비밀번호 보기'
                      }
                      edge='end'
                      size='small'
                    >
                      {form.showNewPassword ? (
                        <VisibilityOff />
                      ) : (
                        <Visibility />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              disabled={isSubmitting}
            />
          </InputRowBox>

          <InputRowBox>
            <FormLabel
              htmlFor={'confirmPassword'}
              sx={{
                fontFamily: 'inherit',
                color: '#666',
                fontSize: '14px',
                fontWeight: 600,
              }}
            >
              신규 비밀번호 확인
            </FormLabel>
            <CommonTextField
              id='confirmPassword'
              type={form.showConfirmPassword ? 'text' : 'password'}
              placeholder='새 비밀번호를 다시 한 번 입력해 주세요.'
              value={form.confirmPassword}
              onChange={(event) =>
                onFieldChange('confirmPassword', event.target.value)
              }
              error={Boolean(errors.confirmPassword)}
              helperText={errors.confirmPassword || ' '}
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton
                      onClick={onToggleConfirmPasswordVisibility}
                      aria-label={
                        form.showConfirmPassword
                          ? '비밀번호 숨기기'
                          : '비밀번호 보기'
                      }
                      edge='end'
                      size='small'
                    >
                      {form.showConfirmPassword ? (
                        <VisibilityOff />
                      ) : (
                        <Visibility />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              disabled={isSubmitting}
            />
          </InputRowBox>
        </Stack>

        <WarningTextBox>
          <div>
            ※ 영문, 숫자, 특수기호를 조합해서 8~16자로 입력해야 합니다. (2가지
            조합 시 10~16자 설정, 띄어쓰기 불가)
          </div>
          <div>※ 영문, 숫자, 특수기호 3가지를 모두 포함해야 합니다.</div>
        </WarningTextBox>

        <DialogActions sx={{ padding: 0 }}>
          <Button
            variant='outlinePrimary'
            size={'md'}
            fullWidth
            onClick={onCancel}
          >
            취소
          </Button>
          <Button
            variant='primary'
            fullWidth
            onClick={onConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <CircularProgress size={18} sx={{ color: '#ffffff' }} />
            ) : (
              '비밀번호 변경'
            )}
          </Button>
        </DialogActions>
      </ModalContent>
    </DialogPopup>
  );
};

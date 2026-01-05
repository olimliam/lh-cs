import { CommonTextField, LabelText } from '@/shared/ui/input/input.styles';
import styled from '@emotion/styled';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { IconButton, InputAdornment } from '@mui/material';

const FormField = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
`;

const PasswordInputWrapper = styled.div`
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
`;

const PasswordDivider = styled.div`
  width: 100%;
  height: 1px;
  background: #e2e2e2;
`;

const PasswordSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
`;

const PasswordNotice = styled.div`
  background: rgba(114, 113, 113, 0.05);
  border-radius: 4px;
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const PasswordNoticeText = styled.div`
  font-family: 'Pretendard', sans-serif;
  font-weight: 500;
  font-size: 14px;
  color: #444444;

  p {
    margin: 0;
    line-height: 1.5;
  }

  p:first-of-type {
    line-height: 1.5;
  }

  p:last-of-type {
    line-height: 1.3;
  }
`;

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
interface showPasswordProps {
  current: boolean;
  new: boolean;
  confirm: boolean;
}
interface ProfilePasswordBoxProps {
  showPasswords: showPasswordProps;
  passwordData: PasswordFormData;
  passwordErrors: Record<string, string>;
  isSubmitting: boolean;
  handlePasswordChange: (field: keyof PasswordFormData, value: string) => void;
  togglePasswordVisibility: (field: 'current' | 'new' | 'confirm') => void;
}

export const ProfilePasswordBox = ({
  showPasswords,
  passwordData,
  passwordErrors,
  isSubmitting,
  handlePasswordChange,
  togglePasswordVisibility,
}: ProfilePasswordBoxProps) => {
  return (
    <>
      <FormField>
        <LabelText width={120} htmlFor='currentPassword'>
          현재 비밀번호
        </LabelText>
        <PasswordInputWrapper>
          <CommonTextField
            id='password'
            type={showPasswords.current ? 'text' : 'password'}
            placeholder='현재 비밀번호를 입력해 주세요.'
            value={passwordData.currentPassword}
            onChange={(event) =>
              handlePasswordChange('currentPassword', event.target.value)
            }
            error={!!passwordErrors.currentPassword}
            helperText={passwordErrors.currentPassword}
            disabled={isSubmitting}
            inputProps={{
              maxLength: 16,
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position='end'>
                  <IconButton
                    onClick={() => togglePasswordVisibility('current')}
                    aria-label={
                      showPasswords.current
                        ? '비밀번호 숨기기'
                        : '비밀번호 보기'
                    }
                    edge='end'
                    size='small'
                  >
                    {showPasswords.current ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </PasswordInputWrapper>
      </FormField>

      <PasswordDivider />

      <PasswordSection>
        <FormField>
          <LabelText width={120} htmlFor='newPassword'>
            새 비밀번호
          </LabelText>
          <PasswordInputWrapper>
            <CommonTextField
              id='newPassword'
              type={showPasswords.new ? 'text' : 'password'}
              placeholder='새 비밀번호를 입력해 주세요.'
              value={passwordData.newPassword}
              onChange={(e) =>
                handlePasswordChange('newPassword', e.target.value)
              }
              error={!!passwordErrors.newPassword}
              helperText={passwordErrors.newPassword}
              disabled={isSubmitting}
              inputProps={{
                maxLength: 16,
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton
                      onClick={() => togglePasswordVisibility('new')}
                      aria-label={
                        showPasswords.new ? '비밀번호 숨기기' : '비밀번호 보기'
                      }
                      edge='end'
                      size='small'
                    >
                      {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </PasswordInputWrapper>
        </FormField>

        <FormField>
          <LabelText width={120} htmlFor='confirmPassword'>
            새 비밀번호 확인
          </LabelText>
          <PasswordInputWrapper>
            <CommonTextField
              id='confirmPassword'
              type={showPasswords.confirm ? 'text' : 'password'}
              placeholder='새 비밀번호를 한번 더 입력해 주세요.'
              value={passwordData.confirmPassword}
              onChange={(e) =>
                handlePasswordChange('confirmPassword', e.target.value)
              }
              error={!!passwordErrors.confirmPassword}
              helperText={passwordErrors.confirmPassword}
              disabled={isSubmitting}
              inputProps={{
                maxLength: 16,
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton
                      onClick={() => togglePasswordVisibility('confirm')}
                      aria-label={
                        showPasswords.confirm
                          ? '비밀번호 숨기기'
                          : '비밀번호 보기'
                      }
                      edge='end'
                      size='small'
                    >
                      {showPasswords.confirm ? (
                        <VisibilityOff />
                      ) : (
                        <Visibility />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </PasswordInputWrapper>
        </FormField>
      </PasswordSection>

      <PasswordNotice>
        <PasswordNoticeText>
          <p>※ 영문, 숫자, 특수기호를 조합해서 8~16자로 작성해야 합니다.</p>
          <p>(2가지 조합 시 10~16자 설정, 띄어쓰기 불가)</p>
        </PasswordNoticeText>
        <PasswordNoticeText>
          <p>※ 영문, 숫자, 특수기호 3가지를 모두 포함해야 합니다.</p>
        </PasswordNoticeText>
      </PasswordNotice>
    </>
  );
};

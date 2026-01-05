import styled from '@emotion/styled';

import {
  CommonTextField,
  FieldLabel,
  FormField,
} from '@/shared/ui/input/input.styles';
import { Button } from '@/shared/ui';
import { SearchBoxProps, SearchFieldKey } from '../model/search-types';

// 필드별 설정
const FIELD_CONFIG: Record<
  SearchFieldKey,
  { label: string; placeholder: string }
> = {
  username: {
    label: '아이디',
    placeholder: '아이디 입력',
  },
  name: {
    label: '이름',
    placeholder: '이름 입력',
  },
  department: {
    label: '부서',
    placeholder: '부서명 입력',
  },
};

const CustomFormField = styled(FormField)`
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  width: auto;
  & label {
    width: auto;
  }
`;
const UnderLineButton = styled.button`
  position: relative;
  color: #727171;
  text-align: center;
  font-weight: 500;
  line-height: normal;
  font-style: normal;
  margin-bottom: 11px;
  margin-left: 20px;
  transition: all 0.2s;
  &::before {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    width: 100%;
    height: 1px;
    background-color: #727171;
  }
  &:hover {
    font-weight: 700;
    &::before {
      height: 2px;
    }
  }
`;

export const SearchBox = ({
  searchForm,
  searchFormErrors,
  isLoading,
  fields = ['username', 'name', 'department'], // 기본값: 모든 필드
  handleInputChange,
  handleSearch,
  handleReset,
}: SearchBoxProps) => {
  return (
    <div className='flex items-end'>
      <div className='flex gap-3'>
        {fields.map((fieldKey) => {
          const config = FIELD_CONFIG[fieldKey];
          return (
            <CustomFormField key={fieldKey}>
              <FieldLabel>{config.label}</FieldLabel>
              <CommonTextField
                id={fieldKey}
                placeholder={config.placeholder}
                value={searchForm[fieldKey] || ''}
                onChange={(e) => handleInputChange(fieldKey, e.target.value)}
                error={!!searchFormErrors[fieldKey]}
                helperText={searchFormErrors[fieldKey]}
                padding='8px 12px'
                maxWidth='160px'
                disabled={isLoading}
              />
            </CustomFormField>
          );
        })}
      </div>
      <Button
        size='sm'
        variant='outlineGray'
        className='ml-3 h-auto py-2'
        onClick={() => {
          handleSearch();
        }}
      >
        검색
      </Button>
      <UnderLineButton onClick={() => handleReset()}>초기화</UnderLineButton>
    </div>
  );
};

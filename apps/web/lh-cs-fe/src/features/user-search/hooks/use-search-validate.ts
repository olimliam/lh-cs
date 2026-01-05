import { USERNAME_REGEX } from '@/shared/model/validation-const';

interface SearchForm {
  username?: string;
  name?: string;
  department?: string;
}
interface SearchValidateProps {
  searchForm: SearchForm;
  handleSearchFormErrors: (errors: Record<string, string>) => void;
}
export const validateForm = ({
  searchForm,
  handleSearchFormErrors,
}: SearchValidateProps) => {
  const errors: Record<string, string> = {};

  if (searchForm.username && !USERNAME_REGEX.test(searchForm.username)) {
    errors.username = '※ 숫자 6자리여야 합니다.';
  }
  handleSearchFormErrors(errors);

  // ✅ passwordError도 검증 결과에 포함
  return Object.keys(errors).length === 0;
};

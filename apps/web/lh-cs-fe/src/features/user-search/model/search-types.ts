export interface SearchFormDataType {
  username?: string;
  name?: string;
  department?: string;
}

export type SearchFieldKey = keyof SearchFormDataType;

export interface SearchBoxProps {
  searchForm: SearchFormDataType;
  searchFormErrors: Record<string, string>;
  isLoading: boolean;
  fields?: SearchFieldKey[]; // 표시할 필드 배열 (선택적)
  handleInputChange: (
    field: keyof SearchFormDataType,
    value: string | null
  ) => void;
  handleSearch: () => void;
  handleReset: () => void;
}

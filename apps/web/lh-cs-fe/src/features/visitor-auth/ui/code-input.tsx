import { forwardRef } from 'react';

type CodeInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  isFocused?: boolean;
  hasValue?: boolean;
};

export const CodeInput = forwardRef<HTMLInputElement, CodeInputProps>(
  ({ isFocused, hasValue, className, ...rest }, ref) => (
    <input
      ref={ref}
      className={className}
      data-focused={isFocused ? 'true' : 'false'}
      data-has-value={hasValue ? 'true' : 'false'}
      {...rest}
    />
  )
);
CodeInput.displayName = 'CodeInput';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/shared/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | 'primary'
    | 'secondary'
    | 'outline'
    | 'outlinePrimary'
    | 'opacityPrimary'
    | 'outlineError'
    | 'outlineGray';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      children,
      disabled,
      fullWidth,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

    const variants = {
      primary:
        'bg-[#0055a2] text-white hover:bg-[#004080] focus:ring-[#0055a2]',
      secondary:
        'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
      outline:
        'border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
      outlinePrimary:
        'border border-[#0055A2] bg-transparent text-[#0055A2] hover:bg-[#0055A2]/10 focus:ring-[#0055A2]',
      opacityPrimary:
        'border border-transparent bg-[rgba(0,85,162,0.05)] text-[#0055A2] hover:border-[#0055A2] focus:ring-[#0055A2] disabled:opacity-50',
      outlineError:
        'border border-[rgba(206,46,54,0.5)] bg-[rgba(206,46,54,0.1)] text-[#CE2E36] hover:bg-[rgba(206,46,54,0.2)]',
      outlineGray:
        'border border-[rgba(114,113,113,0.5)] bg-[rgba(114,113,113,0.1)] text-[#727171] hover:bg-[rgba(114,113,113,0.2)] hover:border-[#72717]',
    };

    const sizes = {
      sm: 'h-8 px-3 text-sm rounded-md',
      md: 'h-12 px-4 text-base rounded-md',
      lg: 'h-14 px-6 text-lg rounded-md',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        style={{ width: `${fullWidth ? '100%' : 'auto'}` }}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className='mr-2 h-4 w-4 animate-spin'
            fill='none'
            viewBox='0 0 24 24'
          >
            <circle
              className='opacity-25'
              cx='12'
              cy='12'
              r='10'
              stroke='currentColor'
              strokeWidth='4'
            />
            <path
              className='opacity-75'
              fill='currentColor'
              d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

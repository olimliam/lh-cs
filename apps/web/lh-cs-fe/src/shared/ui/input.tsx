import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/shared/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, rightIcon, ...props }, ref) => {
    return (
      <div className='w-full'>
        {label && (
          <div className='mb-1.5 flex w-full items-start justify-start gap-0.5'>
            <div className='flex flex-col justify-center text-sm font-medium text-[#1d1d1d]'>
              {label}
            </div>
          </div>
        )}
        <div className='relative w-full'>
          <input
            ref={ref}
            className={cn(
              'w-full rounded-md border border-[#dee2e6] bg-white px-4 py-4 text-sm font-medium text-[#111111]',
              'placeholder:text-[#999999] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#0055a2]',
              'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500',
              error && 'border-red-500 focus:ring-red-500',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className='absolute right-4 top-1/2 -translate-y-1/2 transform'>
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className='mt-1 text-sm text-red-500'>{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

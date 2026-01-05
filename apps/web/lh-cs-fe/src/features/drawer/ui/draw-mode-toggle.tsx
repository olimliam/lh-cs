import { useState } from 'react';

interface DrawModeToggleProps {
  onToggle: (isDrawing: boolean) => void;
}

const DrawModeToggle = ({ onToggle }: DrawModeToggleProps) => {
  const [isDrawingMode, setIsDrawingMode] = useState(false);

  const handleToggle = () => {
    const newState = !isDrawingMode;
    setIsDrawingMode(newState);
    onToggle(newState);
  };

  return (
    <button
      onClick={handleToggle}
      className={`group relative flex min-w-[140px] items-center justify-center gap-2 rounded-lg px-4 py-3 font-medium transition-all duration-200 ${
        isDrawingMode
          ? 'transform bg-blue-600 text-white shadow-lg hover:scale-105 hover:bg-blue-700'
          : 'border border-gray-300 bg-white text-gray-700 shadow-md hover:border-gray-400 hover:bg-gray-50'
      } `}
    >
      {/* 아이콘 */}
      <div
        className={`transition-transform duration-200 ${isDrawingMode ? 'rotate-180' : ''}`}
      >
        {isDrawingMode ? (
          <svg width='20' height='20' viewBox='0 0 24 24' fill='currentColor'>
            <path d='M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z' />
          </svg>
        ) : (
          <svg width='20' height='20' viewBox='0 0 24 24' fill='currentColor'>
            <path d='M3.95 16.7v3.4h3.4l9.8-9.8-3.4-3.4-9.8 9.8zm15.8-9.1c.4-.4.4-.9 0-1.3l-2.1-2.1c-.4-.4-.9-.4-1.3 0l-1.6 1.6 3.4 3.4 1.6-1.6z' />
          </svg>
        )}
      </div>

      {/* 텍스트 */}
      <span className='text-sm'>
        {isDrawingMode ? 'Exit Draw' : 'Draw Mode'}
      </span>

      {/* 활성화 상태 표시 점 */}
      {isDrawingMode && (
        <div className='absolute -right-1 -top-1 h-3 w-3 animate-pulse rounded-full bg-green-400' />
      )}
    </button>
  );
};

export default DrawModeToggle;

interface ConnectionStatusProps {
  isConnected: boolean;
  className?: string;
}

export default function ConnectionStatus({
  isConnected,
  className = '',
}: ConnectionStatusProps) {
  return (
    <div
      className={`flex items-center gap-2 rounded-lg bg-white/90 px-3 py-2 shadow-md backdrop-blur-sm ${className}`}
    >
      <div
        className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
      />
      <span className='text-sm font-medium'>
        {isConnected ? 'Connected' : 'Disconnected'}
      </span>
    </div>
  );
}

import { CustomException } from '@/common/exception/custom.exception';

interface ExecuteOptions {
  onError?: (error: unknown) => void;
  errorFactory: () => CustomException;
}

export async function executeOrThrow<T>(
  operation: () => Promise<T>,
  { onError, errorFactory }: ExecuteOptions
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (onError) {
      onError(error);
    }

    if (error instanceof CustomException) {
      throw error;
    }

    throw errorFactory();
  }
}

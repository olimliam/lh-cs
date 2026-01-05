import { Socket } from 'socket.io';

export const assignClientMetadata = (
  client: Socket,
  metadata: Record<string, unknown>
) => {
  client.data = {
    ...(client.data || {}),
    ...metadata,
  };
};

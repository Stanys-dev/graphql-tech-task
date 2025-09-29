import { AxiosError } from 'axios';
import { SerializedError } from 'pino';

export function errorSerializer(err: SerializedError): Record<string, unknown> {
  return {
    stack: err.stack,
    message: err.message,
    type: err.type,
    ...((err.raw as AxiosError).isAxiosError && {
      config: (err.raw as AxiosError).config,
      res: {
        data: (err.raw as AxiosError).response?.data,
        statusCode: (err.raw as AxiosError).response?.status,
      },
    }),
  };
}

import { Dictionary, ExceptionConverter } from '@mikro-orm/core';

const converter = new ExceptionConverter();

export async function databaseError<T>(throwableFunction: () => Promise<T>): Promise<T> {
  try {
    return await throwableFunction();
  } catch (error: unknown) {
    throw converter.convertException(error as Error & Dictionary<unknown>);
  }
}

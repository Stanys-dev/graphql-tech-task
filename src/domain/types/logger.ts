export interface Logger {
  debug(message: unknown, ...optionalParams: unknown[]): void;

  error(message: unknown, ...optionalParams: unknown[]): void;

  info(message: unknown, ...optionalParams: unknown[]): void;

  trace(message: unknown, ...optionalParams: unknown[]): void;

  warn(message: unknown, ...optionalParams: unknown[]): void;
}

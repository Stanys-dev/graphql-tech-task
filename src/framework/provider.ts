// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable @typescript-eslint/ban-types */
import { FactoryProvider } from '@nestjs/common';
import { Abstract } from '@nestjs/common/interfaces/abstract.interface';
import { Type } from '@nestjs/common/interfaces/type.interface';

export type Deps = (string | symbol | Function | Type<unknown> | Abstract<unknown>)[] | undefined;

export function factory<T>(Clazz: T, deps: Deps): FactoryProvider<T> {
  return {
    provide: Clazz as unknown as Type<T>,
    useFactory: (...args) => new (Clazz as unknown as Type<T>)(...args),
    inject: deps as unknown as Deps,
  };
}

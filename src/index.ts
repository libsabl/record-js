// Copyright 2022 Joshua Honig. All rights reserved.
// Use of this source code is governed by a MIT
// license that can be found in the LICENSE file.

export { Record, RecordOf } from './record';
export { RecordError, RecordErrorOptions } from './error';
export { isDefault, initScalar, initArray } from './initter';
export { Row } from './row';
export { Relation, NullableRelation } from './relation';
export { CollectionRelation } from './collection-relation';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Constructor<T = unknown> = new (...args: any[]) => T;

/** Stream a plain array of items as an async iterable  */
export async function* stream<T>(...items: T[]): AsyncIterable<T> {
  for (const i of items) {
    yield i;
  }
}

/** Collect all items from an async iterable and resolve as an array */
export async function collect<T>(
  stream: AsyncIterable<T>
): Promise<Iterable<T>> {
  const arr: T[] = [];
  for await (const i of stream) {
    arr.push(i);
  }
  return arr;
}

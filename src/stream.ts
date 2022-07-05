// Copyright 2022 Joshua Honig. All rights reserved.
// Use of this source code is governed by a MIT
// license that can be found in the LICENSE file.

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

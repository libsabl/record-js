// Copyright 2022 Joshua Honig. All rights reserved.
// Use of this source code is governed by a MIT
// license that can be found in the LICENSE file.

import { stream, collect } from '$';
import { pause } from './lib/pause';

describe('stream', () => {
  it('emits one item at a time', async () => {
    const item1 = { a: 'b' };
    const item2 = { a: '232' };
    const item3 = { a: 'xyz' };

    let i = 0;
    for await (const item of stream(item1, item2, item3)) {
      switch (++i) {
        case 1:
          expect(item).toBe(item1);
          break;
        case 2:
          expect(item).toBe(item2);
          break;
        case 3:
          expect(item).toBe(item3);
          break;
      }
    }

    expect(i).toBe(3);
  });
});

describe('collect', () => {
  it('resolves all iterated items as an array', async () => {
    const item1 = { a: 'b' };
    const item2 = { a: '232' };
    const item3 = { a: 'xyz' };

    async function* getItems() {
      await pause(10);
      yield item1;
      await pause(2);
      yield item2;
      await pause(4);
      yield item3;
    }

    const result = await collect(getItems());
    expect(result).toEqual([item1, item2, item3]);
  });
});

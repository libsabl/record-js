// Copyright 2022 Joshua Honig. All rights reserved.
// Use of this source code is governed by a MIT
// license that can be found in the LICENSE file.

import { RecordError } from '$';

describe('RecordError', () => {
  describe('ctor', () => {
    it('uses provided type, message and properties', () => {
      const innerErr = new Error('Fail');
      const err = new RecordError('custom:type', 'Oh no', {
        cause: innerErr,
        fieldName: 'id',
        fieldValue: -1,
        recordType: 'example:user',
      });

      expect(err.type).toBe('custom:type');
      expect(err.message).toBe('Oh no');
      expect(err.cause).toBe(innerErr);
      expect(err.fieldName).toBe('id');
      expect(err.fieldValue).toBe(-1);
    });

    it('creates a default message', () => {
      const err = new RecordError(RecordError.DUPLICATE_KEY);
      expect(err.message).toMatch(
        'Record operation error: record:duplicate-key'
      );
    });
  });
});

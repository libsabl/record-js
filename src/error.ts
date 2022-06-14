// Copyright 2022 Joshua Honig. All rights reserved.
// Use of this source code is governed by a MIT
// license that can be found in the LICENSE file.

export type RecordErrorOptions = {
  cause?: Error;
  recordType?: string;
  fieldName?: string;
  fieldValue?: unknown;
};

/** An error about a record operation */
export class RecordError extends Error {
  /**
   * `record:reinitialized`: An attempt was made to initialize
   * the value of a field that was already initialized
   */
  static readonly REINITIALIZED = 'record:reinitialized';

  /**
   * `record:wrong-record`: An attempt was made to load
   * data to the wrong existing record
   */
  static readonly WRONG_RECORD = 'record:wrong-record';

  /** `record:not-found`: A record was not found */
  static readonly NOT_FOUND = 'record:not-found';

  /** `record:duplicate-key`: A unique constraint was violated */
  static readonly DUPLICATE_KEY = 'record:duplicate-key';

  /** `record:field-value`: A field value was invalid */
  static readonly FIELD_VALUE = 'record:field-value';

  /** `record:relation`: A required relation was missing or invalid */
  static readonly RELATION = 'record:relation';

  constructor(type: string, message?: string, options?: RecordErrorOptions) {
    options = options || {};
    super(message || `Record operation error: ${type}.`, {
      cause: options.cause,
    });
    this.type = type;
    this.recordType = options.recordType;
    this.fieldName = options.fieldName;
    this.fieldValue = options.fieldValue;
  }

  /** The type code of the error. See constants on {@link RecordError} such as {@link NOT_FOUND} */
  readonly type: string;

  /** The type name of the applicable record */
  readonly recordType?: string;

  /** The name of the field */
  readonly fieldName?: string;

  /** The value of the field */
  readonly fieldValue?: unknown;
}

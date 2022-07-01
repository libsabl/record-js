// Copyright 2022 Joshua Honig. All rights reserved.
// Use of this source code is governed by a MIT
// license that can be found in the LICENSE file.

import { RecordError } from './error';

/** Check if a value is the default value of its type
 * - 0 for `number`
 * - 0n for `bigint`
 * - false for `boolean`
 * - null for all others
 */
export function isDefault(v: unknown): boolean {
  if (v == null) return true;
  if (typeof v === 'number') return v == 0;
  if (typeof v === 'boolean') return v == false;
  if (typeof v === 'bigint') return v == 0n;
  return false;
}

/**
 * AssignValidate that the existing scalar value is still the default
 * @param current The current field value, usually null, 0 or false
 * @param newVal The new field value
 * @param name The name of the field to which the value will be assigned. Only used when generating error messages
 * @param allowSame Whether to allow reassignment to a non-empty field if the new value is equivalent
 */
export function initScalar<T>(
  current: T,
  newVal: T,
  name: string,
  allowSame = false
): T {
  if (isDefault(current)) return newVal;
  if (allowSame && current == newVal) return newVal;
  throw new RecordError(
    RecordError.REINITIALIZED,
    `Property ${name} is already initialized`,
    { fieldName: name }
  );
}

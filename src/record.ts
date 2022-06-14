// Copyright 2022 Joshua Honig. All rights reserved.
// Use of this source code is governed by a MIT
// license that can be found in the LICENSE file.

/**
 * A simple interface that allows fetching the type name and
 * the key value or tuple for an otherwise unknown record type
 */
export interface Record {
  getKey(): unknown;
  getType(): string;
}

/**
 * A simple interface that allows fetching the type name and
 * the key value or tuple for an otherwise unknown record type.
 * A derived version of {@link Record} with a known key type.
 */
export interface RecordOf<TKey> extends Record {
  getKey(): TKey;
}

// Copyright 2022 Joshua Honig. All rights reserved.
// Use of this source code is governed by a MIT
// license that can be found in the LICENSE file.

/**
 * A simple interface that represents retrieving a value
 * by a string key or integer index. Useful for implementing
 * reusable generic relational database CRUD logic.
 */
export interface Row {
  /** Retrieve a value by name */
  [key: string]: unknown;

  /** Retrieve a value by zero-based index */
  [index: number]: unknown;
}

/**
 * Generic interface matching a class constructor.
 * Useful for implementing adapter extension mixins.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Constructor<T = unknown> = new (...args: any[]) => T;

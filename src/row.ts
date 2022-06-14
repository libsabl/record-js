/** A simple interface that represents retrieving a value by a string key or integer index */
export interface Row {
  /** Retrieve a value by name */
  [key: string]: unknown;

  /** Retrieve a value by zero-based index */
  [index: number]: unknown;
}

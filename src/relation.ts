/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { IContext } from '@sabl/context';
import { RecordError } from './error';
import { initScalar } from './initter';
import { RecordOf } from './record';

/**
 * Relation provides concurrent-safe, lazy-loaded cache mechanics and key
 * validation for a single related record and its associated key attribute
 */
export abstract class Relation<TKey, TRelated extends RecordOf<TKey>> {
  #promise: Promise<TRelated | null> | null = null;
  #item: TRelated | null = null;
  #key: TKey = null!;
  readonly #keyProp: string;

  /**
   * Create a new relation with the provided keyProp name
   * @param keyProp The name of the key property on the model
   * which contains the relation. Used only for generating error messages
   */
  constructor(keyProp: string) {
    this.#keyProp = keyProp;
  }

  /** Directly return the cached item, which may be null */
  get item(): TRelated | null {
    return this.#item;
  }

  /** Fetch the current key value */
  get key(): TKey {
    return this.#key;
  }

  /** Check whether the related item is already cached */
  get loaded(): boolean {
    return this.#item != null;
  }

  /** Retrieve the related record given a context and the record key */
  protected abstract retrieveItem(
    ctx: IContext,
    key: TKey
  ): Promise<TRelated | null>;

  /** Retrieve the cached record, init the async fetch, or await the ongoing fetch as applicable */
  async getItem(ctx: IContext): Promise<TRelated> {
    if (this.#item != null) return this.#item;
    if (this.#key == null) {
      throw new RecordError(
        RecordError.RELATION,
        'Key attribute value not set'
      );
    }

    if (this.#promise == null) {
      this.#promise = this.retrieveItem(ctx, this.#key);
    }

    const item = await this.#promise;
    if (item == null) {
      throw new RecordError(
        RecordError.NOT_FOUND,
        'Repository did not return a record'
      );
    }
    return (this.#item = item);
  }

  /** Initialize the key value */
  initKey(key: TKey) {
    this.#key = initScalar(this.#key, key, this.#keyProp);
  }

  /**
   * Overwrite the key value, clearing the cached item if applicable.
   * Use this when a relation is updated on an existing record.
   */
  setKey(key: TKey) {
    if (key === this.#key) return;
    this.#key = key;
    this.clearItem();
  }

  /** Set the cached related item, but validate it has the same key value as expected */
  initItem(item: TRelated) {
    const key = item.getKey();
    this.#key = initScalar(this.#key, key, this.#keyProp, true);
    this.#item = item;
    this.#promise = Promise.resolve(item);
  }

  /** Directly set the cache related item, overwriting the key value */
  setItem(item: TRelated) {
    this.#item = item;
    this.#key = item.getKey();
    this.#promise = Promise.resolve(item);
  }

  /** Clear the cached related item and promise */
  clearItem() {
    this.#item = null;
    this.#promise = null;
  }
}

/**
 * NullableRelation provides concurrent-safe, lazy-loaded cache mechanics and key
 * validation for a single related record and its associated key attribute.
 * Unlike {@link Relation}, NullableRelation allows a null key value.
 */
export abstract class NullableRelation<TKey, TRelated extends RecordOf<TKey>> {
  #promise: Promise<TRelated | null> | null = null;
  #item: TRelated | null = null;
  #key: TKey | null | undefined = undefined;
  readonly #keyProp: string;

  /**
   * Create a new relation with the provided keyProp name
   * @param keyProp The name of the key property on the model
   * which contains the relation. Used only for generating error messages
   */
  constructor(keyProp: string) {
    this.#keyProp = keyProp;
  }

  /** Directly return the cached item, which may be null */
  get item(): TRelated | null {
    return this.#item;
  }

  /** Fetch the current key value */
  get key(): TKey | null {
    return this.#key || null;
  }

  /**
   * Check whether the related item is already cached.
   * A null item is considered cached if the key is explicitly null.
   */
  get loaded(): boolean {
    return this.#key === null || this.#item != null;
  }

  /** Retrieve the related record given a context and the record key */
  protected abstract retrieveItem(
    ctx: IContext,
    key: TKey
  ): Promise<TRelated | null>;

  /** Retrieve the cached record, init the async fetch, or await the ongoing fetch as applicable */
  async getItem(ctx: IContext): Promise<TRelated | null> {
    if (this.#item != null) return this.#item;
    if (this.#key === null) return null;
    if (this.#key === undefined) {
      throw new RecordError(
        RecordError.RELATION,
        'Key attribute value not set'
      );
    }

    if (this.#promise == null) {
      this.#promise = this.retrieveItem(ctx, this.#key);
    }

    const item = await this.#promise;
    if (item == null) {
      throw new RecordError(
        RecordError.NOT_FOUND,
        'Repository did not return a record'
      );
    }
    return (this.#item = item);
  }

  /** Initialize the key value */
  initKey(key: TKey | null) {
    this.#key = initScalar(this.#key, key, this.#keyProp);
  }

  /**
   * Overwrite the key value, clearing the cached item if applicable.
   * Use this when a relation is updated on an existing record.
   */
  setKey(key: TKey) {
    if (key === this.#key) return;
    this.#key = key;
    this.clearItem();
  }

  /** Set the cached related item, but validate it has the same key value as expected */
  initItem(item: TRelated) {
    const key = item.getKey();
    this.#key = initScalar(this.#key, key, this.#keyProp, true);
    this.#item = item;
    this.#promise = Promise.resolve(item);
  }

  /** Directly set the cache related item, overwriting the key value */
  setItem(item: TRelated | null) {
    this.#item = item;
    this.#key = item == null ? null : item.getKey();
    this.#promise = item == null ? null : Promise.resolve(item);
  }

  /** Clear the cached related item and promise */
  clearItem() {
    this.#item = null;
    this.#promise = null;
  }
}

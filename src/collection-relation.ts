import type { IContext } from '@sabl/context';
import type { Record } from './record';

/**
 * CollectionRelation provides concurrent-safe, lazy-loaded cache
 * mechanics for a collection of related records
 */
export abstract class CollectionRelation<TParent, TRelated extends Record> {
  #promise: Promise<Iterable<TRelated>> | null = null;
  #items: TRelated[] | null = null;

  /** Directly return the cached collection, which may be null */
  get items(): TRelated[] | null {
    return this.#items;
  }

  /** Check whether the collection of related items is already cached */
  get loaded(): boolean {
    return this.#items != null;
  }

  /** Retrieve the related collection given a context and the parent record */
  protected abstract retrieveItems(
    ctx: IContext,
    parent: TParent
  ): Promise<Iterable<TRelated>>;

  /** Retrieve the cached collection, init the async fetch, or await the ongoing fetch as applicable */
  async getItems(ctx: IContext, parent: TParent) {
    if (this.#items != null) return this.#items;

    let promise = this.#promise;
    if (promise == null) {
      this.#promise = promise = this.retrieveItems(ctx, parent);
    }

    const iter = await promise;
    this.#items = Array.from(iter);
    return this.#items;
  }

  /** If the collection has already been cached, appends `item` */
  appendItem(item: TRelated): void {
    if (this.#items == null) return;
    this.#items.push(item);
  }

  /** If the collection has already been cached, removes the record with the same key as `item` */
  removeItem(item: TRelated): void {
    if (this.#items == null) return;
    const key = item.getKey();
    const ix = this.#items.findIndex((r) => r.getKey() === key);
    if (ix >= 0) this.#items.splice(ix, 1);
  }

  /** Directly set the cached collection */
  setCollection(items: Iterable<TRelated>) {
    this.#items = Array.from(items);
    this.#promise = Promise.resolve(this.#items);
  }

  /** Clear the cached collection and promise */
  clear(): void {
    this.#items = null;
    this.#promise = null;
  }
}

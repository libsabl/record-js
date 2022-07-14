<!-- BEGIN:REMOVE_FOR_NPM -->
[![codecov](https://codecov.io/gh/libsabl/record-js/branch/main/graph/badge.svg?token=TVL1XYSJHA)](https://app.codecov.io/gh/libsabl/record-js/branch/main)
<span class="badge-npmversion"><a href="https://npmjs.org/package/@sabl/record" title="View this project on NPM"><img src="https://img.shields.io/npm/v/@sabl/record.svg" alt="NPM version" /></a></span>
<!-- END:REMOVE_FOR_NPM -->

# @sabl/record
 
**record** is a pattern for representing a data model at runtime. It uses record instances exclusively to hold the attributes of a single flat row of data and to allow on-record caching of related records. Even with cached relations, records are passive and do not hold a connection to or knowledge of where the record was loaded from.

Most aspects of the record pattern are indeed *patterns* that authors implement in their own code bases. This library provides a small collection of common building blocks for implementing the record pattern in TypeScript / JavaScript.

For more detail on the context pattern, see sabl / [patterns](https://github.com/libsabl/patterns#patterns) / [record](https://github.com/libsabl/patterns/blob/main/patterns/record.md).

<!-- BEGIN:REMOVE_FOR_NPM -->
> [**sabl**](https://github.com/libsabl/patterns) is an open-source project to identify, describe, and implement effective software patterns which solve small problems clearly, can be composed to solve big problems, and which work consistently across many programming languages.

## Developer orientation

See [SETUP.md](./docs/SETUP.md), [CONFIG.md](./docs/CONFIG.md).
<!-- END:REMOVE_FOR_NPM -->

## API

### RecordError

`RecordError` is a derived `Error` type that includes several properties useful for reporting or inspecting common errors that occur when working with records. It also includes several predefined error type constants which can be useful for implementation-agnostic handling of common error scenarios.

### Record, RecordOf interfaces

These extremely simple interfaces are useful for the generic implementation of [relations](#relation-nullablerelation) as well as other generic scenarios when working with otherwise unknown record types, such as logging. In short, a `Record` is an object that can return a string describing its type, and a key value. Depending on the underlying data model, the key for a record might be a single scalar value (by far the most common), or could be a tuple of scalars.

`RecordOf` is simply a derived version of `Record` where the exact scalar or tuple type of the record key is known at compile time.

```ts
export interface Record {
  getKey(): unknown;
  getType(): string;
}
 
export interface RecordOf<TKey> extends Record {
  getKey(): TKey;
}
```

### Relation, NullableRelation

The `Relation` and `NullableRelation` relation implement most of the mechanics needed to store a cached relation on a record. Use `Relation` when the relation is required to be present (e.g. a non-nullable foreign key in a relational database), or `NullableRelation` when the relation is not required to be present (e.g. a nullable foreign key in a relational database, or an edge in a graph database).

The relation object keeps track of both the the *key* value used to identify the related record, as well as a reference to an instance of the related record itself. Using the [`RecordOf` interface](#record-recordof-interfaces), the relation can validate and correlate the expected key value with the key value of any record instance assigned to the cache.

A relation instance must be provided with a callback to execute in order to retrieve the related record. The callback signature leverages the [context pattern](https://github.com/libsabl/patterns/blob/main/patterns/context.md) for simple dependency injection, allowing relations to be used both in testing and production scenarios.

Authors may create relations directly using the `Relation` or `NullableRelation` constructors, or may define inherited classes which include a predefined getter callback. The first technique is used in the [unit tests of this library](https://github.com/libsabl/record-js/blob/main/test/relation.spec.ts), while the second technique is used in the [extended TypeScript example](https://github.com/libsabl/patterns/blob/main/patterns/record.md#relation-implementation) included in the record pattern docs.

```ts
export class Relation<TKey, TRelated extends RecordOf<TKey>> { 
  /**
   * Create a new relation with the provided keyProp name
   * @param keyProp The name of the key property on the model
   * which contains the relation. Used only for generating error messages
   * @param retrieveItem A function that returns a record given a context and key value
   */
  constructor(
    keyProp: string,
    retrieveItem: (ctx: IContext, key: TKey) => Promise<TRelated | null>
  );

  /** The name of the associated key property */
  get keyProp(): string;

  /** Directly return the cached item, which may be null */
  get item(): TRelated | null;

  /** Fetch the current key value */
  get key(): TKey;

  /** Check whether the related item is already cached */
  get loaded(): boolean;

  /** Retrieve the cached record, init the async fetch, or await the ongoing fetch as applicable */
  async getItem(ctx: IContext): Promise<TRelated>;

  /** Initialize the key value */
  initKey(key: TKey);

  /**
   * Overwrite the key value, clearing the cached item if applicable.
   * Use this when a relation is updated on an existing record.
   */
  setKey(key: TKey);

  /** Set the cached related item, but validate it has the same key value as expected */
  initItem(item: TRelated);

  /** Directly set the cache related item, overwriting the key value */
  setItem(item: TRelated);

  /** Clear the cached related item and promise */
  clearItem();
}
```

### CollectionRelation

A `CollectionRelation` implements shared mechanics for retrieving a cached a related *collection* of records, such as the line items for an invoice.

A relation instance must be provided with a callback to execute in order to retrieve the related records, given a context and the parent record. The callback signature leverages the [context pattern](https://github.com/libsabl/patterns/blob/main/patterns/context.md) for simple dependency injection, allowing relations to be used both in testing and production scenarios.

Authors may create collection relations directly using the `CollectionRelation` constructor, or may define inherited classes which include a predefined getter callback. The first technique is used in the [unit tests of this library](https://github.com/libsabl/record-js/blob/main/test/collection-relation.spec.ts), while the second technique is used in the [extended TypeScript example](https://github.com/libsabl/patterns/blob/main/patterns/record.md#relation-implementation) included in the record pattern docs.

#### Cached collection management

When performing basic CRUD operations in data applications, it is common to need to update cached related collections. For example, if an invoice line is created, and the lines of the applicable invoice are already cached, then it is helpful to add the newly created line to the existing cache. Likewise if an invoice line is deleted, and the lines of the parent invoice are already cached, then it is helpful to remove the corresponding invoice line record for the parent invoice's cached collection of lines.

`CollectionRelation` provides APIs to accomplish this with `appendItem` and `removeItem`, respectively. They both do nothing if the collection is not already cached. In addition, `removeItem` uses the [`Record` interface](#record-recordof-interfaces) to check for an existing record using its key value rather than relying on reference equality.

#### CollectionRelation API

```ts
export class CollectionRelation<TParent, TRelated extends Record> {
  constructor(
    retrieveItems: (
      ctx: IContext,
      parent: TParent
    ) => Promise<Iterable<TRelated>>
  );

  /** Directly return the cached collection, which may be null */
  get items(): TRelated[] | null;

  /** Check whether the collection of related items is already cached */
  get loaded(): boolean;

  /** Retrieve the cached collection, init the async fetch, or await the ongoing fetch as applicable */
  async getItems(ctx: IContext, parent: TParent);

  /** If the collection has already been cached, appends `item` */
  appendItem(item: TRelated): void;

  /** If the collection has already been cached, removes the record with the same key as `item` */
  removeItem(item: TRelated): void;

  /** Directly set the cached collection */
  setCollection(items: Iterable<TRelated>);

  /** Clear the cached collection and promise */
  clear(): void;
}
```

### stream, collect

The record pattern does not include specific expectations about how data storage and retrieval is implemented. However, it does provide two simple utilities for implementing effective data retrieval patterns regardless of the underlying framework or other patterns used. 

Specifically, it is highly preferred when invoking a data operation that could return multiple records to use an [async iterator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of) to incrementally yield returned records. This allows programs to do all of the following:

- Implement efficient streaming algorithms that do not require storing an entire result set in memory
- Operate on records as soon as they are incrementally returned, rather than waiting for all records to process the first record
- Abort long-running operations

#### `collect`

```ts
async function collect<T>(
  stream: AsyncIterable<T>
): Promise<Iterable<T>>
```

While it is best to return async iterables from underlying storage operations, it is also assumed that the collection retrieval for a [`CollectionRelation`](#collectionrelation) is an asynchronous operation that returns an entire collection, rather than an async iterator. This reflects the assumption that if a program author intends to cache a related collection, then they want to store and operate on that collection as a whole, rather than always async iterating over each item. This introduces a mismatch between the underlying retrieval method signature and the signature of a collection relation's `getItems` method.

The `collect` method simply takes an async iterator and returns a Promise that resolves the complete collection. With its generic TypeScript signature, this can be used to wrap underlying retrieval methods when constructing `CollectionRelation` instances. 

```ts
const rel = new CollectionRelation<Invoice, InvoiceLine>(
  (ctx, ivc) => {
    const repo = Context.as(ctx).require(getRepo);
    return collect(repo.getInvoiceLines(ctx, ivc.id));
  }
);
```

`collect` can also be used simply for convenience either in test or production code to await a full result set.

```ts
const lines = await collect(repo.getInvoiceLines(ctx, ivc.id));
console.log(`got ${lines.length} records`);
```

#### `stream`

The `stream` method takes a simple collection (such as an array) and returns it as an async iterable. This is mostly useful when implementing mock methods of data retrieval operations, allowing a simple result set to be streamed as if it were an actual streaming operation from an underlying data store.

```ts
// Data source interface returns an async iterable
export interface Repository {
  getInvoiceLines(ctx: IContext, invoiceId: number): AsyncIterable<InvoiceLine>;
}

class MockRepo {
  getInvoiceLines(ctx: IContext, invoiceId: number): AsyncIterable<InvoiceLine> {
    const fakeRecords = [
      examples.invoiceLine({invoiceId}),
      examples.invoiceLine({invoiceId})
    ];
    return stream(fakeRecords);
  }
}
```
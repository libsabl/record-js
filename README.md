<!-- BEGIN:REMOVE_FOR_NPM -->
[![codecov](https://codecov.io/gh/libsabl/record-js/branch/main/graph/badge.svg?token=TVL1XYSJHA)](https://app.codecov.io/gh/libsabl/record-js/branch/main)
<!-- END:REMOVE_FOR_NPM -->

# @sabl/record
 
**record** is a pattern for representing a data model at runtime. It uses record or model instances exclusively to hold the attributes of a single flat row of data and to allow on-record caching of related records. Even with cached relations, records are passive and do not hold a connection to or knowledge of where the record was loaded from.

Conversely, records do provide features that communicate which attributes may be updated and when -- only when loaded, only indirectly through a mutator method, or any time simply by assigning to a property. These features express the intent of the underlying data model and aid authors in writing correct programs using that data model.

Most aspects of the record pattern are indeed *patterns* that authors implement in their own code bases. This library contains a small collection of useful elements for implementing that pattern:

- The minimal `Record` and `RecordOf` interfaces
- Implementations of single record and collection relations
- Utility methods for converting between `Promise<Iterable<T>>` and `AsyncIterable<T>`
- A base `RecordError` type with several common error type constants
  
## Developer orientation

See [SETUP.md](./docs/SETUP.md), [CONFIG.md](./docs/CONFIG.md).
<!-- END:REMOVE_FOR_NPM -->

## Usage

A record can be *described* entirely with interfaces. It contains up to four sections: 
- The simple scalar properties
- The relations
- The mutator methods
- The initializer, which consolidates all APIs for modifying the internal state of the record for the purposes of loading it from an outside data source, or caching related records.

The scalar properties and initializer all always required. Relations and mutator methods are only included if applicable.

## Example

### Definition

The following example shows the definition of an example Invoice and InvoiceLine records. Though contrived, they illustrate essentially all features of the record pattern as far as the public API of a record. 

Further explanation follows the code examples. Examples and description of the record *implementation* follow that.

**invoice.ts**
```ts
import type { CollectionRelation, RecordOf } from '@sabl/record';
import type { IContext } from '@sabl/context';
import type { InvoiceLine } from './invoice-line';

/** The properties of the Invoice record */
export interface InvoiceProps {
  readonly id: number;             // key, generated
  readonly invoiceNumber: number;  // protected-set
  label: string;
}

/** The mutators for protected properties of the Invoice record */
export interface InvoiceMutators {
  /** Change the invoice number */
  setInvoiceNumber(value: number): void;
}

/** The relations of the Invoice record */
export interface InvoiceRels {
  getLines(ctx: IContext): Promise<InvoiceLine[]>;
}

export interface InvoiceInitter {
  load(data: InvoiceProps, refresh: boolean): void;
  readonly lines: CollectionRelation<Invoice, InvoiceLine>;
}

export interface Invoice extends 
  InvoiceProps, 
  InvoiceMutators, 
  InvoiceRels, 
  RecordOf<number> {
  readonly init: InvoiceInitter;
}
```

**invoice-line.ts**
```ts
import type { RecordOf, Relation } from '@sabl/record';
import type { IContext } from '@sabl/context';
import type { Invoice } from './invoice';

/** The properties of the InvoiceLine record */
export interface InvoiceLineProps {
  readonly id: number;           // key, generated
  readonly invoiceId: number;    // write-once
  readonly product: string;      // protected-set
  readonly quantity: number;     // protected-set
  readonly price: number;        // protected-set
  readonly amount: number;       // calculated
}

/** The mutators for protected properties of the InvoiceLine record */
export interface InvoiceLineMutators {
  /** Change the product. */
  setProduct(value: string): void;

  /** Change the quantity number. Also updates amount */
  setQuantity(value: number): void;

  /** Change the price. Also updates amount */
  setPrice(value: number): void;
}

/** The relations of the InvoiceLine record */
export interface InvoiceLineRels {
  getInvoice(ctx: IContext): Promise<Invoice>;
}

/** Initter for InvoiceLine record */
export interface InvoiceLineInitter {
  load(data: InvoiceLineProps, refresh: boolean): void;
  readonly invoice: Relation<number, Invoice>;
}

/** An InvoiceLine record */
export interface InvoiceLine extends 
  InvoiceLineProps,
  InvoiceLineMutators,
  InvoiceLineRels,
  RecordOf<number> {
  readonly init: InvoiceLineInitter;
}
```

#### Property mutability

A key feature of the record pattern is to explicitly communicate and enforce when particular attributes may be updated. The examples above include all four main scenarios:

- `generated` / `read-only` 

  These attributes are derived or set by the external data source. At runtime, they can only be set when calling the `init.load()` method of a record the first time. Therefore the properties on the record are `readonly`.

- `write-once` 
  
  These attributes are supplied by a client when first creating a record, but they may never be changed afterwards. This is a logical concept that does not exist in any database system but is often important for the correct use of business data. Like `read-only` attributes, at runtime they can only be set when calling the `init.load()` method of a record the first time. Therefore the properties on the record are `readonly`.

- `protected-set` and mutators

  These attributes may be updated, but for semantic or human reasons the author of the data model wants to cause authors of code which use a record to stop and think before modifying them. Thus the properties are `readonly` to prevent simple assignment, but **mutator** methods are provided in order to update the values.

  Some mutator methods 
  
  Mutator methods may also be used to maintain correctness between correlated attributes. In the example above, it is implied that setting either `quantity` or `price` will also recalculate the `amount` property.

  Mutator methods may contain simple checks on the basic validity of data, but should never include business rules. Appropriate validity checks could include ensuring a string is non-empty or not too long for the intended data store field, or ensuring an integer is a known enumeration value.

  Mutator methods cannot perform any service-dependent validation, such as verifying that a value does not violate a unique constraint. They should also never modify data on any other record, even if those records are accessible through a cached relation. In other words, validation of interaction between a record and *other records* either in the runtime or underlying storage is explicitly and by design not what records are for in this pattern.

- simple

  Attributes that may be updated at any time with no particularly concerning consequences -- the invoice label is used as an example here -- can simply be public fields modified by direct assignment.

#### Circular references

Note the circular reference between invoice and invoice-line. This is perfectly acceptable because these are [type-only imports](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-8.html#type-only-imports-and-export), which are completely removed in the compiled JavaScript. Tooling, including when working in plain JavaScript, can fully comprehend the mutual relatedness of the invoice and invoice line, but there is no circular `require` in actual transformed JavaScript code.

#### Relation implementation and context

The relations described above know nothing of how a related record is actually retrieved (or made out of thin air). They do provide a [context](https://github.com/libsabl/patterns/blob/main/patterns/context.md). 

*Implementers* of the record must also provide implementations of the related record retrieval, though these implementations themselves should generally just retrieve some repository or data source *interface* from the context. The repository interface will describe how to ask for a particular record or set of records, but does not require the consumer to know about the implementation. At the very least this allows for simple mock implementations to facilitate testing without the need for an actual data store.

### Implementation
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { IContext } from '@sabl/context';
import type {
  InvoiceLineProps,
  InvoiceLine as IInvoiceLine,
} from '$defs/ecom/invoice-line';

import { Invoice } from '../invoice';
import { RecordError } from '$';

/** An invoice line */
export class InvoiceLine implements IInvoiceLine {
  static readonly typeName = 'example:invoice-line';

  //#region attributes

  #id: number = null!;
  /** The primary key id of the record `scio:[key,generated]` */
  get id(): number {
    return this.#id;
  }

  #amount: number = null!;
  /** The line item amount `scio:[write-once]` */
  get amount(): number {
    return this.#amount;
  }

  #product: string = null!;
  /** The product name `scio:[write-once]` */
  get product(): string {
    return this.#product;
  }

  //#endregion

  //#region relations
  readonly #invoice = new Invoice.Relation('invoiceId');

  /** The id of the {@link Invoice} for this record */
  get invoiceId() {
    return this.#invoice.key;
  }

  /** Lazy-loaded reference to the {@link Invoice} for this record */
  getInvoice(ctx: IContext) {
    return this.#invoice.getItem(ctx);
  }
  //#endregion

  //#region initter

  static readonly Initter = class Initter {
    readonly #record: InvoiceLine;

    constructor(record: InvoiceLine) {
      this.#record = record;
    }

    get invoice() {
      return this.#record.#invoice;
    }

    load(data: InvoiceLineProps, refresh = false) {
      const r = this.#record;
      if (refresh) {
        if (data.id !== r.#id) {
          throw new RecordError(RecordError.WRONG_RECORD);
        }
        r.#invoice.setKey(data.invoiceId);
      } else {
        if (r.#id != null!) {
          throw new RecordError(RecordError.REINITIALIZED);
        }
        r.#id = data.id;
        r.#invoice.initKey(data.invoiceId);
      }
      r.#amount = data.amount;
      r.#product = data.product;
    }
  };

  readonly #initter = new InvoiceLine.Initter(this);
  get init() {
    return this.#initter;
  }

  //#endregion

  getKey(): number {
    return this.#id;
  }

  getType(): string {
    return InvoiceLine.typeName;
  }
}

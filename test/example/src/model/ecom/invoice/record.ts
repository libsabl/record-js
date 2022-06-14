/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { IContext } from '@sabl/context';
import type { InvoiceLine } from '$defs/ecom/invoice-line';
import type { InvoiceProps, Invoice as IInvoice } from '$defs/ecom/invoice';

import { RecordError } from '$';
import { Invoice_Relation, Invoice_LinesRelation } from './relations';

/** An invoice */
export class Invoice implements IInvoice {
  static readonly typeName = 'example:invoice';
  static readonly Relation = Invoice_Relation;

  //#region attributes

  #id: number = null!;
  /** The primary key id of the record `scio:[key,generated]` */
  get id(): number {
    return this.#id;
  }

  #invoiceNumber: number = null!;
  /** The document number `scio:[write-once]` */
  get invoiceNumber(): number {
    return this.#invoiceNumber;
  }

  //#endregion

  //#region relations
  readonly #lines = new Invoice_LinesRelation();

  getLines(ctx: IContext): Promise<InvoiceLine[]> {
    return this.#lines.getItems(ctx, this);
  }
  //#endregion

  //#region initter

  static readonly Initter = class Initter {
    readonly #record: Invoice;

    constructor(record: Invoice) {
      this.#record = record;
    }

    get lines() {
      return this.#record.#lines;
    }

    load(data: InvoiceProps, refresh = false) {
      const r = this.#record;
      if (refresh) {
        if (data.id !== r.#id) {
          throw new RecordError(RecordError.WRONG_RECORD);
        }
      } else {
        if (r.#id != null!) {
          throw new RecordError(RecordError.REINITIALIZED);
        }
        r.#id = data.id;
      }
      r.#invoiceNumber = data.invoiceNumber;
    }
  };

  readonly #initter = new Invoice.Initter(this);

  get init() {
    return this.#initter;
  }

  //#endregion

  getKey(): number {
    return this.#id;
  }

  getType(): string {
    return Invoice.typeName;
  }
}

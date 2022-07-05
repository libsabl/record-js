// Copyright 2022 Joshua Honig. All rights reserved.
// Use of this source code is governed by a MIT
// license that can be found in the LICENSE file.

/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { RecordError, RecordOf } from '$';

/** The properties of the InvoiceLine record */
export interface InvoiceLineProps {
  readonly id: number;
  readonly invoiceId: number;
  readonly amount: number;
  readonly product: string;
}

/** An invoice line */
export class InvoiceLine implements InvoiceLineProps, RecordOf<number> {
  static readonly typeName = 'example:invoice-line';

  //#region attributes

  #id: number = null!;
  /** The primary key id of the record `scio:[key,generated]` */
  get id(): number {
    return this.#id;
  }

  #invoiceId: number = null!;
  /** The id of the related Invoice record `scio:[write-once]` */
  get invoiceId(): number {
    return this.#invoiceId;
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

  //#region initter

  static readonly Initter = class Initter {
    readonly #record: InvoiceLine;

    constructor(record: InvoiceLine) {
      this.#record = record;
    }

    load(data: InvoiceLineProps, refresh = false) {
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
      r.#invoiceId = data.invoiceId;
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

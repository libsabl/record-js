// Copyright 2022 Joshua Honig. All rights reserved.
// Use of this source code is governed by a MIT
// license that can be found in the LICENSE file.

/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { RecordError, RecordOf } from '$';

/** The properties of the Invoice record */
export interface InvoiceProps {
  readonly id: number;
  readonly invoiceNumber: number;
}

export class Invoice implements InvoiceProps, RecordOf<number> {
  static readonly typeName = 'example:invoice';

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

  //#region initter

  static readonly Initter = class Initter {
    readonly #record: Invoice;

    constructor(record: Invoice) {
      this.#record = record;
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

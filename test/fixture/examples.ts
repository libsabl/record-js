// Copyright 2022 Joshua Honig. All rights reserved.
// Use of this source code is governed by a MIT
// license that can be found in the LICENSE file.

import { faker } from '@faker-js/faker';
import { Invoice, InvoiceProps } from './invoice';
import { InvoiceLine, InvoiceLineProps } from './invoice-line';

/** Example attribute values for a {@link Invoice} record */
export class InvoiceExamples implements InvoiceProps {
  id: number = faker.datatype.number();
  invoiceNumber: number = faker.datatype.number();

  /** Return a new examples with any provided properties updated  */
  with(data: { id?: number; invoiceNumber?: number }) {
    return Object.assign(new InvoiceExamples(), this, data);
  }

  /** Create a mock record based on example data */
  mock() {
    const model = new Invoice();
    model.init.load(this);
    return model;
  }
}

export class InvoiceLineExamples implements InvoiceLineProps {
  id: number = faker.datatype.number();
  invoiceId: number = faker.datatype.number();
  amount: number = +faker.commerce.price();
  product: string = faker.commerce.productDescription();

  #invoice: Invoice | null = null;
  /** Related invoice record. Null by default */
  get invoice(): Invoice | null {
    return this.#invoice;
  }
  set invoice(value: Invoice | null) {
    this.#invoice = value;
    if (value != null) {
      this.invoiceId = value.id;
    }
  }

  /** Return a new examples with any provided properties updated  */
  with(data: {
    id?: number;
    invoiceId?: number;
    amount?: number;
    product?: string;
    invoice?: Invoice;
  }) {
    return Object.assign(new InvoiceLineExamples(), this, data);
  }

  /** Create a mock record based on example data */
  mock() {
    const model = new InvoiceLine();
    model.init.load(this);
    return model;
  }
}

export const examples = {
  invoice() {
    return new InvoiceExamples();
  },
  invoiceLine() {
    return new InvoiceLineExamples();
  },
};

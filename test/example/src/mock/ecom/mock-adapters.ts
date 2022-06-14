import { EComAdaptersBase } from '$ex/model/ecom/adapters';

import { MockInvoiceAdapter } from './invoice/mock-adapter';
import { MockInvoiceLineAdapter } from './invoice-line/mock-adapter';

import type { InvoiceAdapter, InvoiceLineAdapter } from '$defs/ecom';
import type { MockRepo } from '../mock-repo';

export class MockEComAdapters extends EComAdaptersBase<MockRepo> {
  constructor(root: MockRepo) {
    super(root);
  }

  protected buildInvoice(root: MockRepo): InvoiceAdapter {
    return new MockInvoiceAdapter(root);
  }

  protected buildInvoiceLine(root: MockRepo): InvoiceLineAdapter {
    return new MockInvoiceLineAdapter(root);
  }
}

/* eslint-disable @typescript-eslint/no-unused-vars */
import type { IContext } from '@sabl/context';
import type {
  InvoiceLine,
  InvoiceLineAdapterBase,
} from '$defs/ecom/invoice-line';
import type { MockRepo } from '../../mock-repo';

import { stream } from '$';
import { AdapterBase } from '$ex/model/repository';
import { InvoiceLineAdapter } from '$ex/model/ecom/invoice-line';

import { examples } from '../../examples';

class MockInvoiceLineAdapterBase
  extends AdapterBase<MockRepo>
  implements InvoiceLineAdapterBase
{
  constructor(root: MockRepo) {
    super(root);
  }

  create(
    ctx: IContext,
    invoiceId: number,
    amount: number,
    product: string
  ): Promise<InvoiceLine> {
    return Promise.resolve(
      examples.ecom.invoiceLine().with({ invoiceId }).mock()
    );
  }
  get(ctx: IContext, id: number): Promise<InvoiceLine | null> {
    return Promise.resolve(examples.ecom.invoiceLine().with({ id }).mock());
  }

  getAll(ctx: IContext, invoiceId: number): AsyncIterable<InvoiceLine> {
    return stream(
      examples.ecom.invoiceLine().with({ invoiceId }).mock(),
      examples.ecom.invoiceLine().with({ invoiceId }).mock()
    );
  }

  save(ctx: IContext, record: InvoiceLine): Promise<InvoiceLine> {
    return Promise.resolve(record);
  }

  delete(ctx: IContext, id: number): Promise<void> {
    return Promise.resolve();
  }
}

export const MockInvoiceLineAdapter = InvoiceLineAdapter.extend(
  MockInvoiceLineAdapterBase
);

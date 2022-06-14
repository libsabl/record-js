/* eslint-disable @typescript-eslint/no-unused-vars */
import type { IContext } from '@sabl/context';
import type { Invoice, InvoiceAdapterBase } from '$defs/ecom/invoice';
import type { MockRepo } from '../../mock-repo';

import { InvoiceAdapter } from '$ex/model/ecom/invoice';
import { AdapterBase } from '$ex/model/repository';

import { examples } from '../../examples';

class MockInvoiceAdapterBase
  extends AdapterBase<MockRepo>
  implements InvoiceAdapterBase
{
  constructor(root: MockRepo) {
    super(root);
  }

  create(ctx: IContext, invoiceNumber: number): Promise<Invoice> {
    return Promise.resolve(
      examples.ecom.invoice().with({ invoiceNumber }).mock()
    );
  }

  get(ctx: IContext, id: number): Promise<Invoice | null> {
    return Promise.resolve(examples.ecom.invoice().with({ id }).mock());
  }

  save(ctx: IContext, record: Invoice): Promise<Invoice> {
    return Promise.resolve(record);
  }

  delete(ctx: IContext, id: number): Promise<void> {
    return Promise.resolve();
  }
}

export const MockInvoiceAdapter = InvoiceAdapter.extend(MockInvoiceAdapterBase);

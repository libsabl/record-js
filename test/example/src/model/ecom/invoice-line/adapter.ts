import type { Constructor } from '$';
import type { IContext } from '@sabl/context';
import type { Invoice } from '$defs/ecom/invoice';
import type {
  InvoiceLine,
  InvoiceLineAdapter as IInvoiceLineAdapter,
  InvoiceLineAdapterBase,
} from '$defs/ecom/invoice-line';

export class InvoiceLineAdapter {
  static extend<TBase extends Constructor<InvoiceLineAdapterBase>>(
    Base: TBase
  ) {
    return class InvoiceLineAdapter
      extends Base
      implements IInvoiceLineAdapter
    {
      create(
        ctx: IContext,
        invoiceId: number,
        amount: number,
        product: string
      ): Promise<InvoiceLine>;
      create(
        ctx: IContext,
        invoice: Invoice,
        amount: number,
        product: string
      ): Promise<InvoiceLine>;
      async create(
        ctx: IContext,
        invoiceSrc: number | Invoice,
        amount: number,
        product: string
      ): Promise<InvoiceLine> {
        if (typeof invoiceSrc === 'number') {
          return super.create(ctx, invoiceSrc, amount, product);
        }

        const invoice = invoiceSrc;

        // Create the record
        const record = await super.create(ctx, invoice.id, amount, product);

        // Set the reciprocal relations
        invoice.init.lines.appendItem(record);
        record.init.invoice.initItem(invoice);

        // Return the record
        return record;
      }

      getAll(ctx: IContext, invoiceId: number): AsyncIterable<InvoiceLine>;
      getAll(ctx: IContext, invoice: Invoice): AsyncIterable<InvoiceLine>;
      async *getAll(
        ctx: IContext,
        invoiceSrc: number | Invoice
      ): AsyncIterable<InvoiceLine> {
        if (typeof invoiceSrc === 'number') {
          return super.getAll(ctx, invoiceSrc);
        }

        const invoice = invoiceSrc;
        for await (const record of super.getAll(ctx, invoice.id)) {
          record.init.invoice.initItem(invoice);
          yield record;
        }
      }

      delete(ctx: IContext, id: number): Promise<void>;
      delete(ctx: IContext, record: InvoiceLine): Promise<void>;
      delete(ctx: IContext, src: number | InvoiceLine): Promise<void> {
        if (typeof src === 'number') return super.delete(ctx, src);
        return super.delete(ctx, src.id);
      }
    };
  }
}

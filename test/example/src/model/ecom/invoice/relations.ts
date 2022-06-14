import type { InvoiceLine } from '$defs/ecom/invoice-line';
import type { Invoice } from '$defs/ecom/invoice';

import { collect, CollectionRelation, Relation } from '$';
import { Context, IContext } from '@sabl/context';
import { getRepo } from '../../context';

/** A relation of an invoice to its lines */
export class Invoice_LinesRelation extends CollectionRelation<
  Invoice,
  InvoiceLine
> {
  protected retrieveItems(
    ctx: IContext,
    parent: Invoice
  ): Promise<Iterable<InvoiceLine>> {
    const repo = Context.as(ctx).require(getRepo);
    return collect(repo.ecom.invoiceLine.getAll(ctx, parent));
  }
}

/** A relation to an invoice record */
export class Invoice_Relation extends Relation<number, Invoice> {
  protected retrieveItem(ctx: IContext, key: number): Promise<Invoice | null> {
    const repo = Context.as(ctx).require(getRepo);
    return repo.ecom.invoice.get(ctx, key);
  }
}

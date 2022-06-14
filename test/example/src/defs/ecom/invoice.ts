import type { CollectionRelation, RecordOf } from '$';
import type { IContext } from '@sabl/context';
import type { InvoiceLine } from './invoice-line';

/** The properties of the Invoice record */
export interface InvoiceProps {
  readonly id: number;
  readonly invoiceNumber: number;
}

/** The relations of the Invoice record */
export interface InvoiceRels {
  getLines(ctx: IContext): Promise<InvoiceLine[]>;
}

export interface InvoiceInitter {
  load(data: InvoiceProps, refresh: boolean): void;
  readonly lines: CollectionRelation<Invoice, InvoiceLine>;
}

export interface Invoice extends InvoiceProps, InvoiceRels, RecordOf<number> {
  readonly init: InvoiceInitter;
}

export interface InvoiceAdapterBase {
  create(ctx: IContext, invoiceNumber: number): Promise<Invoice>;
  get(ctx: IContext, id: number): Promise<Invoice | null>;
  save(ctx: IContext, record: Invoice): Promise<Invoice>;
  delete(ctx: IContext, id: number): Promise<void>;
}

export interface InvoiceAdapter extends InvoiceAdapterBase {
  delete(ctx: IContext, id: number): Promise<void>;
  delete(ctx: IContext, record: Invoice): Promise<void>;
}

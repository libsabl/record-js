import type { RecordOf, Relation } from '$';
import type { IContext } from '@sabl/context';
import type { Invoice } from './invoice';

/** The properties of the InvoiceLine record */
export interface InvoiceLineProps {
  readonly id: number;
  readonly invoiceId: number;
  readonly amount: number;
  readonly product: string;
}

/** The relations of the InvoiceLine record */
export interface InvoiceLineRels {
  getInvoice(ctx: IContext): Promise<Invoice>;
}

/** Initter for InvoiceLine record */
export interface InvoiceLineInitter {
  load(data: InvoiceLineProps, refresh: boolean): void;
  readonly invoice: Relation<number, Invoice>;
}

/** An InvoiceLine record */
export interface InvoiceLine
  extends InvoiceLineProps,
    InvoiceLineRels,
    RecordOf<number> {
  readonly init: InvoiceLineInitter;
}

/** Direct operations for InvoiceLine records */
export interface InvoiceLineAdapterBase {
  create(
    ctx: IContext,
    invoiceId: number,
    amount: number,
    product: string
  ): Promise<InvoiceLine>;

  get(ctx: IContext, id: number): Promise<InvoiceLine | null>;
  getAll(ctx: IContext, invoiceId: number): AsyncIterable<InvoiceLine>;
  save(ctx: IContext, record: InvoiceLine): Promise<InvoiceLine>;
  delete(ctx: IContext, id: number): Promise<void>;
}

/** Extended operations for InvoiceLine records */
export interface InvoiceLineAdapter extends InvoiceLineAdapterBase {
  /** Create a new InvoiceLine from the related parent invoice id and line attributes */
  create(
    ctx: IContext,
    invoiceId: number,
    amount: number,
    product: string
  ): Promise<InvoiceLine>;
  /** Create a new InvoiceLine from the related parent invoice and line attributes */
  create(
    ctx: IContext,
    invoice: Invoice,
    amount: number,
    product: string
  ): Promise<InvoiceLine>;

  /** Get all InvoiceLine records for a parent Invoice id */
  getAll(ctx: IContext, invoiceId: number): AsyncIterable<InvoiceLine>;
  /** Get all InvoiceLine records for a parent Invoice */
  getAll(ctx: IContext, invoice: Invoice): AsyncIterable<InvoiceLine>;

  /** Delete an InvoiceLine record by its id */
  delete(ctx: IContext, id: number): Promise<void>;
  /** Delete an InvoiceLine records */
  delete(ctx: IContext, record: InvoiceLine): Promise<void>;
}

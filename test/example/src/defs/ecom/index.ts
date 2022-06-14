import type { InvoiceAdapter } from './invoice';
import type { InvoiceLineAdapter } from './invoice-line';

export interface EComAdapters {
  get invoice(): InvoiceAdapter;
  get invoiceLine(): InvoiceLineAdapter;
}

export { InvoiceAdapter, InvoiceLineAdapter };

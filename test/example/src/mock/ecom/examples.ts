import { InvoiceLineExamples } from './invoice-line/examples';
import { InvoiceExamples } from './invoice/examples';

export const ecomExamples = {
  invoice() {
    return new InvoiceExamples();
  },
  invoiceLine() {
    return new InvoiceLineExamples();
  },
};

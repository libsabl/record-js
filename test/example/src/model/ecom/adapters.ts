import { AdapterBase, Repository } from '../repository';
import type {
  EComAdapters,
  InvoiceAdapter,
  InvoiceLineAdapter,
} from '$defs/ecom';

export abstract class EComAdaptersBase<TRepo extends Repository>
  extends AdapterBase<TRepo>
  implements EComAdapters
{
  protected constructor(root: TRepo) {
    super(root);
  }

  //#region invoice
  #invoice: InvoiceAdapter | null = null;
  protected abstract buildInvoice(root: TRepo): InvoiceAdapter;

  get invoice(): InvoiceAdapter {
    if (this.#invoice == null) {
      this.#invoice = this.buildInvoice(this.root);
    }
    return this.#invoice;
  }
  //#endregion

  //#region invoice-line
  #invoiceLine: InvoiceLineAdapter | null = null;
  protected abstract buildInvoiceLine(root: TRepo): InvoiceLineAdapter;

  get invoiceLine(): InvoiceLineAdapter {
    if (this.#invoiceLine == null) {
      this.#invoiceLine = this.buildInvoiceLine(this.root);
    }
    return this.#invoiceLine;
  }
  //#endregion
}

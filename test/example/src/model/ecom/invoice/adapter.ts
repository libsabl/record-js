import type { Constructor } from '$';
import type { IContext } from '@sabl/context';
import type {
  Invoice,
  InvoiceAdapterBase,
  InvoiceAdapter as IInvoiceAdapter,
} from '$defs/ecom/invoice';

export class InvoiceAdapter {
  static extend<TBase extends Constructor<InvoiceAdapterBase>>(Base: TBase) {
    return class InvoiceAdapter extends Base implements IInvoiceAdapter {
      delete(ctx: IContext, id: number): Promise<void>;
      delete(ctx: IContext, record: Invoice): Promise<void>;
      delete(ctx: IContext, src: number | Invoice): Promise<void> {
        if (typeof src === 'number') return super.delete(ctx, src);
        return super.delete(ctx, src.id);
      }
    };
  }
}

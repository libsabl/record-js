import { Context, IContext } from '@sabl/context';
import { faker } from '@faker-js/faker';
import { getRepo } from '$ex/model';
import { Invoice } from '$ex/model/ecom/invoice';
import { InvoiceLine, InvoiceLineProps } from '$ex/model/ecom/invoice-line';

export class InvoiceLineExamples implements InvoiceLineProps {
  id: number = faker.datatype.number();
  invoiceId: number = faker.datatype.number();
  amount: number = +faker.commerce.price();
  product: string = faker.commerce.productDescription();

  #invoice: Invoice | null = null;
  /** Related invoice record. Null by default */
  get invoice(): Invoice | null {
    return this.#invoice;
  }
  set invoice(value: Invoice | null) {
    this.#invoice = value;
    if (value != null) {
      this.invoiceId = value.id;
    }
  }

  /** Return a new examples with any provided properties updated  */
  with(data: {
    id?: number;
    invoiceId?: number;
    amount?: number;
    product?: string;
  }) {
    return Object.assign(new InvoiceLineExamples(), this, data);
  }

  /** Create a mock record based on example data */
  mock() {
    const model = new InvoiceLine();
    model.init.load(this);
    return model;
  }

  /** Create (insert) an actual record based on example data */
  create(ctx: IContext) {
    const repo = Context.as(ctx).require(getRepo);
    if (this.#invoice != null) {
      return repo.ecom.invoiceLine.create(
        ctx,
        this.#invoice,
        this.amount,
        this.product
      );
    } else {
      return repo.ecom.invoiceLine.create(
        ctx,
        this.#invoice || this.invoiceId,
        this.amount,
        this.product
      );
    }
  }
}

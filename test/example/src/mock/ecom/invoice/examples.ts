import { Context, IContext } from '@sabl/context';
import { faker } from '@faker-js/faker';
import { getRepo } from '$ex/model';
import { Invoice, InvoiceProps } from '$ex/model/ecom/invoice';

/** Example attribute values for a {@link Invoice} record */
export class InvoiceExamples implements InvoiceProps {
  id: number = faker.datatype.number();
  invoiceNumber: number = faker.datatype.number();

  /** Return a new examples with any provided properties updated  */
  with(data: { id?: number; invoiceNumber?: number }) {
    return Object.assign(new InvoiceExamples(), this, data);
  }

  /** Create a mock record based on example data */
  mock() {
    const model = new Invoice();
    model.init.load(this);
    return model;
  }

  /** Create (insert) an actual record based on example data */
  create(ctx: IContext) {
    const repo = Context.as(ctx).require(getRepo);
    return repo.ecom.invoice.create(ctx, this.invoiceNumber);
  }
}

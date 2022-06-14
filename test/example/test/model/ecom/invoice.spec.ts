/* eslint-disable @typescript-eslint/no-explicit-any */
import { Invoice } from '$ex/model/ecom/invoice';
import { examples } from '$ex/mock';
import { RecordError } from '$';

describe('Invoice', function () {
  describe('getKey', function () {
    it('gets the id', () => {
      const record = examples.ecom.invoice().mock();
      expect(record.getKey()).toBe(record.id);
    });
  });

  describe('init', function () {
    describe('load', function () {
      it('sets properties', () => {
        const ex = examples.ecom.invoice();

        const record = new Invoice();
        record.init.load(ex);

        expect(record.id).toBe(ex.id);
        expect(record.invoiceNumber).toBe(ex.invoiceNumber);
      });

      it('rejects updates', () => {
        const record = examples.ecom.invoice().mock();
        const ex2 = examples.ecom.invoice();

        expect(() => record.init.load(ex2)).toThrow(RecordError.REINITIALIZED);
      });

      it('rejects refresh with wrong id', () => {
        const record = examples.ecom.invoice().mock();
        const ex2 = examples.ecom.invoice();

        expect(() => record.init.load(ex2, true)).toThrow(
          RecordError.WRONG_RECORD
        );
      });

      it('accepts refresh with correct id', () => {
        const ex = examples.ecom.invoice();
        const record = ex.mock();
        const ex2 = ex.with({ invoiceNumber: ex.invoiceNumber + 1 });

        record.init.load(ex2, true);

        expect(record.invoiceNumber).toBe(ex2.invoiceNumber);
      });
    });
  });
});

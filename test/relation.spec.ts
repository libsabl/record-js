// Copyright 2022 Joshua Honig. All rights reserved.
// Use of this source code is governed by a MIT
// license that can be found in the LICENSE file.

/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Context, IContext } from '@sabl/context';
import { Invoice, examples } from '$test/fixture';
import { pause } from '$test/lib/pause';
import { NullableRelation, Relation } from '$';

function getInvoice(ctx: IContext, invoiceId: number): Promise<Invoice | null> {
  const ivc = examples.invoice().with({ id: invoiceId }).mock();
  return Promise.resolve(ivc);
}

async function delayGetInvoice(
  ctx: IContext,
  id: number
): Promise<Invoice | null> {
  await pause(10);
  return getInvoice(ctx, id);
}

describe('Relation', () => {
  describe('ctor', () => {
    it('assigns key prop', () => {
      const rel = new Relation<number, Invoice>('invoiceId', null!);
      expect(rel.keyProp).toBe('invoiceId');
    });
  });

  describe('key', () => {
    it('returns current key value', () => {
      // Initially null
      const rel = new Relation<number, Invoice>('invoiceId', null!);
      expect(rel.key).toBe(null);

      // Init value
      rel.initKey(11);
      expect(rel.key).toBe(11);

      // Overwrite value
      rel.setKey(12);
      expect(rel.key).toBe(12);
    });
  });

  describe('item', () => {
    it('returns current cached item', () => {
      const rel = new Relation<number, Invoice>('invoiceId', null!);
      // Initially item
      expect(rel.item).toBe(null);

      // Init item
      const ivc = examples.invoice().mock();
      rel.initItem(ivc);
      expect(rel.item).toBe(ivc);

      // Overwrite item
      const ivc2 = examples.invoice().mock();
      rel.setItem(ivc2);
      expect(rel.item).toBe(ivc2);

      // Clear item
      rel.clearItem();
      expect(rel.item).toBe(null);
    });
  });

  describe('loaded', () => {
    it('indicates if item is null', () => {
      const rel = new Relation<number, Invoice>('invoiceId', null!);

      // Initially null
      expect(rel.item).toBe(null);

      // Init item
      const ivc = examples.invoice().mock();
      rel.initItem(ivc);
      expect(rel.loaded).toBe(true);

      // Overwrite item
      const ivc2 = examples.invoice().mock();
      rel.setItem(ivc2);
      expect(rel.loaded).toBe(true);

      // Clear item
      rel.clearItem();
      expect(rel.loaded).toBe(false);
    });
  });

  describe('initKey', () => {
    it('rejects new key value', () => {
      const rel = new Relation<number, Invoice>('invoiceId', null!);

      rel.initKey(11);
      expect(() => rel.initKey(12)).toThrow('invoiceId is already initialized');
    });
  });

  describe('setKey', () => {
    it('ignores same key value', () => {
      const rel = new Relation<number, Invoice>('invoiceId', null!);
      const ivc = examples.invoice().mock();
      rel.initItem(ivc);
      rel.setKey(ivc.id);
      expect(rel.item).toBe(ivc);
    });

    it('clears cached item for new key value', () => {
      const rel = new Relation<number, Invoice>('invoiceId', null!);
      const ivc = examples.invoice().mock();
      rel.initItem(ivc);
      rel.setKey(ivc.id + 1);
      expect(rel.item).toBe(null);
    });
  });

  describe('initItem', () => {
    it('also sets key value', () => {
      const rel = new Relation<number, Invoice>('invoiceId', null!);
      const ivc = examples.invoice().mock();
      rel.initItem(ivc);
      expect(rel.key).toBe(ivc.id);
    });

    it('rejects record with wrong id', () => {
      const rel = new Relation<number, Invoice>('invoiceId', null!);
      const ivc = examples.invoice().mock();
      rel.initKey(ivc.id - 1);
      expect(() => rel.initItem(ivc)).toThrow(
        'invoiceId is already initialized'
      );
    });

    it('can be called with new record of same id', () => {
      const rel = new Relation<number, Invoice>('invoiceId', null!);

      // Make two invoices with the same attribute values
      const ex = examples.invoice();
      const ivc1 = ex.mock();
      const ivc2 = ex.mock();

      rel.initItem(ivc1);
      expect(rel.item).toBe(ivc1);

      // Ok to set to new record as long as it has
      // the same id value (really, same value from getKey())
      rel.initItem(ivc2);
      expect(rel.item).toBe(ivc2);
    });
  });

  describe('getItem', () => {
    const ctx = Context.background;

    it('invokes defined retrieval method', async () => {
      const rel = new Relation<number, Invoice>('invoiceId', getInvoice);
      rel.initKey(11);
      const ivc = await rel.getItem(ctx);
      expect(ivc.id).toBe(11);
    });

    it('caches the item', async () => {
      const rel = new Relation<number, Invoice>('invoiceId', getInvoice);
      rel.initKey(11);
      const ivc = await rel.getItem(ctx);

      // Sets cache
      expect(rel.item).toBe(ivc);

      // Asking again should return already cached item
      const ivc2 = await rel.getItem(ctx);
      expect(ivc2).toBe(ivc);
    });

    it('waits for single promise to resolve', async () => {
      const rel = new Relation<number, Invoice>('invoiceId', delayGetInvoice);
      rel.initKey(11);
      const p1 = rel.getItem(ctx);
      const p2 = rel.getItem(ctx);
      const p3 = rel.getItem(ctx);

      const [ivc1, ivc2, ivc3] = await Promise.all([p1, p2, p3]);
      expect(ivc2).toBe(ivc1);
      expect(ivc3).toBe(ivc1);
    });

    it('throws if no key value', async () => {
      const rel = new Relation<number, Invoice>('invoiceId', getInvoice);
      await expect(() => rel.getItem(ctx)).rejects.toThrow(
        'Key attribute value not set'
      );
    });

    it('throws if retrieve method returns null', async () => {
      const rel = new Relation<number, Invoice>('invoiceId', () =>
        Promise.resolve(null)
      );
      rel.initKey(11);
      await expect(() => rel.getItem(ctx)).rejects.toThrow(
        'Repository did not return a record'
      );
    });
  });
});

describe('NullableRelation', () => {
  describe('ctor', () => {
    it('assigns key prop', () => {
      const rel = new NullableRelation<number, Invoice>('invoiceId', null!);
      expect(rel.keyProp).toBe('invoiceId');
    });
  });

  describe('key', () => {
    it('returns current key value', () => {
      // Initially null
      const rel = new NullableRelation<number, Invoice>('invoiceId', null!);
      expect(rel.key).toBe(null);

      // Init value
      rel.initKey(11);
      expect(rel.key).toBe(11);

      // Overwrite value
      rel.setKey(12);
      expect(rel.key).toBe(12);
    });
  });

  describe('item', () => {
    it('returns current cached item', () => {
      const rel = new NullableRelation<number, Invoice>('invoiceId', null!);

      // Initially item
      expect(rel.item).toBe(null);

      // Init item
      const ivc = examples.invoice().mock();
      rel.initItem(ivc);
      expect(rel.item).toBe(ivc);

      // Overwrite item
      const ivc2 = examples.invoice().mock();
      rel.setItem(ivc2);
      expect(rel.item).toBe(ivc2);

      // Clear item
      rel.clearItem();
      expect(rel.item).toBe(null);
    });
  });

  describe('loaded', () => {
    it('indicates if item is null', () => {
      const rel = new NullableRelation<number, Invoice>('invoiceId', null!);

      // Initially null
      expect(rel.item).toBe(null);

      // Init item
      const ivc = examples.invoice().mock();
      rel.initItem(ivc);
      expect(rel.loaded).toBe(true);

      // Overwrite item
      const ivc2 = examples.invoice().mock();
      rel.setItem(ivc2);
      expect(rel.loaded).toBe(true);

      // Clear item
      rel.clearItem();
      expect(rel.loaded).toBe(false);
    });
  });

  describe('initKey', () => {
    it('rejects new key value', () => {
      const rel = new NullableRelation<number, Invoice>('invoiceId', null!);

      rel.initKey(11);
      expect(() => rel.initKey(12)).toThrow('invoiceId is already initialized');
    });
  });

  describe('setKey', () => {
    it('ignores same key value', () => {
      const rel = new NullableRelation<number, Invoice>('invoiceId', null!);
      const ivc = examples.invoice().mock();
      rel.initItem(ivc);
      rel.setKey(ivc.id);
      expect(rel.item).toBe(ivc);
    });

    it('clears cached item for new key value', () => {
      const rel = new NullableRelation<number, Invoice>('invoiceId', null!);
      const ivc = examples.invoice().mock();
      rel.initItem(ivc);
      rel.setKey(ivc.id + 1);
      expect(rel.item).toBe(null);
    });
  });

  describe('initItem', () => {
    it('also sets key value', () => {
      const rel = new NullableRelation<number, Invoice>('invoiceId', null!);
      const ivc = examples.invoice().mock();
      rel.initItem(ivc);
      expect(rel.key).toBe(ivc.id);
    });

    it('rejects record with wrong id', () => {
      const rel = new NullableRelation<number, Invoice>('invoiceId', null!);
      const ivc = examples.invoice().mock();
      rel.initKey(ivc.id - 1);
      expect(() => rel.initItem(ivc)).toThrow(
        'invoiceId is already initialized'
      );
    });

    it('can be called with new record of same id', () => {
      const rel = new NullableRelation<number, Invoice>('invoiceId', null!);

      // Make two invoices with the same attribute values
      const ex = examples.invoice();
      const ivc1 = ex.mock();
      const ivc2 = ex.mock();

      rel.initItem(ivc1);
      expect(rel.item).toBe(ivc1);

      // Ok to set to new record as long as it has
      // the same id value (really, same value from getKey())
      rel.initItem(ivc2);
      expect(rel.item).toBe(ivc2);
    });
  });

  describe('setItem', () => {
    it('accepts null value and sets key to null', () => {
      const rel = new NullableRelation<number, Invoice>('invoiceId', null!);
      const ivc = examples.invoice().mock();
      rel.initItem(ivc);
      expect(rel.key).toBe(ivc.id);

      // Now set to null
      rel.setItem(null);
      expect(rel.key).toBe(null);
    });
  });

  describe('getItem', () => {
    const ctx = Context.background;

    it('invokes defined retrieval method', async () => {
      const rel = new NullableRelation<number, Invoice>(
        'invoiceId',
        getInvoice
      );
      rel.initKey(11);
      const ivc = await rel.getItem(ctx);
      expect(ivc!.id).toBe(11);
    });

    it('caches the item', async () => {
      const rel = new NullableRelation<number, Invoice>(
        'invoiceId',
        getInvoice
      );
      rel.initKey(11);
      const ivc = await rel.getItem(ctx);

      // Sets cache
      expect(rel.item).toBe(ivc);

      // Asking again should return already cached item
      const ivc2 = await rel.getItem(ctx);
      expect(ivc2).toBe(ivc);
    });

    it('waits for single promise to resolve', async () => {
      const rel = new NullableRelation<number, Invoice>(
        'invoiceId',
        delayGetInvoice
      );
      rel.initKey(11);
      const p1 = rel.getItem(ctx);
      const p2 = rel.getItem(ctx);
      const p3 = rel.getItem(ctx);

      const [ivc1, ivc2, ivc3] = await Promise.all([p1, p2, p3]);
      expect(ivc2).toBe(ivc1);
      expect(ivc3).toBe(ivc1);
    });

    it('throws if no key value', async () => {
      const rel = new NullableRelation<number, Invoice>(
        'invoiceId',
        getInvoice
      );
      await expect(() => rel.getItem(ctx)).rejects.toThrow(
        'Key attribute value not set'
      );
    });

    it('returns null if key explicitly null', async () => {
      const rel = new NullableRelation<number, Invoice>(
        'invoiceId',
        getInvoice
      );
      rel.initKey(null);
      const ivc = await rel.getItem(ctx);
      expect(ivc).toBe(null);
    });

    it('throws if retrieve method returns null', async () => {
      const rel = new NullableRelation<number, Invoice>('invoiceId', () =>
        Promise.resolve(null)
      );
      rel.initKey(11);
      await expect(() => rel.getItem(ctx)).rejects.toThrow(
        'Repository did not return a record'
      );
    });
  });
});

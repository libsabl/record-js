// Copyright 2022 Joshua Honig. All rights reserved.
// Use of this source code is governed by a MIT
// license that can be found in the LICENSE file.

/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Context, IContext } from '@sabl/context';
import { pause } from '$test/lib/pause';
import { CollectionRelation } from '$';
import { examples, Invoice, InvoiceLine } from './fixture';

describe('CollectionRelation', () => {
  describe('items', () => {
    it('returns cached items', () => {
      // Starts empty
      const rel = new CollectionRelation<Invoice, InvoiceLine>(null!);
      expect(rel.items).toBe(null);

      // Set collection
      const invoice = examples.invoice().mock();
      const items = [
        examples.invoiceLine().with({ invoice }).mock(),
        examples.invoiceLine().with({ invoice }).mock(),
      ];
      rel.setCollection(items);
      expect(rel.items).toEqual(items);

      // Clear
      rel.clear();
      expect(rel.items).toBe(null);
    });
  });

  describe('loaded', () => {
    it('indicates if items are loaded', () => {
      // Starts false
      const rel = new CollectionRelation<Invoice, InvoiceLine>(null!);
      expect(rel.loaded).toBe(false);

      // True after load
      const invoice = examples.invoice().mock();
      const items = [
        examples.invoiceLine().with({ invoice }).mock(),
        examples.invoiceLine().with({ invoice }).mock(),
      ];
      rel.setCollection(items);
      expect(rel.loaded).toBe(true);

      // False if cleared
      rel.clear();
      expect(rel.loaded).toBe(false);
    });

    it('is true for empty but non-null collection', () => {
      const rel = new CollectionRelation<Invoice, InvoiceLine>(null!);
      rel.setCollection([]);
      expect(rel.loaded).toBe(true);
    });
  });

  describe('getItems', () => {
    function getLines(
      ctx: IContext,
      invoice: Invoice
    ): Promise<Iterable<InvoiceLine>> {
      return Promise.resolve([
        examples.invoiceLine().with({ invoice }).mock(),
        examples.invoiceLine().with({ invoice }).mock(),
      ]);
    }

    const ctx = Context.background;

    it('retrieves and caches items', async () => {
      const rel = new CollectionRelation<Invoice, InvoiceLine>(getLines);
      const invoice = examples.invoice().mock();

      // Retrieves items
      const items = await rel.getItems(ctx, invoice);

      // Also caches
      expect(rel.items).toBe(items);

      // Asking again returns same collection
      const items2 = await rel.getItems(ctx, invoice);
      expect(items2).toBe(items);
    });

    it('waits for single promise to resolve', async () => {
      async function getLinesDelay(
        ctx: IContext,
        invoice: Invoice
      ): Promise<Iterable<InvoiceLine>> {
        await pause(10);
        return getLines(ctx, invoice);
      }

      const rel = new CollectionRelation<Invoice, InvoiceLine>(getLinesDelay);
      const invoice = examples.invoice().mock();

      const p1 = rel.getItems(ctx, invoice);
      const p2 = rel.getItems(ctx, invoice);
      const p3 = rel.getItems(ctx, invoice);

      const [items1, items2, items3] = await Promise.all([p1, p2, p3]);
      expect(items2).toEqual(items1);
      expect(items3).toEqual(items1);
    });
  });

  describe('appendItem', () => {
    it('does nothing if not cached', () => {
      const rel = new CollectionRelation<Invoice, InvoiceLine>(null!);
      const il = examples.invoiceLine().mock();
      rel.appendItem(il);
      expect(rel.items).toBe(null);
    });

    it('appends if cached', () => {
      const rel = new CollectionRelation<Invoice, InvoiceLine>(null!);
      const il1 = examples.invoiceLine().mock();
      rel.setCollection([il1]);

      const il2 = examples.invoiceLine().mock();
      rel.appendItem(il2);
      expect(rel.items).toEqual([il1, il2]);
    });
  });

  describe('removeItem', () => {
    it('does nothing if not cached', () => {
      const rel = new CollectionRelation<Invoice, InvoiceLine>(null!);
      const il = examples.invoiceLine().mock();
      rel.removeItem(il);
      expect(rel.items).toBe(null);
    });

    it('removes item from cached list', () => {
      const rel = new CollectionRelation<Invoice, InvoiceLine>(null!);
      const il1 = examples.invoiceLine().mock();
      const il2 = examples.invoiceLine().mock();
      rel.setCollection([il1, il2]);

      rel.removeItem(il1);

      expect(rel.items).toEqual([il2]);
    });

    it('removes item with same id', () => {
      const rel = new CollectionRelation<Invoice, InvoiceLine>(null!);

      const ex1 = examples.invoiceLine();
      const il1 = ex1.mock();

      const il2 = examples.invoiceLine().mock();
      rel.setCollection([il1, il2]);

      const il1_copy = ex1.mock();
      rel.removeItem(il1_copy);

      expect(rel.items).toEqual([il2]);
    });

    it('ignores item not in list', () => {
      const rel = new CollectionRelation<Invoice, InvoiceLine>(null!);
      const il1 = examples.invoiceLine().mock();
      const il2 = examples.invoiceLine().mock();
      rel.setCollection([il1, il2]);

      const il3 = examples.invoiceLine().mock();

      rel.removeItem(il3);

      expect(rel.items).toEqual([il1, il2]);
    });
  });
});

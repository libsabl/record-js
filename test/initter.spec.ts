import { Thing } from './fixtures/thing';

describe('Initter', () => {
  describe('init', () => {
    it('allows assignment to null', () => {
      const t = new Thing();
      t.init.load({
        id: 23,
        name: 'hello',
        data: Uint8Array.from([23, 2, 99]),
        numbers: [9, 1, 1212],
      });

      expect(t.id).toBe(23);
      expect(t.name).toBe('hello');
      expect(t.data).toEqual(Uint8Array.from([23, 2, 99]));
      expect(t.numbers).toEqual([9, 1, 1212]);
    });
  });
});

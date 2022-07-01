import { initScalar, isDefault } from '$';
import { Thing } from './fixtures/thing';

describe('Initter', () => {
  describe('isDefault', () => {
    it('returns true for null', () => {
      expect(isDefault(null)).toBe(true);
    });

    it('returns false for 0, false, 0n', () => {
      for (const v of [0, false, 0n]) {
        expect(isDefault(v)).toBe(true);
      }
    });

    it('returns false for other values', () => {
      for (const v of ['', 'hi', 2, true, 1n, new Date(), { a: 'b' }]) {
        expect(isDefault(v)).toBe(false);
      }
    });
  });

  describe('initScalar', () => {
    it('allows assignment to null', () => {
      const result = initScalar(null, 2, 'id');
      expect(result).toBe(2);
    });

    it('allows assignment to default', () => {
      for (const cs of [
        [0, 2],
        [false, true],
        [0n, 323n],
      ]) {
        const [current, newVal] = cs;
        const result = initScalar(current, newVal, 'prop');
        expect(result).toBe(newVal);
      }
    });

    it('rejects same value', () => {
      for (const v of [1, 'hello', 43n]) {
        expect(() => initScalar(v, v, 'prop')).toThrow(/already initialized/);
      }
    });

    it('rejects new value', () => {
      for (const cs of [
        [1, 2],
        [true, false],
        [1n, 2n],
        ['a', 'b'],
      ]) {
        const [current, newVal] = cs;
        expect(() => initScalar(current, newVal, 'prop')).toThrow(
          /already initialized/
        );
      }
    });

    it('allows same value with flag', () => {
      for (const v of [1, 'hello', 43n]) {
        const result = initScalar(v, v, 'prop', true);
        expect(result).toBe(v);
      }
    });

    it('includes field name in message and prop', () => {
      let e: Error | null = null;
      try {
        initScalar(1, 2, 'someProp');
      } catch (err) {
        e = <Error>err;
      }

      if (e == null) throw new Error();

      expect(e.message).toContain('someProp');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((<any>e).fieldName).toEqual('someProp');
    });
  });
});

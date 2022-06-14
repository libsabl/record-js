/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { initArray, initScalar, RecordError, RecordOf } from '$';

export class Thing implements RecordOf<number> {
  static readonly typeName = 'example:thing';

  /** Initializer for Thing */
  static readonly #Initter = class Initter {
    readonly #record: Thing;
    constructor(record: Thing) {
      this.#record = record;
    }

    load(
      data: {
        id: number;
        name: string;
        data: Uint8Array;
        numbers: number[];
      },
      refresh = false
    ) {
      const r = this.#record;
      if (refresh) {
        if (data.id !== r.#id) {
          throw new RecordError(RecordError.WRONG_RECORD);
        }
        r.name = data.name;
        r.#data = data.data;
        r.#numbers = data.numbers;
      } else {
        r.#id = initScalar(r.#id, data.id, 'id');
        r.name = initScalar(r.name, data.name, 'name');
        r.#data = initArray(r.#data, data.data, 'data');
        r.#numbers = initArray(r.#numbers, data.numbers, 'numbers');
      }
    }
  };

  readonly #initter = new Thing.#Initter(this);

  getKey(): number {
    return this.#id;
  }

  getType(): string {
    return Thing.typeName;
  }

  /** Initializer APIs for this record */
  get init() {
    return this.#initter;
  }

  #id: number = null!;
  /** id [read-only] */
  get id() {
    return this.#id;
  }

  name: string = null!;

  #data: Uint8Array = null!;
  /** data [protected-set] */
  get data() {
    return this.#data;
  }

  #numbers: number[] = null!;
  /** numbers [protected-set] */
  get numbers() {
    return this.#numbers;
  }

  setData(data: Uint8Array) {
    this.#data = data;
  }

  setNumbers(numbers: number[]) {
    this.#numbers = numbers;
  }
}

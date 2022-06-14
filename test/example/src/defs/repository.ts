import { EComAdapters } from './ecom';

/** The root model adapter interface for the example application */
export interface Repository {
  get ecom(): EComAdapters;
}

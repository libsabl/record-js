import { Repository } from '$defs/repository';
import { EComAdapters } from '$defs/ecom';

export { Repository };

/** A base class for individual model adapters */
export class AdapterBase<TRepo extends Repository> {
  protected readonly root: TRepo;
  protected constructor(root: TRepo) {
    this.root = root;
  }
}

/** A generic repository implementation that implements lazy loading for individual adapters */
export abstract class RepositoryBase<TRepo extends Repository>
  implements Repository
{
  protected abstract get self(): TRepo;

  //#region ecom
  protected abstract buildECom(root: TRepo): EComAdapters;
  #ecom: EComAdapters | null = null;
  get ecom(): EComAdapters {
    if (this.#ecom == null) {
      this.#ecom = this.buildECom(this.self);
    }
    return this.#ecom;
  }
  //#endregion
}

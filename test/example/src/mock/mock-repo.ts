import { EComAdapters } from '$defs/ecom';
import { RepositoryBase } from '$ex/model/repository';
import { MockEComAdapters } from './ecom/mock-adapters';

export class MockRepo extends RepositoryBase<MockRepo> {
  protected get self(): MockRepo {
    return this;
  }
  protected buildECom(root: MockRepo): EComAdapters {
    return new MockEComAdapters(root);
  }
}

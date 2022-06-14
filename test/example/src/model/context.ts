import { IContext, Context, withValue } from '@sabl/context';
import { Maybe } from '@sabl/context/dist/context';
import { Repository } from '$defs/repository';

const ctxKeyRepo = Symbol('repo');

export function withRepo(ctx: IContext, repo: Repository): Context {
  return withValue(ctx, ctxKeyRepo, repo);
}

export function getRepo(ctx: IContext): Maybe<Repository> {
  return <Maybe<Repository>>ctx.value(ctxKeyRepo);
}

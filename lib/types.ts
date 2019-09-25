export interface GeneratedFieldTemplate<F> {
  generator: () => F;
}

export function isGenerated<F, T extends Template<F>>(
  fieldTemplate: FieldTemplate<F, T>
): fieldTemplate is GeneratedFieldTemplate<F> {
  return (fieldTemplate as GeneratedFieldTemplate<F>).generator !== undefined;
}

export interface DefaultFieldTemplate<F> {
  default: F;
}

export function isDefault<F, T extends Template<F>>(
  fieldTemplate: FieldTemplate<F, T>
): fieldTemplate is DefaultFieldTemplate<F> {
  return (fieldTemplate as DefaultFieldTemplate<F>).default !== undefined;
}

export interface NestedFieldTemplate<F, T extends Template<F>> {
  nested: BuilderClass<F, T>;
}

export function isNested<F, T extends Template<F>>(
  fieldTemplate: FieldTemplate<F, T>
): fieldTemplate is NestedFieldTemplate<F, T> {
  return (fieldTemplate as NestedFieldTemplate<F, T>).nested !== undefined;
}

export interface PluralFieldTemplate {
  plural: true;
}

export function isPlural<F, T extends Template<F>>(
  fieldTemplate: FieldTemplate<F, T>
): fieldTemplate is PluralFieldTemplate {
  return (fieldTemplate as PluralFieldTemplate).plural === true;
}

export type Element<A> = A extends (infer E)[] ? E : never;

export type FieldTemplate<F, T extends Template<F>> =
  | GeneratedFieldTemplate<F>
  | DefaultFieldTemplate<F>
  | NestedFieldTemplate<F, T>
  | PluralFieldTemplate
  | (PluralFieldTemplate & GeneratedFieldTemplate<F>)
  | (PluralFieldTemplate & DefaultFieldTemplate<F>)
  | (PluralFieldTemplate & NestedFieldTemplate<F, T>);

export type Template<R> = {
  [P in keyof R]-?: FieldTemplate<R[P], Template<R[P]>>;
};

type ScalarSetterFn<F, Self> = (value: F) => Self;

type ScalarAdderFn<E, Self> = (value: E) => Self;

type NestedSetterFn<F, T extends Template<F>, Self> = (
  block: (builder: Builder<F, T>) => any
) => Self;

type NestedAdderFn<E, T extends Template<E>, Self> = (
  block: (builder: Builder<E, T>) => any
) => Self;

type SingularSetterFn<F, T, Self> = T extends NestedFieldTemplate<
  infer SF,
  infer ST
>
  ? NestedSetterFn<SF, ST, Self>
  : ScalarSetterFn<F, Self>;

type PluralSetterFn<F, T, Self> = (T extends NestedFieldTemplate<
  infer SE,
  infer ST
>
  ? {add: NestedAdderFn<SE, ST, Self>}
  : {add: ScalarAdderFn<Element<F>, Self>}) &
  ScalarSetterFn<F, Self>;

type SetterFn<F, T, Self> = T extends PluralFieldTemplate
  ? PluralSetterFn<F, T, Self>
  : SingularSetterFn<F, T, Self>;

export type Builder<R, T extends Template<R>> = {
  readonly [P in keyof R]-?: SetterFn<R[P], T[P], Builder<R, T>>;
} & {
  build(): R;
};

export type BuilderClass<R, T extends Template<R>> = {
  new (): Builder<R, T>;
};

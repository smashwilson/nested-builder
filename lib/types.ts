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

export type FieldTemplate<F, T extends Template<F>> =
  | GeneratedFieldTemplate<F>
  | DefaultFieldTemplate<F>
  | NestedFieldTemplate<F, T>;

export type Template<R> = {
  [P in keyof R]-?: FieldTemplate<R[P], Template<R[P]>>;
};

type ScalarSetterFn<F, Self> = (value: F) => Self;

type NestedSetterFn<F, T extends Template<F>, Self> = (
  block: (builder: Builder<F, T>) => any
) => Self;

type SetterFn<F, T, Self> = T extends NestedFieldTemplate<infer SF, infer ST>
  ? NestedSetterFn<SF, ST, Self>
  : ScalarSetterFn<F, Self>;

export type Builder<R, T extends Template<R>> = {
  [P in keyof R]-?: SetterFn<R[P], T[P], Builder<R, T>>;
} & {
  build(): R;
};

export type BuilderClass<R, T extends Template<R>> = {
  new (): Builder<R, T>;
};

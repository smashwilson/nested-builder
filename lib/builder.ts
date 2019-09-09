import {Template, Builder, isGenerated, isDefault, isNested} from "./types";

export abstract class BuilderBase<R> {
  private underConstruction: Partial<R>;

  constructor(private template: Template<R>) {
    this.underConstruction = {};
  }

  build(): R {
    // Populate any missing fields.
    for (const fieldName in this.template) {
      if (!(fieldName in this.underConstruction)) {
        const fieldTemplate = this.template[fieldName];
        if (isDefault(fieldTemplate)) {
          this.underConstruction[fieldName] = fieldTemplate.default;
        } else if (isGenerated(fieldTemplate)) {
          this.underConstruction[fieldName] = fieldTemplate.generator();
        } else if (isNested(fieldTemplate)) {
          const builder = new fieldTemplate.nested();
          this.underConstruction[fieldName] = builder.build();
        }
      }
    }

    return this.underConstruction as R;
  }

  protected setScalar<F extends keyof R>(fieldName: F, value: R[F]): this {
    this.underConstruction[fieldName] = value;
    return this;
  }

  protected setNested<
    F extends keyof R,
    B extends Builder<R[F], Template<R[F]>>
  >(fieldName: F, builder: B, block: (builder: B) => any): this {
    block(builder);
    this.underConstruction[fieldName] = builder.build();
    return this;
  }
}

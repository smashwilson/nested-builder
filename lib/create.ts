import {Template, Builder, BuilderClass, isNested, isPlural} from "./types";
import {BuilderBase} from "./builder";

export function createBuilderClass<R>() {
  return <T extends Template<R>>(template: T): BuilderClass<R, T> => {
    const DynamicBuilder: BuilderClass<R, T> = class extends BuilderBase<R> {
      constructor() {
        super(template);
      }
    } as any;

    function defineScalarSetter<F, N extends keyof T>(fieldName: N) {
      DynamicBuilder.prototype[fieldName] = function (value: F) {
        return this.setScalar(fieldName, value);
      };
    }

    function defineScalarAdder<E, N extends keyof T>(fieldName: N) {
      Object.defineProperty(DynamicBuilder.prototype, fieldName, {
        get() {
          const fn = (elements: E[]) => this.setScalar(fieldName, elements);
          fn.add = (element: E) => this.addScalar(fieldName, element);
          return fn;
        },
      });
    }

    function defineNestedSetter<F, N extends keyof T>(
      fieldName: N,
      builderClass: BuilderClass<F, Template<F>>
    ) {
      DynamicBuilder.prototype[fieldName] = function (
        block: (builder: Builder<F, Template<F>>) => any
      ) {
        const builder = new builderClass();
        return this.setNested(fieldName, builder, block);
      };
    }

    function defineNestedAdder<E, N extends keyof T>(
      fieldName: N,
      builderClass: BuilderClass<E, Template<E>>
    ) {
      Object.defineProperty(DynamicBuilder.prototype, fieldName, {
        get() {
          const fn = (elements: E[]) => this.setScalar(fieldName, elements);
          fn.add = (
            block: (builder: InstanceType<BuilderClass<E, Template<E>>>) => any
          ) => {
            const builder = new builderClass();
            return this.addNested(fieldName, builder, block);
          };
          return fn;
        },
      });
    }

    for (const fieldName in template) {
      const fieldTemplate = template[fieldName];
      if (isPlural(fieldTemplate)) {
        if (isNested(fieldTemplate)) {
          defineNestedAdder(fieldName, fieldTemplate.nested);
        } else {
          defineScalarAdder(fieldName);
        }
      } else if (isNested(fieldTemplate)) {
        defineNestedSetter(fieldName, fieldTemplate.nested);
      } else {
        defineScalarSetter(fieldName);
      }
    }

    return DynamicBuilder;
  };
}

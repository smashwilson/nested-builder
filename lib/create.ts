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
      DynamicBuilder.prototype[fieldName] = function(value: F) {
        return this.setScalar(fieldName, value);
      };
    }

    function defineScalarAdder<E, N extends keyof T>(fieldName: N) {
      DynamicBuilder.prototype[fieldName].add = function(element: E) {
        return this.addScalar(element);
      };
    }

    function defineNestedSetter<F, N extends keyof T>(
      fieldName: N,
      builderClass: BuilderClass<F, Template<F>>
    ) {
      DynamicBuilder.prototype[fieldName] = function(
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
      DynamicBuilder.prototype[fieldName] = function(
        block: (builder: Builder<E, Template<E>>) => any
      ) {
        const builder = new builderClass();
        return this.addNested(fieldName, builder, block);
      };
    }

    for (const fieldName in template) {
      const fieldTemplate = template[fieldName];
      if (isPlural(fieldTemplate)) {
        if (isNested(fieldTemplate)) {
          defineScalarSetter(fieldName);
          defineNestedAdder(fieldName, fieldTemplate.nested);
        } else {
          defineScalarSetter(fieldName);
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

import {assert} from "chai";

import {createBuilderClass} from "../lib/index";

interface IGrandChild {
  zero: string;
  one?: number;
}

interface IChild {
  two: IGrandChild;
  three?: IGrandChild;
  four: boolean;
}

interface IParent {
  five: number[];
  six: IChild;
}

describe("nested types", function() {
  const GrandChildBuilder = createBuilderClass<IGrandChild>()({
    zero: {generator: () => "zero"},
    one: {default: undefined},
  });

  function generateGrandChild(): IGrandChild {
    return {
      zero: "generateGrandChild: zero",
      one: 100,
    };
  }

  const ChildBuilder = createBuilderClass<IChild>()({
    two: {nested: GrandChildBuilder, generator: generateGrandChild},
    three: {nested: GrandChildBuilder, default: undefined},
    four: {default: false},
  });

  const ParentBuilder = createBuilderClass<IParent>()({
    five: {default: []},
    six: {nested: ChildBuilder},
  });

  it("provides a nested builder", function() {
    const instance = new ParentBuilder()
      .six(cb => {
        cb.two(gcb => {
          gcb.zero("provided-zero");
        });
        cb.three(gcb => {
          gcb.one(1000);
        });
      })
      .build();

    assert.deepEqual(instance, {
      five: [],
      six: {
        two: {
          zero: "provided-zero",
        },
        three: {
          zero: "zero",
          one: 1000,
        },
        four: false,
      },
    });
  });

  it("uses a flat default value");

  it("uses a generated default value");

  it("uses the nested builder's defaults");
});

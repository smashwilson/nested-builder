import {assert} from "chai";

import {createBuilderClass} from "../lib/index";

interface IGrandChild {
  gc0: string;
  gc1?: number;
}

interface IChild {
  c0: IGrandChild;
  c1?: IGrandChild;
  c2: boolean;
}

interface IParent {
  p0: number[];
  p1: IChild;
}

describe("nested types", function () {
  const GrandChildBuilder = createBuilderClass<IGrandChild>()({
    gc0: {generator: () => "zero"},
    gc1: {default: undefined},
  });

  function generateGrandChild(): IGrandChild {
    return {
      gc0: "generateGrandChild: zero",
      gc1: 100,
    };
  }

  const ChildBuilder = createBuilderClass<IChild>()({
    c0: {nested: GrandChildBuilder, generator: generateGrandChild},
    c1: {nested: GrandChildBuilder, default: {gc0: "flat-zero", gc1: 111}},
    c2: {default: false},
  });

  const ParentBuilder = createBuilderClass<IParent>()({
    p0: {default: []},
    p1: {nested: ChildBuilder},
  });

  it("provides a nested builder", function () {
    const instance = new ParentBuilder()
      .p1((cb) => {
        cb.c0((gcb) => {
          gcb.gc0("provided-zero");
        });
        cb.c1((gcb) => {
          gcb.gc1(1000);
        });
      })
      .build();

    assert.deepEqual(instance, {
      p0: [],
      p1: {
        c0: {
          gc0: "provided-zero",
        },
        c1: {
          gc0: "zero",
          gc1: 1000,
        },
        c2: false,
      },
    });
  });

  it("uses a flat default value", function () {
    const instance = new ParentBuilder().build();
    assert.deepEqual(instance.p1.c1, {gc0: "flat-zero", gc1: 111});
  });

  it("uses a generated default value", function () {
    const instance = new ParentBuilder().build();
    assert.deepEqual(instance.p1.c0, {
      gc0: "generateGrandChild: zero",
      gc1: 100,
    });
  });

  it("uses the nested builder's defaults", function () {
    const instance = new ParentBuilder().build();
    assert.deepEqual(instance.p1, {
      c0: {
        gc0: "generateGrandChild: zero",
        gc1: 100,
      },
      c1: {
        gc0: "flat-zero",
        gc1: 111,
      },
      c2: false,
    });
  });

  describe("plural fields", function () {
    interface IPlural {
      children: IGrandChild[];
    }

    const PluralBuilder = createBuilderClass<IPlural>()({
      children: {plural: true, nested: GrandChildBuilder},
    });

    it("implicitly defaults to []", function () {
      const instance = new PluralBuilder().build();

      assert.deepEqual(instance, {children: []});
    });

    it("may be constructed iteratively with .add", function () {
      const instance = new PluralBuilder().children
        .add((gcb) => gcb.gc0("zero").gc1(0))
        .children.add((gcb) => gcb.gc0("one").gc1(1))
        .build();

      assert.deepEqual(instance, {
        children: [
          {gc0: "zero", gc1: 0},
          {gc0: "one", gc1: 1},
        ],
      });
    });
  });
});

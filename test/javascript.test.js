const {assert} = require("chai");

const {createBuilderClass} = require("../lib/index");

describe("JavaScript clients", function() {
  describe("with a simple type", function() {
    const SimpleBuilder = createBuilderClass()({
      aString: {default: "abc"},
      aNumber: {default: 123},
      aBoolean: {default: true},
      anArray: {generator: () => ["aa", "bb", "cc"]},
      aTuple: {default: [1, "b", false]},
    });

    it("builds an instance with provided values", function() {
      const instance = new SimpleBuilder()
        .aString("def")
        .aNumber(456)
        .aBoolean(false)
        .anArray(["zz", "yy", "xx"])
        .aTuple([2, "a", true])
        .build();

      assert.deepEqual(instance, {
        aString: "def",
        aNumber: 456,
        aBoolean: false,
        anArray: ["zz", "yy", "xx"],
        aTuple: [2, "a", true],
      });
    });

    it("builds an instance with default values", function() {
      const instance = new SimpleBuilder().build();

      assert.deepEqual(instance, {
        aString: "abc",
        aNumber: 123,
        aBoolean: true,
        anArray: ["aa", "bb", "cc"],
        aTuple: [1, "b", false],
      });
    });
  });

  describe("plural fields", function() {
    const PluralBuilder = createBuilderClass()({
      pluralScalar: {plural: true},
      pluralNested: {plural: true, nested: SimpleBuilder},
    });

    it("implicitly defaults to []", function() {
      const instance = new PluralBuilder().build();

      assert.deepEqual(instance, {
        pluralScalar: [],
        pluralNested: [],
      });
    });

    it("may be set all at once with a bulk setter", function() {
      const instance = new PluralBuilder().pluralScalar([1, 2, 3]).build();

      assert.deepEqual(instance, {
        pluralScalar: [1, 2, 3],
        pluralNested: [],
      });
    });

    it("may be constructed iteratively with .add", function() {
      const instance = new PluralBuilder().pluralScalar
        .add(10)
        .pluralScalar.add(20)
        .pluralNested.add(sb => sb.aString("zero"))
        .pluralNested.add(sb => sb.aString("one"))
        .build();

      assert.deepEqual(instance, {
        pluralScalar: [10, 20],
        pluralNested: [
          {
            aString: "zero",
            aNumber: 123,
            aBoolean: true,
            anArray: ["aa", "bb", "cc"],
            aTuple: [1, "b", false],
          },
          {
            aString: "one",
            aNumber: 123,
            aBoolean: true,
            anArray: ["aa", "bb", "cc"],
            aTuple: [1, "b", false],
          },
        ],
      });
    });
  });
});

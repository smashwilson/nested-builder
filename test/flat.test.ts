import {assert} from "chai";

import {createBuilderClass} from "../lib/index";

interface ISimple {
  aString: string;
  aNumber: number;
  aBoolean: boolean;
  anArray: string[];
  aTuple: [number, string, boolean];
}

describe("simple types", function() {
  describe("with static default values", function() {
    const SimpleBuilder = createBuilderClass<ISimple>()({
      aString: {default: "abc"},
      aNumber: {default: 123},
      aBoolean: {default: true},
      anArray: {default: ["aa", "bb", "cc"]},
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

    it("uses specified default values for unprovided values", function() {
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

  describe("with generated default values", function() {
    const SimpleBuilder = createBuilderClass<ISimple>()({
      aString: {generator: () => "dynamic string"},
      aNumber: {generator: () => 456},
      aBoolean: {generator: () => true},
      anArray: {generator: () => []},
      aTuple: {generator: () => [10, "zz", false]},
    });

    it("builds an instance with provided fields", function() {
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

    it("uses the generator for unprovided fields", function() {
      const instance = new SimpleBuilder().build();

      assert.deepEqual(instance, {
        aString: "dynamic string",
        aNumber: 456,
        aBoolean: true,
        anArray: [],
        aTuple: [10, "zz", false],
      });
    });
  });
});

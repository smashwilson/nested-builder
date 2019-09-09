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
  describe("with a fully specified builder", function() {
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
        aTuple: [2, "b", false],
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

  describe("with an automatic builder", function() {
    it("defaults optional fields to undefined or null");

    it("defaults optional arrays to the empty array");

    it("defaults to generating random values for unspecified fields");
  });

  describe("with a partially specified builder", function() {
    it("respects specified field defaults");

    it("uses random values for unspecified fields");
  });
});

const {assert} = require("chai");

const {createBuilderClass} = require("../lib/index");

describe("JavaScript clients", function() {
  describe("with a simple type", function() {
    const SimpleBuilder = createBuilderClass({
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
});

import {assert} from "chai";

import {placeholder} from "../lib/index";

describe("placeholder", function() {
  it("works", function() {
    assert.strictEqual(placeholder(), "works");
  });
});

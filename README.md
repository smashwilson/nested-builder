# Nested builder

When you're testing code that hits an external service, you'll frequently find yourself needing to construct fixture data that's deeply nested. Often, you'll need "valid" data for the full response, but only a small portion of it will be relevant to each specific test. This obfuscates which fields actually _are_ relevant, making the tests harder to read and maintain.

```js
const nock = require("nock");
const {assert} = require("chai");

describe("ComponentUnderTest", function() {
  it("uses the string field", async function() {
    nock("https://api.example.com")
      .get("/resource")
      .reply(200, {
        stringField: "important",
        intField: 0,
      });

    const component = new ComponentUnderTest();
    await component.makeCall();

    assert.strictEqual(component.getState(), "saw the 'important' string");
  });

  it("uses the number field", async function() {
    nock("https://api.example.com")
      .get("/resource")
      .reply(200, {
        stringField: "irrelevant",
        intField: 100,
      });

    const component = new ComponentUnderTest();
    await component.makeCall();

    assert.strictEqual(component.getDoubledInt(), 200);
  });
});
```

This can quickly get out of hand, especially if response structures are deeply nested, like GraphQL responses. What happens when a field is added or removed?

This package provides the tools to create _builder classes_ that can be used to tersely construct partially specified, deeply nested object structures.

```js
const nock = require("nock");
const {assert} = require("chai");
const {createBuilderClass} = require("nested-builder");

const ResponseBuilder = createBuilderClass()({
  stringField: {default: "irrelevant"},
  intField: {generator: () => Math.random()},
});

describe("ComponentUnderTest", function() {
  it("uses the string field", async function() {
    const r = new ResponseBuilder().stringField("important").build();

    nock("https://api.example.com")
      .get("/resource")
      .reply(200, response);

    const component = new ComponentUnderTest();
    await component.makeCall();

    assert.strictEqual(component.getState(), "saw the 'important' string");
  });

  it("uses the number field", async function() {
    const r = new ResponseBuilder().intField(100).build();

    nock("https://api.example.com")
      .get("/resource")
      .reply(200, r);

    const component = new ComponentUnderTest();
    await component.makeCall();

    assert.strictEqual(component.getDoubledInt(), 200);
  });
});
```

If you're using TypeScript, builder templates are fully type-checked - each template must specify exactly the same fields as the constructed type, and generated and default values must be of the appropriate kinds.

## Installation

Install as a devDependency from npm:

```sh
npm install -D nested-builder
```

## Use

The primary entry point is the `createBuilderClass` function. Use it to construct a builder class by providing a template that describes how to construct unprovided fields.

```ts
const ResponseBuilder = createBuilderClass<Response>()({
  fieldZero: {default: 123},
  fieldOne: {generator: generateRandomString},
  fieldTwo: {nested: OtherBuilderClass},
});
```

Instantiate the builder and use setter methods named after the templated fields to construct only the parts of the object you care about:

```ts
const instance = new ResponseBuilder().fieldZero(456).build();

assert.strictEqual(instance.fieldZero, 456);
```

Setters that correspond to _nested_ field accept a block, which is passed an instance of the appropriate sub-builder:

```ts
const instance = new ResponseBuilder()
  .fieldTwo(b => {
    b.otherFieldZero(0);
    b.otherFieldOne(true);
  })
  .build();

assert.strictEqual(instance.fieldTwo.otherFieldZero, 0);
assert.isTrue(instance.fieldTwo.otherFieldOne);
```

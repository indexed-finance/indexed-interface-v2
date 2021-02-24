import reducer from "./slice";

describe("Features/Interactions/Burn", () => {
  it("should be empty by default", () => {
    const state = reducer(undefined, { type: "" });

    expect(state.input.amount).toEqual("");
    expect(state.input.token).toEqual("");
  });
});

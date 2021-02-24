/// <reference types="cypress" />

context("Features: Swap", () => {
  beforeEach(() => {
    cy.visit("/swap");
  });

  describe("Loading", () => {
    it("should load inside the layout", () =>
      cy.grab("layout").should("be.visible"));
  });
});

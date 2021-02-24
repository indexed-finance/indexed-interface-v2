/// <reference types="cypress" />

context("Features: Burn", () => {
  beforeEach(() => {
    cy.visit("/burn");
  });

  describe("Loading", () => {
    it("should load inside the layout", () =>
      cy.grab("layout").should("be.visible"));
  });
});

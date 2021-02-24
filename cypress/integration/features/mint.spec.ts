/// <reference types="cypress" />

context("Features: Mint", () => {
  beforeEach(() => {
    cy.visit("/mint");
  });

  describe("Loading", () => {
    it("should load inside the layout", () =>
      cy.grab("layout").should("be.visible"));
  });
});

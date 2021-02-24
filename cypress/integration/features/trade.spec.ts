/// <reference types="cypress" />

context("Features: Trade", () => {
  beforeEach(() => {
    cy.visit("/trade");
  });

  describe("Loading", () => {
    it("should load inside the layout", () =>
      cy.grab("layout").should("be.visible"));
  });
});

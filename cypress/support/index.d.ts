declare namespace Cypress {
  interface Chainable {
    grab(id: string): Chainable<Element>;
  }
}

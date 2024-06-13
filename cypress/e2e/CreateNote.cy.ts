// cypress/integration/CreateNoteButton.spec.js
describe('CreateNoteButton', () => {
  it('should prompt the user for a note name and send a POST request', () => {
    // Visit the page that contains your component
    cy.visit('/');

    // Stub the window.prompt function
    cy.window().then((win) => {
      cy.stub(win, 'prompt').returns('Test note');
    });

    // Stub the fetch function
    cy.window().then((win) => {
      cy.stub(win, 'fetch').resolves({
        ok: true,
        json: () => Promise.resolve({}),
      });
    });

    // Click the button
    cy.get('button').contains('Create Note').click();

    // Check that the fetch function was called with the right arguments
    cy.window().its('fetch').should('be.calledWith', '/api/notes/new', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test note' }),
    });
  });
});

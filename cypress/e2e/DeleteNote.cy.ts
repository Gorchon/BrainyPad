describe('NotePreview', () => {
  it('should send a DELETE request when the delete button is clicked', () => {
    // Visit the page that contains your component
    cy.visit('/');

    // Stub the fetch function
    cy.window().then((win) => {
      cy.stub(win, 'fetch').resolves({
        ok: true,
        json: () => Promise.resolve({}),
      });
    });

    // Click the delete button
    cy.get('.delete-button').click();

    // Check that the fetch function was called with the right arguments
    cy.window().its('fetch').should('be.calledWith', '/api/file/1', {
      method: 'DELETE',
    });
  });
});

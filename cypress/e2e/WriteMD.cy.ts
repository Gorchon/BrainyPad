describe('MKEditor', () => {
  it('should update the content when the user types into the editor', () => {
    // Visit the page that contains your component
    cy.visit('/notes/2f48cb88-dacb-4233-9ea1-05d3ad3089c5?title=Hola');

    // Type into the editor
    cy.get('.ProseMirror').type('Hello, world!');

    // Click the save button
    cy.get('button').contains('Save').click();

    // Check that the fetch function was called with the right arguments
    cy.window().its('fetch').should('be.calledWith', '/api/notes/update', {
      method: 'POST',
      body: JSON.stringify({ id: '2f48cb88-dacb-4233-9ea1-05d3ad3089c5', content: 'Hello, world!' }),
    });
  });
});

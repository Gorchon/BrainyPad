describe('Darkmode check', function() {
  it('Change to dark mode and return to light mode', function() {
    // Visita la página principal
    cy.visit('http://localhost:4321')

    // Haz clic en el botón de cambio de modo
    cy.get('button').click()

    // Verifica que el modo oscuro se ha activado
    cy.get('html').should('have.class', 'dark')

    // Haz clic nuevamente en el botón de cambio de modo
    cy.get('button').click()

    // Verifica que el modo claro se ha activado
    cy.get('html').should('not.have.class', 'dark')
  })
})

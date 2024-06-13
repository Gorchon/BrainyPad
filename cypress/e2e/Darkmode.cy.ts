describe('Dark mode toggle test', function() {
  it('Toggles to dark mode and back to light mode correctly', function() {
    cy.visit('https://brainypad-deploy.vercel.app/')
    cy.get('button').click()
    cy.get('html').should('have.class', 'dark')
    cy.get('button').click()
    cy.get('html').should('not.have.class', 'dark')
  })
})

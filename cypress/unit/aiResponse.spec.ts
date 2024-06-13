import { makeAIResponse } from "../../src/pages/api/search";

describe('makeAIResponse', () => {
  it('should parse the OpenAI response correctly', () => {
    // Mock the OpenAI API
    cy.spy(openai.chat.completions, 'create').resolves({
      choices: [
        {
          message: {
            content: JSON.stringify({
              response: 'Test response',
              fileId: 'Test file ID'
            })
          }
        }
      ]
    });

    // Call the function with test data
    makeAIResponse('Test query', 'Test context').then((result) => {
      // Verify the result
      expect(result).to.deep.equal({
        response: 'Test response',
        fileId: 'Test file ID'
      });
    });
  });
});

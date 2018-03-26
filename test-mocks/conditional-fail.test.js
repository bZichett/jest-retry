describe('mocks/conditional-fail', async () => {
  it('conditionally fails', async () => {
    if (!process.env.SKIP) expect(true).toBe(false);
  });
});

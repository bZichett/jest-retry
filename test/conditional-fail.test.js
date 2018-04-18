describe('mocks/conditional-fail', async () => {
  it('conditionally fails 11', async () => {
    expect(true).toBe(true);
  });

  it('conditionally fails', async () => {
    if (!process.env.SKIP) expect(true).toBe(false);
  });
});

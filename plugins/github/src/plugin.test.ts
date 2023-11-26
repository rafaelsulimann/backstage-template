import { githubPlugin } from './plugin';

describe('github', () => {
  it('should export plugin', () => {
    expect(githubPlugin).toBeDefined();
  });
});

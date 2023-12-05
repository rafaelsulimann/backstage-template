import { createTemplateAction } from '@backstage/plugin-scaffolder-backend';

export const createGithubRepository = () => {
  return createTemplateAction<{
    repositoryName: string;
    repositoryUserToken: string;
  }>({
    id: 'github:create:repo',
    schema: {
      input: {
        required: ['repositoryName', 'repositoryUserToken'],
        type: 'object',
        properties: {
          repositoryName: {
            type: 'string',
            title: 'Repository ID',
            description: 'The ID of the repository.',
          },
          repositoryUserToken: {
            type: 'string',
            title: 'Repository User Token',
            description: 'The user token',
          },
        },
      },
    },

    async handler(ctx) {
      const { repositoryName, repositoryUserToken } = ctx.input;

      ctx.logger.info(`Repository Name ${repositoryName}`);
      ctx.logger.info(`Repository UserToken ${repositoryUserToken}`);
      const response = await fetch(`https://api.github.com/user/repos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${repositoryUserToken}`,
        },
        body: JSON.stringify({
          name: repositoryName,
          description: 'testezera',
          homepage: 'https://github.com',
          private: false,
          has_issues: true,
          has_projects: true,
          has_wiki: true,
        }),
      });

      const data = await response.json();

      if (response.status !== 200) {
        ctx.logger.error(`Erro ao criar repositório ${data}`);
        return data;
      }
      ctx.logger.info(`Repositório ${repositoryName} criado com sucesso!`);
      return data;
    },
  });
};

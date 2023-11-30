import { createTemplateAction } from '@backstage/plugin-scaffolder-backend';
import { Config } from '@backstage/config';
import { Octokit } from 'octokit';
import { InputError } from '@backstage/errors';
import {
  ScmIntegrationRegistry,
} from '@backstage/integration';
import {
  getOctokitOptions,
  initRepoPushAndProtect,
} from './github/helpers';
import { examples } from './examples';
import * as inputProps from './inputProperties';
import * as outputProps from './outputProperties';
import { parseRepoUrl } from './util';

export function commitSkeleton(options: {
  integrations: ScmIntegrationRegistry;
  config: Config;
}) {
  const { integrations, config} = options;

  return createTemplateAction<{
    remoteUrl: string,
    repoContentsUrl: string,
    repoUrl: string;
    description?: string;
    homepage?: string;
    access?: string;
    defaultBranch?: string;
    protectDefaultBranch?: boolean;
    protectEnforceAdmins?: boolean;
    deleteBranchOnMerge?: boolean;
    gitCommitMessage?: string;
    gitAuthorName?: string;
    gitAuthorEmail?: string;
    allowRebaseMerge?: boolean;
    allowSquashMerge?: boolean;
    squashMergeCommitTitle?: 'PR_TITLE' | 'COMMIT_OR_PR_TITLE';
    squashMergeCommitMessage?: 'PR_BODY' | 'COMMIT_MESSAGES' | 'BLANK';
    allowMergeCommit?: boolean;
    allowAutoMerge?: boolean;
    sourcePath?: string;
    bypassPullRequestAllowances?:
      | {
          users?: string[];
          teams?: string[];
          apps?: string[];
        }
      | undefined;
    requiredApprovingReviewCount?: number;
    restrictions?:
      | {
          users: string[];
          teams: string[];
          apps?: string[];
        }
      | undefined;
    requireCodeOwnerReviews?: boolean;
    dismissStaleReviews?: boolean;
    requiredStatusCheckContexts?: string[];
    requireBranchesToBeUpToDate?: boolean;
    requiredConversationResolution?: boolean;
    repoVisibility?: 'private' | 'internal' | 'public';
    collaborators?: Array<
      | {
          user: string;
          access: string;
        }
      | {
          team: string;
          access: string;
        }
      | {
          /** @deprecated This field is deprecated in favor of team */
          username: string;
          access: 'pull' | 'push' | 'admin' | 'maintain' | 'triage';
        }
    >;
    hasProjects?: boolean | undefined;
    hasWiki?: boolean | undefined;
    hasIssues?: boolean | undefined;
    token?: string;
    topics?: string[];
    repoVariables?: { [key: string]: string };
    secrets?: { [key: string]: string };
    requiredCommitSigning?: boolean;
  }>({
    id: 'rafael:commitSkeleton',
    description:
      'Initializes a git repository of contents in workspace and publishes it to GitHub.',
    examples,
    schema: {
      input: {
        type: 'object',
        required: ['repoUrl'],
        properties: {
          remoteUrl: {
            type: 'string',
            title: 'Remote URL',
            description: 'Remote URL',
          },
          repoContentsUrl: {
            type: 'string',
            title: 'Content',
            description: 'Content',
          },
          repoUrl: inputProps.repoUrl,
          description: inputProps.description,
          homepage: inputProps.homepage,
          access: inputProps.access,
          bypassPullRequestAllowances: inputProps.bypassPullRequestAllowances,
          requiredApprovingReviewCount: inputProps.requiredApprovingReviewCount,
          restrictions: inputProps.restrictions,
          requireCodeOwnerReviews: inputProps.requireCodeOwnerReviews,
          dismissStaleReviews: inputProps.dismissStaleReviews,
          requiredStatusCheckContexts: inputProps.requiredStatusCheckContexts,
          requireBranchesToBeUpToDate: inputProps.requireBranchesToBeUpToDate,
          requiredConversationResolution:
            inputProps.requiredConversationResolution,
          repoVisibility: inputProps.repoVisibility,
          defaultBranch: inputProps.defaultBranch,
          protectDefaultBranch: inputProps.protectDefaultBranch,
          protectEnforceAdmins: inputProps.protectEnforceAdmins,
          deleteBranchOnMerge: inputProps.deleteBranchOnMerge,
          gitCommitMessage: inputProps.gitCommitMessage,
          gitAuthorName: inputProps.gitAuthorName,
          gitAuthorEmail: inputProps.gitAuthorEmail,
          allowMergeCommit: inputProps.allowMergeCommit,
          allowSquashMerge: inputProps.allowSquashMerge,
          squashMergeCommitTitle: inputProps.squashMergeCommitTitle,
          squashMergeCommitMessage: inputProps.squashMergeCommitMessage,
          allowRebaseMerge: inputProps.allowRebaseMerge,
          allowAutoMerge: inputProps.allowAutoMerge,
          sourcePath: inputProps.sourcePath,
          collaborators: inputProps.collaborators,
          hasProjects: inputProps.hasProjects,
          hasWiki: inputProps.hasWiki,
          hasIssues: inputProps.hasIssues,
          token: inputProps.token,
          topics: inputProps.topics,
          repoVariables: inputProps.repoVariables,
          secrets: inputProps.secrets,
          requiredCommitSigning: inputProps.requiredCommitSigning,
        },
      },
      output: {
        type: 'object',
        properties: {
          remoteUrl: outputProps.remoteUrl,
          repoContentsUrl: outputProps.repoContentsUrl,
          commitHash: outputProps.commitHash,
        },
      },
    },
    async handler(ctx) {
      const {
        remoteUrl= ctx.input.remoteUrl,
        repoContentsUrl = ctx.input.repoContentsUrl,
        repoUrl,
        requireCodeOwnerReviews = false,
        dismissStaleReviews = false,
        bypassPullRequestAllowances,
        requiredApprovingReviewCount = 1,
        restrictions,
        requiredStatusCheckContexts = [],
        requireBranchesToBeUpToDate = true,
        requiredConversationResolution = false,
        defaultBranch = 'master',
        protectDefaultBranch = true,
        protectEnforceAdmins = true,
        gitCommitMessage = 'initial commit',
        gitAuthorName,
        gitAuthorEmail,
        requiredCommitSigning = false,
      } = ctx.input;

      const octokitOptions = await getOctokitOptions({
        integrations,
        repoUrl: repoUrl,
      });
      const client = new Octokit(octokitOptions);

      const { owner, repo } = parseRepoUrl(repoUrl, integrations);

      if (!owner) {
        throw new InputError('Invalid repository owner provided in repoUrl');
      }

      const commitResult = await initRepoPushAndProtect(
        remoteUrl,
        octokitOptions.auth,
        ctx.workspacePath,
        ctx.input.sourcePath,
        defaultBranch,
        protectDefaultBranch,
        protectEnforceAdmins,
        owner,
        client,
        repo,
        requireCodeOwnerReviews,
        bypassPullRequestAllowances,
        requiredApprovingReviewCount,
        restrictions,
        requiredStatusCheckContexts,
        requireBranchesToBeUpToDate,
        requiredConversationResolution,
        config,
        ctx.logger,
        gitCommitMessage,
        gitAuthorName,
        gitAuthorEmail,
        dismissStaleReviews,
        requiredCommitSigning,
      );

      ctx.output('commitHash', commitResult?.commitHash);
      ctx.output('remoteUrl', remoteUrl);
      ctx.output('repoContentsUrl', repoContentsUrl);
    },
  });
}

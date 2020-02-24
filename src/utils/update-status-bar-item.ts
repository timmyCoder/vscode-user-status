import {StatusBarItem} from 'vscode';
import {UserStatusConfiguration} from '../configuration';
import {GitHub} from '../github';
import {createGithubClient} from '../github-client';
import {Slack} from '../slack';

const processes = {
  async github(
    username: string,
    accessToken: string,
  ): ReturnType<GitHub['getProfile']> {
    const client = createGithubClient(accessToken);
    const github = new GitHub(client, username);

    return github.getProfile();
  },
  async slack(user: string, accessToken: string): Promise<string> {
    const slack = new Slack(user, accessToken);
    const {emojiName} = await slack.getProfile();

    return emojiName;
  },
};

export const updateStatusBarItem = async (
  statusBarItem: StatusBarItem,
  status: typeof import('../i18n/en/status.json'),
  {
    priority,
    github,
    slack,
  }: {priority: UserStatusConfiguration['priority']} & Partial<
    Pick<UserStatusConfiguration, 'github' | 'slack'>
  >,
): Promise<void> => {
  const functions: (() => Promise<string>)[] = [];

  if (github !== undefined) {
    functions.push(
      async (): Promise<string> => {
        const emojiName = await processes.github(
          github.username,
          github.accessToken,
        );

        if (emojiName === '') {
          return '';
        }

        /* eslint-disable @typescript-eslint/camelcase */
        for (const [
          emoji,
          {
            github: {emoji_name},
            text,
          },
        ] of Object.entries(status)) {
          if (emojiName === emoji_name) {
            return `${emoji} ${text}`;
          }
        }
        /* eslint-enable @typescript-eslint/camelcase */

        return '';
      },
    );
  }

  if (slack !== undefined) {
    functions.push(
      async (): Promise<string> => {
        const emojiName = await processes.slack(
          slack.workspaces[0].user,
          slack.workspaces[0].accessToken,
        );

        if (emojiName === '') {
          return '';
        }

        /* eslint-disable @typescript-eslint/camelcase */
        for (const [
          emoji,
          {
            github: {emoji_name},
            text,
          },
        ] of Object.entries(status)) {
          if (emojiName === emoji_name) {
            return `${emoji} ${text}`;
          }
        }
        /* eslint-enable @typescript-eslint/camelcase */

        return '';
      },
    );
  }

  if (priority === 'slack') {
    functions.reverse();
  }

  let text = '';
  for (const fn of functions) {
    // eslint-disable-next-line no-await-in-loop
    text = await fn();
    if (text !== '') {
      break;
    }
  }

  if (text === '') {
    text = '$(smiley) Set status';
  }

  statusBarItem.text = text;
  statusBarItem.show();
};

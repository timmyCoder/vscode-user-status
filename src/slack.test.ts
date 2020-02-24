import fetch from 'node-fetch';
import {Slack, SLACK_API} from './slack';

jest.mock('node-fetch');

describe('Slack', () => {
  describe('#getProfile', () => {
    beforeEach(() => {
      ((fetch as unknown) as jest.Mock).mockResolvedValueOnce({
        /* eslint-disable @typescript-eslint/camelcase */
        json: jest.fn().mockResolvedValueOnce({
          ok: true,
          profile: {
            status_text: 'Taking a break',
            status_emoji: ':coffee:',
          },
        }),
        /* eslint-enable @typescript-eslint/camelcase */
      });
    });

    afterEach(() => {
      ((fetch as unknown) as jest.Mock).mockReset();
    });

    it('returns value', async () => {
      const slack = new Slack('aa', 'bb');

      await expect(slack.getProfile()).resolves.toMatchObject({
        text: 'Taking a break',
        emojiName: 'coffee',
      });
    });
  });

  describe('#setProfile', () => {
    beforeEach(() => {
      ((fetch as unknown) as jest.Mock).mockResolvedValueOnce({
        json: jest.fn().mockResolvedValueOnce({ok: true}),
      });
    });

    afterEach(() => {
      ((fetch as unknown) as jest.Mock).mockReset();
    });

    it.each([['coffee', 'Taking a break']])(
      'is called with %s, %s',
      async (emojiName, text) => {
        const slack = new Slack('aa', 'bb');

        await slack.setProfile(emojiName, text);

        expect(((fetch as unknown) as jest.Mock).mock.calls[0][1]).toEqual(
          expect.objectContaining({
            body: JSON.stringify({
              /* eslint-disable @typescript-eslint/camelcase */
              profile: {
                status_emoji: ':coffee:',
                status_text: 'Taking a break',
                status_expiration: 0,
              },
              /* eslint-enable @typescript-eslint/camelcase */
            }),
          }),
        );
      },
    );
  });
});

export const workspace = {
  getConfiguration: jest.fn().mockReturnValue({
    get: jest.fn(),
  }),
};

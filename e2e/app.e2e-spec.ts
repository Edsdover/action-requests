import { ActionRequestPage } from './app.po';

describe('action-request App', () => {
  let page: ActionRequestPage;

  beforeEach(() => {
    page = new ActionRequestPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!');
  });
});

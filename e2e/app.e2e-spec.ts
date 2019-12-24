import { PosRestoPage } from './app.po';

describe('pos-cloud App', () => {
  let page: PosRestoPage;

  beforeEach(() => {
    page = new PosRestoPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});

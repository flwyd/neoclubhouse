import { NeoclubhousePage } from './app.po';

describe('neoclubhouse App', function() {
  let page: NeoclubhousePage;

  beforeEach(() => {
    page = new NeoclubhousePage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});

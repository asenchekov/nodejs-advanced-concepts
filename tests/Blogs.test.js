const Page = require('./helpers/Page');

let page;

beforeEach(async () => {
  page = await Page.build();
  await page.goto('http://localhost:3000');
});

afterEach(async () => {
  await page.close()
});

describe('When logged in', async () => {
  beforeEach(async () => {
    await page.login();
    await page.click('a[href="/blogs/new"]');
  });

  test('can see add blog form', async () => {
    const label = await page.getContentsOf('form label');
  
    expect(label).toEqual('Blog Title');
  });

  describe('And submitting valid input', async () => {
    beforeEach(async () => {
      await page.type('.title input', 'My title');
      await page.type('.content input', 'My content');
      await page.click('form button');
    });

    test('Submitting takes us to review screen', async () => {
      const text = await page.getContentsOf('h5');

      expect(text).toEqual('Please confirm your entries');
    });

    test('Submitting then saving adds blog to index page', async () => {
      await page.click('button.green');
      await page.waitFor('.card-title');
      const card = await page.getContentsOf('.card-title');
      const content = await page.getContentsOf('p');

      expect(card).toEqual('My title');
      expect(content).toEqual('My content');
    });
  });

  describe('And submiting values', async () => {
    beforeEach(async () => {
      await page.click('form button');
    });

    test('invalid input', async () => {
      const titleError = await page.getContentsOf('.title .red-text');
      const contentError = await page.getContentsOf('.content .red-text');

      expect(titleError).toEqual('You must provide a value');
      expect(contentError).toEqual('You must provide a value');
    });
  });
});

describe('User is not logged in', () => {
  const actions = [
    {
      method: 'get',
      path: 'api/blogs',
    },
    {
      method: 'post',
      path: 'api/blogs',
      body: {
        title: 'My title',
        content: 'My content',
      },
    },
  ];

  test('Blog related action are prohibited', async () => {
    const results = await page.executeRequests(actions);
    
    for(let result of results) {
      expect(result).toEqual({ error: 'You must log in!'});
    }
  });
});
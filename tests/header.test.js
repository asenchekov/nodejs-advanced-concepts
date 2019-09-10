const puppeteer = require('puppeteer');

let browser, page

beforeEach(async () => {
  browser = await puppeteer.launch({
    headless: false,
  });
  page = await browser.newPage();
  await page.goto('localhost:3000');
});

afterEach(async () => {
  await browser.close()
})

test('The header has the correct text', async () => {
  const text = await page.$eval('a.left.brand-logo', (el) => el.innerHTML);

  expect(text).toEqual('Blogster');
});

test('Clicking login starts OAuth flow', async () => {
  await page.click('.right a');
  const url = await page.url();

  expect(url).toMatch(/accounts\.google\.com/);
});

test('When signed in, shows logout button', async () => {
  const id = '5d261640a7ff580caae13f4a';

  const Buffer = require('safe-buffer').Buffer;
  const sessionObject = {
    passport: {
      user: id
    }
  };
  const sessionString = Buffer.from(JSON.stringify(sessionObject))
    .toString('base64');

  const Keygrip = require('keygrip');
  const keys = require('../config/keys');
  const keygrip = new Keygrip([keys.cookieKey]);
  const sig = keygrip.sign('session=' + sessionString);

  await page.setCookie({
    name: 'session',
    value: sessionString
  });
  await page.setCookie({
    name: 'session.sig',
    value: sig
  });
  await page.goto('localhost:3000', { waitUntil: 'domcontentloaded' });

  const logout = await page.$eval('a[href="/auth/logout"]', (el) => el.innerHTML);

  expect(logout).toEqual('Logout');
});
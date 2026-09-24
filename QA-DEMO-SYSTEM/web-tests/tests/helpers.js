async function login(page, email, password) {
  await page.goto('/index.html');
  await page.getByTestId('login-email').fill(email);
  await page.getByTestId('login-password').fill(password);
  await page.getByTestId('login-submit').click();
  await page.waitForURL('**/products.html');
}

module.exports = { login };

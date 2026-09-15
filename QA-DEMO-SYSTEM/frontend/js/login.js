document.getElementById('login-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const errorEl = document.getElementById('login-error');
  errorEl.hidden = true;

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const body = await res.json();

    if (!res.ok) {
      errorEl.textContent = body.error || 'Giriş başarısız';
      errorEl.hidden = false;
      return;
    }

    sessionStorage.setItem('qa_demo_token', body.token);
    sessionStorage.setItem('qa_demo_user_email', body.user.email);
    window.location.href = 'products.html';
  } catch (err) {
    errorEl.textContent = 'Sunucuya bağlanılamadı';
    errorEl.hidden = false;
  }
});

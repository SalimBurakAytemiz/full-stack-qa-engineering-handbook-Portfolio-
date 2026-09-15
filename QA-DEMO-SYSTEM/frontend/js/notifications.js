function appendNotification(message) {
  const listEl = document.getElementById('notification-list');
  const item = document.createElement('li');
  item.dataset.testid = 'notification-item';
  item.textContent = message;
  listEl.prepend(item);
}

async function loadNotifications(token) {
  const res = await fetch('/api/notifications', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    return;
  }
  const body = await res.json();
  for (const notification of body.notifications) {
    appendNotification(notification.message);
  }
}

function connectRealtime(token) {
  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
  const ws = new WebSocket(`${protocol}://${window.location.host}/ws?token=${token}`);

  ws.addEventListener('message', (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'notification') {
      appendNotification(data.notification.message);
    }
  });
}

const token = sessionStorage.getItem('qa_demo_token');
if (token) {
  loadNotifications(token);
  connectRealtime(token);
}

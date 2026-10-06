'use strict';

// Recognizes the real, observed error shapes testcontainers/dockerode throw
// when no Docker daemon is reachable, so the lab can report an honest
// EXTERNALLY_BLOCKED instead of crashing or — worse — silently reporting a
// fake pass. Pattern list is derived from the actual error this lab
// observed in this sandbox (no /var/run/docker.sock) — see EXECUTION.md.
// TR: Docker daemon'a erişilemediğinde testcontainers/dockerode'un
// GERÇEKTEN fırlattığı hata şekillerini tanır — bu lab'ın bu sandbox'ta
// GÖZLEMLEDİĞİ gerçek hatadan türetilmiştir (bkz. EXECUTION.md).

function looksLikeNoDockerDaemon(message) {
  const text = String(message == null ? '' : message);
  return /ENOENT|ECONNREFUSED|docker\.sock|Cannot connect to the Docker daemon|no such file or directory|Could not find a working container runtime strategy/i.test(
    text,
  );
}

module.exports = { looksLikeNoDockerDaemon };

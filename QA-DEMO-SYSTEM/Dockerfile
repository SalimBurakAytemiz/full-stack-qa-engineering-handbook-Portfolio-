# Phase 14 — Modern QA Learning Labs: "Docker for QA".
#
# STATUS: syntax-correct, real Dockerfile — NEVER BUILT. This sandboxed
# environment has the `docker` CLI installed (29.3.1) but no reachable
# daemon (`docker info` confirms: no /var/run/docker.sock) — verified in
# this session, see EXECUTION.md section 4. Documented here for real (an
# actual `docker build` on a machine with a running daemon would succeed
# against this file), not executed.
#
# BUILD CONTEXT MUST BE THE REPOSITORY ROOT, not QA-DEMO-SYSTEM/ — the
# backend requires shared/test-data/*.json at runtime (see
# backend/src/database/seed.js, 4 directories up from itself), and
# shared/ is a SIBLING of QA-DEMO-SYSTEM/, not nested inside it. Build
# from the repo root with:
#   docker build -f QA-DEMO-SYSTEM/Dockerfile -t qa-demo-system .
#
# The full QA-DEMO-SYSTEM/ tree is copied (npm workspaces require every
# workspace's package.json present to match package-lock.json — copying
# only backend/package.json would make `npm ci` fail against a lockfile
# that also references api-tests/web-tests/automation-labs) and a
# .dockerignore excludes node_modules/data/generated artifacts.
FROM node:22-slim
WORKDIR /app

COPY QA-DEMO-SYSTEM QA-DEMO-SYSTEM
COPY shared /shared

WORKDIR /app/QA-DEMO-SYSTEM
RUN npm ci --workspace backend --omit=dev

ENV NODE_ENV=production
ENV PORT=3000
ENV DB_PATH=/app/QA-DEMO-SYSTEM/backend/data/qa-demo.db

EXPOSE 3000

# Environment Validation (Phase 12/13) as a real Docker HEALTHCHECK — the
# same GET /api/health pattern already used throughout this campaign
# (Playwright webServer, CI pipeline, Locust readiness polling).
HEALTHCHECK --interval=10s --timeout=3s --retries=5 \
  CMD node -e "fetch('http://localhost:' + (process.env.PORT || 3000) + '/api/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "backend/src/server.js"]

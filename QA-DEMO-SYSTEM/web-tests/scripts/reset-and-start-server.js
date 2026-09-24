#!/usr/bin/env node
'use strict';

// Deletes any stale Playwright test DB file, then starts the real backend
// server in-process (require, not a shelled-out "npm run start") so the
// whole suite always begins from the same deterministic auto-seeded state
// (backend/src/server.js seeds automatically when the users table is
// empty — see src/server.js). No .cmd/npm shell resolution is involved,
// matching the cross-platform discipline already established in
// api-tests/scripts/generate-html-report.js (process.execPath / direct
// node invocation, never a shell script).

const fs = require('node:fs');
const path = require('node:path');

const dbPath = process.env.DB_PATH;
if (!dbPath) {
  throw new Error('DB_PATH must be set (see playwright.config.js webServer.env)');
}

fs.rmSync(dbPath, { force: true });

const BACKEND_DIR = path.join(__dirname, '..', '..', 'backend');
require(path.join(BACKEND_DIR, 'src', 'server.js'));

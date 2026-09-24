const { graphql, GraphQLError } = require('graphql');
const { schema } = require('./schema');
const { resolvers } = require('./resolvers');
const { resolveSession } = require('../middleware/requireAuth');

// Phase 18 self-audit hardening: every deliberately-thrown business/auth
// error in resolvers.js sets a recognized extensions.code (UNAUTHENTICATED/
// BAD_REQUEST). An error WITHOUT one, THAT ALSO has a `path` (i.e. it
// happened during resolver execution, not during parse/validation — see
// below), is therefore an unexpected internal exception (e.g. a raw DB
// driver error) — its raw message must never reach the client, mirroring
// the generic-message discipline errorHandler.js already applies on the
// REST side (`{error: 'Sunucu hatası'}`, no internal detail).
//
// Query-validation errors (e.g. "Cannot query field X" for an unknown
// field) are NEVER masked: they have no `path` (they happen before
// execution starts, not tied to a resolved field — verified directly
// against this graphql version) and are standard, safe GraphQL protocol
// messages the Phase 6 test suite asserts on (`graphql.test.js` —
// "returns a validation error"). Masking those would break that real,
// already-passing test.
//
// Exported separately (not inlined in the handler) so it can be unit
// tested directly with fabricated GraphQLError instances — there is no
// currently-reachable production resolver path that throws a plain,
// non-GraphQLError exception (schema-level Int!/String! coercion and
// service-layer validation already reject malformed input before it
// reaches a resolver), so this cannot be exercised end-to-end through a
// live request without inventing a fake crashing resolver in production
// code, which was deliberately avoided.
const KNOWN_ERROR_CODES = new Set(['UNAUTHENTICATED', 'BAD_REQUEST']);

function maskUnexpectedErrors(result) {
  if (!result.errors) {
    return result;
  }
  return {
    ...result,
    errors: result.errors.map((err) => {
      if (!err.path || KNOWN_ERROR_CODES.has(err.extensions?.code)) {
        return err;
      }
      console.error('[graphql] unexpected resolver error:', err.originalError || err);
      return new GraphQLError('Sunucu hatası', { extensions: { code: 'INTERNAL_SERVER_ERROR' }, path: err.path });
    }),
  };
}

// A minimal GraphQL-over-HTTP handler using the `graphql` package's own
// execute function directly — no graphql-http/express-graphql/apollo-server
// dependency. The QA Demo System's GraphQL surface is small and doesn't
// need a full server framework; this keeps the dependency footprint
// minimal (Phase 6 dependency-policy check: is it needed? yes, real
// GraphQL execution requires the `graphql` package itself, there is no
// zero-dependency way to parse/validate/execute GraphQL; is a bigger
// framework needed on top of it? no).
//
// Codex fix-campaign B1: pushNotificationToUser is injected exactly the
// same way orders.routes.js already receives it (see app.js) — the REST
// route calls it inline after a successful createOrder with a
// result.notification, and the createOrder resolver in resolvers.js now
// does the identical thing via context.pushNotificationToUser. No new
// business logic was added here or in the resolver: this file only wires
// the SAME already-existing, canonical websocketServer.js function into
// the GraphQL transport, which previously never received it at all — that
// was the root cause of GraphQL-created PAID orders never reaching the
// live WebSocket push (REST orders were never affected).
function createGraphQLHandler(db, pushNotificationToUser = () => false) {
  return async (req, res) => {
    const { query, variables, operationName } = req.body || {};

    if (typeof query !== 'string' || query.trim() === '') {
      // A malformed GraphQL-over-HTTP request (no query at all) is a
      // transport-level error, unlike a business/authorization error from
      // a resolver — this is the one case that gets a non-200 status.
      res.status(400).json({ errors: [{ message: 'Request body must contain a "query" string.' }] });
      return;
    }

    // Auth is resolved once per request, the same way the REST middleware
    // does it, and handed to every resolver via context — resolvers decide
    // per-field whether auth is required (see resolvers.js requireUserId).
    const session = resolveSession(db, req.headers.authorization);

    const result = await graphql({
      schema,
      source: query,
      rootValue: resolvers,
      contextValue: { db, userId: session.ok ? session.userId : undefined, pushNotificationToUser },
      variableValues: variables,
      operationName,
    });

    const safeResult = maskUnexpectedErrors(result);

    // Per the GraphQL-over-HTTP convention: a request that executes (even
    // if individual fields/resolvers produced errors) returns HTTP 200,
    // with those errors reported in the `errors` array. Newman/AJV-style
    // "status code == 200" assertions and "errors[] contains X" assertions
    // are therefore two DIFFERENT checks in the Phase 6 test suite — never
    // conflated (this is the core "GraphQL Error Handling" scope point).
    res.status(200).json(safeResult);
  };
}

module.exports = { createGraphQLHandler, maskUnexpectedErrors };

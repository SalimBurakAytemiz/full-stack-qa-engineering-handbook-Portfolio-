const { graphql } = require('graphql');
const { schema } = require('./schema');
const { resolvers } = require('./resolvers');
const { resolveSession } = require('../middleware/requireAuth');

// A minimal GraphQL-over-HTTP handler using the `graphql` package's own
// execute function directly — no graphql-http/express-graphql/apollo-server
// dependency. The QA Demo System's GraphQL surface is small and doesn't
// need a full server framework; this keeps the dependency footprint
// minimal (Phase 6 dependency-policy check: is it needed? yes, real
// GraphQL execution requires the `graphql` package itself, there is no
// zero-dependency way to parse/validate/execute GraphQL; is a bigger
// framework needed on top of it? no).
function createGraphQLHandler(db) {
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
      contextValue: { db, userId: session.ok ? session.userId : undefined },
      variableValues: variables,
      operationName,
    });

    // Per the GraphQL-over-HTTP convention: a request that executes (even
    // if individual fields/resolvers produced errors) returns HTTP 200,
    // with those errors reported in the `errors` array. Newman/AJV-style
    // "status code == 200" assertions and "errors[] contains X" assertions
    // are therefore two DIFFERENT checks in the Phase 6 test suite — never
    // conflated (this is the core "GraphQL Error Handling" scope point).
    res.status(200).json(result);
  };
}

module.exports = { createGraphQLHandler };

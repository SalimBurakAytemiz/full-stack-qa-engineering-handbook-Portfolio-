const { buildSchema } = require('graphql');

// Phase 6 — GraphQL layer. This schema is a read/write VIEW over the same
// canonical business logic already used by the REST API (src/services/*) —
// it does not duplicate validation or persistence rules, only maps them
// onto GraphQL types/queries/mutations so GraphQL-specific concerns (query
// vs mutation shape, error-array semantics, input/output type mapping) can
// be exercised against real, shared behavior.
const schema = buildSchema(`
  type Product {
    id: Int!
    name: String!
    price: Float!
    stock_quantity: Int!
    in_stock: Boolean!
  }

  type OrderItem {
    product_id: Int!
    product_name: String!
    quantity: Int!
    unit_price: Float!
  }

  type Order {
    id: Int!
    user_id: Int!
    status: String!
    total: Float!
    created_at: String!
    items: [OrderItem!]!
  }

  type User {
    id: Int!
    email: String!
  }

  type LoginPayload {
    token: String!
    user: User!
  }

  type CreateOrderPayload {
    id: Int!
    status: String!
    total: Float!
  }

  input OrderItemInput {
    product_id: Int!
    quantity: Int!
  }

  type Query {
    health: String!
    products: [Product!]!
    product(id: Int!): Product
    order(id: Int!): Order
    me: User
  }

  type Mutation {
    login(email: String!, password: String!): LoginPayload!
    createOrder(items: [OrderItemInput!]!, payment_token: String): CreateOrderPayload!
  }
`);

module.exports = { schema };

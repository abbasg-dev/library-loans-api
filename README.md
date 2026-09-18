# Library Loans API

Node.js + Express.js + Mongoose + MongoDB Atlas implementation of a
small library loan system.

## Tech Stack

- Node.js
- Express.js
- Mongoose
- MongoDB Atlas
- express-async-handler

## Data Model

The application contains four related collections:

- Books
- Copies
- Members
- Loans

Relationships:

Book 1 -> N Copies
Copy 1 -> N historical Loans
Member 1 -> N Loans

All relationships are represented using MongoDB ObjectId references.

## Seed Data

The seed script creates:

- 500 books
- 2,000 copies
- 1,000 members
- 15,000 loans

Run:

npm run seed

## API

### Get a member's current loans

GET /api/members/:memberId/loans

Returns currently active loans for the member, ordered by
most recently borrowed first.

Example response:

[
{
"title": "Library Book 123",
"dueDate": "2026-09-25T00:00:00.000Z"
}
]

## Preventing Double Lending

A physical copy cannot have two active loans.

This is enforced at the MongoDB database level using a unique
partial index:

{
copy: 1
}

with:

{
unique: true,
partialFilterExpression: {
status: "ACTIVE"
}
}

This was intentionally implemented as a database constraint rather
than only application logic. This means concurrent requests or
another code path cannot bypass the rule and create two active loans
for the same physical copy.

Historical RETURNED loans remain allowed.

## Performance Index

The list endpoint filters by:

- member
- status

and sorts by:

- borrowedAt descending

The following compound index was added:

{
member: 1,
status: 1,
borrowedAt: -1
}

## Query Plan Before Index

[Paste actual explain("executionStats") output here]

Important metrics:

- executionTimeMillis:
- totalKeysExamined:
- totalDocsExamined:

## Query Plan After Index

[Paste actual explain("executionStats") output here]

Important metrics:

- executionTimeMillis:
- totalKeysExamined:
- totalDocsExamined:

## Performance

The endpoint was tested against the seeded dataset containing
15,000 loans.

Target:

< 200 ms

Measured:

[Paste measured result here]

Performance can vary depending on MongoDB Atlas region, network
latency, and hardware tier.

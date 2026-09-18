require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("../config/db");

const Book = require("../models/Book");
const Copy = require("../models/Copy");
const Member = require("../models/Member");
const Loan = require("../models/Loan");

const BOOK_COUNT = 500;
const COPY_COUNT = 2000;
const MEMBER_COUNT = 1000;
const LOAN_COUNT = 15000;

const seed = async () => {
  try {
    await connectDB();

    console.log("Clearing existing data...");

    await Promise.all([
      Loan.deleteMany({}),
      Copy.deleteMany({}),
      Book.deleteMany({}),
      Member.deleteMany({}),
    ]);

    console.log("Creating books...");

    const books = Array.from({ length: BOOK_COUNT }, (_, index) => ({
      title: `Library Book ${index + 1}`,
      author: `Author ${index + 1}`,
      isbn: `978000${String(index + 1).padStart(7, "0")}`,
    }));

    const createdBooks = await Book.insertMany(books);

    console.log(`${createdBooks.length} books created`);

    console.log("Creating copies...");

    const copies = Array.from({ length: COPY_COUNT }, (_, index) => ({
      book: createdBooks[index % createdBooks.length]._id,
      barcode: `COPY-${String(index + 1).padStart(6, "0")}`,
    }));

    const createdCopies = await Copy.insertMany(copies);

    console.log(`${createdCopies.length} copies created`);

    console.log("Creating members...");

    const members = Array.from({ length: MEMBER_COUNT }, (_, index) => ({
      name: `Member ${index + 1}`,
      email: `member${index + 1}@example.com`,
    }));

    const createdMembers = await Member.insertMany(members);

    console.log(`${createdMembers.length} members created`);

    console.log("Creating loans...");

    const loans = [];

    /*
     * We need at least 10,000 loans.
     *
     * 13,000 historical RETURNED loans
     *  2,000 current ACTIVE loans
     *
     * Every copy gets exactly one active loan.
     */

    const returnedLoanCount = LOAN_COUNT - COPY_COUNT;

    // Historical returned loans
    for (let i = 0; i < returnedLoanCount; i++) {
      const copy = createdCopies[i % COPY_COUNT];
      const member = createdMembers[i % MEMBER_COUNT];

      const borrowedAt = new Date(
        Date.now() - (LOAN_COUNT - i) * 60 * 60 * 1000,
      );

      const dueDate = new Date(borrowedAt);
      dueDate.setDate(dueDate.getDate() + 14);

      const returnedAt = new Date(dueDate);
      returnedAt.setDate(returnedAt.getDate() - 2);

      loans.push({
        copy: copy._id,
        member: member._id,
        borrowedAt,
        dueDate,
        returnedAt,
        status: "RETURNED",
      });
    }

    // Current active loan for every copy
    for (let i = 0; i < COPY_COUNT; i++) {
      const copy = createdCopies[i];
      const member = createdMembers[i % MEMBER_COUNT];

      const borrowedAt = new Date(
        Date.now() - (COPY_COUNT - i) * 60 * 60 * 1000,
      );

      const dueDate = new Date(borrowedAt);
      dueDate.setDate(dueDate.getDate() + 14);

      loans.push({
        copy: copy._id,
        member: member._id,
        borrowedAt,
        dueDate,
        returnedAt: null,
        status: "ACTIVE",
      });
    }

    await Loan.insertMany(loans);

    console.log(`${loans.length} loans created`);
    console.log(`${returnedLoanCount} returned loans`);
    console.log(`${COPY_COUNT} active loans`);

    console.log("Seed completed successfully");

    await mongoose.connection.close();
    console.log("Database connection closed");
  } catch (error) {
    console.error("Seed failed:", error);

    await mongoose.connection.close();

    process.exit(1);
  }
};

seed();

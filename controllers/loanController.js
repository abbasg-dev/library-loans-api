const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const Loan = require("../models/Loan");

const createLoan = asyncHandler(async (req, res) => {
  const { copy, member, borrowedAt, dueDate } = req.body;

  try {
    const loan = await Loan.create({
      copy,
      member,
      borrowedAt,
      dueDate,
      status: "ACTIVE",
    });

    res.status(201).json(loan);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "This copy is already on loan.",
      });
    }

    throw error;
  }
});

const getCurrentLoansByMember = asyncHandler(async (req, res) => {
  const { memberId } = req.params;

  const loans = await Loan.aggregate([
    {
      $match: {
        member: new mongoose.Types.ObjectId(memberId),
        status: "ACTIVE",
      },
    },
    {
      $sort: {
        borrowedAt: -1,
      },
    },
    {
      $lookup: {
        from: "copies",
        localField: "copy",
        foreignField: "_id",
        as: "copy",
      },
    },
    {
      $unwind: "$copy",
    },
    {
      $lookup: {
        from: "books",
        localField: "copy.book",
        foreignField: "_id",
        as: "book",
      },
    },
    {
      $unwind: "$book",
    },
    {
      $project: {
        _id: 0,
        title: "$book.title",
        dueDate: 1,
      },
    },
  ]);

  res.status(200).json(loans);
});

module.exports = {
  createLoan,
  getCurrentLoansByMember,
};

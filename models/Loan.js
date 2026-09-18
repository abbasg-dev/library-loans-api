const mongoose = require("mongoose");

const loanSchema = new mongoose.Schema(
  {
    copy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Copy",
      required: true,
    },

    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },

    borrowedAt: {
      type: Date,
      required: true,
    },

    dueDate: {
      type: Date,
      required: true,
    },

    returnedAt: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "RETURNED"],
      required: true,
      default: "ACTIVE",
    },
  },
  {
    timestamps: true,
  },
);

/*
 * A physical copy can only have one ACTIVE loan.
 *
 * Historical RETURNED loans are allowed, but MongoDB will
 * reject a second ACTIVE loan for the same copy.
 */
loanSchema.index(
  { copy: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: "ACTIVE",
    },
    name: "unique_active_loan_per_copy",
  },
);

module.exports = mongoose.model("Loan", loanSchema);

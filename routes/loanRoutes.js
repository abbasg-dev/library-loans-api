const express = require("express");
const {
  getCurrentLoansByMember,
  createLoan,
} = require("../controllers/loanController");
const validate = require("../middleware/validate");
const { memberLoansParamsSchema } = require("../schemas/loanSchema");

const router = express.Router();

router.post("/loans", createLoan);

router.get(
  "/members/:memberId/loans",
  validate(memberLoansParamsSchema, "params"),
  getCurrentLoansByMember,
);

module.exports = router;

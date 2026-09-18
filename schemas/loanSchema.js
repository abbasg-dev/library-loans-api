const { z } = require("zod");

const memberLoansParamsSchema = z.object({
  memberId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid member ID"),
});

module.exports = {
  memberLoansParamsSchema,
};

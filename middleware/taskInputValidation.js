const { z } = require('zod');

const taskValidateSchema = z.object({
  taskTitle: z.string()
    .min(2, 'Title Min. 2 characters')
    .max(50, 'Title Max. 50 characters'),

  description: z.string()
    .min(10, 'Description Min. 10 characters')
    .max(100, 'Description Max. 100 characters'),

  status: z.string('select status')
});

const taskValidation = (req, res, next) => {
  try {
    req.body = taskValidateSchema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        msg: error.errors[0].message,
        status: 0
      });
    }
    next(error);
  }
};

module.exports = {
  taskValidation
};

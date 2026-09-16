const ApiError = require('../utils/ApiError');

/**
 * validate(schema, source?) — source is 'body' | 'query' | 'params' (default body)
 */
const validate = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }
  req[source] = result.data;
  next();
};

module.exports = validate;

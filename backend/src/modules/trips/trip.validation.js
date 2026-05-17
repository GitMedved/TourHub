const { z } = require('zod');

const optionalIsoDate = z.string()
  .refine((value) => !Number.isNaN(Date.parse(value)), {
    message: 'Must be a valid ISO 8601 date'
  })
  .optional();

const createTripSchema = z.object({
  title: z.string().min(1).max(200),

  description: z.string()
    .max(5000)
    .optional(),

  destination: z.string()
    .min(2)
    .max(120)
    .optional(),

  startDate: optionalIsoDate,

  endDate: optionalIsoDate,

  visibility: z.enum([
    'PRIVATE',
    'SHARED',
    'PUBLIC'
  ]).optional(),

  status: z.enum([
    'planning',
    'active',
    'completed',
    'archived'
  ]).optional()
}).refine((data) => {
  if (!data.startDate || !data.endDate) {
    return true;
  }

  return new Date(data.endDate) >= new Date(data.startDate);
}, {
  message: 'endDate must be greater than or equal to startDate',
  path: ['endDate']
});

const addPlaceSchema = z.object({
  name: z.string()
    .min(1)
    .max(300)
    .optional(),

  title: z.string()
    .min(1)
    .max(300)
    .optional(),

  description: z.string()
    .max(2000)
    .optional(),

  address: z.string()
    .max(255)
    .optional(),

  latitude: z.number().optional(),

  longitude: z.number().optional(),

  lat: z.number().optional(),

  lng: z.number().optional(),

  notes: z.string()
    .max(2000)
    .optional(),

  order: z.number()
    .int()
    .min(0)
    .optional()
}).refine((data) => data.name || data.title, {
  message: 'name is required',
  path: ['name']
});

const voteSchema = z.object({
  voteType: z.enum(['upvote', 'downvote']).optional(),

  value: z.number()
    .min(-1)
    .max(1)
    .optional()
}).refine((data) => data.voteType || data.value, {
  message: 'voteType is required',
  path: ['voteType']
});

const commentSchema = z.object({
  content: z.string()
    .min(1)
    .max(2000)
});

const inviteSchema = z.object({
  maxUses: z.number()
    .int()
    .min(1)
    .max(100)
    .nullable()
    .optional(),

  expiresInHours: z.number()
    .int()
    .min(1)
    .max(720)
    .nullable()
    .optional()
});

const validateBody = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      details: result.error.flatten()
    });
  }

  req.body = result.data;
  return next();
};

module.exports = {
  createTripSchema,
  addPlaceSchema,
  voteSchema,
  commentSchema,
  inviteSchema,
  validateBody
};

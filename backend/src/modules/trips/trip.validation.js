const { z } = require('zod');

const createTripSchema = z.object({
  title: z.string().min(3).max(120),

  description: z.string()
    .max(5000)
    .optional(),

  destination: z.string()
    .min(2)
    .max(120),

  startDate: z.string().optional(),

  endDate: z.string().optional(),

  visibility: z.enum([
    'PRIVATE',
    'SHARED',
    'PUBLIC'
  ]).optional()
});

const addPlaceSchema = z.object({
  title: z.string()
    .min(2)
    .max(120),

  description: z.string()
    .max(2000)
    .optional(),

  address: z.string()
    .max(255)
    .optional(),

  lat: z.number().optional(),

  lng: z.number().optional(),

  dayNumber: z.number()
    .min(1)
    .optional(),

  estimatedCost: z.number()
    .min(0)
    .optional()
});

const voteSchema = z.object({
  value: z.number()
    .min(-1)
    .max(1)
});

const commentSchema = z.object({
  content: z.string()
    .min(1)
    .max(2000)
});

module.exports = {
  createTripSchema,
  addPlaceSchema,
  voteSchema,
  commentSchema
};

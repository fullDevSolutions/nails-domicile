const Joi = require('joi');

const bookingSchema = Joi.object({
  firstName: Joi.string().trim().min(2).max(50).required().messages({
    'string.min': 'Le prénom doit contenir au moins 2 caractères',
    'any.required': 'Le prénom est obligatoire'
  }),
  lastName: Joi.string().trim().min(2).max(50).required().messages({
    'string.min': 'Le nom doit contenir au moins 2 caractères',
    'any.required': 'Le nom est obligatoire'
  }),
  phone: Joi.string().trim().pattern(/^[\d\s+()-]{10,20}$/).required().messages({
    'string.pattern.base': 'Numéro de téléphone invalide',
    'any.required': 'Le téléphone est obligatoire'
  }),
  email: Joi.string().trim().email().allow('').optional(),
  serviceId: Joi.number().integer().positive().required().messages({
    'any.required': 'Veuillez choisir une prestation'
  }),
  date: Joi.date().iso().min('now').required().messages({
    'date.min': 'La date doit être dans le futur',
    'any.required': 'La date est obligatoire'
  }),
  timeSlot: Joi.string().valid('matin', 'midi', 'apresmidi', 'soir').required().messages({
    'any.only': 'Créneau invalide',
    'any.required': 'Le créneau est obligatoire'
  }),
  address: Joi.string().trim().min(10).max(255).required().messages({
    'string.min': "L'adresse doit contenir au moins 10 caractères",
    'any.required': "L'adresse est obligatoire"
  }),
  notes: Joi.string().trim().max(1000).allow('').optional(),
  selectedOptions: Joi.array().items(Joi.string().trim().max(100)).optional()
});

const serviceSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  slug: Joi.string().trim().pattern(/^[a-z0-9-]+$/).max(100).optional(),
  description: Joi.string().trim().max(500).allow('').optional(),
  price: Joi.number().positive().precision(2).required(),
  priceUnit: Joi.string().trim().max(50).default('séance'),
  durationMinutes: Joi.number().integer().positive().max(480).required(),
  icon: Joi.string().max(10).default('💅'),
  includes: Joi.array().items(Joi.string().trim().max(100)).optional(),
  options: Joi.array().items(Joi.object({
    name: Joi.string().trim().max(100),
    price: Joi.string().trim().max(50)
  })).optional(),
  displayOrder: Joi.number().integer().min(0).optional(),
  isActive: Joi.boolean().default(true)
});

const testimonialSchema = Joi.object({
  clientName: Joi.string().trim().min(2).max(100).required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  text: Joi.string().trim().min(10).max(1000).required(),
  isFeatured: Joi.boolean().default(false),
  isActive: Joi.boolean().default(true)
});

const blockedDateSchema = Joi.object({
  blockedDate: Joi.date().iso().required().messages({
    'any.required': 'La date est obligatoire'
  }),
  reason: Joi.string().trim().max(255).allow('').optional(),
  isRecurring: Joi.boolean().default(false)
});

const blogPostSchema = Joi.object({
  title: Joi.string().trim().min(2).max(255).required().messages({
    'any.required': 'Le titre est obligatoire'
  }),
  slug: Joi.string().trim().pattern(/^[a-z0-9-]+$/).max(255).allow('').optional(),
  excerpt: Joi.string().trim().max(500).allow('').optional(),
  content: Joi.string().allow('').optional(),
  coverImage: Joi.string().trim().max(500).allow('').optional(),
  author: Joi.string().trim().max(100).allow('').optional(),
  isPublished: Joi.boolean().default(false),
  displayOrder: Joi.number().integer().min(0).optional()
});

const loginSchema = Joi.object({
  email: Joi.string().trim().email().required().messages({
    'any.required': "L'email est obligatoire"
  }),
  password: Joi.string().min(6).required().messages({
    'any.required': 'Le mot de passe est obligatoire'
  })
});

function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      const errors = error.details.map(d => d.message);
      if (req.xhr || req.headers.accept?.includes('application/json')) {
        return res.status(400).json({ success: false, errors });
      }
      req.flash('error', errors.join(', '));
      return res.redirect('back');
    }
    req.validatedBody = value;
    next();
  };
}

module.exports = {
  bookingSchema,
  serviceSchema,
  testimonialSchema,
  blockedDateSchema,
  blogPostSchema,
  loginSchema,
  validate
};

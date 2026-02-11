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

const businessSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  tagline: Joi.string().trim().max(200).allow('').optional(),
  owner: Joi.string().trim().min(2).max(100).required(),
  profession: Joi.string().trim().max(100).allow('').optional(),
  phone: Joi.string().trim().pattern(/^[\d\s+()-]{10,20}$/).required(),
  email: Joi.string().trim().email().required(),
  siret: Joi.string().trim().max(20).allow('').optional(),
  city: Joi.string().trim().max(100).allow('').optional(),
  zip: Joi.string().trim().max(10).allow('').optional(),
  serviceRadius: Joi.string().trim().max(50).allow('').optional(),
  serviceArea: Joi.string().trim().max(100).allow('').optional(),
  extraKmPrice: Joi.number().min(0).max(100).optional(),
  instagram: Joi.string().trim().uri().max(255).allow('').optional(),
  facebook: Joi.string().trim().uri().max(255).allow('').optional(),
  tiktok: Joi.string().trim().uri().max(255).allow('').optional()
});

const themeSchema = Joi.object({
  primary: Joi.string().trim().pattern(/^#[0-9a-fA-F]{3,8}$/).optional(),
  primaryDark: Joi.string().trim().pattern(/^#[0-9a-fA-F]{3,8}$/).optional(),
  secondary: Joi.string().trim().pattern(/^#[0-9a-fA-F]{3,8}$/).optional(),
  accent: Joi.string().trim().pattern(/^#[0-9a-fA-F]{3,8}$/).optional(),
  gold: Joi.string().trim().pattern(/^#[0-9a-fA-F]{3,8}$/).optional(),
  text: Joi.string().trim().pattern(/^#[0-9a-fA-F]{3,8}$/).optional(),
  textLight: Joi.string().trim().pattern(/^#[0-9a-fA-F]{3,8}$/).optional(),
  bg: Joi.string().trim().pattern(/^#[0-9a-fA-F]{3,8}$/).optional(),
  bgLight: Joi.string().trim().pattern(/^#[0-9a-fA-F]{3,8}$/).optional()
});

const seoSchema = Joi.object({
  seoTitle: Joi.string().trim().max(70).allow('').optional(),
  seoDescription: Joi.string().trim().max(160).allow('').optional(),
  canonicalUrl: Joi.string().trim().uri().max(255).allow('').optional(),
  googleAnalyticsId: Joi.string().trim().max(20).pattern(/^(UA-|G-|$)/).allow('').optional()
});

const passwordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(12).max(128).required().messages({
    'string.min': 'Le mot de passe doit contenir au moins 12 caractères'
  }),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
    'any.only': 'Les mots de passe ne correspondent pas'
  })
});

const galleryUpdateSchema = Joi.object({
  alt_text: Joi.string().trim().max(255).allow('').optional(),
  category: Joi.string().trim().max(50).valid('general', 'manucure', 'gel', 'capsules', 'nail-art', 'pedicure').default('general')
});

const loginSchema = Joi.object({
  email: Joi.string().trim().email().required().messages({
    'any.required': "L'email est obligatoire"
  }),
  password: Joi.string().min(8).required().messages({
    'string.min': 'Le mot de passe doit contenir au moins 8 caractères',
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
  businessSchema,
  themeSchema,
  seoSchema,
  passwordSchema,
  galleryUpdateSchema,
  loginSchema,
  validate
};

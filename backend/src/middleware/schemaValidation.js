const Joi = require("joi");

/**
 * Helper to generate Express middleware for validating req.body against a Joi schema
 * @param {Joi.Schema} schema 
 */
const validateBody = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      allowUnknown: true, // Allow harmless extra fields to prevent breaking existing functionality
    });

    if (error) {
      const errorMessage = error.details.map((detail) => detail.message).join(", ");
      return res.status(400).json({ error: errorMessage });
    }

    req.body = value;
    return next();
  };
};

// ----------------------------------------------------
// Authentication & Profile Schemas
// ----------------------------------------------------
const registerSchema = Joi.object({
  username: Joi.string().trim().min(2).max(50).required().messages({
    "string.empty": "Username is required.",
    "string.min": "Username must be at least 2 characters long.",
    "string.max": "Username cannot exceed 50 characters.",
  }),
  email: Joi.string().trim().email().required().messages({
    "string.empty": "Email address is required.",
    "string.email": "Please provide a valid email address.",
  }),
  password: Joi.string().min(6).max(128).required().messages({
    "string.empty": "Password is required.",
    "string.min": "Password must be at least 6 characters long.",
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().trim().email().required().messages({
    "string.empty": "Email address is required.",
    "string.email": "Please provide a valid email address.",
  }),
  password: Joi.string().required().messages({
    "string.empty": "Password is required.",
  }),
});

const sendOtpSchema = Joi.object({
  email: Joi.string().trim().email().required().messages({
    "string.empty": "Email address is required.",
    "string.email": "Please provide a valid email address.",
  }),
});

const verifyOtpSchema = Joi.object({
  email: Joi.string().trim().email().required().messages({
    "string.empty": "Email address is required.",
    "string.email": "Please provide a valid email address.",
  }),
  otp: Joi.alternatives().try(Joi.string(), Joi.number()).required().messages({
    "any.required": "Verification OTP code is required.",
  }),
});

const googleAuthSchema = Joi.object({
  credential: Joi.string().required().messages({
    "string.empty": "Google credential token is required.",
  }),
});

const githubAuthSchema = Joi.object({
  code: Joi.string().required().messages({
    "string.empty": "GitHub authorization code is required.",
  }),
});

const updateProfileSchema = Joi.object({
  username: Joi.string().trim().min(2).max(50).optional(),
  email: Joi.string().trim().email().optional(),
});

// ----------------------------------------------------
// AI Endpoint Schemas (Token Exhaustion Prevention)
// ----------------------------------------------------
const aiReviewSchema = Joi.object({
  code: Joi.string().trim().required().max(10000).messages({
    "string.empty": "Code snippet cannot be empty.",
    "string.max": "Code snippet exceeds maximum limit of 10,000 characters to prevent API token exhaustion.",
  }),
  language: Joi.string().optional().allow("", null),
  type: Joi.string().valid("hints", "analysis").optional().default("hints"),
  problemTitle: Joi.string().max(200).optional().allow("", null),
  problemDescription: Joi.string().max(2000).optional().allow("", null),
});

// ----------------------------------------------------
// Code Execution Schemas
// ----------------------------------------------------
const runCodeSchema = Joi.object({
  language: Joi.string().required().messages({
    "string.empty": "Language is required.",
  }),
  code: Joi.string().allow("").max(20000).required().messages({
    "string.max": "Code exceeds maximum allowed size of 20,000 characters.",
  }),
  stdin: Joi.string().allow("").max(5000).optional(),
  stdinInput: Joi.string().allow("").max(5000).optional(),
  roomId: Joi.string().allow("").optional(),
  roomCode: Joi.string().allow("").optional(),
});

// ----------------------------------------------------
// Workspace Schemas
// ----------------------------------------------------
const createWorkspaceSchema = Joi.object({
  title: Joi.string().trim().max(100).optional().allow("", null),
  language: Joi.string().optional().allow("", null),
  customInput: Joi.string().max(5000).optional().allow("", null),
});

const updateWorkspaceSchema = Joi.object({
  title: Joi.string().trim().max(100).optional(),
  code: Joi.string().allow("").max(50000).optional(),
  language: Joi.string().optional(),
  files: Joi.array().optional(),
  customInput: Joi.string().allow("").max(5000).optional(),
  isPublic: Joi.boolean().optional(),
});

// ----------------------------------------------------
// Problem Submission Schema
// ----------------------------------------------------
const submitProblemSchema = Joi.object({
  language: Joi.string().required().messages({
    "string.empty": "Language is required for submission.",
  }),
  code: Joi.string().allow("").max(20000).required().messages({
    "string.max": "Submission code exceeds maximum limit of 20,000 characters.",
  }),
});

module.exports = {
  validateBody,
  authSchemas: {
    register: registerSchema,
    login: loginSchema,
    sendOtp: sendOtpSchema,
    verifyOtp: verifyOtpSchema,
    googleAuth: googleAuthSchema,
    githubAuth: githubAuthSchema,
    updateProfile: updateProfileSchema,
  },
  aiSchemas: {
    review: aiReviewSchema,
  },
  runSchemas: {
    run: runCodeSchema,
  },
  workspaceSchemas: {
    create: createWorkspaceSchema,
    update: updateWorkspaceSchema,
  },
  problemSchemas: {
    submit: submitProblemSchema,
  },
};

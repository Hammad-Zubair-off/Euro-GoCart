const jwt = require('jsonwebtoken');
const env = require('../config/env');
const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?name=User';

const authenticate = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw new ApiError(401, 'Missing or invalid Authorization header');
  }

  const token = header.slice(7);
  let payload;
  try {
    // Supabase access tokens are HS256-signed with the project JWT secret
    payload = jwt.verify(token, env.SUPABASE_JWT_SECRET);
  } catch {
    throw new ApiError(401, 'Invalid or expired token');
  }

  const userId = payload.sub;
  const email = payload.email;
  if (!userId || !email) {
    throw new ApiError(401, 'Token missing required claims');
  }

  const meta = payload.user_metadata || {};
  const name =
    meta.full_name || meta.name || email.split('@')[0];
  const image = meta.avatar_url || DEFAULT_AVATAR;

  // Upsert mirrors Supabase user into our User row; cart only set on create
  const user = await prisma.user.upsert({
    where: { id: userId },
    create: {
      id: userId,
      email,
      name,
      image,
      cart: {},
    },
    update: {
      email,
      name,
      image,
    },
  });

  req.user = user;
  next();
});

const requireApprovedSeller = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    throw new ApiError(401, 'Authentication required');
  }

  const store = await prisma.store.findUnique({
    where: { userId: req.user.id },
  });

  if (!store || store.status !== 'approved' || !store.isActive) {
    throw new ApiError(403, 'Approved and active seller store required');
  }

  req.store = store;
  next();
});

const requireAdmin = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    throw new ApiError(401, 'Authentication required');
  }

  const email = (req.user.email || '').toLowerCase();
  if (!env.adminEmails.includes(email)) {
    throw new ApiError(403, 'Admin access required');
  }

  next();
});

module.exports = { authenticate, requireApprovedSeller, requireAdmin };

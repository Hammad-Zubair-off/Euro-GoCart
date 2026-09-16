const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { getPagination, paginatedResult } = require('../utils/pagination');
const { uploadBuffer } = require('../services/cloudinary.service');

const listProducts = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { search, category, storeUsername, sort } = req.query;

  const where = {
    inStock: true,
    store: {
      isActive: true,
      status: 'approved',
      ...(storeUsername ? { username: storeUsername } : {}),
    },
    ...(category ? { category } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  let orderBy = { createdAt: 'desc' };
  if (sort === 'price_asc') orderBy = { price: 'asc' };
  else if (sort === 'price_desc') orderBy = { price: 'desc' };
  else if (sort === 'newest') orderBy = { createdAt: 'desc' };

  // rating sort: fetch then sort by average in memory for simplicity
  if (sort === 'rating') {
    const [allItems, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          store: { select: { id: true, name: true, username: true, logo: true } },
          rating: true,
        },
      }),
      prisma.product.count({ where }),
    ]);

    const withAvg = allItems
      .map((p) => {
        const avg =
          p.rating.length > 0
            ? p.rating.reduce((s, r) => s + r.rating, 0) / p.rating.length
            : 0;
        return { ...p, avgRating: avg };
      })
      .sort((a, b) => b.avgRating - a.avgRating);

    const items = withAvg.slice(skip, skip + limit);
    return ApiResponse.send(res, 200, paginatedResult(items, total, page, limit));
  }

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        store: { select: { id: true, name: true, username: true, logo: true } },
        rating: true,
      },
    }),
    prisma.product.count({ where }),
  ]);

  return ApiResponse.send(res, 200, paginatedResult(items, total, page, limit));
});

const getProductById = asyncHandler(async (req, res) => {
  const product = await prisma.product.findFirst({
    where: {
      id: req.params.id,
      inStock: true,
      store: { isActive: true, status: 'approved' },
    },
    include: {
      store: { select: { id: true, name: true, username: true, logo: true } },
      rating: {
        include: {
          user: { select: { name: true, image: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  return ApiResponse.send(res, 200, product);
});

const createProduct = asyncHandler(async (req, res) => {
  const files = req.files || [];
  if (files.length === 0) {
    throw new ApiError(400, 'At least one product image is required');
  }

  const imageUrls = await Promise.all(
    files.map((file) => uploadBuffer(file.buffer, 'euro-gocart/products'))
  );

  const { name, description, mrp, price, category } = req.body;

  const product = await prisma.product.create({
    data: {
      name,
      description,
      mrp,
      price,
      category,
      images: imageUrls,
      storeId: req.store.id,
    },
  });

  return ApiResponse.send(res, 201, product);
});

const updateProduct = asyncHandler(async (req, res) => {
  const existing = await prisma.product.findFirst({
    where: { id: req.params.id, storeId: req.store.id },
  });
  if (!existing) {
    throw new ApiError(404, 'Product not found');
  }

  const data = { ...req.body };

  if (req.files && req.files.length > 0) {
    data.images = await Promise.all(
      req.files.map((file) => uploadBuffer(file.buffer, 'euro-gocart/products'))
    );
  }

  const product = await prisma.product.update({
    where: { id: existing.id },
    data,
  });

  return ApiResponse.send(res, 200, product);
});

const toggleStock = asyncHandler(async (req, res) => {
  const existing = await prisma.product.findFirst({
    where: { id: req.params.id, storeId: req.store.id },
  });
  if (!existing) {
    throw new ApiError(404, 'Product not found');
  }

  const product = await prisma.product.update({
    where: { id: existing.id },
    data: { inStock: !existing.inStock },
  });

  return ApiResponse.send(res, 200, product);
});

const deleteProduct = asyncHandler(async (req, res) => {
  const existing = await prisma.product.findFirst({
    where: { id: req.params.id, storeId: req.store.id },
  });
  if (!existing) {
    throw new ApiError(404, 'Product not found');
  }

  await prisma.product.delete({ where: { id: existing.id } });

  return ApiResponse.send(res, 200, { id: existing.id });
});

module.exports = {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  toggleStock,
  deleteProduct,
};

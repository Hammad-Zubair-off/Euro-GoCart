const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const createRating = asyncHandler(async (req, res) => {
  const { orderId, productId, rating, review } = req.body;

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: req.user.id },
    include: { orderItems: true },
  });

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  if (order.status !== 'DELIVERED') {
    throw new ApiError(400, 'You can only rate products from delivered orders');
  }

  const hasProduct = order.orderItems.some((item) => item.productId === productId);
  if (!hasProduct) {
    throw new ApiError(400, 'Product is not part of this order');
  }

  try {
    const created = await prisma.rating.create({
      data: {
        orderId,
        productId,
        rating,
        review,
        userId: req.user.id,
      },
      include: {
        user: { select: { name: true, image: true } },
        product: { select: { id: true, name: true } },
      },
    });

    return ApiResponse.send(res, 201, created);
  } catch (err) {
    // Schema @@unique([userId, productId, orderId])
    if (err.code === 'P2002') {
      throw new ApiError(409, 'You have already rated this product for this order');
    }
    throw err;
  }
});

module.exports = { createRating };

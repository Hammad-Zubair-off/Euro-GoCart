/**
 * Seed dummy sellers, stores, products (with Cloudinary images), and coupons.
 * Run: npm run seed
 */
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { v2: cloudinary } = require('cloudinary');

const prisma = new PrismaClient();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadFromUrl(url, folder, publicId) {
  try {
    const result = await cloudinary.uploader.upload(url, {
      folder,
      public_id: publicId,
      overwrite: true,
    });
    return result.secure_url;
  } catch (err) {
    console.warn(`\nUpload failed for ${url}: ${err.message}. Using source URL as fallback.`);
    return url;
  }
}

// Public product photos from Unsplash (hotlinked sources uploaded into Cloudinary)
const PRODUCTS = [
  {
    name: 'Modern table lamp',
    description:
      'Modern table lamp with a sleek design. Perfect for any room. High-quality materials with warm ambient lighting.',
    mrp: 40,
    price: 29,
    category: 'Decoration',
    imageSources: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80',
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800&q=80',
    ],
  },
  {
    name: 'Smart speaker gray',
    description: 'Smart speaker with rich sound and voice assistant support. Sleek gray finish for modern homes.',
    mrp: 50,
    price: 29,
    category: 'Speakers',
    imageSources: [
      'https://images.unsplash.com/photo-1589003077984-894e133dabab?w=800&q=80',
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&q=80',
    ],
  },
  {
    name: 'Smart watch white',
    description: 'White smart watch with fitness tracking, notifications, and all-day battery life.',
    mrp: 60,
    price: 29,
    category: 'Watch',
    imageSources: [
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&q=80',
    ],
  },
  {
    name: 'Wireless headphones',
    description: 'Over-ear wireless headphones with noise isolation and premium comfort for long listening sessions.',
    mrp: 70,
    price: 29,
    category: 'Headphones',
    imageSources: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
      'https://images.unsplash.com/photo-1625245488600-f03fef636a3c?w=800&q=80',
    ],
  },
  {
    name: 'Smart watch black',
    description: 'Black smart watch with AMOLED display, heart-rate monitor, and water resistance.',
    mrp: 49,
    price: 29,
    category: 'Watch',
    imageSources: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&q=80',
    ],
  },
  {
    name: 'Security Camera',
    description: 'HD security camera with night vision, motion alerts, and app monitoring.',
    mrp: 59,
    price: 29,
    category: 'Camera',
    imageSources: [
      'https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?w=800&q=80',
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=80',
    ],
  },
  {
    name: 'Smart Pen for iPad',
    description: 'Precision stylus for tablets with pressure sensitivity and magnetic attach.',
    mrp: 89,
    price: 29,
    category: 'Pen',
    imageSources: [
      'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&q=80',
    ],
  },
  {
    name: 'Home Theater',
    description: 'Compact home theater soundbar system with deep bass and cinematic surround modes.',
    mrp: 99,
    price: 29,
    category: 'Theater',
    imageSources: [
      'https://images.unsplash.com/photo-1593359677197-fd1715654f1e?w=800&q=80',
      'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800&q=80',
    ],
  },
  {
    name: 'Apple Wireless Earbuds',
    description: 'True wireless earbuds with clear calls, touch controls, and compact charging case.',
    mrp: 89,
    price: 29,
    category: 'Earbuds',
    imageSources: [
      'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800&q=80',
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80',
    ],
  },
  {
    name: 'Apple Smart Watch',
    description: 'Premium smart watch with health sensors, GPS, and customizable watch faces.',
    mrp: 179,
    price: 29,
    category: 'Watch',
    imageSources: [
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80',
      'https://images.unsplash.com/photo-1617043983671-adaadcaa2460?w=800&q=80',
    ],
  },
  {
    name: 'RGB Gaming Mouse',
    description: 'Ergonomic RGB gaming mouse with programmable buttons and high DPI sensor.',
    mrp: 39,
    price: 29,
    category: 'Mouse',
    imageSources: [
      'https://images.unsplash.com/photo-1527814050087-3793815479db?w=800&q=80',
      'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&q=80',
    ],
  },
  {
    name: 'Smart Home Cleaner',
    description: 'Robot vacuum cleaner with smart mapping, app control, and auto-dock charging.',
    mrp: 199,
    price: 29,
    category: 'Cleaner',
    imageSources: [
      'https://images.unsplash.com/photo-1558317374-067fb5f3094d?w=800&q=80',
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80',
    ],
  },
];

const STORES = [
  {
    userId: 'seed_seller_happy',
    userName: 'Hammad Zubair',
    userEmail: 'happyshop@example.com',
    name: 'Happy Shop',
    username: 'happyshop',
    description: 'Quality gadgets and home electronics at everyday prices.',
    address: '123 Market Street, Berlin, Germany',
    email: 'happyshop@example.com',
    contact: '+49 1234567890',
    logoSource: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400&q=80',
  },
  {
    userId: 'seed_seller_eurotech',
    userName: 'Euro Tech Seller',
    userEmail: 'eurotech@example.com',
    name: 'Euro Tech',
    username: 'eurotech',
    description: 'Premium tech accessories across Europe.',
    address: '45 Tech Avenue, Amsterdam, Netherlands',
    email: 'eurotech@example.com',
    contact: '+31 987654321',
    logoSource: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&q=80',
  },
];

async function main() {
  console.log('Cleaning previous seed data...');
  await prisma.rating.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.address.deleteMany({});
  await prisma.coupon.deleteMany({});
  await prisma.store.deleteMany({});
  await prisma.user.deleteMany({
    where: { id: { in: [...STORES.map((s) => s.userId), 'seed_buyer_1'] } },
  });

  console.log('Creating buyer + sellers...');
  await prisma.user.create({
    data: {
      id: 'seed_buyer_1',
      name: 'Demo Buyer',
      email: 'buyer@example.com',
      image: 'https://ui-avatars.com/api/?name=Demo+Buyer',
      cart: {},
    },
  });

  const storeIds = [];

  for (const s of STORES) {
    await prisma.user.create({
      data: {
        id: s.userId,
        name: s.userName,
        email: s.userEmail,
        image: `https://ui-avatars.com/api/?name=${encodeURIComponent(s.userName)}`,
        cart: {},
      },
    });

    console.log(`Uploading logo for ${s.name}...`);
    const logo = await uploadFromUrl(s.logoSource, 'euro-gocart/stores', s.username);

    const store = await prisma.store.create({
      data: {
        userId: s.userId,
        name: s.name,
        username: s.username,
        description: s.description,
        address: s.address,
        email: s.email,
        contact: s.contact,
        logo,
        status: 'approved',
        isActive: true,
      },
    });
    storeIds.push(store.id);
    console.log(`Store ready: ${store.username} (${store.id})`);
  }

  console.log('Uploading product images + creating products...');
  for (let i = 0; i < PRODUCTS.length; i++) {
    const p = PRODUCTS[i];
    const storeId = storeIds[i % storeIds.length];
    const images = [];

    for (let j = 0; j < p.imageSources.length; j++) {
      const slug = p.name.toLowerCase().replace(/\s+/g, '-').slice(0, 40);
      const url = await uploadFromUrl(
        p.imageSources[j],
        'euro-gocart/products',
        `${slug}-${j + 1}`
      );
      images.push(url);
      process.stdout.write('.');
    }

    await prisma.product.create({
      data: {
        name: p.name,
        description: p.description,
        mrp: p.mrp,
        price: p.price,
        category: p.category,
        images,
        inStock: true,
        storeId,
      },
    });
  }
  console.log('\nProducts created.');

  console.log('Creating coupons...');
  await prisma.coupon.createMany({
    data: [
      {
        code: 'WELCOME10',
        description: '10% off for everyone',
        discount: 10,
        forNewUser: false,
        forMember: false,
        isPublic: true,
        expiresAt: new Date('2027-12-31'),
      },
      {
        code: 'NEW20',
        description: '20% off for new users',
        discount: 20,
        forNewUser: true,
        forMember: false,
        isPublic: true,
        expiresAt: new Date('2027-12-31'),
      },
      {
        code: 'SAVE15',
        description: '15% member style discount (placeholder)',
        discount: 15,
        forNewUser: false,
        forMember: true,
        isPublic: true,
        expiresAt: new Date('2027-12-31'),
      },
    ],
  });

  const productCount = await prisma.product.count();
  const storeCount = await prisma.store.count();
  console.log(`Done. ${storeCount} stores, ${productCount} products seeded.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

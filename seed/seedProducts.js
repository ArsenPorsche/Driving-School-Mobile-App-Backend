const mongoose = require("mongoose");
const Product = require("../models/Product");
require("dotenv").config();

const products = [
  {
    code: "basic-course",
    title: "Basic course",
    description: "15 driving sessions, 5 theory classes, medical exam, practical exam and endless attempts at the theoretical exams included. Perfect to start!",
    category: "course",
    priceMinor: 340000, // 3400 PLN
    currency: "PLN",
    entitlements: [
      { unit: "lesson", count: 15 },
      { unit: "exam", count: 1 }
    ],
    active: true
  },
  {
    code: "single-lesson",
    title: "Driving lesson",
    description: "Single practical driving session",
    category: "single",
    priceMinor: 20000,
    currency: "PLN",
    entitlements: [
      { unit: "lesson", count: 1 }
    ],
    active: true
  },
  {
    code: "package-10",
    title: "10‑lesson package",
    description: "10 practical driving sessions",
    category: "bundle",
    priceMinor: 190000,
    currency: "PLN",
    entitlements: [
      { unit: "lesson", count: 10 }
    ],
    active: true
  },
  {
    code: "package-5",
    title: "5‑lesson package",
    description: "5 practical driving sessions",
    category: "bundle",
    priceMinor: 95000,
    currency: "PLN",
    entitlements: [
      { unit: "lesson", count: 5 }
    ],
    active: true
  },
  {
    code: "internal-exam",
    title: "Practical exam",
    description: "Internal practical exam",
    category: "single",
    priceMinor: 10000,
    currency: "PLN",
    entitlements: [
      { unit: "exam", count: 1 }
    ],
    active: true
  }
];

async function seedProducts() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    console.log('Connected to MongoDB');
    
    await Product.deleteMany({});
    console.log('Cleared existing products');
    
    const createdProducts = await Product.insertMany(products);
    console.log(`Created ${createdProducts.length} products:`);
    
    createdProducts.forEach(product => {
      console.log(`- ${product.code}: ${product.title} (${product.priceMinor/100} ${product.currency})`);
    });
    
  } catch (error) {
    console.error('Error seeding products:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Запуск якщо викликано напряму
if (require.main === module) {
  seedProducts();
}

module.exports = { seedProducts, products };
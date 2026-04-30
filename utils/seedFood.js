const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Food = require('../models/Food');
const Category = require('../models/Category');

dotenv.config({ path: './.env' }); // Current directory when running from backend-improve

const seedData = async () => {
  try {
    // 1. Connect to DB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/food-delivery');
    console.log('Connected to MongoDB for Seeding...');

    // 2. Clear existing data (Optional, but good for clean seed)
    await Food.deleteMany();
    await Category.deleteMany();
    console.log('Old data cleared.');

    // 3. Create Categories
    const categories = await Category.insertMany([
      { name: 'Healthy & Fresh' },
      { name: 'Fast Food' },
      { name: 'Desi Special' },
      { name: 'Diet & Keto' },
      { name: 'Beverages' }
    ]);

    const catMap = {};
    categories.forEach(c => catMap[c.name] = c._id);

    // 4. Create Food Items
    const foodItems = [
      // --- Healthy ---
      {
        name: 'Quinoa Avocado Salad',
        description: 'Super healthy salad with quinoa, fresh avocado, lime, and olive oil. Great for heart health and digestion.',
        price: 12.5,
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd',
        category: catMap['Healthy & Fresh'],
        rating: 4.8,
        numReviews: 120,
        isAvailable: true
      },
      {
        name: 'Grilled Salmon with Asparagus',
        description: 'Rich in Omega-3. Perfect for a protein-rich healthy dinner.',
        price: 22.0,
        image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288',
        category: catMap['Healthy & Fresh'],
        rating: 4.9,
        numReviews: 85,
        isAvailable: true
      },

      // --- Trending ---
      {
        name: 'Spicy Zinger Max',
        description: 'Our most popular crispy chicken burger with secret spicy sauce. A trending favorite!',
        price: 8.99,
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd',
        category: catMap['Fast Food'],
        rating: 4.7,
        numReviews: 500,
        isAvailable: true
      },
      {
        name: 'Loaded Cheesy Fries',
        description: 'Golden fries topped with melted mozzarella, jalapenos, and ranch. Everyone is ordering this!',
        price: 6.5,
        image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877',
        category: catMap['Fast Food'],
        rating: 4.6,
        numReviews: 320,
        isAvailable: true
      },

      // --- Diet ---
      {
        name: 'Keto Power Bowl',
        description: 'Low carb bowl with grilled chicken, boiled eggs, spinach, and walnuts. Perfect for Keto diet.',
        price: 14.0,
        image: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6',
        category: catMap['Diet & Keto'],
        rating: 4.5,
        numReviews: 150,
        isAvailable: true
      },
      {
        name: 'Low-Carb Turkey Wrap',
        description: 'Whole wheat low-carb tortilla with lean turkey breast and fresh veggies.',
        price: 9.5,
        image: 'https://images.unsplash.com/photo-1626700051175-656fc7d30ba2',
        category: catMap['Diet & Keto'],
        rating: 4.3,
        numReviews: 90,
        isAvailable: true
      },

      // --- Health Issues Specific ---
      {
        name: 'Clear Chicken Broth',
        description: 'Light and soothing soup. Highly recommended if you have a stomach ache or fever.',
        price: 5.5,
        image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd',
        category: catMap['Healthy & Fresh'],
        rating: 4.8,
        numReviews: 45,
        isAvailable: true
      },
      {
        name: 'Sugar-Free Berry Smoothie',
        description: 'Refreshing smoothie with zero added sugar. Safe for Diabetic patients.',
        price: 7.0,
        image: 'https://images.unsplash.com/photo-1553531384-cc64ac80f931',
        category: catMap['Beverages'],
        rating: 4.4,
        numReviews: 60,
        isAvailable: true
      }
    ];

    await Food.insertMany(foodItems);
    console.log('✅ Success: All categories and food items seeded!');

    process.exit();
  } catch (error) {
    console.error('❌ Error seeding data:', error.message);
    process.exit(1);
  }
};

seedData();

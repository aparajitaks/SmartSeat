const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Branch = require('../models/Branch');
const Table = require('../models/Table');
const Reservation = require('../models/Reservation');
const Review = require('../models/Review');
const { generateReservationId } = require('../utils/generateId');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Restaurant.deleteMany({}),
      Branch.deleteMany({}),
      Table.deleteMany({}),
      Reservation.deleteMany({}),
      Review.deleteMany({}),
    ]);
    console.log('Cleared existing data');

    // ─── Create Users ───
    const users = await User.create([
      {
        name: 'Admin User',
        email: 'admin@smartseat.com',
        password: 'admin123',
        phone: '+91 9000000001',
        role: 'admin',
      },
      {
        name: 'Rajesh Kumar',
        email: 'rajesh@restaurant.com',
        password: 'owner123',
        phone: '+91 9000000002',
        role: 'restaurant_owner',
      },
      {
        name: 'Priya Sharma',
        email: 'priya@restaurant.com',
        password: 'owner123',
        phone: '+91 9000000003',
        role: 'restaurant_owner',
      },
      {
        name: 'Amit Patel',
        email: 'amit@customer.com',
        password: 'customer123',
        phone: '+91 9000000004',
        role: 'customer',
      },
      {
        name: 'Sneha Reddy',
        email: 'sneha@customer.com',
        password: 'customer123',
        phone: '+91 9000000005',
        role: 'customer',
      },
      {
        name: 'Vikram Singh',
        email: 'vikram@customer.com',
        password: 'customer123',
        phone: '+91 9000000006',
        role: 'customer',
      },
    ]);

    const [admin, owner1, owner2, customer1, customer2, customer3] = users;
    console.log(`Created ${users.length} users`);

    // ─── Create Restaurants ───
    const restaurants = await Restaurant.create([
      {
        name: 'Spice Garden',
        description:
          'An exquisite fine dining experience specializing in authentic North Indian cuisine with a modern twist. Our award-winning chefs craft every dish with passion and the finest ingredients.',
        cuisine: ['North Indian', 'Mughlai', 'Tandoori'],
        address: {
          street: '42 MG Road',
          city: 'Bangalore',
          state: 'Karnataka',
          zipCode: '560001',
          country: 'India',
        },
        phone: '+91 80 4567 8901',
        email: 'info@spicegarden.com',
        owner: owner1._id,
        operatingHours: { open: '11:00', close: '23:00' },
        priceRange: '$$$',
        features: ['wifi', 'parking', 'outdoor_seating', 'valet_parking', 'private_dining'],
        rating: { average: 4.5, count: 12 },
      },
      {
        name: 'The Coastal Kitchen',
        description:
          'Fresh seafood and coastal delicacies from across India. Experience the flavors of Goa, Kerala, and Mangalore in every bite. Outdoor seating with ocean-inspired ambiance.',
        cuisine: ['Seafood', 'Coastal', 'Goan', 'Kerala'],
        address: {
          street: '15 Residency Road',
          city: 'Bangalore',
          state: 'Karnataka',
          zipCode: '560025',
          country: 'India',
        },
        phone: '+91 80 2345 6789',
        email: 'hello@coastalkitchen.com',
        owner: owner1._id,
        operatingHours: { open: '12:00', close: '22:30' },
        priceRange: '$$',
        features: ['wifi', 'outdoor_seating', 'pet_friendly', 'wheelchair_accessible'],
        rating: { average: 4.2, count: 8 },
      },
      {
        name: 'Sakura Japanese Bistro',
        description:
          'Authentic Japanese dining featuring fresh sushi, ramen, and teppanyaki. Our chefs trained in Tokyo bring you an unforgettable culinary journey through Japan.',
        cuisine: ['Japanese', 'Sushi', 'Ramen', 'Asian'],
        address: {
          street: '88 Indiranagar',
          city: 'Bangalore',
          state: 'Karnataka',
          zipCode: '560038',
          country: 'India',
        },
        phone: '+91 80 6789 0123',
        email: 'dine@sakurabistro.com',
        owner: owner2._id,
        operatingHours: { open: '12:00', close: '23:00' },
        priceRange: '$$$$',
        features: ['wifi', 'parking', 'private_dining', 'live_music'],
        rating: { average: 4.7, count: 15 },
      },
      {
        name: 'Green Leaf Café',
        description:
          'A cozy café offering organic, plant-based meals, artisan coffee, and fresh juices. The perfect spot for a healthy brunch or a quiet afternoon with a book.',
        cuisine: ['Café', 'Vegetarian', 'Vegan', 'Continental'],
        address: {
          street: '23 Koramangala 5th Block',
          city: 'Bangalore',
          state: 'Karnataka',
          zipCode: '560095',
          country: 'India',
        },
        phone: '+91 80 3456 7890',
        email: 'hello@greenleafcafe.com',
        owner: owner2._id,
        operatingHours: { open: '08:00', close: '21:00' },
        priceRange: '$$',
        features: ['wifi', 'outdoor_seating', 'pet_friendly', 'wheelchair_accessible'],
        rating: { average: 4.3, count: 20 },
      },
    ]);

    console.log(`Created ${restaurants.length} restaurants`);

    // ─── Create Branches ───
    const branches = await Branch.create([
      // Spice Garden branches
      {
        restaurant: restaurants[0]._id,
        name: 'Spice Garden - MG Road',
        address: {
          street: '42 MG Road',
          city: 'Bangalore',
          state: 'Karnataka',
          zipCode: '560001',
        },
        phone: '+91 80 4567 8901',
        operatingHours: { open: '11:00', close: '23:00' },
        totalTables: 8,
      },
      {
        restaurant: restaurants[0]._id,
        name: 'Spice Garden - Whitefield',
        address: {
          street: '10 ITPL Main Road',
          city: 'Bangalore',
          state: 'Karnataka',
          zipCode: '560066',
        },
        phone: '+91 80 4567 8902',
        operatingHours: { open: '11:00', close: '23:00' },
        totalTables: 6,
      },
      // Coastal Kitchen
      {
        restaurant: restaurants[1]._id,
        name: 'The Coastal Kitchen - Main',
        address: {
          street: '15 Residency Road',
          city: 'Bangalore',
          state: 'Karnataka',
          zipCode: '560025',
        },
        phone: '+91 80 2345 6789',
        operatingHours: { open: '12:00', close: '22:30' },
        totalTables: 7,
      },
      // Sakura
      {
        restaurant: restaurants[2]._id,
        name: 'Sakura - Indiranagar',
        address: {
          street: '88 Indiranagar',
          city: 'Bangalore',
          state: 'Karnataka',
          zipCode: '560038',
        },
        phone: '+91 80 6789 0123',
        operatingHours: { open: '12:00', close: '23:00' },
        totalTables: 6,
      },
      // Green Leaf
      {
        restaurant: restaurants[3]._id,
        name: 'Green Leaf - Koramangala',
        address: {
          street: '23 Koramangala 5th Block',
          city: 'Bangalore',
          state: 'Karnataka',
          zipCode: '560095',
        },
        phone: '+91 80 3456 7890',
        operatingHours: { open: '08:00', close: '21:00' },
        totalTables: 5,
      },
    ]);

    console.log(`Created ${branches.length} branches`);

    // ─── Create Tables ───
    const tableData = [];

    // Spice Garden MG Road - 8 tables
    const sgTables = [
      { branch: branches[0]._id, tableNumber: 'T1', capacity: 2, location: 'indoor' },
      { branch: branches[0]._id, tableNumber: 'T2', capacity: 2, location: 'indoor' },
      { branch: branches[0]._id, tableNumber: 'T3', capacity: 4, location: 'indoor' },
      { branch: branches[0]._id, tableNumber: 'T4', capacity: 4, location: 'outdoor' },
      { branch: branches[0]._id, tableNumber: 'T5', capacity: 6, location: 'indoor' },
      { branch: branches[0]._id, tableNumber: 'T6', capacity: 6, location: 'terrace' },
      { branch: branches[0]._id, tableNumber: 'T7', capacity: 8, location: 'private_room' },
      { branch: branches[0]._id, tableNumber: 'T8', capacity: 10, location: 'private_room' },
    ];

    // Spice Garden Whitefield - 6 tables
    const sgwTables = [
      { branch: branches[1]._id, tableNumber: 'T1', capacity: 2, location: 'indoor' },
      { branch: branches[1]._id, tableNumber: 'T2', capacity: 4, location: 'indoor' },
      { branch: branches[1]._id, tableNumber: 'T3', capacity: 4, location: 'outdoor' },
      { branch: branches[1]._id, tableNumber: 'T4', capacity: 6, location: 'indoor' },
      { branch: branches[1]._id, tableNumber: 'T5', capacity: 8, location: 'terrace' },
      { branch: branches[1]._id, tableNumber: 'T6', capacity: 10, location: 'private_room' },
    ];

    // Coastal Kitchen - 7 tables
    const ckTables = [
      { branch: branches[2]._id, tableNumber: 'T1', capacity: 2, location: 'indoor' },
      { branch: branches[2]._id, tableNumber: 'T2', capacity: 2, location: 'outdoor' },
      { branch: branches[2]._id, tableNumber: 'T3', capacity: 4, location: 'indoor' },
      { branch: branches[2]._id, tableNumber: 'T4', capacity: 4, location: 'outdoor' },
      { branch: branches[2]._id, tableNumber: 'T5', capacity: 6, location: 'indoor' },
      { branch: branches[2]._id, tableNumber: 'T6', capacity: 6, location: 'terrace' },
      { branch: branches[2]._id, tableNumber: 'T7', capacity: 8, location: 'indoor' },
    ];

    // Sakura - 6 tables
    const sakuraTables = [
      { branch: branches[3]._id, tableNumber: 'T1', capacity: 2, location: 'bar' },
      { branch: branches[3]._id, tableNumber: 'T2', capacity: 2, location: 'indoor' },
      { branch: branches[3]._id, tableNumber: 'T3', capacity: 4, location: 'indoor' },
      { branch: branches[3]._id, tableNumber: 'T4', capacity: 4, location: 'private_room' },
      { branch: branches[3]._id, tableNumber: 'T5', capacity: 6, location: 'indoor' },
      { branch: branches[3]._id, tableNumber: 'T6', capacity: 8, location: 'private_room' },
    ];

    // Green Leaf - 5 tables
    const glTables = [
      { branch: branches[4]._id, tableNumber: 'T1', capacity: 2, location: 'indoor' },
      { branch: branches[4]._id, tableNumber: 'T2', capacity: 2, location: 'outdoor' },
      { branch: branches[4]._id, tableNumber: 'T3', capacity: 4, location: 'indoor' },
      { branch: branches[4]._id, tableNumber: 'T4', capacity: 4, location: 'outdoor' },
      { branch: branches[4]._id, tableNumber: 'T5', capacity: 6, location: 'indoor' },
    ];

    tableData.push(...sgTables, ...sgwTables, ...ckTables, ...sakuraTables, ...glTables);
    const tables = await Table.create(tableData);
    console.log(`Created ${tables.length} tables`);

    // ─── Create Sample Reservations ───
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(today);
    dayAfter.setDate(dayAfter.getDate() + 2);

    const reservations = await Reservation.create([
      {
        reservationId: generateReservationId(),
        user: customer1._id,
        restaurant: restaurants[0]._id,
        branch: branches[0]._id,
        table: tables[2]._id, // T3, 4-seater
        date: tomorrow,
        timeSlot: { start: '19:00', end: '21:00' },
        partySize: 3,
        status: 'confirmed',
        specialRequests: 'Window seat preferred',
      },
      {
        reservationId: generateReservationId(),
        user: customer2._id,
        restaurant: restaurants[2]._id,
        branch: branches[3]._id,
        table: tables[tables.length - 5]._id,
        date: tomorrow,
        timeSlot: { start: '20:00', end: '22:00' },
        partySize: 2,
        status: 'confirmed',
      },
      {
        reservationId: generateReservationId(),
        user: customer3._id,
        restaurant: restaurants[1]._id,
        branch: branches[2]._id,
        table: tables[16]._id, // Coastal Kitchen T3
        date: dayAfter,
        timeSlot: { start: '13:00', end: '15:00' },
        partySize: 4,
        status: 'confirmed',
        specialRequests: 'Birthday celebration, need cake arrangement',
      },
      {
        reservationId: generateReservationId(),
        user: customer1._id,
        restaurant: restaurants[3]._id,
        branch: branches[4]._id,
        table: tables[tables.length - 1]._id,
        date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000),
        timeSlot: { start: '10:00', end: '11:30' },
        partySize: 2,
        status: 'completed',
        completedAt: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000),
      },
    ]);
    console.log(`Created ${reservations.length} reservations`);

    // ─── Create Reviews ───
    await Review.create([
      {
        user: customer1._id,
        restaurant: restaurants[3]._id,
        reservation: reservations[3]._id,
        rating: 5,
        title: 'Amazing brunch spot!',
        comment:
          'Absolutely loved the organic smoothie bowl and the avocado toast. The ambiance is so peaceful and the staff is very friendly. Will definitely come back!',
      },
      {
        user: customer2._id,
        restaurant: restaurants[2]._id,
        rating: 4,
        title: 'Authentic Japanese flavors',
        comment:
          'The sushi was incredibly fresh and the ramen broth was rich and flavorful. A bit pricey but worth it for the quality.',
      },
      {
        user: customer3._id,
        restaurant: restaurants[0]._id,
        rating: 5,
        title: 'Best North Indian food in town',
        comment:
          'The butter chicken and garlic naan were absolutely divine. The private dining room was perfect for our family dinner.',
      },
    ]);
    console.log('Created reviews');

    console.log('\n✅ Seed data created successfully!\n');
    console.log('─── Login Credentials ───');
    console.log('Admin:    admin@smartseat.com / admin123');
    console.log('Owner 1:  rajesh@restaurant.com / owner123');
    console.log('Owner 2:  priya@restaurant.com / owner123');
    console.log('Customer: amit@customer.com / customer123');
    console.log('Customer: sneha@customer.com / customer123');
    console.log('Customer: vikram@customer.com / customer123');
    console.log('─────────────────────────\n');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();

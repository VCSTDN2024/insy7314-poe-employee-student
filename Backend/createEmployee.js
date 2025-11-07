
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Employee = require('./models/Employee');

const uri = process.env.ATLAS_URI;

mongoose.connect(uri)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('DB Error:', err));

async function createAdmin() {
  try {
    // Check if admin already exists
    const existing = await Employee.findOne({ email: 'admin@bank.com' });
    if (existing) {
      console.log('Admin already exists:', existing.email);
      await mongoose.disconnect();
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Admin123!', salt);

    // Create employee
    const employee = new Employee({
      username: 'admin',
      email: 'admin@bank.com',
      password: hashedPassword,
      role: 'admin'
    });

    await employee.save();
    console.log('Employee created successfully!');
    console.log('Login with:');
    console.log('   Email: admin@bank.com');
    console.log('   Password: Admin123!');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

createAdmin();

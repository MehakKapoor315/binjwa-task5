const mongoose = require('mongoose');
const User = require('./backend/models/User');
require('dotenv').config({ path: './backend/.env' });

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const users = await User.find({}).select('+password');
  console.log('Users:', users.map(u => ({ email: u.email, hasPassword: !!u.password, role: u.role })));
  process.exit(0);
}
check();

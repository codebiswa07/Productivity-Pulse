const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:  { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  settings: {
    trackingEnabled: { type: Boolean, default: true },
    blockingEnabled: { type: Boolean, default: true },
    blockedSites:    [{ type: String }],
    dailyGoalMinutes:{ type: Number, default: 480 },
    productiveCategories: [{ type: String }],
    timezone:        { type: String, default: 'UTC' },
  },
  streak: {
    count:    { type: Number, default: 0 },
    lastDate: { type: String, default: null },
  },
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);

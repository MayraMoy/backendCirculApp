const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  role: {
    type: String,
    enum: ['user', 'gestor', 'coordinador', 'admin', 'dev'],
    default: 'user'
  },
  isDev: {
    type: Boolean,
    default: false
  },
  active: {
    type: Boolean,
    default: true
  },
  verified: { 
    type: Boolean, default: false 
  }, // para RF01
  phone: { 
    type: String 
  },
  location: { 
    type: String 
  },
  bio: { type: String, maxlength: 500 },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  passwordChangedAt: { type: Date }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.index({ active: 1 });
userSchema.index({ resetPasswordToken: 1 });

module.exports = mongoose.model('User', userSchema);
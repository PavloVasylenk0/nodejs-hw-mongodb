import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
    },
    // ДОДАЙТЕ ЦІ ПОЛЯ ДЛЯ ОДНОРАЗОВИХ ТОКЕНІВ
    usedResetTokens: [
      {
        token: String,
        usedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.isPasswordCorrect = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// ДОДАЙТЕ ЦЕЙ МЕТОД ДЛЯ ПЕРЕВІРКИ ТОКЕНІВ
userSchema.methods.isTokenUsed = function (token) {
  return this.usedResetTokens.some((usedToken) => usedToken.token === token);
};

// ДОДАЙТЕ ЦЕЙ МЕТОД ДЛЯ ПОЗНАЧЕННЯ ТОКЕНА ЯК ВИКОРИСТАНОГО
userSchema.methods.markTokenAsUsed = function (token) {
  this.usedResetTokens.push({ token });
  // Зберігаємо тільки останні 10 токенів для безпеки
  if (this.usedResetTokens.length > 10) {
    this.usedResetTokens = this.usedResetTokens.slice(-10);
  }
};

userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.usedResetTokens;
  return user;
};

export const User = mongoose.model('User', userSchema);

"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const bookingSchema = new mongoose_1.Schema({
    mentorID: {
        type: String,
        required: [true, 'Booking Must Belong To Mentor!']
    },
    menteeID: {
        type: String,
        required: [true, 'Booking Must Belong To Mentee!']
    },
    day: {
        type: String,
        required: [true, 'Booking Must Have Day!'],
        validate: {
            validator: function (value) {
                return /^\d{4}-\d{2}-\d{2}$/.test(value);
            },
            message: 'Day must follow "YYYY-MM-DD" format'
        }
    },
    timeslot: {
        type: String,
        required: [true, 'Booking Must Have Time Slot!'],
        validate: {
            validator: function (value) {
                return /^[0-9]{2}:[0-9]{2}$/.test(value); // Validate if the slot is in "HH:mm" format
            },
            message: (props) => `${props.value} is not a valid time slot. Time slot should be in "HH:MM" format.`
        }
    },
    price: {
        type: String,
        required: true
    }
    // isPaid: {
    //   type: Boolean,
    //   default: false
    // }
    // status: {
    //   type: String,
    //   required: true,
    //   enum: ['pending', 'accepted', 'rejected'],
    //   default: 'pending'
    // }
}, { timestamps: true });
// userSchema.pre('save', async function (next) {
//   if (!this.isModified('password')) return next()
//   this.password = await bcrypt.hash(this.password, 12)
//   this.passwordConfirm = undefined
//   next()
// })
// userSchema.pre('save', function (next) {
//   if (!this.isModified('password') || this.isNew) return next()
//   this.passwordChangedAt = Date.now() - 1000
//   next()
// })
// userSchema.pre(/^find/, function (next) {
//   this.find({ active: { $ne: false } })
//   next()
// })
// userSchema.methods.correctPassword = async function (
//   candidatePassword,
//   userPassword
// ) {
//   return await bcrypt.compare(candidatePassword, userPassword)
// }
// userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
//   if (this.passwordChangedAt) {
//     const changedTimestamp = parseInt(
//       this.passwordChangedAt.getTime() / 1000,
//       10
//     )
//     return JWTTimestamp < changedTimestamp
//   }
//   return false
// }
// userSchema.methods.createPasswordResetToken = function () {
//   const resetToken = crypto.randomBytes(32).toString('hex')
//   this.passwordResetToken = crypto
//     .createHash('sha256')
//     .update(resetToken)
//     .digest('hex')
//   this.passwordResetExpires = Date.now() + 10 * 60 * 1000
//   return resetToken
// }
const Booking = mongoose_1.default.model('Booking', bookingSchema);
exports.default = Booking;

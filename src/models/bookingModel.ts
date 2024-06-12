import mongoose, { Schema } from 'mongoose'

const bookingSchema = new Schema(
  {
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
        validator: function (value: any) {
          return /^\d{4}-\d{2}-\d{2}$/.test(value)
        },
        message: 'Day must follow "YYYY-MM-DD" format'
      }
    },
    timeslot: {
      type: String,
      required: [true, 'Booking Must Have Time Slot!'],
      validate: {
        validator: function (value: string) {
          return /^[0-9]{2}:[0-9]{2}$/.test(value) // Validate if the slot is in "HH:mm" format
        },
        message: (props: any) =>
          `${props.value} is not a valid time slot. Time slot should be in "HH:MM" format.`
      }
    },
    meetingTime: {
      type: Date,
      required: [true, 'Booking must have a meeting time!']
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
  },
  { timestamps: true }
)

const Booking = mongoose.model('Booking', bookingSchema)

export default Booking

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

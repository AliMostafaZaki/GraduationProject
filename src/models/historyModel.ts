import mongoose, { Schema } from 'mongoose'

const historySchema = new Schema(
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
      type: Date
    },
    price: {
      type: String,
      required: true
    },
    mentorEmail: {
      type: String,
      required: [true, 'Booking Must Have Mentor Email!']
    },
    menteeEmail: {
      type: String,
      required: [true, 'Booking Must Have Mentee Email!']
    }
  },
  { timestamps: true }
)

const History = mongoose.model('History', historySchema)

export default History

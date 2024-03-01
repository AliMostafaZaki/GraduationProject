import mongoose, { Schema } from 'mongoose'

const availabilitySchema = new Schema({
  mentorID: {
    type: String,
    required: [true, 'Availability Must Belong To Mentor!']
  },
  sessionPrice: {
    type: Number,
    required: [true, 'Mentor Must Have Session Price!'],
    min: 0,
    max: 500
  },
  availability: {
    type: [
      {
        _id: false,
        day: {
          type: mongoose.Schema.Types.Number,
          validate: {
            validator: function (value: any) {
              return /^[0-6]$/.test(value)
            },
            message: 'Day must be a valid integer between 0 and 6'
          }
        },
        available: { type: Boolean, default: false },
        slots: {
          type: [
            {
              type: String,
              validate: {
                validator: function (value: string) {
                  return /^(0[6-9]|1[0-9]|2[0-3]):(00|15|30|45)$/.test(value) // Validate if the slot is in "HH:mm" format
                },
                message: (props: any) =>
                  `${props.value} is not a valid time slot. Time slot should be in "HH:MM" format.`
              }
            }
          ],
          // Conditional validator to allow setting slots only if available is true
          validate: [
            {
              validator: function (slots: string[]): boolean {
                return this.available ? true : slots.length === 0
              },
              message: 'Slots can only be set if available is true'
            },
            {
              validator: function (slots: string[]): boolean {
                return this.available ? slots.length > 0 : true
              },
              message: "Slots mustn't be empty if available is true"
            }
          ]
        }
      }
    ],
    validate: {
      validator: function (availabilities: any[]) {
        const uniqueDays = new Set()
        for (const availability of availabilities) {
          if (uniqueDays.has(availability.day)) return false
          uniqueDays.add(availability.day)
        }
        return true
      },
      message: 'Duplicate days are not allowed in availability'
    }
  }
})

const Availability = mongoose.model('Availability', availabilitySchema)

export default Availability

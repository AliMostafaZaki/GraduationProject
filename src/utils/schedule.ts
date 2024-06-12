import schedule from 'node-schedule'

import Bookings from '../models/bookingModel'
import Queue from '../models/queueModel'
import History from '../models/historyModel'

let activeJob = false

export default async function populateQueue() {
  while ((await Queue.countDocuments()) < 10) {
    const booking = await Bookings.findOne({}, { sort: { meetingTime: 1 } })
    console.log(booking)
    if (booking && lessThanADayAway(booking.meetingTime)) {
      await enqueue(booking)
      await Bookings.deleteOne({ _id: booking._id })
    } else {
      break
    }
  }
  if (!activeJob) {
    handleQueue()
  }
}

async function enqueue(booking: any) {
  const existingItem = await Queue.findOne({ _id: booking._id })
  if (existingItem) {
    return
  }
  await Queue.insertMany(booking)
}

async function dequeue() {
  const meeting = await Queue.findOne({}, { sort: { meetingTime: 1 } })
  if (meeting) {
    await History.insertMany(meeting)
    await Queue.deleteOne({ _id: meeting._id })
    return meeting
  }
  return null // Return null if queue is empty
}

async function handleBooking() {
  const dueMeeting = await dequeue()
  console.log('The dueMeeting', dueMeeting)
  activeJob = false
  populateQueue()
}

function validDate(meetingTime: Date) {
  const currentDate = new Date()

  if (meetingTime > currentDate) {
    return true
  } else {
    return false
  }
}

function lessThanADayAway(givenTime: Date) {
  const currentTime = new Date()

  const differenceInMilliseconds = givenTime.getTime() - currentTime.getTime()

  const differenceInHours = differenceInMilliseconds / (1000 * 60 * 60)

  return differenceInHours < 24
}

async function handleQueue() {
  const nextMeeting = await Queue.findOne({}, { sort: { meetingTime: 1 } })
  if (nextMeeting) {
    console.log(nextMeeting)
    console.log(new Date())

    if (validDate(nextMeeting.meetingTime)) {
      schedule.scheduleJob(nextMeeting.meetingTime, function () {
        handleBooking()
      })
    } else {
      handleBooking()
    }
    activeJob = true
  }
}

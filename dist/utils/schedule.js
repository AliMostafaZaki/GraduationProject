"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_schedule_1 = __importDefault(require("node-schedule"));
const bookingModel_1 = __importDefault(require("../models/bookingModel"));
const queueModel_1 = __importDefault(require("../models/queueModel"));
const historyModel_1 = __importDefault(require("../models/historyModel"));
const email_1 = __importDefault(require("../utils/email"));
let activeJob = false;
async function populateQueue() {
    while ((await queueModel_1.default.countDocuments()) < 10) {
        const booking = await bookingModel_1.default.findOne().sort({ meetingTime: 1 }).exec();
        if (booking && lessThanADayAway(booking.meetingTime)) {
            await enqueue(booking);
            await bookingModel_1.default.deleteOne({ _id: booking._id });
        }
        else {
            break;
        }
    }
    if (!activeJob) {
        handleQueue();
    }
}
exports.default = populateQueue;
async function enqueue(booking) {
    const existingItem = await queueModel_1.default.findOne({ _id: booking._id }).exec();
    if (existingItem) {
        return;
    }
    await queueModel_1.default.insertMany(booking);
}
async function dequeue() {
    const meeting = await queueModel_1.default.findOne().sort({ meetingTime: 1 }).exec();
    if (meeting) {
        await historyModel_1.default.insertMany(meeting);
        await queueModel_1.default.deleteOne({ _id: meeting._id });
        return meeting;
    }
    return null; // Return null if queue is empty
}
async function handleBooking() {
    const dueMeeting = await dequeue();
    // Get Room ID AND Prepare Session Link
    const res = await fetch(`${process.env.RADWAN_URL}/createRoom`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    });
    const { roomId } = await res.json();
    // Call Reminder Notification Endpoint FOR Mentor
    await fetch(`${process.env.RADWAN_URL}/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            receiverID: dueMeeting.mentorID,
            message: `Your session is due in 1 hour. Your Room Id is ${roomId}`
        })
    });
    // Call Reminder Notification Endpoint FOR Mentee
    await fetch(`${process.env.RADWAN_URL}/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            receiverID: dueMeeting.menteeID,
            message: `Your session is due in 1 hour. Your Room Id is ${roomId}`
        })
    });
    // Send Reminder Email
    const reminderMentor = {
        url: `${process.env.HOST_URL}/meeting/${roomId}`,
        email: dueMeeting.mentorEmail
    };
    const reminderMentee = {
        url: `${process.env.HOST_URL}/meeting/${roomId}`,
        email: dueMeeting.menteeEmail
    };
    // Extracting date and time
    await new email_1.default(reminderMentor).sendSessionReminder();
    await new email_1.default(reminderMentee).sendSessionReminder();
    activeJob = false;
    populateQueue();
}
function validDate(meetingTime) {
    const currentDate = new Date();
    if (meetingTime > currentDate) {
        return true;
    }
    else {
        return false;
    }
}
function lessThanADayAway(givenTime) {
    const currentTime = new Date();
    const differenceInMilliseconds = givenTime.getTime() - currentTime.getTime();
    const differenceInHours = differenceInMilliseconds / (1000 * 60 * 60);
    return differenceInHours < 24;
}
async function handleQueue() {
    const nextMeeting = await queueModel_1.default.findOne().sort({ meetingTime: 1 }).exec();
    if (nextMeeting) {
        if (validDate(nextMeeting.meetingTime)) {
            node_schedule_1.default.scheduleJob(nextMeeting.meetingTime, function () {
                handleBooking();
            });
        }
        else {
            handleBooking();
        }
        activeJob = true;
    }
}

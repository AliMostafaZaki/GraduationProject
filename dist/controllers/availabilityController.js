"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAvailability = exports.getAvailability = exports.setAvailability = void 0;
const availabilityModel_1 = __importDefault(require("../models/availabilityModel"));
const bookingModel_1 = __importDefault(require("../models/bookingModel"));
const catchAsync_js_1 = __importDefault(require("../utils/catchAsync.js")); // Import catchAsync function
exports.setAvailability = (0, catchAsync_js_1.default)(async (req, res) => {
    // Get ID Of Registered Mentor
    const { mentorID } = req.body;
    // Check If Mentor Has Availability Slots Or Not
    const exist = await availabilityModel_1.default.findOne({ mentorID: mentorID });
    // If Mentor Has Not Availability Slots Then Create New One
    if (!exist)
        await availabilityModel_1.default.create({ mentorID: mentorID });
    // Update Availability Slots
    const { availability, sessionPrice } = req.body;
    await availabilityModel_1.default.findOneAndUpdate({ mentorID: mentorID }, { availability: availability, sessionPrice: sessionPrice }, { runValidators: true });
    res.status(200).json({
        status: 'success'
    });
});
exports.getAvailability = (0, catchAsync_js_1.default)(async (req, res) => {
    // Get ID Of Registered Mentor
    const { mentorID } = req.body;
    await availabilityModel_1.default.findOne({ mentorID: mentorID }, { availability: 1, sessionPrice: 1, _id: 0 })
        .lean()
        .exec()
        .then((doc) => doc
        ? res.status(200).json({ status: 'success', data: doc })
        : res.status(404).json({
            code: 404,
            message: "The mentor doesn't have time slots available yet!"
        }));
});
exports.checkAvailability = (0, catchAsync_js_1.default)(async (req, res) => {
    var _a;
    // Get ID Of Mentor
    const { mentorID } = req.body;
    // Get Mentor Availability
    const available = await availabilityModel_1.default.findOne({ mentorID: mentorID }, { availability: 1, sessionPrice: 1, _id: 0 }).lean();
    if (!available) {
        return res.status(404).json({
            code: 404,
            message: "The mentor doesn't have time slots available yet!"
        });
    }
    const { availability, sessionPrice } = available;
    // Get Mentor Bookings
    const now = new Date();
    const nowDay = now.toISOString().split('T')[0];
    const bookings = await bookingModel_1.default.find({ mentorID: mentorID, day: { $gt: nowDay } }, { day: 1, timeslot: 1, _id: 0 }).lean();
    const availableDates = [];
    const nextDay = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    // Generate the next 4 weeks dates starting from the next day
    for (let i = 0; i < 28; i++) {
        const date = new Date(nextDay.getTime() + i * 24 * 60 * 60 * 1000);
        if ((_a = availability[date.getDay()]) === null || _a === void 0 ? void 0 : _a.available) {
            const availableSlots = availability[date.getDay()].slots;
            const bookedSlots = bookings
                .filter((booking) => booking.day === date.toISOString().split('T')[0])
                .map((booking) => booking.timeslot);
            // Filter out booked slots
            const freeSlots = availableSlots.filter((slot) => !bookedSlots.includes(slot));
            if (freeSlots.length > 0) {
                availableDates.push({
                    date: date.toISOString().split('T')[0],
                    freeSlots: freeSlots
                });
            }
        }
    }
    res.status(200).json({
        status: 'success',
        data: { availableDates: availableDates, sessionPrice: sessionPrice }
    });
});
// FOR REFACTOR
/*
const moment = require('moment');
const Bookings = require('./bookings'); // Assuming you have a Bookings model
const Availability = require('./availability'); // Assuming you have an Availability model

// Define the range of dates for the next 30 days
const startDate = moment().startOf('day');
const endDate = moment().add(30, 'days').endOf('day');

// Query mentor's availability schedule for the next 30 days
const mentorAvailability = await Availability.find({
  mentorID: mentorID,
  date: { $gte: startDate, $lte: endDate }
});

// Generate potential time slots for each day within the range
const potentialTimeSlots = [];
for (let date = startDate.clone(); date.isSameOrBefore(endDate); date.add(1, 'day')) {
  const availableSlotsForDay = []; // Store available slots for each day

  // Logic to generate time slots based on mentor's availability for this day
  // Example: if mentor is available from 9:00 AM to 5:00 PM, generate slots every 30 minutes

  // Push the generated slots to availableSlotsForDay array
  // ...

  // Combine slots with date to form complete time slots
  // Example: { dateTime: '2024-03-03T09:00:00', available: true }
  // ...

  potentialTimeSlots.push(...availableSlotsForDay);
}

// Query booked appointments within the next 30 days
const bookedAppointments = await Bookings.find({
  mentorID: mentorID,
  dateTime: { $gte: startDate, $lte: endDate }
});

// Filter out booked slots from potential time slots
const availableSlots = potentialTimeSlots.filter(slot => {
  return !bookedAppointments.some(appointment => {
    // Check if slot dateTime overlaps with any booked appointment
    // Example: if appointment is booked from 10:00 AM to 11:00 AM,
    // and slot is from 10:30 AM to 11:30 AM, it is considered booked
    // ...
  });
});

// Display available slots to the mentee
console.log(availableSlots);
*/
// FOR REFACTOR

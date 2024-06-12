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
const queueSchema = new mongoose_1.Schema({
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
    meetingTime: {
        type: Date
    },
    price: {
        type: String,
        required: true
    }
}, { timestamps: true });
const Queue = mongoose_1.default.model('Queue', queueSchema);
exports.default = Queue;

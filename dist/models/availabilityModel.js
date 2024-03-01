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
const availabilitySchema = new mongoose_1.Schema({
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
                    type: mongoose_1.default.Schema.Types.Number,
                    validate: {
                        validator: function (value) {
                            return /^[0-6]$/.test(value);
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
                                validator: function (value) {
                                    return /^(0[6-9]|1[0-9]|2[0-3]):(00|15|30|45)$/.test(value); // Validate if the slot is in "HH:mm" format
                                },
                                message: (props) => `${props.value} is not a valid time slot. Time slot should be in "HH:MM" format.`
                            }
                        }
                    ],
                    // Conditional validator to allow setting slots only if available is true
                    validate: [
                        {
                            validator: function (slots) {
                                return this.available ? true : slots.length === 0;
                            },
                            message: 'Slots can only be set if available is true'
                        },
                        {
                            validator: function (slots) {
                                return this.available ? slots.length > 0 : true;
                            },
                            message: "Slots mustn't be empty if available is true"
                        }
                    ]
                }
            }
        ],
        validate: {
            validator: function (availabilities) {
                const uniqueDays = new Set();
                for (const availability of availabilities) {
                    if (uniqueDays.has(availability.day))
                        return false;
                    uniqueDays.add(availability.day);
                }
                return true;
            },
            message: 'Duplicate days are not allowed in availability'
        }
    }
});
const Availability = mongoose_1.default.model('Availability', availabilitySchema);
exports.default = Availability;

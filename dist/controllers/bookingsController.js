"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymobWebhookCheckout = exports.paymobCheckoutSession = exports.getBookings = void 0;
const bookingModel_1 = __importDefault(require("../models/bookingModel"));
const availabilityModel_1 = __importDefault(require("../models/availabilityModel"));
const catchAsync_js_1 = __importDefault(require("../utils/catchAsync.js")); // Import catchAsync function
const appError_1 = __importDefault(require("../utils/appError"));
exports.getBookings = (0, catchAsync_js_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Get ID Of Registered Mentor
    const { userID } = req.body;
    yield bookingModel_1.default.find({
        $or: [{ mentorID: userID }, { menteeID: userID }]
    }, { day: 1, timeslot: 1, menteeID: 1, mentorID: 1, _id: 0 })
        .lean()
        .exec()
        .then((bookings) => bookings
        ? res.status(200).json({ status: 'success', data: bookings })
        : res.status(404).json({
            code: 404,
            message: "User doesn't have bookings yet!"
        }));
}));
exports.paymobCheckoutSession = (0, catchAsync_js_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // Get Session Details
    const { mentorID, menteeID, day, timeslot, mentorEmail, menteeEmail } = req.body;
    // 1) Get Session Price depend on mentorID
    const { sessionPrice } = yield availabilityModel_1.default.findOne({ mentorID: mentorID });
    // 2) Create paymob checkout session
    // ## 1) Authentication Request
    const apiKeyObj = { api_key: process.env.PAYMOB_API_KEY };
    const tokenRequest = yield fetch(process.env.PAYMOB_TOKENS_URL, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiKeyObj)
    });
    const { token } = yield tokenRequest.json();
    if (!token)
        return next(new appError_1.default(`Authentication Request Failed!`, 404));
    // ## 2) Order Registration API
    const orderObj = {
        auth_token: token,
        delivery_needed: 'false',
        amount_cents: sessionPrice * 100,
        currency: 'EGP',
        items: [
            {
                name: `${mentorID}#${menteeID}#${day}#${timeslot}#${mentorEmail}#${menteeEmail}`,
                amount_cents: sessionPrice * 100,
                description: 'Mentorship Session',
                quantity: 1
            }
        ]
    };
    const orderRequest = yield fetch(process.env.PAYMOB_ORDERS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderObj)
    });
    const { id } = yield orderRequest.json();
    if (!id)
        return next(new appError_1.default(`Order Registration Failed!`, 404));
    // ## 3) Payment Key Request
    const paymentKeyObj = {
        auth_token: token,
        amount_cents: sessionPrice * 100,
        expiration: 3600,
        order_id: id,
        billing_data: {
            email: 'ali.mostafa.zaki@gmail.com',
            first_name: 'Ali',
            last_name: 'Zaki',
            phone_number: '+201030044323',
            street: 'NA',
            postal_code: 'NA',
            city: 'NA',
            country: 'EG',
            state: 'NA',
            shipping_method: 'NA',
            apartment: 'NA',
            floor: 'NA',
            building: 'NA'
        },
        currency: 'EGP',
        integration_id: process.env.INTEGRATION_ID
    };
    const paymentKeyRequest = yield fetch(process.env.PAYMOB_KEYS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentKeyObj)
    });
    const response = yield paymentKeyRequest.json();
    const paymentKeyToken = response.token;
    if (!paymentKeyToken)
        return next(new appError_1.default(`Create Payment Key Failed!`, 404));
    // Card Payment
    res.status(200).json({
        status: 'success',
        payURL: `https://accept.paymob.com/api/acceptance/iframes/803305?payment_token=${paymentKeyToken}`
    });
}));
exports.paymobWebhookCheckout = (0, catchAsync_js_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Object From Returned POST Request From Paymob Server
    const bufferData = req.body; // Paymob return body that contain obj as buffer
    const stringData = bufferData.toString('utf-8'); // Convert Buffer to string using appropriate encoding (utf-8 in this case)
    const parsedData = JSON.parse(stringData); // Parse the JSON string back to a JavaScript object
    const object = parsedData.obj; // Parse the string as JSON
    if (object.success) {
        // Session Data from Paymob Req
        const details = object.order.items[0].name.split('#');
        // mentorEmail: details[4]
        // menteeEmail: details[5]
        // Create Booking
        yield bookingModel_1.default.create({
            mentorID: details[0],
            menteeID: details[1],
            day: details[2],
            timeslot: details[3],
            price: object.amount_cents / 100
        });
        res.status(200).json({ received: true });
    }
    else {
        res.status(404).json({ received: false });
    }
}));

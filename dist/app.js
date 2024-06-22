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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
// import rateLimit from 'express-rate-limit'
const helmet_1 = __importDefault(require("helmet"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
const hpp_1 = __importDefault(require("hpp"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const compression_1 = __importDefault(require("compression"));
const cors_1 = __importDefault(require("cors"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const appError_1 = __importDefault(require("./utils/appError"));
const errorController_1 = __importDefault(require("./controllers/errorController"));
const index_1 = __importDefault(require("./routes/index"));
const bookingsController_1 = require("./controllers/bookingsController");
// Start express app
const app = (0, express_1.default)();
console.log(process.env.HOST_URL);
const corsOptions = {
    origin: `${process.env.HOST_URL}`,
    methods: ['GET', 'POST', 'DELETE', 'PATCH', 'PUT'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};
app.use((0, cors_1.default)(corsOptions));
app.options('*', (req, res) => {
    res.header('Access-Control-Allow-Origin', `${process.env.HOST_URL}`);
    res.header('Access-Control-Allow-Methods', 'GET,POST,DELETE,PATCH,PUT');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.sendStatus(200);
});
app.enable('trust proxy');
app.set('view engine', 'pug');
app.set('views', path_1.default.join(__dirname, 'views'));
// 1) GLOBAL MIDDLEWARES
// Implement CORS
// app.use(
//   cors({
//     origin: `${process.env.HOST_URL}`,
//     methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH']
//   })
// )
// app.options('*', (req, res) => {
//   res.header('Access-Control-Allow-Origin', `${process.env.HOST_URL}`)
//   res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
//   res.send()
// })
// app.options('*', cors(corsOptions))
// Serving static files
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
// Set security HTTP headers
app.use((0, helmet_1.default)());
// Development Console Logging
if (process.env.NODE_ENV === 'development') {
    app.use((0, morgan_1.default)('dev'));
}
// Limit requests from same API
// const limiter = rateLimit({
//   max: 100,
//   windowMs: 60 * 60 * 1000,
//   message: 'Too many requests from this IP, please try again in an hour!'
// })
// app.use('/api', limiter)
// PAYMOB Checkout webhook
app.post('/paymob-webhook', express_1.default.raw({ type: 'application/json' }), bookingsController_1.paymobWebhookCheckout);
// Body parser, reading data from body into req.body
app.use(express_1.default.json({ limit: '10kb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10kb' }));
app.use((0, cookie_parser_1.default)());
// Data sanitization against NoSQL query injection
app.use((0, express_mongo_sanitize_1.default)());
// Prevent parameter pollution
app.use((0, hpp_1.default)());
// compress all responses
app.use((0, compression_1.default)());
// 3) ROUTES
(0, index_1.default)(app);
app.all('*', (req, res, next) => {
    next(new appError_1.default(`Can't find ${req.originalUrl} on this server!`, 404));
});
app.use(errorController_1.default);
exports.default = app;

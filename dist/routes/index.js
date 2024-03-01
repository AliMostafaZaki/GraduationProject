"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const availabilityRoutes_1 = __importDefault(require("./availabilityRoutes"));
const bookingsRoutes_1 = __importDefault(require("./bookingsRoutes"));
const mainRouter = (app) => {
    app.use('/api/v1/availability', availabilityRoutes_1.default);
    app.use('/api/v1/bookings', bookingsRoutes_1.default);
};
exports.default = mainRouter;

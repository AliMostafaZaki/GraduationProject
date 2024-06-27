"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const availabilityController_1 = require("../controllers/availabilityController");
const router = express_1.default.Router();
router.route('/set').post(availabilityController_1.setAvailability);
router.route('/get').post(availabilityController_1.getAvailability);
router.route('/check').post(availabilityController_1.checkAvailability);
exports.default = router;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const event_controller_1 = require("../controllers/event.controller");
const authMiddleware_1 = require("../middleware/authMiddleware");
const uploadEventImage_1 = require("../middleware/uploadEventImage");
const router = express_1.default.Router();
router.get("/", event_controller_1.getAllEvents);
router.get("/:id", event_controller_1.getEventById);
router.post("/", authMiddleware_1.protect, authMiddleware_1.adminOnly, uploadEventImage_1.uploadEventImage.single('image'), event_controller_1.createEvent);
router.patch("/:id", authMiddleware_1.protect, authMiddleware_1.adminOnly, uploadEventImage_1.uploadEventImage.single('image'), event_controller_1.updateEvent);
exports.default = router;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const landing_controller_1 = require("../controllers/landing.controller");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.get('/', landing_controller_1.getLandingContent);
router.put('/', authMiddleware_1.protect, authMiddleware_1.adminOnly, landing_controller_1.updateLandingContent);
exports.default = router;

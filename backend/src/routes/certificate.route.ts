import express from "express";
import { protect, adminOnly } from "../middleware/authMiddleware";
import { 
    uploadCertificates, 
    downloadCertificate, 
    getCertificatesByEvent 
} from "../controllers/certificate.controller";
import { uploadCertificate as uploadCertificateMiddleware } from "../middleware/uploadCertificate";

const router = express.Router();


router.post(
    "/upload", 
    protect, 
    adminOnly,
    uploadCertificateMiddleware.array("files", 100), 
    uploadCertificates
);
router.get(
    "/download/:eventId/:userCode", 
    protect, 
    downloadCertificate
);
router.get(
    "/event/:eventId", 
    protect, 
    adminOnly,
    getCertificatesByEvent
);

export default router;
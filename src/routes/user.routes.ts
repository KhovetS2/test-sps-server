import { Router } from "express";
import multer from "multer";
import {
    create,
    list,
    getById,
    update,
    remove,
    uploadProfileImage,
    getProfileImage,
} from "../controllers/user.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();
router.use(authenticate)

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 2 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith("image/")) {
            return cb(new Error("Apenas imagens são permitidas"));
        }

        cb(null, true);
    },
});

router.post("/", authorize(), create);
router.get("/", authorize(), list);
router.get("/:id", authorize(), getById);
router.put("/:id", authorize(), update);
router.delete("/:id", authorize(), remove);

router.post(
    "/:id/profile-image",
    authorize(),
    upload.single("profile_image"),
    uploadProfileImage
);

router.get("/:id/profile-image", authorize(), getProfileImage);

export default router;

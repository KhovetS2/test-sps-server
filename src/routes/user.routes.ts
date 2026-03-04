import { Router } from "express";
import {
    create,
    list,
    getById,
    update,
    remove,
} from "../controllers/user.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { createUserSchema, updateUserSchema } from "../schemas/user";

const router = Router();

// All user routes require authentication
router.use(authenticate);

router.post(
    "/",
    authorize("users:create"),
    validate(createUserSchema),
    create
);

router.get("/", authorize("users:list"), list);

router.get("/:id", authorize("users:read"), getById);

router.put(
    "/:id",
    authorize("users:update"),
    validate(updateUserSchema),
    update
);

router.delete("/:id", authorize("users:delete"), remove);

export default router;

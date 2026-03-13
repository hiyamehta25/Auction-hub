import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import auctionsRouter from "./auctions.js";
import bidsRouter from "./bids.js";
import usersRouter from "./users.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/auctions", auctionsRouter);
router.use("/bids", bidsRouter);
router.use("/users", usersRouter);

export default router;

import express from "express";
import dotenv from "dotenv";

import userRoutes from "./routes/userRoutes.js";
import volunteerRoutes from "./routes/volunteerRoutes.js";
import errorHandler from "./middleware/errorHandler.js";

dotenv.config();

const app = express();

app.use(express.json());

// 라우터
app.use("/api/users", userRoutes);
app.use("/api/volunteers", volunteerRoutes);

// 에러 핸들러 (항상 마지막!)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
});

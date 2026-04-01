import express from "express";
import path from "path";

import userRoutes from "./routes/user/userRoutes.js";
import volunteerRoutes from "./routes/volunteer/volunteerRoutes.js";
import authRoutes from "./routes/auth/authRoutes.js";
import regionRoutes from "./routes/region/regionRoutes.js";
import certificateRoutes from "./routes/certificate/certificateRoutes.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();

app.use(express.json());

// 라우터
app.use("/api/users", userRoutes);
app.use("/api/volunteers", volunteerRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/regions", regionRoutes);
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/api/certificates", certificateRoutes);

// 에러 핸들러 (항상 마지막!)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
});

import express from "express";

import userRoutes from "./routes/user/userRoutes.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();

app.use(express.json());

// 라우터
app.use("/api/users", userRoutes);

// 에러 핸들러 (항상 마지막!)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
});

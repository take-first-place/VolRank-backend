const express = require("express");
const app = express();
require("dotenv").config();
app.use(express.json())

// 라우터
const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);

// 에러 핸들러
const errorHandler = require("./middleware/errorHandler");
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
});


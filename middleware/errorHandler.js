const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "서버 오류",
  });
};

export default errorHandler;

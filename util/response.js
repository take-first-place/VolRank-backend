exports.success = (res, data, message, status) => {
  return res.status(status).json({
    success: true,
    message,
    data,
  });
};

exports.fail = (res, message, status) => {
  return res.status(status).json({
    success: false,
    message,
  });
};

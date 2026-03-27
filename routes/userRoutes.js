const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const { registerValidator } = require("../validators/userValidator");

// POST /api/users/register
router.post(
  "/register",
  registerValidator,
  userController.register,
);

module.exports = router;

const express = require("express");
const path = require("path");
const router = express.Router();

router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../../frontend/pages/home.html"));
});

router.get("/pages/:page", (req, res) => {
  const page = req.params.page;
  res.sendFile(path.join(__dirname, `../../frontend/pages/${page}`));
});

module.exports = router;
	

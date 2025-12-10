const router = require("express").Router();
const rouletteController = require("../controllers/roulette.controller");
const auth = require("../middleware/auth");

router.get("/state", auth, rouletteController.state);
router.post("/spin", auth, rouletteController.spin);

module.exports = router;

var express = require('express');
var router = express.Router();
const controller = require('../controllers/controller');


/* GET users listing. */
router.post('/fetch', controller.fetchAndInsertData);

router.post('/find', controller.findData);

module.exports = router;

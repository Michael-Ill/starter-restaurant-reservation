const router = require("express").Router();
const methodNotAllowed = require("../errors/methodNotAllowed");
const controller = require("./tables.controller");

router.route("/")
    .get(controller.list)
    .post(controller.create)
    .all(methodNotAllowed);

router.route('/:table_id/seat')
    .put(controller.update)
    .delete(controller.tableClear)
    .all(methodNotAllowed);

router.route('/:table_id')
    .get(controller.read)
    .all(methodNotAllowed);


module.exports = router;
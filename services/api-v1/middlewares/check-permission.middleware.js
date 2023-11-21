'use strict'

function isWaiter(req, res, next) {

	if (req.session.employee.type.description !== "Mozo") {
		return res.status(200).send({ message: "No tienes acceso a realizar esta operación" });
	}

	next();
}

function isSupervisor(req, res, next) {

	if (req.session) {
		if (req.session.employee.type.description !== "Supervisor") {
			return res.status(200).send({ message: "No tienes acceso a realizar esta operación" });
		}
	}

	next();
}

module.exports = {
	isSupervisor,
	isWaiter
}
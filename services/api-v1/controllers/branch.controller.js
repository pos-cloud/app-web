'use strict'

let fs = require('fs');
let fileController = require('./file.controller');
let constants = require('../utilities/constants');
const { EJSON } = require('bson');
let moment = require('moment');
moment.locale('es');
let path = require('path');

let Branch;
let User;

function getBranch(req, res, next, id = undefined) {

	initConnectionDB(req.session.database);

	let branchId;
	if (id) {
		branchId = id;
	} else {
		branchId = req.query.id;
	}

	Branch.findById(branchId, (err, branch) => {
		if (err) {
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(err);
		} else {
			if (!branch || branch.operationType == 'D') {
				fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
				return res.status(404).send(constants.NO_DATA_FOUND);
			} else {
				fileController.writeLog(req, res, next, 200, branch);
				return res.status(200).send({ branch: branch });
			}
		}
	})
		.populate({
			path: 'creationUser',
			model: User
		})
		.populate({
			path: 'updateUser',
			model: User
		})
}

function getBranches(req, res, next) {

	initConnectionDB(req.session.database);

	let queryAggregate = [];
	let group;

	if (req.query && req.query !== {}) {

		let error;

		let project = req.query.project;

		if (project && project !== {} && project !== "{}") {
			try {
				project = JSON.parse(project);

				if (searchPropertyOfArray(project, 'creationUser.')) {
					queryAggregate.push({ $lookup: { from: "users", foreignField: "_id", localField: "creationUser", as: "creationUser" } });
					queryAggregate.push({ $unwind: { path: "$creationUser", preserveNullAndEmptyArrays: true } });
				}

				if (searchPropertyOfArray(project, 'updateUser.')) {
					queryAggregate.push({ $lookup: { from: "users", foreignField: "_id", localField: "updateUser", as: "updateUser" } });
					queryAggregate.push({ $unwind: { path: "$updateUser", preserveNullAndEmptyArrays: true } });
				}

				let sort = req.query.sort;
				if (sort && sort !== {} && sort !== "{}") {
					try {
						queryAggregate.push({ $sort: JSON.parse(sort) });
					} catch (err) {
						error = err;
					}
				}

				queryAggregate.push({ $project: project });
			} catch (err) {
				error = err;
			}
		} else {
			let sort = req.query.sort;
			if (sort && sort !== {} && sort !== "{}") {
				try {
					queryAggregate.push({ $sort: JSON.parse(sort) });
				} catch (err) {
					error = err;
				}
			}
		}

		let match = req.query.match;
		if (match && match !== "{}" && match !== {}) {
			try {
				queryAggregate.push({ $match: JSON.parse(match) });
			} catch (err) {
				error = err;
			}
		}

		group = req.query.group;
		if (group && group !== "{}" && group !== {}) {
			try {
				queryAggregate.push({ $group: JSON.parse(group) });
			} catch (err) {
				error = err;
			}
		}

		let limit = req.query.limit;
		let skip = req.query.skip;
		if (limit) {
			try {
				limit = parseInt(limit);
				if (limit > 0) {
					if (skip) {
						skip = parseInt(skip);
					} else {
						skip = 0;
					}
					if (group && group !== "{}" && group !== {}) {
						let projectGroup;
						if (searchPropertyOfArray(JSON.parse(group), 'branches')) {
							projectGroup = `{ "branches": { "$slice": ["$branches", ${skip}, ${limit}] }`;
						} else {
							projectGroup = `{ "items": { "$slice": ["$items", ${skip}, ${limit}] }`;
						}
						for (let prop of Object.keys(JSON.parse(group))) {
							if (prop !== 'branches' && prop !== 'items') {
								projectGroup += `, "${prop}": 1`;
							}
						}
						projectGroup += `}`;
						queryAggregate.push({ $project: JSON.parse(projectGroup) });
					} else {
						queryAggregate.push({ $limit: limit });
						queryAggregate.push({ $skip: skip });
					}
				}
			} catch (err) {
				error = err;
			}
		}

		if (error) {
			fileController.writeLog(req, res, next, 500, error);
			return res.status(500).send(error);
		}
	}

	queryAggregate = EJSON.parse(JSON.stringify(queryAggregate));

	Branch.aggregate(queryAggregate)
		.then(function (result) {
			fileController.writeLog(req, res, next, 200, result.length);
			if (result.length > 0) {
				if (group && group !== "{}" && group !== {}) {
					return res.status(200).send(result);
				} else {
					return res.status(200).send({ branches: result });
				}
			} else {
				if (group && group !== "{}" && group !== {}) {
					return res.status(200).send({ count: 0, branches: [] });
				} else {
					return res.status(200).send({ branches: [] });
				}
			}
		}).catch(err => {
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(err);
		});
}

function searchPropertyOfArray(array, value) {
	let n = false;
	for (let a of Object.keys(array)) { if (!n) n = a.includes(value); }
	return n;
}

function saveBranch(req, res, next) {

	initConnectionDB(req.session.database);

	let branch = new Branch();
	let params = req.body;

	branch.number = params.number;
	branch.name = params.name;
	branch.default = params.default;
	branch.image = params.image;

	let user = new User();
	user._id = req.session.user;
	branch.creationUser = user;
	branch.creationDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
	branch.operationType = 'C';


	if (branch.number &&
		branch.name) {

		let json = '{"$and":[{"operationType": {"$ne": "D"}},';
		json = json + '{"$and":[{"number": "' + branch.number + '"},';
		json = json + '{"name": "' + branch.name + '"}]}]}';

		let where;
		try {
			where = JSON.parse(json);
		} catch (err) {
			fileController.writeLog(req, res, next, 500, json);
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		}

		Branch.find(where).exec((err, branches) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				if (!branches || branches.length === 0) {
					branch.save((err, branchSave) => {
						if (err) {
							fileController.writeLog(req, res, next, 500, err);
							return res.status(500).send(err);
						} else {
							fileController.writeLog(req, res, next, 200, branchSave._id);
							getBranch(req, res, next, branchSave._id);
						}
					});
				} else {
					let message = 'La sucursal ya existe';
					fileController.writeLog(req, res, next, 200, message);
					return res.status(200).send({ message: message });
				}
			}
		});
	} else {
		fileController.writeLog(req, res, next, 200, constants.COMPLETE_ALL_THE_DATA);
		return res.status(200).send({ message: constants.COMPLETE_ALL_THE_DATA });
	}
}

function updateBranch(req, res, next) {

	initConnectionDB(req.session.database);

	let branchId = req.query.id;
	let branch = req.body;

	let user = new User();
	user._id = req.session.user;
	branch.updateUser = user;
	branch.updateDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
	branch.operationType = 'U';


	if (branch.number &&
		branch.name) {

		let json = '{"$and":[{"operationType": {"$ne": "D"}},';
		json = json + '{"$and":[{"number": "' + branch.number + '"},';
		json = json + '{"name": "' + branch.name + '"}]},';
		json = json + '{"_id": {"$ne": "' + branchId + '"}}]}';

		let where;
		try {
			where = JSON.parse(json);
		} catch (err) {
			fileController.writeLog(req, res, next, 500, json);
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		}

		Branch.find(where).exec((err, branches) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				if (!branches || branches.length === 0) {
					Branch.findByIdAndUpdate(branchId, branch, (err, branchUpdated) => {
						if (err) {
							fileController.writeLog(req, res, next, 500, err);
							return res.status(500).send(err);
						} else {
							fileController.writeLog(req, res, next, 200, branchUpdated._id);
							getBranch(req, res, next, branchUpdated._id);
						}
					});
				} else {
					let message = 'La sucursal ya existe';
					fileController.writeLog(req, res, next, 200, message);
					return res.status(200).send({ message: message });
				}
			}
		});
	} else {
		fileController.writeLog(req, res, next, 200, constants.COMPLETE_ALL_THE_DATA);
		return res.status(200).send({ message: constants.COMPLETE_ALL_THE_DATA });
	}

}

function deleteBranch(req, res, next) {

	initConnectionDB(req.session.database);

	let branchId = req.query.id;

	let user = new User();
	user._id = req.session.user;

	Branch.findByIdAndUpdate(branchId,
		{
			$set: {
				updateUser: user,
				updateDate: moment().format('YYYY-MM-DDTHH:mm:ssZ'),
				operationType: 'D'
			}
		}, (err, branchDelete) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				fileController.writeLog(req, res, next, 200, branchDelete._id);
				return res.status(200).send({ branch: branchDelete });
			}
		});
}

function deleteImage(req, res, next, picture = undefined) {

	if (!picture) {

		initConnectionDB(req.session.database);

		let branchId = req.query.id;

		Branch.findById(branchId, (err, branch) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				if (!branch || branch.operationType == 'D') {
					fileController.writeLog(req, res, next, 200, constants.NO_DATA_FOUND);
					return res.status(200).send({ message: constants.NO_DATA_FOUND });
				} else {
					let imageToDelete = branch.image;
					if (imageToDelete && imageToDelete != 'default.jpg') {
						Branch.findByIdAndUpdate(branchId, { image: 'default.jpg' }, (err, branchUpdate) => {
							if (err) {
								fileController.writeLog(req, res, next, 500, err);
								return res.status(500).send(constants.ERR_SERVER);
							} else {
								try {
									fs.unlinkSync('/home/clients/' + req.session.database + '/images/company/' + imageToDelete);
								} catch (err) {
								}
								return res.status(200).send({ message: "ok" });
							}
						});
					}
				}
			}
		});
	} else {
		if (picture && picture != 'default.jpg') {
			try {
				fs.unlinkSync('/home/clients/' + req.session.database + 'images/company/' + picture);
			} catch (err) {
			}
		};
	}
}

function getImage(req, res, next) {

	let picture = req.params.picture;

	if (picture && picture !== undefined) {
		try {
			return res.sendFile(path.resolve('/home/clients/' + req.params.database + '/images/company/' + picture));
		} catch (err) {
			fileController.writeLog(req, res, next, 404, constants.NO_IMAGEN_FOUND);
			return res.status(404).send(constants.NO_IMAGEN_FOUND);
		}
	}
}

function getImageBase64(req, res, next) {

	initConnectionDB(req.session.database);

	let fs = require('fs');
	let picture = req.query.picture;

	if (picture && picture !== undefined) {
		try {
			let bitmap = fs.readFileSync(path.resolve('/home/clients/' + req.session.database + '/images/company/' + picture));
			return res.status(200).send({ imageBase64: new Buffer(bitmap).toString('base64') });
		} catch (err) {
			fileController.writeLog(req, res, next, 404, constants.NO_IMAGEN_FOUND);
			return res.status(404).send(constants.NO_IMAGEN_FOUND);
		}
	}
}

function uploadImage(req, res, next) {

	initConnectionDB(req.session.database);

	let branchId = req.params.id;

	if (req.file) {

		Branch.findById(branchId, (err, branch) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				if (!branch) {
					fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
					return res.status(404).send(constants.NO_DATA_FOUND);
				} else if (branch.length === 0) {
					fileController.writeLog(req, res, next, 200, constants.NO_DATA_FOUND);
					return res.status(200).send({ message: constants.NO_DATA_FOUND });
				} else {
					Branch.findByIdAndUpdate(branchId, { image: req.params.id + '-' + req.file.originalname.normalize('NFD').replace(/[\u0300-\u036f]/g, "") }, (err, branchUpdate) => {
						if (err) {
							fileController.writeLog(req, res, next, 500, err);
							return res.status(500).send(constants.ERR_SERVER);
						} else {
							return res.status(200).send({ message: 'ok' });
						}
					});
				}
			}
		});
	} else {
		fileController.writeLog(req, res, next, 404, constants.NO_IMAGEN_FOUND);
		return res.status(404).send(constants.NO_IMAGEN_FOUND);
	}
}

function initConnectionDB(database) {

	const Model = require('../models/model');

	let BranchSchema = require('./../models/branch');
	Branch = new Model('branch', {
		schema: BranchSchema,
		connection: database
	});

	let UserSchema = require('../models/user');
	User = new Model('user', {
		schema: UserSchema,
		connection: database
	});

}

module.exports = {
	getBranch,
	getBranches,
	saveBranch,
	updateBranch,
	deleteBranch,
	deleteImage,
	getImage,
	getImageBase64,
	uploadImage
}
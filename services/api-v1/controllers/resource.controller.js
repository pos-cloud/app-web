'use strict'

let jimp = require('jimp');
let fs = require('fs');
let ms = require('mediaserver');
const { EJSON } = require('bson');

let fileController = require('./file.controller');
let constants = require('./../utilities/constants');
let moment = require('moment');
moment.locale('es');

let Resource;
let User;

function getResource(req, res, next, id = undefined) {

	initConnectionDB(req.session.database);


	let resourceId;
	if (id) {
		resourceId = id;
	} else {
		resourceId = req.query.id;
	}

	Resource.findById(resourceId, (err, resource) => {
		if (err) {
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(err);
		} else {
			if (!resource || resource.operationType == 'D') {
				fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
				return res.status(404).send(constants.NO_DATA_FOUND);
			} else if (resource === undefined) {
				fileController.writeLog(req, res, next, 200, constants.NO_DATA_FOUND);
				return res.status(200).send({ message: constants.NO_DATA_FOUND });
			} else {
				fileController.writeLog(req, res, next, 200, resource);
				return res.status(200).send({ resource: resource });
			}
		}
	})
}

function getResources(req, res, next) {

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
						if (searchPropertyOfArray(JSON.parse(group), 'resources')) {
							projectGroup = `{ "resources": { "$slice": ["$resources", ${skip}, ${limit}] }`;
						} else {
							projectGroup = `{ "items": { "$slice": ["$items", ${skip}, ${limit}] }`;
						}
						for (let prop of Object.keys(JSON.parse(group))) {
							if (prop !== 'resources' && prop !== 'items') {
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

	Resource.aggregate(queryAggregate)
		.then(function (result) {
			fileController.writeLog(req, res, next, 200, result.length);
			if (result.length > 0) {
				if (group && group !== "{}" && group !== {}) {
					return res.status(200).send(result);
				} else {
					return res.status(200).send({ resources: result });
				}
			} else {
				if (group && group !== "{}" && group !== {}) {
					return res.status(200).send({ count: 0, resources: [] });
				} else {
					return res.status(200).send({ resources: [] });
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

function saveResource(req, res, next) {

	initConnectionDB(req.session.database);


	let resource = new Resource();
	let params = req.body;

	resource.name = params.name;
	resource.type = params.type;
	resource.file = params.file;

	let user = new User();
	user._id = req.session.user;
	resource.creationUser = user;
	resource.creationDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
	resource.operationType = 'C';

	resource.save((err, resourceSave) => {
		if (err) {
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(err);
		} else {
			fileController.writeLog(req, res, next, 200, resourceSave._id);
			getResource(req, res, next, resourceSave._id);
		}
	});
}

function updateResource(req, res, next) {

	initConnectionDB(req.session.database);


	let resourceId = req.query.id;
	let resource = req.body;

	let user = new User();
	user._id = req.session.user;
	resource.updateUser = user;
	resource.updateDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
	resource.operationType = 'U';

	Resource.findByIdAndUpdate(resourceId, resource, (err, resourceUpdated) => {
		if (err) {
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(err);
		} else {
			fileController.writeLog(req, res, next, 200, resourceUpdated._id);
			getResource(req, res, next, resourceUpdated._id);
		}
	});
}

async function deleteResource(req, res, next) {

	initConnectionDB(req.session.database);


	let resourceId = req.query.id;

	let resource = await getAsync(req, resourceId);


	if (resource) {
		Resource.deleteOne({ _id: resourceId }, (err, result) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(err);
			} else {
				deleteFile(req, resource);
				fileController.writeLog(req, res, next, 200, result);
				return res.status(200).send(result);
			}
		});
	} else {
		fileController.writeLog(req, res, next, 200, constants.NO_DATA_FOUND);
		return res.status(200).send({ message: constants.NO_DATA_FOUND });
	}
}

function deleteFile(req, resource) {
    
	return new Promise((resolve, reject) => {
		try {
			fs.unlinkSync("/home/clients/" + req.session.database + "/resource/" + resource.file);
			resolve(true);
		} catch (err) {
			reject(err);
		}
	});
}

function getAsync(req, resourceId) {

	initConnectionDB(req.session.database);

	return new Promise((resolve, reject) => {
		Resource.findById(resourceId, (err, resource) => {
			if (err) {
				reject(err);
			} else {
				resolve(resource);
			}
		});
	});
}

function uploadFile(req, res, next) {

	initConnectionDB(req.session.database);


	let resourceId = req.params.id;
	let ext = req.file.originalname.split('.');

	if (req.file) {

		if (req.file.mimetype.substr(0, 5) === 'image') {

			let file = '/home/clients/' + req.session.database + '/resource/' + req.file.filename;

			jimp.read(file, function (err, image) {
				if (err) {
				} else {

					image = image.quality(30);

					let maxWidth = 1920;
					let widthOriginal = image.bitmap.width;

					if (widthOriginal > maxWidth) {
						image.resize(maxWidth, jimp.AUTO);
					}

					image.write(file);

					return res.status(200).send({ file: req.file });


				}
			});
		} else {
			return res.status(200).send({ file: req.file });
		}
	}
}

function saveFile(req, res, next) {

	if (req.files) {

		let file_path = req.files.myFile.path;
		let file_name;

		if (file_path.includes("/")) {
			file_name = file_path.split("/");
		} else {
			file_name = file_path.split("\\");
		}

		file_name = file_name[3];

		let type = req.params.type


		return res.status(200).send({ nameFile: file_name });
	}
}

function getFile(req, res, next) {

	let filename = req.query.filename;
	let type = req.query.type;
	let waterMark = req.query.waterMark;
	let quality = req.query.quality;
	let width = req.query.width;
	let height = req.query.height;
	let database = req.query.database;

	if (filename && database) {

		let file = '/home/clients/' + database + '/resource/' + filename;

		if (type == 'image') {

			jimp.read(file, function (err, image) {
				if (err) {
				} else {

					if (quality) {
						quality = parseFloat(quality);
						image = image.quality(quality);
					} else {
						quality = 100;
					}

					let widthOriginal = image.bitmap.width;
					let heightOriginal = image.bitmap.height;

					if (width && height) {
						width = parseInt(width);
						height = parseInt(height);
						image = image.resize(width, height);
						width = image.bitmap.width;
						height = image.bitmap.height;
					} else if (width && !height) {
						width = parseInt(width);
						height = jimp.AUTO;
						image = image.resize(width, height);
						width = image.bitmap.width;
						height = image.bitmap.height;
					} else if (!width && height) {
						width = jimp.AUTO;
						height = parseInt(height);
						image = image.resize(width, height);
						width = image.bitmap.width;
						height = image.bitmap.height;
					} else {
						width = image.bitmap.width;
						height = image.bitmap.height;
					}

					if (quality === 100 && widthOriginal === image.bitmap.width && heightOriginal === image.bitmap.height) {
						ms.pipe(req, res, file);
					} else {
						image.getBuffer(jimp.MIME_JPEG, function (err, buffer) {
							res.set("Content-Type", jimp.MIME_JPEG);
							res.send(buffer);
						});
					}
				}
			});
		} else {
			ms.pipe(req, res, file);
		}
	}

}

function initConnectionDB(database) {

	const Model = require('./../models/model');

	let ResourceSchema = require('./../models/resource');
	Resource = new Model('resource', {
		schema: ResourceSchema,
		connection: database
	});

	let UserSchema = require('./../models/user');
	User = new Model('user', {
		schema: UserSchema,
		connection: database
	});

}

module.exports = {
	getResource,
	getResources,
	saveResource,
	updateResource,
	deleteResource,
	uploadFile,
	getFile,
	saveFile
}
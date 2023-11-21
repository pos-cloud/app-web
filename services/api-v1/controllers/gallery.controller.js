'use strict'

let fileController = require('./file.controller');
let constants = require('./../utilities/constants');
const { EJSON } = require('bson');
let moment = require('moment');
moment.locale('es');

let User;
let Gallery;
let Resource;

function getGallery(req, res, next, id = undefined) {

	initConnectionDB(req.session.database);

	let galleryId;
	if (id) {
		galleryId = id;
	} else {
		galleryId = req.query.id;
	}

	Gallery.findById(galleryId, (err, gallery) => {
		if (err) {
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		} else {
			if (!gallery || gallery.operationType == 'D') {
				fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
				return res.status(404).send(constants.NO_DATA_FOUND);
			} else {
				fileController.writeLog(req, res, next, 200, gallery);
				return res.status(200).send({ gallery: gallery });
			}
		}
	}).populate({
		path: 'resources.resource',
		model: Resource
	});
}

function getGalleries(req, res, next) {

	//http://localhost:3000/api/galleries/limit=6&skip=0&select=name,code&sort="code":1&where="name":"s"


	initConnectionDB(req.session.database);

	let where = JSON.parse('{"operationType": {"$ne": "D"}}');
	let limit = 0;
	let select = "";
	let sort = "";
	let skip = 0;
	let error;

	if (req.query.query !== undefined) {

		req.query.query.split("&").forEach(function (part) {
			let item = part.split("=");
			let json;
			switch (item[0]) {
				case 'where':
					json = '{"$and":[{"operationType": {"$ne": "D"}},';
					json = json + "{" + item[1] + "}]}";
					try {
						where = JSON.parse(json);
					} catch (err) {
						fileController.writeLog(req, res, next, 500, json);
						error = err;
					}
					break;
				case 'limit':
					try {
						limit = parseInt(item[1]);
					} catch (err) {
						error = err;
					}
					break;
				case 'select':
					try {
						select = item[1].replace(/,/g, " ");
					} catch (err) {
						error = err;
					}
					break;
				case 'sort':
					json = "{" + item[1] + "}";
					try {
						sort = JSON.parse(json);
					} catch (err) {
						error = err;
					}
					break;
				case 'skip':
					try {
						skip = parseInt(item[1]);
					} catch (err) {
						error = err;
					}
					break;
				default:
			}
		});
	}

	if (error) {
		fileController.writeLog(req, res, next, 500, error);
		return res.status(500).send(constants.ERR_SERVER);
	}

	Gallery.find(where).
		limit(limit).
		select(select).
		sort(sort).
		skip(skip).
		populate({
			path: 'resources.resource',
			model: Resource
		}).
		exec((err, galleries) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				if (!galleries) {
					fileController.writeLog(req, res, next, 404, constants.NO_DATA_FOUND);
					return res.status(404).send(constants.NO_DATA_FOUND);
				} else if (galleries.length === 0) {
					fileController.writeLog(req, res, next, 200, constants.NO_DATA_FOUND);
					return res.status(200).send({ message: constants.NO_DATA_FOUND });
				} else {
					fileController.writeLog(req, res, next, 200, 'Gallery ' + galleries.length);
					return res.status(200).send({ galleries: galleries });
				}
			}
		});
}

function getGalleriesV2(req, res, next) {

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

				if (searchPropertyOfArray(project, 'resources')) {
					queryAggregate.push({
						$lookup: {
							from: "resources",
							let: { pid: '$resources.resource' },
							pipeline: [
								{ $match: { $expr: { $in: ['$_id', '$$pid'] } } }
							],
							as: "resources"
						}
					});
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
						if (searchPropertyOfArray(JSON.parse(group), 'galleries')) {
							projectGroup = `{ "galleries": { "$slice": ["$galleries", ${skip}, ${limit}] }`;
						} else {
							projectGroup = `{ "items": { "$slice": ["$items", ${skip}, ${limit}] }`;
						}
						for (let prop of Object.keys(JSON.parse(group))) {
							if (prop !== 'galleries' && prop !== 'items') {
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

	Gallery.aggregate(queryAggregate)
		.then(function (result) {
			fileController.writeLog(req, res, next, 200, result.length);
			if (result.length > 0) {
				if (group && group !== "{}" && group !== {}) {
					return res.status(200).send(result);
				} else {
					return res.status(200).send({ galleries: result });
				}
			} else {
				if (group && group !== "{}" && group !== {}) {
					return res.status(200).send({ count: 0, galleries: [] });
				} else {
					return res.status(200).send({ galleries: [] });
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

function saveGallery(req, res, next) {

	initConnectionDB(req.session.database);

	let gallery = new Gallery();
	let params = req.body;

	gallery.name = params.name;
	gallery.colddown = params.colddown;
	gallery.speed = params.speed;
	gallery.resources = params.resources;
    gallery.barcode = params.barcode;

	let user = new User();
	user._id = req.session.user;
	gallery.creationUser = user;
	gallery.creationDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
	gallery.operationType = 'C';



	if (gallery.name) {

		let json = '{"$and":[{"operationType": {"$ne": "D"}},';
		json = json + '{"name": "' + gallery.name + '"}]}';
		let where;
		try {
			where = JSON.parse(json);
		} catch (err) {
			fileController.writeLog(req, res, next, 500, json);
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		}

		Gallery.find(where).exec((err, galleries) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				if (!galleries || galleries.length === 0) {
					gallery.save((err, gallerySave) => {
						if (err) {
							fileController.writeLog(req, res, next, 500, err);
							return res.status(500).send(constants.ERR_SERVER);
						} else {
							getGallery(req, res, next, gallerySave._id);
						}
					});
				} else {
					let message = 'La galeria \"' + gallery.name + '\" ya existe';
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

function updateGallery(req, res, next) {

	initConnectionDB(req.session.database);

	let galleryId = req.query.id;
	let gallery = req.body;

	let user = new User();
	user._id = req.session.user;
	gallery.updateUser = user;
	gallery.updateDate = moment().format('YYYY-MM-DDTHH:mm:ssZ');
	gallery.operationType = 'U';

	if (gallery.name) {

		let json = '{"$and":[{"operationType": {"$ne": "D"}},';
		json = json + '{"name": "' + gallery.name + '"},';
		json = json + '{"_id": {"$ne": "' + galleryId + '"}}]}';
		let where;
		try {
			where = JSON.parse(json);
		} catch (err) {
			fileController.writeLog(req, res, next, 500, json);
			fileController.writeLog(req, res, next, 500, err);
			return res.status(500).send(constants.ERR_SERVER);
		}

		Gallery.find(where).exec((err, galleries) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				if (!galleries || galleries.length === 0) {
					Gallery.findByIdAndUpdate(galleryId, gallery, (err, galleryUpdated) => {
						if (err) {
							fileController.writeLog(req, res, next, 500, err);
							return res.status(500).send(constants.ERR_SERVER);
						} else {
							getGallery(req, res, next, galleryUpdated._id);
						}
					});
				} else {
					let message = 'La galeria \"' + gallery.code + '\" ya existe';
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

function deleteGallery(req, res, next) {

	initConnectionDB(req.session.database);

	let galleryId = req.query.id;

	let user = new User();
	user._id = req.session.user;

	Gallery.findByIdAndUpdate(galleryId,
		{
			$set: {
				updateUser: user,
				updateDate: moment().format('YYYY-MM-DDTHH:mm:ssZ'),
				operationType: 'D'
			}
		}, (err, galleryUpdated) => {
			if (err) {
				fileController.writeLog(req, res, next, 500, err);
				return res.status(500).send(constants.ERR_SERVER);
			} else {
				fileController.writeLog(req, res, next, 200, galleryUpdated);
				return res.status(200).send({ gallery: galleryUpdated });
			}
		});
}

function initConnectionDB(database) {

	const Model = require('./../models/model');

	let GalleryScheme = require('./../models/gallery');
	Gallery = new Model('gallery', {
		schema: GalleryScheme,
		connection: database
	});

	let UserSchema = require('./../models/user');
	User = new Model('user', {
		schema: UserSchema,
		connection: database
	});

	let ResourceSchema = require('./../models/resource');
	Resource = new Model('resource', {
		schema: ResourceSchema,
		connection: database
	});

}

module.exports = {
	getGallery,
	getGalleries,
	getGalleriesV2,
	saveGallery,
	updateGallery,
	deleteGallery
}
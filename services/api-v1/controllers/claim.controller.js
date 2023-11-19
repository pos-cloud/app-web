let constants = require('./../utilities/constants');
let EmailController = require('./email.controller');
let fs = require('fs');
let moment = require('moment');
moment.locale('es');
let fileController = require('./file.controller');

async function saveClaim(req, res, next) {

    let params = req.body.claim;

    const Model = require('./../models/model');
    let Claim;
    let ClaimSchema = require('./../models/claim');
    Claim = new Model('claim', {
        schema: ClaimSchema,
        connection: 'poscloud'
    });

    let claim = new Claim();
    claim.name = params.name;
    claim.description = params.description;
    if (params.file) {
        claim.description = params.description + "<br><br><b>Archivo adjunto:</b> http://demo.poscloud.com.ar:300/api/file-claim/" + params.file;
    }
    claim.type = params.type;
    claim.priority = params.priority;
    claim.author = params.author;
    claim.email = params.email;
    claim.listName = params.listName;


    let subject = `${claim.type} Nro ${claim._id} - Prioridad ${claim.priority}`;
    let message = `El ticket se recibido correctamente.<br><br>
                <b>Datos del ticket:</b><br><br>
                <b>Nro:</b> ${claim._id}<br>
                <b>Asunto:</b>  ${params.name}<br>
                <b>Tipo:</b>  ${claim.type}<br>
                <b>Prioridad:</b>  ${claim.priority}<br>
                <b>Reportado por:</b>  ${claim.author}<br>
                <b>Comentario:</b>  ${claim.description}<br><br>
                <b>Email:</b>  ${claim.email}<br><br>`;

    

    await EmailController.sendEmail(req, res, next,
        subject,
        message,
        null,
        'info@poscloud.com.ar'
    ).then(
        result => {
            if(result){
                return res.status(200).send({ claim: claim });
            }
        }
    ).catch(
        err => {
            return res.status(500).send(err);
        }
    );
}

function uploadFile(req, res, next) {
    
    let fileName = 'No subido...';

    if (req.files) {

        let file_path = req.files.file.path;
        let file_split;
        if (file_path.includes("/")) {
            file_split = file_path.split("/");
        } else {
            file_split = file_path.split("\\");
        }

        fileName = file_split[4];

        return res.status(200).send({ file: fileName });

    } else {
        fileController.writeLog(req, res, next, 404, constants.NO_IMAGEN_FOUND);
        return res.status(404).send(constants.NO_IMAGEN_FOUND);
    }
}

function deleteFile(req, res, next) {

    if (req.params.file) {

        try {
            fs.unlinkSync("/home/upload/claim/" + req.params.file);
            return res.status(200).send({ message: "Archivo eliminado correctamente." });
        } catch (err) {
            return res.status(500).send(err);

        }
    }

}

module.exports = {
    saveClaim,
    uploadFile,
    deleteFile
}
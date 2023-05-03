/*
|----------------------------------------------------------------------------------------------------------------------------
|   Helpers File
|----------------------------------------------------------------------------------------------------------------------------
|
|   All helper methods in this file.
|
*/
const models = require('../models');
const sequelize = require('sequelize');
const { Op } = sequelize;
const bcrypt = require('bcrypt');
const crypto = require('crypto');
var path = require('path');
var uuid = require('uuid');
const fs = require('fs');
// const barcode = require('barcode');
const nodemailer = require('nodemailer');
// const constants = require('../config/constants')

/*
|----------------------------------------------------------------------------------------------------------------------------
|   Exporting all methods
|----------------------------------------------------------------------------------------------------------------------------
*/
module.exports = {
    vaildObject: async function (required, non_required, res) {
        let message = '';
        let empty = [];

        let model = required.hasOwnProperty('model') && models.hasOwnProperty(required.model)
            ? models[required.model]
            : models.users;

        for (let key in required) {
            if (required.hasOwnProperty(key)) {
                if (required[key] == undefined || required[key] === '' && (required[key] !== '0' || required[key] !== 0)) {
                    empty.push(key);
                }
            }
        }


        if (empty.length != 0) {
            message = empty.toString();
            if (empty.length > 1) {
                message += " fields are required"
            } else {
                message += " field is required"
            }
            throw {
                'code': 400,
                'message': message
            }
        } else {
            if (required.hasOwnProperty('security_key')) {
                if (required.security_key != 'BahamaEats') {
                    message = "Invalid security key";
                    throw {
                        'code': 400,
                        'message': message
                    }
                }
            }

            if (required.hasOwnProperty('checkExists') && required.checkExists == 1) {
                const checkData = {
                    email: 'Email already exists, kindly use another.',
                    mobile: 'Mobile already exists, kindly use another',
                    phone: 'Phone number already exists, kindly use another',
                }

                for (let key in checkData) {
                    if (required.hasOwnProperty(key)) {
                        const checkExists = await model.findOne({
                            where: {
                                [key]: required[key].trim(),
                            },
                            raw: true,
                        });
                        if (checkExists) {
                            if (checkExists.hasOwnProperty('otpVerified') && checkExists.otpVerified == 1) {
                                throw {
                                    code: 400,
                                    message: checkData[key]
                                }
                            } else {
                                await module.exports.delete(model, checkExists.id);
                            }
                        }
                    }
                }
            }

            const merge_object = Object.assign(required, non_required);
            delete merge_object.checkexit;
            delete merge_object.securitykey;

            if (merge_object.hasOwnProperty('password') && merge_object.password == '') {
                delete merge_object.password;
            }

            for (let data in merge_object) {
                if (merge_object[data] == undefined) {
                    delete merge_object[data];
                } else {
                    if (typeof merge_object[data] == 'string') {
                        merge_object[data] = merge_object[data].trim();
                    }
                }
            }

            return merge_object;
        }
    },
    save: async (model, data, returnData = false, req = {}) => {
        try {
            if (!(typeof data == 'object' && !Array.isArray(data))) {
                throw 'Please send valid object in second argument of save function.';
            }
            // console.log(model, '===================>model');
            const tableColumns = model.rawAttributes
            console.log(tableColumns, '==============>tableColumns');
            const defaultValues = {
                'INTEGER': 0,
                'STRING': '',
                'TEXT': '',
                'FLOAT': 0,
                'DECIMAL': 0,
            }

            data = { ...data };
            let rawData = { ...data };

            for (let key in data) {
                if (!tableColumns.hasOwnProperty(key)) {
                    delete data[key];
                } else {
                    const tableColumn = tableColumns[key];
                    const tableDataType = tableColumn.type.key;
                    if (!data[key] && !tableColumn.hasOwnProperty('defaultValue')) {
                        data[key] = defaultValues[tableDataType]
                    }
                }
            }

            for (let column in tableColumns) {
                if (column != 'createdAt' && column != 'updatedAt' && column != 'id' && !data.hasOwnProperty('id')) {
                    const tableColumn = tableColumns[column];
                    const tableDataType = tableColumn.type.key;

                    // console.log(tableColumn, '=================>tableColumn');

                    if (!data.hasOwnProperty(column)) {
                        if (!tableColumn.hasOwnProperty('defaultValue')) {
                            data[column] = defaultValues[tableDataType];
                        } else {
                            // console.log(tableDataType, '===========>tableDataType');
                            // console.log(tableColumn.defaultValue, '===========>tableColumn.defaultValue');
                            data[column] = tableColumn.defaultValue;
                        }
                    }
                }
            }

            let id;
            console.log(data, '===========================>data');
            // return;

            if (data.hasOwnProperty('id')) {
                const updatedEntry = await model.update(
                    data,
                    {
                        where: {
                            id: data.id,
                        },
                        individualHooks: true
                    }
                );
                id = data.id;
            } else {
                const createdEntry = await model.create(data);
                id = createdEntry.dataValues.id;
            }

            if (returnData) {
                console.log(id, '======================+>id');

                let getData = await model.findOne({
                    where: {
                        id
                    }
                });
                getData = getData.toJSON();
                if (getData.hasOwnProperty('password')) {
                    delete getData['password'];
                }

                if (rawData.hasOwnProperty('imageFolders') && typeof rawData.imageFolders == 'object' && !Array.isArray(rawData.imageFolders) && Object.keys(rawData.imageFolders).length > 0 && Object.keys(req).length > 0) {
                    for (let column in rawData.imageFolders) {
                        const folder = rawData.imageFolders[column];
                        if (getData.hasOwnProperty(column) && getData[column] != '') {
                            if (!getData[column].includes('http')) {
                                getData[column] = `${req.protocol}://${req.get('host')}/images/${folder}/${getData[column]}`
                            }
                            // getData[column] = `${req.protocol}://${req.get('host')}/api/get/${getData[column]}`
                        }
                    }
                }

                return getData;
            }

            return id;
        } catch (err) {
            throw err;
        }
    },
    delete: async (model, id) => {
        await model.destroy({
            where: {
                id: {
                    [sequelize.Op.in]: Array.isArray(id) ? id : [id]
                }
            }
        });
    },

    isJson(item) {
        item = typeof item !== "string" ? JSON.stringify(item) : item;

        try {
            item = JSON.parse(item);
        } catch (e) {
            return false;
        }

        if (typeof item === "object" && item !== null) {
            return true;
        }

        return false;
    },

    clone: function (value) {
        return JSON.parse(JSON.stringify(value));
    },


    time: function () {
        var time = Date.now();
        var n = time / 1000;
        return time = Math.floor(n);
    },

    generateOTP: () => Math.floor(1000 + Math.random() * 9000),

    generateTransactionNumber: function (length = 10) {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < length; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        text += this.time();

        for (var i = 0; i < length; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    },

    success: function (res, message = '', body = {}) {
        return res.status(200).json({
            'success': true,
            'code': 200,
            'message': message,
            'body': body
        });
    },

    error: function (res, err, req) {
        console.log(err, '===========================>error');
        // console.log(JSON.stringify(ReferenceError));
        // console.log(ReferenceError);
        // return false;
        // let code=(typeof err==='object') ? ((err.statusCode) ? err.statusCode : ((err.code) ? err.code : 403)) : 403;
        let code = (typeof err === 'object') ? (err.code) ? err.code : 403 : 403;
        let message = (typeof err === 'object') ? (err.message ? err.message : '') : err;
        // console.log(code);
        // console.log(message);
        // return false;

        if (req) {
            req.flash('flashMessage', { color: 'error', message });

            const originalUrl = req.originalUrl.split('/')[1];
            return res.redirect(`/${originalUrl}`);
        }

        return res.status(code).json({
            'success': false,
            'message': message,
            'code': code,
            'body': {}
        });

    },
    bcryptHash: (myPlaintextPassword, saltRounds = 10) => {
        const bcrypt = require('bcrypt');
        const salt = bcrypt.genSaltSync(saltRounds);
        let hash = bcrypt.hashSync(myPlaintextPassword, salt);
        hash = hash.replace('$2b$', '$2y$');
        return hash;
    },

    comparePass: async (requestPass, dbPass) => {
        dbPass = dbPass.replace('$2y$', '$2b$');
        const match = await bcrypt.compare(requestPass, dbPass);
        return match;
    },
    sendEmail(object) {
        try {
            var transporter = nodemailer.createTransport(mailAuth);
            var mailOptions = {
                from: `${appName} <${mailAuth.auth.user}>`,
                ...object,
            };

            console.log(mailAuth); // mail auth configured in config/constants.js
            console.log(mailOptions);
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log('error', error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });
        } catch (err) {
            throw err;
        }
    },

    sendMail: function (object) {
        const nodemailer = require('nodemailer');
        var transporter = nodemailer.createTransport(config.mail_auth);
        var mailOptions = object;
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
    },

    createSHA1: function () {
        let key = 'abc' + new Date().getTime();
        return crypto.createHash('sha1').update(key).digest('hex');
    },
    // generateBarcode: async (text) => {
    //     var JsBarcode = require('jsbarcode');
    //     var canvas = require("canvas")
    //     JsBarcode(canvas, text, { format: "CODE39" });
    //     return canvas.toDataURL("image/png");
    // },
    generateBarcode: async (data, folder = 'users') => {
        const bwipjs = require('bwip-js');

        let name = `${uuid()}.png`;

        await new Promise(async (res, rej) => {
            bwipjs.toBuffer({
                bcid: 'code128',       // Barcode type
                text: data,    // Text to encode
                scale: 3,               // 3x scaling factor
                height: 10,              // Bar height, in millimeters
                includetext: true,            // Show human-readable text
                textxalign: 'center',        // Always good to set this
            }, function (err, png) {
                if (err) {
                    // `err` may be a string or Error object
                } else {

                    fs.writeFile(`public/uploads/${folder}/${name}`, png, function (err) {
                        if (err) rej(err);
                    });

                    console.log(png, '========>png');
                    res(png);

                    // `png` is a Buffer
                    // png.length           : PNG file length
                    // png.readUInt32BE(16) : PNG image width
                    // png.readUInt32BE(20) : PNG image height
                }
            });
        });
        return name;





        // var JsBarcode = require('jsbarcode');
        // var canvas = require("canvas");

        // // var canvas = new Canvas();
        // JsBarcode(canvas, "Hello");

        // // var g = canvas.getContext("2d");
        // // g.fillStyle = "black";
        // // g.fillRect(0, 0, 100, 100);

        // var buf = canvas.toBuffer();
        // fs.writeFileSync("test.png", buf);


        // console.log(abc, '============>abc');
        // const ctx = canvas.getContext('2d')
        // data = canvas;
        // console.log(data, '============>canvas');
        // var imageBuffer = new Buffer(data, 'base64');
        // console.log(imageBuffer, '============>buf');


        // fs.writeFile("public/uploads/image.png", imageBuffer, function(err) {
        //     if (err) throw err;
        // });

        // fs.writeFile('public/uploads/image.png', imageBuffer);
        // const buffer = canvas.toBuffer('image/png')
        // const buf2 = canvas.toBuffer('image/png', { compressionLevel: 3, filters: canvas.PNG_FILTER_NONE })

        // console.log(buf2, '===========>buf2');

        // fs.writeFileSync('public/uploads/image.png', buf2)
        // fs.writeFileSync('public/uploads/image.png', buffer)

        // const code39 = barcode('code128', {
        //     data: 'asdfasda',
        //     width: 400,
        //     height: 100,
        // });



        // // code39.getBase64(function (err, imgsrc) {
        // //     if (err) throw err;

        // //     // if we're using HTTP or another framework
        // //     res.end('<img src="' + imgsrc + '">');
        // // });
        // console.log(code39, '=========.code39');
        // // var outfile = path.join(__dirname, 'imgs', 'mycode.png')
        // // await code39.saveImage(outfile, function (err) {
        // //     if (err) throw err;

        // //     console.log('File has been written!');
        // // });

        // return code39;

        // await new Promise(async (res, rej) => {
        //     // await code.saveImage('public/uploads/' + folder + '/' + name, function (err) {
        //     await code39.saveImage(path.join(__dirname, 'imgs', 'mycode.png'), function (err) {
        //         if (err) rej(err);
        //         res();
        //         console.log('Barcode File has been written!');
        //     });
        // });
        // return name;
    },
    // imageUpload: (file, folder = 'users') => {
    //     if (file.name == '') return;

    //     let file_name_string = file.name;
    //     var file_name_array = file_name_string.split(".");
    //     var file_extension = file_name_array[file_name_array.length - 1];
    //     var letters = "ABCDE1234567890FGHJK1234567890MNPQRSTUXY";
    //     var result = "";
    //     // while (result.length<28)
    //     // {
    //     //     var rand_int = Math.floor((Math.random() * 19) + 1);
    //     //     var rand_chr= letters[rand_int];
    //     //     if (result.substr(-1, 1)!=rand_chr) result+=rand_chr;
    //     // }
    //     result = uuid();
    //     let name = result + '.' + file_extension;
    //     // console.log(name);return false;
    //     file.mv('public/uploads/' + folder + '/' + name, function (err) {
    //         if (err) throw err;
    //     });
    //     return name;
    // },
    imageUpload: (file, folder = 'users') => {
        if (file.name == '') return;

        let file_name_string = file.name;
        var file_name_array = file_name_string.split(".");
        var file_extension = file_name_array[file_name_array.length - 1];
        var result = "";
        result = uuid();
        let name = result + '.' + file_extension;
        // console.log(name);return false;
        // file.mv('public/uploads/' + folder + '/' + name, function (err) {
        file.mv(`images${folder ? `/${folder}` : ''}/${name}`, function (err) {
            if (err) throw err;
        });
        return name;
    },
    imageUploadWithRealName: (file, folder = 'users') => {
        if (file.name == '') return;

        let file_name_string = file.name;
        var file_name_array = file_name_string.split(".");
        var file_extension = file_name_array[file_name_array.length - 1];
        var letters = "ABCDE1234567890FGHJK1234567890MNPQRSTUXY";
        var result = "";
        // while (result.length<28)
        // {
        //     var rand_int = Math.floor((Math.random() * 19) + 1);
        //     var rand_chr= letters[rand_int];
        //     if (result.substr(-1, 1)!=rand_chr) result+=rand_chr;
        // }

        // result = uuid();
        // let name = result + '.' + file_extension;

        // console.log(name);return false;
        file.mv('public/uploads/' + folder + '/' + file_name_string, function (err) {
            if (err) throw err;
        });
        return file_name_string;
    },

    uploadImage: function (fileName, file, folderPath) {
        const rootPath = path.join(path.resolve(__dirname), '../');
        const imageBuffer = decodeBase64Image(file);
        const newPath = `${rootPath}${folderPath}${fileName}`;
        writeDataStream(newPath, imageBuffer.data);
        return newPath;
    },

    fileUpload(file, folder = 'users') {
        let file_name_string = file.name;
        var file_name_array = file_name_string.split(".");
        var file_extension = file_name_array[file_name_array.length - 1];
        var letters = "ABCDE1234567890FGHJK1234567890MNPQRSTUXY";
        var result = "";
        while (result.length < 28) {
            var rand_int = Math.floor((Math.random() * 19) + 1);
            var rand_chr = letters[rand_int];
            if (result.substr(-1, 1) != rand_chr) result += rand_chr;
        }
        let name = result + '.' + file_extension;
        // console.log(name);return false;
        file.mv('public/images/' + folder + '/' + name, function (err) {
            if (err) {
                throw err;
            }
        });
        return name;
    },

    sendPushNotificationTifiFunction: function (notification_data) {
        try {
            var serverKey = 'AAAA87hG_mQ:APA91bFubhzMoDS434ncH2B0H4686QFnD4xRws_KQME9uy-JT5-aQf1UG7zu_Q3IUP70xXIFqqhhvpXSiTifyiYTYU8QFaFYNqP3btQbmHCPEO98URWhDxW72IsIidCZ8HnuFNxFvZQh';
            const FCM = require('fcm-node');
            var fcm = new FCM(serverKey);
            var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
                to: notification_data.device_token,
                // registration_ids: regTokens  // for multiple device_tokens use "registration_ids" instead of "to"

                notification: {
                    title: 'Bahama Eats Notification',
                    body: notification_data.msg,
                },


                data: {  //you can send only notification or only data(or include both)
                    ...notification_data.body
                }
            };
            // console.log(message);
            // return false;

            fcm.send(message, function (err, response) {
                if (err) {
                    console.log("sendPushNotificationTifiFunction")
                    console.log("Something has gone wrong!", err);
                } else {
                    console.log("Successfully sent with response: ", response);
                }
            });
        } catch (err) {
            throw err;
        }
    },

    sendPushNotification: async function (dataForSend) {
        // console.log(dataForSend);

        const apn = require('apn');

        const options = {
            token: {
                key: __dirname + "/AuthKey_2PNTKZ4V8T.p8",
                keyId: "2PNTKZ4V8T",
                teamId: "7KU34ZBRT8"
                //   keyId: "N62K9PCCD2",
                //   teamId: "4XVQBWH9QF"
            },
            production: true
        };
        const apnProvider = new apn.Provider(options);

        if (dataForSend && dataForSend.deviceToken && dataForSend.deviceToken != '') {
            var myDevice = dataForSend.deviceToken;
            var note = new apn.Notification();

            console.log(myDevice);

            note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
            note.badge = 1;
            note.sound = "ping.aiff";

            note.alert = dataForSend.message;
            note.payload = { 'data': dataForSend };
            // note.topic = "cqlsys.BahamaEats";
            note.topic = "com.live.BahamaEats";

            console.log("send note", note);

            apnProvider.send(note, myDevice).then((result) => {
                // see documentation for an explanation of result
                console.log("send failed result", result.failed);
                //console.log("send err",err);
            }).catch((err) => {
                console.error("error while sending user notification", err);
            });
            // Close the server
            //apnProvider.shutdown();
        }
    },

    sendPushNotificationDriver: async function (dataForSend) {
        // console.log(dataForSend);

        const apn = require('apn');

        const options = {
            token: {
                key: __dirname + "/AuthKey_2PNTKZ4V8T.p8",
                keyId: "2PNTKZ4V8T",
                teamId: "7KU34ZBRT8"
                //   keyId: "2D764P6QG8",
                //   teamId: "UL6P4CWL4N"
            },
            production: true
        };
        const apnProvider = new apn.Provider(options);
        // console.log(apnProvider);

        if (dataForSend && dataForSend.deviceToken && dataForSend.deviceToken != '') {
            var myDevice = dataForSend.deviceToken;
            var note = new apn.Notification();

            console.log(myDevice);

            note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
            note.badge = 1;
            note.sound = "ping.aiff";

            note.alert = dataForSend.message;
            note.payload = { 'data': dataForSend };
            // note.topic = "cqlsys.BahamaEats";
            note.topic = "com.live.BahamaEatsDriver";

            console.log("send note", note);

            apnProvider.send(note, myDevice).then((result) => {
                // see documentation for an explanation of result
                console.log("send failed result", result.failed);
                //console.log("send err",err);
            }).catch((err) => {
                console.error("error while sending user notification", err);
            });
            // Close the server
            //apnProvider.shutdown();
        }
    },

    distance: function (lat1, lon1, lat2, lon2, unit) {
        //:::    lat1, lon1 = Latitude and Longitude of point 1 (in decimal degrees)  :::
        //:::    lat2, lon2 = Latitude and Longitude of point 2 (in decimal degrees)  :::
        //:::    unit = the unit you desire for results                               :::
        //:::           where: 'M' is statute miles (default)                         :::
        //:::                  'K' is kilometers                                      :::
        //:::                  'N' is nautical miles                                  :::

        if ((lat1 == lat2) && (lon1 == lon2)) {
            return 0;
        }
        else {
            var radlat1 = Math.PI * lat1 / 180;
            var radlat2 = Math.PI * lat2 / 180;
            var theta = lon1 - lon2;
            var radtheta = Math.PI * theta / 180;
            var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
            if (dist > 1) {
                dist = 1;
            }
            dist = Math.acos(dist);
            dist = dist * 180 / Math.PI;
            dist = dist * 60 * 1.1515;
            if (unit == "K") { dist = dist * 1.609344 }
            if (unit == "N") { dist = dist * 0.8684 }
            return dist;
        }
    },


    isValidDate(d) {
        return d instanceof Date && !isNaN(d);
    }


}
// const sequelize = require('sequelize');
// const models = require('../models');

const sequelize = require('sequelize');
// const User = models.users;
const bcrypt = require("bcrypt");
const config = require("./config");
const crypto = require("crypto");
var path = require("path");
var uuid = require("uuid");
const fs = require("fs");
const FCM = require("fcm-node");

const model = require('../models');
const models = model;
const users = model.users;
const drivers = model.drivers;

module.exports = {
  vaildObject: async function (required, non_required, res) {
    let message = "";
    let empty = [];
    let table_name = required.hasOwnProperty("table_name")
      ? required.table_name
      : "users";

    for (let key in required) {
      if (required.hasOwnProperty(key)) {
        if (required[key] == undefined || required[key] == "") {
          empty.push(key);
        }
      }
    }

    if (empty.length != 0) {
      message = empty.toString();
      if (empty.length > 1) {
        message += " fields are required";
      } else {
        message += " field is required";
      }
      res.status(400).json({
        success: false,
        message: message,
        code: 400,
        body: {}
      });
      return;
    } else {
      if (required.hasOwnProperty("security_key")) {
        if (required.security_key != "BahamaEats") {
          message = "Invalid security key";
          res.status(403).json({
            success: false,
            message: message,
            code: 403,
            body: []
          });
          res.end();
          return false;
        }
      }
      if (required.hasOwnProperty("password")) {
        // const saltRounds = 10;
        // var myPromise = await new Promise(function (resolve, reject) {
        //     bcrypt.hash(required.password, saltRounds, function (err, hash) {
        //         if (!err) {
        //             resolve(hash);
        //         } else {
        //             reject('0');
        //         }
        //     });
        // });
        // // required.password= crypto.createHash('sha1').update(required.password).digest('hex');
        // required.password = myPromise;
        // required.password = await this.getBcryptHash(required.password);
      }

      /* if (required.hasOwnProperty('checkexit')) {
                if (required.checkexit === 1) {
                    if (required.hasOwnProperty('email')) {
                        required.email = required.email.toLowerCase();

                        if (await this.checking_availability(required.email, 'email', table_name)) {
                            message = "this email is already register kindly use another";
                            res.status(403).json({
                                'success': false,
                                'message': message,
                                'code': 403,
                                'body': []
                            });
                            res.end();
                            return false;
                        }
                    }
                    if (required.hasOwnProperty('name') && required.name != undefined) {
                        required.name = required.name.toLowerCase();

                        if (await this.checking_availability(required.name, 'name', table_name)) {
                            message = "name is already in use";
                            res.status(403).json({
                                'success': false,
                                'message': message,
                                'code': 403,
                                'body': []
                            });
                            return false;
                        }
                    }

                }
            }


            if (non_required.hasOwnProperty('name') && non_required.name != undefined) {
                non_required.name = non_required.name.toLowerCase();

                if (await this.checking_availability(non_required.name, 'name', table_name)) {
                    message = "name is already in use";
                    res.status(403).json({
                        'success': false,
                        'message': message,
                        'code': 403,
                        'body': []
                    });
                    return false;
                }
            } */

      const marge_object = Object.assign(required, non_required);
      delete marge_object.checkexit;

      for (let data in marge_object) {
        if (marge_object[data] == undefined) {
          delete marge_object[data];
        } else {
          if (typeof marge_object[data] == "string") {
            marge_object[data] = marge_object[data].trim();
          }
        }
      }

      return marge_object;
    }
  },

  time: function () {
    var time = Date.now();
    var n = time / 1000;
    return (time = Math.floor(n));
  },

  generateTransactionNumber: function (length = 10) {
    var text = "";
    var possible =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < length; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));

    text += this.time();

    for (var i = 0; i < length; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
  },

  error: function (res, err) {
    console.log(err);
    console.log("error");
    // console.log(JSON.stringify(ReferenceError));
    // console.log(ReferenceError);
    // return false;
    // let code=(typeof err==='object') ? ((err.statusCode) ? err.statusCode : ((err.code) ? err.code : 403)) : 403;
    let code =
      typeof err === "object" ? (err.statusCode ? err.statusCode : 403) : 403;
    let message = typeof err === "object" ? err.message : err;
    // console.log(code);
    // console.log(message);
    // return false;
    res.status(code).json({
      success: false,
      message: message,
      code: code,
      body: []
    });
  },

  error400: function (res, err) {
    console.log(err);
    console.log("error");
    // console.log(JSON.stringify(ReferenceError));
    // console.log(ReferenceError);
    // return false;
    // let code=(typeof err==='object') ? ((err.statusCode) ? err.statusCode : ((err.code) ? err.code : 403)) : 403;
    let code =
      typeof err === "object" ? (err.statusCode ? err.statusCode : 403) : 403;
    let message =
      typeof err === "object"
        ? err.message && err.message.includes("number")
          ? err.message.slice(16)
          : err.message
        : err;
    // console.log(code);
    // console.log(message);
    // return false;
    res.status(400).json({
      success: false,
      message: message,
      code: 400,
      body: []
    });
  },

  getBcryptHash: async keyword => {
    const saltRounds = 10;
    var myPromise = await new Promise(function (resolve, reject) {
      bcrypt.hash(keyword, saltRounds, function (err, hash) {
        if (!err) {
          resolve(hash);
        } else {
          reject("0");
        }
      });
    });
    // required.password= crypto.createHash('sha1').update(required.password).digest('hex');
    myPromise = myPromise.replace("$2b$", "$2y$");

    keyword = myPromise;

    return keyword;
  },

  comparePass: async (requestPass, dbPass) => {
    dbPass = dbPass.replace("$2y$", "$2b$");
    const match = await bcrypt.compare(requestPass, dbPass);
    return match;
  },

  sendMail: function (object) {
    const nodemailer = require("nodemailer");
    var transporter = nodemailer.createTransport(config.mail_auth);

    var mailOptions = {
      ...object,
      from: `Bahama Eats <admin@BahamaEats.com>`,
    };

    // var mailOptions = object;
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  },
  sendTemplateMail: function (object) {
    const nodemailer = require("nodemailer");
    const ejs = require('ejs');
    const filePath = `/views/mails/${object.template}.ejs`;

    ejs.renderFile(appRoot + filePath, object.data, (err, data) => {
      console.log(err);
      const transporter = nodemailer.createTransport(config.mail_auth);
      const mailOptions = {
        // to: to,
        // from: 'admin@BahamaEats.com',
        // subject: subject,
        ...object,
        from: `Bahama Eats <admin@BahamaEats.com>`,
        html: data,
      }

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          // eslint-disable-next-line no-console
          console.log('i am checking error ', error);
        } else {
          // eslint-disable-next-line no-console
          console.log('Email sent: ' + info.response);
        }
      });
    });
  },

  createSHA1: function () {
    let key = "abc" + new Date().getTime();
    return crypto
      .createHash("sha1")
      .update(key)
      .digest("hex");
  },
  addattempedcount: async function (id, counts) {
    let updateUserObj = {
      'wrongAttemptCount': parseInt(counts) + 1,
    };
    let up_user = await users.update(updateUserObj,
      { returning: true, where: { id: id } }
    );
    return up_user
  },
  getattempedcount: async function (id) {

    let getUser = await users.findOne({
      where: {
        id: id,
      },
      attributes: ['id', 'email', 'password', 'firstName', 'lastName', 'username', 'countryCode', 'phone', 'photo', 'countryCodePhone', 'deviceType', 'deviceToken', 'status', 'createdAt', 'wrongAttemptBlock', 'wrongAttemptCount', 'updatedAt']
    });
    return getUser
  },
  Blockattemp: async function (id) {
    let updateUserObj = {
      'wrongAttemptBlock': 1,
    };
    let up_user = await users.update(updateUserObj,
      { returning: true, where: { id: id } }
    );
    return up_user
  },
  clearAttempedcount: async function (id) {
    let updateUserObj = {
      'wrongAttemptBlock': 0,
      'wrongAttemptCount': 0,
    };
    let up_user = await users.update(updateUserObj,
      { returning: true, where: { id: id } }
    );
    return up_user
  },
  //------------------------------drivers--------------//

  driversaddattempedcount: async function (id, counts) {
    let updateUserObj = {
      'wrongAttemptCount': parseInt(counts) + 1,
    };
    let up_user = await drivers.update(updateUserObj,
      { returning: true, where: { id: id } }
    );
    return up_user
  },

  driversgetattempedcount: async function (id) {

    let getUser = await drivers.findOne({
      where: {
        id: id,
      },
      attributes: ['id', 'email', 'password', 'firstName', 'lastName', 'username', 'countryCode', 'phone', 'photo', 'countryCodePhone', 'deviceType', 'deviceToken', 'status', 'createdAt', 'wrongAttemptBlock', 'wrongAttemptCount', 'updatedAt']
    });
    return getUser
  },

  driversBlockattemp: async function (id) {
    let updateUserObj = {
      'wrongAttemptBlock': 1,
    };
    let up_user = await drivers.update(updateUserObj,
      { returning: true, where: { id: id } }
    );
    return up_user
  },

  driversclearAttempedcount: async function (id) {
    let updateUserObj = {
      'wrongAttemptBlock': 0,
      'wrongAttemptCount': 0,
    };
    let up_user = await drivers.update(updateUserObj,
      { returning: true, where: { id: id } }
    );
    return up_user
  },

  imageUpload: function (image, folder = "users") {
    // console.log(image);return false;
    if (image) {
      var oldPath = image.path;
      // console.log(oldPath); return false;
      var extension = path.extname(image.originalFilename);
      var filename = uuid() + extension;
      var newPath = process.cwd() + "/public/images/" + folder + "/" + filename;
      // console.log(newPath); return false;
      fs.rename(oldPath, newPath, function (err) {
        if (err) throw err;
      });
      return filename;
    }
  },

  uploadImage: function (fileName, file, folderPath) {
    const rootPath = path.join(path.resolve(__dirname), "../");
    const imageBuffer = decodeBase64Image(file);
    const newPath = `${rootPath}${folderPath}${fileName}`;
    writeDataStream(newPath, imageBuffer.data);
    return newPath;
  },

  fileUpload(file, folder = "users") {
    let file_name_string = file.name;
    var file_name_array = file_name_string.split(".");
    var file_extension = file_name_array[file_name_array.length - 1];
    var letters = "ABCDE1234567890FGHJK1234567890MNPQRSTUXY";
    var result = "";
    while (result.length < 28) {
      var rand_int = Math.floor(Math.random() * 19 + 1);
      var rand_chr = letters[rand_int];
      if (result.substr(-1, 1) != rand_chr) result += rand_chr;
    }
    let name = result + "." + file_extension;
    // console.log(name);return false;
    file.mv("public/images/" + folder + "/" + name, function (err) {
      if (err) {
        throw err;
      }
    });
    return name;
  },

  sendPushNotification: async function (dataForSend) {
    const deviceTypes = await models.users.findAll({
      where: {
        deviceToken: dataForSend.deviceToken
      },
      attributes: [
        'deviceType',
      ],
      raw: true,
    }).map(data => data.deviceType);

    console.log(deviceTypes, '====.deviceTypes');
    // return;
    
    if (deviceTypes.includes(1)) {
      module.exports.iosPush('user', dataForSend);
    } else if (deviceTypes.includes(2)) {
      module.exports.androidPush('user', dataForSend);
    }
  },

  sendPushNotificationDriver: async function (dataForSend) {
    const deviceTypes = await models.drivers.findAll({
      where: {
        deviceToken: dataForSend.deviceToken
      },
      attributes: [
        'deviceType',
      ],
      raw: true,
    }).map(data => data.deviceType);

    if (deviceTypes.includes(1)) {
      module.exports.iosPush('user', dataForSend);
    } else if (deviceTypes.includes(2)) {
      module.exports.androidPush('user', dataForSend);
    }
    
    // console.log(dataForSend);
    module.exports.iosPush('driver', dataForSend);
    module.exports.androidPush('driver', dataForSend);
  },

  androidPush: (type = 'user', dataForSend) => {
    const serverKeys = {
      user: "AAAAa-sb-sE:APA91bEXs2zuH0wj9OKuaXcX08UX9XKdzF5G0N0kjwoUPAdIYi1tq73XIaYM1gYTyPT5Eq25giGfZf0RmRIcHpeae30CfFP6foSlDlbGJj-E6DT_ZNEC1ViXE2iCH2YGMvCYSlkY7RjG",
      driver: "AAAA3jFrSx4:APA91bGSBvWmbM-CazYiopeQS_WiHuUCbindZHRC3VOhuH0XlZd_QXzpZH9ZM1Tc8YdZn6He1LT6tkX0la4X6QAU_sJmKO2pijkpde28OZhsjx5NABa80LtyKUcm_nwcymezAAWWsfFS",
    };

    const serverKey = serverKeys[type];

    var fcm = new FCM(serverKey);

    const notificationData = {
      title: dataForSend.message,
      to: dataForSend.deviceToken,
      body: {
        ...dataForSend
      }
    };
    
    console.log(notificationData.to, "===================>to token");

    let notificationObj = {
      title: notificationData.title,
      badge: 0,
      sound: "default",
      priority: "high",
      ...(notificationData.hasOwnProperty("notificationObjData")
        ? { ...notificationData.notificationObjData }
        : {})
    };

    if (notificationData.hasOwnProperty("body")) {
      notificationObj["body"] = notificationData.body;
    }

    var message = {
      // to: data.to,
      // notification: notificationObj,
      data: {
        type: dataForSend.code,
        body: {
          ...notificationData.body
        }
      },
      priority: "high"
    };

    if (notificationData.deviceType == 1) message.notification = notificationObj;

    console.log(JSON.stringify(message, null, 2), "=========================>message");

    if (Array.isArray(notificationData.to)) {
      message["registration_ids"] = notificationData.to;
    } else {
      message["to"] = notificationData.to;
    }

    fcm.send(message, function (err, response) {
      if (err) {
        console.log("Something has gone wrong!", err);
      } else {
        console.log("Successfully sent with response: ", response);
      }
    });
  },

  iosPush: (type = 'user', dataForSend) => {
    const apn = require("apn");

    const topics = {
      user: 'com.live.BahamaEats',
      driver: 'com.live.BahamaEatsDriver',
    }
    
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

    if (
      dataForSend &&
      dataForSend.deviceToken &&
      dataForSend.deviceToken != ""
    ) {
      var myDevice = dataForSend.deviceToken;
      var note = new apn.Notification();

      console.log(myDevice);

      note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
      note.badge = 1;
      note.sound = "ping.aiff";

      note.alert = dataForSend.message;
      note.payload = { data: dataForSend };
      note.topic = topics[type];

      console.log("send note", note);

      apnProvider
        .send(note, myDevice)
        .then(result => {
          // see documentation for an explanation of result
          console.log("send failed result", result.failed);
          //console.log("send err",err);
        })
        .catch(err => {
          console.error("error while sending user notification", err);
        });
      // Close the server
      //apnProvider.shutdown();
    }
  },
  
  
  // sendPushNotification: async function (dataForSend) {
  //   // console.log(dataForSend);

  //   const apn = require("apn");

  //   const options = {
  //     token: {
  //       key: __dirname + "/AuthKey_2PNTKZ4V8T.p8",
  //       keyId: "2PNTKZ4V8T",
  //       teamId: "7KU34ZBRT8"
  //       //   keyId: "N62K9PCCD2",
  //       //   teamId: "4XVQBWH9QF"
  //     },
  //     production: true
  //   };
  //   const apnProvider = new apn.Provider(options);

  //   if (
  //     dataForSend &&
  //     dataForSend.deviceToken &&
  //     dataForSend.deviceToken != ""
  //   ) {
  //     var myDevice = dataForSend.deviceToken;
  //     var note = new apn.Notification();

  //     console.log(myDevice);

  //     note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
  //     note.badge = 1;
  //     note.sound = "ping.aiff";

  //     note.alert = dataForSend.message;
  //     note.payload = { data: dataForSend };
  //     // note.topic = "cqlsys.BahamaEats";
  //     note.topic = "com.live.BahamaEats";

  //     console.log("send note", note);

  //     apnProvider
  //       .send(note, myDevice)
  //       .then(result => {
  //         // see documentation for an explanation of result
  //         console.log("send failed result", result.failed);
  //         //console.log("send err",err);
  //       })
  //       .catch(err => {
  //         console.error("error while sending user notification", err);
  //       });
  //     // Close the server
  //     //apnProvider.shutdown();
  //   }
  // },

  // sendPushNotificationDriver: async function (dataForSend) {
  //   // console.log(dataForSend);

  //   const apn = require("apn");

  //   const options = {
  //     token: {
  //       key: __dirname + "/AuthKey_2PNTKZ4V8T.p8",
  //       keyId: "2PNTKZ4V8T",
  //       teamId: "7KU34ZBRT8"
  //       //   keyId: "2D764P6QG8",
  //       //   teamId: "UL6P4CWL4N"
  //     },
  //     production: true
  //   };
  //   const apnProvider = new apn.Provider(options);
  //   // console.log(apnProvider);

  //   if (
  //     dataForSend &&
  //     dataForSend.deviceToken &&
  //     dataForSend.deviceToken != ""
  //   ) {
  //     var myDevice = dataForSend.deviceToken;
  //     var note = new apn.Notification();

  //     console.log(myDevice);

  //     note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
  //     note.badge = 1;
  //     note.sound = "ping.aiff";

  //     note.alert = dataForSend.message;
  //     note.payload = { data: dataForSend };
  //     // note.topic = "cqlsys.BahamaEats";
  //     note.topic = "com.live.BahamaEatsDriver";

  //     console.log("send note", note);

  //     apnProvider
  //       .send(note, myDevice)
  //       .then(result => {
  //         // see documentation for an explanation of result
  //         console.log("send failed result", result.failed);
  //         //console.log("send err",err);
  //       })
  //       .catch(err => {
  //         console.error("error while sending user notification", err);
  //       });
  //     // Close the server
  //     //apnProvider.shutdown();
  //   }
  // },

  distance: function (lat1, lon1, lat2, lon2, unit) {
    //:::    lat1, lon1 = Latitude and Longitude of point 1 (in decimal degrees)  :::
    //:::    lat2, lon2 = Latitude and Longitude of point 2 (in decimal degrees)  :::
    //:::    unit = the unit you desire for results                               :::
    //:::           where: 'M' is statute miles (default)                         :::
    //:::                  'K' is kilometers                                      :::
    //:::                  'N' is nautical miles                                  :::

    if (lat1 == lat2 && lon1 == lon2) {
      return 0;
    } else {
      var radlat1 = (Math.PI * lat1) / 180;
      var radlat2 = (Math.PI * lat2) / 180;
      var theta = lon1 - lon2;
      var radtheta = (Math.PI * theta) / 180;
      var dist =
        Math.sin(radlat1) * Math.sin(radlat2) +
        Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
      if (dist > 1) {
        dist = 1;
      }
      dist = Math.acos(dist);
      dist = (dist * 180) / Math.PI;
      dist = dist * 60 * 1.1515;
      if (unit == "K") {
        dist = dist * 1.609344;
      }
      if (unit == "N") {
        dist = dist * 0.8684;
      }
      return dist;
    }
  },


  makeImageUrlSql: (model, field, modelFolder, returnField = field) => ([
    sequelize.literal(`(IF (\`${model}\`.\`${field}\`='', '', CONCAT('${baseUrl}/images/${modelFolder}/', \`${model}\`.\`${field}\`)) )`),
    returnField
]),
};

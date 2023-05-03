/*
|----------------------------------------------------------------------------------------------------------------------------
|   Socket Helpers File
|----------------------------------------------------------------------------------------------------------------------------
|
|   All socket helper methods in this file.
|
*/
const models = require('../models');
const sequelize = require('sequelize');
const { Op } = sequelize;
const apn = require("apn");
const FCM = require("fcm-node");

models.socket_users.belongsTo(models.users, { foreignKey: "userId" });
models.socket_users.belongsTo(models.drivers, { foreignKey: "userId" });

/*
|----------------------------------------------------------------------------------------------------------------------------
|   Exporting all methods
|----------------------------------------------------------------------------------------------------------------------------
*/
module.exports = {
    vaildSocketObject: async (required, nonRequired) => {
        let message = "";
        let empty = [];

        let model = required.hasOwnProperty("model") ? required.model : models.users;

        for (let key in required) {
            if (required.hasOwnProperty(key)) {
                if (
                    required[key] == undefined ||
                    (required[key] === "" &&
                        (required[key] !== "0" || required[key] !== 0))
                ) {
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
            throw {
                code: 400,
                message: message
            };
        }

        const mergedObject = Object.assign(required, nonRequired);

        for (let data in mergedObject) {
            if (mergedObject[data] == undefined) {
                delete mergedObject[data];
            } else {
                if (typeof mergedObject[data] == "string") {
                    mergedObject[data] = mergedObject[data].trim();
                }
            }
        }

        return mergedObject;
    },
    save: async (model, data, returnData = false, req = {}) => {
        try {
            if (!(typeof data == 'object' && !Array.isArray(data))) {
                throw 'Please send valid object in second argument of save function.';
            }
            // console.log(model, '===================>model');
            const tableColumns = model.rawAttributes
            // console.log(tableColumns, '==============>tableColumns');
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
            // console.log(data, '===========================>data');
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
                            getData[column] = `${baseUrl}/uploads/${folder}/${getData[column]}`
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

    clone: function (value) {
        return JSON.parse(JSON.stringify(value));
    },
    time: function () {
        var time = Date.now();
        var n = time / 1000;
        return time = Math.floor(n);
    },
    nowTimestamp: function () {
        return Math.floor(Date.now() / 1000);
    },
    isJson: (item) => {
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
    makeMessageFormatOfChatMessage: (model) => {
        return [sequelize.literal(`IF(\`${model}\`.\`messageType\` = 0, \`${model}\`.\`message\`, ${module.exports.makeImageUrlSqlQuery(model, 'message', 'chat')})`), 'message'];
    },
    makeImageUrlSqlQuery: (model, field, modelFolder, returnField = field) => {
        return `(IF (\`${model}\`.\`${field}\`='', '', CONCAT('${socketBaseUrl}/uploads/${modelFolder}/', \`${model}\`.\`${field}\`)) )`;
    },
    makeImageUrlSql: (model, field, modelFolder, returnField = field) => ([
        sequelize.literal(`(IF (\`${model}\`.\`${field}\`='', '', CONCAT('${socketBaseUrl}/uploads/${modelFolder}/', \`${model}\`.\`${field}\`)) )`),
        returnField
    ]),
    checkId: async (model, where, parameterName, error = true) => {
        const data = await model.findOne({
            where: typeof where == 'object'
                ? where
                : {
                    id: where
                },
            raw: true,
        });
        if (error && !data) throw `Invalid value in the parameter ${parameterName}.`;

        return data;
    },
    checkSocketId: async function (data, socketId) {
        const user = await models[data.type == 1 ? 'users' : 'drivers'].findOne({
            where: {
                id: data.userId,
            },
            raw: true,
        });
        if (!user) throw "Invalid userId.";
        
        let socketUser = await models.socket_users.findOne({
            where: {
                userId: data.userId,
                type: data.type,
            },
            raw: true,
        });
        log(socketUser, "socketUser inside checkSocketId");
        
        if (socketUser) data.id = socketUser.id;
        data.socketId = socketId;
        data.isOnline = 1;

        const createdSocketUser = await module.exports.save(models.socket_users, data, true);
        return createdSocketUser;
    },
    socketDisconnect: async function (socketId) {
        const socketUser = await models.socket_users.findOne({
            where: {
                socketId
            },
            raw: true,
        });
        if (!socketUser) throw "Invalid socketUser.";

        await module.exports.save(models.socket_users, {
            id: socketUser.id,
            isOnline: 0,
        });
    },
    getSocketByUserId: async function (type, userId, invalidIdErrorKey = '') {
        let socketUser = await models.socket_users.findOne({
            where: {
                userId,
                type,
            },
            include: [
                {
                    model: models[type == 1 ? 'users' : 'drivers'],
                    required: true,
                }
            ],
        }).then(async data => {
            if (!data) return data;
            data = data.toJSON();

            // data.user = data[type == 1 ? 'user' : 'driver'];
            // delete data.driver;
            return data;
        });

        log(socketUser, "socketUser inside getSocketByUserId");

        if (!socketUser && invalidIdErrorKey) throw `${invalidIdErrorKey} not connected.`;

        return socketUser;
    },
    getChatsByUserId: async function (userId) {
        return await module.exports.getChats(
            {
                [Op.or]: [
                    {
                        senderId: userId,
                    },
                    {
                        receiverId: userId,
                    },
                ],
            }
        );
    },
    getChatMessagesByUserId: async function (userId, otherUserId) {
        return await module.exports.getChatMessages(
            {
                [Op.or]: [
                    {
                        senderId: userId,
                        receiverId: otherUserId,
                    },
                    {
                        senderId: otherUserId,
                        receiverId: userId,
                    },
                ],
            },
            {
                order: [['id', 'DESC']],
            }
        );
    },
    getChatBySenderIdReceiverId: async function (senderId, receiverId) {
        return await module.exports.getChat(
            {
                [Op.or]: [
                    {
                        senderId,
                        receiverId,
                    },
                    {
                        senderId: receiverId,
                        receiverId: senderId,
                    },
                ],
            }
        );
    },
    getChat: async function (where, modifyConditions = {}) {
        return await models.chat.findOne({
            where: {
                ...where,
            },
            include: module.exports.chatIncludes(),
            attributes: { ...module.exports.chatAttributes() },
            ...modifyConditions,
        }).then(data => module.exports.getChatResponse(data));
    },
    getChats: async function (where, modifyConditions = {}) {
        return await models.chat.findAll({
            where: {
                ...where,
            },
            include: module.exports.chatIncludes(),
            attributes: { ...module.exports.chatAttributes() },
            order: [['id', 'DESC']],
            ...modifyConditions,
        }).map(data => module.exports.getChatResponse(data));
    },
    chatAttributes: () => ({
        include: [
            // [sequelize.literal(`(0)`), 'isRead']
        ]
    }),
    chatIncludes: () => ([
        {
            model: models['user'],
            required: true,
            as: 'sender',
            attributes: [
                'id',
                'role',
                'email',
                // 'phone',
            ],
            include: [
                ...module.exports.detailIncludes('sender'),
            ],
        },
        {
            model: models['user'],
            required: true,
            as: 'receiver',
            attributes: [
                'id',
                'role',
                'email',
                // 'phone',
            ],
            include: [
                ...module.exports.detailIncludes('receiver'),
            ],
        },
        {
            model: models['chatMessage'],
            as: 'lastMessage',
            required: true,
            attributes: {
                include: [
                    module.exports.makeMessageFormatOfChatMessage('lastMessage'),
                ]
            }
        }
    ]),
    getChatMessageById: async function (id) {
        return await module.exports.getChatMessage({
            id
        });
    },
    getChatMessageBysenderIdReceiverId: async function (senderId, receiverId) {
        return await module.exports.getChatMessage({
            [Op.or]: [
                {
                    senderId,
                    receiverId,
                },
                {
                    senderId: receiverId,
                    receiverId: senderId,
                },
            ],
        });
    },
    getChatMessage: async function (where, modifiedConditions) {
        return await models.chatMessage.findOne({
            where: {
                ...where,
            },
            include: module.exports.chatMessageIncludes(),
            attributes: module.exports.chatMessageAttributes(),
            ...modifiedConditions,
        }).then(data => module.exports.getChatMessageResponse(data));
    },
    getChatMessages: async function (where, modifiedConditions) {
        return await models.chatMessage.findAll({
            where: {
                ...where,
            },
            include: module.exports.chatMessageIncludes(),
            attributes: module.exports.chatMessageAttributes(),
            ...modifiedConditions,
        }).map(data => module.exports.getChatMessageResponse(data));
    },
    chatMessageAttributes: () => ({
        include: [
            module.exports.makeMessageFormatOfChatMessage('chatMessage'),
        ]
    }),
    chatMessageIncludes: () => ([
        {
            model: models['user'],
            required: true,
            as: 'sender',
            attributes: [
                'id',
                'role',
                'email',
                // 'phone',
            ],
            include: [
                ...module.exports.detailIncludes('sender'),
            ],
        },
        {
            model: models['user'],
            required: true,
            as: 'receiver',
            attributes: [
                'id',
                'role',
                'email',
                // 'phone',
            ],
            include: [
                ...module.exports.detailIncludes('receiver'),
            ],
        },
    ]),
    detailIncludes: (model) => {
        return [
            {
                model: models.userDetail,
                required: false,
                attributes: [
                    'name',
                    // 'firstName',
                    // 'lastName',
                    module.exports.makeImageUrlSql(`${model ? `${model}->` : ''}userDetail`, 'image', 'user'),
                ]
            },
            {
                model: models.driverDetail,
                required: false,
                attributes: [
                    'name',
                    // 'firstName',
                    // 'lastName',
                    module.exports.makeImageUrlSql(`${model ? `${model}->` : ''}driverDetail`, 'image', 'user'),
                ]
            },
        ];
    },
    getChatResponse: (data) => {
        if (!data) return data;
        data = data.toJSON();

        module.exports.reformatUserDetail(data, 'sender');
        module.exports.reformatUserDetail(data, 'receiver');

        // if (data.hasOwnProperty('lastMessage') && data.lastMessage && Object.keys(data.lastMessage).length > 0) {
        //     data.lastMessage = data.lastMessage.message;
        // }

        return data;
    },
    getChatMessageResponse: (data) => {
        if (!data) return data;
        data = data.toJSON();

        module.exports.reformatUserDetail(data, 'sender');
        module.exports.reformatUserDetail(data, 'receiver');

        return data;
    },
    reformatUserDetail: (data, key) => {
        const detail = data[key][userRoleModels[data[key].role]];
        detail.detailId = detail.id;
        delete detail.id

        for (let urmKey in userRoleModels) {
            delete data[key][userRoleModels[urmKey]];
        }

        data[key] = {
            ...data[key],
            ...detail,
        }
    },

    sendAndSaveNotification: async ({ userId, notificationCode, notificationMessage, notificationData }) => {
        const addNotificationData = {
            userId,
            notificationCode,
            notificationMessage,
            notificationData,
        };

        module.exports.save(models['notification'], addNotificationData);

        const userTokens = await models['userToken'].findAll({
            where: {
                userId,
            },
            raw: true,
        });

        if (userTokens && userTokens.length > 0) {
            userTokens.forEach(async userToken => {
                const sendNotificationData = {
                    deviceType: userToken.deviceType,
                    deviceToken: userToken.deviceToken,
                    title: notificationMessage,
                    code: notificationCode,
                    body: notificationData
                };

                module.exports.pushNotification(sendNotificationData);
            });
        }
    },
    pushNotification: async function (notificationData) {
        // console.log(JSON.stringify(notificationData, null, 2), '=======>notificationData');

        if (notificationData.hasOwnProperty('deviceType') && notificationData.deviceType == 1) {
            return module.exports.pushNotificationIos(notificationData);
        } else {
            return module.exports.pushNotificationAndroid(notificationData);
        }
    },
    pushNotificationIos: async function (dataForSend) {
        try {

            console.log(dataForSend, '=======>dataForSend');

            const topic = "com.apps.solefinder";

            const options = {
                token: {
                    key: __dirname + "/AuthKey_5B82466549.p8",
                    keyId: "5B82466549",
                    teamId: "4XVQBWH9QF",
                },
                production: false
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

                console.log(myDevice, '=============>myDevice');

                note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
                note.contentAvailable = 1;
                note.badge = 1;
                note.sound = "ping.aiff";

                note.title = global.appName;
                note.body = dataForSend.title;
                // note.payload = { data: dataForSend.body };
                note.payload = {    //This is only optional, you can send any data
                    soundname: "default",
                    deviceToken: dataForSend.deviceToken,
                    code: dataForSend.code,
                    body: dataForSend.body,
                };
                note.topic = topic;

                console.log(JSON.stringify(note, null, 2), "----------------->push notification Data");

                // console.log(type, '=====>type')

                apnProvider
                    .send(note, myDevice)
                    .then(result => {

                        // see documentation for an explanation of result
                        console.log("send result response", result);
                        //console.log("send err",err);
                    })
                    .catch(err => {
                        console.error("error while sending user notification", err);
                    });
                // Close the server
                //apnProvider.shutdown();
            }
        } catch (err) {
            console.log(err, '====>errrrrrr in ios push notification function');
        }
    },
    pushNotificationAndroid: async function (notificationData) {
        try {
            var serverKey =
                "AAAAVrVlm6s:";

            var fcm = new FCM(serverKey);

            var message = {
                content_available: true,
                message: notificationData.title,
                data: {
                    message: notificationData.title,
                    deviceToken: notificationData.deviceToken,
                    code: notificationData.code,
                    body: {
                        message: notificationData.title,
                        ...notificationData.body
                    }
                },
                priority: "high"
            };
            console.log(JSON.stringify(message, null, 2), "=========================>message");

            if (Array.isArray(notificationData.deviceToken)) {
                message["registration_ids"] = notificationData.deviceToken;
            } else {
                message["to"] = notificationData.deviceToken;
            }

            fcm.send(message, function (err, response) {
                if (err) {
                    console.log("Something has gone wrong!", err);
                } else {
                    console.log("Successfully sent with response: ", response);
                }
            });
        } catch (err) {
            console.log(err, '====>errrrrrr in andoid push notification function');
        }
    },
}

/*
|----------------------------------------------------------------------------------------------------------------------------
|   END
|----------------------------------------------------------------------------------------------------------------------------
*/
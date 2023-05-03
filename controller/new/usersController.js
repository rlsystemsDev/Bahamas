const model = require('../../models');
const config = require('../../config/config.js');
const helper = require('../../config/helper');
const responseHelper = require('../../helpers/responseHelper');
const helperFunctions = require('../../helpers/helperFunctions');
const User = model.users;
const UserAddress = model.addresses;
const Help = model.help;
const Notifications = model.notifications;
const Order = model.orders;
const Restaurant = model.restaurants;
const OrderDetail = model.orderDetails;
const RideRequest = model.rideRequests;
const Drivers = model.drivers;
const OrderRating = model.orderRatings;
const WalletPayments = model.walletPayments;
const settings_model = model.settings;
var jwt = require('jsonwebtoken');
let secretKey = 'secret';

Order.belongsTo(Restaurant, { foreignKey: 'restaurantId' });
Order.hasMany(OrderDetail, { foreignKey: 'orderId' });
RideRequest.belongsTo(Drivers, { foreignKey: 'driverId' });

module.exports = {
    sendPhoneOTP: async (req, res) => {
        try {
            const required = {
                security_key: req.headers.security_key,
                countryCode: req.body.countryCode,
                phone: req.body.phone,
            };
            const non_required = {};
            let requestdata = await helper.vaildObject(required, non_required, res);

            requestdata.countryCode = requestdata.countryCode.replace(/[+_]/g, '');
            requestdata.countryCode = requestdata.countryCode.replace(/[(_]/g, '');
            requestdata.countryCode = requestdata.countryCode.replace(/[)_]/g, '');
            requestdata.countryCode = requestdata.countryCode.replace(/[-_]/g, '');

            requestdata.phone = requestdata.phone.replace(/[+_]/g, '');
            requestdata.phone = requestdata.phone.replace(/[(_]/g, '');
            requestdata.phone = requestdata.phone.replace(/[)_]/g, '');
            requestdata.phone = requestdata.phone.replace(/[-_]/g, '');

            requestdata.countryCodePhone = requestdata.countryCode + requestdata.phone;

            let countryCodePhoneExists = await User.findOne({
                where: {
                    id: {
                        $ne: req.user.id
                    },
                    countryCodePhone: requestdata.countryCodePhone
                },
            });
            if (countryCodePhoneExists) {
                throw "This phone number has already been used. Kindly user another.";
            }

            const client = require('twilio')(config.twilio.accountSid, config.twilio.authToken);

            var OTP = Math.floor(1000 + Math.random() * 9000);




            await new Promise(async (twilioRes, twilioRej) => {
                // await client.lookups.v1.phoneNumbers('+12428183287')
                await client.lookups.v1.phoneNumbers(requestdata.countryCodePhone)
                    .fetch({ type: ['carrier'] })
                    .then(async phone_number => {
                        console.log(phone_number, "===========phone_number====");
                        twilioRes(phone_number);

                        if (phone_number.carrier.type == "voip") {

                            return helperFunctions.error(res, 'Please choose a carrier number.');
                        } else {
                              
                            const otpResponse = await client.messages.create(
                                {
                                    to: `+${requestdata.countryCodePhone}`,
                                    from: '+13213961165',
                                    // body: `Your OTP: ${OTP}`,
                                    body: `Your One Time Password is ${OTP} for Bahama Eats. Please do not share this OTP with anyone.Thank you!`,
                                });

                            if (otpResponse.hasOwnProperty('status') && otpResponse.status == '400') {
                                throw otpResponse.message;
                            }

                            let updateUserObj = {
                                'otp': OTP
                            };
                            let up_user = await User.update(updateUserObj,
                                { returning: true, where: { id: req.user.id } }
                            );

                            let found_user = await User.findOne({
                                where: { id: req.user.id },
                                attributes: ['id', 'countryCode', 'phone', 'countryCodePhone', 'otp', 'created_at', 'updated_at']
                            });

                            return res.status(200).json({
                                'status': true,
                                'code': 200,
                                'message': 'OTP sent successfully.',
                                'body': found_user
                            });
                        }
                    }

                    ).catch(err => {

                        if (err.code) {

                            if (err.code == 20404) {
                                err.message = "Please choose a correct number"
                            }
                        }
                        return helperFunctions.error(res, err.message);
                    }).done();
            })
            
        } catch (err) {
            console.log(err);
            return helper.error(res, err);
        }
    },

    verifyPhoneOTP: async (req, res) => {
        try {
            const required = {
                security_key: req.headers.security_key,
                otp: req.body.otp,
                countryCode: req.body.countryCode,
                phone: req.body.phone,
            };
            const non_required = {};
            let requestdata = await helper.vaildObject(required, non_required, res);

            requestdata.countryCode = requestdata.countryCode.replace(/[+_]/g, '');
            requestdata.countryCode = requestdata.countryCode.replace(/[(_]/g, '');
            requestdata.countryCode = requestdata.countryCode.replace(/[)_]/g, '');
            requestdata.countryCode = requestdata.countryCode.replace(/[-_]/g, '');

            requestdata.phone = requestdata.phone.replace(/[+_]/g, '');
            requestdata.phone = requestdata.phone.replace(/[(_]/g, '');
            requestdata.phone = requestdata.phone.replace(/[)_]/g, '');
            requestdata.phone = requestdata.phone.replace(/[-_]/g, '');

            requestdata.countryCodePhone = requestdata.countryCode + requestdata.phone;
            let user = req.user;
            // console.log(user.otp);

            if (user.otp != requestdata.otp) {
                throw "Invalid OTP.";
            }

            let updateUserObj = {
                countryCode: requestdata.countryCode,
                phone: requestdata.phone,
                countryCodePhone: requestdata.countryCodePhone,
            };
            let up_user = await User.update(updateUserObj,
                { returning: true, where: { id: req.user.id } }
            );

            let found_user = await User.findOne({
                where: { id: req.user.id },
                attributes: ['id', 'countryCode', 'phone', 'countryCodePhone', 'otp', 'created_at', 'updated_at']
            });

            return res.status(200).json({
                'status': true,
                'code': 200,
                'message': 'OTP verified and phone number updated successfully.',
                'body': found_user
            });
        } catch (err) {
            console.log(err);
            return helper.error(res, err);
        }
    },

    getProfile: async (req, res) => {
        
        try {
            const required = {
                security_key: req.headers.security_key,
                user_id: req.headers.user_id,
            };
            const non_required = {};

            let requestdata = await helper.vaildObject(required, non_required, res);
         //console.log(requestdata);return false;

            let getUser = await User.findOne({
                where: {
                    id: requestdata.user_id
                },
                attributes: [
                    'id', 'email', 'firstName', 'lastName', 'username', 'country_code', 'phone', 'country_code_phone', 'photo', 'wallet_amount' ,'wallet_pin', 'created_at', 'updated_at'
                ],
            });

            if (!getUser) {
                throw "Invalid value in the parameter user_id.";
            };

            if (getUser.photo != '') {
                if (getUser.photo.trim().substring(0, 4) !== 'http') {
                    getUser.photo = req.protocol + '://' + req.get('host') + '/images/users/' + getUser.photo;
                }
            }

            getUser.dataValues.joinedDate = getUser.dataValues.created_at;
            //getUser.dataValues.wallet_amount= getUser.dataValues.created_at;;
            // console.log(getUser); return false;
            var getSettings = await settings_model.findOne({

            })
            // console.log(getUser,"=============getUser==============")
            if (getSettings) {
                getUser.dataValues.send_credit = getSettings.send_credit,
                    getUser.dataValues.add_money = getSettings.add_money
            } else {
                getUser.dataValues.send_credit = '0'
                getUser.dataValues.add_money = '0'
            }
            res.status(200).json({
                'status': true,
                'code': 200,
                'message': 'Get User Profile.',
                'body': getUser
            });

        } catch (err) {
            // console.log(err);
            responseHelper.onError(res, err);
            // throw err;
        }
    },


    getSettings: async (req, res) => {
        try {
            const required = {
                security_key: req.headers.security_key,
            };
            const non_required = {};

            let requestdata = await helper.vaildObject(required, non_required, res);
            // console.log(req.user);
            // console.log(requestdata); return false;

            let getUser = await User.findOne({
                where: {
                    id: req.user.id
                },
                attributes: [
                    'id', 'email', 'username', 'isNotification', 'paymentMethod', 'created_at', 'updated_at'
                ],
            });

            if (!getUser) {
                throw "Invalid value in the parameter user_id.";
            };

            // if (getUser.photo != '') {
            //     if (getUser.photo.trim().substring(0,4) !== 'http') {
            //         getUser.photo = req.protocol + '://' + req.get('host') + '/images/users/' + getUser.photo;
            //     }
            // }

            res.status(200).json({
                'status': true,
                'code': 200,
                'message': 'Get User Profile.',
                'body': getUser
            });

        } catch (err) {
            // console.log(err);
            responseHelper.onError(res, err);
            // throw err;
        }
    },


    editSetting: async (req, res) => {
        try {
            const required = {
                security_key: req.headers.security_key,
            };
            const non_required = {
                isNotification: req.body.isNotification,
                paymentMethod: req.body.paymentMethod,
            };

            let requestdata = await helper.vaildObject(required, non_required, res);

            let validIsNotification = ['0', '1'];
            if (validIsNotification.indexOf(requestdata.isNotification) == -1) {
                throw 'Invalid value in the parameter isNotification.';
            }

            let validPaymentMethod = ['1', '2', '3'];
            if (validPaymentMethod.indexOf(requestdata.paymentMethod) == -1) {
                throw 'Invalid value in the parameter paymentMethod.';
            }

            // console.log(requestdata); return false;

            for (let data in requestdata) {
                if (requestdata[data] == undefined) {
                    delete requestdata[data];
                } else {
                    if (typeof requestdata[data] == "string") {
                        requestdata[data] = requestdata[data].trim();
                    }
                }
            }


            if (requestdata.hasOwnProperty('isNotification') && requestdata.email != "") {
                await User.update({
                    isNotification: requestdata.isNotification,
                },
                    {
                        returning: true, where: { id: req.user.id }
                    });
            }


            if (requestdata.hasOwnProperty('paymentMethod') && requestdata.email != "") {
                await User.update({
                    paymentMethod: requestdata.paymentMethod,
                },
                    {
                        returning: true, where: { id: req.user.id }
                    });
            }

            let updatedUser = await User.findOne({
                where: {
                    id: req.user.id
                },
                attributes: [
                    'id', 'username', 'email', 'isNotification', 'paymentMethod', 'createdAt', 'updatedAt'
                ]
            });

            // if (updatedUser.photo != '') {
            //     if (updatedUser.photo.trim().substring(0,4) !== 'http') {
            //         updatedUser.photo = req.protocol + '://' + req.get('host') + '/images/users/' + updatedUser.photo;
            //     }
            // }

            res.status(200).json({
                'status': true,
                'code': 200,
                'message': 'Setting updated successfully.',
                'body': updatedUser
            });

        } catch (err) {
            console.log(err);
            responseHelper.onError(res, err);
            // throw err;
        }
    },

    editProfile: async (req, res) => {
        try {
            const required = {
                security_key: req.headers.security_key,
            };
            const non_required = {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                username: req.body.username,
                email: req.body.email,
                countryCode: req.body.countryCode,
                phone: req.body.phone,
            };

            let requestdata = await helper.vaildObject(required, non_required, res);

            if (requestdata.countryCode) {
                requestdata.countryCode = requestdata.countryCode.replace(/[+_]/g, '');
                requestdata.countryCode = requestdata.countryCode.replace(/[(_]/g, '');
                requestdata.countryCode = requestdata.countryCode.replace(/[)_]/g, '');
                requestdata.countryCode = requestdata.countryCode.replace(/[-_]/g, '');
            }

            if (requestdata.phone) {
                requestdata.phone = requestdata.phone.replace(/[+_]/g, '');
                requestdata.phone = requestdata.phone.replace(/[(_]/g, '');
                requestdata.phone = requestdata.phone.replace(/[)_]/g, '');
                requestdata.phone = requestdata.phone.replace(/[-_]/g, '');
            }

            for (let data in requestdata) {
                if (requestdata[data] == undefined) {
                    delete requestdata[data];
                } else {
                    if (typeof requestdata[data] == "string") {
                        requestdata[data] = requestdata[data].trim();
                    }
                }
            }

            let upUserObj = {};

            if (requestdata.hasOwnProperty('firstName') && requestdata.firstName != "") {
                upUserObj['firstName'] = requestdata.firstName;
            }
            if (requestdata.hasOwnProperty('lastName') && requestdata.lastName != "") {
                upUserObj['lastName'] = requestdata.lastName;
            }

            if (upUserObj) {
                await User.update(upUserObj,
                    {
                        returning: true, where: { id: req.user.id }
                    });
            }


            if (requestdata.hasOwnProperty('username') && requestdata.username != "") {
                // let findUsernameAlreadyExists = await User.findOne({
                //     where: {
                //         id: {
                //             $ne: req.user.id
                //         },
                //         username: requestdata.username
                //     }
                // });
                // if (findUsernameAlreadyExists) {
                //     throw "This username already exists, Kindly use another.";
                // }

                await User.update({
                    username: requestdata.username,
                },
                    {
                        returning: true, where: { id: req.user.id }
                    });
            }

            if (requestdata.hasOwnProperty('email') && requestdata.email != "") {
                let findEmailAlreadyExists = await User.findOne({
                    where: {
                        id: {
                            $ne: req.user.id
                        },
                        email: requestdata.email
                    }
                });
                if (findEmailAlreadyExists) {
                    throw "This email already exists, Kindly use another.";
                }

                await User.update({
                    email: requestdata.email,
                },
                    {
                        returning: true, where: { id: req.user.id }
                    });
            }

            if (requestdata.hasOwnProperty('countryCode') && requestdata.hasOwnProperty('phone') && requestdata.countryCode != "" && requestdata.phone != "") {
                // if (requestdata.hasOwnProperty('phone') && requestdata.phone != "") {
                // console.log(req.user.id); return false;                    

                let countryCodePhone = requestdata.countryCode + requestdata.phone;

                let phoneAlreadyExists = await User.findOne({
                    where: {
                        id: {
                            $ne: req.user.id
                        },
                        countryCodePhone: countryCodePhone
                        // phone: requestdata.phone
                    }
                });
                // console.log(phoneAlreadyExists); return false;    
                if (phoneAlreadyExists) {
                    throw "This phone already exists, Kindly use another.";
                }

                await User.update({
                    countryCode: requestdata.countryCode,
                    phone: requestdata.phone,
                    countryCodePhone: countryCodePhone,
                },
                    {
                        returning: true, where: { id: req.user.id }
                    });

            }

            let image = "";
            if (req.files && req.files.photo) {
                image = helper.fileUpload(req.files.photo, 'users');
                let up_user = await User.update({ photo: image },
                    { returning: true, where: { id: req.user.id } });
            }

            let updatedUser = await User.findOne({
                where: {
                    id: req.user.id
                },
                attributes: [
                    'id', 'firstName', 'lastName', 'username', 'email', 'countryCode', 'phone', 'countryCodePhone', 'photo', 'createdAt', 'updatedAt'
                ]
            });

            if (updatedUser.photo != '') {
                if (updatedUser.photo.trim().substring(0, 4) !== 'http') {
                    updatedUser.photo = req.protocol + '://' + req.get('host') + '/images/users/' + updatedUser.photo;
                }
            }

            res.status(200).json({
                'status': true,
                'code': 200,
                'message': 'Profile updated successfully.',
                'body': updatedUser
            });

        } catch (err) {
            console.log(err);
            responseHelper.onError(res, err);
            // throw err;
        }
    },


    changePassword: async (req, res) => {
        try {
            const required = {
                security_key: req.headers.security_key,
                currentPassword: req.body.currentPassword,
                newPassword: req.body.newPassword,
            };
            const non_required = {

            };

            let requestdata = await helper.vaildObject(required, non_required, res);

            for (let data in requestdata) {
                if (requestdata[data] == undefined) {
                    delete requestdata[data];
                } else {
                    if (typeof requestdata[data] == "string") {
                        requestdata[data] = requestdata[data].trim();
                    }
                }
            }

            check_password = await helper.comparePass(requestdata.currentPassword, req.user.password);
            if (!check_password) {
                throw "Current password did not match with the old password.";
            }


            let updatedUser = await User.findOne({
                where: {
                    id: req.user.id
                },
                attributes: [
                    'id', 'username', 'email', 'countryCode', 'phone', 'countryCodePhone', 'photo', 'createdAt', 'updatedAt'
                ]
            });

            let passwordHash = await helper.getBcryptHash(requestdata.newPassword);

            let updateForgotPasswordHash = await User.update({
                password: passwordHash
            },
                {
                    returning: true, where: { id: req.user.id }
                });

            res.status(200).json({
                'status': true,
                'code': 200,
                'message': 'Password changed successfully.',
                'body': updatedUser
            });

        } catch (err) {
            console.log(err);
            responseHelper.onError(res, err);
            // throw err;
        }
    },

    addHelp: async (req, res) => {
        try {
            const required = {
                security_key: req.headers.security_key,
                comment: req.body.comment
            };
            const non_required = {
            };

            let requestdata = await helper.vaildObject(required, non_required, res);

            // console.log(req.files);
            // return false;

            let upObj = {};
            upObj = { ...requestdata };
            delete upObj['security_key'];
            upObj['userId'] = req.user.id;

            if (requestdata != '') {
                let addHelp = await Help.create(upObj);


                let getHelp = await Help.findOne({
                    where: { id: addHelp.id },
                });


                return res.status(200).json({
                    'status': true,
                    'code': 200,
                    'message': 'Help added successfully',
                    'body': getHelp
                });
            } else {
                throw "Help could not be created.";
            }

        } catch (err) {
            console.log(err);
            responseHelper.onError(res, err);
        }
    },

    getUserNotifications: async (req, res) => {
        try {
            const required = {
                security_key: req.headers.security_key,
            };
            const non_required = {};

            let requestdata = await helper.vaildObject(required, non_required, res);
            // console.log(req.user);

            let getUser = await User.findOne({
                where: {
                    id: req.user.id
                }
            });
            if (!getUser) {
                throw 'Invalid value in the auth token.';
            }
             console.log(req.user.id,'sdsds');

            let notifications = await Notifications.findAll({
                where: {
                    receiverId: req.user.id,
                    receiverType: 1
                },
                order: [
                    ['id', 'DESC'],
                ]
                // order: ['id', 'desc']
            });

            let result = await Promise.all(notifications.map(async (notification) => {
                notification = notification.toJSON();
                let orderDetails = [];
                let restaurantName = '';
                let restaurantImage = '';
                let restaurantId = 0;
                let rideDetails = {};
                // console.log(notification);
                if (notification.orderId != 0) {
                    let order = await Order.findOne({
                        where: {
                            id: notification.orderId
                        },
                        include: [
                            {
                                model: OrderDetail,
                                required: false,
                            },
                            {
                                model: Restaurant,
                                required: false,
                            }
                        ]
                    });
                    // console.log(order);

                    if (order) {
                        order = order.toJSON();
                        // console.log(order);                      
                        if (order.orderDetails) {
                            orderDetails = order.orderDetails;
                        }
                        if (order.restaurant) {
                            restaurantName = order.restaurant.name;
                            restaurantImage = order.restaurant.image;
                            restaurantId = order.restaurant.id;
                        }
                    }

                }

                if (notification.rideRequestId != 0) {
                    let rideRequest = await RideRequest.findOne({
                        where: {
                            id: notification.rideRequestId
                        }
                    });

                    if (rideRequest) {
                        rideDetails = rideRequest.toJSON();
                    }
                }
                
                
                if(restaurantName == ''){
                    restaurantName = 'Bahama Eats';
                    restaurantImage = 'https://admin.bahamaeats.com/public/1024.png'; 
                }
                if(notification.restaurantId){
                    restaurantId = notification.restaurantId;
                }
                notification.rideDetails = rideDetails;
                notification.orderDetails = orderDetails;
                notification.restaurantName = restaurantName;
                notification.restaurantImage = restaurantImage;
                notification.restaurantId = restaurantId;
                return notification;

            }));



            res.status(200).json({
                'status': true,
                'code': 200,
                'message': 'Get User Notifications.',
                'body': result
            });

        } catch (err) {
            console.log(err);
            responseHelper.onError(res, err);
            // throw err;
        }
    },

    deleteUserNotifications: async (req, res) => {
        try {
            const required = {
                security_key: req.headers.security_key,
                notificationId: req.body.notificationId,
            };
            const non_required = {};

            let requestdata = await helper.vaildObject(required, non_required, res);

            let getUser = await User.findOne({
                where: {
                    id: req.user.id
                }
            });
            if (!getUser) {
                throw 'Invalid value in the auth token.';
            }
            // console.log(getUser);

            let notificationExists = await Notifications.findOne({
                where: {
                    id: requestdata.notificationId,
                    receiverId: req.user.id,
                    receiverType: 1
                },
                // order: ['id', 'desc']
            });
            if (notificationExists == null) throw 'Invalid value in the parameter notificationId.';

            await Notifications.destroy(
                {
                    returning: true, where: { id: requestdata.notificationId }
                });


            // let notifications = await Notifications.findAll({
            //     where: {
            //         receiverId: req.user.id,
            //         receiverType: 1,
            //     },
            //     order: [
            //         ['id', 'DESC'],
            //     ]
            //     // order: ['id', 'desc']
            // });

            // let result = await Promise.all(notifications.map(async (notification) => {
            //     notification = notification.toJSON();
            //     let orderDetails = [];
            //     let restaurantImage = '';
            //     let restaurantName = '';
            //     let restaurantId = 0;
            //     let rideDetails = {};
            //     // console.log(notification);
            //     if (notification.orderId != 0) {
            //         let order = await Order.findOne({
            //             where: {
            //                 id: notification.orderId
            //             },
            //             include: [
            //                 {
            //                     model: OrderDetail,
            //                     required: false,
            //                 },
            //                 {
            //                     model: Restaurant,
            //                     required: false,
            //                 }
            //             ]
            //         });
            //         // console.log(order);

            //         if (order) {
            //             order = order.toJSON();
            //             // console.log(order);                      
            //             if (order.orderDetails) {
            //                 orderDetails = order.orderDetails;
            //             }
            //             if (order.restaurant) {
            //                 restaurantName = order.restaurant.name;
            //                 restaurantImage = order.restaurant.image;
            //                 restaurantId = order.restaurant.id;
            //             }
            //         }

            //     }

            //     if (notification.rideRequestId != 0) {
            //         let rideRequest = await RideRequest.findOne({
            //             where: {
            //                 id: notification.rideRequestId
            //             }
            //         });

            //         if (rideRequest) {
            //             rideDetails = rideRequest.toJSON();
            //         }
            //     }
            //     notification.rideDetails = rideDetails;
            //     notification.orderDetails = orderDetails;
            //     notification.restaurantName = restaurantName;
            //     notification.restaurantImage = restaurantImage;
            //     notification.restaurantId = restaurantId;
            //     return notification;

            // }));



            res.status(200).json({
                'status': true,
                'code': 200,
                'message': 'Notification deleted successfully.',
                'body': []
            });

        } catch (err) {
            console.log(err);
            responseHelper.onError(res, err);
            // throw err;
        }
    },

    deleteAllUserNotifications: async (req, res) => {
        try {
            const required = {
                security_key: req.headers.security_key,
            };
            const non_required = {};

            let requestdata = await helper.vaildObject(required, non_required, res);

            let getUser = await User.findOne({
                where: {
                    id: req.user.id
                }
            });
            if (!getUser) {
                throw 'Invalid value in the auth token.';
            }

            console.log(req.user.id);

            await Notifications.destroy(
                {
                    returning: true, where: {
                        receiver_id: req.user.id,
                        receiver_type: 1
                    }
                });

            let notifications = await Notifications.findAll({
                where: {
                    receiverId: req.user.id,
                    receiverType: 1,
                },
                order: [
                    ['id', 'DESC'],
                ]
                // order: ['id', 'desc']
            });

            let result = await Promise.all(notifications.map(async (notification) => {
                notification = notification.toJSON();
                let orderDetails = [];
                let restaurantImage = '';
                let restaurantName = '';
                let restaurantId = 0;
                let rideDetails = {};
                // console.log(notification);
                if (notification.orderId != 0) {
                    let order = await Order.findOne({
                        where: {
                            id: notification.orderId
                        },
                        include: [
                            {
                                model: OrderDetail,
                                required: false,
                            },
                            {
                                model: Restaurant,
                                required: false,
                            }
                        ]
                    });
                    // console.log(order);

                    if (order) {
                        order = order.toJSON();
                        // console.log(order);                      
                        if (order.orderDetails) {
                            orderDetails = order.orderDetails;
                        }
                        if (order.restaurant) {
                            restaurantName = order.restaurant.name;
                            restaurantImage = order.restaurant.image;
                            restaurantId = order.restaurant.id;
                        }
                    }

                }

                if (notification.rideRequestId != 0) {
                    let rideRequest = await RideRequest.findOne({
                        where: {
                            id: notification.rideRequestId
                        }
                    });

                    if (rideRequest) {
                        rideDetails = rideRequest.toJSON();
                    }
                }
                notification.rideDetails = rideDetails;
                notification.orderDetails = orderDetails;
                notification.restaurantImage = restaurantImage;
                notification.restaurantId = restaurantId;
                return notification;

            }));

            res.status(200).json({
                'status': true,
                'code': 200,
                'message': 'All notifications deleted successfully.',
                'body': result
            });

        } catch (err) {
            console.log(err);
            responseHelper.onError(res, err);
            // throw err;
        }
    },

    readNotification: async (req, res) => {
        try {
            const required = {
                security_key: req.headers.security_key,
                notificationId: req.body.notificationId,
            };
            const non_required = {};

            let requestdata = await helper.vaildObject(required, non_required, res);
            // console.log(req.user);

            let notification = await Notifications.findOne({
                where: {
                    id: requestdata.notificationId
                },
                order: [
                    ['id', 'DESC'],
                ]
                // order: ['id', 'desc']
            });

            if (!notification) {
                throw 'Invalid value in the parameter notificationId.';
            }

            await Notifications.update({
                isRead: 1,
            },
                {
                    returning: true, where: { id: requestdata.notificationId }
                });

            let updatedNotification = await Notifications.findOne({
                where: {
                    id: requestdata.notificationId
                },
                order: [
                    ['id', 'DESC'],
                ]
                // order: ['id', 'desc']
            });

            res.status(200).json({
                'status': true,
                'code': 200,
                'message': 'Notification read successfully  .',
                'body': updatedNotification
            });

        } catch (err) {
            console.log(err);
            responseHelper.onError(res, err);
            // throw err;
        }
    },

    checkUserInRange: async (req, res) => {
        try {
            const required = {
                security_key: req.headers.security_key,
                latitude: req.body.latitude,
                longitude: req.body.longitude,
            };
            const non_required = {};

            let requestdata = await helper.vaildObject(required, non_required, res);
            // console.log(req.user);

            let nassauLatitude = 25.05823;
            let nassauLongitude = -77.34306;

            let distance = helper.distance(requestdata.latitude, requestdata.longitude, nassauLatitude, nassauLongitude, 'M');

            res.status(200).json({
                'status': true,
                'code': 200,
                'message': 'Distance from Nassau.',
                'body': distance
            });

        } catch (err) {
            console.log(err);
            responseHelper.onError(res, err);
            // throw err;
        }
    },


    testbcrypt: async (req, res) => {
        try {
            const required = {
                security_key: req.headers.security_key,
                password: req.body.password,
            };
            const non_required = {};

            let requestdata = await helper.vaildObject(required, non_required, res);
            // console.log(req.user);

            hash = await helper.getBcryptHash(requestdata.password);

            res.status(200).json({
                'status': true,
                'code': 200,
                'message': 'Notification read successfully  .',
                'body': hash
            });

        } catch (err) {
            console.log(err);
            responseHelper.onError(res, err);
            // throw err;
        }
    },


    partnerLinks: async (req, res) => {
        try {
            const required = {
                security_key: req.headers.security_key,
            }
            const nonRequired = {

            };
            console.log(nonRequired, '======++>nonRequired');

            let requestData = await helperFunctions.vaildObject(required, nonRequired);

            const partnerLinks = await model.partner_links.findOne();

            res.status(200).json({
                'status': true,
                'code': 200,
                'message': 'Partner links fetched successfully  .',
                'body': partnerLinks
            });

        } catch (err) {
            console.log(err);
            return helper.error(res, err);
        }
    },

    walletHistory: async (req, res) => {
        
        try {
            const required = {
                security_key: req.headers.security_key,
            };
            const non_required = {};

            let requestdata = await helper.vaildObject(required, non_required, res);
            //console.log(req.user);
            // console.log(req.user.id,'sssssssssssssssssss'); return false;

            let wallet_history = await WalletPayments.findAll({
                where: {
                    userId: req.user.id
                },
                
            });
 
            var getSettings = await settings_model.findOne({
                attributes: [`id`, 'add_money', 'send_credit']
            })
            var obj = {
                wallet_history,
                settings: getSettings,
            }
            res.status(200).json({
                'status': true,
                'code': 200,
                'message': 'Get Wallet History.',
                'body': obj
            });

        } catch (err) {
            //console.log(req.user.id); return false;
             console.log(err);
            responseHelper.onError(res, err);
            // throw err;
        }
    },

    getUserDetail: async (req, res) => {
        try {
            const required = {
                security_key: req.headers.security_key,
                phone: req.headers.phone,
            };
            const non_required = {};

            let requestdata = await helper.vaildObject(required, non_required, res);
           /// console.log(req.user); return false;

            let getUser = await User.findOne({
                where: {
                    phone: requestdata.phone
                },
                attributes: [
                    'id', 'email', 'firstName', 'lastName', 'username', 'country_code', 'phone', 'country_code_phone', 'photo', 'wallet_amount' , 'created_at', 'updated_at'
                ],
            });

            if (!getUser) {
                throw "Invalid phone number.";
            };

            
            res.status(200).json({
                'status': true,
                'code': 200,
                'message': 'Get User Profile.',
                'body': getUser
            });

        } catch (err) {
            // console.log(err);
            responseHelper.onError(res, err);
            // throw err;
        }
    },

    sendWalletGift: async (req, res) => {
        try {
          const required = {
            security_key: req.headers.security_key,
            receiverId: req.body.receiverId,
            amount: req.body.amount,
            pin: req.body.pin,
          };
          const nonRequired = {};
          let requestData = await helper.vaildObject(required, nonRequired, res);
          
    
          let chkUser = await User.findOne({
            where: {
              id:requestData.receiverId,
            },
            // attributes: [
            //     'id', 'email', 'firstName', 'lastName', 'username', 'country_code', 'phone', 'country_code_phone', 'photo', 'wallet_amount' , 'created_at', 'updated_at'
            // ],
          });
          if(!chkUser){
            throw "Invalid value in the parameter receiverId.";
          }
//console.log(chkUser,'ffffffffffffffff');return false;
          if(req.user.walletPin != requestData.pin){
            throw "Incorrect pin.";
         }
    
          let getUser = await User.findOne({
            where: {
              id:req.user.id,
            },
            attributes: [
                'id', 'email', 'firstName', 'lastName', 'username', 'country_code', 'phone', 'country_code_phone', 'photo', 'wallet_amount' , 'created_at', 'updated_at'
            ],
          });
          //console.log(requestData.amount,'=>amount',getUser.dataValues.wallet_amount,'=>wallet_amount');return false;
          if(parseFloat(requestData.amount) > parseFloat(getUser.dataValues.wallet_amount)){
            throw "You don’t have sufficient balance to send credits, Please enter less amount.";
          }
          
    
          if(getUser.dataValues.wallet_amount){
             balance =  parseFloat(getUser.dataValues.wallet_amount) - parseFloat(requestData.amount);
          } 
          
          await User.update(
            {
              walletAmount:balance,
            },
            {
              where: {
                id: getUser.dataValues.id,
              },
            }
          );
          //console.log(balance); return false;
          if(chkUser.country_code_phone){
            country_code_phone = chkUser.country_code_phone;
         }else{
            country_code_phone = chkUser.phone;
         }
          const wallet_transactions = await WalletPayments.create(
            {
              userId: getUser.dataValues.id,
                amount: requestData.amount,
                closingBalance: balance,
                //transactionId:Math.random().toString(36).substring(7),
                transactionId:country_code_phone,
                transactionType:4,
                createdAt:new Date().toISOString()
            });
           // console.log(chkUser.walletAmount);return false;
          if(chkUser.walletAmount){
            wallet_balance =  parseFloat(chkUser.walletAmount) + parseFloat(requestData.amount);
         } 
         //console.log(wallet_balance);return false;
         await User.update(
           {
             walletAmount:wallet_balance,
           },
           {
             where: {
               id: chkUser.dataValues.id,
             },
           }
         );
         if(getUser.country_code_phone){
            country_code_phone = getUser.country_code_phone;
         }else{
            country_code_phone = getUser.phone;
         }
            const wallet_transactions2 = await WalletPayments.create(
              {
                userId: chkUser.dataValues.id,
                  amount: requestData.amount,
                  closingBalance: wallet_balance,
                  transactionId:country_code_phone,
                  senderId:getUser.dataValues.id,
                  transactionType:5,
                  createdAt:new Date().toISOString()
              });
//console.log(chkUser.deviceToken,'token');return false;
              
        let dataForPush = {};
        
        //const payloadData = { ...getRideRequest };
        if (chkUser.deviceToken != "") {
            dataForPush.type = {};
            dataForPush.receiverId = chkUser.id;
            dataForPush.rideData = {};
            dataForPush.deviceToken = chkUser.deviceToken;
            dataForPush.message = req.user.firstName + " sent you a wallet gift.";
            dataForPush.code = 12;
            helper.sendPushNotification(dataForPush);
          }

          let addNotificationObj = {};
            addNotificationObj["senderId"] = req.user.id;
            addNotificationObj["receiverId"] = chkUser.id;
            addNotificationObj["senderType"] = 1;
            addNotificationObj["receiverType"] = 1;
            addNotificationObj["orderId"] = 0;
            addNotificationObj["rideRequestId"] =  0;
            addNotificationObj["message"] = req.user.firstName + " Sent you a wallet gift.";
            addNotificationObj["code"] = 12;
        let addNotificationUser = await Notifications.create(
          addNotificationObj
        );
          return res.status(200).json({
            status: true,
            code: 200,
            message: "Gift sent successfully..",
            body: [],
          });
        } catch (err) {
          // console.log(err);
          return helper.error(res, err);
          // return responseHelper.onError(res, err)
        }
    },


    createPin: async (req, res) => {
        try {
          const required = {
            security_key: req.headers.security_key,
            pin: req.body.pin,
          };
          const nonRequired = {};
          let requestData = await helper.vaildObject(required, nonRequired, res);
         //console.log(req.user.id);return false;
          //console.log(req.user); return false;
         let upadtedata =  await User.update(
            {
              walletPin:requestData.pin,
            },
            {
              where: {
                id: req.user.id,
              },
            }
          );
          //console.log(balance); return false;
          let getUser = await User.findOne({
            where: {
              id:req.user.id,
            },
            attributes: [
                'id', 'email', 'firstName', 'lastName', 'username', 'country_code', 'phone', 'country_code_phone', 'photo', 'wallet_amount','wallet_pin' , 'created_at', 'updated_at'
            ],
          });
          return res.status(200).json({
            status: true,
            code: 200,
           
            message: "Wallet pin created successfully.",
            body: getUser,
            
          });
        } catch (err) {
          // console.log(err);
          return helper.error(res, err);
          // return responseHelper.onError(res, err)
        }
    },


    changePin: async (req, res) => {
        try {
          const required = {
            security_key: req.headers.security_key,
            oldPin: req.body.oldPin,
            newPin: req.body.newPin,
          };
          const nonRequired = {};
          let requestData = await helper.vaildObject(required, nonRequired, res);
         if(req.user.walletPin != requestData.oldPin){
            throw "Incorrect Old Pin.";
         }
          await User.update(
            {
              walletPin:requestData.newPin,
            },
            {
              where: {
                id: req.user.id,
              },
            }
          );
          //console.log(balance); return false;
          let getUser = await User.findOne({
            where: {
              id:req.user.id,
            },
            attributes: [
                'id', 'email', 'firstName', 'lastName', 'username', 'country_code', 'phone', 'country_code_phone', 'photo', 'wallet_amount','wallet_pin' , 'created_at', 'updated_at'
            ],
          });
          return res.status(200).json({
            status: true,
            code: 200,
            message: "Wallet pin changed successfully.",
            body: getUser,
          });
        } catch (err) {
          // console.log(err);
          return helper.error(res, err);
          // return responseHelper.onError(res, err)
        }
    },

    forgotPin: async (req, res) => {
        try {
            const required = {
                security_key: req.headers.security_key,
              };
            
            const non_required = {};
            let requestdata = await helper.vaildObject(required, non_required, res);
            // console.log(requestdata);
            // return false;

            if (requestdata != '') {
                for (let data in requestdata) {
                    if (requestdata[data] == undefined) {
                        delete requestdata[data];
                    } else {
                        if (typeof requestdata[data] == "string") {
                            requestdata[data] = requestdata[data].trim();
                        }
                    }
                }
                // console.log(requestdata);
                // return false;

                let getUser = await User.findOne({
                    where: {
                        id: req.user.id,
                    },
                    attributes: [
                        'id', 'email', 'username', 'createdAt', 'updatedAt','wallet_pin'
                    ]
                });

                if (!getUser) {
                    throw "Email could not be found.";
                }
                getUser = getUser.toJSON();

                let forgotPasswordHash = await helper.createSHA1();
                let pin = Math.floor(1000 + Math.random() * 9000);
                let updateForgotPasswordHash = await User.update({
                    //forgotPasswordHash: forgotPasswordHash
                    walletPin: pin
                },
                    {
                        returning: true, where: { id: getUser.id }
                    });

                if (!updateForgotPasswordHash[1]) {
                    throw "Something went wrong.";
                }
                // http://admin.bahamaeats.com/admin/reset_password/7386a84478cab4ac752530f8532d82424adcc9f6
                // let forgotPasswordUrl = "www.bahamaeats.com/" + forgotPasswordHash;
                //let forgotPasswordUrl = "http://admin.bahamaeats.com/admin/reset_password/" + forgotPasswordHash;
                
                let forgot_password_html = 'Hello ' + getUser.username + ',<br> Your Wallet Pin is:' + pin + ' <br><br><br> Regards,<br> BahamaEats';

                let mail = {
                    from: 'admin@BahamaEats.com',
                    to: getUser.email,
                    subject: 'BahamaEats | Forgot Wallet Pin',
                    html: forgot_password_html
                }


                helper.sendMail(mail);

                res.status(200).json({
                    'status': true,
                    'code': 200,
                    'message': 'Pin sent to email successfully.',
                    'body': getUser
                });
            }
        } catch (err) {
            console.log(err);
            return responseHelper.onError(res, err);
        }
    },

    getUserLastNotifications: async (req, res) => {
        try {
            const required = {
                security_key: req.headers.security_key,
            };
            const non_required = {};

            let requestdata = await helper.vaildObject(required, non_required, res);
            // console.log(req.user);

            let getUser = await User.findOne({
                where: {
                    id: req.user.id
                }
            });
            if (!getUser) {
                throw 'Invalid value in the auth token.';
            }
           // console.log(req.user.id,'sdsds');return false;

            let notifications = await Notifications.findAll({
                where: {
                    receiverId: req.user.id,
                    receiverType: 1,
                    isRated: 1
                },
                
                order: [
                    ['id', 'DESC'],
                ],
                limit:1,
                // order: ['id', 'desc']
            });
        // console.log(notifications,'sdsds');return false;
            let result = await Promise.all(notifications.map(async (notification) => {
            //console.log(notification.orderId,'qqqqqqqqqqqq'); return false;
                if(notification.orderId != 0){
                    //console.log(notification.orderId,'ggg'); return false;
                    let chk_order_status = await Order.findOne({
                        where: {
                            id: notification.orderId
                        },
                    });
                   
                    if(chk_order_status.status == 3){
                       // console.log(chk_order_status.status,'chk_order_status');return false;
                    
                        let chkorderrating = await OrderRating.findOne({
                            where: {
                                orderId: notification.orderId
                            }, 
                        });
                      // console.log(chkorderrating,'chk_order_status');return false;
                        if(chkorderrating == null){
                           // console.log(notification.orderId); return false;
                            notification = notification.toJSON();
                            let orderDetails = [];
                            let restaurantName = '';
                            let restaurantImage = '';
                            let restaurantId = 0;
                            let rideDetails = {};
                            // console.log(notification.orderId,';;;;');return false;
                            if (notification.orderId != 0) {
                            // console.log(notification.orderId); return false;
                                let order = await Order.findOne({
                                    where: {
                                        id: notification.orderId
                                    },

                                    include: [
                                        {
                                            model: OrderDetail,
                                            required: false,
                                        },
                                        {
                                            model: Restaurant,
                                            required: false,
                                        }
                                    ]
                                });
                             //console.log(order,'ddddd');return false;

                                if (order) {
                                    order = order.toJSON();
                                   //  console.log(order.restaurant,'ret');  return false;                    
                                    if (order.orderDetails) {
                                         //console.log('ddd'); 
                                        orderDetails = order.orderDetails;
                                    }
                                    if (order.restaurant) {
                                        restaurantName = order.restaurant.name;
                                        restaurantImage = order.restaurant.image;
                                        restaurantId = order.restaurant.id;
                                        isDelivery  = order.isDelivery;
                                        
                                    }
                                }

                            }

                            if (notification.rideRequestId != 0) {
                                let rideRequest = await RideRequest.findOne({
                                    where: {
                                        id: notification.rideRequestId
                                    },
                                    include: [
                                        {
                                            model: Drivers,
                                            required: false,
                                        },
                                        
                                    ]
                                });

                                if (rideRequest) {
                                    rideDetails = rideRequest.toJSON();
                                }
                            }
                            
                            
                            if(restaurantName == ''){
                                restaurantName = 'Bahamaeats';
                                restaurantImage = 'https://admin.bahamaeats.com/public/1024.png'; 
                            }
                            notification.rideDetails = rideDetails;
                            notification.orderDetails = orderDetails;
                            notification.restaurantName = restaurantName;
                            notification.restaurantImage = restaurantImage;
                            notification.restaurantId = restaurantId;
                            notification.isDelivery = isDelivery;
                            notification.notificationCode = 11;
                            return notification;
                        }
                    }
                }
            }));
           //console.log(result[0]);return false;
// if(result[0] == undefined){
//     //console.log('ggg');return false;
//     result = [];
// }

var filtered = result.filter(function (el) {
    return el != null;
  });




            res.status(200).json({
                'status': true,
                'code': 200,
                'message': 'Get User Notifications.',
                'body': filtered
            });

        } catch (err) {
            console.log(err);
            responseHelper.onError(res, err);
            // throw err;
        }
    },







}
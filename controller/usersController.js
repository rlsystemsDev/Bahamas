const model = require('../models');
const config = require('../config/config.js');
const helper = require('../config/helper');
const responseHelper = require('../helpers/responseHelper');
const User = model.users;
const UserAddress = model.addresses;
const Help = model.help;
const Notifications = model.notifications;
const Order = model.orders;
const Restaurant = model.restaurants;
const OrderDetail = model.orderDetails;
const RideRequest = model.rideRequests;
const WalletPayments = model.walletPayments;
var jwt = require('jsonwebtoken');
let secretKey = 'secret';

Order.belongsTo(Restaurant, { foreignKey: 'restaurantId' });
Order.hasMany(OrderDetail, { foreignKey: 'orderId' });

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
            
            requestdata.countryCode = requestdata.countryCode.replace(/[+_]/g,'');
            requestdata.countryCode = requestdata.countryCode.replace(/[(_]/g,'');
            requestdata.countryCode = requestdata.countryCode.replace(/[)_]/g,'');
            requestdata.countryCode = requestdata.countryCode.replace(/[-_]/g,'');

            requestdata.phone = requestdata.phone.replace(/[+_]/g,'');
            requestdata.phone = requestdata.phone.replace(/[(_]/g,'');
            requestdata.phone = requestdata.phone.replace(/[)_]/g,'');
            requestdata.phone = requestdata.phone.replace(/[-_]/g,'');

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

            const otpResponse = await client.messages.create(
            {
                to: `+${requestdata.countryCodePhone}`,
                from: '+13213961165',
                body: `Your OTP: ${OTP}`,
            });
            
            if (otpResponse.hasOwnProperty('status') && otpResponse.status == '400') {
                throw otpResponse.message;
            }

            let updateUserObj = {
                'otp': OTP
            };
            let up_user = await User.update(updateUserObj,
                {returning: true, where: {id: req.user.id}}
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
            
            requestdata.countryCode = requestdata.countryCode.replace(/[+_]/g,'');
            requestdata.countryCode = requestdata.countryCode.replace(/[(_]/g,'');
            requestdata.countryCode = requestdata.countryCode.replace(/[)_]/g,'');
            requestdata.countryCode = requestdata.countryCode.replace(/[-_]/g,'');

            requestdata.phone = requestdata.phone.replace(/[+_]/g,'');
            requestdata.phone = requestdata.phone.replace(/[(_]/g,'');
            requestdata.phone = requestdata.phone.replace(/[)_]/g,'');
            requestdata.phone = requestdata.phone.replace(/[-_]/g,'');

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
                {returning: true, where: {id: req.user.id}}
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
            // console.log(req.user);
            
            let getUser = await User.findOne({
                where: {
                    id: requestdata.user_id
                },
                attributes: [
                    'id', 'email', 'firstName', 'lastName', 'username', 'country_code', 'phone', 'country_code_phone', 'photo', 'wallet_amount' , 'created_at', 'updated_at'
                ],
            });
            
            if (!getUser) {
                throw "Invalid value in the parameter user_id.";
            };

            if (getUser.photo != '') {
                if (getUser.photo.trim().substring(0,4) !== 'http') {
                    getUser.photo = req.protocol + '://' + req.get('host') + '/images/users/' + getUser.photo;
                }
            }

            getUser.dataValues.joinedDate = getUser.dataValues.created_at;
            //getUser.dataValues.wallet_amount= '100';
            // console.log(getUser); return false;

            res.status(200).json({
                'status': true,
                'code': 200,
                'message': 'Get User Profile.',
                'body': getUser
            });
            
        } catch(err) {
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
            
        } catch(err) {
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
                    {returning: true, where: {id: req.user.id}
                });
            }


            if (requestdata.hasOwnProperty('paymentMethod') && requestdata.email != "") {            
                await User.update({
                    paymentMethod: requestdata.paymentMethod,
                    },
                    {returning: true, where: {id: req.user.id}
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
            
        } catch(err) {
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
                requestdata.countryCode = requestdata.countryCode.replace(/[+_]/g,'');
                requestdata.countryCode = requestdata.countryCode.replace(/[(_]/g,'');
                requestdata.countryCode = requestdata.countryCode.replace(/[)_]/g,'');
                requestdata.countryCode = requestdata.countryCode.replace(/[-_]/g,'');
            }
            
            if (requestdata.phone) {
                requestdata.phone = requestdata.phone.replace(/[+_]/g,'');
                requestdata.phone = requestdata.phone.replace(/[(_]/g,'');
                requestdata.phone = requestdata.phone.replace(/[)_]/g,'');
                requestdata.phone = requestdata.phone.replace(/[-_]/g,'');            
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
                {returning: true, where: {id: req.user.id}
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
                    {returning: true, where: {id: req.user.id}
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
                {returning: true, where: {id: req.user.id}
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
                    {returning: true, where: {id: req.user.id}
                });
                
            }

            let image = "";
            if (req.files && req.files.photo) {
                image = helper.fileUpload(req.files.photo, 'users');
                let up_user = await User.update({photo: image},
                {returning: true, where: {id: req.user.id}});
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
                if (updatedUser.photo.trim().substring(0,4) !== 'http') {
                    updatedUser.photo = req.protocol + '://' + req.get('host') + '/images/users/' + updatedUser.photo;
                }
            }

            res.status(200).json({
                'status': true,
                'code': 200,
                'message': 'Profile updated successfully.',
                'body': updatedUser
            });
            
        } catch(err) {
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
                {returning: true, where: {id: req.user.id}
            });

            res.status(200).json({
                'status': true,
                'code': 200,
                'message': 'Password changed successfully.',
                'body': updatedUser
            });
            
        } catch(err) {
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
            upObj = {...requestdata};
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
            
        } catch(err) {
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
            // console.log(getUser);

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
                'message': 'Get User Notifications.',
                'body': result
            });
            
        } catch(err) {
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
            if(notificationExists == null) throw 'Invalid value in the parameter notificationId.';

            await Notifications.destroy(
                {returning: true, where: {id: requestdata.notificationId}
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
                'message': 'Notification deleted successfully.',
                'body': result
            });
            
        } catch(err) {
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
                {returning: true, where: {
                    receiver_id: req.user.id,
                    receiver_type: 1
                }
            });     

            res.status(200).json({
                'status': true,
                'code': 200,
                'message': 'All notifications deleted successfully.',
                'body': []
            });
            
        } catch(err) {
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
                {returning: true, where: {id: requestdata.notificationId}
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
            
        } catch(err) {
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
            
        } catch(err) {
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
            
        } catch(err) {
            console.log(err);
            responseHelper.onError(res, err);
            // throw err;
        }
    },
    walletHistory: async (req, res) => {
        
        try {
            const required = {
                security_key: req.headers.security_key,
            };
            const non_required = {};

            let requestdata = await helper.vaildObject(required, non_required, res);
            console.log(req.user);
            // console.log(req.user.id,'sssssssssssssssssss'); return false;

            let wallet_history = await WalletPayments.findAll({
                where: {
                    userId: req.user.id
                },
                
            });
 //console.log(wallet_history); return false;
            // if (!wallet) {
            //     throw "Invalid value in the parameter user_id.";
            // };

            // if (getUser.photo != '') {
            //     if (getUser.photo.trim().substring(0,4) !== 'http') {
            //         getUser.photo = req.protocol + '://' + req.get('host') + '/images/users/' + getUser.photo;
            //     }
            // }

            res.status(200).json({
                'status': true,
                'code': 200,
                'message': 'Get Wallet History.',
                'body': wallet_history
            });

        } catch (err) {
            //console.log(req.user.id); return false;
             console.log(err);
            responseHelper.onError(res, err);
            // throw err;
        }
    },

    

    
}
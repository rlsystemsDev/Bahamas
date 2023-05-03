const model = require('../models');
const helper = require('../config/helper');
const config = require('../config/config.js');
const responseHelper = require('../helpers/responseHelper');
const sequelize = require('sequelize');
var jwt = require('jsonwebtoken');
let secretKey = 'secret';

const Driver = model.drivers;
const UserAddress = model.addresses;
const DriverLicense = model.driverLicense;
const ContactUs = model.contactuses;
const DriverUserAddress = model.driverAddresses;
const Notifications = model.notifications;
const Order = model.orders;
const Restaurant = model.restaurants;
const OrderDetail = model.orderDetails;
const driverRating = model.driverRatings;


Order.belongsTo(Restaurant, { foreignKey: 'restaurantId' });
Order.hasMany(OrderDetail, { foreignKey: 'orderId' });

module.exports = {
    sendDriverPhoneOTP: async (req, res) => {
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

            let countryCodePhoneExists = await Driver.findOne({
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
            let up_user = await Driver.update(updateUserObj,
                {returning: true, where: {id: req.user.id}}
            );

            let found_user = await Driver.findOne({
                where: { id: req.user.id },
                attributes: ['id', 'countryCode', 'contactNo', 'countryCodePhone', 'otp', 'created_at', 'updated_at']
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

    verifyDriverPhoneOTP: async (req, res) => {
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
                contactNo: requestdata.phone,
                countryCodePhone: requestdata.countryCodePhone,
            };
            let up_user = await Driver.update(updateUserObj,
                {returning: true, where: {id: req.user.id}}
            );

            let found_user = await Driver.findOne({
                where: { id: req.user.id },
                attributes: ['id', 'countryCode', 'contactNo', 'countryCodePhone', 'otp', 'created_at', 'updated_at']
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

    getDriverProfile: async (req, res) => {
        try {
            const required = {
                security_key: req.headers.security_key,
                user_id: req.headers.user_id,
            };
            const non_required = {};

            let requestdata = await helper.vaildObject(required, non_required, res);
            // console.log(req.user);
            
            let getUser = await Driver.findOne({
                where: {
                    id: requestdata.user_id
                },
                attributes: [
                    'id', 'email', 'firstName', 'lastName', 'username', 'image', 'country_code', 'contact_no', 'country_code_phone', 'latitude', 'longitude', 'address', 'created_at', 'updated_at'
                ],
            });
            
            if (!getUser) {
                throw "Invalid value in the parameter user_id.";
            };

            if (getUser.image != '') {
                if (getUser.image.trim().substring(0,4) !== 'http') {
                    getUser.image = req.protocol + '://' + req.get('host') + '/images/drivers/' + getUser.image;
                }
            }

            let getAddress = await DriverUserAddress.findOne({
                where: { userId: req.user.id },
                attributes: ['id', 'isDefault', 'user_id', 'countryCode', 'alternateMobileNumber', 'countryCodeAlternateMobileNumber', 'address', 'firstName', 'lastName', 'country', 'countryId', 'provience', 'provienceId', 'city', 'cityId', 'postal_code', 'created_at', [sequelize.fn('IFNULL', sequelize.col('updated_at'), ''), 'updated_at'],]
            });

            
            getUser.dataValues.driverAddress = {};
            console.log(getUser);

            if (getAddress) {
                getUser.dataValues.driverAddress = getAddress;
            }

            res.status(200).json({
                'status': true,
                'code': 200,
                'message': 'Get Driver Profile.',
                'body': getUser
            });
            
        } catch(err) {
            // console.log(err);
            responseHelper.onError(res, err);
            // throw err;
        }
    },
    editDriverProfile: async (req, res) => {
        try {
            const required = {
                security_key: req.headers.security_key,
            };
            const non_required = {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                username: req.body.username,
                countryCode: req.body.countryCode,
                phone: req.body.phone,
                address: req.body.address,
                latitude: req.body.latitude,
                longitude: req.body.longitude,
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

            let upDriverObj = {};

            // if (requestdata.hasOwnProperty('firstName') && requestdata.firstName != "") {
            //     upDriverObj['firstName'] = requestdata.firstName;
            // }
            // if (requestdata.hasOwnProperty('lastName') && requestdata.lastName != "") {
            //     upDriverObj['lastName'] = requestdata.lastName;
            // }
            // if (upDriverObj) {
            //     console.log(upDriverObj);
            //     // await Driver.update(upDriverObj,
            //     //     {returning: true, where: {id: req.user.id}
            //     // });
            // }


            if (requestdata.hasOwnProperty('username') && requestdata.username != "") {
                // let findUsernameAlreadyExists = await Driver.findOne({
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

                await Driver.update({
                        username: requestdata.username,
                    },
                    {returning: true, where: {id: req.user.id}
                });
            }

            // if (requestdata.hasOwnProperty('email') && requestdata.email != "") {
            //     let findEmailAlreadyExists = await User.findOne({
            //         where: {
            //             id: {
            //                 $ne: req.user.id
            //             },
            //             email: requestdata.email
            //         }
            //     });
            //     if (findEmailAlreadyExists) {
            //         throw "This email already exists, Kindly use another.";
            //     }

            //     await User.update({
            //         email: requestdata.email,
            //     },
            //     {returning: true, where: {id: req.user.id}
            // });
            // }
            // console.log(req.user.id);

            if (requestdata.hasOwnProperty('countryCode') && requestdata.hasOwnProperty('phone') && requestdata.countryCode != "" && requestdata.phone != "") {
                
                let countryCodePhone = requestdata.countryCode + requestdata.phone;

                let phoneAlreadyExists = await Driver.findOne({
                    where: {
                        id: {
                            $ne: req.user.id
                        },
                        countryCodePhone: countryCodePhone
                    }
                });
                if (phoneAlreadyExists) {
                    throw "This phone already exists, Kindly use another.";
                }

                await Driver.update({
                        countryCode: requestdata.countryCode,
                        contactNo: requestdata.phone,
                        countryCodePhone: countryCodePhone,
                    },
                    {returning: true, where: {id: req.user.id}
                });
            }


            // console.log(req.user.id);
            let upData = {...requestdata};
            delete upData['security_key'];
            delete upData['username'];
            // console.log(requestdata);
            // console.log(upData);

            let upObj = {};
            for (let i in upData) {
                if (upData[i] != '') {
                    upObj[i] = upData[i];
                }
            }
            // console.log(upObj);
            
            if (upObj && Object.keys(upObj).length) {
                await Driver.update(
                    upObj,
                    {returning: true, where: {id: req.user.id}
                });
            }

            let image = "";
            if (req.files && req.files.photo) {
                image = helper.fileUpload(req.files.photo, 'drivers');
                let up_user = await Driver.update({image: image},
                {returning: true, where: {id: req.user.id}});
            }

            let updatedUser = await Driver.findOne({
                where: {
                    id: req.user.id
                },
                attributes: [
                    'id', 'firstName', 'lastName', 'username', 'email', 'countryCode', 'contactNo', 'countryCodePhone', 'image', 'latitude', 'longitude', 'address', 'createdAt', 'updatedAt'
                ]
            });

            if (updatedUser.image != '') {
                if (updatedUser.image.trim().substring(0,4) !== 'http') {
                    updatedUser.image = req.protocol + '://' + req.get('host') + '/images/drivers/' + updatedUser.image;
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

    getLicense: async (req, res) => {
        try {
            const required = {
                security_key: req.headers.security_key,
            };
            const non_required = {
            };

            let requestdata = await helper.vaildObject(required, non_required, res);
            // console.log(requestdata); return false;        

            let responseData = {};

            let checkLicense = await DriverLicense.findOne({
                where: { driverId: req.user.id },
            });

            if (checkLicense) {

                if (checkLicense.frontPhoto != '') {
                    checkLicense.frontPhoto = req.protocol + '://' + req.get('host') + '/images/drivers/' + checkLicense.frontPhoto;
                }

                if (checkLicense.backPhoto != '') {
                    checkLicense.backPhoto = req.protocol + '://' + req.get('host') + '/images/drivers/' + checkLicense.backPhoto;
                }

                responseData = checkLicense;
            }

            return res.status(200).json({
                'status': true,
                'code': 200,
                'message': 'Get Driver License.',
                'body': responseData
            });

        } catch(err) {
            console.log(err);
            responseHelper.onError(res, err);
        }
    },

    addLicense: async (req, res) => {
        try {
            const required = {
                security_key: req.headers.security_key,
                licenseType: req.body.licenseType,
                licenseNo: req.body.licenseNo,
                dob: req.body.dob,
                issueDate: req.body.issueDate,
                expiryDate: req.body.expiryDate,
                nationality: req.body.nationality,
            };
            const non_required = {
            };

            let requestdata = await helper.vaildObject(required, non_required, res);
            
            // console.log(req.files);
            // return false;

            let upObj = {};
            upObj = {...requestdata};
            delete upObj['security_key'];
            upObj['driverId'] = req.user.id;
            
            let checkLicense = await DriverLicense.findOne({
                where: { driverId: req.user.id },
            });
            // console.log(checkLicense.id); return false;

            if (requestdata != '' && !checkLicense) {
                console.log('add');
                let insertLicense = await DriverLicense.create(upObj);

                let image = "";
                if (req.files && req.files.frontPhoto) {
                    image = helper.fileUpload(req.files.frontPhoto, 'drivers');
                    let up_user = await DriverLicense.update({frontPhoto: image},
                    {returning: true, where: {id: insertLicense.id}});
                }
                if (req.files && req.files.backPhoto) {
                    image = helper.fileUpload(req.files.backPhoto, 'drivers');
                    let up_user = await DriverLicense.update({backPhoto: image},
                    {returning: true, where: {id: insertLicense.id}});
                }

                let getLicense = await DriverLicense.findOne({
                    where: { id: insertLicense.id },
                    // attributes: [
                    // ]
                });

                if (getLicense.frontPhoto != '') {
                    getLicense.frontPhoto = req.protocol + '://' + req.get('host') + '/images/drivers/' + getLicense.frontPhoto;
                }

                if (getLicense.backPhoto != '') {
                    getLicense.backPhoto = req.protocol + '://' + req.get('host') + '/images/drivers/' + getLicense.backPhoto;
                }

                return res.status(200).json({
                    'status': true,
                    'code': 200,
                    'message': 'License added successfully',
                    'body': getLicense
                });
            } else {
                // console.log('here'); return false;
                // console.log(checkLicense.id); return false;

                let upddateLicense = await DriverLicense.update(upObj, {
                    returning: true, where: {id: checkLicense.id}
                });

                let image = "";
                if (req.files && req.files.frontPhoto) {
                    image = helper.fileUpload(req.files.frontPhoto, 'drivers');
                    let up_user = await DriverLicense.update({frontPhoto: image},
                    {returning: true, where: {id: checkLicense.id}});
                }
                if (req.files && req.files.backPhoto) {
                    image = helper.fileUpload(req.files.backPhoto, 'drivers');
                    let up_user = await DriverLicense.update({backPhoto: image},
                    {returning: true, where: {id: checkLicense.id}});
                }
                let getLicense = await DriverLicense.findOne({
                    where: { id: checkLicense.id },
                });

                if (getLicense.frontPhoto != '') {
                    getLicense.frontPhoto = req.protocol + '://' + req.get('host') + '/images/drivers/' + getLicense.frontPhoto;
                }

                if (getLicense.backPhoto != '') {
                    getLicense.backPhoto = req.protocol + '://' + req.get('host') + '/images/drivers/' + getLicense.backPhoto;
                }


                return res.status(200).json({
                    'status': true,
                    'code': 200,
                    'message': 'License Updated successfully',
                    'body': getLicense
                });
            } 
            
        } catch(err) {
            console.log(err);
            responseHelper.onError(res, err);
        }
    },

    updateLicense: async (req, res) => {
        try {
            const required = {
                security_key: req.headers.security_key,
                licenseId: req.body.licenseId,
            };
            const non_required = {
                licenseType: req.body.licenseType,
                licenseNo: req.body.licenseNo,
                dob: req.body.dob,
                issueDate: req.body.issueDate,
                expiryDate: req.body.expiryDate,
                nationality: req.body.nationality,
            };

            let requestdata = await helper.vaildObject(required, non_required, res);
            
            
            let upObj = {};
            upObj = {...requestdata};
            delete upObj['security_key'];
            // console.log(upObj);
            // return false;
            
            let checkLicense = await DriverLicense.findOne({
                where: { 
                    id: requestdata.licenseId,
                    driverId: req.user.id
                },
            });
            // console.log(checkLicense);
            // return false;

            if (requestdata != '' && checkLicense != null) {
                let upddateLicense = await DriverLicense.update(upObj, {
                    returning: true, where: {id: requestdata.licenseId}
                });

                let image = "";
                if (req.files && req.files.frontPhoto) {
                    image = helper.fileUpload(req.files.frontPhoto, 'drivers');
                    let up_user = await DriverLicense.update({frontPhoto: image},
                    {returning: true, where: {id: requestdata.licenseId}});
                }
                if (req.files && req.files.backPhoto) {
                    image = helper.fileUpload(req.files.backPhoto, 'drivers');
                    let up_user = await DriverLicense.update({backPhoto: image},
                    {returning: true, where: {id: requestdata.licenseId}});
                }

                let getLicense = await DriverLicense.findOne({
                    where: { id: requestdata.licenseId },
                });

                if (getLicense.frontPhoto != '') {
                    getLicense.frontPhoto = req.protocol + '://' + req.get('host') + '/images/drivers/' + getLicense.frontPhoto;
                }

                if (getLicense.backPhoto != '') {
                    getLicense.backPhoto = req.protocol + '://' + req.get('host') + '/images/drivers/' + getLicense.backPhoto;
                }

                return res.status(200).json({
                    'status': true,
                    'code': 200,
                    'message': 'License updated successfully',
                    'body': getLicense
                });
            } else {
                throw "Invalid value in the parameter License ID.";
            }
            
        } catch(err) {
            console.log(err);
            responseHelper.onError(res, err);
        }
    },

    deleteLicenceImage: async (req, res) => {
        try {
            const required = {
                security_key: req.headers.security_key,
                licenseId: req.body.licenseId,
            };
            const non_required = {
            };

            let requestdata = await helper.vaildObject(required, non_required, res);
            
            // console.log(req.files);
            // return false;

            let upObj = {};
            upObj = {...requestdata};
            delete upObj['security_key'];
            // upObj['driverId'] = req.user.id;
            upObj['frontPhoto'] = '';
            upObj['backPhoto'] = '';
            
            let checkLicense = await DriverLicense.findOne({
                where: { 
                    id: req.body.licenseId,                    
                    driverId: req.user.id,
                },
            });
            // console.log(checkLicense); return false;

            if (requestdata != '' && checkLicense != 'null') {
                let insertLicense = await DriverLicense.update(upObj, {
                    returning: true, where: {id: req.body.licenseId}
                });

                let getLicense = await DriverLicense.findOne({
                    where: { id: req.body.licenseId },
                });

                if (getLicense.frontPhoto != '') {
                    getLicense.frontPhoto = req.protocol + '://' + req.get('host') + '/images/drivers/' + getLicense.frontPhoto;
                }

                if (getLicense.backPhoto != '') {
                    getLicense.backPhoto = req.protocol + '://' + req.get('host') + '/images/drivers/' + getLicense.backPhoto;
                }

                return res.status(200).json({
                    'status': true,
                    'code': 200,
                    'message': 'License Image Deleted Successfully',
                    'body': getLicense
                });
            } else {
                return res.status(200).json({
                    'status': true,
                    'code': 403,
                    'message': 'You have not uploaded license.',
                    'body': {}
                });
            }
            
        } catch(err) {
            console.log(err);
            responseHelper.onError(res, err);
            // throw err;
        }
    },

    getDriverTakeOrderStatus: async (req, res) => {
        try {
            const required = {
                security_key: req.headers.security_key,
                // takeOrderStatus: req.body.takeOrderStatus,    // 0=> Wont take order, 1=> Will take order
            };
            const non_required = {
            };

            let requestdata = await helper.vaildObject(required, non_required, res);
   
        
            // console.log(req.user.id);
            // return false;
            
            if (requestdata != '') {
              
                let getDriver = await Driver.findOne({
                    where: { id: req.user.id },
                    attributes: [
                        'id', 'username', 'email', 'takeOrderStatus'
                    ]
                });

                return res.status(200).json({
                    'status': true,
                    'code': 200,
                    'message': 'Driver take order status',
                    'body': getDriver
                });
            } else {
                throw "Something went wrong.";
            }
            
        } catch(err) {
            console.log(err);
            responseHelper.onError(res, err);
        }
    },

    updateDriverTakeOrderStatus: async (req, res) => {
        try {
            const required = {
                security_key: req.headers.security_key,
                takeOrderStatus: req.body.takeOrderStatus,    // 0=> Wont take order, 1=> Will take order
            };
            const non_required = {
            };

            let requestdata = await helper.vaildObject(required, non_required, res);
            
            if (requestdata.takeOrderStatus != 0 && requestdata.takeOrderStatus != 1) {
                throw "Invalid value in the parameter takeOrderStatus.";
            }
            
            let upObj = {};
            upObj = {...requestdata};
            delete upObj['security_key'];
            // console.log(req.user.id);
            // return false;
            
            if (upObj.takeOrderStatus == 0) {
                upObj.status = 2;
            } else {
                upObj.status = 1;
            }
            // console.log(upObj); return false;

            if (requestdata != '') {
                let upddateLicense = await Driver.update(upObj, {
                    returning: true, where: {id: req.user.id}
                });

             
                let getDriver = await Driver.findOne({
                    where: { id: req.user.id },
                    attributes: [
                        'id', 'username', 'email', 'takeOrderStatus'
                    ]
                });

                return res.status(200).json({
                    'status': true,
                    'code': 200,
                    'message': 'Driver take order status updated successfully',
                    'body': getDriver
                });
            } else {
                throw "Driver take order status could not be updated.";
            }
            
        } catch(err) {
            console.log(err);
            responseHelper.onError(res, err);
        }
    },

    updateDriverLatLng: async (req, res) => {
        try {
            const required = {
                security_key: req.headers.security_key,
                latitude: req.body.latitude,
                longitude: req.body.longitude,
            };
            const non_required = {
            };

            let requestdata = await helper.vaildObject(required, non_required, res);        
            
            let upObj = {};
            upObj = {...requestdata};
            delete upObj['security_key'];
            // console.log(req.user.id);
            // return false;
            
            if (requestdata != '') {
                let upddateLicense = await Driver.update(upObj, {
                    returning: true, where: {id: req.user.id}
                });

             
                let getDriver = await Driver.findOne({
                    where: { id: req.user.id },
                    attributes: [
                        'id', 'username', 'email', 'latitude', 'longitude'
                    ]
                });

                return res.status(200).json({
                    'status': true,
                    'code': 200,
                    'message': 'Driver lat lng updated successfully',
                    'body': getDriver
                });
            } else {
                throw "Driver lat lng could not be updated.";
            }
            
        } catch(err) {
            console.log(err);
            responseHelper.onError(res, err);
        }
    },

    contactUs: async (req, res) => {
        try {
            const required = {
                security_key: req.headers.security_key,
                name: req.body.name,
                email: req.body.email,
                phone: req.body.phone,
                message: req.body.message,
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
                let addContactUs = await ContactUs.create(upObj);


                let getContactUs = await ContactUs.findOne({
                    where: { id: addContactUs.id },
                });


                return res.status(200).json({
                    'status': true,
                    'code': 200,
                    'message': 'contact us added successfully',
                    'body': getContactUs
                });
            } else {
                throw "contact us could not be created.";
            }
            
        } catch(err) {
            console.log(err);
            responseHelper.onError(res, err);
        }
    },

    getDriverNotifications: async (req, res) => {
        try {
            const required = {
                security_key: req.headers.security_key,
            };
            const non_required = {};

            let requestdata = await helper.vaildObject(required, non_required, res);
            // console.log(req.user);
            
            let getUser = await Driver.findOne({
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
                    receiverType: 2
                },
                // order: ['id', 'desc']
                order: [
                    ['id', 'DESC'],
                ]
            });
            
            let result = await Promise.all(notifications.map(async (notification) => {
                notification = notification.toJSON();
                let orderDetails = [];
                let restaurantImage = '';
                let restaurantId = '';
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
                notification.orderDetails = orderDetails;
                notification.restaurantImage = restaurantImage;
                notification.restaurantId = restaurantId;
                return notification;
                
            }));

        

            res.status(200).json({
                'status': true,
                'code': 200,
                'message': 'Get Driver Notifications.',
                'body': result
            });
            
        } catch(err) {
            console.log(err);
            responseHelper.onError(res, err);
            // throw err;
        }
    },
    deleteDriverNotifications: async (req, res) => {
        try {
            const required = {
                security_key: req.headers.security_key,
                notificationId: req.body.notificationId,
            };
            const non_required = {};

            let requestdata = await helper.vaildObject(required, non_required, res);
            // console.log(req.user);
            
            let getUser = await Driver.findOne({
                where: {
                    id: req.user.id
                }
            });
            if (!getUser) {
                throw 'Invalid value in the auth token.';
            }
            
            let notificationExists = await Notifications.findOne({
                where: {
                    id: requestdata.notificationId,
                    receiverId: req.user.id,
                    receiverType: 2
                },
                // order: ['id', 'desc']
            });
            // console.log(notificationExists);
            if(notificationExists == null) throw 'Invalid value in the parameter notificationId.';

            await Notifications.destroy(
                {returning: true, where: {id: requestdata.notificationId}
            });

            let notifications = await Notifications.findAll({
                where: {
                    receiverId: req.user.id,
                    receiverType: 2
                },
                // order: ['id', 'desc']
                order: [
                    ['id', 'DESC'],
                ]
            });
            
            let result = await Promise.all(notifications.map(async (notification) => {
                notification = notification.toJSON();
                let orderDetails = [];
                let restaurantImage = '';
                let restaurantId = '';
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
                notification.orderDetails = orderDetails;
                notification.restaurantImage = restaurantImage;
                notification.restaurantId = restaurantId;
                return notification;
                
            }));

        

            res.status(200).json({
                'status': true,
                'code': 200,
                'message': 'Driver notification deleted successfully.',
                'body': result
            });
            
        } catch(err) {
            console.log(err);
            responseHelper.onError(res, err);
            // throw err;
        }
    },

    addDriverRating: async (req, res) => {
        try {
            const required = {
                security_key: req.headers.security_key,
                driverId: req.body.driverId,
                orderId: req.body.orderId,
                rating: req.body.rating,
                comment: req.body.comment,
            };
            const non_required = {
            };

            let requestdata = await helper.vaildObject(required, non_required, res);                        
            // console.log(req.files);
            // return false;
            // console.log(req.user); return false;

            let orderExists = await Order.findOne({
                where: { 
                    id: requestdata.orderId,                    
                    userId: req.user.id,
                },
            });
            if (!orderExists) throw 'Invalid value in the parameter orderId.';

            let ratingExists = await driverRating.findOne({
                where: { 
                    userId: req.user.id,
                    orderId: requestdata.orderId,                    
                },
            });
            if (ratingExists) throw 'You have already rated the driver on this order.';

            if (requestdata != '') {
                let insertObj = {
                    userId: req.user.id,
                    driverId: requestdata.driverId,
                    orderId: requestdata.orderId,
                    rating: requestdata.rating,
                    comment: requestdata.comment,
                }
                
                
                let insertRating = await driverRating.create(insertObj);

                let getRating = await driverRating.findOne({
                    where: { id: insertRating.id },
                });
                // console.log(getAddress); return false;
                
                return res.status(200).json({
                    'status': true,
                    'code': 200,
                    'message': 'Driver rating added successfully',
                    'body': getRating
                });
            } else {

                return res.status(200).json({
                    'status': true,
                    'code': 200,
                    'message': 'Something went wrong.',
                    'body': []
                });
            } 
            
        } catch(err) {
            console.log(err);
            responseHelper.onError(res, err);
        }
    },
}
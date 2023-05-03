const model = require('../../models');
const config = require('../../config/config.js');
const helper = require('../../config/helper');
const responseHelper = require('../../helpers/responseHelper');
const users = model.users;
const drivers = model.drivers;
const DriverLicense = model.driverLicense;
var jwt = require('jsonwebtoken');
let secretKey = 'secret';
const sequelize = require('sequelize');
module.exports = {

    getOTP: async (req, res) => {
        try {
            const required = {
                countryCode: req.body.countryCode,
                phone: req.body.phone,
                security_key: req.headers.security_key,
            };
            const non_required = {};

            let requestdata = await helper.vaildObject(required, non_required, res);

            requestdata.countryCodePhone = requestdata.countryCode + requestdata.phone;


            let countryCodePhoneExists = await drivers.findOne({
                where: { countryCodePhone: requestdata.countryCodePhone },
            });

            // if (countryCodePhoneExists) {
            //     throw "This phone number has already been used. Kindly user another";
            // }

            let isDriverRegistered = await drivers.findOne({
                where: { 
                    countryCodePhone: requestdata.countryCodePhone,
                    email: {
                        $ne: ''
                    },
                },
                attributes: ['id', 'email', 'username', 'deviceType', 'deviceToken', 'created_at', 'updated_at']
            });

            // if (countryCodePhoneExists) {
            //     return res.status(200).json({
            //         // 'status': true,
            //         'code': 200,
            //         'message': 'This phone number has already been used. Kindly user another.',
            //         'body': {
            //             isDriverRegistered: (isDriverRegistered) ? 1 : 0 
            //         }
            //     });
            // }

            const client = require('twilio')(config.twilio.accountSid, config.twilio.authToken);

            var OTP = Math.floor(1000 + Math.random() * 9000);

            const otpResponse = await client.messages.create(
            {
                to: `+${requestdata.countryCodePhone}`,
                from: '+13213961165',
                body: `Your OTP: ${OTP}`,
            }
            );
            // console.log(otpResponse);
            if (otpResponse.hasOwnProperty('status') && otpResponse.status == '400') {
                throw otpResponse.message;
            }
            // console.log(OTP);

            let user_id = 0;

            if (countryCodePhoneExists) {
                countryCodePhoneExists = countryCodePhoneExists.toJSON();
                user_id = countryCodePhoneExists.id;

                let updateUserObj = {
                    'otp': OTP
                };
    
                let up_user = await drivers.update(updateUserObj,
                    {returning: true, where: {id: user_id}}
                );
                
            } else { 

                let create_user = await drivers.create({
                    countryCode: requestdata.countryCode,
                    contactNo: requestdata.phone,
                    countryCodePhone: requestdata.countryCodePhone,
                    otp: OTP
                });
                // console.log(create_user.toJSON());
                let created_user = create_user.toJSON();
                
                user_id = created_user.id;
            }

            let found_user = await drivers.findOne({
                where: { id: user_id },
                attributes: ['id', 'countryCode', 'contactNo', 'countryCodePhone', 'otp', 'created_at', [sequelize.fn('IFNULL', sequelize.col('updated_at'), ''), 'updated_at']]
            });
            // console.log(found_user); return false;
            res.status(200).json({
                'status': true,
                'code': 200,
                'message': 'OTP sent successfully.',
                'body': found_user
            });

        } catch (err) {
            // throw err;
            // console.log(err);
            // return responseHelper.onError(res, err);
            return helper.error400(res, err);
        }
    },

    resendDriverOTP: async (req, res) => {
        try {
            const required = {
                countryCode: req.body.countryCode,
                phone: req.body.phone,
            };
            const non_required = {};

            let requestdata = await helper.vaildObject(required, non_required, res);
            // console.log(requestdata);
            requestdata.countryCode = requestdata.countryCode.replace(/[+_]/g,'');
            requestdata.countryCode = requestdata.countryCode.replace(/[(_]/g,'');
            requestdata.countryCode = requestdata.countryCode.replace(/[)_]/g,'');
            requestdata.countryCode = requestdata.countryCode.replace(/[-_]/g,'');

            requestdata.phone = requestdata.phone.replace(/[+_]/g,'');
            requestdata.phone = requestdata.phone.replace(/[(_]/g,'');
            requestdata.phone = requestdata.phone.replace(/[)_]/g,'');
            requestdata.phone = requestdata.phone.replace(/[-_]/g,'');

            requestdata.countryCodePhone = requestdata.countryCode + requestdata.phone;
            // console.log(config);

            let countryCodePhoneExists = await drivers.findOne({
                where: { countryCodePhone: requestdata.countryCodePhone },
                attributes: ['id', 'email', 'username', 'contactNo', 'deviceType', 'deviceToken', 'created_at', 'updated_at']
            });

            if (!countryCodePhoneExists) {
                throw 'Invalid number.';
            }

            const client = require('twilio')(config.twilio.accountSid, config.twilio.authToken);

            var OTP = Math.floor(1000 + Math.random() * 9000);

            const otpResponse = await client.messages.create(
            {   
                to: `+${requestdata.countryCodePhone}`,
                from: '+13213961165',
                body: `Your OTP: ${OTP}`,
            }
            );
            console.log(otpResponse);
            if (otpResponse.hasOwnProperty('status') && otpResponse.status == '400') {
                throw otpResponse.message;
            }

            let updateUserObj = {
                'otp': OTP
            };

            let up_user = await drivers.update(updateUserObj,
                {returning: true, where: {id: countryCodePhoneExists.toJSON().id}});
            
            let found_user = await drivers.findOne({
                where: { id: countryCodePhoneExists.id },
                attributes: ['id', 'countryCode', 'contactNo', 'countryCodePhone', 'otp', 'created_at', 'updated_at']
            });

            return res.status(200).json({
                'status': true,
                'code': 200,
                'message': 'OTP resent successfully .',
                'body': found_user
            });
            
        } catch (e) {
            console.log(e);
            return helper.error(res, e);
        }
    },

    verifyDriverOTP: async (req, res) => {
        try {
            const required = {
                countryCode: req.body.countryCode,
                phone: req.body.phone,
                otp: req.body.otp,
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
            // console.log(config);

            let countryCodePhoneExists = await drivers.findOne({
                where: { countryCodePhone: requestdata.countryCodePhone },
                attributes: ['id', 'email', 'username', 'contactNo', 'deviceType', 'deviceToken', 'otp', 'created_at', 'updated_at']
            });

            if (!countryCodePhoneExists) {
                throw 'Invalid number.';
            }

            countryCodePhoneExists = countryCodePhoneExists.toJSON();
            
            if (countryCodePhoneExists.otp != requestdata.otp) {
                throw "OTP did not match.";
            }
            // console.log(countryCodePhoneExists); return false;

            let updateUserObj = {
                'otpVerified': 1
            };

            let up_user = await drivers.update(updateUserObj,
                {returning: true, where: {id: countryCodePhoneExists.id}});
            
            let found_user = await drivers.findOne({
                where: { id: countryCodePhoneExists.id },
                attributes: ['id', 'countryCode', 'contactNo', 'countryCodePhone', 'otp', 'otpVerified', 'created_at', 'updated_at']
            });

            return res.status(200).json({
                'status': true,
                'code': 200,
                'message': 'OTP Verified Successfully.',
                'body': found_user
            });

        } catch(err) {
            console.log(err);
            return helper.error(res, err);
        }
    },


    signUp: async (req, res) => {
        try {
            const required = {
                security_key: req.headers.security_key,
                fullName: req.body.fullName,
                // firstName: req.body.firstName,
                // lastName: req.body.lastName,
                // username: req.body.username,
                email: req.body.email,
                phone: req.body.phone,
                password: req.body.password,
                loginType: req.body.loginType,
                city: req.body.city,
                country: req.body.country,
                isNotification: 1,
            };
            const nonRequired = {
                deviceType: req.body.deviceType,
                deviceToken: req.body.deviceToken,
            };
            if (required.loginType == 1) {
                required['socialId'] = req.body.socialId;
                required['socialType'] = req.body.socialType;   // 1=>fb 1=>insta 2=>twitter
            }

            let requestdata = await helper.vaildObject(required, nonRequired, res);
            // console.log(requestdata);
            // return false;

            requestdata.password = await helper.getBcryptHash(requestdata.password);

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
                var date = new Date();
                let newdate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();

                let user_exists = await drivers.findOne({
                    where: { 
                        countryCodePhone: requestdata.phone,
                        // loginType: requestdata.loginType
                    },
                    /* attributes: ['id', 'email', 'username', 'countryCode', 'phone', 'countryCodePhone', 'deviceType', 'deviceToken', 'created_at', 'updated_at'] */
                });
                // console.log(user_exists);
                // return false;

                if (!user_exists) {
                    res.status(200).json({
                        'status': false,
                        'code': 200,
                        'message': 'Invalid value in the parameter phone.',
                        'body': {
                            isPhoneExist: 0,
                            user: {}
                        }
                    });
                    return false;
                }

                let findEmailAlreadyExists = await drivers.findOne({
                    where: {
                        id: {
                            $ne: user_exists.id
                        },
                        email: requestdata.email,
                        // loginType: requestdata.loginType
                    }
                });
                // console.log(findEmailAlreadyExists);
                // return false;


                if (findEmailAlreadyExists) {
                    let resData = {
                        isPhoneExist: 1,
                        isEmailAlreadyExist: 1,
                        user: {}

                    }
                    return responseHelper.post(res, resData, "This email already exists, Kindly use another.");
                }

                let updateUserObj = {
                    'registerDate': newdate,
                    'fullName': requestdata.fullName,
                    // 'firstName': requestdata.firstName,
                    // 'lastName': requestdata.lastName,
                    // 'username': requestdata.username,
                    'email': requestdata.email,
                    'password': requestdata.password,
                    // 'countryCodePhone': requestdata.phone,
                    'socialid': requestdata.socialid,
                    'loginType': requestdata.loginType,
                    'city': requestdata.city,
                    'country': requestdata.country,
                    'isNotification': 1,
                    'deviceToken': (requestdata.deviceToken && requestdata.deviceToken != 'undefined') ? requestdata.deviceToken : '',
                    'deviceType': (requestdata.deviceType && requestdata.deviceType != 'undefined') ? requestdata.deviceType : 0,
                }

                if (requestdata.loginType == 1) {
                    updateUserObj['socialId'] = requestdata.socialId;
                    updateUserObj['socialType'] = requestdata.socialType;
                };
                // user_exists.datavalues.id = 367;
                let add_user = await drivers.update(updateUserObj,
                    { returning: true, where: { id: user_exists.toJSON().id } });

                // Uploading photo in the /public/images/users folder
                let image = "";
                // console.log(req.files.photo); return false;
                if (req.files && req.files.photo) {
                    image = helper.fileUpload(req.files.photo, 'drivers');
                    // console.log(image);
                    let up_user = await drivers.update({image: image},
                    {returning: true, where: {id: user_exists.toJSON().id}});

                    // console.log(up_user);
                }

                // console.log(add_user); return false;
                found_user = await drivers.findOne({
                    where: { countryCodePhone: requestdata.phone },
                    attributes: ['id', 'email', 'fullName', 'firstName', 'lastName', 'username', 'countryCode', 'contactNo', 'countryCodePhone', 'loginType', 'image', 'socialId', 'socialType', 'city', 'country', 'deviceType', 'deviceToken', 'createdAt', [sequelize.fn('IFNULL', sequelize.col('updated_at'), ''), 'updated_at']]
                });

                if (found_user.image != '') {
                    if (found_user.image.trim().substring(0,4) !== 'http') {
                        found_user.image = req.protocol + '://' + req.get('host') + '/images/drivers/' + found_user.image;
                    }
                }

                let user_data = {
                    id: found_user.id,
                    email: found_user.email,
                    // username: getUser.username,
                }
                // var token = jwt.sign({
                //     data: user_data
                // }, secretKey, { expiresIn: '1h' });
                var token = jwt.sign({
                    data: user_data
                }, secretKey);


                found_user = found_user.toJSON();
                delete found_user.password;

                let checkLicense = await DriverLicense.findOne({
                    where: { driverId: found_user.id },
                });

                if (checkLicense) {
                    found_user.isLicenceExists = 1;    
                } else {
                    found_user.isLicenceExists = 0;
                }

                found_user.token = token;
                

                // console.log(found_user); return false;
                return res.status(200).json({
                    'status': true,
                    'code': 200,
                    'message': 'Registration Successfull',
                    'body': {
                        isPhoneExist: 1,
                        isEmailAlreadyExist: 0,
                        user: found_user
                    }
                });
                /* let user_data = {
          console.log('here');          username: requestdata.username,
                    email: requestdata.email
                }
                var token = jwt.sign(user_data, cert, { algorithm: 'RS256', expiresIn: '1h' });
                console.log(token); return false; */
            }
        } catch (err) {
            console.log(err);
            return responseHelper.onError(res, err);
        }
    },

    login: async (req, res) => {
        try {
            const required = {
                security_key: req.headers.security_key,
                email: req.body.email,
                password: req.body.password,
            };
            const non_required = {
                deviceType: req.body.deviceType,
                deviceToken: req.body.deviceToken,
            };

            let requestdata = await helper.vaildObject(required, non_required, res);


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

                var date = new Date();
                let newdate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();

                let getUser = await drivers.findOne({
                    where: {
                        email: requestdata.email,
                    },
                    /* attributes: ['id', 'email', 'password', 'username', 'countryCode', 'phone', 'photo', 'countryCodePhone', 'deviceType', 'deviceToken', 'createdAt', 'updatedAt'] */
                });

                // return false;
                if (!getUser) {
                    throw "Incorrect Email or Password.";
                }

                check_password = await helper.comparePass(requestdata.password, getUser.toJSON().password);
				
				if (getUser.toJSON().wrongAttemptBlock==1) {
                    throw "Your account has been blocked, Please reset your password or contact to admin.";
                }
				
                
				if (!check_password) {
                    if(getUser.toJSON().wrongAttemptCount > 1) {
                        await helper.driversBlockattemp(getUser.toJSON().id);
                       throw "Your account has been blocked, Please reset your password or contact to admin."; 
                    } else {
                        await helper.driversaddattempedcount(getUser.toJSON().id,getUser.toJSON().wrongAttemptCount);
                        var pendingcount =2-parseInt(getUser.toJSON().wrongAttemptCount)
                        throw "Email or Password didn’t match, "+pendingcount+" more attempts left.";
                    }
                    
                }
				
                // return false;
                // console.log(getUser.toJSON()); return false;
                getUser = getUser.toJSON();
				
                delete getUser.password;

                let checkLicense = await DriverLicense.findOne({
                    where: { driverId: getUser.id },
                    raw: true
                });

                if (getUser.status == 0 && checkLicense && checkLicense.frontPhoto != '' && checkLicense.backPhoto != '') {
                    throw "You have been set as inactive user by the admin.";
                }
				await helper.driversclearAttempedcount(getUser.id);
                // console.log(getUser);

                // console.log(requestdata.deviceType);
                // console.log(requestdata.deviceToken);

                let updateUser = await drivers.update({
                    'deviceType': requestdata.deviceType ? requestdata.deviceType : 0,
                    'deviceToken': requestdata.deviceToken ? requestdata.deviceToken : '',
                    // 'status': 1
                },
                    { returning: true, where: { id: getUser.id } });

                // console.log(updateUser);

                let updatedUser = await drivers.findOne({
                    where: {
                        email: requestdata.email,
                    },
                    /* attributes: ['id', 'email', 'password', 'username', 'countryCode', 'phone', 'photo', 'countryCodePhone', 'deviceType', 'deviceToken', 'createdAt', 'updatedAt'] */
                });
                updatedUser = updatedUser.toJSON();
                delete updatedUser.password;


                let user_data = {
                    id: updatedUser.id,
                    email: updatedUser.email,
                    // username: getUser.username,
                }
                // var token = jwt.sign({
                //     data: user_data
                // }, secretKey, { expiresIn: '1h' });
                var token = jwt.sign({
                    data: user_data
                }, secretKey);

                if (checkLicense) {
                    updatedUser.isLicenceExists = 1;    
                } else {
                    updatedUser.isLicenceExists = 0;
                }

                updatedUser.token = token;
                // var decoded = jwt.verify(token, 'secret');
                // console.log(decoded)

                res.status(200).json({
                    'status': true,
                    'code': 200,
                    'message': 'Driver logged in successfully.',
                    'body': updatedUser
                });
            }
        } catch (err) {
            console.log(err);
            return responseHelper.onError(res, err);
        }
    },

    driverLogout: async (req, res) => {        
        try {
            // console.log(req.user);

            await drivers.update({
                    deviceType: 0,
                    deviceToken: '',
                    status: 2
                },
                {returning: true, where: {id: req.user.id}
            });

            res.status(200).json({
                'status': true,
                'code': 200,
                'message': 'Driver logged out successfully.',
                'body': {}
            });
        
        } catch (err) {
            console.log(err);
            return responseHelper.onError(res, err);
        }
    },

    socialLogin: async (req, res) => {
        try {
            const required = {
                socialType: req.body.socialType, // 1=>fb, 2=>Instagram, 3=>Twitter
                socialId: req.body.socialId,
            };
            const non_required = {
                deviceType: req.body.deviceType,
                deviceToken: req.body.deviceToken,
            };

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
                var date = new Date();
                let newdate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();

                let getUser = await drivers.findOne({
                    where: {
                        socialId: requestdata.socialId,
                        socialType: requestdata.socialType,
                    },
                    attributes: ['id', 'email', 'password', 'fullName', 'username', 'countryCode', 'countryCodePhone', 'socialId', 'socialType', 'deviceType', 'deviceToken', 'createdAt', 'updatedAt']
                });
                if (!getUser) {
                    res.status(200).json({
                        'status': false,
                        'code': 200,
                        'message': "Social ID doesn't exist.",
                        'body': {
                            'socialIdExists': 0,
                            'user': {}
                        }
                    });
                    return false;
                }
                let updateUser = await drivers.update({
                    'socialId': requestdata.socialId,
                    'socialType': requestdata.socialType,
                    'deviceType': requestdata.deviceType ? requestdata.deviceType : 0,
                    'deviceToken': requestdata.deviceToken ? requestdata.deviceToken : '',
                },
                    { returning: true, where: { id: getUser.id } });

                if (!updateUser[1]) {
                    throw "An error occurred while logging in.";
                }

                updatedUser = await drivers.findOne({
                    where: { id: getUser.id },
                    attributes: ['id', 'email', 'password', 'fullName', 'username', 'countryCode', 'countryCodePhone', 'socialId', 'socialType', 'deviceType', 'deviceToken', 'createdAt', 'updatedAt']
                });

                updatedUser = updatedUser.toJSON();
                delete updatedUser.password;

                let user_data = {
                    id: updatedUser.id,
                    email: updatedUser.email,
                    // username: getUser.username,
                }
                var token = jwt.sign({
                    data: user_data
                }, secretKey, { expiresIn: '1h' });

                let checkLicense = await DriverLicense.findOne({
                    where: { driverId: updatedUser.id },
                });

                if (checkLicense) {
                    updatedUser.isLicenceExists = 1;    
                } else {
                    updatedUser.isLicenceExists = 0;
                }

                updatedUser.token = token;
                // var decoded = jwt.verify(token, 'secret');
                // console.log(decoded)

                res.status(200).json({
                    'status': true,
                    'code': 200,
                    'message': 'Driver Social logged in successfully.',
                    'body': {
                        'socialIdExists': 1,
                        'user': updatedUser
                    }
                });
            }
        } catch (err) {
            console.log(err);
            return responseHelper.onError(res, err);
        }
    },

    forgotPassword: async (req, res) => {
        try {
            const required = {
                email: req.body.email,
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

                let getUser = await drivers.findOne({
                    where: {
                        email: requestdata.email
                    },
                    attributes: [
                        'id', 'email', 'fullName', 'username', 'createdAt', 'updatedAt'
                    ]
                });

                if (!getUser) {
                    throw "Email could not be found.";
                }
                getUser = getUser.toJSON();

                // console.log(getUser); return false;

                let forgotPasswordHash = await helper.createSHA1();
                
                let updateForgotPasswordHash = await drivers.update({
                    forgotPasswordHash: forgotPasswordHash
                },
                    {
                        returning: true, where: { id: getUser.id }
                    });

                if (!updateForgotPasswordHash[1]) {
                    throw "Something went wrong.";
                }


                console.log(forgotPasswordHash);
                // return false;
                // let forgotPasswordUrl = "http://admin.bahamaeats.com/admin/reset_password/" + forgotPasswordHash;
                // let forgotPasswordUrl = "http://admin.bahamaeats.com/driver_reset_password/" + forgotPasswordHash;
                let forgotPasswordUrl = "https://dev.bahamaeats.com/admin/driver_reset_password/"+forgotPasswordHash;
                // console.log(forgotPasswordUrl,"===============forgotPasswordUrl=")
                let forgot_password_html = 'Hello ' + getUser.username + ',<br> Your Forgot Password Link is: <a href="' + forgotPasswordUrl + '">CLICK HERE TO RESET PASSWORD</a>. <br><br><br> Regards,<br> BahamaEats';

                console.log(forgot_password_html);

                let mail = {
                    from: 'Bahama Eats<admin@BahamaEats.com>',
                    to: requestdata.email,
                    subject: 'BahamaEats | Forgot Password Link',
                    html: forgot_password_html
                }

                helper.sendMail(mail);

                res.status(200).json({
                    'status': true,
                    'code': 200,
                    'message': 'Forgot password email sent successfully.',
                    'body': getUser
                });
            }
        } catch (err) {
            console.log(err);
            return responseHelper.onError(res, err);
        }
    },
}
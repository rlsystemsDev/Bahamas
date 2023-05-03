const model = require('../../models');
const config = require('../../config/config.js');
const helper = require('../../config/helper');
const responseHelper = require('../../helpers/responseHelper');
const users = model.users;
var jwt = require('jsonwebtoken');
let secretKey = 'secret';

module.exports = {
    getOTP: async (req, res) => {
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
            // console.log(requestdata); return false;

            let countryCodePhoneExists = await users.findOne({
                where: { countryCodePhone: requestdata.countryCodePhone },
                attributes: ['id', 'email', 'username', 'phone', 'deviceType', 'deviceToken', 'created_at', 'updated_at']
            });

            // if (countryCodePhoneExists) {
            //     throw "This phone number has already been used. Kindly user another";
            // }

            let isUserRegistered = await users.findOne({
                where: { 
                    countryCodePhone: requestdata.countryCodePhone,
                    email: {
                        $ne: ''
                    },
                },
                attributes: ['id', 'email', 'username', 'phone', 'deviceType', 'deviceToken', 'created_at', 'updated_at']
            });
            // console.log(isUserRegistered); return false;

            // if (countryCodePhoneExists) {
            //     return res.status(200).json({
            //         // 'status': true,
            //         'code': 200,
            //         'message': 'This phone number has already been used. Kindly user another.',
            //         'body': {
            //             isUserRegistered: (isUserRegistered) ? 1 : 0 
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
            if (otpResponse.hasOwnProperty('status') && otpResponse.status == '400') {
                throw otpResponse.message;
            }

            let user_id = 0;

            if (countryCodePhoneExists) {
                countryCodePhoneExists = countryCodePhoneExists.toJSON();
                let updateUserObj = {
                    'otp': OTP
                };
    
                let up_user = await users.update(updateUserObj,
                    {returning: true, where: {id: countryCodePhoneExists.id}}
                );
                
                user_id = countryCodePhoneExists.id;
            } else {            
                let create_user = await users.create({
                    countryCode: requestdata.countryCode,
                    phone: requestdata.phone,
                    countryCodePhone: requestdata.countryCodePhone,
                    otp: OTP
                });
                // console.log(create_user.toJSON());
                let created_user = create_user.toJSON();
                user_id = created_user.id;
            }   

            let found_user = await users.findOne({
                where: { id: user_id },
                attributes: ['id', 'countryCode', 'phone', 'countryCodePhone', 'otp', 'created_at', 'updated_at']
            });
            // console.log(found_user); return false;
            res.status(200).json({
                'status': true,
                'code': 200,
                'message': 'Phone registered successfully.',
                'body': found_user
            });
            
        } catch(err) {
            console.log(err);
            return helper.error(res, err);
            // return responseHelper.onError(res, err);
            // throw err;
        }
    },

    resendOTP: async (req, res) => {
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

            let countryCodePhoneExists = await users.findOne({
                where: { countryCodePhone: requestdata.countryCodePhone },
                attributes: ['id', 'email', 'username', 'phone', 'deviceType', 'deviceToken', 'created_at', 'updated_at']
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

            let up_user = await users.update(updateUserObj,
                {returning: true, where: {id: countryCodePhoneExists.toJSON().id}});
            
            let found_user = await users.findOne({
                where: { id: countryCodePhoneExists.id },
                attributes: ['id', 'countryCode', 'phone', 'countryCodePhone', 'otp', 'created_at', 'updated_at']
            });

            return res.status(200).json({
                'status': true,
                'code': 200,
                'message': 'OTP Re-Sent Successfully.',
                'body': found_user
            });
            
        } catch (e) {
            console.log(e);
            return helper.error(res, e);
        }
    },

    verifyOTP: async (req, res) => {
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

            let countryCodePhoneExists = await users.findOne({
                where: { countryCodePhone: requestdata.countryCodePhone },
                attributes: ['id', 'email', 'username', 'phone', 'deviceType', 'deviceToken', 'otp', 'created_at', 'updated_at']
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

            let up_user = await users.update(updateUserObj,
                {returning: true, where: {id: countryCodePhoneExists.id}});
            
            let found_user = await users.findOne({
                where: { id: countryCodePhoneExists.id },
                attributes: ['id', 'countryCode', 'phone', 'countryCodePhone', 'otp', 'otpVerified', 'created_at', 'updated_at']
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
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                username: req.body.username,
                email: req.body.email,
                phone: req.body.phone,
                password: req.body.password,
                loginType: req.body.loginType,
            };
            const nonRequired = {
                deviceType: req.body.deviceType,
                deviceToken: req.body.deviceToken,
            };

            if (required.loginType == 1) {
                required['socialId'] = req.body.socialId;
                required['socialType'] = req.body.socialType;   // 1=>fb 2=>insta 3=>twitter
            }

            let requestdata = await helper.vaildObject(required, nonRequired, res);
            // console.log(requestdata);
            // return false;
            // console.log(req.body); return false;
            // console.log(req.files.photo); return false;
            // console.log(req.files); return false;

            // if (req.files && req.files.photo) {
            //     console.log('asdfa');
            // } else {
            //     console.log('pqrs');
            // }
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
                
                let user_exists = await users.findOne({
                    where: { countryCodePhone: requestdata.phone },
                    attributes: ['id', 'firstName', 'lastName', 'email', 'username', 'countryCode', 'phone', 'countryCodePhone', 'deviceType', 'deviceToken', 'created_at', 'updated_at']
                });
                // console.log(user_exists); return false;
                // return false;

                if (!user_exists) {
                    res.status(200).json({
                        'status': false,
                        'code': 200,
                        // 'message': 'Invalid value in the parameter phone.',
                        'message': 'Please verify mobile number first.',
                        'body': {
                            isPhoneExist : 0,
                            user : {}
                        }
                    });
                    return false;
                }

                if (user_exists && user_exists.dataValues.email != '') {
                    res.status(200).json({
                        'status': false,
                        'code': 403,
                        // 'message': 'Invalid value in the parameter phone.',
                        'message': 'This user has been already registered.',
                        'body': {
                            isPhoneExist : 1,
                            user : {}
                        }
                    });
                    return false;
                }

                let findEmailAlreadyExists = await users.findOne({
                    where: {
                        id: {
                            $ne: user_exists.id
                        },
                        email: requestdata.email
                    }
                });
                if (findEmailAlreadyExists) {
                    let resData = {
                        isPhoneExist: 1,
                        isEmailAlreadyExist: 1,
                        user: {}

                    }
                    // return responseHelper.post(res, resData, "This email already exists, Kindly use another.");
                    res.status(200).json({
                        'status': false,
                        'code': 403,
                        // 'message': 'Invalid value in the parameter phone.',
                        'message': 'This email already exists, Kindly use another.',
                        'body': resData
                    });
                    return false;
                }


                let updateUserObj = {
                    'registerDate': newdate,
                    'firstName': requestdata.firstName,
                    'lastName': requestdata.lastName,
                    'username': requestdata.username,
                    'email': requestdata.email,
                    'password': requestdata.password,
                    // 'phone': requestdata.phone,
                    'socialid': requestdata.socialid,
                    'loginType': requestdata.loginType,
                    'deviceToken': (requestdata.deviceToken && requestdata.deviceToken != 'undefined') ? requestdata.deviceToken : '',
                    'deviceType': (requestdata.deviceType && requestdata.deviceType != 'undefined') ? requestdata.deviceType : 0,
                }   

                if (requestdata.loginType == 1) {
                    updateUserObj['socialId'] = requestdata.socialId;
                    updateUserObj['socialType'] = requestdata.socialType;
                };

                let add_user = await users.update(updateUserObj,
                {returning: true, where: {id: user_exists.toJSON().id}});
                
                
                // Uploading photo in the /public/images/users folder
                let image = "";
                // console.log(req.files.photo); return false;
                if (req.files && req.files.photo) {
                    image = helper.fileUpload(req.files.photo, 'users');
                    let up_user = await users.update({photo: image},
                    {returning: true, where: {id: user_exists.toJSON().id}});

                    // console.log(up_user);
                }
                

                found_user = await users.findOne({
                    where: { countryCodePhone: requestdata.phone },
                    attributes: ['id', 'firstName', 'lastName', 'email', 'username', 'country_code','phone', 'country_code_phone', 'loginType', 'photo', 'socialId', 'socialType', 'deviceType', 'deviceToken', 'createdAt', 'updatedAt']
                });

                // console.log(found_user); return false;

                if (found_user.photo != '') {
                    if (found_user.photo.trim().substring(0,4) !== 'http') {
                        found_user.photo = req.protocol + '://' + req.get('host') + '/images/users/' + found_user.photo;
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
                
                // console.log(token);

                found_user = found_user.toJSON();
                found_user.token = token;
                // console.log(found_user);


                // console.log(found_user); return false;
                return  res.status(200).json({
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
                email: req.body.email,
                password: req.body.password,
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
                
                let getUser = await users.findOne({
                    where: {
                        email: requestdata.email,
                    },
                    attributes: ['id', 'email', 'password', 'firstName', 'lastName', 'username', 'countryCode', 'phone', 'photo', 'countryCodePhone', 'deviceType', 'deviceToken', 'status', 'createdAt', 'updatedAt']
                });
                if (!getUser) {
                    throw "Incorrect Email or Password.";
                }

                check_password = await helper.comparePass(requestdata.password, getUser.toJSON().password);
                
                if (!check_password) {
                    throw "Email or Password did not match, Please try again.";
                }
                // return false;

                getUser = getUser.toJSON();

                if (getUser.status == 0) {
                    throw "You have been set as inactive user by the admin.";
                }

                delete getUser.password;

                let updateUser = await users.update({
                    'deviceType': requestdata.deviceType ? requestdata.deviceType: 0,
                    'deviceToken': requestdata.deviceToken ? requestdata.deviceToken: '',
                },
                {returning: true, where: {id: getUser.id}});

                let updatedUser = await users.findOne({
                    where: {
                        email: requestdata.email,
                    },
                    attributes: ['id', 'email', 'password', 'firstName', 'lastName', 'username', 'countryCode', 'phone', 'photo', 'countryCodePhone', 'deviceType', 'deviceToken', 'createdAt', 'updatedAt']
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
                
                updatedUser.token = token;
                // var decoded = jwt.verify(token, 'secret');
                // console.log(decoded)

                if (updatedUser.photo != '') {
                    if (updatedUser.photo.trim().substring(0,4) !== 'http') {
                        updatedUser.photo = req.protocol + '://' + req.get('host') + '/images/users/' + updatedUser.photo;
                    }
                }
                // console.log(updatedUser);




                if (Object.keys(updatedUser).length > 0) {
                    for (let i in updatedUser) {
                        if (updatedUser[i] == null) {
                            updatedUser[i] = '';
                        }
                    }
                }

                
                res.status(200).json({
                    'status': true,
                    'code': 200,
                    'message': 'User logged in successfully.',
                    'body': updatedUser
                });
            }
        } catch (err) {
            console.log(err);
            return responseHelper.onError(res, err);
        }
    },

    logout: async (req, res) => {        
        try {
            // console.log(req.user);

            await users.update({
                    deviceType: 0,
                    deviceToken: '',
                },
                {returning: true, where: {id: req.user.id}
            });

            res.status(200).json({
                'status': true,
                'code': 200,
                'message': 'User logged out successfully.',
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
                socialType: req.body.socialType,
                socialId: req.body.socialId,
            };
            const non_required = {
                deviceType: req.body.deviceType,
                deviceToken: req.body.deviceToken,
            };

            let requestdata = await helper.vaildObject(required, non_required, res);
            console.log(requestdata);
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

                let getUser = await users.findOne({
                    where: {
                        socialId: requestdata.socialId,
                        socialType: requestdata.socialType,
                    },
                    attributes: ['id', 'email', 'password', 'username', 'countryCode', 'phone', 'photo', 'countryCodePhone', 'socialId', 'socialType', 'deviceType', 'deviceToken', 'createdAt', 'updatedAt']
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
                let updateUser = await users.update({
                    'socialId': requestdata.socialId,
                    'socialType': requestdata.socialType,
                    'deviceType': requestdata.deviceType ? requestdata.deviceType: 0,
                    'deviceToken': requestdata.deviceToken ? requestdata.deviceToken: '',
                },
                {returning: true, where: {id: getUser.id}});

                if (!updateUser[1]) {
                    throw "An error occurred while logging in.";
                }

                updatedUser = await users.findOne({
                    where: { id: getUser.id },
                    attributes: ['id', 'email', 'password', 'firstName', 'lastName', 'username', 'countryCode', 'phone', 'photo', 'countryCodePhone', 'socialId', 'socialType', 'deviceType', 'deviceToken', 'createdAt', 'updatedAt']
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
                
                updatedUser.token = token;
                // var decoded = jwt.verify(token, 'secret');
                // console.log(decoded)

                res.status(200).json({
                    'status': true,
                    'code': 200,
                    'message': 'User logged in successfully.',
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
              
                let getUser = await users.findOne({
                    where: {
                        email: requestdata.email
                    },
                    attributes: [
                        'id', 'email', 'username', 'createdAt', 'updatedAt'
                    ]
                });

                if (!getUser) {
                    throw "Email could not be found.";
                }
                getUser = getUser.toJSON();

                let forgotPasswordHash = await helper.createSHA1();
                let updateForgotPasswordHash = await users.update({
                        forgotPasswordHash: forgotPasswordHash
                    },
                    {returning: true, where: {id: getUser.id}
                });

                if (!updateForgotPasswordHash[1]) {
                    throw "Something went wrong.";
                }
                // http://admin.bahamaeats.com/admin/reset_password/7386a84478cab4ac752530f8532d82424adcc9f6
                // let forgotPasswordUrl = "www.bahamaeats.com/" + forgotPasswordHash;
                let forgotPasswordUrl = "http://admin.bahamaeats.com/admin/reset_password/" + forgotPasswordHash;

                let forgot_password_html = 'Hello ' + getUser.username + ',<br> Your Forgot Password Link is: <a href="'+forgotPasswordUrl+'">CLICK HERE TO RESET PASSWORD</a>. <br><br><br> Regards,<br> BahamaEats';

                let mail = {
                    from: 'admin@BahamaEats.com',
                    to: requestdata.email,
                    subject: 'BahamaEats | Forgot Password Link',
                    html: forgot_password_html
                }

                helper.sendMail(mail);

                res.status(200).json({
                    'status': true,
                    'code': 200,
                    'message': 'Forgot Password Email Sent Successfully.',
                    'body': getUser
                });
            }
        } catch (err) {
            console.log(err);
            return responseHelper.onError(res, err);
        }
    },
}
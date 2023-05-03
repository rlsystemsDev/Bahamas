const model = require('../models');
const sequelize = require('sequelize');
const helper = require('../config/helper');
const responseHelper = require('../helpers/responseHelper');
const Driver = model.drivers;
const DriverUserAddress = model.driverAddresses;
const countries = model.countries;
const states = model.states;
const cities = model.cities;
var jwt = require('jsonwebtoken');
let secretKey = 'secret';

module.exports = {


    addDriverAddress: async (req, res) => {
        try {
            const required = {
                security_key: req.headers.security_key,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                address: req.body.address,
                // countryCode: req.body.countryCode,
                // phoneNumber: req.body.phoneNumber,
                // postalCode: req.body.postalCode,
                country: req.body.country,
                countryId: req.body.countryId,
                provience: req.body.provience,
                provienceId: req.body.provienceId,
                city: req.body.city,
                cityId: req.body.cityId,
            };
            const non_required = {
                postalCode: req.body.postalCode,
            };

            let requestdata = await helper.vaildObject(required, non_required, res);
            requestdata.countryCode = req.user.countryCode;
            requestdata.phoneNumber = req.user.phone;

            if (!requestdata.postalCode) {
                delete requestdata['postalCode'];
            }
            // console.log(requestdata); return false;
            


            requestdata.countryCode = requestdata.countryCode.replace(/[+_]/g,'');
            requestdata.countryCode = requestdata.countryCode.replace(/[(_]/g,'');
            requestdata.countryCode = requestdata.countryCode.replace(/[)_]/g,'');
            requestdata.countryCode = requestdata.countryCode.replace(/[-_]/g,'');

            requestdata.phoneNumber = requestdata.phoneNumber.replace(/[+_]/g,'');
            requestdata.phoneNumber = requestdata.phoneNumber.replace(/[(_]/g,'');
            requestdata.phoneNumber = requestdata.phoneNumber.replace(/[)_]/g,'');
            requestdata.phoneNumber = requestdata.phoneNumber.replace(/[-_]/g,'');

            let checkAddress = await DriverUserAddress.findOne({
                where: {
                    userId: req.user.id
                }
            });
            // console.log(checkAddress); return false;

            if (requestdata != '' && checkAddress == null) {
                let insertObj = {
                    firstName: requestdata.firstName,
                    lastName: requestdata.lastName,
                    address: requestdata.address,
                    countryCode: requestdata.countryCode,
                    alternateMobileNumber: requestdata.phoneNumber,
                    countryCodeAlternateMobileNumber: requestdata.countryCode + requestdata.phoneNumber,
                    // postalCode: req.body.postalCode,
                    userId: req.user.id,
                    country: requestdata.country,
                    countryId: requestdata.countryId,
                    provience: req.body.provience,
                    provienceId: requestdata.provienceId,
                    city: requestdata.city,
                    cityId: requestdata.cityId
                }
                
                if (requestdata.postalCode) {
                    insertObj['postalCode'] = requestdata.postalCode;
                }                
                
                let insertAddress = await DriverUserAddress.create(insertObj);

                let getAddress = await DriverUserAddress.findOne({
                    where: { id: insertAddress.id },
                    attributes: ['id', 'isDefault', 'user_id', 'countryCode', 'alternateMobileNumber', 'countryCodeAlternateMobileNumber', 'address', 'firstName', 'lastName', 'country', 'countryId', 'provience', 'provienceId', 'city', 'cityId', 'postal_code', 'created_at', [sequelize.fn('IFNULL', sequelize.col('updated_at'), ''), 'updated_at'],]
                });
                // console.log(getAddress); return false;
                
                return res.status(200).json({
                    'status': true,
                    'code': 200,
                    'message': 'Driver address added successfully',
                    'body': getAddress
                });
            } else {
                let updateObject = {
                    firstName: requestdata.firstName,
                    lastName: requestdata.lastName,
                    address: requestdata.address,
                    countryCode: requestdata.countryCode,
                    alternateMobileNumber: requestdata.phoneNumber,
                    countryCodeAlternateMobileNumber: requestdata.countryCode + requestdata.phoneNumber,
                    // postalCode: req.body.postalCode,
                    userId: req.user.id,
                    country: requestdata.country,
                    countryId: requestdata.countryId,
                    provience: req.body.provience,
                    provienceId: requestdata.provienceId,
                    city: requestdata.city,
                    cityId: requestdata.cityId
                };

                if (requestdata.postalCode) {
                    updateObject['postalCode'] = requestdata.postalCode;
                }
                // console.log(updateObject); return false;
                
                const addressUpdate = await DriverUserAddress.update(
                    updateObject,

                    { where: { id: checkAddress.id } },
                );
                let getAddress = await DriverUserAddress.findOne({
                    where: { id: checkAddress.id },
                    attributes: ['id', 'isDefault', 'user_id', 'countryCode', 'alternateMobileNumber', 'countryCodeAlternateMobileNumber', 'address', 'firstName', 'lastName', 'country', 'countryId', 'provience', 'provienceId', 'city', 'cityId', 'postal_code', 'created_at', [sequelize.fn('IFNULL', sequelize.col('updated_at'), ''), 'updated_at'],]
                });


                return res.status(200).json({
                    'status': true,
                    'code': 200,
                    'message': 'Driver address updated successfully.',
                    'body': getAddress
                });
            }
        } catch (err) {
            console.log(err);
            responseHelper.onError(res, err);
        }
    },

    updateDriverAddress: async (req, res) => {
        try {
            const required = {
                security_key: req.headers.security_key,
                addressID: req.body.addressID,
            };
            const non_required = {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                address: req.body.address,
                countryCode: req.body.countryCode,
                phoneNumber: req.body.phoneNumber,
                postalCode: req.body.postalCode,
                country: req.body.country,
                countryId: req.body.countryId,
                provience: req.body.provience,
                provienceId: req.body.provienceId,
                city: req.body.city,
                cityId: req.body.cityId,                
            };
            let requestdata = await helper.vaildObject(required, non_required, res);

            let checkAddress = await DriverUserAddress.findOne({
                where: {
                    userId: req.user.id,
                    id: requestdata.addressID
                }
            });

            if (!checkAddress) {
                throw "Invalid value in the parameter addressID";
            }

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

                let dtas = { ...requestdata };
                delete dtas.security_key;
                delete dtas.addressID;
                dtas.alternateMobileNumber = dtas.phoneNumber;
                delete dtas.phoneNumber;
                let updateObject = {};
                if (Object.values(dtas).length > 0) {
                    for (let i in dtas) {
                        if (dtas.hasOwnProperty(i)) {
                            updateObject[i] = dtas[i];

                        }
                    }
                }
                const addressUpdate = await DriverUserAddress.update(
                    updateObject,

                    { where: { id: requestdata.addressID } },
                );
                let getAddress = await DriverUserAddress.findOne({
                    where: { id: requestdata.addressID },
                    attributes: ['id', 'isDefault', 'user_id', 'countryCode', 'alternate_mobile_number', 'countryCodeAlternateMobileNumber', 'address', 'firstName', 'lastName', 'country', 'countryId', 'provience', 'provienceId', 'city', 'cityId', 'postal_code', 'created_at', [sequelize.fn('IFNULL', sequelize.col('updated_at'), ''), 'updated_at'],]
                });
                res.status(200).json({
                    'status': true,
                    'code': 200,
                    'message': 'address updated successfully',
                    'body': getAddress
                });
            }
        } catch (err) {
            responseHelper.onError(res, err);
        }
    },

    getDriverAddress: async (req, res) => {
        try {
            const required = {
                security_key: req.headers.security_key,
            };
            const non_required = {};
            let requestdata = await helper.vaildObject(required, non_required, res);
            if (requestdata != '') {
                let getallUserAddress = await DriverUserAddress.findOne({
                    where: { userId: req.user.id },
                    // order: [['id', 'DESC']],
                    // attributes: ['id', 'isDefault', 'user_id', 'countryCode', 'alternate_mobile_number', 'address', 'firstName', 'lastName', 'country', 'provience', 'city', 'countryId', 'provienceId', 'cityId', 'postal_code', 'created_at', [sequelize.fn('IFNULL', sequelize.col('updated_at'), ''), 'updated_at'],]
                });

                if (!getallUserAddress) {
                    return res.status(200).json({
                        'status': true,
                        'code': 200,
                        'message': 'Driver address not found.',
                        'body': {}
                    });
                }

                return res.status(200).json({
                    'status': true,
                    'code': 200,
                    'message': 'Driver address found.',
                    'body': getallUserAddress
                });
            }
        } catch (err) {
            responseHelper.onError(res, err);
        }
    },

    deleteDriverAddress: async (req, res) => {        
        try {
            const required = {
                security_key: req.headers.security_key,
                // addressID: req.body.addressID,
            };
            const non_required = {};
            let requestdata = await helper.vaildObject(required, non_required, res);
            
            // console.log(requestdata); return false;

            if (requestdata != '') {
                let checkAddress = await DriverUserAddress.findOne({
                    where: { userId: req.user.id },
                });
                // console.log(checkAddress); return false;
                if (checkAddress != null) {
                    let deleteAddress = await DriverUserAddress.destroy({
                        where: { id: checkAddress.id },
                    });
                    // let getallUserAddress = await DriverUserAddress.findOne({
                    //     where: { userId: req.user.id },
                    //     // order: [['id', 'DESC']],
                    //     // attributes: ['id', 'isDefault', 'user_id', 'countryCode', 'alternate_mobile_number', 'address', 'firstName', 'lastName','country', 'provience', 'city', 'countryId', 'provienceId', 'cityId', 'postal_code', 'created_at', [sequelize.fn('IFNULL', sequelize.col('updated_at'), ''), 'updated_at'],]
                    // });
                    return res.status(200).json({
                        'status': true,
                        'code': 200,
                        'message': 'user address deleted sucessfully',
                        'body': {}
                    });

                } else {
                    return res.status(200).json({
                        'status': true,
                        'code': 403,
                        'message': 'You currently have no address to delete.',
                        'body': {}
                    });
                }
            }
        } catch (err) {
            responseHelper.onError(res, err);
        }
    },

    getCountry: async (req, res) => {
        try {
            const required = {
                security_key: req.headers.security_key,
            };
            const non_required = {};
            let requestdata = await helper.vaildObject(required, non_required, res);
            if (requestdata != '') {
                let getCountry = await countries.findAll({
                    // where: { id: 16 },
                    order: [['id', 'DESC']],
                });
                res.status(200).json({
                    'status': true,
                    'code': 200,
                    'message': 'Country found',
                    'body': getCountry
                });
            }
        } catch (err) {
            responseHelper.onError(res, err);
        }
    },

    getProvience: async (req, res) => {
        try {
            const required = {
                security_key: req.headers.security_key,
            };
            const non_required = {};
            let requestdata = await helper.vaildObject(required, non_required, res);
            if (requestdata != '') {
                let getProvience = await states.findAll({
                    where: { countryId: 16 },
                    order: [['id', 'DESC']],
                });
                res.status(200).json({
                    'status': true,
                    'code': 200,
                    'message': 'provience found',
                    'body': getProvience
                });
            }
        } catch (err) {
            responseHelper.onError(res, err);
        }
    },

    getCity: async (req, res) => {
        try {
            const required = {
                security_key: req.headers.security_key,
                stateID: req.params.stateID,
            };
            const non_required = {};
            let requestdata = await helper.vaildObject(required, non_required, res);
            if (requestdata != '') {
                let getCities = await cities.findAll({
                    where: { stateId: requestdata.stateID },
                    order: [['id', 'DESC']],
                });
                res.status(200).json({
                    'status': true,
                    'code': 200,
                    'message': 'cities found',
                    'body': getCities
                });
            }
        } catch (err) {
            responseHelper.onError(res, err);
        }
    },

    getPostalCode: async (req, res) => {
        try {
            const required = {
                security_key: req.headers.security_key,
                cityID: req.params.cityID,
            };
            const non_required = {};
            let requestdata = await helper.vaildObject(required, non_required, res);
            if (requestdata != '') {
                let checkCity = await cities.findOne({
                    where: { id: requestdata.cityID },
                    attributes: [[sequelize.fn('IFNULL', sequelize.col('postalCode'), ''), 'postalCode']]
                });
                if (checkCity != null) {
                    res.status(200).json({
                        'status': true,
                        'code': 200,
                        'message': 'postalCode found',
                        'body': checkCity
                    });
                } else {
                    throw "invalid cityID"
                }
            }
        } catch (err) {
            responseHelper.onError(res, err);
        }
    },

    setDefaultAddress: async (req, res) => {
        try {
            const required = {
                security_key: req.headers.security_key,
                addressID: req.body.addressID,
            };
            const non_required = {};
            let requestdata = await helper.vaildObject(required, non_required, res);
            if (requestdata != '') {
                let checkAddress = await DriverUserAddress.findOne({
                    where: { id: requestdata.addressID },
                });
                if (checkAddress != null) {

                    let updateAddress = await DriverUserAddress.update(
                        { isDefault: '1' },
                        { where: { id: requestdata.addressID } },
                    );
                    let checkUserAddress = await DriverUserAddress.update(
                        {
                            isDefault: '0'
                        },
                        {
                            where: {
                                userId: req.user.id,
                                id: {
                                    $ne: requestdata.addressID
                                }
                            },
                        });

                    let getAddresses = await DriverUserAddress.findAll({
                        order: [['isDefault', 'DESC']],
                        where: { userId: req.user.id },
                        attributes: ['id', 'isDefault', 'user_id', 'countryCode', 'alternate_mobile_number', 'address', 'firstName', 'lastName', 'country', 'provience', 'city', 'countryId', 'provienceId', 'cityId', 'postal_code', 'created_at', [sequelize.fn('IFNULL', sequelize.col('updated_at'), ''), 'updated_at'],]
                    });
                    res.status(200).json({
                        'status': true,
                        'code': 200,
                        'message': 'address default set succeefully',
                        'body': getAddresses
                    });

                } else {
                    throw "invalid addressID"
                }
            }
        } catch (err) {
            responseHelper.onError(res, err);
        }
    }

}
const model = require('../models');
const sequelize = require('sequelize');
const helper = require('../config/helper');
const responseHelper = require('../helpers/responseHelper');
const User = model.users;
const UserAddress = model.addresses;
const countries = model.countries;
const states = model.states;
const cities = model.cities;
var jwt = require('jsonwebtoken');
let secretKey = 'secret';

module.exports = {


    addAddress: async (req, res) => {
        try {
            // console.log(req.user); return false;
            const required = {
                security_key: req.headers.security_key,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                address: req.body.address,
                completeAddress: req.body.completeAddress,
                // countryCode: req.body.countryCode,                
                // postalCode: req.body.postalCode,
                country: req.body.country,
                countryId: req.body.countryId,
                provience: req.body.provience,
                provienceId: req.body.provienceId,
                city: req.body.city,
                cityId: req.body.cityId,
                latitude: req.body.latitude,
                longitude: req.body.longitude,
            };
            const non_required = {
                postalCode: (req.body.postalCode == undefined) ? 0 : req.body.postalCode,
                deliveryInstructions: (req.body.deliveryInstructions == undefined) ? '' : req.body.deliveryInstructions,
            };

            // console.log(req.body.postalCode == undefined); return false;
            // console.log(non_required); return false;
            
            
            let requestdata = await helper.vaildObject(required, non_required, res);
            requestdata.countryCode = req.user.countryCode;
            requestdata.phoneNumber = req.user.phone;
            // console.log(requestdata); return false;

            requestdata.countryCode = requestdata.countryCode.replace(/[+_]/g,'');
            requestdata.countryCode = requestdata.countryCode.replace(/[(_]/g,'');
            requestdata.countryCode = requestdata.countryCode.replace(/[)_]/g,'');
            requestdata.countryCode = requestdata.countryCode.replace(/[-_]/g,'');

            requestdata.phoneNumber = requestdata.phoneNumber.replace(/[+_]/g,'');
            requestdata.phoneNumber = requestdata.phoneNumber.replace(/[(_]/g,'');
            requestdata.phoneNumber = requestdata.phoneNumber.replace(/[)_]/g,'');
            requestdata.phoneNumber = requestdata.phoneNumber.replace(/[-_]/g,'');

            if (requestdata != '') {
                let insertAddress = await UserAddress.create({
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    address: req.body.address,
                    completeAddress: req.body.completeAddress,
                    countryCode: requestdata.countryCode,
                    alternateMobileNumber: requestdata.phoneNumber,
                    countryCodeAlternateMobileNumber: requestdata.countryCode + requestdata.phoneNumber,
                    postalCode: requestdata.postalCode,
                    userId: req.user.id,
                    country: req.body.country,
                    countryId: req.body.countryId,
                    provience: req.body.provience,
                    provienceId: req.body.provienceId,
                    city: req.body.city,
                    cityId: req.body.cityId,
                    latitude: req.body.latitude,
                    longitude: req.body.longitude,
                    deliveryInstructions: req.body.deliveryInstructions,
                });
                let getAddress = await UserAddress.findOne({
                    where: { id: insertAddress.id },
                    attributes: ['id', 'isDefault', 'user_id', 'countryCode', 'alternate_mobile_number', 'countryCodeAlternateMobileNumber', 'address', 'completeAddress', 'firstName', 'lastName', 'country', 'countryId', 'provience', 'provienceId', 'city', 'cityId', 'postal_code', 'latitude', 'longitude', 'deliveryInstructions', 'created_at', [sequelize.fn('IFNULL', sequelize.col('updated_at'), ''), 'updated_at'],]
                });
                return res.status(200).json({
                    'status': true,
                    'code': 200,
                    'message': 'address added successfully',
                    'body': getAddress
                });
            }
        } catch (err) {
            responseHelper.onError(res, err);
        }
    },

    updateAddress: async (req, res) => {
        try {
            const required = {
                security_key: req.headers.security_key,
                addressID: req.body.addressID,
            };
            const non_required = {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                address: req.body.address,
                completeAddress: req.body.completeAddress,
                countryCode: req.body.countryCode,
                phoneNumber: req.body.phoneNumber,
                postalCode: req.body.postalCode,
                country: req.body.country,
                countryId: req.body.countryId,
                provience: req.body.provience,
                provienceId: req.body.provienceId,
                city: req.body.city,
                cityId: req.body.cityId,
                latitude: req.body.latitude,
                longitude: req.body.longitude,                
                deliveryInstructions: req.body.deliveryInstructions,                
            };
            let requestdata = await helper.vaildObject(required, non_required, res);

            if (requestdata.countryCode) {
                requestdata.countryCode = requestdata.countryCode.replace(/[+_]/g,'');
                requestdata.countryCode = requestdata.countryCode.replace(/[(_]/g,'');
                requestdata.countryCode = requestdata.countryCode.replace(/[)_]/g,'');
                requestdata.countryCode = requestdata.countryCode.replace(/[-_]/g,'');
            }
            if (requestdata.phoneNumber) {
                requestdata.phoneNumber = requestdata.phoneNumber.replace(/[+_]/g,'');
                requestdata.phoneNumber = requestdata.phoneNumber.replace(/[(_]/g,'');
                requestdata.phoneNumber = requestdata.phoneNumber.replace(/[)_]/g,'');
                requestdata.phoneNumber = requestdata.phoneNumber.replace(/[-_]/g,'');
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

                if (dtas.countryCode && dtas.phoneNumber) {
                    dtas.countryCodeAlternateMobileNumber = dtas.countryCode + dtas.phoneNumber;
                }
                delete dtas.phoneNumber;
                let updateObject = {};
                if (Object.values(dtas).length > 0) {
                    for (let i in dtas) {
                        if (dtas.hasOwnProperty(i)) {
                            updateObject[i] = dtas[i];

                        }
                    }
                }
                const addressUpdate = await UserAddress.update(
                    updateObject,

                    { where: { id: requestdata.addressID } },
                );
                let getAddress = await UserAddress.findOne({
                    where: { id: requestdata.addressID },
                    attributes: ['id', 'isDefault', 'user_id', 'countryCode', 'alternate_mobile_number', 'countryCodeAlternateMobileNumber', 'address', 'completeAddress', 'firstName', 'lastName', 'country', 'countryId', 'provience', 'provienceId', 'city', 'cityId', 'postal_code', 'latitude', 'longitude', 'deliveryInstructions', 'created_at', [sequelize.fn('IFNULL', sequelize.col('updated_at'), ''), 'updated_at'],]
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

    getAddresses: async (req, res) => {
        try {
            const required = {
                security_key: req.headers.security_key,
            };
            const non_required = {};
            let requestdata = await helper.vaildObject(required, non_required, res);
            if (requestdata != '') {
                let getallUserAddress = await UserAddress.findAll({
                    order: [['isDefault', 'Desc'],['id', 'DESC']],
                    where: { userId: req.user.id },
                    attributes: ['id', 'isDefault', 'user_id', 'countryCode', 'alternate_mobile_number', 'countryCodeAlternateMobileNumber', 'address', 'completeAddress', 'firstName', 'lastName', 'country', 'provience', 'city', 'countryId', 'provienceId', 'cityId', 'postal_code', 'latitude', 'longitude', 'deliveryInstructions', 'created_at', [sequelize.fn('IFNULL', sequelize.col('updated_at'), ''), 'updated_at'],]
                });
                res.status(200).json({
                    'status': true,
                    'code': 200,
                    'message': 'user address found',
                    'body': getallUserAddress
                });
            }
        } catch (err) {
            responseHelper.onError(res, err);
        }
    },

    deleteAddress: async (req, res) => {
        try {
            const required = {
                security_key: req.headers.security_key,
                addressID: req.body.addressID,
            };
            const non_required = {};
            let requestdata = await helper.vaildObject(required, non_required, res);
            if (requestdata != '') {

                let checkAddress = await UserAddress.findOne({
                    where: { id: requestdata.addressID },
                });
                if (checkAddress != null) {
                    let deleteAddress = await UserAddress.destroy({
                        where: { id: requestdata.addressID },
                    });
                    let getallUserAddress = await UserAddress.findAll({
                        order: [['id', 'DESC']],
                        where: { userId: req.user.id },
                        attributes: ['id', 'isDefault', 'user_id', 'countryCode', 'alternate_mobile_number', 'address', 'firstName', 'lastName','country', 'provience', 'city', 'countryId', 'provienceId', 'cityId', 'postal_code', 'latitude', 'longitude', 'deliveryInstructions', 'created_at', [sequelize.fn('IFNULL', sequelize.col('updated_at'), ''), 'updated_at'],]
                    });
                    res.status(200).json({
                        'status': true,
                        'code': 200,
                        'message': 'user address deleted sucessfully',
                        'body': getallUserAddress
                    });

                } else {
                    throw "invalid addressID";
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
                countryID: req.params.countryID,
            };
            const non_required = {};
            let requestdata = await helper.vaildObject(required, non_required, res);
            if (requestdata != '') {
                let getProvience = await states.findAll({
                    where: { countryId: requestdata.countryID },
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
                let checkAddress = await UserAddress.findOne({
                    where: { id: requestdata.addressID },
                });
                if (checkAddress != null) {

                    let updateAddress = await UserAddress.update(
                        { isDefault: '1' },
                        { where: { id: requestdata.addressID } },
                    );
                    let checkUserAddress = await UserAddress.update(
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

                    let getAddresses = await UserAddress.findAll({
                        order: [['isDefault', 'DESC']],
                        where: { userId: req.user.id },
                        // attributes: ['id', 'isDefault', 'user_id', 'countryCode', 'alternate_mobile_number', 'address', 'completeAddress', 'firstName', 'lastName', 'country', 'provience', 'city', 'countryId', 'provienceId', 'cityId', 'postal_code', 'created_at', [sequelize.fn('IFNULL', sequelize.col('updated_at'), ''), 'updated_at'],]
                    });
                    res.status(200).json({
                        'status': true,
                        'code': 200,
                        'message': 'Address set as default successfully',
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
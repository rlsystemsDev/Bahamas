const model = require('../../models');
const helper = require('../../config/helper');
const Setting = model.settings;
const DeliveryFee = model.deliveryFees;
const UserAddress = model.addresses;
const Restaurant = model.restaurants;
var jwt = require('jsonwebtoken');
const { use } = require('passport');
let secretKey = 'secret';

module.exports = {

    charges: async (req, res) => {
        try {
            const required = {
                security_key: req.headers.security_key,
            };
            const non_required = {};

            let requestdata = await helper.vaildObject(required, non_required, res);
            // console.log(req.user);
            
            let getContent = await Setting.findOne({
               where: {
                   id: 1
               },
            });

            if (!getContent) {
                throw "Charges could not be found.";
            }
            
            res.status(200).json({
                'status': true,
                'code': 200,
                'message': 'Charges Details.',
                'body': getContent
            });
            
        } catch(err) {
            console.log(err);
            helper.error(res, err);
        }
    },
   getCharges: async (req, res) => {
        try {
            const required = {
                security_key: req.headers.security_key,
                addressId: req.body.addressId,
                restaurantId: req.body.restaurantId,
            };
            const non_required = {};
            let requestdata = await helper.vaildObject(required, non_required, res);
            let getRestaurant = await Restaurant.findOne({
               where: {
                   id: requestdata.restaurantId
               },
            });
            if (!getRestaurant) throw "Invalid value in the parameter restaurant_id.";
            let getAddress = await UserAddress.findOne({
               where: {
                   id: requestdata.addressId
               },
            });
            if (!getAddress) throw "Invalid value in the parameter addressId.";
            getRestaurant = getRestaurant.toJSON();
            getAddress = getAddress.toJSON();
            let distanceData =false;
            if (distanceData) {
                requestdata.distance = distanceData.distanceValue * 0.000621;
            } else {
                requestdata.distance = helper.distance(getRestaurant.latitude, getRestaurant.longitude, getAddress.latitude, getAddress.longitude, 'M');
            }
            
            let getCharges = await Setting.findOne({
                where: {
                   id: 1
                },
            });
            if (!getCharges) {
                throw "Charges could not be found.";
            }
            if (parseInt(requestdata.distance) > 21) {
               // throw "Order request can not be processed.";
            }
            
            let getDeliveryFee = await DeliveryFee.findOne({
                where: {
                    distanceFrom: {
                        $lte: requestdata.distance
                    },
                    distanceTo: {
                        $gte: requestdata.distance
                    },
                    resturantId:requestdata.restaurantId
                },
            }); 

            let getMaxDistanceDeliveryFee = await DeliveryFee.findOne({                
                order: [
                    ['price', 'DESC'],
                ],
                where: {
                    resturantId:requestdata.restaurantId
                },
                
             });
            // getMaxDistanceDeliveryFee = getMaxDistanceDeliveryFee[0].toJSON();
            let deliveryFee = 0;
                if (getDeliveryFee) {  

                    deliveryFee =  getDeliveryFee.price;
                        deliveryExtracharges = getDeliveryFee.extra_charges;
                    distanceFrom = getDeliveryFee.distanceFrom;
                    distanceTo = getDeliveryFee.distanceTo;
                    
                } else if(getMaxDistanceDeliveryFee) { 
                    
                    deliveryFee =  getMaxDistanceDeliveryFee.price;
                    deliveryExtracharges = getMaxDistanceDeliveryFee.extra_charges;
                    distanceFrom = getMaxDistanceDeliveryFee.distanceFrom;
                    distanceTo = getMaxDistanceDeliveryFee.distanceTo;

                }else{  

                    getAdminDeliveryFee = await DeliveryFee.findOne({
                        where: {
                            distanceFrom: {
                                $lte: requestdata.distance
                            },
                            distanceTo: {
                                $gte: requestdata.distance
                            },
                           // resturantId:requestdata.restaurantId
                        },
                    }); 
                    if(getAdminDeliveryFee){ 

                        deliveryFee =  getAdminDeliveryFee.price;
                        deliveryExtracharges = getAdminDeliveryFee.extra_charges;
                        distanceFrom = getAdminDeliveryFee.distanceFrom;
                        distanceTo = getAdminDeliveryFee.distanceTo;
                    }else{ 
                        getDeliveryFee2 = await DeliveryFee.findAll({
                            order: [
                                ['price', 'desc'],
                            ],
                            where: {
                                resturantId:0
                            }
                        });    
                        deliveryFee = getDeliveryFee2[0].price;
                        deliveryExtracharges = getDeliveryFee2[0].extra_charges;
                        distanceFrom = getDeliveryFee2[0].distanceFrom;
                        distanceTo = getDeliveryFee2[0].distanceTo;
                    }
                }
                
           // }
            // requestdata.distance = 8;
            if (requestdata.distance >= distanceTo){
                var user_distance = requestdata.distance-distanceTo
                deliveryFee = (deliveryExtracharges * user_distance) +deliveryFee;

            } 

            
            
            if (getCharges) getCharges.dataValues.deliveryCharge = deliveryFee;
             
            if(Object.keys(getRestaurant).length > 0) {
                getCharges.dataValues.tax = parseFloat(getRestaurant.tax);
                getCharges.dataValues.serviceFeePercentage = getRestaurant.serviceFee;
                getCharges.dataValues.minimumOrder = getRestaurant.minOrderAmount;
                getCharges.dataValues.paymentType = getRestaurant.paymentType;
                getCharges.dataValues.distanceFrom = distanceFrom;
                getCharges.dataValues.distanceTo = distanceTo;
                getCharges.dataValues.isBe = getRestaurant.isBe;
                getCharges.dataValues.distanceLimit = getRestaurant.distanceLimit;
                getCharges.dataValues.latitude = getRestaurant.latitude;
                getCharges.dataValues.longitude = getRestaurant.longitude;
                getCharges.dataValues.isAvailable = getRestaurant.isAvailable;
            }
            getCharges.dataValues.distance = requestdata.distance;

            let settings = await Setting.findAll({                
                order: [
                    ['id', 'DESC'],
                ],
                limit: 1
             });
             
             getCharges.dataValues.pickupServiceFee = settings[0].pickupServiceFee;

            res.status(200).json({
                'status': true,
                'code': 200,
                'message': 'Charges Details.',
                'body': getCharges
            });
            
        } catch(err) {
            console.log(err);
            helper.error(res, err);
        }
    },

    getTax: async (req, res) => {
        try {
            const required = {
                security_key: req.headers.security_key,                
            };
            const non_required = {};

            let requestdata = await helper.vaildObject(required, non_required, res);
            // console.log(req.user);
            // console.log(req.params);
            
            let getCharges = await Setting.findOne({
               where: {
                   id: 1
               },
            });
            if (!getCharges) throw "Tax charges could not be found.";
            // console.log(getCharges);
            
            let responseData = {};
            responseData.tax = getCharges.tax;
            responseData.minimumOrder = getCharges.minimumOrder;
            responseData.serviceFeePercentage = getCharges.serviceFeePercentage;

            res.status(200).json({
                'status': true,
                'code': 200,
                'message': 'Tax Details.',
                'body': responseData
            });
            
        } catch(err) {
            console.log(err);
            helper.error(res, err);
        }
    },

    getTax2: async (req, res) => {
        try {
            const required = {
                security_key: req.headers.security_key,                
            };
            const non_required = {
                restaurantId: req.body.restaurantId
            };

            let requestdata = await helper.vaildObject(required, non_required, res);
            // console.log(req.user);
            // console.log(req.params);
            
            let getCharges = await Setting.findOne({
               where: {
                   id: 1
               },
            });
            if (!getCharges) throw "Tax charges could not be found.";
            // console.log(getCharges);
            
            let responseData = {};
            responseData.tax = getCharges.tax;
            responseData.cartFee = getCharges.cartFee;
            responseData.minimumOrder = getCharges.minimumOrder;
            responseData.serviceFeePercentage = getCharges.serviceFeePercentage;
            responseData.pickupServiceFee = getCharges.pickupServiceFee;
            responseData.serviceFeeDescription = getCharges.serviceFeeDescription;
            responseData.vatFeeDescription = getCharges.vatFeeDescription;
            responseData.tipFeeDescription = getCharges.tipFeeDescription;
            responseData.cartFeeDescription = getCharges.cartFeeDescription;
            responseData.paypalFee = getCharges.paypalFee;
            responseData.paypalFeeDescp = getCharges.paypalFeeDescp;



            if (requestdata.hasOwnProperty('restaurantId')) {
                let getRestaurant = await Restaurant.findOne({
                    where: {
                        id: requestdata.restaurantId
                    },
                });
                getRestaurant = getRestaurant.toJSON(); 
                // console.log(getRestaurant);

                if (Object.keys(getRestaurant).length > 0) {
                    responseData.tax = parseFloat(getRestaurant.tax);   
                    responseData.minimumOrder = getRestaurant.minOrderAmount;
                    responseData.serviceFeePercentage = getRestaurant.serviceFee;
                    responseData.deliveryType = getRestaurant.deliveryType;
                    responseData.paymentType = getRestaurant.paymentType;
                    responseData.isBe = getRestaurant.isBe;
                    responseData.distanceLimit = getRestaurant.distanceLimit;
                    responseData.latitude = getRestaurant.latitude;
                    responseData.longitude = getRestaurant.longitude;
                    responseData.isAvailable = getRestaurant.isAvailable;
                    
          
                }
            }

            res.status(200).json({
                'status': true,
                'code': 200,
                'message': 'Tax Details.',
                'body': responseData
            });
            
        } catch(err) {
            console.log(err);
            helper.error(res, err);
        }
    },
    
    
}
const sequelize = require('sequelize');
const db = require('../db/db');
const models = require('../models');
const helper = require('../config/helper');
const responseHelper = require('../helpers/responseHelper');
const moment = require('moment');
const Restaurant = models.restaurants;
const Category = models.categories;
const Cuisine = models.cuisines;
const User = models.users;
const RestaurantCategory = models.restaurantsCategories;
const RestaurantCuisine = models.restaurantsCuisines;
const RestaurantFavourite = models.restaurantsFavourite;
const RestaurantRating = models.restaurantRatings;
const OrderRating = models.orderRatings;
const Menu = models.menus;
const Item = models.items;
const ItemImage = models.itemImages;
const Promocode = models.promocodes;
const Order = models.orders;
const OrderDetail = models.orderDetails;
const Address = models.addresses;
const Transaction = models.transactions;
const Notifications = models.notifications;
const RideRequest = models.rideRequests;
const DriverLicense = models.driverLicense;
const Driver = models.drivers;
const Tip = models.tips;
const OrderDetailAddons = models.orderDetailAddons;
const MenuItemAddon = models.menuItemAddons;
const AddonCategories = models.addonCategories;
const AssignedRestaurants = models.assignedRestaurants;
const promocodeUses = models.promocodeUses;
const Setting = models.settings;
AssignedRestaurants.belongsTo(User, { foreignKey: 'userId' });

RestaurantCategory.belongsTo(Restaurant, { foreignKey: 'restaurantId' });
RestaurantCategory.belongsTo(Category, { foreignKey: 'categoryId' });

RestaurantCuisine.belongsTo(Restaurant, { foreignKey: 'restaurantId' });
RestaurantCuisine.belongsTo(Cuisine, { foreignKey: 'cuisineId' });

RestaurantFavourite.belongsTo(Restaurant, { foreignKey: 'restaurantId' });
RestaurantFavourite.belongsTo(User, { foreignKey: 'userId' });

RestaurantRating.belongsTo(Restaurant, { foreignKey: 'restaurantId' });
RestaurantRating.belongsTo(User, { foreignKey: 'userId' });

Restaurant.hasMany(Menu, { foreignKey: 'restaurantId' });
Menu.hasMany(Item, { foreignKey: 'menuId' });
Item.hasMany(ItemImage, { foreignKey: 'itemId' });
Order.hasMany(OrderDetail, { foreignKey: 'orderId' });
OrderDetail.hasMany(OrderDetailAddons, { foreignKey: 'orderDetailId' });

RideRequest.belongsTo(Order, { foreignKey: 'orderId' });
RideRequest.belongsTo(User, { foreignKey: 'userId' });
RideRequest.belongsTo(Driver, { foreignKey: 'driverId' });
RideRequest.belongsTo(Restaurant, { foreignKey: 'restaurantId' });

MenuItemAddon.belongsTo(AddonCategories, { foreignKey: 'categoryId' });

// Order.hasMany(Address, { foreignKey: 'addressId' });
// Address.belongsTo(Order, { foreignKey: 'addressId' });
// Order.belongsTo(Address, { foreignKey: 'addressId' });


module.exports = {
  tipsListing: async (req, res) => {
    try {
      const required = {
        security_key: req.headers.security_key,
      }
      const nonRequired = {};
      let requestData = await helper.vaildObject(required, nonRequired, res);
      // console.log(requestData); return false;      

      const tips = await Tip.findAll({
        where: {
          status: 1,
        },
      });
      // console.log(tips);



      res.status(200).json({
        'status': true,
        'code': 200,
        'message': 'Tips Listing.',
        'body': tips
      });

    } catch (err) {
      console.log(err);
      return helper.error(res, err);
      // return responseHelper.onError(res, err)
    }
  },

  applyPromocode: async (req, res) => {
    try {
      const required = {
        security_key: req.headers.security_key,
        promocode: req.body.promocode,
      };
      const nonRequired = {
        restaurantId: req.body.restaurantId,
        amount: req.body.amount,
      };
      let requestData = await helper.vaildObject(required, nonRequired, res);
       //console.log(req.user.id); return false;
     
      const checkPromoID = await Promocode.findOne({
        where: {
          promocode: requestData.promocode,
        },
      });

      if( (checkPromoID !== null) && (checkPromoID.restaurantId == '0')){
       //  console.log('okoko'); return false;
         requestData.restaurantId = 0;
      }
 //console.log(requestData,'rrr'); return false;
      const checkPromo = await Promocode.findOne({
        where: {
          promocode: requestData.promocode,
          restaurantId: requestData.restaurantId,
          isActive: 1,
        },
      });
      // console.log(checkPromo);
      //console.log('minSubtotal=>',checkPromo.minSubtotal,'amount=>',requestData.amount); //return false;

      if (checkPromo == null) throw "Invalid Promocodes.";
      if (parseInt(checkPromo.minSubtotal) > parseInt(requestData.amount)){
        console.log('minSubtotal=>',checkPromo.minSubtotal,'amounkkt=>',requestData.amount); //return false;
        throw checkPromo.message;
      } 
      

      const checkUses = await promocodeUses.findAll({
        attributes: ['promocodeId', [sequelize.fn('count', sequelize.col('promocode_id')), 'usage']],
        where: {
          promocode_id: checkPromo.id,
          userId: req.user.id,
        },
        raw:true
      });
     // console.log(checkUses[0].usage,'countssss',checkPromo.maxNumberUse); return false;

      if (checkUses[0].usage >= checkPromo.maxNumberUse) throw "Maximum usage limit reached.";
      
      
      const promoDate = moment(checkPromo.expiryDate, "YYYY-MM-DD")
        .add(1, "d")
        .unix();
      const todayDate = moment().unix();
      console.log(promoDate, "======>promoDate");
      console.log(todayDate, "======>todayDate");

      if (promoDate < todayDate) throw "This promo code has been expired.";

      res.status(200).json({
        status: true,
        code: 200,
        message: "Promocode applied successfully.",
        body: checkPromo,
      });
    } catch (err) {
      console.log(err);
      return helper.error(res, err);
      // return responseHelper.onError(res, err)
    }
  },

  addOrder: async (req, res) => {
    // console.log('asdfs'); return false;
    try {
      const required = {
        security_key: req.headers.security_key,

        restaurantId: req.body.restaurantId,
        orderType: req.body.orderType,        // 1=>Instant 2=>Scheduled             
        // scheduleDate: req.body.scheduleDate,        
        // scheduleTime: req.body.scheduleTime,        


        totalAmount: req.body.totalAmount,
        tip: req.body.tip,
        deliveryFee: req.body.deliveryFee,
        taxPercentage: req.body.taxPercentage,
        tax: req.body.tax,
        serviceFeePercentage: req.body.serviceFeePercentage,
        serviceFee: req.body.serviceFee,
        netAmount: req.body.netAmount,
        paymentMethod: req.body.paymentMethod,    // 1=>Cash 2=>Paypal 3=>Payout        
        itemsArray: req.body.itemsArray // [{itemId:5, itemName: 'abc, quantity: 2, addons: 'extra chesse with veggies', price: 200}, {item_id:15, quantity: 2, addons: 'extra chesse with veggies', price: 100}]
      }

      if (required.orderType == 2) {
        required['scheduledTimestamp'] = req.body.scheduledTimestamp;
      }


      const nonRequired = {
        addressId: req.body.addressId,
        // scheduledTimestamp: req.body.scheduledTimestamp,
        promoCode: req.body.promoCode,
        promoDiscount: req.body.promoDiscount,
        specialRequest: req.body.specialRequest,
        cartFee: req.body.cartFee,
        isDelivery: req.body.isDelivery, // 0 => no, 1 => delivery
        foodPrice: req.body.foodPrice,
      };

      // if (req.body.hasOwnProperty('promoCode')) {
      //   required['promoDiscount'] = req.body.promoDiscount;
      // } else if (req.body.hasOwnProperty('promoDiscount')) {
      //   required['promoCode'] = req.body.promoCode;        
      // }

      let requestData = await helper.vaildObject(required, nonRequired, res);

      // console.log(req.user); return false;

      let validOrderType = ['1', '2'];
      if (validOrderType.indexOf(requestData.orderType) == -1) {
        throw 'Invalid value in the parameter orderType.';
      }

      if (requestData.hasOwnProperty('isDelivery') && requestData.isDelivery != '') {
        let validDeliveryType = ['0', '1'];
        if (validDeliveryType.indexOf(requestData.isDelivery) == -1) {
          throw 'Invalid value in the parameter isDelivery.';
        }
      }

      let validPaymentMethod = ['1', '2', '3', '4', '5', '6'];
      if (validPaymentMethod.indexOf(requestData.paymentMethod) == -1) {
        throw 'Invalid value in the parameter paymentMethod.';
      }
      // console.log(helper.time()); return false;
      // console.log(helper.generateTransactionNumber()); return false;

      let timestamp = helper.time();
      let orderDate = moment().format('YYYY-MM-DD');
      let scheduledDatetime = moment().format('YYYY-MM-DD HH:mm:ss');
      // console.log(scheduledDatetime); return false;


      requestData.itemsArray = JSON.parse(requestData.itemsArray);
      // console.log(requestData.itemsArray); return false;

      let restaurantExists = await Restaurant.findOne({
        where: { id: requestData.restaurantId },
      });
      // console.log(restaurantExists); return false;

      if (!restaurantExists) throw 'Invalid value in the parameter restaurantId.';
      restaurantExists = restaurantExists.toJSON();


      let addressExists = {};

      if (requestData.isDelivery == 0) {

        addressExists = await Address.findOne({
          where: {
            id: requestData.addressId,
            userId: req.user.id
          },
        });
        if (!addressExists) throw 'Invalid value in the parameter addressId.';
        addressExists = addressExists.toJSON();
      }

      let addOrderObj = {};
      addOrderObj = { ...requestData };
      delete addOrderObj['security_key'];
      delete addOrderObj['itemsArray'];
      addOrderObj['userId'] = req.user.id;
      addOrderObj['status'] = 1;
      addOrderObj['orderDate'] = orderDate;
      addOrderObj['scheduledDatetime'] = scheduledDatetime;

      addOrderObj['paymentStatus'] = 0;

      // if (requestData.paymentMethod == 2) {  // paypment via PayPal
      //   addOrderObj['paymentStatus'] = 0; // if payment via paypal then paymentStatus is not done
      // } else {
      //   addOrderObj['paymentStatus'] = 2; // else payment status is pending
      // }

      if (requestData.paymentMethod == 1) {  // Cash
        addOrderObj['transactionNo'] = helper.generateTransactionNumber();
      }
      // console.log(addOrderObj); return false;

      let addOrder = await Order.create(addOrderObj);
      addOrder = addOrder.toJSON();
      // console.log(addOrder); return false;

      // Adding Order Detail
      let addOrderDetailArray = [];

      for (i in requestData.itemsArray) {
        requestData.itemsArray[i].orderId = addOrder.id;
        // requestData.itemsArray[i].restaurantId = requestData.restaurantId;
        let tempObj = { ...requestData.itemsArray[i] };
        delete tempObj['addons'];
        addOrderDetailArray.push(tempObj);
        // console.log(tempObj);
      }
      // console.log(addOrderDetailArray);
      // return false;

      let addOrderDetail = await OrderDetail.bulkCreate(addOrderDetailArray);

      if (addOrderDetail.length > 0) {
        let addOrderDetailAddonArray = [];

        addOrderDetail = addOrderDetail.map((orderDetail, index) => {
          orderDetail.toJSON();

          let addOrderDetailAddonObj = {};

          if (requestData.itemsArray[index].addons.length > 0) {

            requestData.itemsArray[index].addons.forEach(addon => {
              addon.orderDetailId = orderDetail.id
              addOrderDetailAddonArray.push(addon);
            });
          }
          // console.log(requestData.itemsArray[index]);
        });
        // console.log(addOrderDetailAddonArray); return false;
        // console.log(addOrderDetailAddonArray, '===================>addOrderDetailAddonArray'); return;
        let addOrderDetailAddons = await OrderDetailAddons.bulkCreate(addOrderDetailAddonArray);
      }

      // addOrderDetail = addOrderDetail.toJSON();
      // console.log(addOrderDetail);

      // console.log('before');
      // console.log(addOrderDetail);
      // console.log('after');

      let addTransactionObj = {};
      addTransactionObj['orderId'] = addOrder.id;
      addTransactionObj['userId'] = addOrder.userId;
      addTransactionObj['transactionNo'] = addOrder.transactionNo;
      addTransactionObj['paymentMethod'] = addOrder.paymentMethod;
      addTransactionObj['amount'] = addOrder.netAmount;
      addTransactionObj['paymentStatus'] = addOrder.paymentStatus;
      let addTransaction = await Transaction.create(addTransactionObj);
      addTransaction = addTransaction.toJSON();

      let addNotificationObj = {};
      addNotificationObj['senderId'] = req.user.id;
      addNotificationObj['receiverId'] = requestData.restaurantId;
      addNotificationObj['senderType'] = 1;
      addNotificationObj['receiverType'] = 3;
      addNotificationObj['message'] = `${req.user.username} has added an order.`;
      addNotificationObj['code'] = 1;
      let addNotification = await Notifications.create(addNotificationObj);

      let updateOrder = await Order.update({
        'transactionId': addTransaction.id
      },
        { returning: true, where: { id: addOrder.id } });

      let addedOrder = await Order.findOne({
        where: {
          id: addOrder.id,
        },
        include: [
          {
            model: models.orderDetails,
            required: false,
            include: [
              {
                model: OrderDetailAddons,
                required: false,
              }
            ],
          }
        ],

      });

      addedOrder.address = addressExists;
      addedOrder.dataValues.userEmail = req.user.email;
      // console.log(addedOrder);
      // console.log(req.user);
      // console.log(req.user.email);

      addedOrder = addedOrder.toJSON();

      // if (addedOrder.orderDetails.length > 0) {
      addedOrder.orderDetails = addedOrder.orderDetails.map(orderDetail => {
        orderDetail.categories = [];
        let categoriesObj = {};

        if (orderDetail.orderDetailAddons.length > 0) {
          orderDetail.orderDetailAddons.map(orderDetailAddon => {
            if (categoriesObj.hasOwnProperty(orderDetailAddon.addonCategory)) {
              categoriesObj[orderDetailAddon.addonCategory].addOnArray.push({
                addon: orderDetailAddon.addon,
                price: orderDetailAddon.price,
                quantity: orderDetailAddon.quantity
              });
            } else {
              // categoriesObj[orderDetailAddon.addonCategory] = orderDetailAddon;
              categoriesObj[orderDetailAddon.addonCategory] = {};
              categoriesObj[orderDetailAddon.addonCategory].id = orderDetailAddon.addonId;
              categoriesObj[orderDetailAddon.addonCategory].categoryName = orderDetailAddon.addonCategory;
              categoriesObj[orderDetailAddon.addonCategory].addOnArray = [];
              categoriesObj[orderDetailAddon.addonCategory].addOnArray.push({
                addon: orderDetailAddon.addon,
                price: orderDetailAddon.price,
                quantity: orderDetailAddon.quantity
              });
            }
          })
        }
        // orderDetail.categories = Object.values(categoriesObj);
        orderDetail.categories = Object.values(categoriesObj);
        delete orderDetail.orderDetailAddons;
        return orderDetail;
      });
      // }

      // let mail = {
      //   from: 'admin@BahamaEats.com',
      //   to: req.user.email,
      //   subject: 'BahamaEats | Order Receipt',
      //   template: 'orderReceipt',
      //   data: {
      //     order: addedOrder,
      //     orderDetails: addedOrder.orderDetails,
      //     isAddress: Object.keys(addressExists).length > 0,
      //     address: addressExists,
      //     restaurant: restaurantExists,
      //   },
      // };
      // helper.sendTemplateMail(mail);


      if (restaurantExists.email.length > 0) {
        const restaurantEmail = restaurantExists.email;
        // const styleBorder = "border: 1px solid #b3b3b3; padding: 2px;";

        // let html = '';        
        // html += `&nbsp;&nbsp;&nbsp;You have a new order.`;
        // html += '<br/>';
        // html += '<br/>';
        // html += '<b>Order Details:</b>';
        // html += '<table style="border: 1px solid #b3b3b3">';
        //   html += '<tr>';
        //     html += `<th align="center" style="${styleBorder}">S.No.</th>`;
        //     html += `<th align="center" style="${styleBorder}">Item</th>`;
        //     html += `<th align="center" style="${styleBorder}">Item Description</th>`;
        //     html += `<th align="center" style="${styleBorder}">Quantity</th>`;
        //     html += `<th align="center" style="${styleBorder}">Price</th>`;
        //     html += `<th align="center" style="${styleBorder}">Categories</th>`;
        //   html += "</tr>";

        // const orderDetails = addedOrder.orderDetails;

        // for (let i in orderDetails) {
        //   const orderDetail = orderDetails[i];

        //   html += '<tr>';
        //     html += `<td align="center" style="${styleBorder}">${parseInt(i)+1}</td>`;
        //     html += `<td align="center" style="${styleBorder}">${orderDetail.itemName}</td>`;
        //     html += `<td align="center" style="${styleBorder}">${orderDetail.itemDescription}</td>`;
        //     html += `<td align="center" style="${styleBorder}">${orderDetail.quantity}</td>`;
        //     html += `<td align="center" style="${styleBorder}">$${orderDetail.price}</td>`;
        //     html += `<td align="center" style="${styleBorder}">`
        //     if (orderDetail.categories.length > 0) {              
        //       html += `<table style="width: 100%">`;
        //         html += `<tr>`;
        //           html += `<th align="center" style="${styleBorder}">Category Name</th>`;
        //           html += `<th align="center" style="${styleBorder}">Addon</th>`;
        //           html += `<th align="center" style="${styleBorder}">Price</th>`;
        //         html += `</tr>`;
        //       for (let j in orderDetail.categories) {                  
        //         const category = orderDetail.categories[j];
        //         if (category.addOnArray.length > 0) {                  
        //           for (let k in category.addOnArray) {
        //             const addon = category.addOnArray[k];

        //         html += `<tr>`;
        //           html += `<td align="center" style="${styleBorder}">${category.categoryName}</td>`;
        //           html += `<td align="center" style="${styleBorder}">${addon.addon}</td>`;
        //           html += `<td align="center" style="${styleBorder}">$${addon.price}</td>`;
        //         html += `</tr>`;

        //           }
        //         }
        //       }
        //       html += `</table>`;
        //     }
        //     html += `</td>`;
        //   html += "</tr>";
        // }
        // html += "</table>"

        // if (addedOrder.specialRequest.length > 0) {
        //   html += '<br/>';
        //   html += `Special Request: ${addedOrder.specialRequest}`;
        //   html += '<br/>';
        // }

        // html += '<br/>';
        // html += 'Regards,<br/>';
        // html += 'Bahama Eats';

        // let htmlRestaurant = `Hello ${restaurantExists.name},<br/>` + html;

        // let mail = {
        //     from: 'orders@bahamaeats.com <test978056@gmail.com>',
        //     to: restaurantEmail,
        //     subject: 'BahamaEats | New Order',
        //     html: htmlRestaurant
        // }

        // helper.sendMail(mail);

        // let assignedRestaurant = await AssignedRestaurants.findOne({
        //   where: {
        //     restaurantId: restaurantExists.id
        //   },
        //   include: [
        //     {
        //       model: User,  
        //       required: false,
        //       attributes: [
        //         'id',
        //         'firstName',
        //         'lastName',
        //         'email'
        //       ]
        //     }
        //   ],
        // });

        // if (assignedRestaurant) {
        //   assignedRestaurant = assignedRestaurant.toJSON();

        //   if ( requestData.isDelivery == 0 && Object.keys(assignedRestaurant).length > 0 && assignedRestaurant.hasOwnProperty('user') && Object.keys(assignedRestaurant.user).length > 0 ) {
        //     let htmlDispatcher = `Hello ${assignedRestaurant.user.firstName},<br/>` + html;

        //     let mailToDispatcher = {
        //       from: 'orders@bahamaeats.com <test978056@gmail.com>',
        //       to: assignedRestaurant.user.email,
        //       subject: 'BahamaEats | New Order',
        //       html: htmlDispatcher
        //     }

        //     helper.sendMail(mailToDispatcher);
        //   }
        // }
        // console.log(restaurantEmail); return;
      }

      res.status(200).json({
        'status': true,
        'code': 200,
        'message': 'Order added successfully.',
        'body': addedOrder
      });

    } catch (err) {
      // console.log(err);
      return helper.error(res, err);
      // return responseHelper.onError(res, err)
    }
  },

  sendOrderReceipt: async (req, res) => {
    try {
      const required = {
        security_key: req.headers.security_key,
        orderId: req.body.orderId,
      };

      const nonRequired = {};

      let requestData = await helper.vaildObject(required, nonRequired, res);

      // console.log(req.user, '==========>req.user');
       //return;



      // updating orderPlacedTimestamp
      await Order.update(
        {
          'paymentStatus': 1,
          'orderPlacedTimestamp': moment().utc().unix(),
        },
        { returning: true, where: { id: requestData.orderId } }
      );



      let addedOrder = await Order.findOne({
        where: {
          id: requestData.orderId,
        },
        include: [
          {
            model: Restaurant,
            required: false,
          },
          {
            model: models.orderDetails,
            required: false,
            include: [
              {
                model: OrderDetailAddons,
                required: false,
              },
            ],
          },
        ],
      }).then(data => data ? data.toJSON() : data);
      // console.log(addedOrder.promoCode, '=====+>addedOrder');
      // return;
    if(addedOrder.promoCode){ 
     const checkPromoID = await Promocode.findOne({
        where: {
          promocode: addedOrder.promoCode,
        },
      });

      if((checkPromoID !== null) && (checkPromoID.restaurantId == '0')){
         requestData.restaurantId = 0;
      }else{
        requestData.restaurantId = addedOrder.restaurantId;
      }
      const checkPromo = await Promocode.findOne({
        where: {
          promocode: addedOrder.promoCode,
          restaurantId: requestData.restaurantId,
        },
      });
      const addPromocodeUses = {
        userId: req.user.id,
        promocodeId: checkPromo.id,
        orderId: requestData.orderId,
      };
      const promocodeUse = await promocodeUses.create(addPromocodeUses);
       // console.log('addressId=>',addedOrder.addressId,'userId=>',req.user.id); return false;
    }

      let addressExists = {};

      if (addedOrder.isDelivery == 0) {
        addressExists = await Address.findOne({
          where: {
            id: addedOrder.addressId,
            userId: req.user.id,
          },
        });
        if (!addressExists) throw "Invalid value in the parameter addressId.";
        addressExists = addressExists.toJSON();
      }


      addedOrder.address = addressExists;
      addedOrder.userEmail = req.user.email;
      // console.log(addedOrder);
      // console.log(req.user);
      // console.log(req.user.email);

      // addedOrder = addedOrder.toJSON();

      // if (addedOrder.orderDetails.length > 0) {
      addedOrder.orderDetails = addedOrder.orderDetails.map((orderDetail) => {
        orderDetail.categories = [];
        let categoriesObj = {};

        if (orderDetail.orderDetailAddons.length > 0) {
          orderDetail.orderDetailAddons.map((orderDetailAddon) => {
            if (categoriesObj.hasOwnProperty(orderDetailAddon.addonCategory)) {
              categoriesObj[orderDetailAddon.addonCategory].addOnArray.push({
                addon: orderDetailAddon.addon,
                price: orderDetailAddon.price,
                quantity: orderDetailAddon.quantity,
              });
            } else {
              // categoriesObj[orderDetailAddon.addonCategory] = orderDetailAddon;
              categoriesObj[orderDetailAddon.addonCategory] = {};
              categoriesObj[orderDetailAddon.addonCategory].id =
                orderDetailAddon.addonId;
              categoriesObj[orderDetailAddon.addonCategory].categoryName =
                orderDetailAddon.addonCategory;
              categoriesObj[orderDetailAddon.addonCategory].addOnArray = [];
              categoriesObj[orderDetailAddon.addonCategory].addOnArray.push({
                addon: orderDetailAddon.addon,
                price: orderDetailAddon.price,
                quantity: orderDetailAddon.quantity,
              });
            }
          });
        }
        // orderDetail.categories = Object.values(categoriesObj);
        orderDetail.categories = Object.values(categoriesObj);
        delete orderDetail.orderDetailAddons;
        return orderDetail;
      });
      // }

      restaurantExists = addedOrder.restaurant;
      console.log(restaurantExists, '========+>restaurant');

      const settings = await Setting.findOne();

      const paypalFee = settings.paypalFee;

      let mail = {
        from: 'admin@BahamaEats.com',
        to: req.user.email,
        subject: 'BahamaEats | Order Receipt',
        template: 'orderReceipt',
        data: {
          order: addedOrder,
          orderDetails: addedOrder.orderDetails,
          isAddress: Object.keys(addressExists).length > 0,
          address: addressExists,
          restaurant: restaurantExists,
          paypalFee
        },
      };
      helper.sendTemplateMail(mail);

      return res.status(200).json({
        status: true,
        code: 200,
        message: "Order Receipt sent successfully.",
        body: {},
      });
    } catch (err) {
      // console.log(err);
      return helper.error(res, err);
      // return responseHelper.onError(res, err)
    }
  },

  ordersListing: async (req, res) => {
    try {
      const required = {
        security_key: req.headers.security_key,

      }

      const nonRequired = {

      };

      let requestData = await helper.vaildObject(required, nonRequired, res);

      // console.log(req.user); return false;


      // console.log(helper.time()); return false;
      // console.log(helper.generateTransactionNumber()); return false;

      let orders = await Order.findAll({
        where: {
          userId: req.user.id,
          paymentStatus: {
            $ne: 0
          }
        },
        order: [
          ['id', 'desc'],
          // [ models.menus , { model: models.items }, 'price', 'desc' ]
        ],
        attributes: {
          include: [
            [sequelize.literal('IFNULL((SELECT AVG(order_ratings.rating) FROM order_ratings WHERE order_ratings.order_id=orders.id order by id desc limit 1),0)'), 'orderRating'],
            [sequelize.literal(`IFNULL((SELECT order_ratings.rating FROM order_ratings WHERE order_ratings.order_id=orders.id && order_ratings.user_id=${req.user.id} order by id desc limit 1),0)`), 'myOrderRating'],
            [sequelize.literal(`IFNULL((SELECT order_ratings.comment FROM order_ratings WHERE order_ratings.order_id=orders.id && order_ratings.user_id=${req.user.id} order by id desc limit 1),0)`), 'myOrderRatingComment'],
          ]
        },
        include: [
          {
            model: models.orderDetails,
            required: false,
            include: [
              {
                model: OrderDetailAddons,
                required: false,
              }
            ],
          },
          {
            model: Restaurant,
            required: false,
          }
        ],
      });
      // console.log(orders); return false;
      // console.log(addedOrder);
      // console.log(req.user);
      // console.log(req.user.email);

      ordersListing = orders.map(async order => {
        order = order.toJSON();
        // console.log(order); return false;        
        // addedOrder.address = addressExists;
        order.userEmail = req.user.email;

        const orderAddress = await db.query(`SELECT * FROM addresses WHERE id=?`, {
          replacements: [order.addressId],
          // model: UserDetails,
          model: Address,
          mapToModel: true,
          type: db.QueryTypes.SELECT
        });
        // console.log(orderAddress); return false;

        let rideRequest = await RideRequest.findOne({
          where: {
            orderId: order.id,
          },
          order: [
            ['id', 'DESC']
          ],
          include: [
            {
              model: Driver,
              required: false,
            }]
        });


        order.restaurantStatus = order.restaurant.status;
        delete order.restaurant;
        order.address = orderAddress[0];
        order.driver = {};
        order.driver.orderRating = order.orderRating;
        order.rideDetails = {};

        order.isDriverAssigned = 0;
        if (rideRequest) {
          order.isDriverAssigned = 1;
          rideRequest = rideRequest.toJSON();
          // console.log(rideRequest);
          if (rideRequest.driver) {
            order.driver = rideRequest.driver;
            order.driver.orderRating = order.orderRating;
            delete rideRequest['driver'];
            order.rideDetails = rideRequest;
          }
        }

        order.orderDetails = order.orderDetails.map(orderDetail => {
          orderDetail.categories = [];
          let categoriesObj = {};

          if (orderDetail.orderDetailAddons.length > 0) {
            orderDetail.orderDetailAddons.map(orderDetailAddon => {
              // console.log(orderDetailAddon);
              if (categoriesObj.hasOwnProperty(orderDetailAddon.addonCategory)) {
                categoriesObj[orderDetailAddon.addonCategory].addOnArray.push({
                  addon: orderDetailAddon.addon,
                  price: orderDetailAddon.price,
                  quantity: orderDetailAddon.quantity
                });
              } else {
                // categoriesObj[orderDetailAddon.addonCategory] = orderDetailAddon;
                categoriesObj[orderDetailAddon.addonCategory] = {};
                categoriesObj[orderDetailAddon.addonCategory].id = orderDetailAddon.addonId;
                categoriesObj[orderDetailAddon.addonCategory].categoryName = orderDetailAddon.addonCategory;
                categoriesObj[orderDetailAddon.addonCategory].addOnArray = [];
                categoriesObj[orderDetailAddon.addonCategory].addOnArray.push({
                  addon: orderDetailAddon.addon,
                  price: orderDetailAddon.price,
                  quantity: orderDetailAddon.quantity
                });
              }
            })
          }
          // orderDetail.categories = Object.values(categoriesObj);
          orderDetail.categories = Object.values(categoriesObj);
          delete orderDetail.orderDetailAddons;
          return orderDetail;
        });
        // console.log(order); return false;
        return order
      });

      let results = await Promise.all(ordersListing)

      return res.status(200).json({
        'status': true,
        'code': 200,
        'message': 'Orders Listing.',
        'body': results
      });


      // res.status(200).json({
      //   'status': true,
      //   'code': 200,
      //   'message': 'Orders Listing.',
      //   'body': ordersListing
      // });

    } catch (err) {
      // console.log(err);
      return helper.error(res, err);
      // return responseHelper.onError(res, err)
    }
  },

  getOrderDetails: async (req, res) => {
    try {
      const required = {
        security_key: req.headers.security_key,
        orderId: req.body.orderId,

      }

      const nonRequired = {

      };

      let requestData = await helper.vaildObject(required, nonRequired, res);

      // console.log(req.user); return false;


      // console.log(helper.time()); return false;
      // console.log(helper.generateTransactionNumber()); return false;

      let order = await Order.findOne({
        where: {
          id: requestData.orderId,
        },
        include: [
          {
            model: models.orderDetails,
            required: false,
            include: [
              {
                model: OrderDetailAddons,
                required: false,
              }
            ],
          }
        ],

      });
      // console.log(addedOrder);
      // console.log(req.user);
      // console.log(req.user.email);

      if (!order) throw 'Invalid value in the parameter orderId';

      order = order.toJSON();
      // console.log(order);
      // addedOrder.address = addressExists;
      order.userEmail = req.user.email;

      const orderAddress = await db.query(`SELECT * FROM addresses WHERE id=?`, {
        replacements: [order.addressId],
        // model: UserDetails,
        model: Address,
        mapToModel: true,
        type: db.QueryTypes.SELECT
      });
      // console.log(orderAddress); return false;

      let rideRequest = await RideRequest.findOne({
        where: {
          orderId: order.id
        },
        include: [
          {
            model: Driver,
            required: false,
          }]
      });
      order.address = orderAddress[0];
      order.driver = {};

      order.isDriverAssigned = 0;
      if (rideRequest) {
        order.isDriverAssigned = 1;
        rideRequest = rideRequest.toJSON();
        // console.log(rideRequest);
        if (rideRequest.driver) {
          order.driver = rideRequest.driver;
        }
      }

      order.orderDetails = order.orderDetails.map(orderDetail => {
        orderDetail.categories = [];
        let categoriesObj = {};

        if (orderDetail.orderDetailAddons.length > 0) {
          orderDetail.orderDetailAddons.map(orderDetailAddon => {
            if (categoriesObj.hasOwnProperty(orderDetailAddon.addonCategory)) {
              categoriesObj[orderDetailAddon.addonCategory].addOnArray.push({
                addon: orderDetailAddon.addon,
                price: orderDetailAddon.price
              });
            } else {
              // categoriesObj[orderDetailAddon.addonCategory] = orderDetailAddon;
              categoriesObj[orderDetailAddon.addonCategory] = {};
              categoriesObj[orderDetailAddon.addonCategory].id = orderDetailAddon.addonId;
              categoriesObj[orderDetailAddon.addonCategory].categoryName = orderDetailAddon.addonCategory;
              categoriesObj[orderDetailAddon.addonCategory].addOnArray = [];
              categoriesObj[orderDetailAddon.addonCategory].addOnArray.push({
                addon: orderDetailAddon.addon,
                price: orderDetailAddon.price
              });
            }
          })
        }
        // orderDetail.categories = Object.values(categoriesObj);
        orderDetail.categories = Object.values(categoriesObj);
        delete orderDetail.orderDetailAddons;
        return orderDetail;
      });


      return res.status(200).json({
        'status': true,
        'code': 200,
        'message': 'Order Details.',
        'body': order
      });


      // res.status(200).json({
      //   'status': true,
      //   'code': 200,
      //   'message': 'Orders Listing.',
      //   'body': ordersListing
      // });

    } catch (err) {
      // console.log(err);
      return helper.error(res, err);
      // return responseHelper.onError(res, err)
    }
  },

  paymentSetting: async (req, res) => {
    try {
      const required = {
        security_key: req.headers.security_key,
      }

      const nonRequired = {

      };

      let requestData = await helper.vaildObject(required, nonRequired, res);

      const paymentSetting = await models.payment_setting.findOne();

      res.status(200).json({
        'status': true,
        'code': 200,
        'message': 'Payment setting fetched successfully.',
        'body': paymentSetting
      });

    } catch (err) {
      // console.log(err);
      return helper.error(res, err);
      // return responseHelper.onError(res, err)
    }
  },

  paymentviaPaypal: async (req, res) => {
    try {
      const required = {
        security_key: req.headers.security_key,
        orderId: req.body.orderId,
        transactionNo: req.body.transactionNo,
      }

      const nonRequired = {

      };

      let requestData = await helper.vaildObject(required, nonRequired, res);

      let timestamp = helper.time();

      let orderExists = await Order.findOne({
        where: {
          id: requestData.orderId,
          userId: req.user.id
        },
      });
      if (!orderExists) throw 'Invalid value in the parameter orderId.';
      orderExists = orderExists.toJSON()
      if (orderExists.paymentMethod != 2) throw "Payment method of this order is not Paypal.";

      let addressExists = await Address.findOne({
        where: {
          id: orderExists.addressId,
        },
      });

      let transactionExists = await Transaction.findOne({
        where: {
          orderId: requestData.orderId,
          userId: req.user.id
        },
      });
      if (!transactionExists) throw 'Transaction for this order was not generated.';
      transactionExists = transactionExists.toJSON()
      // console.log(requestData.transactionNo); return false;
      // console.log(transactionExists); return false;
      // console.log(transactionExists.id); return false;

      let updateTransaction = await Transaction.update({
        'transactionNo': requestData.transactionNo,
        'paymentStatus': 1
      },
        { returning: true, where: { id: transactionExists.id } });
      // console.log(updateTransaction); return false;

      let updateOrderObj = {};
      updateOrderObj['transactionNo'] = requestData.transactionNo;
      updateOrderObj['paymentStatus'] = 1;
      updateOrderObj['paymentMethod'] = 2;
      // console.log(updateOrderObj);

      let updateOrder = await Order.update(updateOrderObj,
        { returning: true, where: { id: orderExists.id } });


      let updatedOrder = await Order.findOne({
        where: {
          id: orderExists.id,
        },
        include: [
          {
            model: models.orderDetails,
            required: false,
          }
        ],
      });
      updatedOrder.address = addressExists;
      updatedOrder.dataValues.userEmail = req.user.email;
      // console.log(addedOrder);
      // console.log(req.user);
      // console.log(req.user.email);

      res.status(200).json({
        'status': true,
        'code': 200,
        'message': 'Payment done successfully.',
        'body': updatedOrder
      });

    } catch (err) {
      // console.log(err);
      return helper.error(res, err);
      // return responseHelper.onError(res, err)
    }
  },

  addOrderRating: async (req, res) => {
    try {
      const required = {
        security_key: req.headers.security_key,
        orderId: req.body.orderId,
        rating: req.body.rating,
      }
      const nonRequired = {
        comment: req.body.comment
      };
      let requestData = await helper.vaildObject(required, nonRequired, res);

      const orderExists = await Order.findOne({
        where: {
          id: requestData.orderId,
        },
      });

      if (orderExists == null) {
        throw "Invalid value in the parameter orderId.";
      }
      // console.log(orderExists); return false;

      const deletePreviousOrderRating = await OrderRating.destroy({
        where: {
          orderId: requestData.orderId,
          userId: req.user.id
        }
      });

      const addOrderRatingData = {
        userId: req.user.id,
        orderId: requestData.orderId,
        restaurantId: orderExists.dataValues.restaurantId,
        rating: requestData.rating,
        comment: requestData.comment,
      }
      // console.log(addOrderRatingData); return false;

      const addOrderRating = await OrderRating.create(addOrderRatingData);

      // Uploading photo in the /public/images/users folder
      let image = "";
      // console.log(req.files.image); return false;
      if (req.files && req.files.image) {
        image = helper.fileUpload(req.files.image, 'users');
        let upOrder = await OrderRating.update({ image: image },
          { returning: true, where: { id: addOrderRating.dataValues.id } });

        // console.log(up_user);
      }



      const addedOrderRating = await OrderRating.findOne({
        where: {
          id: addOrderRating.dataValues.id
        },
      });

      addedOrderRating.image = req.protocol + '://' + req.get('host') + '/images/users/' + addedOrderRating.image;

      return res.status(200).json({
        'status': true,
        'code': 200,
        'message': 'Restaurant Rating added Successfully.',
        'body': addedOrderRating
      });

    } catch (err) {
      console.log(err);
      helper.error(res, err);
    }
  },

  getRestaurantOrderRatings: async (req, res) => {
    try {
      const required = {
        security_key: req.headers.security_key,
        restaurantId: req.body.restaurantId,
      }
      const nonRequired = {};
      let requestData = await helper.vaildObject(required, nonRequired, res);

      // console.log(orderExists); return false;

      let responseData = {};

      const total_users = await db.query(`SELECT * FROM restaurant_ratings WHERE restaurant_id=? GROUP BY user_id`, {
        replacements: [requestData.restaurantId],
        // model: UserDetails,
        model: OrderRating,
        mapToModel: true,
        type: db.QueryTypes.SELECT
      });
      const avg_rating = await db.query(`SELECT AVG(rating) as rating_count  FROM restaurant_ratings WHERE restaurant_id=?`, {
        replacements: [requestData.restaurantId],
        // model: UserDetails,
        model: OrderRating,
        mapToModel: true,
        type: db.QueryTypes.SELECT
      });
      const one_star_order_ratings = await db.query(`SELECT count(rating) as rating_count  FROM restaurant_ratings WHERE restaurant_id=? && rating=1`, {
        replacements: [requestData.restaurantId],
        // model: UserDetails,
        model: OrderRating,
        mapToModel: true,
        type: db.QueryTypes.SELECT
      });
      const two_star_order_ratings = await db.query(`SELECT count(rating) as rating_count  FROM restaurant_ratings WHERE restaurant_id=? && rating=2`, {
        replacements: [requestData.restaurantId],
        // model: UserDetails,
        model: OrderRating,
        mapToModel: true,
        type: db.QueryTypes.SELECT
      });
      const three_star_order_ratings = await db.query(`SELECT count(rating) as rating_count  FROM restaurant_ratings WHERE restaurant_id=? && rating=3`, {
        replacements: [requestData.restaurantId],
        // model: UserDetails,
        model: OrderRating,
        mapToModel: true,
        type: db.QueryTypes.SELECT
      });
      const four_star_order_ratings = await db.query(`SELECT count(rating) as rating_count  FROM restaurant_ratings WHERE restaurant_id=? && rating=4`, {
        replacements: [requestData.restaurantId],
        // model: UserDetails,
        model: OrderRating,
        mapToModel: true,
        type: db.QueryTypes.SELECT
      });
      const five_star_order_ratings = await db.query(`SELECT count(rating) as rating_count  FROM restaurant_ratings WHERE restaurant_id=? && rating=5`, {
        replacements: [requestData.restaurantId],
        // model: UserDetails,
        model: OrderRating,
        mapToModel: true,
        type: db.QueryTypes.SELECT
      });

      // console.log(one_star_order_ratings);

      responseData['total_users'] = total_users.length;
      responseData['avg_rating'] = avg_rating[0].dataValues.rating_count;
      responseData['one_star_order_ratings'] = one_star_order_ratings[0].dataValues.rating_count;
      responseData['two_star_order_ratings'] = two_star_order_ratings[0].dataValues.rating_count;
      responseData['three_star_order_ratings'] = three_star_order_ratings[0].dataValues.rating_count;
      responseData['four_star_order_ratings'] = four_star_order_ratings[0].dataValues.rating_count;
      responseData['five_star_order_ratings'] = five_star_order_ratings[0].dataValues.rating_count;

      return res.status(200).json({
        'status': true,
        'code': 200,
        'message': 'Restaurant Order Ratings.',
        'body': responseData
      });

    } catch (err) {
      console.log(err);
      helper.error(res, err);
    }
  },

  jobHistory: async (req, res) => {
    try {
      const required = {
        security_key: req.headers.security_key,
      }
      const nonRequired = {};
      let requestData = await helper.vaildObject(required, nonRequired, res);
      // console.log(req.user); return false;
      // console.log(requestData); return false;

      let checkLicense = await DriverLicense.findOne({
        where: { driverId: req.user.id },
      });
      // console.log(checkLicense); return false;

      let responseData = {};
      responseData.upComingJobHistory = {};
      responseData.pastJobHistory = [];



      let upComingJobHistory = await RideRequest.findOne({
        where: {
          driverId: req.user.id,
          rideStatus: {
            $in: [1, 2]
          }
        },
        order: [['id', 'DESC']],
        include: [{
          model: Order,
          where: {
            // status: 1
          },
          attributes: Object.keys(Order.attributes).concat([
            [sequelize.literal('IFNULL((SELECT AVG(order_ratings.rating) FROM order_ratings WHERE order_ratings.order_id=order.id),0)'), 'orderRating']
          ])
        }]
      });

      // upComingJobHistory = upComingJobHistory.map(rideRequest => {
      //   rideRequest = rideRequest.toJSON();
      //   rideRequest.vehicle = (checkLicense) ? checkLicense.licenseType : '';
      //   rideRequest.rating = 0;
      //   return rideRequest;        
      // })

      // console.log(upComingJobHistory);

      if (upComingJobHistory) {

        upComingJobHistory = upComingJobHistory.toJSON();
        upComingJobHistory.vehicle = (checkLicense) ? checkLicense.licenseType : '';
        upComingJobHistory.rating = 0;
        // console.log(upComingJobHistory); return false;
        responseData.upComingJobHistory = upComingJobHistory;
      }

      let pastJobHistory = await RideRequest.findAll({
        where: {
          driverId: req.user.id,
          rideStatus: 3
        },
        order: [['id', 'DESC']],
        include: [{
          model: Order,
          where: {
            // status: 3
          },
          attributes: Object.keys(Order.attributes).concat([
            [sequelize.literal('IFNULL((SELECT AVG(order_ratings.rating) FROM order_ratings WHERE order_ratings.order_id=order.id),0)'), 'orderRating']
          ])
        }]
      });
      // console.log(pastJobHistory); return false;

      if (pastJobHistory) {

        pastJobHistory = pastJobHistory.map(rideRequest => {
          rideRequest = rideRequest.toJSON();
          rideRequest.vehicle = (checkLicense) ? checkLicense.licenseType : '';
          rideRequest.rating = 0;
          return rideRequest;
        })
        // console.log(pastJobHistory); return false;
        responseData.pastJobHistory = pastJobHistory;
      }


      return res.status(200).json({
        'status': true,
        'code': 200,
        'message': 'Job History.',
        'body': responseData
      });

    } catch (err) {
      console.log(err);
      helper.error(res, err);
    }
  },

  jobHistoryDetails: async (req, res) => {
    try {
      const required = {
        security_key: req.headers.security_key,
        jobHistoryId: req.body.jobHistoryId,
      }
      const nonRequired = {};
      let requestData = await helper.vaildObject(required, nonRequired, res);
      // console.log(requestData); return false;
      // console.log(req.user); return false;

      let checkLicense = await DriverLicense.findOne({
        where: { driverId: req.user.id },
      });
      // console.log(checkLicense); return false;

      let jobHistoryDetail = await RideRequest.findOne({
        where: {
          id: requestData.jobHistoryId,
          driverId: req.user.id,
        },
        include: [{
          model: Order,
          required: false,
          where: {
            // status: 1
          },
          include: [{
            model: OrderDetail,
            required: false,
          },
          ]
        },
        {
          model: Restaurant,
          required: false,
          // where: {
          // }
        }],
      });
      // console.log(jobHistoryDetail);

      if (!jobHistoryDetail) {
        throw 'Invalid value in the parameter jobHistoryId.';
      }

      let orderAddress = {};

      if (jobHistoryDetail && jobHistoryDetail.order) {
        orderAddress = await Address.findOne({
          where: { id: jobHistoryDetail.order.addressId },
        });
      } else {

      }
      // console.log(jobHistoryDetail.order.addressId); return false;

      jobHistoryDetail.dataValues.vehicle = (checkLicense) ? checkLicense.licenseType : '';
      jobHistoryDetail.dataValues.fromAddress = (jobHistoryDetail.restaurant && jobHistoryDetail.restaurant.address) ? jobHistoryDetail.restaurant.address : '';
      jobHistoryDetail.dataValues.ToAddress = (orderAddress) ? orderAddress.address : '';


      // let responseData = {};
      // responseData.upComingJobHistory = upComingJobHistory;
      // responseData.pastJobHistory = pastJobHistory;

      return res.status(200).json({
        'status': true,
        'code': 200,
        'message': 'Job History Details.',
        'body': jobHistoryDetail
      });

    } catch (err) {
      console.log(err);
      helper.error(res, err);
    }
  },

  respondRideRequest: async (req, res) => {
    try {
      const required = {
        security_key: req.headers.security_key,
        rideRequestId: req.body.rideRequestId,
        response: req.body.response,    // 1=>Accept, 2=>Reject
      };
      const non_required = {
      };

      let requestdata = await helper.vaildObject(required, non_required, res);

      if (requestdata.response != 1 && requestdata.response != 2) {
        throw "Invalid value in the parameter response.";
      }

      let upObj = {};
      upObj = {
        response: requestdata.response
      };
      // console.log(req.user.id);
      // return false;

      if (requestdata != '') {
        let checkRideRequest = await RideRequest.findOne({
          where: {
            id: requestdata.rideRequestId,
            driverId: req.user.id
          },
          raw: true,
        });

        if (!checkRideRequest) {
          throw 'Invalid value in the parameter rideRequestId.';
        }
        // console.log(checkRideRequest); return false;

        const updateOrder = await Order.update(
          {
            driverConfirmedTimestamp: moment().utc().unix(),
          },
          {
            returning: true,
            where: {
              id: checkRideRequest.orderId,
            },
          }
        );

        let upddateRideRequest = await RideRequest.update(upObj, {
          returning: true,
          where: {
            id: requestdata.rideRequestId
          }
        });

        if (requestdata.response == 2) {
          await Driver.update(
            {
              status: 1
            },
            {
              where: {
                id: req.user.id
              }
            }
          )
        }


        let getRideRequest = await RideRequest.findOne({
          where: {
            id: requestdata.rideRequestId,
            driverId: req.user.id
          },
          include: [{
            model: Order,
            required: false,
            where: {
              // status: 1
            },
            include: [{
              model: OrderDetail,
              required: false,
            },
            ]
          },
          {
            model: Restaurant,
            required: false,
          },
          {
            model: Driver,
            required: false,
          },
          {
            model: User,
            required: false,
            attributes: [
              'id',
              'firstName',
              'firstName',
              'lastName',
              'username',
              'email',
              'countryCode',
              'phone',
              'countryCodePhone',
              'photo',
              'deviceToken',
            ]
          }],
        });

        if (getRideRequest.user && getRideRequest.user.photo) {
          getRideRequest.user.photo = req.protocol + '://' + req.get('host') + '/images/users/' + getRideRequest.user.photo;
        }

        let getAddress = {};

        if (getRideRequest.order && getRideRequest.order.addressId) {
          getAddress = await Address.findOne({
            where: {
              id: getRideRequest.order.addressId,
            },
          });
        }
        getRideRequest.dataValues.userAddress = getAddress;

        if (getRideRequest.user && getRideRequest.user.photo) {
          getRideRequest.user.photo = req.protocol + '://' + req.get('host') + '/images/users/' + getRideRequest.user.photo;
        }
        getRideRequest = getRideRequest.toJSON();
        // console.log(getRideRequest);

        let dataForPush = {};
        let message = '';
        dataForPush.message = '';
        if (requestdata.response == 1) {
          message = 'Ride request accepted successfully.';
          dataForPush.message = `${getRideRequest.driver.username} has accepted the ride request.`;
        } else {
          message = 'Ride request rejected successfully.';
          dataForPush.message = `${getRideRequest.driver.username} has rejected the ride request.`;
        }

        const payloadData = { ...getRideRequest };

        // if (requestdata.rideStatus != 2) {
        delete payloadData.order;
        delete payloadData.restaurant;
        delete payloadData.driver;
        delete payloadData.userAddress;
        // }

        if (getRideRequest.user && getRideRequest.user.deviceToken != '') {
          dataForPush.type = requestdata.response;
          dataForPush.receiverId = getRideRequest.user.id;
          dataForPush.rideData = payloadData;
          dataForPush.deviceToken = getRideRequest.user.deviceToken;
          dataForPush.code = 5;
          helper.sendPushNotification(dataForPush);
        }

        let addNotificationObj = {};
        addNotificationObj['senderId'] = req.user.id;
        addNotificationObj['receiverId'] = getRideRequest.user.id;
        addNotificationObj['senderType'] = 2;
        addNotificationObj['receiverType'] = 1;
        addNotificationObj['orderId'] = (getRideRequest.order.id) ? getRideRequest.order.id : 0;
        addNotificationObj['rideRequestId'] = (getRideRequest.id) ? getRideRequest.id : 0;
        addNotificationObj['message'] = dataForPush.message;
        addNotificationObj['code'] = 5;
        let addNotification = await Notifications.create(addNotificationObj);

        return res.status(200).json({
          'status': true,
          'code': 200,
          'message': message,
          'body': getRideRequest
        });
      } else {
        throw "Something went wrong.";
      }

    } catch (err) {
      console.log(err);
      responseHelper.onError(res, err);
    }
  },

  changeRideStatus_old: async (req, res) => {
    try {
      const required = {
        security_key: req.headers.security_key,
        rideRequestId: req.body.rideRequestId,
        rideStatus: req.body.rideStatus,    // 2=>Start, 3=>Complete, 4=>Cancel
      };
      const non_required = {
      };

      let requestdata = await helper.vaildObject(required, non_required, res);

      if (requestdata.rideStatus != 2 && requestdata.rideStatus != 3 && requestdata.rideStatus != 4) {
        throw "Invalid value in the parameter rideStatus.";
      }

      let upObj = {};
      upObj = {
        rideStatus: requestdata.rideStatus
      };



      if (requestdata.rideStatus == 3) {
        upObj['completedAt'] = moment().utc().format('YYYY-MM-DD HH:mm:ss');
      }
      // console.log(upObj);
      //  return false;

      //  console.log(req.user.id);
      // return false;

      if (requestdata != '') {
        let checkRideRequest = await RideRequest.findOne({
          where: {
            id: requestdata.rideRequestId,
            driverId: req.user.id
          }
        });

        if (!checkRideRequest) {
          throw 'Invalid value in the parameter rideRequestId.';
        }
        // console.log(checkRideRequest); return false;

        let upddateRideRequest = await RideRequest.update(upObj, {
          returning: true,
          where: {
            id: requestdata.rideRequestId
          }
        });
        // console.log(upddateRideRequest);
        // return;

        let upDriverObj = {};

        if (requestdata.rideStatus == 2) {
          upDriverObj.status = 3;
        } else if (requestdata.rideStatus == 3) {
          upDriverObj.status = 1;
        } else if (requestdata.rideStatus == 4) {
          upDriverObj.status = 1;
        }

        let upddateDriver = await Driver.update(upDriverObj, {
          returning: true, where: { id: req.user.id }
        });

        // let getReq=await RideRequest.findByPk(requestdata.rideRequestId);
        // res.json(getReq);
        let getRideRequest = await RideRequest.findOne({
          where: {
            id: requestdata.rideRequestId,
            driverId: req.user.id
          },
          include: [{
            model: Order,
            required: false,
            where: {
              // status: 1
            },
            include: [{
              model: OrderDetail,
              required: false,
              include: [
                {
                  model: OrderDetailAddons,
                  required: false,
                }
              ],
            },
            ]
          },
          {
            model: Restaurant,
            required: false,
          },
          {
            model: Driver,
            required: false,
          },
          {
            model: User,
            required: false,
            attributes: [
              'id',
              'firstName',
              'firstName',
              'lastName',
              'username',
              'email',
              'countryCode',
              'phone',
              'countryCodePhone',
              'photo',
              'deviceToken',
            ]
          }],
        });
        // console.log(getRideRequest);
        // return false;

        let getAddress = {};

        if (getRideRequest.order && getRideRequest.order.addressId) {
          getAddress = await Address.findOne({
            where: {
              id: getRideRequest.order.addressId,
            },
          });
        }
        getRideRequest.dataValues.userAddress = getAddress;

        if (getRideRequest.user && getRideRequest.user.photo) {
          getRideRequest.user.photo = req.protocol + '://' + req.get('host') + '/images/users/' + getRideRequest.user.photo;
        }

        getRideRequest = getRideRequest.toJSON();
        // console.log(getRideRequest);

        let dataForPush = {};
        dataForPush.message = '';
        let message = 'Something went wrong.';

        if (requestdata.rideStatus == 2) {
          message = 'Ride started successfully.';
          dataForPush.message = `${getRideRequest.driver.username} has started the trip.`;
        } else if (requestdata.rideStatus == 3) {
          message = 'Ride completed successfully.';
          dataForPush.message = `${getRideRequest.driver.username} has completed the trip.`;
        } else if (requestdata.rideStatus == 4) {
          message = 'Ride cancelled successfully.';
          dataForPush.message = `${getRideRequest.driver.username} has cancelled the trip.`;
        }

        if (getRideRequest.user && getRideRequest.user.deviceToken != '') {


          const payloadData = { ...getRideRequest };

          // if (requestdata.rideStatus != 2) {
          delete payloadData.order;
          delete payloadData.restaurant;
          delete payloadData.driver;
          delete payloadData.userAddress;
          // }


          dataForPush.type = requestdata.rideStatus;
          dataForPush.receiverId = getRideRequest.user.id;
          dataForPush.rideData = payloadData;
          dataForPush.deviceToken = getRideRequest.user.deviceToken;
          dataForPush.code = 6;
          helper.sendPushNotification(dataForPush);
        }

        let addNotificationObj = {};
        addNotificationObj['senderId'] = req.user.id;
        addNotificationObj['receiverId'] = getRideRequest.user.id;
        addNotificationObj['senderType'] = 2;
        addNotificationObj['receiverType'] = 1;
        addNotificationObj['orderId'] = (getRideRequest.order.id) ? getRideRequest.order.id : 0;
        addNotificationObj['rideRequestId'] = (getRideRequest.id) ? getRideRequest.id : 0;
        addNotificationObj['message'] = dataForPush.message;
        addNotificationObj['code'] = 6;
        let addNotification = await Notifications.create(addNotificationObj);


        getRideRequest.order.orderDetails = getRideRequest.order.orderDetails.map(orderDetail => {
          orderDetail.categories = [];
          let categoriesObj = {};

          if (orderDetail.orderDetailAddons.length > 0) {
            orderDetail.orderDetailAddons.map(orderDetailAddon => {
              if (categoriesObj.hasOwnProperty(orderDetailAddon.addonCategory)) {
                categoriesObj[orderDetailAddon.addonCategory].addOnArray.push({
                  addon: orderDetailAddon.addon,
                  price: orderDetailAddon.price
                });
              } else {
                // categoriesObj[orderDetailAddon.addonCategory] = orderDetailAddon;
                categoriesObj[orderDetailAddon.addonCategory] = {};
                categoriesObj[orderDetailAddon.addonCategory].id = orderDetailAddon.addonId;
                categoriesObj[orderDetailAddon.addonCategory].categoryName = orderDetailAddon.addonCategory;
                categoriesObj[orderDetailAddon.addonCategory].addOnArray = [];
                categoriesObj[orderDetailAddon.addonCategory].addOnArray.push({
                  addon: orderDetailAddon.addon,
                  price: orderDetailAddon.price
                });
              }
            })
          }
          // orderDetail.categories = Object.values(categoriesObj);
          orderDetail.categories = Object.values(categoriesObj);
          delete orderDetail.orderDetailAddons;
          return orderDetail;
        });

        return res.status(200).json({
          'status': true,
          'code': 200,
          'message': message,
          'body': getRideRequest
        });
      } else {
        throw "Something went wrong.";
      }

    } catch (err) {
      console.log(err);
      responseHelper.onError(res, err);
    }
  },

  changeRideStatus: async (req, res) => {
    try {
      const required = {
        security_key: req.headers.security_key,
        rideRequestId: req.body.rideRequestId,
        rideStatus: req.body.rideStatus, // 2=>Start, 3=>Complete, 4=>Cancel
      };
      const non_required = {};

      let requestdata = await helper.vaildObject(required, non_required, res);

      if (
        requestdata.rideStatus != 2 &&
        requestdata.rideStatus != 3 &&
        requestdata.rideStatus != 4
      ) {
        throw "Invalid value in the parameter rideStatus.";
      }

      let upObj = {};
      upObj = {
        rideStatus: requestdata.rideStatus,
      };

      if (requestdata.rideStatus == 3) {
        upObj["completedAt"] = moment().utc().format("YYYY-MM-DD HH:mm:ss");

      }
      // console.log(upObj);
      //  return false;

      //  console.log(req.user.id);
      // return false;

      // console.log(requestdata.rideRequestId, '======>requestdata.rideRequestId');
      // return;

      if (requestdata != "") {
        let checkRideRequest = await RideRequest.findOne({
          where: {
            id: requestdata.rideRequestId,
            driverId: req.user.id,
          },
        });

        if (!checkRideRequest) {
          throw "Invalid value in the parameter rideRequestId.";
        }
        // console.log(checkRideRequest); return false;

        let upddateRideRequest = await RideRequest.update(upObj, {
          returning: true,
          where: {
            id: requestdata.rideRequestId,
          },
        });

        // console.log(requestdata.rideStatus == 3, '=====>requestdata.rideStatus == 3');
        // return;

        // console.log(checkRideRequest.orderId, '=====>checkRideRequest.orderId');
        // return;

        const updateOrderStatus = await Order.update(
          {
            status: requestdata.rideStatus,
            ...(
              requestdata.rideStatus == 2
                ? {
                  foodOnTheWayTimestamp: moment().utc().unix(),
                } : {}
            ),
            ...(
              requestdata.rideStatus == 3
                ? {
                  deliveredTimestamp: moment().utc().unix(),
                } : {}
            ),
          },
          {
            returning: true,
            where: {
              id: checkRideRequest.orderId,
            },
          }
        );

        // console.log(upddateRideRequest);
        // return;

        let upDriverObj = {};

        if (requestdata.rideStatus == 2) {
          upDriverObj.status = 3;
        } else if (requestdata.rideStatus == 3) {
          upDriverObj.status = 1;
        } else if (requestdata.rideStatus == 4) {
          upDriverObj.status = 1;
        }

        let upddateDriver = await Driver.update(upDriverObj, {
          returning: true,
          where: { id: req.user.id },
        });

        // let getReq=await RideRequest.findByPk(requestdata.rideRequestId);
        // res.json(getReq);
        let getRideRequest = await RideRequest.findOne({
          where: {
            id: requestdata.rideRequestId,
            driverId: req.user.id,
          },
          include: [
            {
              model: Order,
              required: false,
              where: {
                // status: 1
              },
              include: [
                {
                  model: OrderDetail,
                  required: false,
                  include: [
                    {
                      model: OrderDetailAddons,
                      required: false,
                    },
                  ],
                },
              ],
            },
            {
              model: Restaurant,
              required: false,
            },
            {
              model: Driver,
              required: false,
            },
            {
              model: User,
              required: false,
              attributes: [
                "id",
                "firstName",
                "firstName",
                "lastName",
                "username",
                "email",
                "countryCode",
                "phone",
                "countryCodePhone",
                "photo",
                "deviceToken",
              ],
            },
          ],
        });
        // console.log(getRideRequest);
        // return false;

        let getAddress = {};

        if (getRideRequest.order && getRideRequest.order.addressId) {
          getAddress = await Address.findOne({
            where: {
              id: getRideRequest.order.addressId,
            },
          });
        }
        getRideRequest.dataValues.userAddress = getAddress;

        if (getRideRequest.user && getRideRequest.user.photo) {
          getRideRequest.user.photo =
            req.protocol +
            "://" +
            req.get("host") +
            "/images/users/" +
            getRideRequest.user.photo;
        }

        getRideRequest = getRideRequest.toJSON();
        // console.log(getRideRequest);

        let dataForPush = {};
        dataForPush.message = "";
        let message = "Something went wrong.";

        if (requestdata.rideStatus == 2) {
          message = "Ride started successfully.";
          dataForPush.message = `${getRideRequest.driver.fullName} has started the trip.`;
        } else if (requestdata.rideStatus == 3) {
          message = "Ride completed successfully.";
          dataForPush.message = `${getRideRequest.driver.fullName} has completed the trip.`;
        } else if (requestdata.rideStatus == 4) {
          message = "Ride cancelled successfully.";
          dataForPush.message = `${getRideRequest.driver.fullName} has cancelled the trip.`;
        }

        const payloadData = { ...getRideRequest };

        delete payloadData.order;
        delete payloadData.restaurant;
        delete payloadData.driver;
        delete payloadData.userAddress;

        if (getRideRequest.user && getRideRequest.user.deviceToken != "") {
          dataForPush.type = requestdata.rideStatus;
          dataForPush.receiverId = getRideRequest.user.id;
          dataForPush.rideData = payloadData;
          dataForPush.deviceToken = getRideRequest.user.deviceToken;
          dataForPush.code = 6;
          helper.sendPushNotification(dataForPush);
        }

        let addNotificationObj = {};
        addNotificationObj["senderId"] = req.user.id;
        addNotificationObj["receiverId"] = getRideRequest.user.id;
        addNotificationObj["senderType"] = 2;
        addNotificationObj["receiverType"] = 1;
        addNotificationObj["orderId"] = getRideRequest.order.id
          ? getRideRequest.order.id
          : 0;
        addNotificationObj["rideRequestId"] = getRideRequest.id
          ? getRideRequest.id
          : 0;
        addNotificationObj["message"] = dataForPush.message;
        addNotificationObj["code"] = 6;
        let addNotification = await Notifications.create(addNotificationObj);

        getRideRequest.order.orderDetails = getRideRequest.order.orderDetails.map(
          (orderDetail) => {
            orderDetail.categories = [];
            let categoriesObj = {};

            if (orderDetail.orderDetailAddons.length > 0) {
              orderDetail.orderDetailAddons.map((orderDetailAddon) => {
                if (
                  categoriesObj.hasOwnProperty(orderDetailAddon.addonCategory)
                ) {
                  categoriesObj[orderDetailAddon.addonCategory].addOnArray.push(
                    {
                      addon: orderDetailAddon.addon,
                      price: orderDetailAddon.price,
                    }
                  );
                } else {
                  // categoriesObj[orderDetailAddon.addonCategory] = orderDetailAddon;
                  categoriesObj[orderDetailAddon.addonCategory] = {};
                  categoriesObj[orderDetailAddon.addonCategory].id =
                    orderDetailAddon.addonId;
                  categoriesObj[orderDetailAddon.addonCategory].categoryName =
                    orderDetailAddon.addonCategory;
                  categoriesObj[orderDetailAddon.addonCategory].addOnArray = [];
                  categoriesObj[orderDetailAddon.addonCategory].addOnArray.push(
                    {
                      addon: orderDetailAddon.addon,
                      price: orderDetailAddon.price,
                    }
                  );
                }
              });
            }
            // orderDetail.categories = Object.values(categoriesObj);
            orderDetail.categories = Object.values(categoriesObj);
            delete orderDetail.orderDetailAddons;
            return orderDetail;
          }
        );

        return res.status(200).json({
          status: true,
          code: 200,
          message: message,
          body: getRideRequest,
        });
      } else {
        throw "Something went wrong.";
      }
    } catch (err) {
      console.log(err);
      responseHelper.onError(res, err);
    }
  },

  getRideDetails: async (req, res) => {
    try {
      const required = {
        security_key: req.headers.security_key,
        rideRequestId: req.body.rideRequestId,
      };
      const non_required = {
      };

      let requestdata = await helper.vaildObject(required, non_required, res);


      let getRideRequest = await RideRequest.findOne({
        where: {
          id: requestdata.rideRequestId,
        },
        include: [{
          model: Order,
          required: false,
          where: {
            // status: 1
          },
          include: [{
            model: OrderDetail,
            required: false,
          },
          ]
        },
        {
          model: Restaurant,
          required: false,
        },
        {
          model: Driver,
          required: false,
        },
        {
          model: User,
          required: false,
          attributes: [
            'id',
            'firstName',
            'firstName',
            'lastName',
            'username',
            'email',
            'countryCode',
            'phone',
            'countryCodePhone',
            'photo',
          ]
        }],
      });

      let getAddress = {};

      if (getRideRequest.order && getRideRequest.order.addressId) {
        getAddress = await Address.findOne({
          where: {
            id: getRideRequest.order.addressId,
          },
        });
      }
      getRideRequest.dataValues.userAddress = getAddress;

      if (getRideRequest.user && getRideRequest.user.photo) {
        getRideRequest.user.photo = req.protocol + '://' + req.get('host') + '/images/users/' + getRideRequest.user.photo;
      }

      let message = 'Get Ride Details.';

      return res.status(200).json({
        'status': true,
        'code': 200,
        'message': message,
        'body': getRideRequest
      });

    } catch (err) {
      console.log(err);
      responseHelper.onError(res, err);
    }
  },
  getCurrentRide: async (req, res) => {
    try {
      const required = {
        security_key: req.headers.security_key,
      };
      const non_required = {
      };

      let requestdata = await helper.vaildObject(required, non_required, res);

      // console.log(req.user.id);
      // return false;

      if (requestdata != '') {

        let getRideRequest = await RideRequest.findOne({
          where: {
            driverId: req.user.id,
            rideStatus: {
              $in: [1, 2]
            },
            response: {
              $ne: 2
            }
          },
          order: [['id', 'DESC']],
          include: [{
            model: Order,
            required: false,
            where: {
              // status: 1
            },
            include: [{
              model: OrderDetail,
              required: false,
            },
            ]
          },
          {
            model: Restaurant,
            required: false,
          },
          {
            model: User,
            required: false,
            attributes: [
              'id',
              'firstName',
              'firstName',
              'lastName',
              'username',
              'email',
              'countryCode',
              'phone',
              'countryCodePhone',
              'photo',
            ]
          }],
        });

        if (!getRideRequest) {
          throw 'No current ride found.';
        }

        let getAddress = {};

        if (getRideRequest.order && getRideRequest.order.addressId) {
          getAddress = await Address.findOne({
            where: {
              id: getRideRequest.order.addressId,
            },
          });
        }
        getRideRequest.dataValues.userAddress = getAddress;

        if (getRideRequest.user && getRideRequest.user.photo) {
          getRideRequest.user.photo = req.protocol + '://' + req.get('host') + '/images/users/' + getRideRequest.user.photo;
        }

        let message = 'Get current ride.';

        return res.status(200).json({
          'status': true,
          'code': 200,
          'message': message,
          'body': getRideRequest
        });
      } else {
        throw "Something went .";
      }

    } catch (err) {
      console.log(err);
      responseHelper.onError(res, err);
    }
  },

  iAmHere: async (req, res) => {
    try {
      const required = {
        security_key: req.headers.security_key,
        rideId: req.body.rideId
      };
      const non_required = {
      };

      let requestdata = await helper.vaildObject(required, non_required, res);

      if (requestdata != '') {


        let getRideRequest = await RideRequest.findOne({
          where: {
            id: requestdata.rideId,
            driverId: req.user.id
          },
          include: [{
            model: Order,
            required: false,
            where: {
              // status: 1
            },
            include: [{
              model: OrderDetail,
              required: false,
            },
            ]
          },
          {
            model: Restaurant,
            required: false,
          },
          {
            model: Driver,
            required: false,
          },
          {
            model: User,
            required: false,
            attributes: [
              'id',
              'firstName',
              'lastName',
              'username',
              'email',
              'countryCode',
              'phone',
              'countryCodePhone',
              'photo',
              'deviceToken',
            ]
          }],
        });

        if (!getRideRequest) {
          throw 'Invalid value in the parameter rideId.';
        }

        let getAddress = {};

        if (getRideRequest.order && getRideRequest.order.addressId) {
          getAddress = await Address.findOne({
            where: {
              id: getRideRequest.order.addressId,
            },
          });
        }
        getRideRequest.dataValues.userAddress = getAddress;

        if (getRideRequest.user && getRideRequest.user.photo) {
          getRideRequest.user.photo = req.protocol + '://' + req.get('host') + '/images/users/' + getRideRequest.user.photo;
        }

        getRideRequest = getRideRequest.toJSON();
        // console.log(getRideRequest);

        let dataForPush = {};
        let dataForPushDriver = {};
        dataForPush.message = '';
        dataForPushDriver.message = '';
        let message = 'Driver has reached the location.';


        const payloadData = { ...getRideRequest };

        // if (getRideRequest.rideStatus != 2) {
        delete payloadData.order;
        delete payloadData.restaurant;
        delete payloadData.driver;
        delete payloadData.userAddress;
        // }

        if (getRideRequest.user && getRideRequest.user.deviceToken != '') {

          dataForPush.type = getRideRequest.rideStatus;
          dataForPush.receiverId = getRideRequest.user.id;
          // dataForPush.rideData = getRideRequest;
          dataForPush.rideData = payloadData;
          dataForPush.deviceToken = getRideRequest.user.deviceToken;
          dataForPush.message = `Driver ${getRideRequest.driver.username} has reached the location.`;
          dataForPush.code = 7;
          helper.sendPushNotification(dataForPush);
        }

        if (getRideRequest.driver && getRideRequest.driver.deviceToken != '') {

          dataForPushDriver.type = requestdata.rideStatus;
          dataForPushDriver.receiverId = getRideRequest.driver.id;
          // dataForPushDriver.rideData = getRideRequest;
          dataForPushDriver.rideData = payloadData;
          dataForPushDriver.deviceToken = getRideRequest.driver.deviceToken;

          console.log(JSON.stringify(getRideRequest, null, 2), '=======>getRideRequest');


          // dataForPushDriver.deviceToken = '99CA02C5DCC23F2474AD8A7A01C92656060E0D949255865EAB48B5BDA3406B86';
          dataForPushDriver.message = `Location sent to ${getRideRequest.user.username} successfully.`;
          dataForPushDriver.code = 8;
          helper.sendPushNotificationDriver(dataForPushDriver);
        }

        let addNotificationObj = {};
        addNotificationObj['senderId'] = req.user.id;
        addNotificationObj['receiverId'] = getRideRequest.user.id;
        addNotificationObj['senderType'] = 2;
        addNotificationObj['receiverType'] = 1;
        addNotificationObj['orderId'] = (getRideRequest.order.id) ? getRideRequest.order.id : 0;
        addNotificationObj['rideRequestId'] = (getRideRequest.id) ? getRideRequest.id : 0;
        addNotificationObj['message'] = dataForPush.message;
        addNotificationObj['code'] = 7;
        let addNotificationUser = await Notifications.create(addNotificationObj);

        return res.status(200).json({
          'status': true,
          'code': 200,
          'message': message,
          'body': getRideRequest
        });
      } else {
        throw "Something went wrong.";
      }

    } catch (err) {
      console.log(err);
      responseHelper.onError(res, err);
    }
  },

  paymentStatusListingDriver: async (req, res) => {
    try {
      const required = {
        security_key: req.headers.security_key,
      }

      const nonRequired = {

      };

      let requestData = await helper.vaildObject(required, nonRequired, res);

      let rideRequest = await RideRequest.findAll({
        where: {
          driverId: req.user.id
        },

        order: [['id', 'DESC']],

        include: [
          // {
          //   model: Driver,  
          //   required: false,         
          // },
          {
            model: Order,
            required: false,
          },
          {
            model: User,
            required: false,
            attributes: [
              'id',
              'firstName',
              'lastName',
              'username',
              'email',
              'countryCode',
              'phone',
              'countryCodePhone',
              'photo',
              'deviceToken',
            ]
          }
        ]
      });

      let responseData = [];

      if (rideRequest) {
        responseData = rideRequest;
      }

      return res.status(200).json({
        'status': true,
        'code': 200,
        'message': 'Payment Status Driver.',
        'body': responseData
      });

    } catch (err) {
      // console.log(err);
      return helper.error(res, err);
      // return responseHelper.onError(res, err)
    }
  },

  earnings: async (req, res) => {
    try {
      const required = {
        security_key: req.headers.security_key,
      }

      const nonRequired = {

      };

      let requestData = await helper.vaildObject(required, nonRequired, res);

      const orderDetailsThisDay = await db.query(`select IFNULL(SUM(delivery_fee), 0) as total_delivery_fee, IFNULL(SUM(tip), 0) as total_tip FROM ride_requests as rr JOIN orders as o ON rr.order_id=o.id WHERE rr.completedAt > CURDATE() && rr.driver_id=? && rr.ride_status=3`, {
        replacements: [req.user.id],
        mapToModel: true,
        type: db.QueryTypes.SELECT
      });

      const orderDetailsThisWeek = await db.query(`select IFNULL(SUM(delivery_fee), 0) as total_delivery_fee, IFNULL(SUM(tip), 0) as total_tip FROM ride_requests as rr JOIN orders as o ON rr.order_id=o.id WHERE rr.completedAt > TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL - WEEKDAY(CURDATE()) DAY)) && rr.driver_id=? && rr.ride_status=3`, {
        replacements: [req.user.id],
        mapToModel: true,
        type: db.QueryTypes.SELECT
      });

      const orderDetailsThisMonth = await db.query(`select IFNULL(SUM(delivery_fee), 0) as total_delivery_fee, IFNULL(SUM(tip), 0) as total_tip FROM ride_requests as rr JOIN orders as o ON rr.order_id=o.id WHERE rr.completedAt > TIMESTAMP(DATE_FORMAT(NOW() ,'%Y-%m-01')) && rr.driver_id=? && rr.ride_status=3`, {
        replacements: [req.user.id],
        mapToModel: true,
        type: db.QueryTypes.SELECT
      });

      let responseData = {
        day: orderDetailsThisDay[0],
        week: orderDetailsThisWeek[0],
        month: orderDetailsThisMonth[0],
      };

      return res.status(200).json({
        'status': true,
        'code': 200,
        'message': 'Earnings Fetched Successfully.',
        'body': responseData
      });

    } catch (err) {
      // console.log(err);
      return helper.error(res, err);
      // return responseHelper.onError(res, err)
    }
  },

}
const sequelize = require("sequelize");
const { Op } = sequelize;
const db = require("../../db/db");
const models = require("../../models");
const helper = require("../../config/helper");
const responseHelper = require("../../helpers/responseHelper");
const moment = require("moment");
const Restaurant = models.restaurants;
const Category = models.categories;
const Cuisine = models.cuisines;
const User = models.users;
const RestaurantCategory = models.restaurantsCategories;
const RestaurantCuisine = models.restaurantsCuisines;
const RestaurantFavourite = models.restaurantsFavourite;
const RestaurantRating = models.restaurantRatings;
const OrderRating = models.orderRatings;
const DriverRating = models.driverRatings;
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
const Setting = models.settings;
const promocodeUses = models.promocodeUses;
const WalletPayments = models.walletPayments;
AssignedRestaurants.belongsTo(User, { foreignKey: "userId" });

RestaurantCategory.belongsTo(Restaurant, { foreignKey: "restaurantId" });
RestaurantCategory.belongsTo(Category, { foreignKey: "categoryId" });

RestaurantCuisine.belongsTo(Restaurant, { foreignKey: "restaurantId" });
RestaurantCuisine.belongsTo(Cuisine, { foreignKey: "cuisineId" });

RestaurantFavourite.belongsTo(Restaurant, { foreignKey: "restaurantId" });
RestaurantFavourite.belongsTo(User, { foreignKey: "userId" });

RestaurantRating.belongsTo(Restaurant, { foreignKey: "restaurantId" });
RestaurantRating.belongsTo(User, { foreignKey: "userId" });

Restaurant.hasMany(Menu, { foreignKey: "restaurantId" });
Menu.hasMany(Item, { foreignKey: "menuId" });
Item.hasMany(ItemImage, { foreignKey: "itemId" });
Order.hasMany(OrderDetail, { foreignKey: "orderId" });
Order.belongsTo(Restaurant, { foreignKey: "restaurantId" });
OrderDetail.hasMany(OrderDetailAddons, { foreignKey: "orderDetailId" });

RideRequest.belongsTo(Order, { foreignKey: "orderId" });
RideRequest.belongsTo(User, { foreignKey: "userId" });
RideRequest.belongsTo(Driver, { foreignKey: "driverId" });
RideRequest.belongsTo(Restaurant, { foreignKey: "restaurantId" });

MenuItemAddon.belongsTo(AddonCategories, { foreignKey: "categoryId" });

// Order.hasMany(Address, { foreignKey: 'addressId' });
// Address.belongsTo(Order, { foreignKey: 'addressId' });
// Order.belongsTo(Address, { foreignKey: 'addressId' });

var paypal = require("paypal-rest-sdk");
const helperFunctions = require("../../helpers/helperFunctions");

paypal.configure({
  mode: "live", //sandbox or live
  client_id:
    "Ab_W-qAMJUKyTKu7-SI65LfDen755Q_zpqJVwl-zyjS2t4XD3XWfji5_GMYelssxf2hUjica4FtOXMUp",
  client_secret:
    "ECMvbFf8DtL5eGbLDFvFB7k3l9nTlyTL9dZFYaohVSAmn2oHwWZvm6iO85sfH0q4Jte3gFYZQnjVd6wq",
 
   //'mode': 'sandbox', //sandbox or live
   //'client_id': 'AdjOc5c-hSGO-ZsI47zKvBj7GhJZonY85CCg8OM3Ob9jDjhEZ9x98ECA9TqGxbMOp_TRglm4pVx7JTW6',
   //'client_secret': 'EC4NJPcvpWfVRZ5_J2gdpRBhDcW52Q-oICgncHv23MbHmydTLAERq5EUz1WtFIV1jUObRhCHl0qiVjFZ'
});

module.exports = {
  tipsListing: async (req, res) => {
    try {
      const required = {
        security_key: req.headers.security_key,
      };
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
        status: true,
        code: 200,
        message: "Tips Listing.",
        body: tips,
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
        orderType: req.body.orderType, // 1=>Instant 2=>Scheduled
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
        paymentMethod: req.body.paymentMethod, // 1=>Cash 2=>Paypal 3=>Payout 4=>kanoo
        itemsArray: req.body.itemsArray, // [{itemId:5, itemName: 'abc, quantity: 2, addons: 'extra chesse with veggies', price: 200}, {item_id:15, quantity: 2, addons: 'extra chesse with veggies', price: 100}]
      };

      if (required.orderType == 2) {
        required["scheduledTimestamp"] = req.body.scheduledTimestamp;
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
      //console.log(requestData, '=============>=============>=============>=============>=============>=============>requestData'); return false;
   // console.log(required.paymentMethod);return false;
      

      // console.log(req.user); return false;

      let validOrderType = ["1", "2"];
      if (validOrderType.indexOf(requestData.orderType) == -1) {
        throw "Invalid value in the parameter orderType.";
      }

      if (
        requestData.hasOwnProperty("isDelivery") &&
        requestData.isDelivery != ""
      ) {
        let validDeliveryType = ["0", "1"];
        if (validDeliveryType.indexOf(requestData.isDelivery) == -1) {
          throw "Invalid value in the parameter isDelivery.";
        }
      }

      let validPaymentMethod = ["1", "2", "3", "4", "5", "6","7"];
      if (validPaymentMethod.indexOf(requestData.paymentMethod) == -1) {
        throw "Invalid value in the parameter paymentMethod.";
      }
      // console.log(helper.time()); return false;
      // console.log(helper.generateTransactionNumber()); return false;

      let timestamp = helper.time();
      let orderDate = moment().format("YYYY-MM-DD");
      let scheduledDatetime = moment().format("YYYY-MM-DD hh:mm:ss");
      // console.log(scheduledDatetime); return false;

      requestData.itemsArray = JSON.parse(requestData.itemsArray);
      // console.log(requestData.itemsArray); return false;

      let restaurantExists = await Restaurant.findOne({
        where: { id: requestData.restaurantId },
      });
      // console.log(restaurantExists); return false;

      if (!restaurantExists)
        throw "Invalid value in the parameter restaurantId.";
      restaurantExists = restaurantExists.toJSON();

      let addressExists = {};

      if (requestData.isDelivery == 0) {
        addressExists = await Address.findOne({
          where: {
            id: requestData.addressId,
            userId: req.user.id,
          },
        });
        if (!addressExists) throw "Invalid value in the parameter addressId.";
        if(addressExists.latitude == 0 || addressExists.longitude == 0){
          throw "Invalid Address.";
        }
        addressExists = addressExists.toJSON();
      }


      // if (addressExists){
      //  // console.log(addressExists.latitude,'sddsd');return false;
      //   if(addressExists.latitude == 0 || addressExists.longitude == 0){
      //     throw "Invalid Address.";
      //   }
        
      // } 

      let addOrderObj = {};
      addOrderObj = { ...requestData };
      delete addOrderObj["security_key"];
      delete addOrderObj["itemsArray"];
      addOrderObj["userId"] = req.user.id;
      addOrderObj["status"] = 1;
      addOrderObj["orderDate"] = orderDate;
      addOrderObj["scheduledDatetime"] = scheduledDatetime;

      // if (requestData.paymentMethod == 2 || requestData.paymentMethod == 4) {
      // if (requestData.paymentMethod == 2 || requestData.paymentMethod == 4 || requestData.paymentMethod == 1) { // paymentStatus 1 added

      // if (['1', '2', '4', '5'].includes(requestData.paymentMethod)) { // includes condition added
      //   // paypment via PayPal
      //   addOrderObj["paymentStatus"] = 0; // if payment via paypal then paymentStatus is not done
      // } else {
      //   addOrderObj["paymentStatus"] = 2; // else payment status is pending
      // }


      addOrderObj["paymentStatus"] = 0; // if payment via paypal then paymentStatus is not done




      if (requestData.paymentMethod == 1) {
        // Cash
        addOrderObj["transactionNo"] = helper.generateTransactionNumber();
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
        delete tempObj["addons"];
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
            requestData.itemsArray[index].addons.forEach((addon) => {
              addon.orderDetailId = orderDetail.id;
              addOrderDetailAddonArray.push(addon);
            });
          }
          // console.log(requestData.itemsArray[index]);
        });
        // console.log(addOrderDetailAddonArray); return false;
        // console.log(addOrderDetailAddonArray, '===================>addOrderDetailAddonArray'); return;
        let addOrderDetailAddons = await OrderDetailAddons.bulkCreate(
          addOrderDetailAddonArray
        );
      }

      // addOrderDetail = addOrderDetail.toJSON();

      let addTransactionObj = {};
      addTransactionObj["orderId"] = addOrder.id;
      addTransactionObj["userId"] = addOrder.userId;
      addTransactionObj["transactionNo"] = addOrder.transactionNo;
      addTransactionObj["paymentMethod"] = addOrder.paymentMethod;
      addTransactionObj["amount"] = addOrder.netAmount;
      addTransactionObj["paymentStatus"] = addOrder.paymentStatus;
      let addTransaction = await Transaction.create(addTransactionObj);
      addTransaction = addTransaction.toJSON();

      let addNotificationObj = {};
      addNotificationObj["senderId"] = req.user.id;
      addNotificationObj["receiverId"] = requestData.restaurantId;
      addNotificationObj["senderType"] = 1;
      addNotificationObj["receiverType"] = 3;
      // addNotificationObj["message"] = `${req.user.username} has added an order.`;
      addNotificationObj["message"] = `${req.user.username} has added an order.`;
      addNotificationObj["code"] = 1;
      let addNotification = await Notifications.create(addNotificationObj);

      
      
      

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
              },
            ],
          },
        ],
      });

      addedOrder.address = addressExists;
      addedOrder.dataValues.userEmail = req.user.email;
      // console.log(addedOrder);
      // console.log(req.user);
      // console.log(req.user.email);

      addedOrder = addedOrder.toJSON();

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

      console.log(restaurantExists, '========+>restaurant');

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
        },
      };
     // helper.sendTemplateMail(mail);

      console.log(req.user.email, '=====================>req.user.email in addORder api');
      // return;

      if (restaurantExists.email.length > 0) {
        const restaurantEmail = restaurantExists.email;
        const styleBorder = "border: 1px solid #b3b3b3; padding: 2px;";

        let html = '';
        html += `&nbsp;&nbsp;&nbsp;You have a new order.`;
        html += '<br/>';
        html += '<br/>';
        html += '<b>Order Details:</b>';
        html += '<table style="border: 1px solid #b3b3b3">';
          html += '<tr>';
            html += `<th align="center" style="${styleBorder}">S.No.</th>`;
            html += `<th align="center" style="${styleBorder}">Item</th>`;
            html += `<th align="center" style="${styleBorder}">Item Description</th>`;
            html += `<th align="center" style="${styleBorder}">Quantity</th>`;
            html += `<th align="center" style="${styleBorder}">Price</th>`;
            html += `<th align="center" style="${styleBorder}">Categories</th>`;
          html += "</tr>";

        const orderDetails = addedOrder.orderDetails;

        for (let i in orderDetails) {
          const orderDetail = orderDetails[i];

          html += '<tr>';
            html += `<td align="center" style="${styleBorder}">${parseInt(i)+1}</td>`;
            html += `<td align="center" style="${styleBorder}">${orderDetail.itemName}</td>`;
            html += `<td align="center" style="${styleBorder}">${orderDetail.itemDescription}</td>`;
            html += `<td align="center" style="${styleBorder}">${orderDetail.quantity}</td>`;
            html += `<td align="center" style="${styleBorder}">$${orderDetail.price}</td>`;
            html += `<td align="center" style="${styleBorder}">`
            if (orderDetail.categories.length > 0) {
              html += `<table style="width: 100%">`;
                html += `<tr>`;
                  html += `<th align="center" style="${styleBorder}">Category Name</th>`;
                  html += `<th align="center" style="${styleBorder}">Addon</th>`;
                  html += `<th align="center" style="${styleBorder}">Price</th>`;
                html += `</tr>`;
              for (let j in orderDetail.categories) {
                const category = orderDetail.categories[j];
                if (category.addOnArray.length > 0) {
                  for (let k in category.addOnArray) {
                    const addon = category.addOnArray[k];

                html += `<tr>`;
                  html += `<td align="center" style="${styleBorder}">${category.categoryName}</td>`;
                  html += `<td align="center" style="${styleBorder}">${addon.addon}</td>`;
                  html += `<td align="center" style="${styleBorder}">$${addon.price}</td>`;
                html += `</tr>`;

                  }
                }
              }
              html += `</table>`;
            }
            html += `</td>`;
          html += "</tr>";
        }
        html += "</table>"

        if (addedOrder.specialRequest.length > 0) {
          html += '<br/>';
          html += `Special Request: ${addedOrder.specialRequest}`;
          html += '<br/>';
        }

        html += '<br/>';
        html += 'Regards,<br/>';
        html += 'Bahama Eats';

        let htmlRestaurant = `Hello ${restaurantExists.name},<br/>` + html;

        let mail = {
            from: 'orders@bahamaeats.com <test978056@gmail.com>',
            to: restaurantEmail,
            subject: 'BahamaEats | New Order',
            html: htmlRestaurant
        }

        //helper.sendMail(mail);

        let assignedRestaurant = await AssignedRestaurants.findOne({
          where: {
            restaurantId: restaurantExists.id
          },
          include: [
            {
              model: User,
              required: false,
              attributes: [
                'id',
                'firstName',
                'lastName',
                'email'
              ]
            }
          ],
        });

        if (assignedRestaurant) {
          assignedRestaurant = assignedRestaurant.toJSON();

          if ( requestData.isDelivery == 0 && Object.keys(assignedRestaurant).length > 0 && assignedRestaurant.hasOwnProperty('user') && Object.keys(assignedRestaurant.user).length > 0 ) {
            let htmlDispatcher = `Hello ${assignedRestaurant.user.firstName},<br/>` + html;

            let mailToDispatcher = {
              from: 'orders@bahamaeats.com <test978056@gmail.com>',
              to: assignedRestaurant.user.email,
              subject: 'BahamaEats | New Order',
              html: htmlDispatcher
            }

            helper.sendMail(mailToDispatcher);
          }
        }
       // console.log(restaurantEmail); return;
      }

      if (required.orderType == 2) {
        required["scheduledTimestamp"] = req.body.scheduledTimestamp;
      }
   //create wallet history when payment from wallet
      if (required.paymentMethod == 7) {
         let getUser = await User.findOne({
           where: {
             id:req.user.id,
           },
           attributes: [
               'id', 'email', 'firstName', 'lastName', 'username', 'country_code', 'phone', 'country_code_phone', 'photo', 'wallet_amount' , 'created_at', 'updated_at'
           ],
       });
        if(getUser.dataValues.wallet_amount){
        balance =  getUser.dataValues.wallet_amount - requestData.netAmount;
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
        
        const wallet_transactions = await WalletPayments.create(
          {
            userId: getUser.dataValues.id,
              amount: requestData.netAmount,
              transactionId:addOrder.id,
              closingBalance:balance,
              transactionType:2,
              createdAt:new Date().toISOString()
          });
         //console.log('asssssssssssssssssssssssssss');
       }

      res.status(200).json({
        status: true,
        code: 200,
        message: "Order added successfully.",
        body: addedOrder,
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
        limit: req.body.limit || 10,
        page: req.body.page || 1
      };

      const nonRequired = {};

      let requestData = await helper.vaildObject(required, nonRequired, res);

      // console.log(req.user); return false;

      // console.log(helper.time()); return false;
      // console.log(helper.generateTransactionNumber()); return false;

      let orders = await Order.findAll({
        where: {
          userId: req.user.id,
          paymentStatus: {
            $ne: 0,
          },
        },
        attributes: {
          include: [
            [
              sequelize.literal(
                "IFNULL((SELECT AVG(order_ratings.rating) FROM order_ratings WHERE order_ratings.order_id=orders.id),0)"
              ),
              "orderRating",
            ],
            [
              sequelize.literal(
                `IFNULL((SELECT order_ratings.rating FROM order_ratings WHERE order_ratings.order_id=orders.id && order_ratings.user_id=${req.user.id} ORDER BY id DESC LIMIT 1),0)`
              ),
              "myOrderRating",
            ],
            [
              sequelize.literal(
                `IFNULL((SELECT order_ratings.comment FROM order_ratings WHERE order_ratings.order_id=orders.id && order_ratings.user_id=${req.user.id} ORDER BY id DESC LIMIT 1),0)`
              ),
              "myOrderRatingComment",
            ],
          ],
        },
        include: [
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
          {
            model: Restaurant,
            required: true,
            include: [
              {
                model: models.restaurantImages,
              }
            ]
          },
        ],
        order: [
          ["id", "desc"],
          // [ models.menus , { model: models.items }, 'price', 'desc' ]
        ],
        limit: parseInt(requestData.limit),
        offset: (parseInt(requestData.page) - 1) * requestData.limit
      });
      // console.log(orders); return false;
      // console.log(addedOrder);
      // console.log(req.user);
      // console.log(req.user.email);

      ordersListing = orders.map(async (order) => {
        order = order.toJSON();
        // console.log(order); return false;
        // addedOrder.address = addressExists;
        order.userEmail = req.user.email;

        const orderAddress = await db.query(
          `SELECT * FROM addresses WHERE id=?`,
          {
            replacements: [order.addressId],
            // model: UserDetails,
            model: Address,
            mapToModel: true,
            type: db.QueryTypes.SELECT,
          }
        );
        // console.log(orderAddress); return false;

        let rideRequest = await RideRequest.findOne({
          where: {
            orderId: order.id,
          },
          order: [["id", "DESC"]],
          include: [
            {
              model: Driver,
              required: false,
            },
          ],
        });
        order.restaurantStatus = order.restaurant.status;
        const restaurant = {
          name: order.restaurant.name,
          minDelivery: order.restaurant.minDelivery,
          deliveryType: order.restaurant.deliveryType,
          restaurantImages: order.restaurant.restaurantImages,
          hideStatus: order.restaurant.hideStatus,
          status: order.restaurant.status,
          isAvailable: order.restaurant.isAvailable,
        };

        delete order.restaurant;

        order.restaurant = restaurant;

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
            rideRequest.driver.rideResponse = rideRequest.response;
            rideRequest.driver.rideStatus = rideRequest.rideStatus;
            order.driver = rideRequest.driver;
            order.driver.orderRating = order.orderRating;
            delete rideRequest["driver"];
            order.rideDetails = rideRequest;
          }
        }

        order.orderDetails = order.orderDetails.map((orderDetail) => {
          orderDetail.restaurantName =
            order.hasOwnProperty("restaurant") &&
              order.restaurant.hasOwnProperty("name")
              ? order.restaurant.name
              : "";
          orderDetail.categories = [];
          let categoriesObj = {};

          if (orderDetail.orderDetailAddons.length > 0) {
            orderDetail.orderDetailAddons.map((orderDetailAddon) => {
              // console.log(orderDetailAddon);
              if (
                categoriesObj.hasOwnProperty(orderDetailAddon.addonCategory)
              ) {
                categoriesObj[orderDetailAddon.addonCategory].addOnArray.push({
                  id: orderDetailAddon.addonId,
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
                  id: orderDetailAddon.addonId,
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
        // console.log(order); return false;
        return order;
      });

      let results = await Promise.all(ordersListing);

      return res.status(200).json({
        status: true,
        code: 200,
        message: "Orders Listing.",
        body: results,
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
      };

      const nonRequired = {};

      let requestData = await helper.vaildObject(required, nonRequired, res);

      // console.log(req.user); return false;

      // console.log(helper.time()); return false;
      // console.log(helper.generateTransactionNumber()); return false;

      let order = await Order.findOne({
        where: {
          id: requestData.orderId,
        },
        attributes: {
          include: [
            [
              sequelize.literal(
                `IF((SELECT COUNT(*) FROM order_ratings AS o WHERE o.user_id=${req.user.id} && o.order_id=orders.id) >= 1, 1, 0)`
              ),
              "isRated",
            ],
          ],
        },
        include: [
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
          {
            model: Restaurant,
            required: true,
          },
        ],
      });

      // console.log(addedOrder);
      // console.log(req.user);
      // console.log(req.user.email);

      if (!order) throw "Invalid value in the parameter orderId";

      order = order.toJSON();
      // console.log(order);
      // addedOrder.address = addressExists;
      order.userEmail = req.user.email;

      const orderAddress = await db.query(
        `SELECT * FROM addresses WHERE id=?`,
        {
          replacements: [order.addressId],
          // model: UserDetails,
          model: Address,
          mapToModel: true,
          type: db.QueryTypes.SELECT,
        }
      );
      // console.log(orderAddress); return false;

      let rideRequest = await RideRequest.findOne({
        where: {
          orderId: order.id,
        },
        include: [
          {
            model: Driver,
            required: false,
            attributes: {
              // include: [
              // [sequelize.literal(`(SELECT rr.response FROM ride_requests WHERE rr.)`), 'rideResponse'],
              // [sequelize.literal(), 'rideStatus'],
              // ]
            },
          },
        ],
      });
      order.address = orderAddress[0];
      order.driver = {};

      order.isDriverAssigned = 0;
      if (rideRequest) {
        order.isDriverAssigned = 1;
        rideRequest = rideRequest.toJSON();
        // console.log(rideRequest);
        if (rideRequest.driver) {
          rideRequest.driver.rideResponse = rideRequest.response;
          rideRequest.driver.rideStatus = rideRequest.rideStatus;
          order.driver = rideRequest.driver;
        }
      }

      order.orderDetails = order.orderDetails.map((orderDetail) => {
        orderDetail.categories = [];
        let categoriesObj = {};

        if (orderDetail.orderDetailAddons.length > 0) {
          orderDetail.orderDetailAddons.map((orderDetailAddon) => {
            if (categoriesObj.hasOwnProperty(orderDetailAddon.addonCategory)) {
              categoriesObj[orderDetailAddon.addonCategory].addOnArray.push({
                id: orderDetailAddon.addonId,
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
                id: orderDetailAddon.addonId,
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

      order.isOrderRated = await OrderRating.count({
        where: {
          orderId: order.id,
          userId: req.user.id,
        },
      });

      order.isDriverRated = await DriverRating.count({
        where: {
          orderId: order.id,
          userId: req.user.id,
        },
      });

      order.isRestaurantRated = await RestaurantRating.count({
        where: {
          restaurantId: order.restaurantId,
          userId: req.user.id,
        },
      });

      return res.status(200).json({
        status: true,
        code: 200,
        message: "Order Details.",
        body: order,
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
  orderStatusScreen: async (req, res) => {
    try {
      const required = {
        security_key: req.headers.security_key,
        orderId: req.body.orderId,
      };

      const nonRequired = {};

      let requestData = await helper.vaildObject(required, nonRequired, res);

      // console.log(req.user); return false;

      // console.log(helper.time()); return false;
      // console.log(helper.generateTransactionNumber()); return false;

      let order = await Order.findOne({
        where: {
          id: requestData.orderId,
        },
        attributes: {
          include: [
            [
              sequelize.literal(
                `IF((SELECT COUNT(*) FROM order_ratings AS o WHERE o.user_id=${req.user.id} && o.order_id=orders.id) >= 1, 1, 0)`
              ),
              "isRated",
            ],
          ],
        },
        include: [
          // {
          //   model: models.orderDetails,
          //   required: false,
          // include: [
          //   {
          //     model: OrderDetailAddons,
          //     required: false,
          //   },
          // ],
          // },
          {
            model: Restaurant,
            required: true,
          },
        ],
      });

      // console.log(addedOrder);
      // console.log(req.user);
      // console.log(req.user.email);

      if (!order) throw "Invalid value in the parameter orderId";

      order = order.toJSON();
      // console.log(order);
      // addedOrder.address = addressExists;
      order.userEmail = req.user.email;

      const orderAddress = await db.query(
        `SELECT * FROM addresses WHERE id=?`,
        {
          replacements: [order.addressId],
          // model: UserDetails,
          model: Address,
          mapToModel: true,
          type: db.QueryTypes.SELECT,
        }
      );
      // console.log(orderAddress); return false;

      let rideRequest = await RideRequest.findOne({
        where: {
          orderId: order.id,
        },
        include: [
          {
            model: Driver,
            required: false,
            attributes: {
              // include: [
              // [sequelize.literal(`(SELECT rr.response FROM ride_requests WHERE rr.)`), 'rideResponse'],
              // [sequelize.literal(), 'rideStatus'],
              // ]
            },
          },
        ],
      });
      order.address = orderAddress[0];
      order.driver = {};

      order.isDriverAssigned = 0;
      if (rideRequest) {
        order.isDriverAssigned = 1;
        rideRequest = rideRequest.toJSON();
        // console.log(rideRequest);
        if (rideRequest.driver) {
          rideRequest.driver.rideResponse = rideRequest.response;
          rideRequest.driver.rideStatus = rideRequest.rideStatus;
          order.driver = rideRequest.driver;
        }
      }

      // order.orderDetails = order.orderDetails.map((orderDetail) => {
      //   orderDetail.categories = [];
      //   let categoriesObj = {};

      // if (orderDetail.orderDetailAddons.length > 0) {
      //   orderDetail.orderDetailAddons.map((orderDetailAddon) => {
      //     if (categoriesObj.hasOwnProperty(orderDetailAddon.addonCategory)) {
      //       categoriesObj[orderDetailAddon.addonCategory].addOnArray.push({
      //         addon: orderDetailAddon.addon,
      //         price: orderDetailAddon.price,
      //       });
      //     } else {
      //       // categoriesObj[orderDetailAddon.addonCategory] = orderDetailAddon;
      //       categoriesObj[orderDetailAddon.addonCategory] = {};
      //       categoriesObj[orderDetailAddon.addonCategory].id =
      //         orderDetailAddon.addonId;
      //       categoriesObj[orderDetailAddon.addonCategory].categoryName =
      //         orderDetailAddon.addonCategory;
      //       categoriesObj[orderDetailAddon.addonCategory].addOnArray = [];
      //       categoriesObj[orderDetailAddon.addonCategory].addOnArray.push({
      //         addon: orderDetailAddon.addon,
      //         price: orderDetailAddon.price,
      //       });
      //     }
      //   });
      // }
      // orderDetail.categories = Object.values(categoriesObj);
      //   orderDetail.categories = Object.values(categoriesObj);
      //   delete orderDetail.orderDetailAddons;
      //   return orderDetail;
      // });

      order.isOrderRated = await OrderRating.count({
        where: {
          orderId: order.id,
          userId: req.user.id,
        },
      });

      order.isDriverRated = await   DriverRating.count({
        where: {
          orderId: order.id,
          userId: req.user.id,
        },
      });

      order.isRestaurantRated = await RestaurantRating.count({
        where: {
          restaurantId: order.restaurantId,
          userId: req.user.id,
        },
      });

      return res.status(200).json({
        status: true,
        code: 200,
        message: "Order Details.",
        body: order,
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
      };

      const nonRequired = {};

      let requestData = await helper.vaildObject(required, nonRequired, res);

      const paymentSetting = await models.payment_setting.findOne();

      res.status(200).json({
        status: true,
        code: 200,
        message: "Payment setting fetched successfully.",
        body: paymentSetting,
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
      };

      const nonRequired = {};

      let requestData = await helper.vaildObject(required, nonRequired, res);

      let timestamp = helper.time();

      let orderExists = await Order.findOne({
        where: {
          id: requestData.orderId,
          userId: req.user.id,
        },
      });
      if (!orderExists) throw "Invalid value in the parameter orderId.";
      orderExists = orderExists.toJSON();
      if (orderExists.paymentMethod != 2)
        throw "Payment method of this order is not Paypal.";

      let addressExists = await Address.findOne({
        where: {
          id: orderExists.addressId,
        },
      });

      let transactionExists = await Transaction.findOne({
        where: {
          orderId: requestData.orderId,
          userId: req.user.id,
        },
      });
      if (!transactionExists)
        throw "Transaction for this order was not generated.";
      transactionExists = transactionExists.toJSON();
      // console.log(requestData.transactionNo); return false;
      // console.log(transactionExists); return false;
      // console.log(transactionExists.id); return false;

      let updateTransaction = await Transaction.update(
        {
          transactionNo: requestData.transactionNo,
          paymentStatus: 1,
        },
        { returning: true, where: { id: transactionExists.id } }
      );
      // console.log(updateTransaction); return false;

      let updateOrderObj = {};
      updateOrderObj["transactionNo"] = requestData.transactionNo;
      updateOrderObj["paymentStatus"] = 1;
      updateOrderObj["paymentMethod"] = 2;
      // console.log(updateOrderObj);

      let updateOrder = await Order.update(updateOrderObj, {
        returning: true,
        where: { id: orderExists.id },
      });

      let updatedOrder = await Order.findOne({
        where: {
          id: orderExists.id,
        },
        include: [
          {
            model: models.orderDetails,
            required: false,
          },
        ],
      });
      updatedOrder.address = addressExists;
      updatedOrder.dataValues.userEmail = req.user.email;
      // console.log(addedOrder);
      // console.log(req.user);
      // console.log(req.user.email);

      res.status(200).json({
        status: true,
        code: 200,
        message: "Payment done successfully.",
        body: updatedOrder,
      });
    } catch (err) {
      // console.log(err);
      return helper.error(res, err);
      // return responseHelper.onError(res, err)
    }
  },
  paymentviaPaypalFunction: async (req, requestData) => {
    // try {
    // const required = {
    //   security_key: req.headers.security_key,
    //   orderId: req.body.orderId,
    //   transactionNo: req.body.transactionNo,
    // }

    // const nonRequired = {

    // };

    // let requestData = await helper.vaildObject(required, nonRequired, res);

    let timestamp = helper.time();

    let orderExists = await Order.findOne({
      where: {
        id: requestData.orderId,
        // userId: req.user.id,
      },
    });
    if (!orderExists) throw "Invalid value in the parameter orderId.";
    orderExists = orderExists.toJSON();
    if (orderExists.paymentMethod != 2)
      throw "Payment method of this order is not Paypal.";

    let addressExists = await Address.findOne({
      where: {
        id: orderExists.addressId,
      },
    });

    let transactionExists = await Transaction.findOne({
      where: {
        orderId: requestData.orderId,
        // userId: req.user.id,
      },
    });
    if (!transactionExists)
      throw "Transaction for this order was not generated.";
    transactionExists = transactionExists.toJSON();
    // console.log(requestData.transactionNo); return false;
    // console.log(transactionExists); return false;
    // console.log(transactionExists.id); return false;

    let updateTransaction = await Transaction.update(
      {
        transactionNo: requestData.transactionNo,
        paymentStatus: 1,
      },
      { returning: true, where: { id: transactionExists.id } }
    );
    // console.log(updateTransaction); return false;

    let updateOrderObj = {};
    // updateOrderObj["transactionNo"] = requestData.transactionNo;
    updateOrderObj["paymentStatus"] = 1;
    updateOrderObj["paymentMethod"] = 2;
    // console.log(updateOrderObj);

    let updateOrder = await Order.update(updateOrderObj, {
      returning: true,
      where: { id: orderExists.id },
    });

    let updatedOrder = await Order.findOne({
      where: {
        id: orderExists.id,
      },
      include: [
        {
          model: models.orderDetails,
          required: false,
        },
      ],
    });
    updatedOrder.address = addressExists;
    updatedOrder.dataValues.userEmail = req.user.email;
    // console.log(addedOrder);
    // console.log(req.user);
    // console.log(req.user.email);

    // res.status(200).json({
    //   'status': true,
    //   'code': 200,
    //   'message': 'Payment done successfully.',
    //   'body': updatedOrder
    // });

    // } catch (err) {
    //   // console.log(err);
    //   return helper.error(res, err);
    //   // return responseHelper.onError(res, err)
    // }
  },
  paymentKanoo: async (req, res) => {
    try {
      const required = {
        security_key: req.headers.security_key,
        orderId: req.body.orderId,
      };

      const nonRequired = {
        transactionNo: "",
        paymentMethod: 4,
        paymentMethodName: "Kanoo",
      };

      let requestData = await helper.vaildObject(required, nonRequired, res);

      let timestamp = helper.time();

      let orderExists = await Order.findOne({
        where: {
          id: requestData.orderId,
          userId: req.user.id,
        },
      });
      if (!orderExists) throw "Invalid value in the parameter orderId.";
      orderExists = orderExists.toJSON();
      if (orderExists.paymentMethod != requestData.paymentMethod)
        throw `Payment method of this order is not ${requestData.paymentMethodName}.`;

      let addressExists = await Address.findOne({
        where: {
          id: orderExists.addressId,
        },
      });

      let transactionExists = await Transaction.findOne({
        where: {
          orderId: requestData.orderId,
          userId: req.user.id,
        },
      });
      if (!transactionExists)
        throw "Transaction for this order was not generated.";
      transactionExists = transactionExists.toJSON();
      // console.log(requestData.transactionNo); return false;
      // console.log(transactionExists); return false;
      // console.log(transactionExists.id); return false;

      let updateTransaction = await Transaction.update(
        {
          transactionNo: requestData.transactionNo,
          paymentStatus: 1,
        },
        { returning: true, where: { id: transactionExists.id } }
      );
      // console.log(updateTransaction); return false;

      let updateOrderObj = {};
      updateOrderObj["transactionNo"] = requestData.transactionNo;
      updateOrderObj["paymentStatus"] = 1;
      updateOrderObj["paymentMethod"] = requestData.paymentMethod;
      // console.log(updateOrderObj);

      let updateOrder = await Order.update(updateOrderObj, {
        returning: true,
        where: { id: orderExists.id },
      });

      let updatedOrder = await Order.findOne({
        where: {
          id: orderExists.id,
        },
        include: [
          {
            model: models.orderDetails,
            required: false,
          },
        ],
      });
      updatedOrder.address = addressExists;
      updatedOrder.dataValues.userEmail = req.user.email;
      // console.log(addedOrder);
      // console.log(req.user);
      // console.log(req.user.email);

      res.status(200).json({
        status: true,
        code: 200,
        message: "Payment done successfully.",
        body: updatedOrder,
      });
    } catch (err) {
      // console.log(err);
      return helper.error(res, err);
      // return responseHelper.onError(res, err)
    }
  },

  getPaypalWebViewLink: async (req, res) => {
    try {
      const required = {
        security_key: req.headers.security_key,
        totalAmount: req.body.totalAmount,
        orderId: req.body.orderId,
      };

      const nonRequired = {};

      const requestData = await helper.vaildObject(required, nonRequired, res);

      if (isNaN(Number(requestData.totalAmount)))
        throw "Invalid amount for paypal transaction.";

      requestData.totalAmount = Number(requestData.totalAmount).toFixed(2);

      const orderExists = await Order.findOne({
        where: {
          id: requestData.orderId,
          userId: req.user.id,
        },
        raw: true,
      });
      if (!orderExists)
        throw "Invalid orderId received while paypal transaction.";

      let transactionExists = await Transaction.findOne({
        where: {
          orderId: requestData.orderId,
          userId: req.user.id,
        },
      });
      if (!transactionExists)
        throw "Transaction for this order was not generated.";
      transactionExists = transactionExists.toJSON();

      var create_payment_json = {
        intent: "sale",
        payer: {
          payment_method: "paypal",
        },
        redirect_urls: {
          return_url: `${req.protocol}://${req.get(
            "host"
          )}/apiNew/paypalSuccessURL`,
          cancel_url: `${req.protocol}://${req.get(
            "host"
          )}/apiNew/paypalCancelURL`,
        },
        transactions: [
          {
            // "item_list": {
            // 	"items": [{
            // 		"name": "item",
            // 		"sku": "item",
            // 		"price": "1.00",
            // 		"currency": "USD",
            // 		"quantity": 1
            // 	}]
            // },
            amount: {
              currency: "USD",
              total: requestData.totalAmount,
            },
            description: "This is the payment description.",
          },
        ],
      };

      console.log(
        req.user,
        "===========================================================================================================================================================================================================================================================================================================================================================================================================>req.user"
      );

      paypal.payment.create(create_payment_json, async (error, payment) => {
        if (error) {
          return helper.error(res, error);
        } else {
          console.log("Create Payment Response");
          console.log(payment);
          // return helper.success(res, 'Response from paypal.', payment);

          // console.log(requestData.transactionNo); return false;
          // console.log(transactionExists); return false;
          // console.log(transactionExists.id); return false;

          let updateTransaction = await Transaction.update(
            {
              transactionNo: payment.id,
              paymentStatus: 1,
            },
            { returning: true, where: { id: transactionExists.id } }
          );
          // console.log(updateTransaction); return false;

          let updateOrderObj = {};
          updateOrderObj["transactionNo"] = payment.id;
          // console.log(updateOrderObj);

          console.log(
            orderExists.id,
            "==============================>orderExists.id"
          );
          console.log(
            updateOrderObj,
            "==============================>updateOrderObj"
          );

          let updateOrder = await Order.update(updateOrderObj, {
            returning: true,
            where: { id: orderExists.id },
          });

          return res.status(200).json({
            status: true,
            code: 200,
            message: "Response from paypal.",
            body: payment,
          });
        }
      });
    } catch (err) {
      return helper.error(res, err);
    }
  },

  paypalSuccessURL: async (req, res) => {
    const paymentId = req.query.paymentId;
    const PayerID = req.query.PayerID;

    const order = await Order.findOne({
      where: {
        transactionNo: paymentId,
      },
    }).then((orderData) => (orderData ? orderData.toJSON() : orderData));

    console.log(
      order,
      "==============================+>==============================+>==============================+>==============================+>==============================+>==============================+>==============================+>==============================+>==============================+>==============================+>==============================+>==============================+>==============================+>==============================+>==============================+>order"
    );

    if (!order) throw "paymentId was not updated in order.";

    module.exports.paymentviaPaypalFunction(req, {
      orderId: order.id,
      // transactionNo: paymentId,
    });

    // const useragent = req.useragent;

    order.netAmount = Number(order.netAmount).toFixed(2); // final total after adding all the charges

    console.log(
      order.netAmount,
      "===================================================================================================================================================================================================================================================================================================================================================================================================>order.netAmount -----> is being used as total amount of the order"
    );

    var execute_payment_json = {
      payer_id: PayerID,
      transactions: [
        {
          amount: {
            currency: "USD",
            total: order.netAmount,
          },
        },
      ],
    };

    // var paymentId = 'PAYMENT id created in previous step';

    paypal.payment.execute(
      paymentId,
      execute_payment_json,
      function (error, payment) {
        if (error) {
          console.log(error.response);
          throw error;
        } else {
          console.log("Get Payment Response");
          console.log(JSON.stringify(payment));
        }
      }
    );

    console.log("here");
    res.render("paypalSuccessURL", {
      // useragent: useragent
    });
  },

  paypalCancelURL: async (req, res) => {
    // const useragent = req.useragent;

    res.render("paypalCancelURL", {
      // useragent: useragent
    });
  },

  addOrderRating: async (req, res) => {
    try {
      const required = {
        security_key: req.headers.security_key,
        orderId: req.body.orderId,
        rating: req.body.rating,
        deliveryExperience: req.body.deliveryExperience,
      };
      const nonRequired = {
        comment: req.body.comment,
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
          userId: req.user.id,
        },
      });

      const addOrderRatingData = {
        userId: req.user.id,
        orderId: requestData.orderId,
        restaurantId: orderExists.dataValues.restaurantId,
        rating: requestData.rating,
        ...(requestData.deliveryExperience
          ? {
            deliveryExperience: requestData.deliveryExperience,
          }
          : {}),
        ...(requestData.comment
          ? {
            comment: requestData.comment,
          }
          : {}),
      };
      // console.log(addOrderRatingData); return false;

      const addOrderRating = await OrderRating.create(addOrderRatingData);

      // Uploading photo in the /public/images/users folder
      let image = "";
      // console.log(req.files.image); return false;
      if (req.files && req.files.image) {
        image = helper.fileUpload(req.files.image, "users");
        let upOrder = await OrderRating.update(
          { image: image },
          { returning: true, where: { id: addOrderRating.dataValues.id } }
        );

        // console.log(up_user);
      }

      const addedOrderRating = await OrderRating.findOne({
        where: {
          id: addOrderRating.dataValues.id,
        },
      });

      addedOrderRating.image =
        req.protocol +
        "://" +
        req.get("host") +
        "/images/users/" +
        addedOrderRating.image;

      return res.status(200).json({
        status: true,
        code: 200,
        message: "Restaurant Rating added Successfully.",
        body: addedOrderRating,
      });
    } catch (err) {
      console.log(err);
      helper.error(res, err);
    }
  },
  addRating: async (req, res) => {
    try {
      const required = {
        security_key: req.headers.security_key,
        orderId: req.body.orderId,
        ...(req.body.hasOwnProperty("driverRating") && req.body.driverRating
          ? {
            driverId: req.body.driverId,
          }
          : {}),
      };
      const nonRequired = {
        driverRating: req.body.driverRating,
        driverComment: req.body.driverComment,
        orderRating: req.body.orderRating,
        orderComment: req.body.orderComment,
        restaurantRating: req.body.restaurantRating,
        restaurantComment: req.body.restaurantComment,
      };

      let requestData = await helper.vaildObject(required, nonRequired, res);

      if (
        !(
          requestData.hasOwnProperty("orderRating") ||
          requestData.hasOwnProperty("driverRating") ||
          requestData.hasOwnProperty("restaurantRating")
        )
      )
        throw "Either orderRating or driverRating or restaurantRating is required.";

      const orderExists = await Order.findOne({
        where: {
          id: requestData.orderId,
        },
        raw: true,
      });

      if (orderExists == null) {
        throw "Invalid value in the parameter orderId.";
      }
      // console.log(orderExists); return false;

      const responseData = {
        driverRating: {},
        orderRating: {},
        restaurantRating: {},
      };

      if (
        requestData.hasOwnProperty("orderRating") &&
        requestData.orderRating
      ) {
        const deletePreviousOrderRating = await OrderRating.destroy({
          where: {
            orderId: requestData.orderId,
            userId: req.user.id,
          },
        });

        const addOrderRating = {
          userId: req.user.id,
          orderId: requestData.orderId,
          rating: requestData.orderRating,
          restaurantId: orderExists.restaurantId,
          ...(requestData.hasOwnProperty("orderComment") &&
            requestData.orderComment
            ? {
              comment: requestData.orderComment,
            }
            : {
              comment: "",
            }),
        };
        // console.log(addOrderRatingData); return false;

        const orderRating = await OrderRating.create(addOrderRating);
        console.log(orderRating, "=======+>orderRating");
        responseData.orderRating = await OrderRating.findOne({
          where: {
            id: orderRating.dataValues.id,
          },
        });
      }

      if (
        requestData.hasOwnProperty("driverRating") &&
        requestData.driverRating
      ) {
        const deletePreviousDriverRating = await DriverRating.destroy({
          where: {
            orderId: requestData.orderId,
            userId: req.user.id,
          },
        });

        const addDriverRating = {
          userId: req.user.id,
          orderId: requestData.orderId,
          driverId: requestData.driverId,
          rating: requestData.driverRating,
          ...(requestData.hasOwnProperty("driverComment") &&
            requestData.driverComment
            ? {
              comment: requestData.driverComment,
            }
            : {
              comment: "",
            }),
        };
        // console.log(addOrderRatingData); return false;

        const driverRating = await DriverRating.create(addDriverRating);
        responseData.driverRating = await DriverRating.findOne({
          where: {
            id: driverRating.dataValues.id,
          },
        });
      }

      if (
        requestData.hasOwnProperty("restaurantRating") &&
        requestData.restaurantRating
      ) {
        const deletePreviousRestaurantRating = await RestaurantRating.destroy({
          where: {
            orderId: requestData.orderId,
            restaurantId: orderExists.restaurantId,
            userId: req.user.id,
          },
        });

        const addRestaurantRating = {
          userId: req.user.id,
          orderId: requestData.orderId,
          restaurantId: orderExists.restaurantId,
          rating: requestData.restaurantRating,
          ...(requestData.hasOwnProperty("restaurantComment") &&
            requestData.restaurantComment
            ? {
              comment: requestData.restaurantComment,
            }
            : {
              comment: "",
            }),
        };
        // console.log(addOrderRatingData); return false;

        const restaurantRating = await RestaurantRating.create(
          addRestaurantRating
        );
        responseData.restaurantRating = await RestaurantRating.findOne({
          where: {
            id: restaurantRating.dataValues.id,
          },
        });
      }

      return res.status(200).json({
        status: true,
        code: 200,
        message: "Rating added Successfully.",
        body: responseData,
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
      };
      const nonRequired = {};
      let requestData = await helper.vaildObject(required, nonRequired, res);

      // console.log(orderExists); return false;

      let responseData = {};

      const total_users = await db.query(
        `SELECT * FROM restaurant_ratings WHERE restaurant_id=? GROUP BY user_id`,
        {
          replacements: [requestData.restaurantId],
          // model: UserDetails,
          model: OrderRating,
          mapToModel: true,
          type: db.QueryTypes.SELECT,
        }
      );
      const avg_rating = await db.query(
        `SELECT AVG(rating) as rating_count  FROM restaurant_ratings WHERE restaurant_id=?`,
        {
          replacements: [requestData.restaurantId],
          // model: UserDetails,
          model: OrderRating,
          mapToModel: true,
          type: db.QueryTypes.SELECT,
        }
      );
      const one_star_order_ratings = await db.query(
        `SELECT count(rating) as rating_count  FROM restaurant_ratings WHERE restaurant_id=? && rating=1`,
        {
          replacements: [requestData.restaurantId],
          // model: UserDetails,
          model: OrderRating,
          mapToModel: true,
          type: db.QueryTypes.SELECT,
        }
      );
      const two_star_order_ratings = await db.query(
        `SELECT count(rating) as rating_count  FROM restaurant_ratings WHERE restaurant_id=? && rating=2`,
        {
          replacements: [requestData.restaurantId],
          // model: UserDetails,
          model: OrderRating,
          mapToModel: true,
          type: db.QueryTypes.SELECT,
        }
      );
      const three_star_order_ratings = await db.query(
        `SELECT count(rating) as rating_count  FROM restaurant_ratings WHERE restaurant_id=? && rating=3`,
        {
          replacements: [requestData.restaurantId],
          // model: UserDetails,
          model: OrderRating,
          mapToModel: true,
          type: db.QueryTypes.SELECT,
        }
      );
      const four_star_order_ratings = await db.query(
        `SELECT count(rating) as rating_count  FROM restaurant_ratings WHERE restaurant_id=? && rating=4`,
        {
          replacements: [requestData.restaurantId],
          // model: UserDetails,
          model: OrderRating,
          mapToModel: true,
          type: db.QueryTypes.SELECT,
        }
      );
      const five_star_order_ratings = await db.query(
        `SELECT count(rating) as rating_count  FROM restaurant_ratings WHERE restaurant_id=? && rating=5`,
        {
          replacements: [requestData.restaurantId],
          // model: UserDetails,
          model: OrderRating,
          mapToModel: true,
          type: db.QueryTypes.SELECT,
        }
      );

      // console.log(one_star_order_ratings);

      responseData["total_users"] = total_users.length;
      responseData["avg_rating"] = avg_rating[0].dataValues.rating_count;
      responseData["one_star_order_ratings"] =
        one_star_order_ratings[0].dataValues.rating_count;
      responseData["two_star_order_ratings"] =
        two_star_order_ratings[0].dataValues.rating_count;
      responseData["three_star_order_ratings"] =
        three_star_order_ratings[0].dataValues.rating_count;
      responseData["four_star_order_ratings"] =
        four_star_order_ratings[0].dataValues.rating_count;
      responseData["five_star_order_ratings"] =
        five_star_order_ratings[0].dataValues.rating_count;

      return res.status(200).json({
        status: true,
        code: 200,
        message: "Restaurant Order Ratings.",
        body: responseData,
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
      };
      const nonRequired = {};
      let requestData = await helper.vaildObject(required, nonRequired, res);
      // console.log(req.user); return false;
      // console.log(requestData); return false;

      let checkLicense = await DriverLicense.findOne({
        where: { driverId: req.user.id },
      });
     // console.log(req.user.id,'=>sddddddddddd'); return false;

      let responseData = {};
      responseData.upComingJobHistory = {};
      responseData.pastJobHistory = [];

      let upComingJobHistory = await RideRequest.findOne({
        where: {
          driverId: req.user.id,
          response: 1,
          rideStatus: {
            $in: [1, 2],
          },
        },
        order: [["id", "DESC"]],
        include: [
          {
            model: Restaurant,
            required: true,
            include: [
              {
                model: models.restaurantImages,
              }
            ]
          },
          {
            model: Order,
            where: {
              // status: 1
            },
            include: [
              {
                model: models.orderDetails,
                required: false,
                // include: [
                //   {
                //     model: OrderDetailAddons,
                //     required: false,
                //   },
                // ],
              },
            ],
            attributes: Object.keys(Order.attributes).concat([
              [
                sequelize.literal(
                  "IFNULL((SELECT AVG(order_ratings.rating) FROM order_ratings WHERE order_ratings.order_id=order.id),0)"
                ),
                "orderRating",
              ],
            ]),
          },
        ],
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
        upComingJobHistory.vehicle = checkLicense
          ? checkLicense.licenseType
          : "";
        upComingJobHistory.rating = 0;
        // console.log(upComingJobHistory); return false;
        responseData.upComingJobHistory = upComingJobHistory;
      }

      let pastJobHistory = await RideRequest.findAll({
        where: {
          driverId: req.user.id,
          rideStatus: 3,
          
        },
        order: [["id", "DESC"]],
        include: [
          {
            model: Restaurant,
            required: true,
            include: [
              {
                model: models.restaurantImages,
              }
            ]
          },
          {
            model: Order,
            where: {
              // status: 3
            },
            include: [
              {
                model: models.orderDetails,
                required: false,
                // include: [
                //   {
                //     model: OrderDetailAddons,
                //     required: false,
                //   },
                // ],
              },
            ],
            attributes: Object.keys(Order.attributes).concat([
              [
                sequelize.literal(
                  "IFNULL((SELECT AVG(order_ratings.rating) FROM order_ratings WHERE order_ratings.order_id=order.id),0)"
                ),
                "orderRating",
              ],
            ]),
          },
        ],
      });
      // console.log(req.user.id, '==========>req.user.id')
      // console.log(pastJobHistory); return false;

      if (pastJobHistory) {
        pastJobHistory = pastJobHistory.map((rideRequest) => {
          rideRequest = rideRequest.toJSON();
          rideRequest.vehicle = checkLicense ? checkLicense.licenseType : "";
          rideRequest.rating = 0;
          return rideRequest;
        });
        // console.log(pastJobHistory); return false;
        responseData.pastJobHistory = pastJobHistory;
      }

      return res.status(200).json({
        status: true,
        code: 200,
        message: "Job History.",
        body: responseData,
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
      };
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
            // where: {
            // }
          },
        ],
      });
      // console.log(jobHistoryDetail);

      if (!jobHistoryDetail) {
        throw "Invalid value in the parameter jobHistoryId.";
      }

      let orderAddress = {};

      if (jobHistoryDetail && jobHistoryDetail.order) {
        orderAddress = await Address.findOne({
          where: { id: jobHistoryDetail.order.addressId },
        });
      } else {
      }
      // console.log(jobHistoryDetail.order.addressId); return false;

      jobHistoryDetail.dataValues.vehicle = checkLicense
        ? checkLicense.licenseType
        : "";
      jobHistoryDetail.dataValues.fromAddress =
        jobHistoryDetail.restaurant && jobHistoryDetail.restaurant.address
          ? jobHistoryDetail.restaurant.address
          : "";
      jobHistoryDetail.dataValues.ToAddress = orderAddress
        ? orderAddress.address
        : "";
        jobHistoryDetail = jobHistoryDetail.toJSON();
        jobHistoryDetail.order.orderDetails = jobHistoryDetail.order.orderDetails.map(
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
                      quantity: orderDetailAddon.quantity,
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
      // let responseData = {};
      // responseData.upComingJobHistory = upComingJobHistory;
      // responseData.pastJobHistory = pastJobHistory;

      return res.status(200).json({
        status: true,
        code: 200,
        message: "Job History Details.",
        body: jobHistoryDetail,
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
        response: req.body.response, // 1=>Accept, 2=>Reject
      };
      const non_required = {};

      let requestdata = await helper.vaildObject(required, non_required, res);

      if (requestdata.response != 1 && requestdata.response != 2) {
        throw "Invalid value in the parameter response.";
      }

      let upObj = {};
      upObj = {
        response: requestdata.response,
      };
      // console.log(req.user.id);
      // return false;

      if (requestdata != "") {
        let checkRideRequest = await RideRequest.findOne({
          where: {
            id: requestdata.rideRequestId,
            driverId: req.user.id,
          },
          raw: true,
        });

        if (!checkRideRequest) {
          throw "Invalid value in the parameter rideRequestId.";
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
            id: requestdata.rideRequestId,
          },
        });

        if (requestdata.response == 2) {
          await Driver.update(
            {
              status: 1,
            },
            {
              where: {
                id: req.user.id,
              },
            }
          );
        }

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

        if (getRideRequest.user && getRideRequest.user.photo) {
          // getRideRequest.user.photo =
          //   req.protocol +
          //   "://" +
          //   req.get("host") +
          //   "/images/users/" +
          //   getRideRequest.user.photo;

            
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
          // getRideRequest.user.photo =
          //   req.protocol +
          //   "://" +
          //   req.get("host") +
          //   "/images/users/" +
          //   getRideRequest.user.photo;
//console.log(getRideRequest.user.photo);
//return false
          getRideRequest.user.photo =
             req.protocol +
             "://" +
             req.get("host") +
             "/images/users/" +
             getRideRequest.user.photo;
        }
        getRideRequest = getRideRequest.toJSON();
        let getRideRequestdata = getRideRequest;
         //console.log(getRideRequestdata.order.id,'=>dfdfdfd');
//return false;

        
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
                      quantity: orderDetailAddon.quantity,
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

        //
        let dataForPush = {};
        let message = "";
        dataForPush.message = "";
        if (requestdata.response == 1) {
          message = "Ride request accepted successfully.";
          dataForPush.message = `${getRideRequest.driver.fullName} has accepted the ride request.`;
        } else {
         // console.log('ijij');
          //return false;
          message = "Ride request rejected successfully.";
          dataForPush.message = `${getRideRequest.driver.fullName} has rejected the ride request.`;
          
             
        }

        const payloadData = { ...getRideRequest };

        // if (requestdata.rideStatus != 2) {
        delete payloadData.order;
        delete payloadData.restaurant;
        delete payloadData.driver;
        delete payloadData.userAddress;
        // }
        if (getRideRequest.user && getRideRequest.user.deviceToken != "") {
          dataForPush.type = requestdata.response;
          dataForPush.receiverId = getRideRequest.user.id;
          dataForPush.rideData = payloadData;
          dataForPush.deviceToken = getRideRequest.user.deviceToken;
          dataForPush.code = 5;
         // helper.sendPushNotification(dataForPush);
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
        addNotificationObj["code"] = 5;
       // let addNotification = await Notifications.create(addNotificationObj);

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
        console.log(checkRideRequest.rideStatus, '=====>checkRideRequest.dataValues.rideStatus');
        let upddateRideRequest = await RideRequest.update(upObj, {
          returning: true,
          where: {
            id: requestdata.rideRequestId,
          },
        });

        // console.log(requestdata.rideStatus == 3, '=====>requestdata.rideStatus == 3');
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
        /* if (requestdata.rideStatus == 4){
          await Order.update(
            {
              status: 1, 
            },
            { 
              where: {
                id: checkRideRequest.orderId,
              },
            }
          );
        } */

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
        let   getRideRequestdata = getRideRequest;
        getRideRequest = getRideRequest.toJSON();
  
         console.log(getRideRequest);
         console.log(getRideRequest.restaurant);

        let dataForPush = {};
        dataForPush.message = "";
        let message = "Something went wrong.";

        if (requestdata.rideStatus == 2) {
          message = "Ride started successfully.";
          dataForPush.message = `${getRideRequest.driver.fullName} has picked up your order from ${getRideRequest.restaurant.name} (#${getRideRequest.orderId}).`; 

          console.log(dataForPush.message,"==================message has picked up your order from ====")

        } else if (requestdata.rideStatus == 3) {
          message = "Ride completed successfully.";
          dataForPush.message = `${getRideRequest.driver.fullName} has completed the trip from ${getRideRequest.restaurant.name} (#${getRideRequest.orderId}).`;
          
          console.log(dataForPush.message, "==================completedmessage====")
          
        } else if (requestdata.rideStatus == 4) {

          message = "Ride cancelled successfully.";
          dataForPush.message = `${getRideRequest.driver.fullName} has cancelled the trip from ${getRideRequest.restaurant.name} (#${getRideRequest.orderId}).`;
          console.log(dataForPush.message, "==================cancelled dmessage====")

          Order.update(
            {
              receiptUpload:'',
            },
            {
              returning: true,
              where: {
                id: getRideRequestdata.order.id,
              },
            }
          );
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
          if(checkRideRequest.rideStatus==1) {
            if(requestdata.rideStatus != 4) {              
              helper.sendPushNotification(dataForPush);
            } 
          } else {            
                helper.sendPushNotification(dataForPush); 
           } 
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
        if(checkRideRequest.rideStatus==1) {
            if(requestdata.rideStatus != 4) {              
             let addNotification = await Notifications.create(addNotificationObj);
            } 
          } else {            
               let addNotification = await Notifications.create(addNotificationObj);
           } 
        

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
      const non_required = {};

      let requestdata = await helper.vaildObject(required, non_required, res);

      let getRideRequest = await RideRequest.findOne({
        where: {
          id: requestdata.rideRequestId,
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
            ],
          },
        ],
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
        getRideRequest.user.photo =
          req.protocol +
          "://" +
          req.get("host") +
          "/images/users/" +
          getRideRequest.user.photo;
      }

      let message = "Get Ride Details.";

      return res.status(200).json({
        status: true,
        code: 200,
        message: message,
        body: getRideRequest,
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
      const non_required = {};

      let requestdata = await helper.vaildObject(required, non_required, res);

      // console.log(req.user.id);
      // return false;

      if (requestdata != "") {
        let getRideRequest = await RideRequest.findOne({
          where: {
            driverId: req.user.id,
            rideStatus: {
              $in: [1, 2],
            },
            response: {
              $ne: 2,
            },
          },
          order: [["id", "DESC"]],
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
                "loginType",
              ],
            },
          ],
        });

        if (!getRideRequest) {
          throw "No current ride found.";
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
          if(getRideRequest.user.loginType != 1){
          getRideRequest.user.photo =
            req.protocol +
            "://" +
            req.get("host") +
            "/images/users/" +
            getRideRequest.user.photo;
          }
        }

        getRideRequest = getRideRequest.toJSON();
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
                      quantity: orderDetailAddon.quantity,
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

        let message = "Get current ride.";

        return res.status(200).json({
          status: true,
          code: 200,
          message: message,
          body: getRideRequest,
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
        rideId: req.body.rideId,
      };
      const non_required = {};

      let requestdata = await helper.vaildObject(required, non_required, res);

      console.log(req.user, '=======>req.user');

      if (requestdata != "") {
        let getRideRequest = await RideRequest.findOne({
          where: {
            id: requestdata.rideId,
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

        if (!getRideRequest) {
          throw "Invalid value in the parameter rideId.";
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
        let dataForPushDriver = {};
        dataForPush.message = "";
        dataForPushDriver.message = "";
        let message = "Driver has reached the location.";

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
          dataForPush.message = `Driver ${getRideRequest.driver.fullName} has reached the location.`;
          dataForPush.code = 7;
          helper.sendPushNotification(dataForPush);
        }

        if (getRideRequest.driver && getRideRequest.driver.deviceToken != "") {
          dataForPushDriver.type = requestdata.rideStatus;
          dataForPushDriver.receiverId = getRideRequest.driver.id;
          dataForPushDriver.rideData = payloadData;
          dataForPushDriver.deviceToken = getRideRequest.driver.deviceToken;
          // dataForPushDriver.deviceToken = '99CA02C5DCC23F2474AD8A7A01C92656060E0D949255865EAB48B5BDA3406B86';
          dataForPushDriver.message = `Location sent to ${getRideRequest.user.firstName
            }${getRideRequest.user.lastName
              ? ` ${getRideRequest.user.lastName}`
              : ""
            } successfully.`;
          dataForPushDriver.code = 8;
          helper.sendPushNotificationDriver(dataForPushDriver);
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
        addNotificationObj["code"] = 7;
        let addNotificationUser = await Notifications.create(
          addNotificationObj
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
  paymentStatusListingDriver: async (req, res) => {
    try {
      const required = {
        security_key: req.headers.security_key,
      };

      const nonRequired = {};

      let requestData = await helper.vaildObject(required, nonRequired, res);

      let rideRequest = await RideRequest.findAll({
        where: {
          driverId: req.user.id,
        },

        order: [["id", "DESC"]],

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
              "id",
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

      let responseData = [];

      if (rideRequest) {
        responseData = rideRequest;
      }

      return res.status(200).json({
        status: true,
        code: 200,
        message: "Payment Status Driver.",
        body: responseData,
      });
    } catch (err) {
      // console.log(err);
      return helper.error(res, err);
      // return responseHelper.onError(res, err)
    }
  },
  paymentStatusListingDriverlive: async (req, res) => {
    try {
      const required = {
        security_key: req.headers.security_key,
      };

      const nonRequired = {
        type: req.body.type,
      };

      let requestData = await helper.vaildObject(required, nonRequired, res);
     
      var orderDetailsThisDay1 = await db.query(
        `select IFNULL(SUM(delivery_fee), 0) as total_delivery_fee, IFNULL(SUM(tip), 0) as total_tip FROM ride_requests as rr JOIN orders as o ON rr.order_id=o.id WHERE rr.completedAt > CURDATE() && rr.driver_id=? && rr.ride_status=3`,
        {
          replacements: [req.user.id],
          mapToModel: true,
          type: db.QueryTypes.SELECT,
        }
      );

      var orderDetailsThisWeek1 = await db.query(
        `select IFNULL(SUM(delivery_fee), 0) as total_delivery_fee, IFNULL(SUM(tip), 0) as total_tip FROM ride_requests as rr JOIN orders as o ON rr.order_id=o.id WHERE rr.completedAt > TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL - WEEKDAY(CURDATE()) DAY)) && rr.driver_id=? && rr.ride_status=3`,
        {
          replacements: [req.user.id],
          mapToModel: true,
          type: db.QueryTypes.SELECT,
        }
      );

      var orderDetailsThisMonth1 = await db.query(
        `select IFNULL(SUM(delivery_fee), 0) as total_delivery_fee, IFNULL(SUM(tip), 0) as total_tip FROM ride_requests as rr JOIN orders as o ON rr.order_id=o.id WHERE rr.completedAt > TIMESTAMP(DATE_FORMAT(NOW() ,'%Y-%m-01')) && rr.driver_id=? && rr.ride_status=3`,
        {
          replacements: [req.user.id],
          mapToModel: true,
          type: db.QueryTypes.SELECT,
        }
      );
      var responseDatabytype = "";
      var queryyy="";
      if(requestData.type==0) {
        responseDatabytype = orderDetailsThisDay1[0]
        queryyy=`rideRequests.created_at > CURDATE()`
      } else if(requestData.type==1) {
         queryyy=`rideRequests.created_at > TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL - WEEKDAY(CURDATE()) DAY))`
        responseDatabytype = orderDetailsThisWeek1[0]
      } else if (requestData.type==2) {
        queryyy=`rideRequests.created_at > TIMESTAMP(DATE_FORMAT(NOW() ,'%Y-%m-01'))`
        responseDatabytype = orderDetailsThisMonth1[0]
      } else {
        queryyy=`rideRequests.created_at  > CURDATE()`
        responseDatabytype = orderDetailsThisDay1[0]
      }
       let tempobj={}
       tempobj.driverId=req.user.id
       tempobj.rideStatus= {
        [Op.not]: 4, 
       }
      /* tempobj.response = {
        [Op.notIn]: [2] 
      } */
       tempobj.createdAt = sequelize.literal((queryyy))
      let rideRequest = await RideRequest.findAll({
        where: tempobj,
        order: [["id", "DESC"]],
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
              "id",
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

      let responseData = [];
      var responseData2
      if (rideRequest) {
         responseData2 = {
          order: rideRequest,
          earning: responseDatabytype,
        };
      } else {
        responseData2 = {
          order: [],
          earning:responseDatabytype,
        };
      }

      return res.status(200).json({
        status: true,
        code: 200,
        message: "Payment Status Driver.",
        body: responseData2,
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
      };

      const nonRequired = {};

      let requestData = await helper.vaildObject(required, nonRequired, res);

      const orderDetailsThisDay = await db.query(
        `select IFNULL(SUM(delivery_fee), 0) as total_delivery_fee, IFNULL(SUM(tip), 0) as total_tip FROM ride_requests as rr JOIN orders as o ON rr.order_id=o.id WHERE rr.completedAt > CURDATE() && rr.driver_id=? && rr.ride_status=3`,
        {
          replacements: [req.user.id],
          mapToModel: true,
          type: db.QueryTypes.SELECT,
        }
      );

      const orderDetailsThisWeek = await db.query(
        `select IFNULL(SUM(delivery_fee), 0) as total_delivery_fee, IFNULL(SUM(tip), 0) as total_tip FROM ride_requests as rr JOIN orders as o ON rr.order_id=o.id WHERE rr.completedAt > TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL - WEEKDAY(CURDATE()) DAY)) && rr.driver_id=? && rr.ride_status=3`,
        {
          replacements: [req.user.id],
          mapToModel: true,
          type: db.QueryTypes.SELECT,
        }
      );

      const orderDetailsThisMonth = await db.query(
        `select IFNULL(SUM(delivery_fee), 0) as total_delivery_fee, IFNULL(SUM(tip), 0) as total_tip FROM ride_requests as rr JOIN orders as o ON rr.order_id=o.id WHERE rr.completedAt > TIMESTAMP(DATE_FORMAT(NOW() ,'%Y-%m-01')) && rr.driver_id=? && rr.ride_status=3`,
        {
          replacements: [req.user.id],
          mapToModel: true,
          type: db.QueryTypes.SELECT,
        }
      );

      let responseData = {
        day: orderDetailsThisDay[0],
        week: orderDetailsThisWeek[0],
        month: orderDetailsThisMonth[0],
      };

      return res.status(200).json({
        status: true,
        code: 200,
        message: "Earnings Fetched Successfully.",
        body: responseData,
      });
    } catch (err) {
      // console.log(err);
      return helper.error(res, err);
      // return responseHelper.onError(res, err)
    }
  },
  earningsDataBasedOnDates: async (req, res) => {
    try {
      const required = {
        security_key: req.headers.security_key,
        fromDate: req.body.fromDate,
        toDate: req.body.toDate,
      };

      const nonRequired = {};

      let requestData = await helper.vaildObject(required, nonRequired, res);

      const formattedFromDate = moment(requestData.fromDate, 'DD/MM/YYYY').unix();
      const formattedToDate = moment(requestData.toDate, 'DD/MM/YYYY').add(1, 'days').unix();
      // console.log(formattedDate, '======>formattedDate');
      // return;

      const orderDetailsThisMonth = await db.query(
        `select IFNULL(SUM(delivery_fee), 0) as total_delivery_fee, IFNULL(SUM(tip), 0) as total_tip FROM ride_requests as rr JOIN orders as o ON rr.order_id=o.id WHERE rr.completedAt >= FROM_UNIXTIME(${formattedFromDate}) && rr.completedAt <= FROM_UNIXTIME(${formattedToDate}) && rr.driver_id=? && rr.ride_status=3`,
        {
          replacements: [req.user.id],
          mapToModel: true,
          type: db.QueryTypes.SELECT,
        }
      );

      let rideRequest = await RideRequest.findAll({
        where: {
          /* response:{             
            [Op.notIn]: [2]             
          }, */
          rideStatus: {
            [Op.not]: 4, 
          },
          driverId: req.user.id,
          createdAt: {
            [Op.gte]: moment(formattedFromDate, 'X').toDate(),
            [Op.lte]: moment(formattedToDate, 'X').toDate(),
          }
        },

        order: [["id", "DESC"]],

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
              "id",
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
      })

      // .filter(modelItem => {
      //   modelItem = modelItem.toJSON()

      //   const unixCompletedAt = moment(modelItem.completedAt).unix();
      //   console.log(helperFunctions.isValidDate(modelItem.completedAt), '=======================>modelItem.completedAt');
      //   console.log(typeof modelItem.completedAt, '=======================>typeof modelItem.completedAt');

      //   // return true;
      //   return !helperFunctions.isValidDate(modelItem.completedAt) ||  (helperFunctions.isValidDate(modelItem.completedAt) && unixCompletedAt >= formattedFromDate && unixCompletedAt <= formattedToDate);
      // });

      let responseData = {
        earnings: orderDetailsThisMonth[0],
        rideRequest: rideRequest,
      };

      return res.status(200).json({
        status: true,
        code: 200,
        message: "Earnings Fetched Successfully.",
        body: responseData,
      });
    } catch (err) {
      // console.log(err);
      return helper.error(res, err);
      // return responseHelper.onError(res, err)
    }
  },

  sendWalletGift: async (req, res) => {
    try {
      const required = {
        security_key: req.headers.security_key,
        receiverId: req.body.receiverId,
        amount: req.body.amount,
      };
      const nonRequired = {};
      let requestData = await helper.vaildObject(required, nonRequired, res);
      

      let chkUser = await User.findOne({
        where: {
          id:req.user.id,
        },
        attributes: [
            'id', 'email', 'firstName', 'lastName', 'username', 'country_code', 'phone', 'country_code_phone', 'photo', 'wallet_amount' , 'created_at', 'updated_at'
        ],
      });
      if(!chkUser){
        throw "Invalid value in the parameter receiverId.";
      }

      let getUser = await User.findOne({
        where: {
          id:req.user.id,
        },
        attributes: [
            'id', 'email', 'firstName', 'lastName', 'username', 'country_code', 'phone', 'country_code_phone', 'photo', 'wallet_amount' , 'created_at', 'updated_at'
        ],
      });
      if(requestData.amount > getUser.dataValues.wallet_amount){
        throw "Invalid value in the parameter amount.";
      }

      if(getUser.dataValues.wallet_amount){
         balance =  getUser.dataValues.wallet_amount - requestData.amount;
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

      const wallet_transactions = await WalletPayments.create(
        {
          userId: getUser.dataValues.id,
            amount: requestData.amount,
            closingBalance: balance,
            transactionId:'121212',
            transactionType:4,
            createdAt:new Date().toISOString()
        });
       
      if(chkUser.dataValues.wallet_amount){
        wallet_balance =  chkUser.dataValues.wallet_amount + requestData.amount;
     } 
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
        const wallet_transactions2 = await WalletPayments.create(
          {
            userId: chkUser.dataValues.id,
              amount: requestData.amount,
              closingBalance: wallet_balance,
              transactionId:'3232',
              senderId:getUser.dataValues.id,
              transactionType:5,
              createdAt:new Date().toISOString()
          });
  

      return res.status(200).json({
        status: true,
        code: 200,
        message: "Earnings Fetched Successfully.",
        body: responseData,
      });
    } catch (err) {
      // console.log(err);
      return helper.error(res, err);
      // return responseHelper.onError(res, err)
    }
},
uploadReceipt: async (req, res) => {
  console.log('sfsfdsf');return false;
    // try {
         const required = {
             security_key: req.headers.security_key,
             orderId: req.body.orderId,
         };
         const non_required = {
         };
         let requestdata = await helper.vaildObject(required, non_required, res);
      
         // return false;
         let upObj = {};
         upObj = { ...requestdata };
         delete upObj['security_key'];
         upObj['driverId'] = req.user.id;
         // console.log(checkLicense.id); return false;
             let image = "";
             if (req.files && req.files.receiptUpload) {
                 image = helper.fileUpload(req.files.receiptUpload, 'drivers');
                 let up_user = await Order.update({ receiptUpload: image },
                     { returning: true, where: { id: requestdata.orderId } });
             }
             let getLicense = await Order.findOne({
                 where: { id: receiptUpload.orderId },
                 // attributes: [
                 // ]
             });
             if (getLicense.receiptUpload != '') {
                 getLicense.receiptUpload = req.protocol + '://' + req.get('host') + '/images/drivers/' + getLicense.orderId;
             }
             return res.status(200).json({
                 'status': true,
                 'code': 200,
                 'message': 'Receipt uploaded successfully',
                 'body': getLicense
             });
         // } catch (err) {
         //     console.log(err);
         //     responseHelper.onError(res, err);
         //   }
 },

   


   




};

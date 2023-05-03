const model = require("../models");
const helper = require("../config/helper");
const User = model.users;
const Driver = model.drivers;
const Order = model.orders;
const Transaction = model.transactions;
var jwt = require("jsonwebtoken");
let secretKey = "secret";

module.exports = {
  getData: async (req, res) => {
    try {
      const required = {
        security_key: req.headers.security_key,
        model: req.body.model
      };
      const non_required = {
        limit: req.body.limit,
        offset: req.body.offset,
      };

      let requestData = await helper.vaildObject(required, non_required, res);
      // console.log(req.user);

      const responseData = await model[requestData.model].findAll({
        ...(
          requestData.hasOwnProperty('limit') && requestData.limit
          ? {
            limit: requestData.limit
          } : {}
        ),
        ...(
          requestData.hasOwnProperty('offset') && requestData.offset
          ? {
            offset: requestData.offset
          } : {}
        ),
        order: [["id", "DESC"]]
      });

      return res.status(200).json({
        status: true,
        code: 200,
        message: "Data Listing.",
        body: responseData
      });
    } catch (err) {
      console.log(err);
      helper.error(res, err);
      // throw err;
    }
  },
  updateData: async (req, res) => {
    try {
      const required = {
        security_key: req.headers.security_key,
        id: req.body.id,
        model: req.body.model
      };
      const non_required = {
        ...req.body
      };

      let requestData = await helper.vaildObject(required, non_required, res);
      // console.log(req.user);

      const updatedData = await model[requestData.model].update(
        {
          ...requestData
        },
        { returning: true, where: { id: requestData.id } }
      );

      const responseData = await model[requestData.model].findOne({
        where: {
          id: requestData.id
        }
      });

      return res.status(200).json({
        status: true,
        code: 200,
        message: "Data updated successfully.",
        body: responseData
      });
    } catch (err) {
      console.log(err);
      helper.error(res, err);
      // throw err;
    }
  },
  deleteData: async (req, res) => {
    try {
      const required = {
        security_key: req.headers.security_key,
        // id: req.body.id,
        model: req.body.model
      };
      const non_required = {
        ...req.body
      };

      let requestData = await helper.vaildObject(required, non_required, res);
      // console.log(req.user);

      // const updatedData = await model[requestData.model].update(
      //   {
      //     ...requestData
      //   },
      //   { returning: true, where: { id: requestData.id } }
      // );

      const whereObj = { ...requestData };
      delete whereObj.security_key;
      delete whereObj.model;

      const responseData = await model[requestData.model].destroy({
        where: whereObj
      });

      return res.status(200).json({
        status: true,
        code: 200,
        message: "Data deleted successfully.",
        body: {}
      });
    } catch (err) {
      console.log(err);
      helper.error(res, err);
      // throw err;
    }
  },

  kanooopay: async (req, res) => {
    try {
      const required = {
        orderId: req.body.orderId,
        amount: req.body.amount
      };
      const non_required = {};

      let requestData = await helper.vaildObject(required, non_required, res);

      const axios = require('axios');
      var querystring = require('querystring');
      console.log(`${req.get("host")}`);
      axios.post('https://api.kanoopays.com/visipay/api/external/payment/request/token', querystring.stringify({
        "X-TENANT": "kanoo",
        //"userId": "419",
        "userId": "13904",
        "orderId": requestData.orderId,
        "currency": "USD",
        "amount": requestData.amount,
        // "redirectUrl": 'http://localhost:8008/apiNew/kanoopaySuccessUrl?orderId='+requestData.orderId,
        // "callbackUrl": 'http://localhost:8008/apiNew/kanoopayCancelUrl',
        //"redirectUrl": `${req.protocol}://${req.get("host")}/apiNew/kanoopaySuccessUrl?orderId=${requestData.orderId}`,
       // "callbackUrl":`${req.protocol}://${req.get("host")}/apiNew/kanoopayCancelUrl`,
        "redirectUrl": `http://localhost:8008/apiNew/kanoopaySuccessUrl?orderId='`+requestData.orderId,
        "callbackUrl":`https://www.google.com/`,
       // "authenticationKey": "4F451CF126E24165A7604DF24FD3409B"
       "authenticationKey": "597BB363CD8A4789BACD56A9A361F3D2"
      }), config = {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          'X-TENANT': 'kanoo'
        }
      })
        .then(async function (response) {

          //let update PaymentStatus//

         let updateOrder = await Order.update({
            // 'transactionNo': requestData.orderId,
            'paymentMethod': 4
          },
          {
            where:{
              id:requestData.orderId
            }
          });
            
          return res.status(200).json({
            status: true,
            code: 200,

            message: "Hash Key Generated",
            body: {
              hashKey: "https://external.kanoopays.com/pay/login/" + response.data.result
            }
          });
        })
        .catch(function (error) {
          helper.error(res, error);
        });
    } catch (err) {
      helper.error(res, err);
    }
  },


  kanoopaySuccessUrl: async (req, res) => {
    try {
      console.log(req.query,"==========sss",req.params,req.body);
      let updateOrder = await Order.update({
        // 'transactionNo': requestData.orderId,
        'paymentStatus': 1
      },
        { returning: true, where: { id: req.query.orderId } });
      // let updateTransaction = await Transaction.update({
      //   // 'transactionNo': requestData.orderId,
      //   'paymentStatus': 1
      // },
      //   { returning: true, where: { id: transactionExists.id } });


      res.render('kanoopaySuccessUrl');
    } catch (err) {
      helper.error(res, err);
    }
  },

  kanoopayCancelUrl: async (req, res) => {
    try {
      res.render('kanoopayCancelUrl');
    } catch (err) {
      helper.error(res, err);
    }
  }
};

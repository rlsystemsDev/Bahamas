const model = require("../../models");
const helper = require("../../config/helper");
const User = model.users;
const Driver = model.drivers;
const Order = model.orders;
const Transaction = model.transactions;
var jwt = require("jsonwebtoken");
let secretKey = "secret";
const https = require('https')

module.exports = {
  getData: async (req, res) => {
    try {
      const required = {
        security_key: req.headers.security_key,
        model: req.body.model
      };
      const non_required = {};

      let requestData = await helper.vaildObject(required, non_required, res);
      // console.log(req.user);

      const responseData = await model[requestData.model].findAll({
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

      axios.post('https://api.kanoopays.com/visipay/api/external/payment/request/token', querystring.stringify({
        "X-TENANT": "kanoo",
        "userId": "419",
        "orderId": requestData.orderId,
        "currency": "USD",
        "amount": requestData.amount,
        //"redirectUrl": 'https://bahamaeats.com:8008/apiNew/kanoopaySuccessUrl/'+requestData.orderId,
        //"callbackUrl": 'https://bahamaeats.com:8008/apiNew/kanoopayCancelUrl',
        "redirectUrl": 'http://localhost:8008/apiNew/kanoopaySuccessUrl/'+requestData.orderId,
        "callbackUrl": 'http://localhost:8008/apiNew/kanoopayCancelUrl',
        "authenticationKey": "4F451CF126E24165A7604DF24FD3409B"
      }), config = {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          'X-TENANT': 'kanoo'
        }
      })
        .then(function (response) {
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
      // let updateOrder = await Order.update({
      //   // 'transactionNo': requestData.orderId,
      //   'paymentStatus': 1
      // },
      //   { returning: true, where: { id: orderExists.id } });

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

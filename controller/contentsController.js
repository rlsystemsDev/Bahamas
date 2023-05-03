const model = require('../models');
const helper = require('../config/helper');
const Content = model.contents;
var jwt = require('jsonwebtoken');
let secretKey = 'secret';

module.exports = {

    termsAndConditions: async (req, res) => {
        try {
            const required = {
                security_key: req.headers.security_key,
            };
            const non_required = {};

            let requestdata = await helper.vaildObject(required, non_required, res);
            // console.log(req.user);
            
            let getContent = await Content.findOne({
               where: {
                   type: 1
               },
               attributes: [
                   'title', 'content'
               ]
            });

            if (!getContent) {
                throw "Terms And Conditions could not be found.";
            }
            
            res.status(200).json({
                'status': true,
                'code': 200,
                'message': 'Terms And Conditions.',
                'body': getContent
            });
            
        } catch(err) {
            console.log(err);
            helper.error(res, err);
        }
    },

    privacyPolicy: async (req, res) => {
        try {
            const required = {
                security_key: req.headers.security_key,
            };
            const non_required = {};

            let requestdata = await helper.vaildObject(required, non_required, res);
            // console.log(req.user);
            
            let getContent = await Content.findOne({
               where: {
                   type: 3
               },
               attributes: [
                'title', 'content'
            ]
            });

            if (!getContent) {
                throw "Privacy could not be found.";
            }
            
            res.status(200).json({
                'status': true,
                'code': 200,
                'message': 'Privacy Policy.',
                'body': getContent
            });
            
        } catch(err) {
            console.log(err);
            helper.error(res, err);
        }
    },

    help: async (req, res) => {
        try {
            const required = {
                security_key: req.headers.security_key,
            };
            const non_required = {};

            let requestdata = await helper.vaildObject(required, non_required, res);
            // console.log(req.user);
            
            let getContent = await Content.findOne({
               where: {
                   type: 4
               },
               attributes: [
                'title', 'content'
            ]
            });

            if (!getContent) {
                throw "Help could not be found.";
            }
            
            res.status(200).json({
                'status': true,
                'code': 200,
                'message': 'Help Page.',
                'body': getContent
            });
            
        } catch(err) {
            console.log(err);
            helper.error(res, err);
        }
    },
    
    
}
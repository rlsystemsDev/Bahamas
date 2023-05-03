const model = require('../../models');
const helper = require('../../config/helper');
const Faq = model.faqs;
var jwt = require('jsonwebtoken');
let secretKey = 'secret';

module.exports = {

    getFaqs: async (req, res) => {
        try {
            const required = {
                security_key: req.headers.security_key,
            };
            const non_required = {};

            let requestdata = await helper.vaildObject(required, non_required, res);
            // console.log(req.user);
            
            let getFaqs = await Faq.findAll({
                order: [
                    ['updatedAt', 'DESC']
                ]
            });
            
            res.status(200).json({
                'status': true,
                'code': 200,
                'message': 'Faqs Listing.',
                'body': getFaqs
            });
            
        } catch(err) {
            console.log(err);
            helper.error(res, err);
            // throw err;
        }
    },
    
    
}
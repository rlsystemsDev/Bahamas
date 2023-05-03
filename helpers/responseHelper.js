const boom = require('boom');

const get = (res, resData) => {
  return res.json({ 
    code: 200,
    message: '',
    body: resData
  });
}

const post = (res, resData, message) => {
  return res.json({ 
    code: 200,
    message: message || '',
    body: resData
  });
}

const del = (res, resData) => {
  return res.json({ 
    code: 200,
    message: '',
    body: resData
  });
}


const put = (res, resData) => {
  return res.json({ 
    code: 200,
    message: '',
    body: resData
  });
}

const getError = (err, message) => {
  // console.log(err);
  return {
    code: 403,
    message: err,
    body: {
      // Error: err
    }
   };
}

const unauthorized = (res, message) => {
  return res.json({
    code: 401,
    message: 'User is Unauthorized',
    body: {}
  });
}

const onError = (res, err, message = '') => {
  // console.log(err);
  // console.log(boom.badRequest(message));
  // console.log(getError(message));
  return res.json(getError(err, message));
}

module.exports = {
  get,
  post, 
  put,
  del,
  onError,
  unauthorized
}
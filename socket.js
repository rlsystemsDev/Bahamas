const models = require('./models');

const sequelize = require('sequelize');
const { Op } = sequelize;

const socketHelper = require('./helpers/socketHelper');
const socketResponse = require('./helpers/socketResponse');
const users = models.users;
const socket_users = models.socket_users;
/*
|----------------------------------------------------------------------------------------------------------------------------
|   Exporting all methods
|----------------------------------------------------------------------------------------------------------------------------
*/

module.exports = function (io) {
  global.log = function (value, key) {
    console.log(JSON.stringify(value, null, 2), `:=======================================================>${key}`);
  }

  io.on('connection', function (socket) {
    console.log('connected socket')

    const secure = socket.handshake.secure;
    global.socketBaseUrl = `${secure ? 'https' : 'http'}://${socket.handshake.headers.host}`;
    log(socketBaseUrl, 'socketBaseUrl');
    // log(socket.handshake, 'socket.handshake');


    console.log("socket Connected");

    /*
    |----------------------------------------------------------------------------------------------------
    | connectUser
    |----------------------------------------------------------------------------------------------------
    |
      type: 1=>user, 2=>driver
      {
        type: 1,
        "userId": 105
      }

    */


    socket.on('connectUser', async function (data) {
      try {
        const required = {
          type: data.type, //1=>user, 2=>driver
          userId: data.userId,
        };
        const nonRequired = {};
        const requestData = await socketHelper.vaildSocketObject(required, nonRequired);

        if (![1, 2].includes(parseInt(requestData.type))) throw "Invalid type (use 1 => user, 2 => driver).";

        const socketId = socket.id;
        // log(requestData, "requestData");
        // log(socketId, "socketid");

        const checkSocket = await socketHelper.checkSocketId(requestData, socketId);
 
        if (data.type == 1) { 
         
          var checkUserOnline = await users.findOne({
            where:{
              id:data.userId
            }
          });

          if (checkUserOnline) {

            await users.update({
              isOnline:1
            },{
              where:{
                id: data.userId
              }
            });
          }
        }
        return socketResponse.success(socket, 'connectListener', 'connected successfully.', {
          socketId,
          userId: requestData.userId,
        });
      } catch (error) {
        return socketResponse.error(error, socket, 'connectListener');
      }
    });

    socket.on('disconnect', async function () {
      let socketId = socket.id
      log(socketId, "socketId in disconnect emitter");

      const socketUser = await models.socket_users.findOne({
        where: {
          socketId:socketId
        }
      }); 
      if (socketUser){

        if (socketUser.type == 1){
          
          await users.update({
            isOnline: 0
          }, {
            where: {
              id: socketUser.userId
            }
          });
        }      
      }
      await socketHelper.socketDisconnect(socketId);
      console.log('socket user disconnected');
    });

    /*
    |----------------------------------------------------------------------------------------------------
    | sendLatLng
    |----------------------------------------------------------------------------------------------------
    |

      {
        "receiverId": 104,
        "receiverType": 1,
        "latitude": 30.192414,
        "longitude": 76.12341
      }

    */
    socket.on('sendLatLng', async function (data) {
      try {
        const required = {
          receiverId: data.receiverId,
          receiverType: data.receiverType,
          latitude: data.latitude,
          longitude: data.longitude,
        };
        const nonRequired = {};
        const requestData = await socketHelper.vaildSocketObject(required, nonRequired);

        if (![1, 2].includes(parseInt(requestData.receiverType))) throw "Invalid type (use 1 => user, 2 => driver).";

        const socketUser = await socketHelper.getSocketByUserId(requestData.receiverType, requestData.receiverId, 'receiverId');
        if (!socketUser) throw "Invalid receiver not connected.";
        log(socketUser, 'socketUser');
        // return;

        socketResponse.successTo(socket, socketUser.socketId, 'receiveLatLng', 'Lat lng received successfully.', requestData);

        return socketResponse.success(socket, 'receiveLatLng', 'Lat lng sent successfully.', requestData);
      } catch (error) {
        return socketResponse.error(error, socket, 'receiveLatLng');
      }
    });

    /*
    |----------------------------------------------------------------------------------------------------
    | go_offline
    |----------------------------------------------------------------------------------------------------
    |
      {
        "userId": 105,
      }
    */
    socket.on('go_offline', function (data) {
      console.log('go_offline', data)
      socket.broadcast.emit('rest_offline', data);
    })

    /*
    |----------------------------------------------------------------------------------------------------
    | boilerPlate for socket emitter listener structure
    |----------------------------------------------------------------------------------------------------
    |

      {
        "userId": 105,
      }

    */
    socket.on('boilerPlate', async function (data) {
      try {
        const required = {
          userId: data.userId,
        };
        const nonRequired = {};
        const requestData = await socketHelper.vaildSocketObject(required, nonRequired);

        return socketResponse.success(socket, 'boilerPlate', 'Job accepted successfully.', {});
      } catch (error) {
        return socketResponse.error(error, socket, 'boilerPlate');
      }
    });

  });
}
/*
|----------------------------------------------------------------------------------------------------------------------------
|   END
|----------------------------------------------------------------------------------------------------------------------------
*/
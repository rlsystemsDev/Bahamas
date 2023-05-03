const path = require('path');
const inArray = require('in_array');
const _ = require('underscore');
const sequelize = require('sequelize');
//const pushNotification = require('./helpers/pushNotification');
const fs = require('fs');
const db = require('./db/db');
const Users = db.models.users;


users = [];
connections = [];
socket_id = [];
socket_people = {};

module.exports = function (io) {
  io.sockets.on('connection', function (socket) {
    // socket.conn.on('packet', function (packet) {
    //   if (packet.type === 'ping') console.log('received ping',socket.id);
    // });
    
    // socket.conn.on('packetCreate', function (packet) {
    //   if (packet.type === 'pong') console.log('sending pong');
    // });
    console.log('=========connection=================',socket.id)
    socket.emit('socket_connect', socket.id);
    socket.on('connect_user', function (data) {     // to connect socket
      console.log('============= connect user ==========',socket.id)
      var userindex = users.indexOf(data.user_id);
      if (userindex > -1) {
        for (var id in socket_people) {
          if (socket_people[id] == data.user_id) {
            delete socket_people[id];
            users.splice(userindex, 1);
            socket_people[socket.id] = data.user_id;
            users.push(data.user_id)
          }
        }
      } else {
        socket_people[socket.id] = data.user_id;
        users.push(data.user_id)
      }
      _.uniq(_(socket_people).toArray());
      console.log('Client connected...', socket_people);
      for (var id in socket_people) {
        socket.to(id).emit('online_status', { user_id: data.user_id, status: 1 });
      }

      let updateUser =  Users.update({
        'socketId': socket.id,
        'isOnline': 1,
        },
        { returning: true, where: { id:data.user_id } });

          socket.emit('connect_listener', { user_id: data.user_id, socket_id: socket.id });

     
    
    });
    socket.on('go_offline', function (data) {
      console.log('go_offline',data)
      socket.broadcast.emit('rest_offline', data);
    })
    socket.on('disconnect', function (data) { // to disconnect socket

      let updateUser =  Users.update({
        //'socketId': socket.id,
        'isOnline': 0,
        },
        { returning: true, where: { socketId:socket.id } });
console.log(updateUser,'qwqw');

      console.log('============================yes===============================',data)
      for (var id in socket_people) {
        if (socket_people[socket.id] != undefined) {
          var userindex = users.indexOf(socket_people[socket.id]);
          if (userindex > -1) {
            users.splice(userindex, 1);
            socket.broadcast.emit('online_status', { user_id: socket_people[socket.id], status: 0 });
          }
          user_id = socket_people[socket.id];
          delete socket_people[socket.id];
         
        }else {
          console.log('==========id=========',socket.id)
        }
      }
    });
    /*send message*/
    socket.on('send_lat_lng', function (data, callback) {
      console.log(data)
          joined_users_emit = [];
          // sent_user = [];
          // sent_user.push(data.sender);
          joined_users_emit.push(data.receiver);
          data_to_send = {};
         
          var foundUser = false;
          data_to_send = {
            latitude: data.latitude,
            longitude:  data.longitude,
          };
          console.log(data_to_send)
          for (var i in socket_people) {
            if (inArray(socket_people[i], joined_users_emit)) {
              socket.to(i).emit('receive_lat_lng', data_to_send);    // to send message to receiver end in 1-2-1 chat
              foundUser = true;
              break;
            } else {
            }
          }
          socket.emit('receive_lat_lng', data_to_send);    // to send message to receiver end in 1-2-1 chat

        
      
   
    });



  });
}


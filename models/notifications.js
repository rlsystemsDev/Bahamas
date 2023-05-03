/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('notifications', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		isDeleted: {
			type: DataTypes.INTEGER(4),
			allowNull: false,
			defaultValue: '0',
			field: 'is_deleted'
		},
		senderId: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue: '0',
			field: 'sender_id'
		},
		receiverId: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue: '0',
			field: 'receiver_id'
		},
		senderType: {
			type: DataTypes.INTEGER(4),
			allowNull: false,
			defaultValue: '0',
			field: 'sender_type'
		},
		receiverType: {
			type: DataTypes.INTEGER(4),
			allowNull: false,
			defaultValue: '0',
			field: 'receiver_type'
		},
		orderId: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue: '0',
			field: 'order_id'
		},
		rideRequestId: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue: '0',
			field: 'ride_request_id'
		},
		message: {
			type: DataTypes.TEXT,
			allowNull: false,
			defaultValue: '',
			field: 'message'
		},
		code: {
			type: DataTypes.INTEGER(6),
			allowNull: false,
			defaultValue: '0',
			field: 'code'
		},
		isRead: {
			type: DataTypes.INTEGER(4),
			allowNull: false,
			defaultValue: '0',
			field: 'is_read'
		},

		restaurantId: {
			type: DataTypes.INTEGER(4),
			allowNull: false,
			defaultValue: '0',
			field: 'restaurant_id'
		},
		data: {
			type: DataTypes.TEXT,
			allowNull: false,
			defaultValue: '',
			field: 'data'
		},
		isRated: {
			type: DataTypes.TEXT,
			allowNull: false,
			defaultValue: '',
			field: 'is_rated'
		},

		createdAt: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
			field: 'created_at'
		},
		updatedAt: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
			field: 'updated_at'
		}
	}, {
		tableName: 'notifications'
	});
};

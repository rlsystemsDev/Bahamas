/* jshint indent: 1 */

module.exports = function (sequelize, DataTypes) {
	return sequelize.define('settings', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		// deliveryCharge: {
		// 	type: DataTypes.INTEGER(11),
		// 	allowNull: false,
		// 	field: 'deliveryCharge'
		// },
		minimumOrder: {
			type: DataTypes.CHAR(64),
			allowNull: false,
			field: 'minimum_order'
		},
		tax: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'tax'
		},
		serviceFeePercentage: {
			type: DataTypes.FLOAT(5, 2),
			allowNull: false,
			field: 'service_fee_percentage'
		},
		pickupServiceFee: {
			type: DataTypes.FLOAT(5, 2),
			allowNull: false,
			field: 'pickup_service_fee'
		},
		cartFee: {
			type: DataTypes.FLOAT(5, 2),
			allowNull: false,
			field: 'cart_fee'
		},
		serviceFeeDescription: {
			type: DataTypes.TEXT(),
			allowNull: false,
			field: 'serviceFeeDescription'
		},
		vatFeeDescription: {
			type: DataTypes.TEXT(),
			allowNull: false,
			field: 'vatFeeDescription'
		},
		tipFeeDescription: {
			type: DataTypes.TEXT(),
			allowNull: false,
			field: 'tipFeeDescription'
		},
		cartFeeDescription: {
			type: DataTypes.TEXT(),
			allowNull: false,
			field: 'cartFeeDescription'
		},
		paypalFee: {
			type: DataTypes.STRING(255),
			allowNull: false,
			field: 'paypal_fee'
		},
		paypalFeeDescp: {
			type: DataTypes.STRING(255),
			allowNull: false,
			field: 'paypal_fee_descp'
		},
		send_credit: {

			type: DataTypes.ENUM('0', '1'),
			allowNull: false,
			defaultValue: 1,
			field: 'send_credit'
		},
		add_money: {
			type: DataTypes.ENUM('0', '1'),
			allowNull: false,
			defaultValue: 1,
			field: 'add_money'
		},
		status: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue: 0,
			field: 'status'
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
		tableName: 'settings'
	});
};

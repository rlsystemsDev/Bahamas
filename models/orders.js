/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('orders', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		userId: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue: '0',
			field: 'user_id'
		},
		addressId: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue: '0',
			field: 'address_id'
		},
		restaurantId: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue: '0',
			field: 'restaurant_id'
		},
		transactionId: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue: '0',
			field: 'transaction_id'
		},
		transactionNo: {
			type: DataTypes.STRING(100),
			allowNull: false,
			defaultValue: '',
			field: 'transaction_no'
		},
		status: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue: '',
			field: 'status'
		},
		specialRequest: {
			type: DataTypes.TEXT(),
			allowNull: false,
			defaultValue: '',
			field: 'specialRequest'
		},
		promoCode: {
			type: DataTypes.CHAR(40),
			allowNull: false,
			defaultValue: '',
			field: 'promo_code'
		},
		promoDiscount: {
			type: DataTypes.STRING(50),
			allowNull: false,
			defaultValue: '',
			field: 'promo_discount'
		},
		deliveryFee: {
			type: DataTypes.STRING(50),
			allowNull: false,
			defaultValue: '',
			field: 'delivery_fee'
		},
		tip: {
			type: DataTypes.STRING(50),
			allowNull: false,
			defaultValue: '',
			field: 'tip'
		},
		taxPercentage: {
			type: DataTypes.STRING(40),
			allowNull: false,
			defaultValue: '0',
			field: 'tax_percentage'
		},
		tax: {
			type: DataTypes.FLOAT,
			allowNull: false,
			defaultValue: '0',
			field: 'tax'
		},
		cartFee: {
			type: DataTypes.FLOAT(5,2),
			allowNull: false,
			defaultValue: '0',
			field: 'cart_fee'
		},
		serviceFeePercentage: {
			type: DataTypes.STRING(40),
			allowNull: false,
			defaultValue: '0',
			field: 'service_fee_percentage'
		},
		serviceFee: {
			type: DataTypes.FLOAT(7,2),
			allowNull: false,
			defaultValue: '0',
			field: 'service_fee'
		},
		totalAmount: {
			type: DataTypes.STRING(50),
			allowNull: false,
			defaultValue: '',
			field: 'total_amount'
		},
		netAmount: {
			type: DataTypes.STRING(50),
			allowNull: false,
			defaultValue: '',
			field: 'net_amount'
		},
		foodPrice: {
			type: DataTypes.STRING(50),
			allowNull: false,
			defaultValue: '',
			field: 'food_price'
		},
		orderType: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			defaultValue: '0',
			field: 'order_type'
		},
		scheduledTimestamp: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue: '0',
			field: 'scheduled_timestamp'
		},
		scheduledDatetime: {
			type: DataTypes.DATE,
			allowNull: true,
			field: 'scheduled_datetime'
		},
		paymentStatus: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue: '2',
			field: 'payment_status'
		},
		paymentMethod: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue: '0',
			field: 'payment_method'
		},
		isDelivery: {
			type: DataTypes.INTEGER(4),
			allowNull: false,
			defaultValue: '0',
			field: 'is_delivery'
		},
		address: {
			type: DataTypes.STRING(100),
			allowNull: false,
			defaultValue: '',
			field: 'address'
		},
		latitude: {
			type: DataTypes.STRING(100),
			allowNull: false,
			defaultValue: '',
			field: 'latitude'
		},
		longitude: {
			type: DataTypes.STRING(100),
			allowNull: false,
			defaultValue: '',
			field: 'longitude'
		},
		preparationTime: {
			type: DataTypes.STRING(255),
			allowNull: false,
			defaultValue: '',
			field: 'preparation_time'
		},
		orderPlacedTimestamp: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue: 0,
			field: 'orderPlacedTimestamp'
		},
		orderConfirmedTimestamp: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue: 0,
			field: 'orderConfirmedTimestamp'
		},
		preparingOrderTimestamp: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue: 0,
			field: 'preparingOrderTimestamp'
		},
		driverConfirmedTimestamp: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue: 0,
			field: 'driverConfirmedTimestamp'
		},
		foodOnTheWayTimestamp: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue: 0,
			field: 'foodOnTheWayTimestamp'
		},
		deliveredTimestamp: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue: 0,
			field: 'deliveredTimestamp'
		},
		orderDate: {
			type: DataTypes.DATEONLY,
			allowNull: true,
			field: 'order_date'
		},
		receiptUpload: {
			type: DataTypes.STRING(255),
			allowNull: false,
			defaultValue: '',
			field: 'receipt_upload'
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
		tableName: 'orders'
	});
};

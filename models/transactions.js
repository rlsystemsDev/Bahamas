/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('transactions', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		orderId: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue: '0',
			field: 'order_id'
		},
		userId: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue: '0',
			field: 'user_id'
		},
		transactionNo: {
			type: DataTypes.STRING(100),
			allowNull: false,
			defaultValue: '',
			field: 'transaction_no'
		},
		paymentMethod: {
			type: DataTypes.INTEGER(4),
			allowNull: false,
			defaultValue: '0',
			field: 'payment_method'
		},
		amount: {
			type: DataTypes.STRING(100),
			allowNull: false,
			defaultValue: '',
			field: 'amount'
		},
		paymentStatus: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue: '2',
			field: 'payment_status'
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
		tableName: 'transactions'
	});
};

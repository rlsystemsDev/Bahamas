/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('walletPayments', {
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
			field: 'user_id'
		},
		amount: {
			type: DataTypes.STRING(255),
			allowNull: false,
			field: 'amount'
		},
		senderId: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue: 0,
			field: 'sender_id'
		},
		closingBalance: {
			type: DataTypes.STRING(255),
			allowNull: false,
			defaultValue: 0,
			field: 'closing_balance'
		},
		transactionId: {
			type: DataTypes.STRING(255),
			allowNull: false,
			field: 'transaction_id'
		},
		transactionType: {
			type: DataTypes.STRING(10),
			allowNull: false,
			field: 'transaction_type'
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
		tableName: 'wallet_payments'
	});
};

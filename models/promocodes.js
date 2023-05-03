/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('promocodes', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		// restaurantId: {
		// 	type: DataTypes.INTEGER(11),
		// 	allowNull: false,
		// 	defaultValue: '0',
		// 	field: 'restaurant_id'
		// },
		promocode: {
			type: DataTypes.CHAR(40),
			allowNull: false,
			defaultValue: '',
			field: 'promocode'
		},
		expiryDate: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue: '0',
			field: 'expiry_date'
		},
		discountType: {
			type: DataTypes.INTEGER(4),
			allowNull: false,
			defaultValue: '0',
			field: 'discount_type'
		},
		discount: {
			type: DataTypes.INTEGER(6),
			allowNull: false,
			defaultValue: '0',
			field: 'discount'
		},
		restaurantId: {
			type: DataTypes.INTEGER(6),
			allowNull: false,
			defaultValue: '0',
			field: 'restaurant_id'
		},
		maxNumberUse: {
			type: DataTypes.STRING(255),
			allowNull: false,
			defaultValue: '0',
			field: 'max_number_use'
		},
		minSubtotal: {
			type: DataTypes.STRING(255),
			allowNull: false,
			defaultValue: '0',
			field: 'min_subtotal'
		},
		message: {
			type: DataTypes.STRING(255),
			allowNull: false,
			defaultValue: '0',
			field: 'message'
		},
		description: {
			type: DataTypes.STRING(255),
			allowNull: false,
			defaultValue: '0',
			field: 'description'
		},
		isActive: {
			type: DataTypes.STRING(10),
			allowNull: false,
			defaultValue: '0',
			field: 'is_active'
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
		tableName: 'promocodes'
	});
};

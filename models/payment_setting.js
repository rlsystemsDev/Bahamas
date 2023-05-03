/* jshint indent: 1 */

module.exports = function (sequelize, DataTypes) {
	return sequelize.define('payment_setting', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		paymentType: {
			type: DataTypes.STRING(20),
			allowNull: false,
			field: 'payment_type'
		},
		paymentTypeNew: {
			type: DataTypes.STRING(20),
			allowNull: false,
			field: 'payment_type_new'
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
		tableName: 'payment_setting'
	});
};

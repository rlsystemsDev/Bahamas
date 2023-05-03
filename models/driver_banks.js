/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('driver_banks', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		driver_id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'driver_id'
		},
		account_holder_name: {
			type: DataTypes.STRING(255),
			allowNull: false,
			defaultValue: '',
			field: 'account_holder_name'
		},
		bank_name: {
			type: DataTypes.CHAR(255),
			allowNull: false,
			defaultValue: '',
			field: 'bank_name'
		},
		account_number: {
			type: DataTypes.CHAR(255),
			allowNull: false,
			defaultValue: '',
			field: 'account_number'
		},
		branch_name: {
			type: DataTypes.STRING(255),
			allowNull: false,
			defaultValue: '',
			field: 'branch_name'
		},
		account_type: {
			type: DataTypes.STRING(20),
			allowNull: false,
			defaultValue: '',
			field: 'account_type'
		},
		is_verified: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue: '0',
			field: 'is_verified'
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
		tableName: 'driver_banks'
	});
};

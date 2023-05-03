/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('driverAddresses', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		isDefault: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue: '0',
			field: 'isDefault'
		},
		userId: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue: '0',
			field: 'user_id'
		},
		countryCode: {
			type: DataTypes.STRING(40),
			allowNull: false,
			defaultValue: '',
			field: 'countryCode'
		},
		alternateMobileNumber: {
			type: DataTypes.CHAR(40),
			allowNull: false,
			defaultValue: '',
			field: 'alternate_mobile_number'
		},
		countryCodeAlternateMobileNumber: {
			type: DataTypes.CHAR(40),
			allowNull: false,
			defaultValue: '',
			field: 'countryCodeAlternateMobileNumber'
		},
		address: {
			type: DataTypes.STRING(255),
			allowNull: false,
			defaultValue: '',
			field: 'address'
		},
		firstName: {
			type: DataTypes.STRING(128),
			allowNull: false,
			defaultValue: '',
			field: 'firstName'
		},
		lastName: {
			type: DataTypes.STRING(128),
			allowNull: false,
			defaultValue: '',
			field: 'lastName'
		},
		country: {
			type: DataTypes.STRING(128),
			allowNull: false,
			defaultValue: '',
			field: 'country'
		},
		provience: {
			type: DataTypes.STRING(128),
			allowNull: false,
			defaultValue: '',
			field: 'provience'
		},
		city: {
			type: DataTypes.STRING(255),
			allowNull: false,
			defaultValue: '',
			field: 'city'
		},
		countryId: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue: '0',
			field: 'countryId'
		},
		provienceId: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue: '0',
			field: 'provienceId'
		},
		cityId: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue: '0',
			field: 'cityId'
		},
		postalCode: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue: '0',
			field: 'postal_code'
		},
		latitude: {
			type: DataTypes.STRING(255),
			allowNull: false,
			defaultValue: '',
			field: 'latitude'
		},
		longitude: {
			type: DataTypes.STRING(255),
			allowNull: false,
			defaultValue: '',
			field: 'longitude'
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
		tableName: 'driver_addresses'
	});
};

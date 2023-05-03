/* jshint indent: 1 */

module.exports = function (sequelize, DataTypes) {
	return sequelize.define('addresses', {
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
			defaultValue: '0',
			field: 'countryCode'
		},
		alternateMobileNumber: {
			type: DataTypes.CHAR(40),
			allowNull: false,
			defaultValue: '0',
			field: 'alternate_mobile_number'
		},
		countryCodeAlternateMobileNumber: {
			type: DataTypes.CHAR(40),
			allowNull: false,
			defaultValue: '0',
			field: 'countryCodeAlternateMobileNumber'
		},
		country: {
			type: DataTypes.STRING(128),
			allowNull: false,
			defaultValue: '',
			field: 'country'
		},
		countryId: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue: '0',
			field: 'countryId'
		},
		address: {
			type: DataTypes.STRING(255),
			allowNull: false,
			field: 'address'
		},
		completeAddress: {
			type: DataTypes.STRING(255),
			allowNull: false,
			field: 'completeAddress'
		},
		firstName: {
			type: DataTypes.STRING(128),
			allowNull: false,
			field: 'firstName'
		},
		lastName: {
			type: DataTypes.STRING(128),
			allowNull: false,
			defaultValue: '',
			field: 'lastName'
		},
		provience: {
			type: DataTypes.STRING(128),
			allowNull: false,
			field: 'provience'
		},
		provienceId: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue: '0',
			field: 'provienceId'
		},
		city: {
			type: DataTypes.STRING(255),
			allowNull: false,
			field: 'city'
		},
		streetName: {
			type: DataTypes.STRING(255),
			allowNull: false,
			defaultValue: '0',
			field: 'streetName'
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
			field: 'postal_code'
		},
		latitude: {
			type: DataTypes.STRING(255),
			allowNull: false,
			defaultValue: '0.00',
			field: 'latitude'
		},
		longitude: {
			type: DataTypes.STRING(255),
			allowNull: false,
			defaultValue: '0.00',
			field: 'longitude'
		},
		deliveryInstructions: {
			type: DataTypes.STRING(255),
			allowNull: false,
			defaultValue: '',
			field: 'deliveryInstructions'
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
			// defaultValue: '0000-00-00 00:00:00',
			field: 'updated_at'
		}
	}, {
			tableName: 'addresses'
		});
};

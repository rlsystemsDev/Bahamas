/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('driverLicense', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		driverId: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue: 0,
			field: 'driver_id'
		},
		frontPhoto: {
			type: DataTypes.STRING(100),
			allowNull: false,
			defaultValue: '',
			field: 'frontPhoto'
		},
		backPhoto: {
			type: DataTypes.STRING(100),
			allowNull: false,
			defaultValue: '',
			field: 'backPhoto'
		},
		licenseType: {
			type: DataTypes.STRING(100),
			allowNull: false,
			defaultValue: '',
			field: 'licenseType'
		},
		licenseNo: {
			type: DataTypes.STRING(100),
			allowNull: false,
			defaultValue: '',
			field: 'licenseNo'
		},
		dob: {
			type: DataTypes.STRING(100),
			allowNull: false,
			defaultValue: '',
			field: 'dob'
		},
		issueDate: {
			type: DataTypes.STRING(100),
			allowNull: false,
			defaultValue: '',
			field: 'issueDate'
		},
		expiryDate: {
			type: DataTypes.STRING(100),
			allowNull: false,
			defaultValue: '',
			field: 'expiryDate'
		},
		nationality: {
			type: DataTypes.STRING(100),
			allowNull: false,
			defaultValue: '',
			field: 'nationality'
		},
		createdAt: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
			field: 'createdAt'
		},
		updatedAt: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
			field: 'updatedAt'
		}
	}, {
		tableName: 'driver_license'
	});
};

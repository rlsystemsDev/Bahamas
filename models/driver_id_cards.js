/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('driver_id_cards', {
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
		firstName: {
			type: DataTypes.STRING(100),
			allowNull: false,
			defaultValue: '',
			field: 'firstName'
		},
		lastName: {
			type: DataTypes.STRING(100),
			allowNull: false,
			defaultValue: '',
			field: 'lastName'
		},
		idNumber: {
			type: DataTypes.STRING(100),
			allowNull: false,
			defaultValue: '',
			field: 'idNumber'
		},
		issueDate: {
			type: DataTypes.STRING(100),
			allowNull: false,
			defaultValue: '',
			field: 'issueDate'
		},
		address: {
			type: DataTypes.STRING(255),
			allowNull: false,
			defaultValue: '',
			field: 'address'
		},
		dob: {
			type: DataTypes.STRING(100),
			allowNull: false,
			defaultValue: '',
			field: 'dob'
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
		tableName: 'driver_id_cards'
	});
};

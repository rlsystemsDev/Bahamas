/* jshint indent: 1 */

module.exports = function (sequelize, DataTypes) {
	return sequelize.define('states', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		name: {
			type: DataTypes.STRING(30),
			allowNull: false,
			field: 'name'
		},
		countryId: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			defaultValue: '1',
			field: 'country_id'
		}
	}, {
			tableName: 'states',
			timestamps: false,
		});
};

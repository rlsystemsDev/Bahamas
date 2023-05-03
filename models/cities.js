/* jshint indent: 1 */

module.exports = function (sequelize, DataTypes) {
	return sequelize.define('cities', {
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
		stateId: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'state_id'
		}
	}, {
			tableName: 'cities',
			timestamps: false,
		});
};

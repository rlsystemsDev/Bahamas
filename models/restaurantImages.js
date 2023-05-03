/* jshint indent: 1 */

module.exports = function (sequelize, DataTypes) {
	const restaurantImages = sequelize.define('restaurantImages', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true,
			field: 'id'
		},
		restaurantId: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			field: 'restaurantId'
		},
		image: {
			type: DataTypes.STRING(255),
			allowNull: false,
			field: 'image'
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
		tableName: 'restaurantimages'
	});


	restaurantImages.associate = models => {
		restaurantImages.belongsTo(models.restaurants, { foreingKey: 'restaurantId' });
	};

	return restaurantImages;
};

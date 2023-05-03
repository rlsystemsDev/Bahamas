/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define(
    "addonCategories",
    {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        field: "id"
      },
      categoryName: {
        type: DataTypes.STRING(128),
        allowNull: false,
        field: "category_name"
      },
      status: {
        type: DataTypes.INTEGER(4),
        allowNull: false,
        field: "status"
      },
      limits: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        field: "limits"
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
        field: "created_at"
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "updated_at"
      }
    },
    {
      tableName: "addon_categories"
    }
  );
};

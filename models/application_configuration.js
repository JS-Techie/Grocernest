const {
  DataTypes
} = require('sequelize');

module.exports = sequelize => {
  const attributes = {
    property_key: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: null,
      primaryKey: true,
      autoIncrement: false,
      comment: null,
      field: "property_key"
    },
    property_value: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "property_value"
    }
  };
  const options = {
    tableName: "application_configuration",
    comment: "",
    indexes: []
  };
  const ApplicationConfigurationModel = sequelize.define("application_configuration_model", attributes, options);
  return ApplicationConfigurationModel;
};
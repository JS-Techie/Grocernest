const {
  DataTypes
} = require('sequelize');

module.exports = sequelize => {
  const attributes = {
    cust_no: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: null,
      primaryKey: true,
      autoIncrement: false,
      comment: null,
      field: "cust_no"
    },
    cust_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: "User",
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "cust_name"
    },
    cust_picture: {
      type: DataTypes.STRING(1000),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "cust_picture"
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: sequelize.fn('current_timestamp'),
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "created_at"
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "updated_at"
    },
    created_by: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "created_by"
    },
    updated_by: {
      type: DataTypes.BIGINT,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "updated_by"
    }
  };
  const options = {
    tableName: "t_profile",
    comment: "",
    indexes: []
  };
  const TProfileModel = sequelize.define("t_profile_model", attributes, options);
  return TProfileModel;
};
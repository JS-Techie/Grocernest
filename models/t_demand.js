const {
    DataTypes
  } = require('sequelize');
  
  module.exports = sequelize => {
    const attributes = {
      id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: null,
        primaryKey: true,
        autoIncrement: true,
        comment: null,
        field: "id"
      },
      title: {
        type: DataTypes.STRING(5000),
        allowNull: true,
        defaultValue: null,
        primaryKey: false,
        autoIncrement: false,
        comment: null,
        field: "title"
      },
      desc: {
        type: DataTypes.STRING(5000),
        allowNull: true,
        defaultValue: null,
        primaryKey: false,
        autoIncrement: false,
        comment: null,
        field: "desc"
      },
      url: {
        type: DataTypes.STRING(1000),
        allowNull: true,
        defaultValue: null,
        primaryKey: false,
        autoIncrement: false,
        comment: null,
        field: "url"
      },
      extension: {
        type: DataTypes.STRING(20),
        allowNull: true,
        defaultValue: null,
        primaryKey: false,
        autoIncrement: false,
        comment: null,
        field: "extension"
      },
      cust_no: {
        type: DataTypes.STRING(20),
        allowNull: true,
        defaultValue: null,
        primaryKey: false,
        autoIncrement: false,
        comment: null,
        field: "cust_no"
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
      }
    };
    const options = {
      tableName: "t_demand",
      comment: "",
      indexes: []
    };
    const TDemandModel = sequelize.define("t_demand_model", attributes, options);
    return TDemandModel;
  };
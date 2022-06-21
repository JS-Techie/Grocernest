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
      autoIncrement: false,
      comment: null,
      field: "id"
    },
    location_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "location_id"
    },
    invoice_no: {
      type: DataTypes.STRING(45),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "invoice_no"
    },
    total_amount: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "total_amount"
    },
    total_quantity: {
      type: DataTypes.BIGINT,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "total_quantity"
    },
    store_name: {
      type: DataTypes.STRING(250),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "store_name"
    },
    teller_name: {
      type: DataTypes.STRING(250),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "teller_name"
    },
    teller_type: {
      type: DataTypes.STRING(10),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "teller_type"
    },
    salesman_name: {
      type: DataTypes.STRING(250),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "salesman_name"
    },
    cust_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "cust_id",
      references: {
        key: "id",
        model: "t_customer_model"
      }
    },
    comments: {
      type: DataTypes.STRING(250),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "comments"
    },
    payment_type: {
      type: DataTypes.CHAR(1),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: "Possible values are C for Cash, R for Card, O for Online",
      field: "payment_type"
    },
    active_ind: {
      type: DataTypes.CHAR(1),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "active_ind"
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
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "updated_at"
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: "0000-00-00 00:00:00",
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "created_at"
    },
    payment_conf_ind: {
      type: DataTypes.CHAR(1),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "payment_conf_ind"
    },
    return_flag: {
      type: DataTypes.STRING(1),
      allowNull: false,
      defaultValue: "N",
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "return_flag"
    },
    invoice_type: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: "Normal",
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "invoice_type"
    },
    original_invoice_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "original_invoice_id"
    },
    total_discount: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "total_discount"
    }
  };
  const options = {
    tableName: "t_invoice",
    comment: "",
    indexes: [{
      name: "cust_id_fkey",
      unique: false,
      type: "BTREE",
      fields: ["cust_id"]
    }]
  };
  const TInvoiceModel = sequelize.define("t_invoice_model", attributes, options);
  return TInvoiceModel;
};
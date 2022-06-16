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
    invoice_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "invoice_id",
      references: {
        key: "id",
        model: "t_invoice_model"
      }
    },
    item_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "item_id",
      references: {
        key: "id",
        model: "t_item_model"
      }
    },
    customer_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "customer_id",
      references: {
        key: "id",
        model: "t_customer_model"
      }
    },
    location_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "location_id",
      references: {
        key: "id",
        model: "t_lkp_location_model"
      }
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "status"
    },
    active_ind: {
      type: DataTypes.CHAR(1),
      allowNull: false,
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
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
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
    tableName: "t_invoice_out_of_stock",
    comment: "",
    indexes: [{
      name: "invoice_fkey_out_of_stock1",
      unique: false,
      type: "BTREE",
      fields: ["invoice_id"]
    }, {
      name: "invoice_fkey_out_of_stock2",
      unique: false,
      type: "BTREE",
      fields: ["item_id"]
    }, {
      name: "invoice_fkey_out_of_stock3",
      unique: false,
      type: "BTREE",
      fields: ["customer_id"]
    }, {
      name: "invoice_fkey_out_of_stock4",
      unique: false,
      type: "BTREE",
      fields: ["location_id"]
    }]
  };
  const TInvoiceOutOfStockModel = sequelize.define("t_invoice_out_of_stock_model", attributes, options);
  return TInvoiceOutOfStockModel;
};
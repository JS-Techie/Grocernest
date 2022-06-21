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
    item_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
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
    batch_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "batch_id",
      references: {
        key: "id",
        model: "t_batch_model"
      }
    },
    location_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
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
    quantity: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "quantity"
    },
    balance_type: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "balance_type",
      references: {
        key: "id",
        model: "t_lkp_balance_type_model"
      }
    },
    status: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "status"
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
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.fn('current_timestamp'),
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "created_at"
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
      defaultValue: "0000-00-00 00:00:00",
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "updated_at"
    }
  };
  const options = {
    tableName: "t_stock_adjustment",
    comment: "",
    indexes: [{
      name: "location_fkey_t_stock_adjustment",
      unique: false,
      type: "BTREE",
      fields: ["location_id"]
    }, {
      name: "item_id_fkey_t_stock_adjustment",
      unique: false,
      type: "BTREE",
      fields: ["item_id"]
    }, {
      name: "batch_id_fkey_t_stock_adjustment",
      unique: false,
      type: "BTREE",
      fields: ["batch_id"]
    }, {
      name: "balance_type_id_fkey_t_stock_adjustment",
      unique: false,
      type: "BTREE",
      fields: ["balance_type"]
    }]
  };
  const TStockAdjustmentModel = sequelize.define("t_stock_adjustment_model", attributes, options);
  return TStockAdjustmentModel;
};
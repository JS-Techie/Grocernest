const {
  DataTypes, literal
} = require('sequelize');

module.exports = sequelize => {
  const attributes = {
    id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: literal("nextval(t_inventory_seq)"),
      primaryKey: true,
      autoIncrement: true,
      comment: null,
      field: "id"
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
    quantity: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "quantity"
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
    },
    delivery_man: {
      type: DataTypes.STRING(250),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "delivery_man"
    },
    delivery_note: {
      type: DataTypes.STRING(250),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "delivery_note"
    },
    deluvery_contact_no: {
      type: DataTypes.STRING(45),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "deluvery_contact_no"
    },
    balance_type: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: "1",
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "balance_type",
      references: {
        key: "id",
        model: "t_lkp_balance_type_model"
      }
    },
    cashback: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "cashback"
    },
    cashback_is_percentage: {
      type: DataTypes.INTEGER(1),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "cashback_is_percentage"
    },
    ecomm_quantity: {
      type: DataTypes.DECIMAL,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "ecomm_quantity"
    }
  };
  const options = {
    tableName: "t_inventory",
    comment: "",
    indexes: [{
      name: "batch_fkey",
      unique: false,
      type: "BTREE",
      fields: ["batch_id"]
    }, {
      name: "item_id_fkey",
      unique: false,
      type: "BTREE",
      fields: ["item_id"]
    }, {
      name: "location_fkey",
      unique: false,
      type: "BTREE",
      fields: ["location_id"]
    }, {
      name: "balance_type_fkey_t_inventory_audit",
      unique: false,
      type: "BTREE",
      fields: ["balance_type"]
    }]
  };
  const TInventoryModel = sequelize.define("t_inventory_model", attributes, options);
  return TInventoryModel;
};
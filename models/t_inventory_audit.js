const {
  DataTypes
} = require('sequelize');

module.exports = sequelize => {
  const attributes = {
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
      type: DataTypes.STRING(200),
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "quantity"
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
    balance_type: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: "1",
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "balance_type"
    }
  };
  const options = {
    tableName: "t_inventory_audit",
    comment: "",
    indexes: [{
      name: "location_fkey_inventory_audit",
      unique: false,
      type: "BTREE",
      fields: ["location_id"]
    }, {
      name: "item_id_fkey_inventory_audit",
      unique: false,
      type: "BTREE",
      fields: ["item_id"]
    }, {
      name: "batch_id_fkey_inventory_audit",
      unique: false,
      type: "BTREE",
      fields: ["batch_id"]
    }]
  };
  const TInventoryAuditModel = sequelize.define("t_inventory_audit_model", attributes, options);
  return TInventoryAuditModel;
};
const {
  DataTypes
} = require('sequelize');

module.exports = sequelize => {
  const attributes = {
    coupon_code: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: null,
      primaryKey: true,
      autoIncrement: false,
      comment: null,
      field: "coupon_code"
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "start_date"
    },
    expiry_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "expiry_date"
    },
    coupon_amount: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "coupon_amount"
    },
    status: {
      type: DataTypes.ENUM('pending', 'redeemed'),
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "status"
    }
  };
  const options = {
    tableName: "t_ext_coupon",
    comment: "",
    indexes: []
  };
  const TExtCouponModel = sequelize.define("t_ext_coupon_model", attributes, options);
  return TExtCouponModel;
};
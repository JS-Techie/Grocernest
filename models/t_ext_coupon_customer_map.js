const {
  DataTypes
} = require('sequelize');

module.exports = sequelize => {
  const attributes = {
    cust_no: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "cust_no"
    },
    coupon_code: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: null,
      primaryKey: true,
      autoIncrement: false,
      comment: null,
      field: "coupon_code"
    },
    created_at: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      defaultValue: null,
      primaryKey: false,
      autoIncrement: false,
      comment: null,
      field: "created_at"
    }
  };
  const options = {
    tableName: "t_ext_coupon_customer_map",
    comment: "",
    indexes: []
  };
  const TExtCouponCustomerMapModel = sequelize.define("t_ext_coupon_customer_map_model", attributes, options);
  return TExtCouponCustomerMapModel;
};
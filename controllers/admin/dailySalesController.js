const db = require("../../models");
const { sequelize } = require("../../models");

const getOrdersByDate = async (req, res, next) => {
  let { fromDate, toDate, delivery } = req.body;

  fromDate = fromDate.split("T")[0] + " " + "00:00:00.000";
  toDate = toDate.split("T")[0] + " " + "23:59:59.000";

  console.log(fromDate);
  console.log(toDate);

  try {
    let orderQuery = `select t_order.order_id,t_order.final_payable_amount,t_order.total, t_order.wallet_balance_used, t_customer.cust_name as customer_name,t_order.created_at as ordered_date,t_user.full_name as delivery_boy_name, t_order.delivery_date from 
    ((((((t_order 
    inner join t_order_items on t_order_items.order_id  = t_order.order_id )
    inner join t_item on t_order_items.item_id = t_item.id) 
    inner join t_user on t_user.id = t_order.delivery_boy)
    inner join t_batch on t_batch.item_id = t_item.id)
    inner join t_inventory on t_inventory.batch_id  = t_batch.id)
    inner join t_customer on t_customer.cust_no  = t_order.cust_no)
    where t_batch.mark_selected = 1 and t_order.status = 'Delivered'`;
    let deliveryQuery = ` and t_order.delivery_date >= '${fromDate}' and t_order.delivery_date <= '${toDate}' group by order_id order by t_order.delivery_date desc`;
    let orderedQuery = ` and t_order.created_at >= '${fromDate}' and t_order.created_at <= '${toDate}' group by t_order.order_id order by t_order.created_at desc`;

    let [orders, metadata] = "";

    if (delivery === "false") {
      [orders, metadata] = await sequelize.query(orderQuery + orderedQuery);
    } else {
      [orders, metadata] = await sequelize.query(orderQuery + deliveryQuery);
    }

    let total = 0;

    if (orders.length > 0) {
      orders.map((current) => {
        total += current.final_payable_amount;
      });
    }

    return res.status(200).send({
      success: true,
      data: {
        orders,
        total,
        type: typeof delivery,
        delivery,
        fromDate,
        toDate,
      },
      message: "Successfully fetched Daily Sales Report for given dates",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Something went wrong, please try again in sometime",
      devMessage: "Please check data field for the error message",
    });
  }
};

const getOrdersByDeliveryBoy = async (req, res, next) => {
  const { fromDate, toDate } = req.body;
  try {
    const [orders, metadata] =
      await sequelize.query(`select sum(t_order.total) as total, t_user.full_name as name from (t_order
      inner join t_user on t_user.id = t_order.delivery_boy) where t_order.status = 'Delivered' and t_order.delivery_date >= '${fromDate}' and t_order.delivery_date <= '${toDate}' group by t_user.full_name order by t_order.delivery_date desc`);

    return res.status(200).send({
      success: true,
      data: {
        orders,
      },
      message:
        "Successfully fetched Daily Sales Report according to delivery boy",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Something went wrong, please try again in sometime",
      devMessage: "Please check data field for the error message",
    });
  }
};

module.exports = {
  getOrdersByDate,
  getOrdersByDeliveryBoy,
};

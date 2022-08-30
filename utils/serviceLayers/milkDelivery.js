const getAllDeliveriesOfCurrentDeliveryBoy = (deliveryBoy) => {
  return `SELECT t_milk_delivery.cust_no,t_milk_delivery.delivery_boy,t_milk_delivery.subscription_id,t_milk_delivery.id,t_milk_delivery.address_id,t_milk_delivery.status,t_address.address_title ,t_address.address_line_1,
    t_address.address_line_2 ,t_address.state ,t_address.city,t_address.PIN_code, t_address.landmark,t_subscription.name,t_subscription_items.item_id ,t_subscription_items.quantity 
    from (((((ecomm.t_milk_delivery
    inner join t_customer on t_customer.cust_no = t_milk_delivery.cust_no)
    inner join t_address on t_address.address_id = t_milk_delivery.address_id)
    inner join t_subscription on t_subscription.id = t_milk_delivery.subscription_id)
    inner join t_subscription_items on t_subscription_items.subscription_id = t_milk_delivery.subscription_id)
    inner join t_milk_items on t_milk_items.item_id = t_subscription_items.item_id )
    where t_milk_delivery.delivery_boy="${deliveryBoy}"`;
};

const getStatusWiseDeliveriesOfCurrentDeliveryBoy = (deliveryBoy, status) => {
  return `SELECT t_milk_delivery.cust_no,t_milk_delivery.delivery_boy,t_milk_delivery.subscription_id,t_milk_delivery.id,t_milk_delivery.address_id,t_milk_delivery.status,t_address.address_title ,t_address.address_line_1,
    t_address.address_line_2 ,t_address.state ,t_address.city,t_address.PIN_code, t_address.landmark,t_subscription.name,t_subscription_items.item_id ,t_subscription_items.quantity 
    from (((((ecomm.t_milk_delivery
    inner join t_customer on t_customer.cust_no = t_milk_delivery.cust_no)
    inner join t_address on t_address.address_id = t_milk_delivery.address_id)
    inner join t_subscription on t_subscription.id = t_milk_delivery.subscription_id)
    inner join t_subscription_items on t_subscription_items.subscription_id = t_milk_delivery.subscription_id)
    inner join t_milk_items on t_milk_items.item_id = t_subscription_items.item_id )
    where t_milk_delivery.delivery_boy="${deliveryBoy}" and t_milk_delivery.status="${status}"`;
};

const getSingleSubscriptionDetailsOfCurrentDeliveryBoy = (
  deliveryBoy,
  deliveryID
) => {
  return `SELECT t_milk_delivery.cust_no,t_milk_delivery.delivery_boy,t_milk_delivery.subscription_id,t_milk_delivery.id,t_milk_delivery.address_id,t_milk_delivery.status,t_address.address_title ,t_address.address_line_1,
    t_address.address_line_2 ,t_address.state ,t_address.city,t_address.PIN_code, t_address.landmark,t_subscription.name,t_subscription_items.item_id ,t_subscription_items.quantity 
    from (((((ecomm.t_milk_delivery
    inner join t_customer on t_customer.cust_no = t_milk_delivery.cust_no)
    inner join t_address on t_address.address_id = t_milk_delivery.address_id)
    inner join t_subscription on t_subscription.id = t_milk_delivery.subscription_id)
    inner join t_subscription_items on t_subscription_items.subscription_id = t_milk_delivery.subscription_id)
    inner join t_milk_items on t_milk_items.item_id = t_subscription_items.item_id )
    where t_milk_delivery.delivery_boy="${deliveryBoy}" and t_milk_delivery.id=${deliveryID}`;
};

module.exports = {
  getAllDeliveriesOfCurrentDeliveryBoy,
  getSingleSubscriptionDetailsOfCurrentDeliveryBoy,
  getStatusWiseDeliveriesOfCurrentDeliveryBoy,
};

const { sequelize } = require("../models");

const getOrderStatus = async (req, res, next) => {

    const orderId = req.params.orderId;

    const [orderData, metadata] =
        await sequelize.query(`SELECT tlo.order_id, tc.cust_no,tc.cust_name, tlo.status, 
    tlo.created_at, tlo.created_by, toi.item_id,ti.name,ti.item_cd,
    ti.UOM ,ti.units,ti.brand_id,ti.div_id,ti.category_id,
    ti.sub_category_id,ti.department_id,ti.image,ti.description, 
    tb.MRP, tb.discount, tb.cost_price, tb.sale_price,
    toi.quantity  from t_lkp_order tlo 
    inner join t_order_items toi 
    inner join t_item ti 
    inner join t_customer tc
    inner join t_batch tb 
    where tlo.order_id ="${orderId}" and 
    tlo.order_id = toi.order_id and 
    toi.item_id = ti.id and 
    tc.cust_no = tlo.cust_no and
    tb.item_id = ti.id order by tb.created_at desc
    `);

    if (orderData.length === 0) {
        return res.status(404).send({
            success: true,
            data: [],
            message: "There are no orders for current user",
        });
    }

    const promises = await orderData.map(async (currentOrderItem) => {
        return ({
            itemID: currentOrderItem.item_id,
            itemName: currentOrderItem.name,
            image: currentOrderItem.image,
            quantity: currentOrderItem.quantity,
            UOM: currentOrderItem.UOM,
            categoryID: currentOrderItem.category_id,
            subcategoryID: currentOrderItem.sub_category_id,
            departmentID: currentOrderItem.department_id,
            MRP: currentOrderItem.MRP,
            salePrice: currentOrderItem.sale_price,
            discount: currentOrderItem.discount,
        })
    })

    const resolved = await Promise.all(promises);
    const itemDetails = [...new Map(resolved.map((item) => [item["itemID"], item])).values(),]

    res.send({
        orderID: orderData[0].order_id,
        status: orderData[0].status,
        date: orderData[0].created_at,
        customerName: orderData[0].cust_name,
        customerNumber: orderData[0].cust_no,
        itemDetails,
    })
    console.log(orderData);
}

module.exports = {
    getOrderStatus
}
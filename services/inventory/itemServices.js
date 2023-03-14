const { sequelize } = require("../../models");
const db = require("../../models");

const Item = db.ItemModel;
const Batch = db.BatchModel;
const ItemTaxInfo = db.ItemTaxInfoModel;
const Inventory = db.InventoryModel;
const GrnDetails = db.GrnDetailsModel;
const Grn = db.GrnModel;
const InvoiceDetails = db.InvoiceItemDtlsModel;

const getItemTaxArray = async (item_id) => {
  const itemTaxInfoList = await ItemTaxInfo.findAll({
    where: { item_id },
  });
  let response = [];
  if (itemTaxInfoList.length > 0) {
    const promises = itemTaxInfoList.map((current) => {
      return {
        createdBy: current.created_by,
        createdAt: current.created_at,
        updatedBy: current.updated_by,
        updatedAt: current.updated_at,
        isActive: current.active_ind,
        id: current.id,
        itemId: current.item_cd,
        taxType: current.tax_type,
        taxName: current.tax_name,
        taxPercentage: current.tax_percentage,
      };
    });

    response = await Promise.all(promises);
  }
  console.log(response);
  return response;
};

const itemDetails = async (item_id) => {
  const getGrn = await Grn.findAll({});
  const promises = getGrn.map(async (current) => {
    const [getItems, metadata1] =
      await sequelize.query(`select  t_grn_details.grn_id , t_lkp_brand.brand_name ,t_lkp_category.group_name ,t_lkp_color.color_name ,t_lkp_department.dept_name ,t_lkp_division.div_name ,t_item.item_cd ,t_item.name ,t_lkp_size.size_cd ,t_lkp_sub_category.sub_cat_name ,t_item.UOM 
  from ((((((((t_item
  inner join t_lkp_sub_category on t_lkp_sub_category.id =t_item.sub_category_id )
  inner join t_lkp_size on t_lkp_size.id = t_item.size_id )
  inner join t_lkp_department on t_lkp_department.id  = t_item.department_id )
  inner join t_lkp_division on t_lkp_division.id = t_item.div_id )
  inner join t_lkp_color on t_lkp_color.id = t_item.color_id )
  inner join t_lkp_category on t_lkp_category.id= t_item.brand_id )
  inner join t_lkp_brand on t_lkp_brand.id = t_item.brand_id )
  inner join t_grn_details on t_grn_details.item_id = t_item.id )`);
    // const itemPromises = getItems.map((currentItem)=>{

    //itemDetails array from the above query
    //map over that
    //make a proper array
    //return that array inside this function
    //resolve outer array outside this function

    const itemPromises = getItems.map((currentItem) => {
      return {
        basePrice: current.base_price,
        batchName: current.batch_name,
        batchNo: current.batch_name,
        brandName: currentItem.brand_name,
        cashBack: current.cashback,
        categoryName: currentItem.group_name,
        cgst: current.cgst,
        colour: currentItem.color_name,
        costPrice: current.COST_PRICE,
        createdBy: current.created_by,
        departmentName: currentItem.dept_name,
        discount: current.DISCOUNT,
        divisionName: currentItem.div_name,
        ecommQuantity: current.ecomm_quantity,
        expiryDate: current.expiry_date,
        grnDetailsId: current.id,
        grnId: current.grn_id,
        igst: current.igst,
        isCashBackInPercentage: current.cashBack_is_percentage,
        itemCode: currentItem.item_cd,
        itemId: current.item_id,
        mfgDate: current.mfg_date,
        mrp: current.MRP,
        name: currentItem.name,
        orderedQuantity: current.ordered_quantity,
        otherTax: current.other_tax,
        preparedBy: current.created_by,
        receivedQuantity: current.received_quantity,
        salePrice: current.SALE_PRICE,
        sgst: current.sgst,
        shelfNo: current.shelf_no,
        size: currentItem.size_cd,
        subCategoryName: currentItem.sub_cat_name,
        supplierDisc: current.supplier_disc,
        uom: currentItem.UOM,
      };
    });

    const itemResolved = await Promise.all(itemPromises);

    return {
      createdBy: current.created_by,
      createdDate: current.created_at,
      grnDate: current.grn_date,
      grnId: current.id,
      grnLocationId: current.grn_location_id,
      grnStatus: current.status,
      invoiceAmount: current.invoice_amt,
      invoiceNo: current.invoice_amt,
      itemDetails: itemResolved,

      // itemDetails: current.item_id,
      locationName: current.loc_name,
      preparedBy: current.created_by,
      preparedDate: current.created_at,
      supplierDisc: current.supplier_disc,
      supplierId: current.supplier_id,
      supplierName: current.first_name,
    };
  });
  const resolved = await Promise.all(promises);
  return resolved;
};

const calculateTotalInput = async (current) => {
  // const inputGst = await GrnDetails.findAll({})

  // const promises = inputGst.map((current) => {

  let totalInput = 0;
  if (current.cgst) {
    totalInput += parseFloat(current.cgst);
  }
  if (current.sgst) {
    totalInput += parseFloat(current.sgst);
  }
  if (current.igst) {
    totalInput += parseFloat(current.igst);
  }
  if (current.other_tax) {
    totalInput += parseFloat(current.other_tax);
  }
  // })
  // const resolve = await Promise.all(promises)
  return totalInput;
};

const calculateTotalOutput = async (current) => {
  // const outputGst = await InvoiceDetails.findAll({})
  // const promises = outputGst.map((current) => {
  let totalOutput = 0;
  if (current.CGST) {
    totalOutput += parseFloat(current.CGST);
  }
  if (current.SGST) {
    totalOutput += parseFloat(current.SGST);
  }
  if (current.IGST) {
    totalOutput += parseFloat(current.IGST);
  }
  if (current.OTH_TAX) {
    totalOutput += parseFloat(current.OTH_TAX);
  }
  // })
  // const resolve = await Promise.all(promises)
  return totalOutput;
};
const getInventoryArray = async (item_id) => {
  const stockFromInventory = await Inventory.findAll({
    where: { item_id },
  });

  let response = [];

  if (stockFromInventory.length > 0) {
    const promises = stockFromInventory.map(async (current) => {
      const currentBatch = await Batch.findOne({
        where: { item_id: current.item_id },
      });
      //const cashbackDetails = await Inventory.findAll({})
      return {
        batchNo: currentBatch.batch_no,
        salePrice: currentBatch.sale_price,
        costPrice: currentBatch.cost_price,
        discount: currentBatch.discount,
        batchId: currentBatch.id,
        locationId: currentBatch.location_id,
        quantity: current.quantity,
        cashBack: current.cashback,
        locationName: null,
        locationType: null,
        mfgDate: currentBatch.mfg_date,
        mrp: currentBatch.MRP,
      };
    });
    response = await Promise.all(promises);
  }
  console.log(response);
  return response;
};

const validateItemForSaveAndUpdate = async (id, itemCode, name) => {
  const itemObj = await Item.findOne({
    where: { id },
  });
  if (!itemObj) {
    return { validate: false };
  }
  if (name == "" || itemCode == "") {
    return { validate: false };
  }

  return { validate: true };
};

const findAllActiveItems = async () => {
  const [allActiveItems, metadata] = await sequelize.query(`SELECT
    t_item.id,
    t_item.name,
    t_item.item_cd,
    t_item.UOM,
    t_item.units,
    t_item.brand_id,
    t_lkp_brand.brand_name,
    t_item.div_id,
    t_lkp_division.div_name,
    t_item.category_id,
    t_lkp_category.group_name,
    t_lkp_category.HSN_CODE,
    t_item.sub_category_id,
    t_lkp_sub_category.sub_cat_name,
    t_item.department_id,
    t_lkp_department.dept_name,
    t_item.color_id,
    t_lkp_color.color_name,
    t_item.size_id,
    t_lkp_size.size_cd,
    t_item.active_ind,
    t_item.image,
    t_item.description,
    t_item.how_to_use,
    t_item.country_of_origin,
    t_item.manufacturer_name,
    t_item.ingredients,
    t_item.available_for_ecomm,
    t_item.is_gift,
    t_item.is_grocernest,
    t_item.show_discount
FROM
    (
        (
            (
                (
                    (
                        (
                            (
                                t_item
                                INNER JOIN t_lkp_brand ON t_lkp_brand.id = t_item.brand_id
                            )
                            INNER JOIN t_lkp_category ON t_lkp_category.id = t_item.category_id
                        )
                        INNER JOIN t_lkp_division ON t_lkp_division.id = t_item.div_id
                    )
                    INNER JOIN t_lkp_sub_category ON t_lkp_sub_category.id = t_item.sub_category_id
                )
                INNER JOIN t_lkp_department ON t_lkp_department.id = t_item.department_id
            )
            INNER JOIN t_lkp_color ON t_lkp_color.id = t_item.color_id
        )
        INNER JOIN t_lkp_size ON t_lkp_size.id = t_item.size_id
    )
WHERE
    t_item.active_ind = 'Y'`);

  return allActiveItems;
};

const findAllDeactiveItems = async () => {
  const [allDeactiveItems, metadata] = await sequelize.query(`SELECT
    t_item.id,
    t_item.name,
    t_item.item_cd,
    t_item.UOM,
    t_item.units,
    t_item.brand_id,
    t_lkp_brand.brand_name,
    t_item.div_id,
    t_lkp_division.div_name,
    t_item.category_id,
    t_lkp_category.group_name,
    t_lkp_category.HSN_CODE,
    t_item.sub_category_id,
    t_lkp_sub_category.sub_cat_name,
    t_item.department_id,
    t_lkp_department.dept_name,
    t_item.color_id,
    t_lkp_color.color_name,
    t_item.size_id,
    t_lkp_size.size_cd,
    t_item.active_ind,
    t_item.image,
    t_item.description,
    t_item.how_to_use,
    t_item.country_of_origin,
    t_item.manufacturer_name,
    t_item.ingredients,
    t_item.available_for_ecomm,
    t_item.is_gift,
    t_item.is_grocernest,
    t_item.show_discount
FROM
    (
        (
            (
                (
                    (
                        (
                            (
                                t_item
                                INNER JOIN t_lkp_brand ON t_lkp_brand.id = t_item.brand_id
                            )
                            INNER JOIN t_lkp_category ON t_lkp_category.id = t_item.category_id
                        )
                        INNER JOIN t_lkp_division ON t_lkp_division.id = t_item.div_id
                    )
                    INNER JOIN t_lkp_sub_category ON t_lkp_sub_category.id = t_item.sub_category_id
                )
                INNER JOIN t_lkp_department ON t_lkp_department.id = t_item.department_id
            )
            INNER JOIN t_lkp_color ON t_lkp_color.id = t_item.color_id
        )
        INNER JOIN t_lkp_size ON t_lkp_size.id = t_item.size_id
    )
WHERE
    t_item.active_ind = 'N'`);

  return allDeactiveItems;
};

const updateTaxTypes = async (item_id, cgst, sgst, igst, otherTax) => {
  try {
    const currentItemTaxInfo = await ItemTaxInfo.findAll({
      where: { item_id },
    });

    if (currentItemTaxInfo.length === 0) {
      return false;
    }

    let cgstExists = false;
    let sgstExists = false;
    let igstExists = false;
    let otherTaxExists = false;

    currentItemTaxInfo.map((current) => {
      taxType = current.tax_type;

      if (taxType === "CGST") cgstExists = true;
      else if (taxType === "SGST") sgstExists = true;
      else if (taxType === "IGST") igstExists = true;
      else if (taxType === "OTHERS") otherTaxExists = true;
    });

    if (cgst) {
      if (cgstExists) {
        await ItemTaxInfo.update(
          {
            tax_percentage: cgst,
          },
          {
            where: { item_id, tax_type: "CGST" },
          }
        );
      }
    }
    if (igst) {
      if (igstExists) {
        await ItemTaxInfo.update(
          {
            tax_percentage: igst,
          },
          {
            where: { item_id, tax_type: "IGST" },
          }
        );
      }
    }
    if (sgst) {
      if (sgstExists) {
        await ItemTaxInfo.update(
          {
            tax_percentage: sgst,
          },
          {
            where: { item_id, tax_type: "SGST" },
          }
        );
      }
    }
    if (otherTax) {
      if (otherTaxExists) {
        await ItemTaxInfo.update(
          {
            tax_percentage: otherTax,
          },
          {
            where: { item_id, tax_type: "OTHERS" },
          }
        );
      }
    }
    return true;
  } catch (error) {
    return false;
  }
};

const makeTaxInfoArray = async (igst, cgst, sgst, otherTax, user_id,item_id) => {
  let itemTaxInfoArray = [];
  let cgstObject = {
    item_id,
    tax_type: "CGST",
    tax_name: "CGST",
    tax_percentage: cgst,
    active_ind: "Y",
    created_by: user_id,
    created_at: Date.now(),
  };
  let sgstObject = {
    item_id,
    tax_type: "SGST",
    tax_name: "SGST",
    tax_percentage: sgst,
    active_ind: "Y",
    created_by: user_id,
    created_at: Date.now(),
  };
  let igstObject = {
    item_id,
    tax_type: "IGST",
    tax_name: "IGST",
    tax_percentage: igst,
    active_ind: "Y",
    created_by: user_id,
    created_at: Date.now(),
  };
  let otherTaxObject = {
    item_id,
    tax_type: "OTHERS",
    tax_name: "OTHERS",
    tax_percentage: otherTax,
    active_ind: "Y",
    created_by: user_id,
    created_at: Date.now(),
  };
  itemTaxInfoArray.push(cgstObject);
  itemTaxInfoArray.push(sgstObject);
  itemTaxInfoArray.push(igstObject);
  itemTaxInfoArray.push(otherTaxObject);

  return itemTaxInfoArray;
};

module.exports = {
  getInventoryArray,
  getItemTaxArray,
  validateItemForSaveAndUpdate,
  findAllActiveItems,
  findAllDeactiveItems,
  updateTaxTypes,
  itemDetails,
  calculateTotalInput,
  calculateTotalOutput,
  makeTaxInfoArray,
};

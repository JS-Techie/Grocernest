const db = require("../../models");
const { sequelize } = require("../../models");
const Grn = db.GrnModel;
const GrnDetails = db.GrnDetailsModel;
const Inventory = db.InventoryModel;
const Batch = db.BatchModel;


const saveGrn = async (grnRequestBody) =>{
    console.log("within saveGrn")
    const {

        grnId,
        grnLocationId,
        supplierId,
        invoiceNo,
        invoiceAmount,
        supplierDisc,
        grnStatus,
        grnDate

    } = grnRequestBody.body

    if(grnRequestBody.grnId){
        console.log("within update block saveGrn")
        /**
         * TODO: update grn data
         */

        

    }else if(!grnRequestBody.grnId){
        /**
         * TODO: create new grn 
         */
        console.log("within creation block saveGrn")
        console.log("grnRequestBody: "+grnLocationId)
        const newGrn = await Grn.create({
            grn_location_id : grnLocationId,
            supplier_id : supplierId,
            invoice_no : invoiceNo,
            invoice_amt : invoiceAmount,
            supplier_disc : supplierDisc,
            status : grnStatus,
            grn_date : grnDate,
            active_ind : "Y",
            created_by : 1,
            created_at : new Date(),
            updated_at : null,
            updated_by : null
        });
        await newGrn.save();
       /* const result = await Grn.findOne({
            attributes: [
              [sequelize.literal("currval('t_grn_seq')"), 'id']
            ],
            where: {
              id: newGrn.id.val
            }
          });*/
          
         // console.log("hehe",result.id); 
       // console.log("after newGrn id ",currval(newGrn.id.val));
       console.log("newGrn "+JSON.stringify(newGrn.id.value)); 
       if(newGrn){
            // const result = await sequelize.query('SELECT currval(\'t_grn_seq\')');
            // const id = result[0].currval;
            // console.log(id);
            return newGrn;
            console.log("newGrn "+JSON.stringify(newGrn.id));

        }
    }
    return "hello world";

}

const grnDetails = async(requestBody) => {

   const {
    grnIdList
   } = requestBody.body;
   try{

        const[getGrnDetails, metadata] = await sequelize.query(`select t_grn.id, t_lkp_location.id as locationId, t_lkp_location.loc_name,
        t_grn.invoice_no, t_grn.invoice_amt, t_grn.grn_date, t_grn.status from t_grn 
        inner join t_lkp_location on t_lkp_location.id = t_grn.grn_location_id`);

        console.log("getGrnDetails ", getGrnDetails);
    /* const[getGrnDetails, metadata] = await sequelize.query(`select t_grn.id, t_lkp_location.id, t_lkp_location.loc_name, t_supplier.id, t_supplier.first_name,
        t_grn.invoice_no, t_grn.invoice_amt, t_grn.grn_date, t_grn.status,
        t_grn.supplier_disc, t_grn.created_at, t_grn.updated_at, u1.full_name,
        u2.full_name from ((((t_grn 
        inner join t_lkp_location on t_lkp_location.id = t_grn.grn_location_id)
        left join t_supplier on t_supplier.id = t_grn.supplier_id)
        left join t_user u1 on t_grn.created_by = u1.id)
        left join t_user u2 on t_grn.updated_by = u2.id)
        where t_grn.id in "${grnIdList}" and t_grn.active_ind ='Y'`);*/
        return getGrnDetails;
    
   }catch(e){
    console.log(e);
     return false;
   }
   
}

module.exports = {saveGrn, grnDetails};
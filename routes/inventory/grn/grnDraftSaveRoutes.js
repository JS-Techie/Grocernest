const router=require("express").Router()

const grnDraftSaveController  =require ('../../../controllers/inventory/grn/grnDraftSaveController')


router.post('/draft/save', grnDraftSaveController)

module.exports=router
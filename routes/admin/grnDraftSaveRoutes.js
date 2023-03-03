const router=require("express").Router()

const grnDraftSaveController  =require ('../../controllers/admin/grnDraftSaveController')


router.post('/grnDraftSave', grnDraftSaveController)

module.exports=router
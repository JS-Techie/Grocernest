const bcrypt=require('bcrypt')
const saltRounds=10

const encryptData=async(props)=>{
    const encryptedData=await bcrypt.hash(props, saltRounds)
    return(
        encryptedData)
    

}

module.exports=encryptData
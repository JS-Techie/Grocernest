const specialCharacterCheck=(str)=>{
    var regex = /[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g;
	return regex.test(str);
}

module.exports=specialCharacterCheck
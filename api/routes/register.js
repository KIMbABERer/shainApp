var models 	= require('./../models');
var bcrypt	= require('bcrypt');
var jwt		= require('jsonwebtoken');
var router 	= require('express').Router();


//register a new user
router.post('/',function(req,res){
	console.log('Registration Endpoint');
	var __user = req.body;

	/*
	The Bcrypt library takes the user password entered in the
	registration form and encrypts it with a salt that is 
	randomly generated through 10 rounds of roundomization
	*/
	bcrypt.genSalt(10, function(err, salt) {
	    bcrypt.hash(__user.password, salt, function(err, hash) {
	        // Store hash in your password DB.
	        if(!err){
	        	/*
	        	the resulting hash produced contains an encrypted
	        	password and some information on how to decode the
	        	password that only bycrypt knows.
	        	*/
	        	__user.password = hash;
		        	models.users.create(__user)
		        	.then(function(user){
		        	//remove password from response

		        	user.password ='';
		        	res.json({user:user,msg:'Account Created'});
		        })

	        }
	    });
	});
});


router.post('/authenticate',function(req,res){
	console.log('Authentication Endpoint');
	var __user = req.body;
	console.log(__user.email);
	var where = {where:{email:__user.email}};
	models.users.find(where)
	.then(function(user){
		if (user == null){
			res.json({msg: 'ACCOUNT NOT EXISTED'});
		} else {

			/*
			In order to log a user in, the user record is retrieved
			from the database based on their email. This is why it is important
			to have a UNIQUE constraint on the email property so you can't have
			two users with the same email entered in the database. The encrypted 
			password is retrieved from the database and the bycrypt compare function
			is run to see if the user entered the correct password. The function uses
			the encryption instructions stored as part of the password hash to encrypt
			the password he user just entered on log in. If the two encrypted strings match
			at the end, the password is deemed correct and the user is allowed in.
			*/

			bcrypt.compare(__user.password, user.password, function(err, result) {
			    // res == true 
			    if(result==true){
			    	user.password = '';
			    	delete user.password;
			    	var user_obj = {email:user.email};
					var token = jwt.sign(user_obj,'brainstationkey');

					res.set('authentication',token);
			    	// res.json(user_obj)
			    	res.json({user:user,msg:'Login Success'});
			    }
			    else{
			    	// res.status(403)
			    		res.json({msg:'WRONG PASSWORD'});
			    }
			});
	    }
		
	})

})

module.exports = router;
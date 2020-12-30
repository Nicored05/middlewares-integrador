const fs = require('fs');
const path = require('path');
const bcryptjs = require("bcryptjs");
const {validationResult} = require('express-validator')

const toThousand = n => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

const file = path.join(__dirname, "../database/users.json");

function getAllUsers(){
    return JSON.parse(fs.readFileSync(file, "utf-8"));
}

function generateNewId(){
    const users = getAllUsers();
    return users.pop().id + 1;
}

function writeUser (user){
    const users = getAllUsers();
    const usersToSave= [...users, user];
    const userToJson = JSON.stringify(usersToSave, null, " ");
    fs.writeFileSync(file, userToJson);
}

module.exports = {
    showRegister: (req, res) => {
        return res.render('./user/user-register-form');
    },
    processRegister: (req, res) => {
        const validation = validationResult(req);
        
		if(!validation.isEmpty()){
            return res.render('./user/user-register-form',{errors:validation.errors,email:req.body.email});
		}else{
            
            const passwordHashed = bcryptjs.hashSync(req.body.password, 10);
            const image = req.files[0].filename;
            
            const user= {
                id: generateNewId(),
                email: req.body.email,
                password: passwordHashed,
                avatar: image
            }

            
            req.session.user = user;

            writeUser(user);

            res.redirect("/");
     }

    },
    showLogin: (req, res) => {
        
        return res.render('./user/user-login-form');
    },
    processLogin: (req, res) => {
        const validation = validationResult(req);

        		
		if(!validation.isEmpty()){	
			return res.render('./user/user-login-form',{errors:validation.errors});
		}else{
            const email= req.body.email;
            const password = req.body.password;
            const users = getAllUsers();
            
            const userExist = users.find((user) =>{
                return user.email === email;
            });

            
            

            if(userExist && bcryptjs.compareSync(password, userExist.password)) {
               
                req.session.user = userExist; 
                
                if (req.body.remember) {
                    res.cookie('email', userExist.email, { maxAge: 900000});
                }

                return res.redirect("/user/profile");  

            } else { 
                const emailFormulario = req.body.email;
               
                return res.render('./user/user-login-form',{errors:[{msg: 'Credenciales invalidas'}],email:emailFormulario})
            }

                  
        

     }
        
    },
    showProfile: (req, res) => {
        const user =  req.session.user;

       
        return res.render('user/profile', {
            id:user.id,
            email: user.email,
            image: user.avatar

        });
    },
    logout: (req, res) => {
        res.cookie("email", null, {maxAge: -1});
        req.session.destroy();
        return res.redirect('/');
    }

}
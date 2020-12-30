const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, "../database/users.json");

function rememberMiddleware (req, res,next){
   
    if(req.cookies.email != undefined &&  req.session.user == undefined ){
        
        const usersJSON = fs.readFileSync(file, "utf-8")
        
        let users;

        if(usersJSON == ""){
            users=[];
            
        }else{
            users = JSON.parse(usersJSON)
        }

        let usuario;
    
        for(let i = 0; i < users.length; i++){
            if(users[i].email == req.cookies.email){
                    usuario=users[i];
                    break;
            }
        }
        req.session.user = usuario; 
    }
    next();
}

module.exports = rememberMiddleware;
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path')
const fs = require('fs')
const userController = require('../controllers/userController');
const {body} = require('express-validator');


const authMiddleware = require("../middleware/authMiddleware")
const guestMiddleware = require('../middleware/guestMiddleware')


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, __dirname + '/../../public/images/users')
      
    },
    filename: function (req, file, cb) {
      
      cb(null, file.fieldname + '-' + Date.now() + '-' +file.originalname)
    }
  })
   
const upload = multer({ storage: storage })

const usersFilePath = path.join(__dirname + "/../database/users.json")

// Muestra la vista de registro
router.get('/register', guestMiddleware, userController.showRegister);

// Procesa la vista de registro
router.post('/register', upload.any(),[
  body('email')
      .notEmpty()
      .withMessage('el campo email es obligatorio')
      .bail()
      .isEmail()
      .withMessage('Email con formato incorrecto')
      .custom(function (value){
          let fileUsers = fs.readFileSync(usersFilePath,'utf-8');
          let users;
          if(fileUsers == ""){
              users = [];
          } else {
              users = JSON.parse(fileUsers);
          }
      
          for (let i = 0; i< users.length; i++){
            if(users[i].email == value){
              return false;
            }
          }
          return true;
        })
        .withMessage('Usuario ya existente'),
  body('password')
        .notEmpty()
        .withMessage('El campo password es obligatorio')
        .bail()
        .isLength({ min:6 })
        .withMessage('La contraseña debe tener al menos 6 caracteres')
        .bail()
        .custom((value, { req }) => value == req.body.retype)
        .withMessage('Las contraseñas no coinciden'),
  body('retype')
        .notEmpty()
        .withMessage('El campo es obligatorio')
        .bail()
        .custom((value, { req }) => value == req.body.password)
        .withMessage('Las contraseñas no coinciden'),
  body('avatar')
        .custom((valueImg, { req }) => req.files[0])
        .withMessage('El avatar es obligatorio')
        .bail()
        .custom((value, { req }) => {
            const acceptedExtensions = ['.jpg', '.png', 'jpeg'];
            const fileExt = path.extname(req.files[0].originalname);
            return acceptedExtensions.includes(fileExt);
        })
        .withMessage('Extension invalida')
        
], userController.processRegister);

// Muestra la vista de login
router.get('/login', guestMiddleware, userController.showLogin);

// Procesa la vista de login
router.post('/login', [
  body('email')
          .notEmpty()
          .withMessage('el campo email es obligatorio')
          .bail()
          .isEmail()
          .withMessage('Email con formato incorrecto'),
  body('password')
          .notEmpty()
          .withMessage('El campo password es obligatorio')
          .bail()
          .isLength({ min:6 })
          .withMessage('La contraseña debe tener al menos 6 caracteres'),
], userController.processLogin);

// Muestra el perfil del usuario
router.get('/profile', authMiddleware, userController.showProfile);

// Cierra la sesión
router.get('/logout', userController.logout);

module.exports = router;
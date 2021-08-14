const bcrypt = require('bcryptjs') 
const db = require('../models')
const User = db.User
const Teacher = db.Teacher

const userController = {
  signUpPage: (req, res) => {
    return res.render('signup')
  },

  signUp: (req, res) => {
    // 確認密碼
    if(req.body.passwordCheck !== req.body.password){
      req.flash('error_messages', '兩次密碼輸入不同！')
      return res.redirect('/signup')
    } else {
      // 確認是否有重複註冊
      User.findOne({where: {email: req.body.email}}).then(user => {
        if(user){
          req.flash('error_messages', '信箱重複！')
          return res.redirect('/signup')
        } else {
          User.create({
            name: req.body.name,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10), null)
          }).then(user => {
            req.flash('success_messages', '成功註冊帳號！')
            return res.redirect('/signin')
          })  
        }
      })    
    }
  },

  signInPage: (req, res) => {
    return res.render('signin')
  },

  signIn: (req, res) => {
    req.flash('success_messages', '成功登入！')
    res.redirect('/cramschool')
  },

  logout: (req, res) => {
    req.flash('success_messages', '登出成功！')
    req.logout()
    res.redirect('/signin')
  },

  getUser: (req, res) => {
    return User.findByPk(req.params.id, {
      raw:true,
      nest: true, 
      include: [Teacher]
    }).then(user => {
      return res.render('userprofile', {
        user: user
      })
    })
  },

  getEditUserPage: (req, res) => {
    let isTeacher = true
    return User.findByPk(req.params.id, {
      raw:true,
      nest: true, 
      include: [Teacher]
    }).then(user => {
      if (!user.Teacher.id) {
        isTeacher = false
      }
      return res.render('editprofile', { 
        user: user,
        isTeacher: isTeacher
      })
    })
  },
}

module.exports = userController
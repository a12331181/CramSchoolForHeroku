const bcrypt = require('bcryptjs') 
const db = require('../models')
const User = db.User
const Teacher = db.Teacher
const fs = require('fs')

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
  //目前登錄先做老師這個身分的使用者
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
  
  postUser: (req, res) => {
    const file = req.file
    if (file) {
      fs.readFile(file.path, (err, data) => {
        if (err) console.log('Error: ', err)
        fs.writeFile(`upload/${file.originalname}`, data, () => {
          return Teacher.create({
            name: req.body.name,
            sex: req.body.sex,
            birth: req.body.birth,
            phone: req.body.phone,
            address: req.body.address,
            education: req.body.education,
            school: req.body.school,
            UserId: req.user.id,
            image: file ? `/upload/${file.originalname}` : null
          }).then((teacher) => {
            req.flash('success_messages', 'user was successfully created')
            res.redirect('/')
          })
        })
      })
    } else {
      return Teacher.create({
        name: req.body.name,
        sex: req.body.sex,
        birth: req.body.birth,
        phone: req.body.phone,
        address: req.body.address,
        education: req.body.education,
        school: req.body.school,
        UserId: req.user.id,
        image: null
      }).then((teacher) => {
        req.flash('success_messages', 'user was successfully created')
        res.redirect('/')
      })      
    }
  },

  putUser: (req, res) => {
    const file = req.file
    if (file) {
      fs.readFile(file.path, (err, data) => {
        if (err) console.log('Error: ', err)
        fs.writeFile(`upload/${file.originalname}`, data, () => {
          return Teacher.findOne({ where: { UserId : req.user.id } })
            .then((teacher) => {
              teacher.update({
                name: req.body.name,
                sex: req.body.sex,
                birth: req.body.birth,
                phone: req.body.phone,
                address: req.body.address,
                education: req.body.education,
                school: req.body.school,
                image: file ? `/upload/${file.originalname}` : teacher.image
              }).then((teacher) => {
                req.flash('success_messages', 'user was successfully to update')
                res.redirect('/')
              })
            })
        })
      })
    } else {
      return Teacher.findOne({ where: { UserId : req.user.id } })
        .then((teacher) => {
          teacher.update({
            name: req.body.name,
            sex: req.body.sex,
            birth: req.body.birth,
            phone: req.body.phone,
            address: req.body.address,
            education: req.body.education,
            school: req.body.school,
            image: teacher.image
          }).then((teacher) => {
            req.flash('success_messages', 'user was successfully to update')
            res.redirect('/')
          })
        })
    }
  },
}

module.exports = userController
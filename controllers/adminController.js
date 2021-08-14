const db = require('../models')
const Course = db.Course
const User = db.User
const Teacher = db.Teacher

const adminController = {
  getSchoolIndexPage: (req, res) => {
    return res.render('admin/cramschool')
  },
  getCourses : (req, res) => {
    return Course.findAll({raw: true}).then(courses =>{
      return res.render('admin/courses', { courses: courses })
    })
  },
  getCreateCoursePage: (req, res) => {
    return res.render('admin/createcourse')
  },
  postCourse: (req, res) => {
    return Course.create({
      name: req.body.name,
      time: req.body.time,
      type: req.body.type,
      amounts: req.body.amounts,
      price: req.body.price
    })
      .then((course) => {
        req.flash('success_messages', 'Course was successfully created.')
        res.redirect('/admin/courses')
      })
  },
  getCourse: (req, res) => {
    return Course.findByPk(req.params.id, {raw:true}).then(course => {
      return res.render('admin/course', {
        course: course
      })
    })
  },
  editCourse: (req, res) => {
    return Course.findByPk(req.params.id, {raw:true}).then(course => {
      return res.render('admin/createcourse', { course: course } )
    })
  },
  putCourse: (req, res) => {
    return Course.findByPk(req.params.id)
      .then((course) => {
        course.update({
          name: req.body.name,
          time: req.body.time,
          type: req.body.type,
          amounts: req.body.amounts,
          price: req.body.price
        })
        .then((course) => {
          req.flash('success_messages', 'course was successfully to update')
          res.redirect('/admin/courses')
        })
      })
  },
  deleteCourse: (req, res) => {
    return Course.findByPk(req.params.id)
      .then((course) => {
        course.destroy()
          .then((course) => {
            res.redirect('/admin/courses')
          })
      })
  },
  getUsers: (req, res) =>{
    return User.findAll({raw: true}).then(users => {
      return res.render('admin/users', { users: users })
    })
  },
  toggleAdmin: (req, res) =>{
    return User.findByPk(req.params.id)
      .then((user) => {
        user.update({
          isAdmin: !user.isAdmin
        })
        .then((user) => {
          req.flash('success_messages', 'isAdmin was successfully to update')
          res.redirect('/admin/users')
        })
      })
  },
  getTeachers: (req, res) =>{
    return Teacher.findAll({raw: true}).then(teachers =>{
      return res.render('admin/teachers', { teachers: teachers })
    })
  },
  getTeacher: (req, res) => {
    return Teacher.findByPk(req.params.id, {
      raw:true,
      nest: true, 
      include: [User]
    }).then(teacher => {
      return res.render('admin/teacher', {
        teacher: teacher
      })
    })
  }
}   

module.exports = adminController
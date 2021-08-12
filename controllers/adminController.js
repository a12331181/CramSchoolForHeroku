const db = require('../models')
const Course = db.Course

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
  }
}   

module.exports = adminController
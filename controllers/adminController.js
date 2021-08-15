const db = require('../models')
const Course = db.Course
const User = db.User
const Teacher = db.Teacher
const Student = db.Student

const adminController = {
  // 後臺首頁
  getSchoolIndexPage: (req, res) => {
    return res.render('admin/cramschool')
  },
  // 課程相關程式碼
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
  // 使用者相關程式碼
  getUsers: (req, res) => {
    return User.findAll({raw: true}).then(users => {
      return res.render('admin/users', { users: users })
    })
  },
  toggleAdmin: (req, res) => {
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
  // 老師相關程式碼
  getTeachers: (req, res) => {
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
  },
  editTeacher: (req, res) => {
    return Teacher.findByPk(req.params.id, {raw:true}).then(teacher => {
      return res.render('admin/editteacher', { teacher: teacher } )
    })
  },
  putTeacher: (req, res) => {
    return Teacher.findByPk(req.params.id)
      .then((teacher) => {
        teacher.update({
          name: req.body.name,
          sex: req.body.sex,
          birth: req.body.birth,
          phone: req.body.phone,
          address: req.body.address,
          education: req.body.education,
          school: req.body.school
        })
        .then((teacher) => {
          req.flash('success_messages', 'teacher was successfully to update')
          res.redirect('/admin/teachers')
        })
      })
  },
  deleteTeacher: (req, res) => {
    return Teacher.findByPk(req.params.id)
      .then((teacher) => {
        teacher.destroy()
          .then((teacher) => {
            res.redirect('/admin/teachers')
          })
      })
  },
  // 學生相關程式碼
  getStudents: (req, res) => {
    return Student.findAll({raw: true}).then(students =>{
      return res.render('admin/students', { students: students })
    })
  },
  getCreateStudentPage: (req, res) => {
    return res.render('admin/createstudent')
  },
  postStudent: (req, res) => {
    return Student.create({
      name: req.body.name,
      sex: req.body.sex,
      birth: req.body.birth,
      school: req.body.school,
      grade: req.body.grade,
      tel: req.body.tel,
      address: req.body.address,
    })
      .then((student) => {
        req.flash('success_messages', 'Student was successfully created.')
        res.redirect('/admin/students')
      })
  },
}   

module.exports = adminController
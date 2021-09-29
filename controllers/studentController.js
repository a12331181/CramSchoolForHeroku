const db = require('../models')
const Student = db.Student
const Course = db.Course
const Calendar = db.Calendar
const Attend = db.Attend
const pageLimit = 10

const studentController = {
  getStudents: (req, res) => {
    let offset = 0
    let isFilter = false
    const whereQuery = {}
    let courseId = ''
    if (req.query.page) {
      offset = (Number(req.query.page) - 1) * pageLimit
    }
    if (req.query.courseId) {
      courseId = Number(req.query.courseId)
      whereQuery.id = courseId
      Student.findAndCountAll({
        raw: true,
        nest: true,
        include: [{ model: Course, as: 'EnrolledCourses', where: whereQuery }],
        limit: pageLimit,
        offset: offset
      }).then(result => {
        const page = Number(req.query.page) || 1
        const pages = Math.ceil(result.count / pageLimit)
        const totalPage = Array.from({ length: pages }).map((v, index) => index + 1)
        const prev = page - 1 < 1 ? 1 : page - 1
        const next = page + 1 > pages ? pages : page + 1
        isFilter = true
        Course.findAll({
          raw: true,
          nest: true
        }).then(courses => {
          return res.render('students', { 
            students: result.rows,
            courses: courses,
            courseId: whereQuery.id,
            isFilter: isFilter,
            page: page,
            totalPage: totalPage,
            prev: prev,
            next: next,
            isAdmin: req.user.isAdmin
          })
        })
      })
    } else {
      Student.findAndCountAll({
        raw: true,
        nest: true,
        limit: pageLimit,
        offset: offset
      }).then(result => {
        const page = Number(req.query.page) || 1
        const pages = Math.ceil(result.count / pageLimit)
        const totalPage = Array.from({ length: pages }).map((v, index) => index + 1)
        const prev = page - 1 < 1 ? 1 : page - 1
        const next = page + 1 > pages ? pages : page + 1
        Course.findAll({
          raw: true,
          nest: true
        }).then(courses => {
          return res.render('students', { 
            students: result.rows,
            courses: courses,
            isFilter: isFilter,
            page: page,
            totalPage: totalPage,
            prev: prev,
            next: next,
            isAdmin: req.user.isAdmin
          })
        })
      })
    }
  },

  getStudent: (req, res) => {
    Student.findByPk(req.params.id,{
      include: [{ model: Course, as: 'EnrolledCourses' }]
    }).then(student => {
      const enrolledCourses = student.EnrolledCourses.map(r => ({
        ...r.dataValues
      }))
      return res.render('student', { student: student.toJSON(), enrolledCourses: enrolledCourses })
    })
  },

  getStudentAttend: (req, res) => {
    Promise.all([
      Course.findByPk(req.params.courseId, {
        include: [{ model: Calendar, include: { model: Attend, where: { StudentId: req.params.studentId }}}]
      }),
      Student.findByPk(req.params.studentId, {
        raw: true,
        nest: true
      })
    ]).then(([course,student]) => {
      const data = course.Calendars.map(r => ({
        ...r.dataValues,
        ...r.dataValues.Attends['0'].dataValues
      }))
      return res.render('studentattend', { student: student, course: course.toJSON(), attends: data })
    })
  }
}

module.exports = studentController
const db = require('../models')
const Course = db.Course
const User = db.User
const Teacher = db.Teacher
const Student = db.Student
const Enrollment = db.Enrollment
const Calendar = db.Calendar
const fs = require('fs')
const pageLimit = 12

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
    Teacher.findAll({
      raw: true,
      nest: true
    }).then(teachers => {
      return res.render('admin/createcourse', {
        teachers: teachers
      })
    })
  },
  postCourse: (req, res) => {
    return Course.create({
      name: req.body.name,
      time: req.body.time,
      type: req.body.type,
      amounts: req.body.amounts,
      price: req.body.price,
      TeacherId: req.body.teacherId
    }).then((course) => {
      course = course.toJSON()
      let calendarList = []
      for (let i = 0; i < Number(course.amounts); i++) {
        calendarList.push(
          {
            date: '2021-01-01', //日期,內容為預設值
            content: i,
            CourseId: course.id,
            period: 1
          }
        )
      }
      Calendar.bulkCreate(calendarList).then(calendars => {
        req.flash('success_messages', 'Course was successfully created.')
        res.redirect('/admin/courses')
      }) 
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
    Teacher.findAll({
      raw: true,
      nest: true
    }).then(teachers => {
      return Course.findByPk(req.params.id, {raw:true}).then(course => {
        return res.render('admin/createcourse', { 
          course: course,
          teachers: teachers
        })
      })
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
          price: req.body.price,
          TeacherId: req.body.teacherId
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
  // 課程行事曆相關程式碼
  getCalendar : (req, res) => {
    let offset = 0
    if (req.query.page) {
      offset = (req.query.page - 1) * pageLimit
    }
    Promise.all([
      Calendar.max('period', {
        where: {
          CourseId: req.params.id
        }
      }),
      Course.findByPk(req.params.id, {
        raw: true,
        nest: true
      }),
      Calendar.findAndCountAll({
        where: {
          CourseId: req.params.id
        },
        offset: offset,
        limit: pageLimit
      })
    ]).then(([calendarPeriod, course, result]) =>{
      let isPeriodNotEqualOne = true
      if (calendarPeriod === 1) {
        isPeriodNotEqualOne = false
      }
      const page = Number(req.query.page) || 1
      const pages = Math.ceil(result.count / pageLimit)
      const totalPage = Array.from({ length: pages }).map((item, index) => index + 1)
      const prev = page - 1 < 1 ? 1 : page - 1
      const next = page + 1 > pages ? pages : page + 1
      const calendars = result.rows.map(r => ({
        ...r.dataValues
      }))
      return res.render('admin/course', { 
        course: course, 
        calendars: calendars, 
        isPeriodNotEqualOne: isPeriodNotEqualOne,
        page: page,
        totalPage: totalPage,
        prev: prev,
        next: next
      })
    })
  },
  postNextPeriodCalendar: (req, res) => {
    Promise.all([
      Calendar.max('period', {
        where: {
          CourseId: req.params.id
        }
      }),
      Course.findByPk(req.params.id, {
        raw: true,
        nest: true
      })
    ]).then(([period, course]) => {
      let calendarList = []
      for (let i = 0; i < Number(course.amounts); i++) {
        calendarList.push(
          {
            date: '2021-01-01', //日期,內容為預設值
            content: i,
            CourseId: course.id,
            period: period + 1
          }
        )
      }
      Calendar.bulkCreate(calendarList).then(calendars => {
        req.flash('success_messages', '已成功新增下一期課程')
        res.redirect('/admin/courses')
      }) 
    })
  },
  editCalendar: (req, res) => {
    return Calendar.findByPk(req.params.id, {raw:true}).then(calendar => {
      return res.render('admin/editcalendar',{ calendar: calendar })
    })
  },
  putCalendar: (req, res) => {
    return Calendar.findByPk(req.params.id)
      .then((calendar) => {
        calendar.update({
          date: req.body.date,
          content: req.body.content
        })
        .then((calendar) => {
          req.flash('success_messages', 'calendar was successfully to update')
          res.redirect('/admin/courses')
        })
      })
  },
  deleteCalendars: (req, res) => {
    Calendar.max('period', {
      where: {
        CourseId: req.params.id
      }
    }).then(period => {
      Calendar.destroy({
        where: {
          CourseId: req.params.id,
          period: period
        }
      }).then((calendars) => {
        req.flash('success_messages', '已成功刪除最新一期課程')
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
          req.flash('success_messages', '使用者權限已更新')
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
      if (teacher === null){
        console.log('Not found!')
        res.redirect('/admin/teachers')
      } else {
        return res.render('admin/teacher', {
          teacher: teacher
        })
      }
    })
  },
  editTeacher: (req, res) => {
    return Teacher.findByPk(req.params.id, {raw:true}).then(teacher => {
      if (teacher ===null) {
        console.log('Not found!')
        res.redirect('/admin/teachers')
      } else {
        return res.render('admin/editteacher', { teacher: teacher } )       
      }
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
          req.flash('success_messages', '成功修改教師資料')
          res.redirect('/admin/teachers')
        })
      })
  },
  // 學生相關程式碼
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
          return res.render('admin/students', { 
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
          return res.render('admin/students', { 
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
  getCreateStudentPage: (req, res) => {
    return res.render('admin/createstudent')
  },
  postStudent: (req, res) => {
    file = req.file
    if (file) {
      fs.readFile(file.path, (err, data) => {
        if (err) console.log('Error: ', err)
        fs.writeFile(`upload/${file.originalname}`, data, () => {
          return Student.create({
            name: req.body.name,
            sex: req.body.sex,
            birth: req.body.birth,
            school: req.body.school,
            grade: req.body.grade,
            tel: req.body.tel,
            address: req.body.address,
            image: file ? `/upload/${file.originalname}` : null
          }).then((student) => {
            req.flash('success_messages', '成功建立學生資料')
            return res.redirect('/admin/students')
          })
        })
      })
    } else {      
      return Student.create({
        name: req.body.name,
        sex: req.body.sex,
        birth: req.body.birth,
        school: req.body.school,
        grade: req.body.grade,
        tel: req.body.tel,
        address: req.body.address,
        image: null
      }).then((student) => {
        req.flash('success_messages', '成功建立學生資料')
        return res.redirect('/admin/students')
      })
    }
  },
  getStudent: (req, res) => {
    return Student.findByPk(req.params.id, {raw:true}).then(student => {
      return res.render('admin/student', {
        student: student
      })
    })
  },
  editStudent: (req, res) => {
    return Student.findByPk(req.params.id, {raw:true}).then(student => {
      return res.render('admin/createstudent', { student: student } )
    })
  },
  putStudent: (req, res) => {
    const file = req.file
    if (file) {
      fs.readFile(file.path, (err, data) => {
        if (err) console.log('Error: ', err)
        fs.writeFile(`upload/${file.originalname}`, data, () => {
          return Student.findByPk(req.params.id)
            .then((student) => {
              student.update({
                name: req.body.name,
                sex: req.body.sex,
                birth: req.body.birth,
                school: req.body.school,
                grade: req.body.grade,
                tel: req.body.tel,
                address: req.body.address,
                image: file ? `/upload/${file.originalname}` : student.image
              }).then((student) => {
                req.flash('success_messages', '成功更新學生資料')
                return res.redirect('/admin/students')
              })
            })
        })
      })
    } else {
      return Student.findByPk(req.params.id)
        .then((student) => {
          student.update({
            name: req.body.name,
            sex: req.body.sex,
            birth: req.body.birth,
            school: req.body.school,
            grade: req.body.grade,
            tel: req.body.tel,
            address: req.body.address,
            image: student.image
          }).then((student) => {
            req.flash('success_messages', '成功更新學生資料')
            return res.redirect('/admin/students')
          })
        })
    }
  },
  deleteStudent: (req, res) => {
    return Student.findByPk(req.params.id)
      .then((student) => {
        student.destroy()
          .then((student) => {
            req.flash('success_messages', '成功刪除學生資料')
            res.redirect('/admin/students')
          })
      })
  },
  enrollCoursePage: (req, res) => {
    Student.findByPk(req.params.id, {
      include: [ 
        { model: Course, as: 'EnrolledCourses' }
      ]
    }).then(student =>{
      Course.findAll({ 
        include: [ 
          { model: Student, as: 'EnrolledStudents' }
        ]
       }).then(courses =>{
        const data = courses.map(r => ({
        ...r.dataValues,
        isEnrolled: student.EnrolledCourses.map(d => d.id).includes(r.id)
      }))
        return res.render('admin/enrollcourse', { student: student.toJSON(), courses: data })
      })
    })
  },
  addEnrollment: (req, res) => {
    return Enrollment.create({
      StudentId: req.params.studentId,
      CourseId: req.params.courseId
    }).then((student) => {
      req.flash('success_messages', '成功註冊課程')
      return res.redirect('back')
    })
  },
  removeEnrollment: (req, res) => {
    return Enrollment.findOne({
      where: {
        StudentId: req.params.studentId,
        CourseId: req.params.courseId
      }
    }).then((enrollment) => {
        enrollment.destroy()
          .then((enrollment) => {
            req.flash('success_messages', '成功註銷課程')
            return res.redirect('back')
          })
      })
  }
}   

module.exports = adminController
const db = require('../models')
const Course = db.Course
const User = db.User
const Teacher = db.Teacher
const Student = db.Student
const Enrollment = db.Enrollment
const Calendar = db.Calendar
const fs = require('fs')

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
    return Course.findByPk(req.params.id, {
      include: [Calendar]
    }).then(course =>{
      const data = course.dataValues.Calendars
      const calendars = data.map(r => ({
        ...r.dataValues
      }))
      return res.render('admin/course', { course: course.dataValues, calendars: calendars })
    })
  },
  getCreateCalendarPage : (req, res) => {
    return res.render('admin/createcalendar', { courseId: req.params.id })
  },
  postCalendar: (req, res) => {
    return Calendar.create({
      date: req.body.date,
      content: req.body.content,
      CourseId: req.body.courseId
    })
      .then((calendar) => {
        req.flash('success_messages', 'Calendar was successfully create.')
        res.redirect('/admin/courses')
      })
  },
  editCalendar: (req, res) => {
    return Calendar.findByPk(req.params.id, {raw:true}).then(calendar => {
      return res.render('admin/createcalendar',{ calendar: calendar })
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
  deleteCalendar: (req, res) => {
    return Calendar.findByPk(req.params.id)
      .then((calendar) => {
        calendar.destroy()
          .then((calendar) => {
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
            req.flash('success_messages', 'Student was successfully created.')
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
        req.flash('success_messages', 'Student was successfully created')
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
                req.flash('success_messages', 'Student was successfully to update.')
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
            req.flash('success_messages', 'Student was successfully to update.')
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
            return res.redirect('back')
          })
      })
  }
}   

module.exports = adminController
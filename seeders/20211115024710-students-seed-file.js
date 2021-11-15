'use strict';
const faker = require('faker')

function randomSex() {
  const sexList = [
    '男', '女',
  ]
  let randomNumber = Math.floor(Math.random() * 2)
  return sexList[randomNumber]
}

function randomGrade() {
  const gradeList = [
    '一年級', '二年級', '三年級', '四年級', '五年級', '六年級', '七年級', '八年級', '九年級', '其他'
  ]
  let randomNumber = Math.floor(Math.random() * 10)
  return gradeList[randomNumber]
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Students',
      Array.from({ length: 50 }).map((d, i) =>
      ({
        name: faker.name.findName(),
        sex: randomSex(),
        birth: '2011-11-11',
        school: faker.name.findName() + ' School',
        grade: randomGrade(),
        tel: faker.phone.phoneNumber(),
        address: faker.address.streetAddress(),
        createdAt: new Date(),
        updatedAt: new Date(),
        image: `https://loremflickr.com/400/320/students,school/?random=${Math.random() * 100}`,
        status: Math.floor(Math.random() * 2)+1 
      })
    ), {})
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Students', null, {})
  }
};

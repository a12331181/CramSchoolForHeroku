'use strict';
const faker = require('faker')

function randomSex() {
  const sexList = [
    '男', '女',
  ]
  let randomNumber = Math.floor(Math.random() * 2)
  return sexList[randomNumber]
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Teachers', [{
      name: faker.name.findName(),
      sex: randomSex(),
      birth: '2011-11-11',
      phone: faker.phone.phoneNumber(),
      address: faker.address.streetAddress(),
      education: '大學',
      school: faker.name.findName() + ' School',
      createdAt: new Date(),
      updatedAt: new Date(),
      image: `https://loremflickr.com/240/320/teacher/?random=${Math.random() * 100}`,
      status: 1,
      UserId: 1
    }, {
      name: faker.name.findName(),
      sex: randomSex(),
      birth: '2011-11-11',
      phone: faker.phone.phoneNumber(),
      address: faker.address.streetAddress(),
      education: '大學',
      school: faker.name.findName() + ' School',
      createdAt: new Date(),
      updatedAt: new Date(),
      image: `https://loremflickr.com/240/320/teacher/?random=${Math.random() * 100}`,
      status: 1,
      UserId: 2
    }, {
      name: faker.name.findName(),
      sex: randomSex(),
      birth: '2011-11-11',
      phone: faker.phone.phoneNumber(),
      address: faker.address.streetAddress(),
      education: '大學',
      school: faker.name.findName() + ' School',
      createdAt: new Date(),
      updatedAt: new Date(),
      image: `https://loremflickr.com/240/320/teacher/?random=${Math.random() * 100}`,
      status: 1,
      UserId: 3
    }], {})
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Teachers', null, {})
  }
};

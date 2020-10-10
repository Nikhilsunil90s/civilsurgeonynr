'use strict';

/**
 * List all kind of email
 *
 * Useful for test for different email patterns
 *
 * parameter
 * value - email name
 * description - description of the email, describe the email type
 *
 * @type {*[]}
 */
var emailData = [
    {
        value: null,
        description: 'null (this should be fail)'
    },
    {
        value: '',
        description: 'null string (this should be fail)'
    },
    {
        value: [],
        description: 'array (this should be fail)'
    },
    {
        value: {},
        description: 'json (this should be fail)'
    },
    {
        value: 'https://google.com',
        description: 'url (this should be fail)'
    },
    {
        value: 'huei90@gmail.com',
        description: 'normal case (this should be pass)'
    },
    {
        value: 12312312312,
        description: 'number (should fail)'
    },
    {
        value: 'Hello World',
        description: 'String (should fail)'
    },
    {
        value: '[]@gmail.com',
        description: 'Array String (this must be fail)'
    },
    {
        value: '{}@gmail.com',
        description: 'Object String (this must be fail)'
    },
    {
        value: 'h u e i @gmail.com',
        description: 'email with blank (should fail)'
    },
    {
        value: '123@gmail.com',
        description: 'email with number name'
    },
    {
        value: 'huei.90@gmail.com',
        description: 'email with dot .'
    },
    {
        value: 'asdfaksjdfkl2j3kfjasdfk2kklasdfjklasdflkj2lk234lkjasfdlk2j@gmail.com',
        description: 'very long email'
    },
    {
        value: 'a@gmail.com',
        description: 'very short email'
    },
    {
        value: 'huei90@a.com',
        description: 'very short domain email'
    },
    {
        value: 'huei90@asdlfkjasldkfjalsdfkjasdfasdfasd1q2edacsdv24rwsdfsdfasdhoj234ljsdf.com',
        description: 'very long domain email'
    },
    {
        value: '@gmail.com',
        description: 'given email doesn\'t have prefix'
    },
    {
        value: 'ＨＵＥＩ90@gmail.com',
        description: '全形 type'
    },
    {
        value: '你好@gmail.com',
        description: 'chinese email'
    },
    {
        value: 'ㄎㄎ@gmail.com',
        description: 'Zhuyin email'
    }
];

module.exports = emailData;
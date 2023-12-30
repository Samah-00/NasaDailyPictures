const Sequelize = require('sequelize');

module.exports = (sequelize) => {
    class User extends Sequelize.Model {}
    User.init({
        email: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                isEmail: true
            }
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                len: [3, 32],
                isAlpha: true
            }
        },
        lastName: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                len: [1, 32],
                isAlpha: true
            }
        },
        password: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                len: [1, Infinity]
            }
        }
    }, {
        sequelize
    });
    return User;
};

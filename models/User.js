const Sequelize = require('sequelize');

module.exports = (sequelize) => {
    class User extends Sequelize.Model {}
    User.init({
        email: {
            type: Sequelize.STRING,
            validate: {
                allowNull: false,
                isEmail: true
            }
        },
        name: {
            type: Sequelize.STRING,
            validate: {
                allowNull: false,
                len: [3, 32],
                isAlpha: true
            }
        },
        lastName: {
            type: Sequelize.STRING,
            validate: {
                allowNull: false,
                len: [1, 32],
                isAlpha: true
            }
        },
        password: {
            type: Sequelize.STRING,
            validate: {
                allowNull: false,
                len: [1, 32]
            }
        }
    }, {
        sequelize
    });
    return User;
};

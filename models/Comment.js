const Sequelize = require('sequelize');

module.exports = (sequelize) => {
    class Comment extends Sequelize.Model {}
    Comment.init({
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        email: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        lastName: {
            type: Sequelize.STRING,
            allowNull: false
        },
        imageId: {
            type: Sequelize.STRING,
            allowNull: false
        },
        content: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                len: [1, 128]
            }
        }
    }, {
        sequelize
    });
    return Comment;
};

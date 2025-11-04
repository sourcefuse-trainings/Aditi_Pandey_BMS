// migrations/YYYYMMDDHHMMSS-create-books.js
'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Books', {
      id: { 
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING(36)
      },
      author_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Authors',
          key: 'id'
        },
        onDelete: 'RESTRICT'
      },
      genre_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Genres',
          key: 'id'
        },
        onDelete: 'RESTRICT'
      },
      title: {
        type: Sequelize.STRING(500),
        allowNull: false
      },
      isbn: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true
      },
      publication_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Books');
  }
};

import { Model, DataTypes, CreationOptional, InferAttributes, InferCreationAttributes, ForeignKey } from 'sequelize';
import { sequelize } from '../db';

class Book extends Model<InferAttributes<Book>, InferCreationAttributes<Book>> {
  declare id: CreationOptional<string>; 
  declare author_id: ForeignKey<number>; 
  declare genre_id: ForeignKey<number>; 
  declare title: string;
  declare isbn: string;
  declare publication_date: Date;
  declare created_at: CreationOptional<Date>;
}

Book.init(
  {
    id: {
      type: DataTypes.STRING(36), 
      primaryKey: true,
      allowNull: false,
    },
    author_id: {
      type: DataTypes.INTEGER, 
      allowNull: false,
    },
    genre_id: {
      type: DataTypes.INTEGER, 
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    isbn: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    publication_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Book',
    tableName: 'Books',
    timestamps: false,
  }
);

export default Book;
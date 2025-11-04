
import { Model, DataTypes, CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize';
import { sequelize } from '../db';

class Author extends Model<InferAttributes<Author>, InferCreationAttributes<Author>> {
  declare id: CreationOptional<number>; 
  declare name: string;
  declare bio: string | null;
  declare created_at: CreationOptional<Date>;
}

Author.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true, 
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Author',
    tableName: 'Authors',
    timestamps: false,
  }
);

export default Author;
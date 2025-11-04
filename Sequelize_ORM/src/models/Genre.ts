
import { Model, DataTypes, CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize';
import { sequelize } from '../db';

class Genre extends Model<InferAttributes<Genre>, InferCreationAttributes<Genre>> {
  declare id: CreationOptional<number>; 
  declare name: string;
  declare created_at: CreationOptional<Date>; 
}

Genre.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true, 
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Genre',
    tableName: 'Genres', 
    timestamps: false,
  }
);

export default Genre;
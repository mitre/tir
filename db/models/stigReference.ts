import { DataTypes, Model } from "sequelize";

export class StigReference extends Model {}

StigReference.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      unique: true,
      allowNull: false,
    },
    dc_identifier: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dc_publisher: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dc_subject: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dc_title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dc_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastUpdate: {
      type: DataTypes.STRING(DATETIME_LENGTH),
      allowNull: false,
    },
    creationDate: {
      type: DataTypes.STRING(DATETIME_LENGTH),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "StigReference",
    timestamps: false,
  },
);

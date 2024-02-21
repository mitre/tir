import { DataTypes, Model } from "sequelize";

export class Timezone extends Model {
  declare id: number;
  declare name: string;
  declare abbreviation: string;
}

Timezone.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    name: DataTypes.STRING(64),
    abbreviation: DataTypes.STRING(5),
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
    modelName: "Timezone",
    timestamps: false,
  },
);

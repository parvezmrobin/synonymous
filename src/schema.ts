import { ObjectId } from "bson";

export const pairsSchema = {
  name: 'pairs',
  properties: {
    _id: 'objectId?',
    a: 'string',
    b: 'string?',
  },
  primaryKey: '_id',
};

export type Pair = {
  _id?: ObjectId,
  username: string;
  a: string;
  b: string;
}

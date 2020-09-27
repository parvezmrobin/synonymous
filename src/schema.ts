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
  a: string;
  b: string;
}

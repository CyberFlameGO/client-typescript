export { type Uuid } from '../utils/uuid.js'

export type Vector3 = readonly [x: number, y: number, z: number]

export enum Replication {
  ExceptSelf = 'except_self',
  IncludingSelf = 'including_self',
  OnlySelf = 'only_self',
}

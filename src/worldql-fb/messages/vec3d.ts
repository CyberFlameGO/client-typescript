// automatically generated by the FlatBuffers compiler, do not modify

import * as flatbuffers from 'flatbuffers';



export class Vec3d {
  bb: flatbuffers.ByteBuffer|null = null;
  bb_pos = 0;
__init(i:number, bb:flatbuffers.ByteBuffer):Vec3d {
  this.bb_pos = i;
  this.bb = bb;
  return this;
}

x():number {
  return this.bb!.readFloat64(this.bb_pos);
}

y():number {
  return this.bb!.readFloat64(this.bb_pos + 8);
}

z():number {
  return this.bb!.readFloat64(this.bb_pos + 16);
}

static sizeOf():number {
  return 24;
}

static createVec3d(builder:flatbuffers.Builder, x: number, y: number, z: number):flatbuffers.Offset {
  builder.prep(8, 24);
  builder.writeFloat64(z);
  builder.writeFloat64(y);
  builder.writeFloat64(x);
  return builder.offset();
}


unpack(): Vec3dT {
  return new Vec3dT(
    this.x(),
    this.y(),
    this.z()
  );
}


unpackTo(_o: Vec3dT): void {
  _o.x = this.x();
  _o.y = this.y();
  _o.z = this.z();
}
}

export class Vec3dT {
constructor(
  public x: number = 0.0,
  public y: number = 0.0,
  public z: number = 0.0
){}


pack(builder:flatbuffers.Builder): flatbuffers.Offset {
  return Vec3d.createVec3d(builder,
    this.x,
    this.y,
    this.z
  );
}
}
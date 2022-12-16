import { Model, Schema, model } from 'mongoose';
// Documentation https://mongoosejs.com/docs/typescript/statics.html

declare global {

  interface IUser {
    username: string,
    email: string,
    password: string,
    id: string,
  }

  interface UserModel extends Model<IUser> {
    authenticate(username:string, password:string):IUser;
  }
}
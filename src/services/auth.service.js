import createHttpError from "http-errors";
import validator from "validator";
import bcrypt from 'bcryptjs';
import { UserModel } from "../models/index.js";

//env variables
const { DEFAULT_PICTURE, DEFAULT_STATUS } = process.env;

export const createUser = async (userData) => {
  const { name, email, picture, status, password } = userData;

  // check if field are empty
  if (!name || !email || !password) {
    throw createHttpError.BadRequest("Làm ơn điền đầy đủ thông tin.");
  }

  // check name length
  if (
    !validator.isLength(name, {
      min: 2,
      max: 25,
    })
  ) {
    throw createHttpError.BadRequest(
      "Tên của bạn phải nằm trong khoảng từ 2 đến 25 kí tự."
    );
  }

  //Check status length
  if (status && status.length > 64) {
    throw createHttpError.BadRequest(
      "Hãy chắc rằng trạng thái của bạn ít hơn 64 kí tự."
    );
  }

  // check if email address is validator
  if (!validator.isEmail(email)) {
    throw createHttpError.BadRequest("Làm ơn nhập email hợp lệ");
  }

  // check ìf user already exist
  const checkDb = await UserModel.findOne({ email });
  if (checkDb) {
    throw createHttpError.Conflict(
      "Vui lòng nhập email khác , email này đã tồn tại"
    );
  }
  // check password length
  if (
    !validator.isLength(password, {
      min: 6,
      max: 128,
    })
  ) {
    throw createHttpError.BadRequest(
      "Vui lòng đảm bảo rằng mật khẩu của bạn là từ 6 đến 128 kí tự"
    );
  }

  // hash password--> to be done in the user model

  //adding user to database
  const user = await new UserModel({
    name,
    email,
    picture: picture || DEFAULT_PICTURE,
    status: status || DEFAULT_STATUS,
    password,
  }).save();

  return user;
};

export const signUser = async (email, password) => {
  const user = await UserModel.findOne({ email: email.toLowerCase() }).lean();

  // check if user exist
  if (!user) throw createHttpError.NotFound("thông tin xác thực không hợp lệ.");

  // compare passwords
  let passwordMatches = await bcrypt.compare(password, user.password);

  if (!passwordMatches)
    throw createHttpError.NotFound("thông tin xác thực không hợp lệ.");

  return user;
};

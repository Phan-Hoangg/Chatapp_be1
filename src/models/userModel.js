import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Vui lòng cung cấp tên của bạn:"],
    },
    email: {
      type: String,
      required: [true, "Vui lòng cung cấp địa chỉ email của bạn:"],
      unique: [true, "Địa chỉ email này đã tồn tại"],
      lowercase: true,
      validate: [validator.isEmail, "Vui lòng cung cấp email hợp lệ"],
    },
    picture: {
      type: String,
      default:
        "https://res.cloudinary.com/dkd5jblv5/image/upload/v1675976806/Default_ProfilePicture_gjngnb.png",
    },
    status: {
      type: String,
      default: "Hey, I am using chatapp",
    },
    password: {
      type: String,
      required: [true, "Vui lòng cung cấp mật khẩu"],
      minLength: [6, "Đảm bảo rằng mật khẩu của bạn dài ít nhất 6 kí tự"],
      maxLength: [128, "Đảm bảo rằng mật khẩu của bạn ít hơn 128 kí tự"],
    },
  },
  {
    collection: "users",
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  try {
    if (this.isNew) {
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(this.password, salt);
      this.password = hashedPassword;
    }
    next();
  } catch (error) {
    next(error);
  }
});
const UserModel =
  mongoose.models.UserModel || mongoose.model("UserModel", userSchema);

export default UserModel;

import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    profile: { type: String, default: '' },
    phone: { type: Number, default: '' },
    friends: [{ type: String, ref: 'User' }]
}, {
    timestamps: true,
    versionKey: false
});

const User = mongoose.model('User', userSchema);


class UserService {
    async createUser(data) {
        const user = new User(data);
        return await user.save();
    }
}

export default new UserService();

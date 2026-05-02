const mongoose = require('mongoose');
const { Schema } = mongoose;

const connectionRequestSchema = new Schema({
    fromUserId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    toUserId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    status: {
        type: String,
        required: true,
        enum: ['interested', 'ignored', 'accepted', 'rejected']
    }
})

connectionRequestSchema.pre("save", function (next) {
    if (this.fromUserId.equals(this.toUserId)) {
        throw new Error('You cannot send request to yourself');
    }
    next();
});

connectionRequestSchema.index(
    {fromUserId: 1, toUserId: 1}
);

module.exports = mongoose.model('userConnectionRequest', connectionRequestSchema);
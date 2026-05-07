const mongoose = require('mongoose');
const { Schema } = mongoose;

const connectionRequestSchema = new Schema({
    fromUserId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User" //referecne to User model
    },
    toUserId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    status: {
        type: String,
        required: true,
        enum: {
            values: ["ignored", "interested", "accepted", "rejected"],
            message: `{VALUE} is incorrect status type`,
        },
    }
},
    { timestamps: true }
);

// connectionRequestSchema.pre("save",  function (next) {
//     if (this.fromUserId.equals(this.toUserId)) {
//         return next(new Error('You cannot send request to yourself'));
//     }
//     next();
// });

// OR
connectionRequestSchema.pre("save",  async function () {
    if (this.fromUserId.equals(this.toUserId)) {
        throw new Error('You cannot send request to yourself');
    }
});

connectionRequestSchema.index(
    { fromUserId: 1, toUserId: 1 }
);

module.exports = mongoose.model('userConnectionRequest', connectionRequestSchema);
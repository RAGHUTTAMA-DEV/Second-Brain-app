const mongoose = require('mongoose');

const schema = mongoose.Schema;

const userschema = new schema({
    username: { type: String,required: true,unique: true,},
    password: { type: String,required: true, },
});

const tagschema = new schema({
    title: { type: String, required: true, unique: true },
});

const contenttypes = ['image', 'video', 'article', 'audio'];

const contentSchema = new schema({
    link: { type: String, required: true },
    type: { type: String, enum: contenttypes, required: true },
    title: { type: String, required: true },
    tags: [{ type: String, ref: 'Tag' }],
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

const sharedContentSchema = new schema({
    contentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Content', required: true },
    sharedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sharedWith: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sharedAt: { type: Date, default: Date.now },
});
// Function to populate relationships
async function getPopulatedContent() {
    return await Content.find().populate({
        path: 'userId',
        select: 'username password',
    });
}

// Pre-save hook
contentSchema.pre('save', async function (next) {
    const user = await User.findById(this.userId);
    if (!user) {
        throw new Error('User not found');
    }
    next();
});

const User = mongoose.model('User', userschema);
const Tag = mongoose.model('Tag', tagschema);
const Content = mongoose.model('Content', contentSchema);
const SharedContent = mongoose.model('Link', linkSchema);

module.exports = { User, Tag, Content,SharedContent , getPopulatedContent };

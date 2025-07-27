const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['chat', 'note'], default: 'chat' }, // 'chat' or 'note'
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const notepadSchema = new mongoose.Schema({
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  messages: [messageSchema],
  sharedPasswordHash: { type: String, required: true } // hashed password for access
}, { timestamps: true });

module.exports = mongoose.model('Notepad', notepadSchema);

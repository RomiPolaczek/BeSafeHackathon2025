import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  chatId: String,
  username: String,
  message: String,
  timestamp: Date,
  priority: String,
  read: Boolean
});

export default mongoose.model('Message', messageSchema);


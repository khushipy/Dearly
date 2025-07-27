const User = require('../models/User');

// Send a friend request
exports.sendFriendRequest = async (req, res) => {
  try {
    const { friendEmail } = req.body;
    const userId = req.user.id;
    const friend = await User.findOne({ email: friendEmail });
    if (!friend) return res.status(404).json({ msg: 'User not found' });
    if (friend.friendRequests.includes(userId) || friend.friends.includes(userId)) {
      return res.status(400).json({ msg: 'Already sent or already friends' });
    }
    friend.friendRequests.push(userId);
    await friend.save();
    res.json({ msg: 'Friend request sent' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// Accept a friend request
exports.acceptFriendRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { requesterId } = req.body;
    const user = await User.findById(userId);
    const requester = await User.findById(requesterId);
    if (!user || !requester) return res.status(404).json({ msg: 'User not found' });
    if (!user.friendRequests.includes(requesterId)) {
      return res.status(400).json({ msg: 'No such friend request' });
    }
    user.friends.push(requesterId);
    requester.friends.push(userId);
    user.friendRequests = user.friendRequests.filter(id => id.toString() !== requesterId);
    await user.save();
    await requester.save();
    res.json({ msg: 'Friend request accepted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// List friends
exports.listFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('friends', 'name email');
    res.json({ friends: user.friends });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
}; 
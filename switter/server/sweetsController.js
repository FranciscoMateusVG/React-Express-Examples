const mongoose = require("mongoose");
const Sweet = mongoose.model("Sweet");
const User = mongoose.model("User");

module.exports.getFeed = async (req, res, next) => {
  const sweets = await Sweet.find()
    .sort({ created: -1 })
    .limit(30)
    .populate("author");
  res.json(sweets);
};

module.exports.getUserSweets = async (req, res, next) => {
  const userSweets = await Sweet.find({ author: req.params.uid }).populate(
    "author"
  );
  res.json(userSweets);
};

module.exports.getSweet = async (req, res, next) => {
  const sweet = await Sweet.findOne({ _id: req.params.sweetId })
    .populate("author")
    .populate("comments.author");
  res.json(sweet);
};

module.exports.add = async (req, res, next) => {
  const newSweet = new Sweet(req.body);
  try {
    const addedSweet = await newSweet.save();
    res.json("Sweet Added");
  } catch (err) {
    return next(err);
  }
};

module.exports.like = async (req, res, next) => {
  const uid = req.me._id;
  const sweetId = req.body.sweetId;
  const user = await User.findOne({
    _id: uid,
    likedSweetIds: sweetId
  });
  if (!user) {
    await User.findByIdAndUpdate(uid, { $push: { likedSweetIds: sweetId } });
    await Sweet.findByIdAndUpdate(sweetId, { $inc: { likes: 1 } });
    res.json("Liked!");
  } else {
    next("You have already liked that sweet!");
  }
};

module.exports.unlike = async (req, res, next) => {
  const uid = req.me._id;
  const sweetId = req.body.sweetId;
  const user = await User.findOne({
    _id: uid,
    likedSweetIds: sweetId
  });
  if (user) {
    await User.findByIdAndUpdate(uid, {
      $pull: { likedSweetIds: sweetId }
    });
    await Sweet.findByIdAndUpdate(sweetId, { $inc: { likes: -1 } });
    res.json("Unliked!");
  } else {
    next("You haven't liked that sweet yet!");
  }
};

module.exports.comment = async (req, res, next) => {
  const { sweetId, comment } = req.body;
  const sweet = await Sweet.findOne({ _id: sweetId });
  sweet.comments.push(comment);
  await sweet.save();
  const updatedSweet = await sweet.populate("comments.author").execPopulate();
  const commentWithIdAndAuthor =
    updatedSweet.comments[updatedSweet.comments.length - 1];
  res.json(commentWithIdAndAuthor);
};

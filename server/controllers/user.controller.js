import User from '../models/user.model';

const create = (req, res) => {
  const user = new User(req.body);
  user.save((err, result) => {
    if(err) {
      return res.status(400).json({
        error: 'There was an error saving the object to DB'
      })
    }
    res.status(200).json({
      message: "Successfully signed up!"
    })
  })
}

const list = (req, res) => {
  User.find((err, users) => {
    if(err) {
      return res.status(400).json({
        error: 'Couldnt fetch objects from DB' 
      })
    }
    res.status(200).json(users)
  }).select('name email updated created')
}

const userById = (req, res, next, id) => {
  User.findById(id).exec((err, user) => {
    if(err || !user) {
      return res.status(400).json({
        error: 'User not found'
      })
    }
    req.profile = user;
    next();
  })
}

const read = (req, res) => {
  console.log(req.profile);
  req.profile.hashed_password = undefined;
  req.profile.salt = undefined;
  return res.json(req.profile);
}

const update = (req, res) => {
  let user = req.profile;
  user = Object.assign(user, req.body);
  user.updated = Date.now();
  user.save((err) => {
    if(err) {
      return res.status(400).json({
        error: 'Error while updating object'
      })
    }
    user.hashed_password = undefined;
    user.salt = undefined;
    res.json(user);
  })
}

const remove = (req, res) => {
  let user = req.profile;
  user.remove((err, deletedUser) => {
    if(err) {
      return res.status(400).json({
        error: "Couldn't delete object from DB"
      })
    }
    deletedUser.hashed_password = undefined;
    deletedUser.salt = undefined;
    res.json(deletedUser);
  })
}

export default { create, userById, read, list, remove, update }
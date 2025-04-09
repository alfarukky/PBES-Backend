// import User from '../model/Schema/user.Schema.js';
// export const locationMiddleware = async (req, res, next) => {
//   const user = await User.findById(req.user.id)
//     .select('commandLocation')
//     .lean();

//   if (!user) return res.status(404).json({ message: 'User not found' });
//   if (!user.commandLocation) {
//     return res.status(400).json({ message: 'Command location not found' });
//   }
//   req.locationContext = {
//     commandLocation: user.commandLocation,
//   };
//   next();
// };

function getCurrentUser(req, res) {
  if (!req.user) {
    return res.status(401).json({
      error: "User is not authenticated.",
    });
  }

  return res.json({
    message: "Authenticated user fetched successfully.",
    user: req.user,
  });
}

function authSuccess(req, res) {
  return res.json({
    message: "Social login successful.",
    provider: req.user.provider,
    user: req.user,
  });
}

function authFailure(req, res) {
  return res.status(401).json({
    error: "Social login failed.",
  });
}

function logout(req, res, next) {
  req.logout((error) => {
    if (error) {
      return next(error);
    }

    req.session.destroy((sessionError) => {
      if (sessionError) {
        return next(sessionError);
      }

      res.clearCookie("connect.sid");
      return res.json({
        message: "Logged out successfully.",
      });
    });
  });
}

module.exports = {
  getCurrentUser,
  authSuccess,
  authFailure,
  logout,
};

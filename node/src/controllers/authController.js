import crypto from 'crypto';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, revokeToken } from '../config/refreshToken.js';
import User from '../models/userModel.js';
import asyncHandler from 'express-async-handler';
import { sendPasswordResetEmail, sendVerificationEmail } from '../services/emailService.js';


const createUser = asyncHandler(async (req, res, next) => {
    const { name, email, password } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const userExists = await User.findOne({ email });
  
    if (userExists) {
      const error = new Error('Cet utilisateur existe déjà.');
      error.statusCode = 400;
      throw error;
    }
  
    // Créer un nouvel utilisateur
    const user = await User.create({ name, email, password });
    
    // Générer et envoyer le jeton de vérification d'email
    try {
      const verificationToken = user.createEmailVerificationToken();
      await user.save({ validateBeforeSave: false });
      sendVerificationEmail(user, verificationToken).catch(console.error);
    } catch (err) {
      console.error('Erreur lors de la génération de l email de vérification:', err);
    }
  
    res.status(201).json({
      success: true,
      _id: user._id,
      name: user.name,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
      message: 'Compte créé avec succès. Un email de vérification vous a été envoyé.',
    });
  });


// Demand de réinitialisation de mot de passe (Forgot Password)
const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    const error = new Error("Veuillez fournir une adresse email.");
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findOne({ email });
  if (!user) {
    // Réponse générique pour éviter le username enumeration
    return res.status(200).json({
      success: true,
      message: "Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.",
    });
  }

  // Obtenir le jeton de réinitialisation
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  try {
    await sendPasswordResetEmail(user, resetToken);
    res.status(200).json({
      success: true,
      message: "Lien de réinitialisation envoyé par email.",
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    const err = new Error("L'email de réinitialisation n'a pas pu être envoyé.");
    err.statusCode = 500;
    throw err;
  }
});


// Réinitialisation du mot de passe avec le token (Reset Password)
const resetPassword = asyncHandler(async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password || password.length < 6) {
    const error = new Error("Le mot de passe doit contenir au moins 6 caractères.");
    error.statusCode = 400;
    throw error;
  }

  // Hacher le token fourni pour le comparer à celui stocké
  const passwordResetToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    const error = new Error("Le jeton de réinitialisation est invalide ou a expiré.");
    error.statusCode = 400;
    throw error;
  }

  // Mettre à jour le mot de passe
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.passwordChangedAt = Date.now();

  await user.save(); // Le hook pre-save bcrypt va hacher le mot de passe

  res.status(200).json({
    success: true,
    message: "Mot de passe réinitialisé avec succès. Vous pouvez maintenant vous connecter.",
  });
});


// Validation de l'email via le token
const verifyEmail = asyncHandler(async (req, res, next) => {
  const { token } = req.params;

  const emailVerificationToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const user = await User.findOne({
    emailVerificationToken,
    emailVerificationExpires: { $gt: Date.now() },
  });

  if (!user) {
    const error = new Error("Le jeton de vérification est invalide ou a expiré.");
    error.statusCode = 400;
    throw error;
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;

  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: "Votre adresse email a été vérifiée avec succès.",
  });
});


// Renvoyer l'email de vérification
const resendVerificationEmail = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    const error = new Error("Utilisateur non trouvé.");
    error.statusCode = 404;
    throw error;
  }

  if (user.isEmailVerified) {
    return res.status(400).json({
      success: false,
      message: "Votre adresse email est déjà vérifiée.",
    });
  }

  const verificationToken = user.createEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  await sendVerificationEmail(user, verificationToken);

  res.status(200).json({
    success: true,
    message: "Un nouvel email de vérification a été envoyé.",
  });
});


//fontion de connexion d'un user with manual validation
const loginUser = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;
  
    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email }).select('+password');

  
    if (!user) {
      const error = new Error("Email ou mot de passe incorrect");
      error.statusCode = 401;
      throw error;
    }
  
    // Vérifier si le mot de passe est correct
    const isMatch = await user.isPasswordMatched(password);
    if (!isMatch) {
      const error = new Error("Email ou mot de passe incorrect");
      error.statusCode = 401;
      throw error;
    }
  
    // Générer un refresh token avec le rôle
    const refreshToken = generateRefreshToken(user._id, user.role);
  
    // Mettre à jour l'utilisateur avec le nouveau refresh token
    await User.findByIdAndUpdate(
      user._id,
      { refreshToken },
      { new: true }
    );
  
    // Envoyer le refresh token via un cookie sécurisé
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Utiliser le cookie sécurisé en production
      sameSite: 'strict',  // Empêche les attaques CSRF
      maxAge: 72 * 60 * 60 * 1000, // 3 jours
    });
  
    // Générer et renvoyer un JWT access token pour authentifier l'utilisateur sur les autres API
    const accessToken = generateAccessToken(user._id, user.role);
  
    // Renvoyer les informations de l'utilisateur et l'access token
    res.status(200).json({
      success: true,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      accessToken, // JWT access token pour authentification
    });
  });



//owner login function
const loginOwner = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;
  
    // Vérifier si le propriétaire existe
    const owner = await User.findOne({ email, role: 'owner' }).select('+password');

    if (!owner) {
      const error = new Error("Email ou mot de passe incorrect");
      error.statusCode = 401;
      throw error;
    }

    // Vérifier si le mot de passe est correct
    const isMatch = await owner.isPasswordMatched(password);
    if (!isMatch) {
      const error = new Error("Email ou mot de passe incorrect");
      error.statusCode = 401;
      throw error;
    }

    // Générer un refresh token avec le rôle
    const refreshToken = generateRefreshToken(owner._id, owner.role);

    // Mettre à jour le propriétaire avec le nouveau refresh token
    await User.findByIdAndUpdate(
      owner._id,
      { refreshToken },
      { new: true }
    );

    // Envoyer le refresh token via un cookie sécurisé
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Utiliser le cookie sécurisé en production
      sameSite: 'strict',  // Empêche les attaques CSRF
      maxAge: 72 * 60 * 60 * 1000, // 3 jours
    });

    // Générer et renvoyer un JWT access token pour authentifier le propriétaire sur les autres API
    const accessToken = generateAccessToken(owner._id, owner.role);

    // Renvoyer les informations du propriétaire et l'access token
    res.status(200).json({
      success: true,
      _id: owner._id,
      name: owner.name,
      email: owner.email,
      role: owner.role,
      isEmailVerified: owner.isEmailVerified,
      accessToken, // JWT access token pour authentification
    });
  });


//fonction pour modifier un user
const updateUser = asyncHandler(async(req, res, next)=>{
    const updateData = req.body;
    const {id} = req.params;

    const user = await User.findById(id);
    if(!user){
      const error = new Error("Utilisateur non trouvé");
      error.statusCode = 404;
      throw error;
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true });
    res.status(200).json({
      success: true,
      data: updatedUser
    });
  });

//fonction pour supprimer un user

const deleteUser = asyncHandler(async(req, res, next)=>{
    const {id} = req.params;

    const user = await User.findById(id);
    if(!user){
      const error = new Error("Utilisateur non trouvé");
      error.statusCode = 404;
      throw error;
    }

    await User.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: "Utilisateur supprimé avec succès"
    });
  });

//fonction pour renouveler le access token

const refreshAccessToken = asyncHandler(async (req, res, next) => {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      const error = new Error("Refresh token not found");
      error.statusCode = 401;
      throw error;
    }

    // Verify the refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Find the user
    const user = await User.findById(decoded.id);
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    // Verify that the refresh token matches the one in the database
    if (user.refreshToken !== refreshToken) {
      const error = new Error("Invalid refresh token");
      error.statusCode = 401;
      throw error;
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(user._id, user.role);

    // Optional: Generate new refresh token for token rotation
    const newRefreshToken = generateRefreshToken(user._id, user.role);
    await User.findByIdAndUpdate(user._id, { refreshToken: newRefreshToken }, { new: true });

    // Update refresh token cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    res.status(200).json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
    });
  });

//fonction pour déconnecter un user

const logoutUser = asyncHandler(async (req, res, next) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      const error = new Error("Aucun refresh token trouvé.");
      error.statusCode = 401;
      throw error;
    }

    // Supprimer le refresh token de la base de données
    await User.updateOne({ refreshToken }, { refreshToken: null });

    // Supprimer le cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 72 * 60 * 60 * 1000,
    });

    res.status(200).json({ 
      success: true,
      message: "Déconnexion réussie." 
    });
  });

export {
    createUser, 
    loginUser,
    loginOwner,
    refreshAccessToken,
    updateUser,
    deleteUser,
    logoutUser,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerificationEmail,
}
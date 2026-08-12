import { generateAccessToken, generateRefreshToken, verifyRefreshToken, revokeToken } from '../config/refreshToken.js';
import User from '../models/userModel.js';
import asyncHandler from 'express-async-handler';


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
  
    res.status(201).json({
      success: true,
      _id: user._id,
      name: user.name,
      email: user.email,
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
    logoutUser
}
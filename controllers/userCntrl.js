import asyncHandler from 'express-async-handler';
import { prisma } from "../config/prismaConfig.js";

// Create user
export const createUser = asyncHandler(async (req, res) => {
  console.log("Creating a user...");
  let { email } = req.body;

  const userExist = await prisma.user.findUnique({
    where: { email: email }
  });

  if (!userExist) {
    const user = await prisma.user.create({
      data: req.body
    });
    res.send({
      message: "User Registered successfully",
      user: user,
    });
  } else {
    res.status(201).send({
      message: "User already exists",
    });
  }
});

// Book a visit to residency
export const bookVisit = asyncHandler(async (req, res) => {
  const { email, date } = req.body;
  const { id } = req.params;

  if (!email) {
    return res.status(400).json({ message: "Email is required to book a visit." });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { bookedVisits: true }
  });

  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  let visits = [];
  if (Array.isArray(user.bookedVisits)) {
    visits = user.bookedVisits;
  } else if (typeof user.bookedVisits === 'object' && user.bookedVisits !== null) {
    visits = Object.values(user.bookedVisits); // fallback
  }

  const alreadyBooked = visits.some((visit) => visit.id === id);
  if (alreadyBooked) {
    return res.status(400).json({ message: "This residency already booked for visit by you" });
  }

  const updatedVisits = [...visits, { id, date }];
  await prisma.user.update({
    where: { email },
    data: { bookedVisits: updatedVisits }
  });

  res.status(200).json({
    message: "Your visit is booked successfully",
    bookedVisits: { id, date }
  });
});

// Get all bookings
export const allBookings = asyncHandler(async (req, res) => {
  const { email } = req.body;

  try {
    const bookings = await prisma.user.findUnique({
      where: { email },
      select: { bookedVisits: true }
    });
    res.status(200).send(bookings);
  } catch (err) {
    throw new Error(err.message);
  }
});

// Cancel a booking
export const cancelBooking = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { email },
    select: { bookedVisits: true }
  });

  let visits = Array.isArray(user.bookedVisits) ? user.bookedVisits : [];

  const index = visits.findIndex((visit) => visit.id === id);
  if (index === -1) {
    return res.status(404).json({ message: "This residency is not booked by you" });
  }

  visits.splice(index, 1);

  await prisma.user.update({
    where: { email },
    data: { bookedVisits: visits }
  });

  res.status(200).json({ message: "Booking cancelled successfully" });
});

// Add to favourites
export const addToFavourites = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const { rid } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // 🔐 Null check before accessing properties
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.favResidenciesID.includes(rid)) {
      const updatedUser = await prisma.user.update({
        where: { email },
        data: {
          favResidenciesID: {
            set: user.favResidenciesID.filter((id) => id !== rid),
          },
        },
      });
      return res.send({
        message: "Removed from favourite list successfully",
        user: updatedUser,
      });
    } else {
      const updatedUser = await prisma.user.update({
        where: { email },
        data: {
          favResidenciesID: {
            push: rid,
          },
        },
      });
      return res.send({
        message: "Added to favourite list successfully",
        user: updatedUser,
      });
    }
  } catch (err) {
    throw new Error(err.message);
  }
});

// Get all favourite residencies
export const getAllFavourites = asyncHandler(async (req, res) => {
  const { email } = req.body;

  try {
    const favourites = await prisma.user.findUnique({
      where: { email },
      select: { favResidenciesID: true }
    });

    res.status(200).send(favourites);
  } catch (err) {
    throw new Error(err.message);
  }
});

// Get current user info (for admin panel access)
export const getCurrentUser = asyncHandler(async (req, res) => {
  // Debug: log the email from the Auth0 token
  console.log("Auth0 email from token:", req.auth?.payload?.email);
  console.log("req.headers.authorization:", req.headers.authorization);

  const email = req.auth?.payload?.email;
  if (!email) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const user = await prisma.user.findUnique({
    where: { email },
    select: { email: true, isAdmin: true }
  });

  // Debug: log the user found in the database
  console.log("DB user found:", user);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.json(user);
});
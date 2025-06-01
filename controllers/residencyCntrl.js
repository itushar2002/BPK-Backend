import asyncHandler from 'express-async-handler';
import { prisma } from '../config/prismaConfig.js';

// User: Create Residency (requires approval)
export const createResidency = asyncHandler(async (req, res) => {
  console.log('🌐 Endpoint hit: /create');

  const {
    title,
    description,
    price,
    address,
    city,
    state,
    country,
    images,
    video,
    facilities,
    userEmail,
    brokerContact,      // ✅ NEW
    propertyType        // ✅ NEW
  } = req.body.data || req.body;

  console.log('📦 Request Data:', req.body.data);

  try {
    const residency = await prisma.residency.create({
      data: {
        title,
        description,
        price,
        address,
        city,
        state,
        country,
        images,
        video,
        facilities,
        brokerContact,     // ✅ NEW
        propertyType,      // ✅ NEW
        owner: {
          connect: {
            email: userEmail
          }
        },
        approved: false
      }
    });

    console.log('✅ Residency created:', residency);
    res.status(201).json({ message: 'Residency created successfully', residency });
  } catch (err) {
    console.error('❌ Error during residency creation:', err);

    if (err.code === 'P2002') {
      res.status(400).json({ message: 'A residency with this address already exists.' });
    } else if (err.code === 'P2025') {
      res.status(404).json({ message: 'User with this email does not exist.' });
    } else {
      res.status(500).json({ message: err.message || 'Something went wrong!' });
    }
  }
});

// Get All Approved Residencies
export const getAllResidencies = asyncHandler(async (req, res) => {
  const residencies = await prisma.residency.findMany({
    where: { approved: true },
    orderBy: { createdAt: "desc" }
  });
  res.send(residencies);
});

// Get residency by id
export const getResidency = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const residency = await prisma.residency.findUnique({ where: { id } });
    res.send(residency);
  } catch (err) {
    throw new Error("err.message");
  }
});

// ADMIN: Add property (auto-approved)
export const adminAddProperty = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    price,
    address,
    city,
    state,
    country,
    images,
    video,
    facilities,
    brokerContact,     // ✅ NEW
    propertyType       // ✅ NEW
  } = req.body;

  const userEmail = req.auth.payload.email;

  try {
    const residency = await prisma.residency.create({
      data: {
        title,
        description,
        price,
        address,
        city,
        state,
        country,
        images,
        video,
        facilities,
        brokerContact,   // ✅ NEW
        propertyType,    // ✅ NEW
        approved: true,
        owner: { connect: { email: userEmail } }
      }
    });

    res.status(201).json({ message: 'Property added and auto-approved by admin', residency });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Error adding property' });
  }
});

// ADMIN: Approve property
export const adminApproveProperty = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const residency = await prisma.residency.update({
      where: { id },
      data: { approved: true }
    });
    res.json({ message: 'Property approved', residency });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Error approving property' });
  }
});

// ADMIN: Delete property
export const adminDeleteProperty = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.residency.delete({ where: { id } });
    res.json({ message: 'Property deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Error deleting property' });
  }
});

// ADMIN: Get all properties (including unapproved)
export const adminGetAllResidencies = asyncHandler(async (req, res) => {
  const residencies = await prisma.residency.findMany({
    orderBy: { createdAt: "desc" }
  });
  res.send(residencies);
});

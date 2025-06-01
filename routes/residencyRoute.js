import express from "express";
import { 
  createResidency, 
  getAllResidencies, 
  getResidency, 
  adminAddProperty,
  adminApproveProperty,
  adminDeleteProperty,
  adminGetAllResidencies
} from "../controllers/residencyCntrl.js";
import jwtCheck from "../config/auth0Config.js";

const router = express.Router();

router.post('/create', jwtCheck, createResidency);
router.get('/allres', getAllResidencies);
router.get('/:id', getResidency);

// Admin routes
router.post('/admin/add', jwtCheck, adminAddProperty);
router.post('/admin/approve/:id', jwtCheck, adminApproveProperty);
router.delete('/admin/delete/:id', jwtCheck, adminDeleteProperty);
router.get('/admin/all', jwtCheck, adminGetAllResidencies);

export {router as residencyRoute};
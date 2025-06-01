import express from 'express';
import { addToFavourites, allBookings, bookVisit, cancelBooking, createUser, getAllFavourites, getCurrentUser  } from '../controllers/userCntrl.js';
import jwtCheck from '../config/auth0Config.js';

const router = express.Router();

router.post('/register', jwtCheck,createUser)
router.post('/bookVisit/:id', jwtCheck,bookVisit)
router.post('/allBookings', allBookings)
router.post('/removeBooking/:id', jwtCheck,cancelBooking)
router.post('/addToFavourites/:rid', jwtCheck,addToFavourites)
 router.post('/allFavourites',  jwtCheck,getAllFavourites) 
 router.get('/me', jwtCheck, getCurrentUser);




export {router as userRoute};


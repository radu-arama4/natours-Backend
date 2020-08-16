const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = express.Router({mergeParams: true});
// mergeParams - get access to the parameters from tourRoutes

router.use(authController.protect);

router
    .route('/')
    .get(reviewController.getAllReviews)
    .post(authController.restrictTo('user'), reviewController.setTourUserIds, reviewController.postNewReview)

router
    .route('/:id')
    .get(reviewController.getReview)
    .patch(authController.restrictTo('admin', 'user'), reviewController.updateReview)
    .delete(authController.restrictTo('admin', 'user'), reviewController.deleteReview)

module.exports = router;
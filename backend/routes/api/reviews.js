const express = require('express');
const router = express.Router();
const { Spot, User, Review, ReviewImage, SpotImage, sequelize } = require('../../db/models');
const { Op } = require('sequelize');
const { handleValidationErrors } = require('../../utils/validation');
const { check } = require('express-validator');
const { requireAuth } = require('../../utils/auth');

const validateReview = [
    check ('review')
        .exists({ checkFalsy: true })
        .withMessage('Review text is required'),
    check ('stars')
        .exists({ checkFalsy: true })
        .isInt({min: 1, max: 5})
        .withMessage('Stars must be an integer from 1 to 5'),
    handleValidationErrors
];

// Get reviews of current user
router.get('/current', requireAuth, async (req, res) => {
    const { user } = req;
    const userId = user.id;
    const reviews = await Review.findAll({
        where: {userId: userId}
    });
    for (let i = 0; i < reviews.length; i++) {
        const review = reviews[i];
        review.dataValues.User = await review.getUser();
        const spot = await review.getSpot();
        const previewImage = await spot.getSpotImages({
            where: {preview: true}
        });
        if (previewImage.length) spot.dataValues.previewImage = previewImage[0].dataValues.url;
        else spot.dataValues.previewImage = "";
        review.dataValues.Spot = spot;
        review.dataValues.ReviewImages = await review.getReviewImages();
    }
    return res.json({Reviews: reviews});
});

// Create an Image for a Review
router.post('/:reviewId/images', requireAuth, async (req, res, next) => {
    const { user } = req;
    const userId = user.id;
    const { url } = req.body;

    const review = await Review.findOne({
        where: {id: +req.params.reviewId}
    });

    if (!review) {
        const err = new Error('Review couldn\'t be found');
        err.status = 404;
        err.message = 'Review couldn\'t be found';
        return next(err);
    };
    const reviewId = review.id;

    if (review.userId !== userId) {
        const err = new Error('Proper authorization required');
        err.status = 403;
        err.message = 'Review must belong to the current user';
        return next(err);
    };

    const numImgs = await ReviewImage.findAll({
        where: {
            reviewId: reviewId
        },
        attributes: [[sequelize.fn('COUNT', sequelize.col('id')), 'countImages']]
    })
    if (numImgs[0].dataValues.countImages >= 10) {
        const err = new Error('Maximum number of images for this resource was reached');
        err.status = 403;
        err.message = 'Maximum number of images for this resource was reached';
        return next(err);
    };

    const image = await ReviewImage.create({reviewId, url});
    const imageId = image.id;
    const returnImg = await ReviewImage.scope('defaultScope').findByPk(imageId);
    return res.json(returnImg);
});

// Edit a Review
router.put('/:reviewId', requireAuth, validateReview, async (req, res, next) => {
    const { user } = req;
    const userId = user.id;
    const reviewId = +req.params.reviewId;
    const editReview = await Review.findOne({
        where: {id: reviewId},
    });
    if (!editReview) {
        const err = new Error('Review couldn\'t be found');
        err.status = 404;
        err.message = 'Review couldn\'t be found';
        return next(err);
    };
    if (editReview.userId !== userId) {
        const err = new Error('Proper authorization required');
        err.status = 403;
        err.message = 'Review must belong to the current user';
        return next(err);
    };
    const { review, stars } = req.body;
    const editedReview = await editReview.update({ review, stars });
    return res.json(editedReview);
});

// Delete a Review
router.delete('/:reviewId', requireAuth, async (req, res, next) => {
    const { user } = req;
    const userId = user.id;

    const review = await Review.findOne({
        where: {id: req.params.reviewId}
    });

    if (!review) {
        const err = new Error('Review couldn\'t be found');
        err.status = 404;
        err.message = 'Review couldn\'t be found';
        return next(err);
    };

    if (review.userId !== userId) {
        const err = new Error('Proper authorization required');
        err.status = 403;
        err.message = 'Review must belong to the current user';
        return next(err);
    };

    await review.destroy();

    return res.json({
        message: "Successfully deleted",
        statusCode: 200
    });
});

module.exports = router;
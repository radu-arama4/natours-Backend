const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({

    review:{
        type: String,
        required: [true, 'The review can not be empty!']
    },
    rating:{
        type: Number,
        min: 1,
        max: 5,
        required: [true, 'Rating is required!']
    },
    tour:[
        {
            type: mongoose.Schema.ObjectId,
            ref: 'Tour',
            required: [true, 'Review must be about a tour']
        }
    ],
    user:[
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, 'Review must belong to a user']
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now(),
    }
},
{
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

reviewSchema.pre(/^find/, function(next) {
    //this - current query
      this.populate({
        path: 'user',
        select: 'name'
      });

      next();
});

const Review = mongoose.model('Review',reviewSchema);

module.exports = Review;
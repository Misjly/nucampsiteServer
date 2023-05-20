const express = require('express');
const cors = require('./cors');
const authenticate = require('../authenticate');
const Favorite = require('../models/favorite');
const Campsite = require('../models/campsite');

const favoritesRouter = express.Router();

favoritesRouter.route('/')
.options(cors.corsWithOptions, (req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
})
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.find({user: req.user._id})
    .populate('user')
    .populate('campsites')
    .then(favorites => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id })
    .then(favorites => {
        if(favorites) {
            req.body.forEach(fav => {
                if(!favorites.campsites.includes(fav._id)) {
                    favorites.campsites.push(fav._id);
                }
            });
            favorites.save()
            .then(favorites => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites);
            })
            .catch(err => next(err));
        } else {
            Favorite.create({user: req.user._id})
            .then(favorites => {
                req.body.forEach(fav => {
                    favorites.campsites.push(fav._id);
                });
                favorites.save()
                .then(favorites => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorites);
                })
                .catch(err => next(err));
            })
            .catch(err => next(err));
        }
    })
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'text/plain');
    res.end('PUT operation is not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOneAndDelete({user: req.user._id})
    .then(favorites => {
        res.statusCode = 200;
        if(favorites) {
            res.setHeader('Content-Type', 'application/json');
            res.json(favorites);
        } else {
            res.setHeader('Content-Type', 'text/plain');
            res.end('You do not have any favorites to delete.');
        }
        
    })
    .catch(err => next(err));
});

favoritesRouter.route('/:campsiteId')
.options(cors.corsWithOptions, (req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
})
.get(cors.cors, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'text/plain');
    res.end(`GET operation is not supported on /favorites/${req.params.campsiteId}`);
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Campsite.findOne({_id: req.params.campsiteId}).
    then(campsite => {
        if(!campsite) {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'text/plain');
            res.end('Campsite not found');
        }
    })
    .catch(err => next(err));
    Favorite.findOne({user: req.user._id})
    .then(favorites => {
        if(favorites) {
            if(!favorites.campsites.includes(req.params.campsiteId)) {
                favorites.campsites.push(req.params.campsiteId);
                favorites.save()
                .then(favorites => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorites);
                })
                .catch(err => next(err));
            } else {
                res.statusCode = 200;
                res.setHeader('Content-type', 'text/plain');
                res.end('That campsite is already in the list of favorites!');
            }
        } else {
            Favorite.create({user: req.user._id})
            .then(favorites => {
                favorites.campsites.push(req.params.campsiteId);
                favorites.save()
                .then(favorites => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorites);
                })
                .catch(err => next(err));
            })
            .catch(err => next(err));
        }
    })
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'text/plain');
    res.end(`PUT operation is not supported on /favorites/${req.params.campsiteId}`);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id})
    .then(favorites => {
        if(favorites) {
            const index = favorites.campsites.indexOf(req.params.campsiteId);
            favorites.campsites.splice(index, 1);
            favorites.save()
            .then(favorites => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites);
            })
            .catch(err => next(err));
        } else {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'text/plain');
            res.end('Favorite not found');
        }
        
    })
    .catch(err => next(err));
});

module.exports = favoritesRouter;
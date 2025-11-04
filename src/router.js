import express from 'express';

const router = express.Router();
export default router;

router.get('/', (req, res) => {

    res.render('index', {

    });

});

router.get('/movieDetails', (req, res) => {

    res.render('movieDetails', {

    });

});

router.get('/personDetails', (req, res) => {

    res.render('personDetails', {

    });

});

router.get('/addNewMovie', (req, res) => {

    res.render('addNewMovie', {

    });

});
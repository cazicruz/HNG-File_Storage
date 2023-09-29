const express = require('express');
const router = express.Router();

const Videos = require('../models/video');

router.post('/saveVideo', async (req, res) => {
    const file = req.file;
    console.log(file);
    try{
        const video = await Videos.create({ 
            name: file.originalname,
            videoUrl:file.path,
            description:` the file is a screen recorded video of type ${file.mimetype}` });
        return res.redirect('/');

    }catch(err){console.log(err)};
    return res.send('welcome pls send us your recorded video')
});

module.exports = router;
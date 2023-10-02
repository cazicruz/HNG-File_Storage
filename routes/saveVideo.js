const express = require('express');
const router = express.Router();

const Videos = require('../models/video');


/**
 * @swagger
 * /saveVideo:
 *   post:
 *     summary: Upload and save a video file.
 *     description: Uploads a video file and saves it to the server, then redirects to the video's details page.
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: videoFile
 *         type: file
 *         description: The video file to upload.
 *     responses:
 *       302:
 *         description: Video uploaded and saved successfully, redirects to the video details page.
 *         headers:
 *           Location:
 *             description: The URL to the video details page.
 *             schema:
 *               type: string
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: An error message indicating a server error.
 */
router.post('/saveVideo', async (req, res) => {
    const file = req.file;
    console.log(file);
    try{
        const video = await Videos.create({ 
            name: file.originalname,
            videoUrl:file.path,
            description:` the file is a screen recorded video of type ${file.mimetype}` });
            console.log(video.id);
        return res.redirect(`/video/$
        
        
        
        {video.id}`);

    }catch(err){console.log(err)};
    return res.sendStatus(500);
});

module.exports = router;
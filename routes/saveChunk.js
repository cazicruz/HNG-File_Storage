const express = require('express');
const router = express.Router();
const Videos = require('../models/video');
const fs = require('fs');
const path = require('path');
const session = require('express-session');
const { v4: uuidv4 } = require('uuid');
const {Buffer} = require('buffer');


/**
 * @swagger
 * /startUpload:
 *   post:
 *     summary: Start a new video upload session.
 *     description: Initiates a new video upload session and returns a unique session ID.
 *     requestBody:
 *       required: false
 *       content: {}
 *     responses:
 *       200:
 *         description: New session started successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sessionID:
 *                   type: string
 *                   description: The unique session ID for the new upload session.
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
router.post('/startUpload', async (req, res) => {
    try{
        //create a unique session id to identify the user with
        const sessionID = uuidv4();
        ///store this session id in the express session object
        session.userSessionID[sessionID]={
            videoWriteStream: fs.createWriteStream(path.join(__dirname, `../public/uploads/${sessionID}.webm`), {flags:'a'}),
            videoFormat: 'webm',
        };
        return res.status(200).json({sessionID:sessionID});
    }catch(err){
        console.log(err);
        // return 500 server error cause something went wrong in the server
        return res.sendStatus(500);
    }
})

/**
 * @swagger
 * /saveChunk/{sessionID}:
 *   post:
 *     summary: Save a video chunk for a session.
 *     description: Saves a binary video chunk to the server.
 *     parameters:
 *       - in: path
 *         name: sessionID
 *         description: The unique session ID.
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 type: string
 *                 description: Base64-encoded binary video data chunk.
 *     responses:
 *       200:
 *         description: Video chunk saved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sessionID:
 *                   type: string
 *                   description: The session ID.
 *                 message:
 *                   type: string
 *                   description: A success message.
 *       404:
 *         description: Session not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message indicating that the session was not found.
 */
router.post('/saveChunk/:sessionID', async (req, res) => {
    const sessionID = req.params.sessionID;
    // check if session id exists in the sessions object
    if(session.userSessionID[sessionID]){
        // write the chunk to the file
        const {videoWriteStream} = session.userSessionID[sessionID];
        const jsondata = req.body.data;
        const binaryData = Buffer.from(jsondata, 'base64');

        // make a readable stream of the binary data and write that to the file
        const readAbleStream = Readable.from(binaryData);
        readAbleStream.on('data', (chunk) => {
            videoWriteStream.write(chunk);
        });

        //after writing send a response to the client telling them you are done with that chunk
        readAbleStream.on('end',()=>{
            console.log("on write success")
            return res.status(200).json({sessionID,
                message:"chunk saved"});
        })
        // return res.sendStatus(200);
    }else{
        return res.status(404).json({message:"session not found, please start a new recording"});
    }
})

/**
 * @swagger
 * /endUpload/{sessionID}:
 *   post:
 *     summary: End the video upload session
 *     description: End the video upload session for a specific session ID.
 *     parameters:
 *       - in: path
 *         name: sessionID
 *         required: true
 *         description: The unique session ID.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The video upload session ended successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sessionID:
 *                   type: string
 *                   description: The session ID that ended.
 *                 message:
 *                   type: string
 *                   description: A success message.
 *       404:
 *         description: The session ID was not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A message indicating that the session was not found.
 */
router.post('/endUpload/:sessionID', async (req, res) => {
    const {sessionID} = req.params;
    // check if session id exists in the sessions object
    if (session.userSessionID[sessionID]) {
        // write the chunk to the file
        const { videoWriteStream } = session.userSessionID[sessionID];
        videoWriteStream.end();
        // delete the session from the sessions object
        delete session.userSessionID[sessionID];
        session.userSessionID= null;
        // return success
        return res.status(200).json({sessionID,
            message:"upload ended"});
    }
    else{
        return res.status(404).json({message:"session not found"});
    }
})

module.exports = router;
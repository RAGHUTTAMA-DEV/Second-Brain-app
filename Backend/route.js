const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { User, Tag, Content, SharedContent } = require('./db/db');
const bcrypt = require('bcrypt'); 

const secret="samera"

router.post('/sign-up', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) {
            // Hash the password before saving
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser=await User.create({ username, password: hashedPassword });
            console.log(newUser);
            res.status(200).json({ message: 'User created successfully' });
        } else {
            res.status(403).json({ message: 'User already exists' });
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.post('/sign-in', async (req, res) => {
    const { username, password } = req.body;
    try {
        // Find the user by username
        const user = await User.findOne({ username });
        if (user) {
            // Compare the provided password with the hashed password
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (isPasswordValid) {
                // Generate a JWT token for the user
                const token = jwt.sign({ userId: user._id }, secret);
                res.status(200).json({
                    message: 'User logged in successfully',
                    token,
                });
            } else {
                res.status(403).json({ message: 'Invalid username or password' });
            }
        } else {
            res.status(403).json({ message: 'Invalid username or password' });
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.post('/content', async (req, res) => {
    const { type, link, title, tags } = req.body;
    const token = req.headers.authorization;
    try {
        const decoded = jwt.verify(token, secret);
        const user = await User.findById(decoded.userId);

        if (user) {
            await Content.create({ type, link, title, tags, userId: user._id });
            res.status(200).json({ message: 'Content created successfully' });
        } else {
            res.status(403).json({ message: 'User does not exist' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/content',async (req,res)=>{
   const token=req.headers.authorization;
   const userId=jwt.verify(token,secret);
   const content=await Content.findById(userId.userId); 

   if(content){
    res.status(200).json(content);
   }else{
    res.status(403).json
   }

})
//This thing can be done in middleware
router.delete('/content', async (req,res)=>{
    const token=req.headers.authorization;
    const userId=jwt.verify(token,secret);
    const content=await Content.findById(userId.userId);

    if(content){
        await Content.deleteOne({userId:userId.userId});
        res.status(200).json({message:"Content deleted successfully"});
    }else{
        res.status(403).json({message:"User does not exist"});
    }
})


router.post('/share',async (req,res)=>{
   const token=req.headers.authorization;
   const {contentId,targeruserId}=req.body;
   try{
     const decoded=jwt.verify(token,secret);
     const userId=decoded.userId;
     const content=await Content.findById({_id:contentId,userId:userId});
     if(!content){
        res.status(403).json({message:"User does not have this content"});
     }
     const targetUser=await User.findById(targetuserId);

     if(!targetUser){
        res.status(403).json({message:"Target user does not exist"});
     }

     const sharedContent=await SharedContent({
        contentId,sharedBy:userId,sharedTo:targetuserId
     })
     await sharedContent.save();

     res.status(200).json({message:"Content shared successfully"});
   }catch(err){
      console.error("Error sharing content:", err);
      res.status(500).json({ error: err.message });
   }
})


router.get('/shared-content',async (req,res)=>{
   const token=req.headers.authorization;
   try{
      const decoded=jwt.verify(token,secret);
      const userId=decoded.userId;
      const sharedContent=await SharedContent.find({sharedWith:userId})
      .populate('contentId','title link tags type').populate('sharedBy','username');
      res.status(200).json(sharedContent);
   }catch(err){
    console.error("Error fetching shared content:", err);
    res.status(500).json({ error: err.message });
   }
})


module.exports = router;

const express = require("express");

const cors =require("cors");
 
 const connectDB = require("./database");
 
 const User = require("./models/User");
 const sendMail= require('./config/nodemailerConfig')
 const bcrypt= require("bcrypt");
 const logger= require("./middleware/logger")
 const jwt=require("jsonwebtoken") 
 const errorHandler=require("./middleware/errorHandler");
 const Course=require("./models/course")
 const authtoken=require("./middleware/authtoken")
 const {authMiddleware,authorizeRole}= require("./middleware/authorization");
 const upload=require("./config/multer");
 require('dotenv').config();
 
 const app =express();
 
 connectDB();
 app.use(cors({
    origin:"http/localhost:3000",
    credentials:true
 }))
 // bcrypt library -> npm install bcrypt 
 app.use(express.json())
 app.use(errorHandler);
 // ye line hmme database me json formate to data parse(bhejne) karne me help kregi 
 // database me phla user insert krna
 
 // for hasing any password we will user bcrypt.hash method .
 // for matching a normal password with hashed password we will use bcrypt.compare method .
 // bcrypt.hash method 
 // we will need only two parameters if we have to hash any password.
 // 1. Password 2. saltRounds=A certified number at which a particular algorithm will be hitted. -> genSalt(10) 
 
//  app.post("/register-user",logger,async (req,res)=>{
//      try{
//     //    const{name,email,password,contact}=req.body;
//        const{name,email,password,contact,role}=req.body;
//        // for saving this data
//        const saltRounds=await bcrypt.genSalt(10);
//        const hashedPassword= await bcrypt.hash(password,saltRounds);
//        console.log(hashedPassword);
//      //   const result=await bcrypt.compare(password,hashedPassword);
//      //   console.log("Value of matched password is ",result)
//        const otp= Math.floor(1000000+Math.random()*9000000).toString();
//     //    const newUser= new User({name,email,password:hashedPassword,contact,otp});
//        const newUser= new User({name,email,password:hashedPassword,contact,otp,role});
//        await newUser.save();
//        const subject='Welcome to our Platform 🔥 Your Otp For Verification'
//        const text= `Hi ${name} , Thank You for registering at our platform . Your Otp is ${otp}, Please don't share it to anybody else.`
 
//        const html= `
//         <h2>Thank You for Registering at our Platform</h2>
//         <p style={{color:"red"}}>Your Otp is this : ${otp} </p>
//         <p style={{color:"green"}}>Please Use this Otp for verification of your account </p>
//        `
//        sendMail(email,subject,text,html);
//        console.log("Data inserted successfully and mail send properly")
//        return res.status(200).json({message:"Data is inserted successfully"});
//      }catch(error){
//          console.log(error)
//          return res.status(500).json({message:"Internal Server Error"})
//      }
//  })



app.post("/register-user", async (req, res, _next) => {
    try {
        const { name, email, password, contact, role } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "User already exists" });
        }

        // OTP and password hashing
        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
        const saltRounds = 10;
        const hashPassword = await bcrypt.hash(password, saltRounds);

        const newUser = new User({ name, email, password:hashPassword, contact, otp, role });
        await newUser.save();

        // Optional: Sending OTP email (uncomment below if sendMail is configured)
                                                    
        const subject = 'Welcome to our Platform - OTP Verification';
        const text = `Hi ${name}, your OTP is ${otp}. Please do not share it.`;
        const html = `<h2>Welcome!</h2><p>Your OTP is <strong>${otp}</strong>. Please do not share it with anyone.</p>`;
        await sendMail(email, subject, text, html);
        

        return res.status(200).json({ message: "User registered successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
 
 // database se data extract krne ke liye hmm log get method ka use krenge 
 
 app.get("/all",logger,authtoken,async (_req, _res)=>{
 app.get("/all",logger,authMiddleware,authorizeRole('Trainer'),async (_req,res)=>{
     try{
          // Jab database se sare users ko find krna ho to kaun sa method use krenge - 
          // {id:1,name:Ram,class:3,address:"Hisar"},{id:2,name:Mohan,class:3,address:"Rohtak"}
          // find()
          const users=await User.find();
          return res.json(users);
 
     }catch(error){
         console.log(error);
         return res.status(500).json({message:"An error occurred"});
     }
 }) })

 //npm install cors
 // Router for adding course 
 app.post ("/add-course",authMiddleware,authorizeRole('Counsellor'),upload.single("banner"),async(req,res)=>{
     try{
         const {title,duration,description,category,discountPercentage,offerTillDate,startDate,endDate,createdBy}=req.body;
         const banner= req.file.path;
         const newCourse=new Course({
             title,
             duration,
             description,
             category,
             discountPercentage,
             offerTillDate,
             startDate,
             endDate,
             banner,
             createdBy
         });
         await newCourse.save();
         return res.status(201).json({message:"Course is successfully added",newCourse});
     }catch(error){
         return res.status(500).json({message:"An error occured"})
     }
 })

 //==================route for edit the course===================
//  app.patch("/edit-courses"(req.res)=>{
//     try{
          
//     }catch(error){
//         return res.status(500).json({message:an error occured})
//     }
//  })
 
 // Routes for fetching all course 
 
app.get("/allcourses",async(_req,res)=>{
     try{
         
        //  const{search,duration,category}=req.query;
        //  const {banner} = req.body
        //  let filters={}
        //  if(search){
        //      filters.title={$regex:search,$options:"i"}
        //  }
        //  if(duration){
        //      filters.duration=duration;
        //  }
        //  if(category){
        //      filters.category=category;
        //  }
         
         const courses= await Course.find();
        //  console.log(Course.banner);
        return res.status(200).json({message:"All courses found successfully",courses})
     }catch(error){
         return res.status(500).json({message:"An error occured during fetching course"})
     }
 })
 //put users
 app.put("/users/:id",logger,async(_req,res)=>{
     try{
           // findByIdAndUpdate -> Sabse phle id ke basis pr find karna uske bad update krna 

         
 
         // Generate JWT Token
        //  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
         const token = jwt.sign({ email}, process.env.JWT_SECRET, { expiresIn: '1h' });
 
         return res.status(200).json({ message: "Login successful", token });
     } catch(error) {
         next(error);
     }
 });

app.post('/login',async (req,res) => {
    try {
        const {email,password} = req.body
        const user =await User.findOne({email})
         if(!user){
     return res.status(404).json({message:'User not found'});
         }
    //  const matchPassword = 
         if(await bcrypt.compare(password,user.password)){
             return res.status(404).json({message:'Password not Match'});
         }
         const token = jwt.sign({email},process.env.JWT_SECRET,{expiresIn:'2h'})
         return res.status(200).json({message:'Succesful',token});
    } catch (error) {
        console.error(error);
        return res.status(500).json({message:'error'});     
    }
  
})


 app.post("/verify",logger,async(req,res)=>{
     try{
         const {email,otp} = req.body;
         const findEmail= await User.findOne({email})
         console.log(findEmail.otp)
         if(findEmail.otp!==otp){
         return res.status(404).json({message:"otp is not verified"})
         }
         findEmail.otp=null;
         await findEmail.save();
         console.log('testing...');
 
         return res.status(202).json({message:" your otp is verified"})
     }catch(error){ console.log(error)
         return res.status(500).json({message:"an error occured"})
     }
 })
 app.listen(5001,()=>{
     console.log("Server is running on localhost:5000")
 })
//==========================login================================

//  app.post("/login", logger, async (req, res, next) => {
//     try {
//         const { email, password } = req.body;
//         const user = await User.findOne({ email });

//         if (!user) {
//             return res.status(403).json({ message: "User does not exist" });
//         }

//         const match = await bcrypt.compare(password, user.password);

//         if (!match) {
//             return res.status(401).json({ message: "Incorrect password" });
//         }

//         const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

//         return res.status(200).json({ message: "Login successful", token });
//     } catch (error) {
//         next(error);
//     }
// });
const mongoose =require("mongoose")

require('dotenv').config();

const connectDB = async()=>{

    try{
        await mongoose.connect(process.env.MONGO_URI,{

            useNewUrlParser:true,
            useUnifiedtopology:true

        })

        console.log("database is connected successfully")
    }catch(error){

        console.log(error)
        console.log("all error occured")
    }

}
module.exports=connectDB;

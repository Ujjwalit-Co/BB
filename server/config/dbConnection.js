import mongoose from "mongoose";

mongoose.set('strictQuery', false);

const connectionToDB = async () =>{
    try{
        const {connection } = await mongoose.connect(
            process.env.MONGO_URL || `mongodb://localhost:27017/lms`
        );
    
        if(connection){
            console.log(`Connected to Mongodb: ${connection.host}`);
        }
    }
    catch(e){
        console.log(e);
        process.exit(1);
    }
}

export default connectionToDB;
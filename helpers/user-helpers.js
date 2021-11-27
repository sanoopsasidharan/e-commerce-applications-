var collection = require('../config/collection')
var db =require('../config/connection')
// const bcrypt = require('bcrypt')
const crypto=require("crypto");
var objectId=require('mongodb').ObjectId;
const { resolve } = require('path');
const { rejects } = require('assert');
module.exports={
    doSignup:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            
            console.log(userData.email);
            userData.password = await crypto.createHmac('sha256',userData.password).update('hellos').digest('hex');
            db.get().collection(collection.userCollection).findOne({$or:[{number:userData.number},{email:userData.email}]}).then((findNumber)=>{
                if(findNumber){
                    resolve({status:false})
                }else{
                    db.get().collection(collection.userCollection).insertOne(userData).then(()=>{
                        resolve({status:true})
                    })
                }
            })
           
        })
       
    },
    doLogin:(userData)=>{
        return new Promise (async(resolve,reject)=>{
            let loginStatus = false;
            let response={}
            let user = await db.get().collection(collection.userCollection).findOne({email:userData.email})
  
            if(user){
                userData.password = await crypto.createHmac('sha256',userData.password).update('hellos').digest('hex');

                if(userData.password===user.password){
                       response.user=user;
                        response.status=true;
                        if(response.user.isactive){
                            console.log(response);
                            console.log('response');
                            resolve(response)
                        }else{
                            resolve({isactive:false})
                        }
                        // console.log(response.user.isactive,'isative');


                    // if(user.isactive){

                    //     response.user=user;
                    //     response.status=true;
                    //     resolve(response)
                    // }else{
                        
                    //     resolve({status:false,blocked:true})
                    //     console.log('error');
                    // }

                   
                    
                }else{
                    resolve({status:false})
                    console.log('error');
                }

            }else{
                console.log('login failed 1');
                resolve({status:false})
            }
        })


    },
    usergetAllProducts:()=>{
        return new Promise(async(resolve,reject)=>{
            let products =await db.get().collection('product').find().toArray()
            
            resolve(products)
            
        })
},
   getAllusers:()=>{
    return new Promise(async(resolve,reject)=>{
        let users =await db.get().collection(collection.userCollection).find().toArray()
        
        resolve(users)
        
    })
},
blockuser:((userId)=>{
    return new Promise(async(resolve,reject)=>{

        await db.get().collection(collection.userCollection).updateOne({_id:objectId(userId)},{$set:{isactive:false}}).then((response)=>{
            resolve({status:true,userId});
        })
    })
}),
unblockuser:((userId)=>{
    return new Promise(async(resolve,reject)=>{
       await db.get().collection(collection.userCollection).updateOne({_id:objectId(userId)},{$set:{isactive:true}}).then((response)=>{
            resolve({status:true});
        })
    })
}),
numberOtpValidation:(number)=>{
    return new Promise(async(resolve,reject)=>{
    
      var result=await db.get().collection(collection.userCollection).findOne({number:number})
      if(result){

      resolve(result)

      }else{
          reject(null)
          
      }

    })
},
// add new address
addNewAddress:(address)=>{
    return new Promise(async(resolve,reject)=>{
        var addAddress = await db.get().collection(collection.addressCollection).insertOne(address)
        if(addAddress){
            resolve(addAddress)
        }else{
            resolve(0)
        }
    })
},
// find all address
showAllAddress:()=>{
    return new Promise(async(resolve,reject)=>{
        var address = await db.get().collection(collection.addressCollection).find().toArray()
        if(address){
            resolve(address)
        }else{
            resolve(null)
        }
    })
},
getOneAddress:(addressId)=>{
    return new Promise(async(resolve,reject)=>{
        var addres = await db.get().collection(collection.addressCollection).findOne({_id:objectId(addressId)})
        if(addres){
            resolve(addres);
        }else{
            resolve(null)
        }
    })
}



}

// 5aLxOCAFtiedNDBC
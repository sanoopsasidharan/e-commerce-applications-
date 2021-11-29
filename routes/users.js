var express = require('express');
const { response } = require('../app');
const categoryHelpers = require('../helpers/category-helpers');
const productHelpers = require('../helpers/product-helpers');
var router = express.Router();
const userHelpers = require('../helpers/user-helpers')
const cartHelpers = require('../helpers/cart-helpers')
const orderHelpers = require('../helpers/order-helper')

const dotenv=require("dotenv");
dotenv.config();

var logo = false
var blocked = false
  const serviceID=process.env.serviceID
   const accountSID =process.env.accountSID
   const authToken =process.env.authToken
const client = require('twilio')(accountSID,authToken)

const verifyLogin=(req,res,next)=>{
  if(req.session.loggedIn){
    next()
  }else{
    res.redirect('/login')
  }
}


/* GET users listing. */
router.get('/',async (req, res,)=> {
  let user
  let cartCount
  if(req.session.loggedIn){
    user = req.session.user
  }else{
    user =false
  }
  // let user = req.session.user
 
  if(req.session.loggedIn){
    cartCount=await cartHelpers.getCartCount(req.session.user._id)
  }else{
    cartCount=false
  } 

  var allProducts = await productHelpers.getAllProducts()
 
  await categoryHelpers.showAllCategorysubcate().then((result)=>{

   console.log(result);
    res.render('user/userHome',{admin:0,user,allProducts,result,cartCount});
  })
});

router.post('/',async(req,res)=>{
  var cateProduct = await productHelpers.productDividedCategory(req.body.category)
  res.json(cateProduct)
})







// log in user 
router.get ('/login',(req,res)=>{
  let user = req.session.user
  if(req.session.loggedIn){
    res.redirect('/')
  }else{
    res.render('user/login',{admin:2,user,logo,blocked})
    logo=false
    blocked=false
  }
})


router.post('/login',(req,res)=>{
  userHelpers.doLogin(req.body).then((response)=>{
    console.log(response,'hari');
    console.log(response.status);
    if(response.status){
      req.session.loggedIn=true;
      req.session.user= response.user
      console.log(req.session.user);
    }
    res.json(response)

    // if(response.status){
    //   if(response.user.isactive){
    //     req.session.loggedIn=true;
    //   req.session.user = response.user
    //   res.redirect('/')
    //   }else{
    //     blocked = true
    //     res.redirect('/login')
    //   }
    // }else{
    //   console.log('istsdd');
    //   logo=true;
    //   res.redirect('/login')
    // }
  })
})

// singup form
router.get('/signup',(req,res)=>{
  if( req.session.loggedIn){
    res.redirect('/')
  }else{
    let user = req.session.user
  res.render('user/signUp',{admin:2,user})
  }
  
})

router.post('/signup',(req,res)=>{
  req.body.isactive=true;
  userHelpers.doSignup(req.body).then((response)=>{
    // convered Inserted id into _id
    let Id = ""+response.insertedId
    res.json(response)
    // res.redirect('/login')
  })
})


// product list
router.get('/product',async(req,res)=>{
  let user
  let cartCount
  if(req.session.loggedIn){
    user = req.session.user
  }else{
    user =false
  }
  if(req.session.loggedIn){
    cartCount=await cartHelpers.getCartCount(req.session.user._id)
  }else{
    cartCount=false
  }
  // let user = req.session.user
  var result
  await categoryHelpers.showAllCategorysubcate().then((results)=>{
    result = results
    console.log(result);
  })
//  let cartCount=await cartHelpers.getCartCount(req.session.user._id)
 await userHelpers.usergetAllProducts().then((product)=>{
    res.render('user/product',{admin:0,user,result,product,cartCount})
  })
})

// search products
router.post('/productSearch',(req,res)=>{
  console.log(req.body.searchValue);
  productHelpers.searchProduct(req.body.searchValue).then((products)=>{
    res.json(products)
  })
})


// show product divied by category

router.get('/cateproduct/',async(req,res)=>{
  let user
  let cartCount
  if(req.session.loggedIn){
    user = req.session.user
  }else{
    user =false
  }
 
  if(req.session.loggedIn){
    cartCount=await cartHelpers.getCartCount(req.session.user._id)
  }else{
    cartCount=false
  } 

  var result;
 await categoryHelpers.showAllCategorysubcate().then((results)=>{
    result = results
  })

  let idOfCat=req.query.id
 await productHelpers.productDividedCategory(idOfCat).then((product)=>{
    console.log(product);
    console.log(result);
    res.render('user/product-by-category',{admin:0,user,result,product,cartCount})
  })

})
// show the subcategory products

router.get('/subcategory-products/',async(req,res)=>{
  let reqId = req.query.id
  let reqcategory =req.query.category
  console.log(reqId);
  console.log(reqcategory);
  let user
  let cartCount
  if(req.session.loggedIn){
    user = req.session.user
  }else{
    user =false
  }
  if(req.session.loggedIn){
    cartCount=await cartHelpers.getCartCount(req.session.user._id)
  }else{
    cartCount=false
  } 
  var result;
 await categoryHelpers.showAllCategorysubcate().then((results)=>{
    result = results
  })
  let subProducts = await productHelpers.getSubProducts(reqcategory,reqId)

  res.render('user/product-by-subcategory',{admin:0,user,result,cartCount,subProducts})
})



// product detailts


// router.get('/productdetails/',async(req,res)=>{
//   let user = req.session.user
//   var proId = req.query.id
//   console.log(req.params.id);
//   console.log('is it the product page');
//   var product =await productHelpers.productDetails(proId)
//   console.log(product);
//   res.render('user/productdetails',{admin:0})
  
 
// })

router.get('/productdetails/',async (req,res)=>{
  let user
  let cartCount
  if(req.session.loggedIn){
    user = req.session.user
  }else{
    user =false
  }
  if(req.session.loggedIn){
    cartCount=await cartHelpers.getCartCount(req.session.user._id)
  }else{
    cartCount=false
  }
  // let user = req.session.user
  var proId = req.query.id
  // let cartCount=await cartHelpers.getCartCount(req.session.user._id)
  var result;
  await categoryHelpers.showAllCategorysubcate().then((results)=>{
     result = results
   })
  productHelpers.productDetails(proId).then((product)=>{
    
    res.render('user/productdetails',{admin:0,result,product,user,cartCount})
  }).catch((erorr)=>{
 console.log(erorr);
  })
})




// otp validation 

router.get('/otp',(req,res)=>{
  if(req.session.loggedIn){
    res.redirect('/')
  }else{
    res.render('user/otplogin',{admin:2})
  }
})

router.post('/otp',(req,res)=>{
  
  var Number = req.body.number;
console.log('ajx');
console.log(Number);
userHelpers.numberOtpValidation(Number).then((result)=>{
 
  console.log(result);

 if(result.isactive){
  if(result.number){

    client.verify.services(serviceID )
               .verifications
               .create({to: `+91${result.number}`, channel: 'sms'})
               .then(verification => console.log(verification.status));
  
               res.render('user/sucessotp',{admin:2,result})
    }else{
      res.send('not number')
    }
 }else{
  blocked = true
  res.redirect('/login')
 }

}).catch((e)=>{
  res.send('sorry')
})


})


router.post('/sucessotp',(req,res)=>{
  // console.log(req.body+'its req.body');
  
  var code = req.body.code
  var Number = req.body.number
  console.log(req.body.code+'code of post');
  console.log(req.body.number+'number of post');

  client.verify.services(serviceID  )
      .verificationChecks
      .create({to: `+91${Number}`, code:code})
      .then(verification_check => {
        console.log(verification_check.status)
        if(verification_check.valid){

          req.session.loggedIn=true;
        
          
          userHelpers.numberOtpValidation(Number).then((response)=>{
            console.log(response);
            req.session.user=response
              res.redirect('/')
          })



        }else{
          res.redirect('/otp')
          // res.send('sorry ur not find')
        }
      });
    
})

// cart management

router.get('/addtocart/',verifyLogin,async(req,res)=>{
  console.log('hwllooo');
  console.log(req.query.cart);
  console.log(req.session.user._id);
  let user = req.session.user
  console.log(user);
  var result;
  
  await categoryHelpers.showAllCategorysubcate().then((results)=>{
     result = results
   })
   let idOfCat=req.query.id
  await productHelpers.addProductShowCategory(idOfCat).then((product)=>{
     console.log(product);
     console.log(result);
    //  res.render('user/product-by-category',{admin:3,result,product})
   })
  cartHelpers.addToCart(req.query.cart,req.session.user._id)

  res.render('user/cart',{admin:0,user,result})
})


// main cart

router.get('/cartmanagement',verifyLogin,async(req,res)=>{
  let user = req.session.user
  console.log(req.session.user);
  var result;
   categoryHelpers.showAllCategorysubcate().then((results)=>{
     result = results
   })
   let products=await cartHelpers.showCart(req.session.user._id)
   let cartCount=await cartHelpers.getCartCount(req.session.user._id)
   let total=await cartHelpers.getTotalAmount(req.session.user._id)
   console.log(products);
 
   res.render('user/cart',{admin:0,user,result,products,cartCount,total})
})

// delete cart singel product
router.post('/deletecartProduct',(req,res)=>{
  cartHelpers.deleteProductInCart(req.body.cartId,req.body.proId).then((response)=>{
    res.json(response)
  })
})



router.get('/addTocarts/:id',verifyLogin,async(req,res)=>{
  console.log('api calls on comming');

  console.log(req.session.user._id);
  console.log(req.params.id);
  cartHelpers.addToCart(req.params.id,req.session.user._id).then((response)=>{
  })
   let cartCount=await cartHelpers.getCartCount(req.session.user._id)
   console.log(cartCount);
 res.json({status:true,cartCount})
})

// change product condity in cart page in ajax
router.post('/change-product-cound',(req,res)=>{
  console.log(req.body.user);
  cartHelpers.changeProductCound(req.body).then(async(response)=>{
    response.total=await cartHelpers.getTotalAmount(req.session.user._id)
    response.subtotal=await cartHelpers.getSubTotal(req.body)
    console.log(response);
    res.json(response)
  })

})

// checkout

router.get('/checkout',verifyLogin,async(req,res)=>{
  let user = req.session.user

  var result;
   categoryHelpers.showAllCategorysubcate().then((results)=>{
     result = results
   })
   let cartCount=await cartHelpers.getCartCount(req.session.user._id)

   let total = await cartHelpers.getTotalAmount(req.session.user._id)
  //  console.log(total);
   let addresss=await userHelpers.showAllAddress(req.session.user._id)

   res.render('user/checkout',{admin:0,user,result,cartCount,addresss,total})

})


// ajax place order

// router.post('/place-order',async(req,res)=>{
//   console.log(req.body);
//   let products= await cartHelpers.getCartProductList(req.body.userId)
//   let totalPrice= await cartHelpers.getTotalAmount(req.body.userId)
//   cartHelpers.placeOrder(req.body,products,totalPrice).then((response)=>{
//     res.json({status:true})

//   })
// })


router.post('/addAddressCheckout',verifyLogin,(req,res)=>{
  console.log(req.body);
   userHelpers.addNewAddress(req.body,req.session.user._id).then((response)=>{
         res.json({status:true})
   })
  // let products= await cartHelpers.getCartProductList(req.body.userId)
  // let totalPrice= await cartHelpers.getTotalAmount(req.body.userId)
  // cartHelpers.placeOrder(req.body,products,totalPrice).then((response)=>{
  //   res.json({status:true})

  // })
})

router.post('/placeOrders',async(req,res)=>{
  var obj = req.body
    let products= await cartHelpers.getCartProductList(req.body.userId)
  let totalPrice= await cartHelpers.getTotalAmount(req.body.userId)
  let address = await userHelpers.getOneAddress(req.body.adderssId,req.session.user._id)
   await cartHelpers.placeOrder(req.body,products,totalPrice,address).then((orderId)=>{
     console.log(req.body['paymentmethod']==='COD');
     if(req.body['paymentmethod']==="COD"){
      res.json({CODsuccess:true})
     }else{
       orderHelpers.generateRazorpay(orderId,totalPrice).then((response)=>{
         res.json(response)

       })
     }
    console.log(orderId);
    

  })
})

router.post('/verifyPayment',(req,res)=>{
  console.log(req.body);
  orderHelpers.verifyPayment(req.body).then(()=>{
    orderHelpers.OnlinePaymentChangeStatus(req.body['order[receipt]']).then(()=>{
      console.log('payment success full');
      res.json({status:true})
    })
     
  }).catch((err)=>{
    res.json({status:false,errMess:''})
  })
})


// buy now in user side
router.get('/buyNowCheckOut',verifyLogin,async(req,res)=>{
  let user = req.session.user

  var result;
   categoryHelpers.showAllCategorysubcate().then((results)=>{
     result = results
   })
   let cartCount=await cartHelpers.getCartCount(req.session.user._id)

  let addresss=await userHelpers.showAllAddress(req.session.user._id)
  await productHelpers.findProduct(req.query.id).then((response)=>{
    res.render('user/buyNowCheckout',{admin:0,result,cartCount,user,response,addresss})
  })
})

// buy now checkout page post method
router.post('/buyNowCheckOut',(req,res)=>{

  console.log(req.body);
  console.log('called buy now checkoutssssssssssssssssss');
  
})



// order placed
router.get('/orders-success',verifyLogin,async(req,res)=>{
  let user = req.session.user
  var result;
   categoryHelpers.showAllCategorysubcate().then((results)=>{
     result = results
   })
   let cartCount=await cartHelpers.getCartCount(req.session.user._id)
  res.render('user/orderSuccessPage',{admin:0,user,result,cartCount})
})

// orders page 

router.get('/orders-history',verifyLogin,async(req,res)=>{

  let user = req.session.user
  var result;
  categoryHelpers.showAllCategorysubcate().then((results)=>{
    result = results
  })
  let cartCount=await cartHelpers.getCartCount(req.session.user._id)
  let orders = await orderHelpers.getUserOrder(req.session.user._id)
  res.render('user/orderHistory',{admin:0,user,result,cartCount,orders})
})

// viwe order products in order history

router.get('/view-ordered-products/',verifyLogin,async(req,res)=>{
  console.log(req.query.id);
  let user = req.session.user
  var result;
  await categoryHelpers.showAllCategorysubcate().then((results)=>{
     result = results
   })
  let cartCount=await cartHelpers.getCartCount(req.session.user._id)
  let products = await orderHelpers.getOrderProducts(req.query.id)
  console.log(products);
  
  res.render('user/viewOrderedProduct',{admin:0,result,cartCount,user,products})
})

// cancel order in ajax requst
router.post('/canselOrder',async(req,res)=>{
  console.log(req.body.orderId);
 await orderHelpers.updateOrderStatus(req.body.orderId).then((response)=>{
   res.json(response)
 })

})

// wishlist in user 
router.get('/wishlist',verifyLogin,async(req,res)=>{
  let user = req.session.user
  console.log(req.session.user);
  var result;
  await categoryHelpers.showAllCategorysubcate().then((results)=>{
     result = results
   })
   let cartCount=await cartHelpers.getCartCount(req.session.user._id)
   let wishListItems= await userHelpers.showAllWishlists(req.session.user._id)

 res.render('user/wishlist',{admin:0,user,result,cartCount,wishListItems})
})

// add to wishlist
router.post('/wishlist',(req,res)=>{
  userHelpers.addToWishlist(req.body.proId,req.session.user._id).then((response)=>{
    res.json(response)
  })
})

// remove form wishlist
router.post('/removeProductInWishlist',(req,res)=>{
  console.log(req.body);
  userHelpers.removeWishlistProduct(req.body.proId,req.session.user._id).then((response)=>{
    console.log(response);
    res.json(response)
  })
})





// user logout
router.get('/logout',(req,res)=>{
  req.session.loggedIn=false
  res.redirect('/')
})


// sample from validation 
router.get('/sampleForm',(req,res)=>{

  res.render('user/sample',{admin:9})
})


module.exports = router;

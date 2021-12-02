var express =require('express')
var router = express.Router();

const adminHelpers = require('../helpers/admin-helper');
const categoryHelpers = require('../helpers/category-helpers');
const productHelpers = require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers')
const cartHelpers = require('../helpers/cart-helpers')
const orderHelpers = require('../helpers/order-helper');
const salesHelpers = require('../helpers/sales-helpers');
const { response } = require('express');
var addProductPopup = false;

// session midleware of admin
const verifyLogin=(req,res,next)=>{
    if(req.session.adminlogged){
      next()
    }else{
      res.redirect('/admin/')
    }
  }
// start the routers
router.get('/',(req,res)=>{
    if(req.session.adminlogged){
        res.redirect('/admin/home')
    }else{
        res.render('admin/login',{admin:2,adminlog:null})
    } 
})

// admin login post router with ajax
router.post('/',(req,res)=>{
    adminHelpers.adminLogin(req.body).then((response)=>{
        if(response.status){
            req.session.adminlogged=true
        }
        res.json(response)
    })
})

// home page of admin
router.get('/home',verifyLogin,(req,res)=>{
    if(req.session.adminlogged){
        res.render('admin/home',{admin:1})
    }else{
        res.redirect('/admin/')
    }
    
})

// show all product of admin side
router.get('/product',verifyLogin,async(req,res)=>{
   await productHelpers.getAllProducts().then((products)=>{
    res.render('admin/product',{admin:1,products,addProductPopup})
  
    })
})

// add product show the from
router.get('/add_product',verifyLogin,async(req,res)=>{
   await categoryHelpers.showAllCategory().then((response)=>{
        res.render('admin/addProduct',{admin:1,response,addProductPopup})
        addProductPopup =false;
    })
})

// show subcategory in ajax (add product form)
router.post('/ajaxaddproduct',async(req,res)=>{
    console.log(req.body.subcat);
    await categoryHelpers.showSubcateAddproduct(req.body.subcat).then((datas)=>{
        res.json(datas)
    })
})

// submit the add product form 
router.post('/add_product',(req,res)=>{
     productHelpers.addUser(req.body).then((response)=>{
        var id=""+response.insertedId
        var image1=req.files.file1
        var image2=req.files.file2
        var image3=req.files.file3
        image1.mv('./public/productimage/image1/'+id+'_1.jpg')
        image2.mv('./public/productimage/image1/'+id+'_2.jpg')
        image3.mv('./public/productimage/image1/'+id+'_3.jpg')
        addProductPopup =true;
        res.redirect('/admin/add_product')
    })
})

// edit product from admin side
router.get('/editproduct',verifyLogin,async(req,res)=>{
  var response= await categoryHelpers.showAllCategory()
  var product =await productHelpers.editProduct(req.query.id)
  res.render('admin/editproduct',{admin:1,product,response})
})

// post edit product
router.post('/editproduct/:id',(req,res)=>{
    
        productHelpers.afterEditProduct(req.params.id,req.body).then((response)=>{
            console.log(response);
            var Id = response
            console.log(Id);
            var image = req.files.file1
            var image2 = req.files.file2
            var image3 = req.files.file3
            
    
        try{
            if(image){image.mv('./public/productimage/image1/'+Id+'_1.jpg')}
            if(image2){image2.mv('./public/productimage/image1/'+Id+'_2.jpg')}
            if(image3){image3.mv('./public/productimage/image1/'+Id+'_3.jpg')}
            res.redirect('/admin/product')
        }catch(err){
            console.log(err);
            res.redirect('/admin/product')
        }
        })
  
})

// delete product
router.get('/productdelete/',verifyLogin,async(req,res)=>{
    var d = req.query.id
    console.log(req.query.id);
    await productHelpers.deleteProduct(req.query.id).then((response)=>{
        console.log(response);
        res.redirect('/admin/product')
    })
})

// user managemt show users in admin side
router.get('/customers',verifyLogin,async(req,res)=>{
 await userHelpers.getAllusers().then((users)=>{
     res.render('admin/customers',{admin:1,users})
 })
})

// block the user in admin side
router.post('/blockuser',async(req,res)=>{
    console.log('hello');
    var id ;
    if(req.session.user){
        id = req.session.user._id
    }else{
        id= null
    }
   await userHelpers.blockuser(req.body.userId).then((response)=>{
       
       if(response.userId === id){
           req.session.loggedIn=false;
       }
        res.json(response)
    })
})

// unblock the user in admin side 
router.post('/unblockuser',async(req,res)=>{
    console.log(req.body.userId);
    await userHelpers.unblockuser(req.body.userId).then((response)=>{
        res.json(response)
    })
})

// list of all orders in admin side
router.get('/orders',verifyLogin,async(req,res)=>{
   await orderHelpers.getAllOrders().then((allOrders)=>{
       console.log(allOrders);
        res.render('admin/orders',{admin:1,allOrders})
    })
})

// edit order status in admin side
router.post('/changeStatus',async(req,res)=>{
    console.log(req.body.upsateStatus);
    console.log(req.body.orderId);
   await orderHelpers.changeOrderStatus(req.body.orderId,req.body.upsateStatus).then((response)=>{
       res.json(response)
   })
})

// category management 
router.get('/categorylist',verifyLogin,async(req,res)=>{
   await categoryHelpers.showAllCategory().then((category)=>{
        res.render('admin/categorylist',{admin:1,category})
    })
})

// add category in admin side with ajax
router.post('/addcategory',async(req,res)=>{
   await categoryHelpers.addCategory(req.body.category).then((response)=>{
    res.json(response)
    })
})

// delete category in admin side
router.post('/deletecategory',(req,res)=>{
    console.log(req.body);
    categoryHelpers.deletecategory(req.body).then((response)=>{
        res.json(response)
    })
})

// edit category
router.post('/editcategory',(req,res)=>{
    console.log(req.body);
    categoryHelpers.editCategory(req.body.category,req.body.newcategory).then((response)=>{
        res.redirect('/admin/categorylist')
    })
})

// show subcategory in admin side
router.get('/subcategory',verifyLogin,async(req,res)=>{
    console.log(req.query.id);
   await categoryHelpers.listOfSubcategory(req.query.id).then((result)=>{
       console.log(result);
       console.log('howm');
        res.render('admin/subcategory',{admin:1,result})
    })
})

// add subcategory in admin side at ajax request
router.post('/subcategory',async(req,res)=>{
   await categoryHelpers.addSubcategory(req.body.categoryname,req.body.subcategory).then((response)=>{
     res.json(response)
   })
})

// edit subcategory
router.post('/editSubCategory',(req,res)=>{
    console.log(req.body);
})

// 
router.post('/deletesubcategory',async(req,res)=>{
   await categoryHelpers.deleteSubcategory(req.body.cateId,req.body.subcateName).then((response)=>{
        res.json(response)
    })
})

// admin logOut
router.get('/logout',(req,res)=>{
    req.session.adminlogged=false
    res.redirect('/admin/')
})


// sales report in admin side
router.get('/salesReport',verifyLogin,(req,res)=>{
    salesHelpers.SalesReportAllOrders().then((orders)=>{
        res.render('admin/salesReport',{admin:1,orders})  
    })
})
router.get('/salesReportSorting',(req,res)=>{
    console.log(req.query.type);
    salesHelpers.getReportData(req.query.type   ).then((orders)=>{
        res.render('admin/salesReport',{admin:1,orders}) 
    })
})


//sample chart js 
router.get('/chart',(req,res)=>{  
        res.render('admin/charts',{admin:2})
  
}) 

router.post('/getGraphResponse',async(req,res)=>{
    console.log('getGraphResponse');

    var statusData =await salesHelpers.getOrdersStatus()
   var ProductItemsCount = await productHelpers.totalProductCount()
   var revanu = await salesHelpers.totalRevanu()
   var totalcompleteSales = await salesHelpers.totalOrderCompletedCound()
    await salesHelpers.getWeeklyUsers().then((values)=>{
        res.json({values,statusData,ProductItemsCount,revanu,totalcompleteSales})
    })
})

router.post('/salesStatus',(req,res)=>{

})

// sample 
router.get('/sample',(req,res)=>{
 
        res.render('admin/sampleForm',{admin:9})
   
})



router.post('/samplee/',(req,res)=>{
 console.log(req.files.file1);
console.log('callldede ');
 console.log(req.body);
})

module.exports = router;
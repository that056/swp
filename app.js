const dbpool = require('./db')
const express = require('express')
const session = require('express-session')
const body_parser = require('body-parser')
const crypto = require('crypto')
const key = crypto.randomBytes(12).toString('hex')
const app = express()
let vistors=0;
const multer = require('multer');
const path = require('path');
const nodemailer = require('nodemailer');
const  google = require('googleapis');
const {jsPDF} = require('jspdf');
const ejs = require('ejs');





app.use(body_parser.json())

const fs = require('fs');
const admin ={
    username:'admin',
    passord:'1234'
}

const deleteFile = (Filepath)=>{
    fs.unlink(Filepath,(err)=>{
        if(err){
            console.log('error occured')
        }
        else{
            console.log('file deletted')
        }
    })
    
}
function imgFile(){

    const storage = multer.diskStorage({
        destination: './uploads/',
        filename: function(req, file, cb) {
            console.log(req.body.name)
           // cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
           cb(null,req.body.name + path.extname(file.originalname));
        }
    });
    return storage
}










app.use(session({
    secret:key,
    resave:false,
    saveUninitialized:true,
    cookie:{secure:false}
}))

//app.use(body_parser.urlencoded({extended:true}))
app.use(express.urlencoded({extended:true}))

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

app.get('/',async(req,res)=>{
   res.render('adminLogin')
})

app.get('/home',async(req,res)=>{
    async function getVistors(){
        const Q = 'select * from visitors'
        const [num] =  await dbpool.query(Q)
        const numValue= num[0].num
      
        vistors = numValue
        if(req.session){
            vistors++;
            dbpool.query(`update visitors set num = ${vistors} where id=1`)
        }
    }
   
 getVistors();
   
   
 
    res.redirect('https://fungoid-accomplishm.000webhostapp.com/')
})
app.get('/admin', async(req,res)=>{
    const Query = 'select count(*) AS "count" from customers '
    const [result] = await dbpool.query(Query)
   const count = result[0].count

   const Query4 = 'select count(*) AS "sumT" from orders '
   const [result4] = await dbpool.query(Query4)
  const count4 = result4[0].sumT

  const Query5 = 'select sum(total_price) AS "sumT" from orders '
  const [result5] = await dbpool.query(Query5)
 const count5 = result5[0].sumT

   const Query2 = 'select count(*) AS "count" from complaints where resolved is null '
   const [result2] = await dbpool.query(Query2)
  const count2 = result2[0].count

  const Q2 = 'select * from admin where id = 1 '
  const [admin] =  await dbpool.query(Q2)
 


   const Q = 'select * from visitors'
        const [num] =  await dbpool.query(Q)
        const numValue= num[0].num
const diff = numValue -count
        const bounce_rate = Math.ceil((diff/numValue)*100)

res.render('admin',{count:count,vistors:numValue,rate:bounce_rate,messages:count2,admin:admin[0],salesCount:count4,sales:count5})


})

app.get('/complaints', async(req,res)=>{
    const Query = 'select * from complaints where resolved is null '
    let [complaints] = await dbpool.query(Query)
    if(complaints.length===0){
        complaints =null
    }
    console.log(complaints)
    const Q2 = 'select * from admin where id = 1 '
  const [admin] =  await dbpool.query(Q2)
  
    const Query2 = 'select count(*) AS "count" from complaints where resolved is null '
    const [result2] = await dbpool.query(Query2)
   const count2 = result2[0].count


res.render('complaints',{complaints:complaints,messages:count2,admin:admin[0]})


})


app.get('/customers', async(req,res)=>{
    const Query = 'select  *  from customers '
    const [customers] = await dbpool.query(Query)
 
    const Query2 = 'select count(*) AS "count" from complaints where resolved is null '
    const [result2] = await dbpool.query(Query2)
   const count2 = result2[0].count
   const Q2 = 'select * from admin where id = 1 '
  const [admin] =  await dbpool.query(Q2)
  
res.render('customer',{customers:customers,messages:count2,admin:admin[0]})
})

app.get('/reply', async(req,res)=>{
    const customer={
        email:req.query.email,
        id:req.query.id
    }
    console.log(customer)
   

    const Query2 = 'select count(*) AS "count" from complaints where resolved is null '
    const [result2] = await dbpool.query(Query2)
   const count2 = result2[0].count
   
   const Q2 = 'select * from admin where id = 1 '
  const [admin] =  await dbpool.query(Q2)



res.render('reply',{customer:customer,messages:count2,admin:admin[0]})
})

app.get('/sentReply', async(req,res)=>{
    const customer={
        email:req.query.email,
        id:req.query.id,
        reply:req.query.reply,
        name:null
    }
    const Query2 = `update complaints 
                    set resolved ="Yes"
                    where id =${customer.id}
    `
    const [result2] = await dbpool.query(Query2)
    const Query = `delete from complaints where resolved ="Yes"`
const [result] = await dbpool.query(Query)
const Query3 = `select name from customers where email ="${customer.email}"
`
const [name] = await dbpool.query(Query3)
customer.name = name[0].name
console.log(customer.name)

 const CLIENTID ='654975932592-h7muampc39g60qb6dpt0s28pbvohrki8.apps.googleusercontent.com'
 const CLIENT_KEY ='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'
 REDERECT_URL ='https://developers.google.com/oauthplayground'
 REFRESH_TOKEN ='1//04EfsjUT-xpGpCgYIARAAGAQSNwF-L9IrOoY2CM6X0PPPtVi7KyfY184nj7Z0hdQR7ReApuFRA--m8K204mqW7yAYYHtXc3P3sh4'
  const Oauth2client = new google.Auth.OAuth2Client(CLIENTID,CLIENT_KEY,REDERECT_URL)
 
Oauth2client.setCredentials({refresh_token: REFRESH_TOKEN})

useMail(customer);
async function useMail(customer){
    const emailTxt = `Dear  ${customer.name},<br><br>
    We Have Recieved Your Complaint. The Response From Our Team <br><br>"${customer.reply} "<br><br>
    From The L Group`;
    
    const acesstoken =  await Oauth2client.getAccessToken()
  const transport=  nodemailer.createTransport(({
    service:'gmail',
    auth:{
        type:'OAuth2',
        user:'outlookemailanotherone@gmail.com',
        clientId:CLIENTID,
        clientSecret:CLIENT_KEY,
        refreshToken:REFRESH_TOKEN,
        acessToken:acesstoken
    }
    }))

    transport.sendMail(({
        from:' The L Group <outlookemailanotherone@gmail.com>',
        to: `${customer.email}`,
        subject:'Complaint Response',
     html:emailTxt
    }))
    .then((res)=>{
        console.log(res)
    })
}
res.redirect("/admin")
})

app.get('/sentOrder', async(req,res)=>{
const months =["January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"]
    const customer={
        email:null,
        order_id:req.query.id,
        name:null,
        address:null,
          day:Math.ceil((new Date().getDate() + Math.random()*(  31 -new Date().getDate() ))),
        date :months[new Date().getMonth()] 


    }
    const Query2 = `update orders 
                    set order_status ="Approved"
                    where order_id =${customer.order_id}
    `
    const [result2] = await dbpool.query(Query2)

    const Query5 = `select cus_id_number from orders where order_id ="${customer.order_id}"
`
const [cus_id] = await dbpool.query(Query5)
const cus = cus_id[0].cus_id_number

const Query6= `select email from customers where cus_id_number ="${cus}"
`
const [email] = await dbpool.query(Query6)
const email_t = email[0].email
customer.email =email_t
   
const Query3 = `select name from customers where email ="${customer.email}"
`
const [name] = await dbpool.query(Query3)
customer.name = name[0].name

const Query4 = `select street from orders where order_id ="${customer.order_id}"
`
const [street] = await dbpool.query(Query4)
customer.address = street[0].street
console.log(customer.address)

 const CLIENTID ='654975932592-h7muampc39g60qb6dpt0s28pbvohrki8.apps.googleusercontent.com'
 const CLIENT_KEY ='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'
 REDERECT_URL ='https://developers.google.com/oauthplayground'
 REFRESH_TOKEN ='1//04EfsjUT-xpGpCgYIARAAGAQSNwF-L9IrOoY2CM6X0PPPtVi7KyfY184nj7Z0hdQR7ReApuFRA--m8K204mqW7yAYYHtXc3P3sh4'
  const Oauth2client = new google.Auth.OAuth2Client(CLIENTID,CLIENT_KEY,REDERECT_URL)
 
Oauth2client.setCredentials({refresh_token: REFRESH_TOKEN})

useMail(customer);
async function useMail(customer){
    const emailTxt = `Dear  ${customer.name},<br><br>
    Your Order Has Been Approved <br><br>Order ID : <b>${customer.order_id}</b> <br><br>
    Delivery Date : <b>${customer.day + " " + customer.date + " 2024"}</b> <br><br>
    Address : <b>${customer.address}</b> <br><br>
    From The L Group`;
    
    const acesstoken =  await Oauth2client.getAccessToken()
  const transport=  nodemailer.createTransport(({
    service:'gmail',
    auth:{
        type:'OAuth2',
        user:'outlookemailanotherone@gmail.com',
        clientId:CLIENTID,
        clientSecret:CLIENT_KEY,
        refreshToken:REFRESH_TOKEN,
        acessToken:acesstoken
    }
    }))

    transport.sendMail(({
        from:' The L Group <outlookemailanotherone@gmail.com>',
        to: `${customer.email}`,
        subject:'Order Details',
     html:emailTxt
    }))
    .then((res)=>{
        console.log(res)
    })
}
res.redirect("/admin")
})

app.get('/DeclineOrder', async(req,res)=>{
    const months =["January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"]
        const customer={
            email:null,
            order_id:req.query.id,
            name:null,
            address:null,
            day:Math.ceil(new Date().getDate()+Math.random()*31),
            date :months[new Date().getMonth()] 
    
    
        }
        const Query2 = `update orders 
                        set order_status ="pending"
                        where order_id =${customer.order_id}
        `
        const [result2] = await dbpool.query(Query2)
    
        const Query5 = `select cus_id_number from orders where order_id ="${customer.order_id}"
    `
    const [cus_id] = await dbpool.query(Query5)
    const cus = cus_id[0].cus_id_number
    
    const Query6= `select email from customers where cus_id_number ="${cus}"
    `
    const [email] = await dbpool.query(Query6)
    const email_t = email[0].email
    customer.email =email_t
       
    const Query3 = `select name from customers where email ="${customer.email}"
    `
    const [name] = await dbpool.query(Query3)
    customer.name = name[0].name
    
    const Query4 = `select street from orders where order_id ="${customer.order_id}"
    `
    const [street] = await dbpool.query(Query4)
    customer.address = street[0].street
    console.log(customer.address)
    
     const CLIENTID ='654975932592-h7muampc39g60qb6dpt0s28pbvohrki8.apps.googleusercontent.com'
     const CLIENT_KEY ='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'
     REDERECT_URL ='https://developers.google.com/oauthplayground'
     REFRESH_TOKEN ='1//04EfsjUT-xpGpCgYIARAAGAQSNwF-L9IrOoY2CM6X0PPPtVi7KyfY184nj7Z0hdQR7ReApuFRA--m8K204mqW7yAYYHtXc3P3sh4'
      const Oauth2client = new google.Auth.OAuth2Client(CLIENTID,CLIENT_KEY,REDERECT_URL)
     
    Oauth2client.setCredentials({refresh_token: REFRESH_TOKEN})
    
    useMail(customer);
    async function useMail(customer){
        const emailTxt = `Dear  ${customer.name},<br><br>
        Your Order Has Been Declined <br><br>Order ID : <b>${customer.order_id}</b> <br><br>
        Order Status :   <b>Declined</b> <br><br>
        For More Infomation Please Contact <a href=mailto:outlookemailanotherone@gmail.com>Sales Department</a>
        From The L Group`;
        
        const acesstoken =  await Oauth2client.getAccessToken()
      const transport=  nodemailer.createTransport(({
        service:'gmail',
        auth:{
            type:'OAuth2',
            user:'outlookemailanotherone@gmail.com',
            clientId:CLIENTID,
            clientSecret:CLIENT_KEY,
            refreshToken:REFRESH_TOKEN,
            acessToken:acesstoken
        }
        }))
    
        transport.sendMail(({
            from:' The L Group <outlookemailanotherone@gmail.com>',
            to: `${customer.email}`,
            subject:'Order Details',
         html:emailTxt
        }))
        .then((res)=>{
            console.log(res)
        })
    }
    res.redirect("/admin")
    })



    


app.get('/orders', async(req,res)=>{
    const Q3 = `update orders set order_status="pending" where order_status is null`
    const [result] = await dbpool.query(Q3)
    const Query = 'select  *  from orders '
    const [orders] = await dbpool.query(Query)

    const Query2 = 'select count(*) AS "count" from complaints where resolved is null '
    const [result2] = await dbpool.query(Query2)
   const count2 = result2[0].count
   const Q2 = 'select * from admin where id = 1 '
  const [admin] =  await dbpool.query(Q2)

    
  
res.render('orders',{orders:orders,messages:count2,admin:admin[0]})
})
app.get('/color', async(req,res)=>{
    const Query = 'select  *  from color '
    const [color] = await dbpool.query(Query)
 
    const Query2 = 'select count(*) AS "count" from complaints where resolved is null '
    const [result2] = await dbpool.query(Query2)
   const count2 = result2[0].count
   const Q2 = 'select * from admin where id = 1 '
  const [admin] =  await dbpool.query(Q2)
    
  
res.render('color',{color:color,messages:count2,admin:admin[0]})
})

app.get('/report', async(req,res)=>{
    const Query2 = 'select count(*) AS "count" from complaints where resolved is null '
    const [result2] = await dbpool.query(Query2)
   const count2 = result2[0].count

   const Q2 = 'select * from admin where id = 1 '
  const [admin] =  await dbpool.query(Q2)
res.render('reports',{messages:count2,admin:admin[0]})
})

app.get('/materials', async(req,res)=>{
    const Query = 'select  *  from color '
    const [color] = await dbpool.query(Query)
    const Query2 = 'select count(*) AS "count" from complaints where resolved is null '
    const [result2] = await dbpool.query(Query2)

   const count2 = result2[0].count
   const Q2 = 'select * from admin where id = 1 '
  const [admin] =  await dbpool.query(Q2)

    res.render('materials',{color:color,messages:count2,admin:admin[0]})
    })
app.post('/test',(req,res)=>{
console.log(req.body.name)
})
app.post('/upload', async(req,res)=>{


    const upload = multer({
        storage: imgFile(),
        limits: { fileSize: 10000000 } // 1 MB limit
    }).single('image');

     upload (req, res,  async (err) => {
       
        if (err) {
            res.status(400).send('Error uploading file');
            
        } else {
            // File uploaded successfully
            res.redirect('/admin')
            const imageBuffer = fs.readFileSync(`./uploads/${req.body.name}.jpeg`);
            const base64Image = Buffer.from(imageBuffer).toString('base64');
           /* await dbpool.query(`insert into color(name,image) values("Cherlton","${base64Image}")`)*/
            await dbpool.query(`UPDATE color 
            SET name = ?, image = ?
            WHERE id = ?`, [req.body.name, base64Image, req.body.id]);
            deleteFile(`./uploads/${req.body.name}.jpeg`)
        }
        
    });
 


          


})
app.get('/upload', (req,res)=>{
   res.render('upload')
})

app.get('/login', (req,res)=>{
   
        res.redirect('./admin')


 })
app.get('/getImage', async (req,res)=>{
  const [result]=  await dbpool.query('select * from color where id= 1')
  const img64 = result[0].image
res.render('image',{baseimg : img64})   
 })

 app.post('/loginP', (req, res) => {
    const { username, password } = req.body;

    // Handle the received data (e.g., validate the user)
      console.log(`Received ${JSON.stringify(req.body)}`);

    // Here you can add your authentication logic
    if (username === admin.username && password === admin.passord) {
        res.status(200).json({ message: 'Login successful' });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
});


app.get('/getDashboard', async (req, res) => {
    const Query = 'select count(*) AS "count" from customers '
    const [result] = await dbpool.query(Query)
   const count = result[0].count

   const Q = 'select * from visitors'
        const [num] =  await dbpool.query(Q)
        const numValue= num[0].num
const diff = numValue -count
        const bounce_rate = Math.ceil((diff/numValue)*100)

  
        res.status(200).json({count:count,vistors:numValue,rate:bounce_rate});
    }
);

app.get('/getCustomers', async(req,res)=>{
    const Query = 'select  *  from customers '
    const [customers] = await dbpool.query(Query)
 
    
  
res.json(customers)
})

app.get('/cartRecord', async(req,res)=>{
   
 
})

app.get('/getOrders', async(req,res)=>{
    const Query = 'select  *  from orders '
    const [orders] = await dbpool.query(Query)
 
    
  
res.json(orders)
})

app.get('/getComplaints', async(req,res)=>{
    const Query = 'select  *  from complaints  where resolved is null'
    const [complaints] = await dbpool.query(Query)
    if(complaints.length===0){
        res.json(complaints)
    }
    
  
res.json(complaints)
})

app.get('/homereport', async (req, res) => {

    // Extract search term (optional) and fetch data
    const searchTerm = req.query.search || '';
    // ... (Your logic to fetch data based on searchTerm)

    const [results] =  await dbpool.query('select * from customers'); // Replace with your data fetching logic

    
    // Render HTML template with data
   res.render('homereport',{data:results})

 
});


app.get('/paymentreport', async (req, res) => {

    // Extract search term (optional) and fetch data
    const searchTerm = req.query.search || '';
    // ... (Your logic to fetch data based on searchTerm)

    const [results] =  await dbpool.query('select * from payment'); // Replace with your data fetching logic

    
    // Render HTML template with data
   res.render('paymentreport',{data:results})

 
});

app.get('/complaintreport', async (req, res) => {

    // Extract search term (optional) and fetch data
    const searchTerm = req.query.search || '';
    // ... (Your logic to fetch data based on searchTerm)

    const [results] =  await dbpool.query('select * from complaints'); // Replace with your data fetching logic

    
    // Render HTML template with data
   res.render('complaintreport',{data:results})

 
});
app.get('/productreport', async (req, res) => {

    // Extract search term (optional) and fetch data
    const searchTerm = req.query.search || '';
    // ... (Your logic to fetch data based on searchTerm)

    const [results] =  await dbpool.query('select * from products'); // Replace with your data fetching logic

    
    // Render HTML template with data
   res.render('productreport',{data:results})

 
});




app.listen(3000,()=>{
    console.log('server is running on port 3000')
})



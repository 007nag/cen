var exp= require('express');
var socket= require('socket.io');
var express=exp();
var z=express.listen(3000,function()
{
  console.log("listening");
});

express.use(exp.static('public'))
var io= socket(z);
var z;
io.on('connection',function(socket)
{
  
  socket.on('msg',function (data) {
    io.emit('rec',data);
  });
  socket.on('typing',(data)=>
  {
    socket.broadcast.emit('ty',{name:data.name});
  });
  socket.on('search',(data)=>
  {  

    main(data).then(function ()
    {
      
    }).catch(console.error);
  });

const {MongoClient} = require('mongodb');


async function main(data){
  /**
   * Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
   * See https://docs.mongodb.com/ecosystem/drivers/node/ for more details
   */
  const uri = "mongodb+srv://nag007:12345678A@cluster0-wiohs.mongodb.net/mydb";

  const client = new MongoClient(uri,{useUnifiedTopology: true});

  try {
      // Connect to the MongoDB cluster
      client.connect(function (err)
        { if (err)
            console.log(err)
        db=client.db("mydb");        
        var coll= db.collection("retail");
        var pna= data['pname']; var pageno= data['pageno']; var dep=data['dep'];var col=data['col'];
        if (dep.length==0)
        dep="";
          if(col.length==0)
          col=""
          var depreg= new RegExp(dep); var colreg= new RegExp(col);
         var reg=new RegExp(pna);
        let promi= new Promise((res,rej)=>
        {
          coll.find({"enc_department_description":{ $regex: reg, $options : 'i'},
          "sub_dept":{$regex:depreg},"colour":{$regex:colreg}
        }).skip(
          pageno*10
        ).limit(10).toArray(function(err,r)
        { 
            res(r);
        //  console.log(r);
        });
        });
       

         var fun= async()=>
         { //var rrr=[]; 
            var res= await (promi); 
            //var res1= await(promi2);
            //rrr.concat(res);rrr.concat(res1);
            return res;
         }
          fun().then(res=>
            {
              socket.emit('rrr',res);
            });
         /*client.db().admin().listDatabases(client).then(a=>{
          console.log(a.databases);
  
        });*/
        
      });
        

      // Make the appropriate DB calls
    
      
  } catch (e) {
      console.error(e);
  } finally {
      await client.close();
  }
}

async function getdata()
{
  
  try {
    // Connect to the MongoDB cluster
    const uri = "mongodb+srv://nag007:12345678A@cluster0-wiohs.mongodb.net/mydb";
  const client = new MongoClient(uri,{useUnifiedTopology: true});
    client.connect(function (err)
      { if (err)
          console.log(err)
      db=client.db("mydb");        
      var subdept= db.collection("sub_dept");
      var color= db.collection("colour"); 
      let promise1 = new Promise((res, rej) => {
        subdept.find().toArray(function(err,r)
      { //console.log(r);
       res(r);
      });
      
    });
    let promise2 = new Promise((res, rej) => {
      
      color.find().skip(2).limit(10).toArray(function(err,r)
    {
      res(r);
    });
    
  });
    var getthedata = async () => {
      var result1 = await (promise1);
      var result2=await(promise2);
      var result=[];result.push(result1);result.push(result2);
      return result;
    };
    getthedata().then(res=>{
      console.log('yes');
      socket.emit('senddata',res);
    });
       /*client.db().admin().listDatabases(client).then(a=>{
        console.log(a.databases);

      });*/
    });
      

    // Make the appropriate DB calls
  
    
} catch (e) {
    console.error(e);
} finally {
    
}

}
getdata().then().catch();

/*getdata().then(data=>
  {
    console.log("ffff"+data);
  });*/
});
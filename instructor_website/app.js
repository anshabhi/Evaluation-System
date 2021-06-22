var mysql = require('mysql2');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
var MemcachedStore = require("connect-memcached")(session);
var csrf = require('csurf')
var csrfProtection = csrf();

var Memcached = require('memcached');
var fs    = require('fs')


//var config = require('/js/util/config.js');
var con = { 
	user: "eval",
	password: "password",
	database : "2vggsbuang",
	dateStrings: 'date',
    socketPath: '/var/run/mysqld/mysqld.sock',
    	
  };
var pool = mysql.createPool(con);
pool.on('error', function(err) {
    console.log(err);
   // res.status(503);
   // res.send({ success: false, message: 'connection error', error: err });
   throw err; 

});
  var app = express();
  app.use(session({
      secret: 'secret',
      store: new MemcachedStore({
      hosts: ["127.0.0.1:11211"],
      secret: "123, easy as ABC. ABC" // Optionally use transparent encryption for memcache session data
    }),
      resave: false,
      saveUninitialized: false,
      cookie: {
        path: "/",
       maxAge:  3600000,
       httpOnly: true  //60 mins
    },
    secure: true
  }));
//app.use(express.static(__dirname));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());


//var api = createApiRouter()

// mount api before csrf is appended to the app stack
//app.use('/api', api)
app.all('*', function(req, res, next){
    //console.log(req.url)
    if (req.path != '/auth' && req.path != '/CSRFtoken' && req.path != '/'){
    if (req.session && req.session.loginStatus) {
    if (req.path == '/homepage')
    next();
    else if (req.session.homepageV)
    next();
    else
    {res.status(403);
    res.send();
}
  }
  else
  {
      res.status(403);
    res.redirect('/');

  }}
  else if (req.path == '/')
  {
    
    if (req.session && req.session.loginStatus)
    {
        res.redirect('/homepage')
}else
next();    
  }
  else
  next();
});
app.get('/', function(request, response) {
    
    response.sendFile(path.join(__dirname + '/html/login.html'));
});
app.use(function (err, req, res, next) {
    if (err.code !== 'EBADCSRFTOKEN') return next(err)
  
    // handle CSRF token errors here
    res.status(403)
   // res.redirect('/');
    
  })
app.get('/CSRFtoken',csrfProtection, function(request, response) {
    
    response.send({csrfToken: request.csrfToken()});
});
app.get('/homepage', function(request, response) {
    request.session.labListV = 0;
    request.session.testListV = 0;
    
    request.session.homepageV = 1;
    request.session.TSQ = 0;
    request.session.DTQ = 0;
    request.session.resultV = 0;
    request.session.CEQ = 0;
    request.session.labDetQ = 0;
    request.session.EDV = 0;
        response.sendFile(path.join(__dirname + '/html/homepage.html'));	
});



app.get('/view_response', function(request, response) {
       
            request.session.EDV = 1;
        response.sendFile(path.join(__dirname + '/html/view_response.html'));	
         
         //else
        // response.redirect('/result')
});
app.get('/question_edit', function(request, response) {
        response.sendFile(path.join(__dirname + '/html/question_edit.html'));
});
app.get('/viewStatus', function(request, response) {
    response.sendFile(path.join(__dirname + '/html/view_status.html'));
});
app.get('/result', function(request, response) {
    
        response.sendFile(path.join(__dirname + '/html/result.html'));
             
});
app.get('/test_creation', function(request, response) {

        response.sendFile(path.join(__dirname + '/html/test_creation.html'));
});
app.get('/test_updation', function(request, response) {

        response.sendFile(path.join(__dirname + '/html/test_updation.html'));
});


app.post('/auth',csrfProtection, function(request, res) {
	//console.log(request.body);
	var username = request.body.username;
	
	var password = request.body.password;

        pool.query("SELECT * FROM instructor where email = ? and password = ?",[username,password], function(err, results) {
            if (err) {
                console.log(err);
                res.status(503);
                res.send({ success: false, message: 'query error', error: err });
                
            }
            else{
            
            if (results.length == 1){
            
            
         
                name = results[0].NAME;
            uid =  results[0].I_ID;
            
            request.session.i_name = name;
			request.session.i_id = uid;
            request.session.loginStatus = true;
                
                request.session.uname = username;
                res.send({ success: true, message: 'query done', found: 1,iname:name});
        }

        else
        res.send({ success: false, message: 'Invalid Details',found : 0});

        }
        });
    });

app.post('/logout',function(request, res) {
    
    request.session.destroy();
    
    res.send({ success: true, message: 'logout done', done: 1});

})

app.post('/toggleStatusQuery',csrfProtection, function(request, res) {
    
    pool.query("select name,t_id,live from test natural join test_ins where i_id = ?",request.session.i_id, function (err, result, fields) {
        if (err){
            console.log(err);
            res.status(503);
            res.send({ success: false, message: 'query error', error: err.message });
        }
        else{
            request.session.TSQ = 1;
            res.send({ success: true, result: result});
            
        }  
    });
    
    
})

app.post('/deleteTestQuery',csrfProtection, function(request, res) {
    pool.query("select name,t_id,live from test natural join test_ins where i_id = ? and t_id not in (select t_id from result)",request.session.i_id, function (err, result, fields) {
        if (err){
            console.log(err);
            res.status(503);
            res.send({ success: false, message: 'query error', errorThrown: err.message });
        }
        else{
            request.session.DTQ = 1;
            res.send({ success: true, result: result});
            
        }  
    });
    
})
app.post('/toggleStatus',csrfProtection, function(request, res) {
    if (request.session.TSQ)
    pool.query("update test set live = not live where t_id = ?",request.body.tidn, function (err, result, fields) {
        if (err){
            console.log(err);
            res.status(503);
            res.send({ success: false, message: 'query error', error: err.message });
        }
        else{
            request.session.TSQ = 0;
            res.send({ success: true, affectedRows: result.affectedRows});
            
        }  
    });
    else
    {res.status(403);
    res.send();
    }
    
})
app.post('/deleteTest',csrfProtection, function(request, res) {
    if (request.session.DTQ)
    pool.query("delete from test where t_id = ?",request.body.tidn, function (err, result, fields) {
        if (err){
            console.log(err);
            res.status(503);
            res.send({ success: false, message: 'query error', error: err.message });
        }
        else{
            request.session.DTQ = 0;
            res.send({ success: true, affectedRows: result.affectedRows});
            
        }  
    });
   
    else
    {
        res.status(403);
        res.send();

    }
});
app.post('/labList',csrfProtection, function(request, res) {
    pool.query("SELECT * FROM lab natural join lab_ins where i_id = ?",request.session.i_id, function (err, result, fields) {
        if (err){
            
            console.log(err);
            res.status(500);
            res.send({ success: false, message: 'query error'});
        }
        else{
            request.session.labListV = true;
            res.send({ success: true, result: result});
            
        }  
    });
    
});
app.post('/testList',csrfProtection, function(request, res) {
    if (request.session.labListV)
    pool.query("SELECT * FROM test natural join test_lab where lab_id = ?",request.body.lab_id, function (err, result, fields) {
        if (err){
            
            console.log(err);
            res.status(500);
            res.send({ success: false, message: 'query error'});
        }
        else{
            request.session.testListV = true;
            request.session.labListV = 0;
            res.send({ success: true, result: result});
            
        }  
    });
    else
    {res.status(403);
        res.send();}
});

app.post('/register',csrfProtection, function(request, res) {
    pool.query("insert into instructor set ?",request.body.set, function (err, result, fields) {
        if (err){
            
            console.log(err);
           // res.status(500);
            res.send({ success: true, message: err.sqlMessage});
        }
        else{
            
            res.send({ success: true, affectedRows: result.affectedRows});
            
        }  
    });
    
});

app.post('/resultQ',csrfProtection, function(request, res) {
    if (!request.session.resultV)
    pool.query("select name,all_ins_eval,roll_no,marks_obtained,attempt_time,s_id,reg_no from result natural join student natural join stu_batch where t_id = ? and batch_id = (select batch_id from test_lab natural join lab where t_id = ?)",[request.body.tidn,request.body.tidn],function (err, result, fields) {        if (err){
            
            console.log(err);
            res.status(500);
            res.send({ success: false, message: err.sqlMessage});
        }
        else{
            request.session.resultV = 0;
            res.send({ success: true, result: result});
            
        }  
    });
    else
    {
        res.status(403);
        res.send();

    }
});

app.post('/labDet',csrfProtection, function(request, res) {
    pool.query("select * from lab natural join lab_ins where i_id = ?",request.session.i_id, function (err, result, fields) {
        if (err){           
            console.log(err);
            res.status(500);
            res.send({ success: false, message: err.sqlMessage});
        }
        else{
            request.session.labDetQ = 1;
            res.send({ success: true, result: result});
            
        }  
    });
    
});

app.post('/testInsert',csrfProtection, function(request, res) {
    
   
   queryObj = request.body.queryObj;
  var query = "";
  
pool.query('INSERT INTO test SET ?', queryObj.testo, function (err, result, fields) {
    if(err){ errorMsg(err);
   
  }
  else{
    
    tidn = result.insertId;
    
    testLab = {t_id: tidn, lab_id : queryObj.lab_id};
    
    pool.query('INSERT INTO test_lab SET ?', testLab, (errs, ress) => {
                      if(errs){ console.log(errs);
                                  return;
                                      }});  
      testIns = {t_id: tidn, i_id : request.session.i_id};
    
    pool.query('INSERT INTO test_ins SET ?', testIns, (errs, ress) => {
                      if(errs){ console.log(errs);
                                  return;
                                      }});
    for (i = 0; i < queryObj.fitb.length; i++)
    {
    question = queryObj.fitb[i];
    query+= "INSERT INTO fillintheblank values (0,'" + question.question + "'," + tidn + ","+ question.marks + ");";  
                                                
    }
                                   
                                   
   for (i = 0; i < queryObj.mcq.length; i++)
   {
                                           
    question = queryObj.mcq[i];
    query+=	"INSERT INTO mcq values(0,'" + question.question + "','" + question.op1 + "','" + question.op2 + "','" + question.op3 + "','" + question.op4 + "'," + question.correct +"," + tidn + "," + question.marks+ ");";
                                      
    }
                                   
    for (i = 0; i < queryObj.desc.length; i++)
    {
    question = queryObj.desc[i];
    query+=	"INSERT INTO descriptive values (0,'" +  question.question + "'," + tidn + "," + question.marks + ");";                
    } 
   // query = mysql.escape(query);
  var con2 = { 
	user: "eval",
	password: "password",
	database : "2vggsbuang",
	dateStrings: 'date',
    socketPath: '/var/run/mysqld/mysqld.sock',
    multipleStatements: true	
  }; 
    var conn = mysql.createConnection(con2);
    conn.query(query, function(err, results) {
        if (err) {console.log (err);
           
        conn.end();
        res.send({ success: false});
        }
      
        // `results` is an array with one element for every statement in the query:
        //console.log(results); // [{1: 1}] // [{2: 2}]
        conn.end();
        res.send({ success: true});
      });

    }});

});



app.post('/getTest',csrfProtection, async function(request, res) {   
    tid = request.body.tid;
    var finalResult = {};
    pool.query("SELECT * FROM test where T_ID = ?",tid, function (err, result, fields) {
        if (err){           
            console.log(err);
            res.status(500);
            res.send({ success: false, message: err.sqlMessage});
        }
        else{
            
           finalResult.testd = result;
           pool.query("SELECT * FROM descriptive where T_ID = ?",tid, function (err, result, fields) {
            if (err){           
                console.log(err);
                res.status(500);
                res.send({ success: false, message: err.sqlMessage});
            }
            else{
                
               finalResult.desc = result;
               pool.query("SELECT * FROM mcq where T_ID = ?",tid, function (err, result, fields) {
                if (err){           
                    console.log(err);
                    res.status(500);
                    res.send({ success: false, message: err.sqlMessage});
                }
                else{
                    
                    finalResult.mcq = result;
                    pool.query("SELECT * FROM fillintheblank where T_ID = ?",tid, function (err, result, fields) {
                        if (err){           
                            console.log(err);
                            res.status(500);
                            res.send({ success: false, message: err.sqlMessage});
                        }
                        else{
                        
                            finalResult.fitb = result;
                            res.send({ success: true, result: finalResult});
                        }  
                    });  
                }  
            });  
            }  
        });   
        }  
    });
  
    
    
   
});
app.post('/getResponse',csrfProtection, async function(request, res) {   
        tid = request.body.tid;
        sid = parseInt(request.body.sid);
        var finalResult = {};
        fitbid = request.body.fitbid;
        mcqid = request.body.mcqid;
        descid = request.body.descid;
       
       
        pool.query("SELECT * FROM fitb_resp where S_ID = ? and Q_ID in  (?)",[sid,fitbid], function (err, result, fields) {
            if (err){           
                console.log(this.sql);
                res.status(500);
                res.send({ success: false, message: err.sqlMessage});
            }
            else{
                
               finalResult.fitb = result;
                
                   pool.query("SELECT * FROM mcq_resp where S_ID = ? and Q_ID in  (?)",[sid,mcqid], function (err, result, fields) {
                    if (err){           
                        console.log(this.sql);
                        res.status(500);
                        res.send({ success: false, message: err.sqlMessage});
                    }
                    else{
                        
                        finalResult.mcq = result;
                        pool.query("SELECT * FROM desc_resp where S_ID = ? and Q_ID in (?)",[sid,descid], function (err, result, fields) {
                            if (err){           
                                console.log(this.sql);
                                res.status(500);
                                res.send({ success: false, message: err.sqlMessage});
                            }
                            else{
                            
                                finalResult.desc = result;
                                res.send({ success: true, result: finalResult});
                            }  
                        });  
                    }  
                });  
                }  
            });  
        });
      

app.post('/evalSubmit',csrfProtection, function(request, res) {
            var set = request.body;
            set.marks = parseFloat(set.marks);
            
            set.qid = parseInt(set.qid);
            set.sid = parseInt(set.sid);
           var type = set.type;
            if (type == 'fitb')
            pool.query("UPDATE fitb_resp set Marks_Awarded = ?,ins_eval = 1 where s_id = ? and q_id = ?",[set.marks,set.sid,set.qid], function (err, result, fields) {
                if (err){           
                    console.log(err);
                    res.status(500);
                    res.send({ success: false, message: err.sqlMessage});
                }
                else{
                
                    res.send({ success: true, result: result});
                    
                }  
            });
           else if (type == 'desc')
            pool.query("UPDATE desc_resp set Marks_Awarded = ?,ins_eval = 1 where s_id = ? and q_id = ?",[set.marks,set.sid,set.qid], function (err, result, fields) {
                if (err){           
                    console.log(err);
                    res.status(500);
                    res.send({ success: false, message: err.sqlMessage});
                }
                else{
                   
                    res.send({ success: true, result: result});
                    
                }  
            });
            else
         res.send({status:403});   
        });


app.post('/studentStatus',csrfProtection, function(request, res) {

     pool.query("SELECT * FROM lab_stu where lab_id = ?",request.body.lid, async function (err, result, fields) {
                if (err){
                    
                    console.log(err);
                    res.status(500);
                    res.send({ success: false, message: 'query error'});
                }
                else{
               //     fs.unlinkSync('message.txt');
                    res.send({success:true,result:result})

        }
     
})
})    

app.post('/resetStatus',csrfProtection, function(request, res) {

    pool.query("UPDATE lab_stu set status = 0 where s_id = ?",request.body.sid, async function (err, result, fields) {
               if (err){
                   
                   console.log(err);
                   res.status(500);
                   res.send({ success: false, message: 'query error'});
               }
               else{
              //     fs.unlinkSync('message.txt');
                   res.send({success:true})

       }
    
})
})  
app.listen(3000);


  

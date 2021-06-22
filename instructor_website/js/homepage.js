var fitbs,mcqs,descs,testd;
var testList;


if (sessionStorage['firstLogin']!=1){
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000
});

Toast.fire({
  type: 'success',
  title: 'Signed in successfully'
});}
sessionStorage['firstLogin'] = 1;
  
  function updateClock() {
    var now = new Date(); // current date
    var timeEle = document.getElementById("dat");   
    
    timeEle.innerHTML = now.toLocaleString("en-IN");

    
    setTimeout(updateClock, 1000);
}
 // initial call
 setTimeout(function(callback = updateClock){		 
	 document.getElementById("ins_name").innerHTML = "Hello " + localStorage["i_name"]; 
	 callback();},1000);
var testList;



function logout(){
	
  $.queryJSON('POST','/logout', {}, function(result) {
    //console.log(result);
    if (result.done == 1)
  { 
    window.location.href = "/";
  }
  else
      {
        Swal.fire({
        type: 'error',
        title: 'Unable to logout',
        text: 'Some error occured',
        footer: 'Please submit a bug report for details'
              });
      }    
  });
	
}

function errorMsg(err){
	
                Swal.fire({
  type: 'error',
  title: 'Some Error Occured',
  text: err.message,
  footer: 'Kindly contact your Administrator for details'
				});
throw err;	
}

function startTest(type){

  if (type == 1){
    $.queryJSON('POST','/toggleStatusQuery', {}, function(result) {
	testList = result.result;
	displayDialog(type);

  });
}
else
$.queryJSON('POST','/deleteTestQuery', {}, function(result) {
  testList = result.result;
  
	displayDialog(type);
	
  });
}

function displayDialog(type){
	var contHTML = "" ;
	if (testList.length == 0)
	{	if (type == 1)
		contHTML = "Oops no test is available. Kindly Create A New Test Before trying to toggle its status.";
		else
		contHTML = "No test available for deletion. Kindly Note that its possible to delete only those tests which have not been attempted yet by any student";	
		  Metro.dialog.create({
            title: "No Test Available",
            content: contHTML,
            actions: [
                {
                    caption: "Close",
                    cls: "js-dialog-close alert",
                    
                }
                
            ]
        });
	}
	else
	{
		for (i=0;i<testList.length;i++)
		{	if (type == 1){
      liveStatus = (testList[i].live == 1) ? "Make Not Live" : "Make Live";
	contHTML+= "<input type='radio' data-role='radio' data-caption= '"+ escapeHtml(testList[i].name) + " - "+ liveStatus + "' name = 'testRadio' value = " + testList[i].t_id +" ><br>";
    }
    else
  	contHTML+= "<input type='radio' data-role='radio' data-caption= '"+ escapeHtml(testList[i].name) + "' name = 'testRadio' value = " + testList[i].t_id +" ><br>";
  
		}	
	
	if (type == 1)
        Metro.dialog.create({
            title: "Please Select The Test you wish to change status of.",
            content: contHTML + "<br> You can only change live status of Tests created by you.",
            actions: [
                {
                    caption: "Change",
                    cls: "js-dialog-close alert",
                    onclick: function(){
	var tidn = $("input[name='testRadio']:checked").val();
  
  $.queryJSON('POST','/toggleStatus', {tidn}, function(result) {
      if (result.affectedRows == 1){
    Swal.fire({
      type: 'success',
      title: 'Updated successfully',
      text: 'The Test Live Status Has been updated successfully'
            });
  }
  else {

  errorMsg("Unknown Error Occured. Test Status not updated.")
    
  } 
	

});
					}
                },
                {
                    caption: "Cancel",
                    cls: "js-dialog-close"
                   
                }
            ]
        });
		
		else
			       Metro.dialog.create({
            title: "Please Select The Test That you want to Delete",
            content: contHTML + " <br> Only those tests can be deleted which have not been attempted yet",
            actions: [
                {
                    caption: "Delete",
                    cls: "js-dialog-close alert",
                    onclick: function(){
	var tidn = $("input[name='testRadio']:checked").val();
  
  $.queryJSON('POST','/deleteTest', {tidn}, function(result) {
    if (result.affectedRows == 1){
  Swal.fire({
    type: 'success',
    title: 'Deleted successfully',
    text: 'The Test Has been deleted successfully'
          });
}
else {

errorMsg("Unknown Error Occured. Test not deleted.")
  
} 


});
					}
                },
                {
                    caption: "Cancel",
                    cls: "js-dialog-close"
                   
                }
            ]
        });
} }

function getLabList(){
var labd;		
$.queryJSON('POST','/labList', {}, function(result){
					labd = result.result;
					if (labd.length > 0)
                {	contHTML = '<select id = "labRadio">';
					for (i=0;i<labd.length;i++)
					contHTML+=	'<option value = ' +  labd[i].Lab_ID +'>' + labd[i].Name + '</option>';
					contHTML+= '</select>';
					var tit;
				
						tit = "Please Select The Lab which you wish to Evaluate";
					
				       Swal.fire({
            title: tit,
            html: contHTML
            
        }).then((result) => {
          if (result.value) {
          
              sessionStorage["lab_id"] =  $('#labRadio').val();
     sessionStorage["lab_name"] = $('#labRadio option:selected').text();
             loadTestList();
  
          }
        });
				}
				else
					Swal.fire({
  type: 'warning',
  title: 'No Lab Assigned',
  text: 'Sorry No Lab Has been assigned to you yet',
  footer: 'Kindly contact your Administrator for details'
				});
				}); 
	
	
}

function loadTestList(){
	
  $.queryJSON('POST','/testList', {'lab_id':sessionStorage["lab_id"]}, function(result){
					testd = result.result;
				
					if (testd.length > 0)
                {	contHTML = '<select id = "testRadio">';
					for (i=0;i<testd.length;i++)
					contHTML+=	'<option value = ' +  testd[i].T_ID +'>' + testd[i].Name + '</option>';
					contHTML+= '</select>';
			
						tit = "Please Select The Test that you wish to evaluate";
            Swal.fire({
              title: tit,
              html: contHTML
              
          }).then((result) => {
            if (result.value) {
            
              sessionStorage["t_id"] = $('#testRadio').val();
              sessionStorage["t_name"] = $('#testRadio option:selected').text();
            
             window.location.href = 'result';
    
            }
          });
            
				}
				else
				Swal.fire({
  type: 'warning',
  title: 'No Test Created Yet',
  text: 'No Test has been created yet for the selected lab',
  footer: 'Kindly create a Test first'
				});
				});
	
	
	
}


function getLabList2(){
  var labd;		
  $.queryJSON('POST','/labList', {}, function(result){
            labd = result.result;
            if (labd.length > 0)
                  {	contHTML = '<select id = "labRadio">';
            for (i=0;i<labd.length;i++)
            contHTML+=	'<option value = ' +  labd[i].Lab_ID +'>' + labd[i].Name + '</option>';
            contHTML+= '</select>';
            var tit;
          
              tit = "Please Select The Lab for which you wish to see student status";
            
                 Swal.fire({
              title: tit,
              html: contHTML
              
          }).then((result) => {
            if (result.value) {
            
                sessionStorage["lab_id"] =  $('#labRadio').val();
       sessionStorage["lab_name"] = $('#labRadio option:selected').text();
       window.location.href = 'viewStatus'; 
    
            }
          });
          }
          else
            Swal.fire({
    type: 'warning',
    title: 'No Lab Assigned',
    text: 'Sorry No Lab Has been assigned to you yet',
    footer: 'Kindly contact your Administrator for details'
          });
          }); 
    
    
  }



	sessionStorage.removeItem("lab_id");
	sessionStorage.removeItem("lab_name");
	sessionStorage.removeItem("t_id");
	sessionStorage.removeItem("t_name");
  
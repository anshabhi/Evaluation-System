function fetchBatch(){



	$.queryJSON('POST','/getBatch', {}, function(result){
		result = result.result;
					if (result.length>0){
				tabEle = "<table class='table cell-12' data-role='table' id = 'resTable'> <thead><tr><th data-sortable='true'>SR. NO</th><th data-sortable='true'>Branch Name</th><th data-sortable='true'>Semester</th><th data-sortable='true'>Graduation Year</th><th data-sortable='true'>Section</th><th data-sortable='true'>Batch</th><th data-sortable='true'>Roll No</th></thead><tfoot></tfoot><tbody>"
	
	for (i=0; i<result.length;i++)
	   {
	var resEle = result[i];
tabEle+= "<tr><td>" + (i+1) + "</td><td>" + resEle.Branch_Name + "</td><td>"+ resEle.Semester +"</td><td>" + resEle.Grad_Year + "</td><td>" + resEle.Section +"</td><td>" + resEle.Batch_No +"</td><td>" + resEle.Roll_No +"</td></tr>"  ;
	   }tabEle+= "</tbody></table>";
	 
	
				$("#subTable").html(tabEle);
					}
 else{
	 
	 tabEle = "<h4> You have not yet registered for any batch</h4>";
	 $("#subTable").html(tabEle);
 }
					}); 

 }
 
 function regCheck(form){

 
	batchid = form.batch.value;
	roll_no = form.rno.value;
  
			  set = [parseInt(sessionStorage["s_id"]),parseInt(batchid),parseInt(roll_no)];
			  $.queryJSON('POST','/regBatch', set, function(result) { 
				if (result.code == 'ER_DUP_ENTRY')
						Swal.fire({
  type: 'warning',
  title: 'Already Registered',
  text: 'You have already registered for the selected Batch',
  footer: 'Tip: Use You can see on this page the Batches already registered'
				});
				else if (result.code == 'ER_SP_BAD_VAR_SHADOW')
				{Swal.fire({
  type: 'error',
  title: 'Invalid Entry',
  text: 'The Batch ID Provided is invalid',
  footer: 'Tip: Contact Your Instructor for the Correct details'
				});}
				else{							
	if (result.affectedRows == 2){
					 Swal.fire({
  type: 'success',
  title: 'Registered Successfully',
  text: 'You have successfully registered for the selected Batch'
				}).then((value) => {
  window.location.reload();
});
				
                    }}
	     
           
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
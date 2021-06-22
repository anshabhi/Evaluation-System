function registerInst(form){

i_name = form['ins_name'].value;
i_empid = form['emp_id'].value;
i_email = form['email'].value;
i_pwd = form['ins_password'].value;
i_ques = form['question'].value;
i_ans = form['answer'].value;
i_dept = form['department'].value;

set = {NAME:i_name,EMAIL:i_email,PASSWORD:i_pwd,SEC_Q:i_ques,SEC_A:i_ans,EMP_ID:i_empid, Dept_ID:i_dept};

   
$.queryJSON('POST','/register', {'set':set}, function(result) {
  if (result.affectedRows == 1)
  Swal.fire({
  type: 'success',
  title: 'Account Created Successfully',
  text: 'Please Proceed With Login.',
  footer: 'Your account might optionally need further verification from admin'
				}).then((result) => {
  if (result.value) {
    window.location.href = "/";
  }
});
  else
  errorMsg(result.message);

  });
}

function errorMsg(err){
                Swal.fire({
  type: 'error',
  title: 'Some Error Occured',
  text: err,
  footer: 'Kindly contact your Administrator for details'
				});
	
}
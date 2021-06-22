function registerStudent(form){

s_name = form['stu_name'].value;
s_regno = form['reg_no'].value;
s_email = form['student_email'].value;
s_pwd = form['student_password'].value;
s_ques = form['student_question'].value;
s_ans = form['student_answer'].value;


set = {NAME:s_name,EMAIL:s_email,PASSWORD:s_pwd,SEC_Q:s_ques,SEC_A:s_ans,Reg_No:s_regno };

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
  text: err.message,
  footer: 'Kindly contact your Administrator for details'
				});
throw err;	
}
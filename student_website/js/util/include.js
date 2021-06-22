function retry(isDone, next) {
    var current_trial = 0, max_retry = 50, interval = 10, is_timeout = false;
    var id = window.setInterval(
        function() {
            if (isDone()) {
                window.clearInterval(id);
                next(is_timeout);
            }
            if (current_trial++ > max_retry) {
                window.clearInterval(id);
                is_timeout = true;
                next(is_timeout);
            }
        },
        10
    );
}

function isIE10OrLater(user_agent) {
    var ua = user_agent.toLowerCase();
    if (ua.indexOf('msie') === 0 && ua.indexOf('trident') === 0) {
        return false;
    }
    var match = /(?:msie|rv:)\s?([\d\.]+)/.exec(ua);
    if (match && parseInt(match[1], 10) >= 10) {
        return true;
    }
    return false;
}

function detectPrivateMode(callback) {
    var is_private;

    if (window.webkitRequestFileSystem) {
        window.webkitRequestFileSystem(
            window.TEMPORARY, 1,
            function() {
                is_private = false;
            },
            function(e) {
                console.log(e);
                is_private = true;
            }
        );
    } else if (window.indexedDB && /Firefox/.test(window.navigator.userAgent)) {
        var db;
        try {
            db = window.indexedDB.open('test');
        } catch(e) {
            is_private = true;
        }

        if (typeof is_private === 'undefined') {
            retry(
                function isDone() {
                    return db.readyState === 'done' ? true : false;
                },
                function next(is_timeout) {
                    if (!is_timeout) {
                        is_private = db.result ? false : true;
                    }
                }
            );
        }
    } else if (isIE10OrLater(window.navigator.userAgent)) {
        is_private = false;
        try {
            if (!window.indexedDB) {
                is_private = true;
            }                 
        } catch (e) {
            is_private = true;
        }
    } else if (window.localStorage && /Safari/.test(window.navigator.userAgent)) {
        try {
            window.localStorage.setItem('test', 1);
        } catch(e) {
            is_private = true;
        }

        if (typeof is_private === 'undefined') {
            is_private = false;
            window.localStorage.removeItem('test');
        }
    }

    retry(
        function isDone() {
            return typeof is_private !== 'undefined' ? true : false;
        },
        function next(is_timeout) {
            callback(is_private);
        }
    );
}
detectPrivateMode(
	function(is_private) {
		 typeof is_private === 'undefined' ? writeP('und') : is_private ? writeP('private') : '';
	}
);
function writeP(err){

//document.write("Please open this website in private / incognito mode, in a modern browser")

}
$('body').append($('<div/>', {
  id: 'loadingDiv',
  class: 'popup',
  html: "<img src = '/js/util/ajax-loader.gif' alt = 'loading please wait'>"  
}));
var $loading = $('#loadingDiv').hide();
$(document)
  .ajaxStart(function () {
    $loading.show();
  })
  .ajaxStop(function () {
    $loading.hide();
  });
/*
  var elem = document.documentElement;

   //View in fullscreen 
  /*function openFullscreen() {
	 // console.log(window.innerWidth == screen.width && window.innerHeight == screen.height)
	if (!(window.innerWidth == screen.width && window.innerHeight == screen.height)){
	if (elem.requestFullscreen) {
	
	  elem.requestFullscreen();
	} else if (elem.mozRequestFullScreen) { // Firefox 
		if (!document.FullScreen)
		elem.mozRequestFullScreen();
	} else if (elem.webkitRequestFullscreen) { // Chrome, Safari and Opera 
	  elem.webkitRequestFullscreen();
	} else if (elem.msRequestFullscreen) { // IE/Edge 
	  elem.msRequestFullscreen();
	}
  }
}
  if (document.addEventListener)
  {
   document.addEventListener('fullscreenchange', exitHandler, false);
   document.addEventListener('mozfullscreenchange', exitHandler, false);
   document.addEventListener('MSFullscreenChange', exitHandler, false);
   document.addEventListener('webkitfullscreenchange', exitHandler, false);
  }
  
  function exitHandler()
  {
   if ( !(document.webkitIsFullScreen && !document.mozFullScreen) && !(!document.webkitIsFullScreen && document.mozFullScreen))
   {
	Swal.fire({
        type: 'error', 
        title: 'Enter Full Screen',
        text: 'Please enter full screen again to continue',
        footer: 'Exiting Full Screen while browsing this application is considered as malpractice.'
              });// Run code on exit
   }
   else 
   {

   }
  }*/
$.queryJSON = function(type,url, data, callback) {
  //console.log(localStorage["tokenCSRF"])
    return jQuery.ajax({
    headers: { 
        'Accept': 'application/json',
        'Content-Type': 'application/json',
		'CSRF-Token': sessionStorage["tokenCSRF"]
    },
    'type': type,
    'url': url,
    'data': JSON.stringify(data),
    'dataType': 'json',
    'success': callback,
    
    'error': function(jqXHR) {
	
     Swal.fire({
        type: 'error', 
        title: jqXHR.status,
        text: jqXHR.statusText,
        footer: 'Please try again later or contact your admin for details'
			  }); 
            } 
            });
   }

   $(window).on('mouseover', (function () {
    window.onbeforeunload = null;
}));
$(window).on('mouseout', (function () {
    window.onbeforeunload = ConfirmLeave;
}));  
   function ConfirmLeave() {
	// Cancel the event
	

	$.queryJSON('POST','/logout', {}, function(result) {
	  //console.log(result);
	  if (result.done == 1)
	{ 
	  //window.location.href = "/";
	}
	else
		{
		  Swal.fire({
		  type: 'error',
		  title: 'Unable to logout',
		  text: 'Some error occured',
		  footer: 'Please notify your admin.'
				});
		}    
	});
	  
  
}
var prevKey="";
$(document).keydown(function (e) {            
/* if (e.key=="F5") {
	window.onbeforeunload = ConfirmLeave;
} */
 if (e.altKey && e.keyCode==115) {                
	window.onbeforeunload = ConfirmLeave;   
}
/* else if (e.key.toUpperCase() == "R" && prevKey == "CONTROL") {
	window.onbeforeunload = ConfirmLeave;
}*/
else if (e.key.toUpperCase() == "F4" && (prevKey == "ALT" || prevKey == "CONTROL")) {
	window.onbeforeunload = ConfirmLeave;
}
prevKey = e.key.toUpperCase();
});

function escapeHtml(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
 }
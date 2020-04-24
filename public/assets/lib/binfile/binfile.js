// Binary File Loader from 
// http://miskun.com/javascript/binary-file-loading-in-javascript/

KERNELSIZE = 3200936;

function updateProgress(e) {
    postMessage({"type": "p", "d": e.loaded/KERNELSIZE});
}


function GetBinaryFile(strURL, fnCallback, filesList, bBypassCache) {
    var XMLHttp = null;
	var XMLHttpStateChanged = function() {
		if (XMLHttp.readyState == 4) {
			var objResponse = {};
			if (XMLHttp.status == "304" || XMLHttp.status == "200" || 
				XMLHttp.status == "206" || XMLHttp.status == "0") {
				objResponse.Content = 
					typeof XMLHttp.responseBody == 'unknown' ? 
					XMLHttp.responseBody : 
					XMLHttp.responseText;
				objResponse.HTTPStatus = 
					XMLHttp.status;
				objResponse.ContentLength = 
					XMLHttp.getResponseHeader("Content-Length");
				objResponse.ContentType = 
					XMLHttp.getResponseHeader("Content-Type");
			}
			XMLHttp = null;
            // before passing strURL in as filename here, do a split on "/" and
            // grab the last element in the array (for example for /lib/riscv_compiled/pk)
            var lastElem = strURL.split("/");
            lastElem = lastElem[lastElem.length-1];
			fnCallback(objResponse.Content, lastElem, filesList);
		}
	}
 
	if (XMLHttpRequest) {
		XMLHttp = new XMLHttpRequest();
	} else if (ActiveXObject) {
		try {
			XMLHttp = new ActiveXObject('MSXML2.XMLHttp.3.0');
		} catch(ex) {
			XMLHttp = null;
		}
	}
 
	if (XMLHttp) {
		if (fnCallback) {
			if (typeof(XMLHttp.onload) != 'undefined') {
				XMLHttp.onload = XMLHttpStateChanged;
			} else {
				XMLHttp.onreadystatechange = XMLHttpStateChanged;
			}
		}


        XMLHttp.onprogress=updateProgress;


		XMLHttp.open("GET", strURL, true);
 
		if (XMLHttp.overrideMimeType) 
			XMLHttp.overrideMimeType('text/plain; charset=x-user-defined');
 
		if(typeof(bBypassCache) != 'undefined') {
			if (bBypassCache == true) 
				XMLHttp.setRequestHeader(
					'If-Modified-Since', 
					'Sat, 1 Jan 1970 00:00:00 GMT'
				);
		}
 
		XMLHttp.send(null);
	} else {
		if (fnCallback) fnCallback();
	}
}

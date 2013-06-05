// Binary File Loader from 
// http://miskun.com/javascript/binary-file-loading-in-javascript/


function GetBinaryFile(strURL, fnCallback, bBypassCache) {
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
			fnCallback(objResponse);
		}
	}
 
	if (window.XMLHttpRequest) {
		XMLHttp = new XMLHttpRequest();
	} else if (window.ActiveXObject) {
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

var MyCPD_WWM = MyCPD_WWM || {};
(function (self) {
    self.initRefreshFormDigest = function(){
        setInterval(function() {
            UpdateFormDigest(_spPageContextInfo.webServerRelativeUrl, _spFormDigestRefreshInterval);
            }, 5 * 60000);
    };
    self.getFileBufferAsArray = function(file){
        var deferred = $.Deferred();
        var reader = new FileReader();
        reader.onload = function (e) {
            deferred.resolve(reader.result);
        }
        reader.onerror = function (error) {
            console.error("MyCPD_WWM.common - getFileBufferAsArray");
            console.error(error);
            deferred.reject();
        }
        reader.readAsArrayBuffer(file);
        return deferred.promise();
    };
    self.XLSXSheetToArray = function(sheet){
        var result = [];
        var row;
        var rowNum;
        var colNum;
        var range = XLSX.utils.decode_range(sheet['!ref']);
        for(rowNum = range.s.r; rowNum <= range.e.r; rowNum++){
            row = [];
            for(colNum=range.s.c; colNum<=range.e.c; colNum++){
                var nextCell = sheet[
                    XLSX.utils.encode_cell({r: rowNum, c: colNum})
                ];
                if( typeof nextCell === 'undefined' ){
                    row.push(void 0);
                } else row.push(nextCell.w);
            }
            result.push(row);
        }
        return result;
    };
    self.getUserByFullEmail = function(email) {
        var defer = $.Deferred();
        $.ajax({
            url: _spPageContextInfo.webAbsoluteUrl + '/_api/web/ensureUser(%27' + encodeURIComponent(email) + '%27)',
            method: "POST",
            headers: {
                "Accept": "application/json;odata=verbose",
                "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                "content-type": "application/json;odata=verbose"
            },	        
            success: function (data) {
                // var entity = {
                //     'name':data.d.Title,
                //     'email':data.d.Email!=undefined&&data.d.Email!=""?data.d.Email:data.d.UserPrincipalName
                // };
                var entity = {
                    'name':data.d.Title,
                    'email':data.d.UserPrincipalName
                };
                return defer.resolve(entity);
            },
            error: function(msg){
                if(msg.responseText.toLowerCase().indexOf('could not be found')>-1||msg.responseText.toLowerCase().indexOf('est introuvable')>-1){
                    var entity = {
                        'name':undefined,
                        'email':undefined
                    };
                    return defer.resolve(entity);
                }
                else
                {
                    console.error("service-SP - getItems");
                    console.error(msg);
                    return defer.reject(msg);
                }
            }
        });
        return defer.promise();
    };
    self.validateEmail = function(email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    };
    self.sortByProperty = function(property) {
        var sortOrder = 1;
        if (property[0] === "-") {
            sortOrder = -1;
            property = property.substr(1);
        }
        return function (a, b) {
            var result = (a[property]() < b[property]()) ? -1 : (a[property]() > b[property]()) ? 1 : 0;
            return result * sortOrder;
        }
    };
})(MyCPD_WWM.common={});
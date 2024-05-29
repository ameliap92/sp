var MyCPD_WWM           = MyCPD_WWM || {};
var MyCPD_WWM_Services  = MyCPD_WWM_Services || {};
var MyCPD_WWM_Entities  = MyCPD_WWM_Entities || {};
MyCPD_WWM_Services.SP = function(){
    var self = this;
    self.getUsersGroup = function (groupName) {
        var defer = $.Deferred();
        var groupEndPoint = String.format("{0}/_api/web/sitegroups/GetByName('{1}')/Users", _spPageContextInfo.webAbsoluteUrl, groupName);
        $.ajax({
            url: groupEndPoint,
            method: "GET",
            headers: {
                "accept": "application/json;odata=verbose"
            },
            success: function (data) {
                var results = data.d.results;
                return defer.resolve(results);
            },
            error: function (msg) {
                console.error("service-SP - getUserGroup");
                console.error(msg);                  
                return defer.resolve([]);
            }
        });
        return defer.promise();
    };
    self.addUserToSPGroup = function(groupName, userEmail){
        var defer = $.Deferred();
        var clientContext = SP.ClientContext.get_current();
        var web = clientContext.get_web();
        var group = web.get_siteGroups().getByName(groupName);
        group.get_users().addUser(web.ensureUser(userEmail));
        group.update();
        clientContext.executeQueryAsync(function(){
            return defer.resolve();
        }, function(sender, arges) {
            console.error("Service.SP - addUserToSPGroup ");
            console.error(arges.get_message());
            return defer.reject('nok');
        }); 
        return defer.promise();
    };
    self.addUsersToSPGroup = function(groupName, userEmails){
        var defer = $.Deferred();
        var clientContext = SP.ClientContext.get_current();
        var web = clientContext.get_web();
        var group = web.get_siteGroups().getByName(groupName);
        userEmails.forEach(function(n){
            group.get_users().addUser(web.ensureUser(n));
        });
        group.update();
        clientContext.executeQueryAsync(function(){
            return defer.resolve();
        }, function(sender, arges) {
            console.error("Service.SP - addUserToSPGroup ");
            console.error(arges.get_message());
            return defer.reject('nok');
        }); 
        return defer.promise();
    };
    self.isUserValid = function(){
        var defer = $.Deferred();
        var clientContext = SP.ClientContext.get_current();
        var web = clientContext.get_web();
        web.ensureUser(n);
        clientContext.executeQueryAsync(function(){
            return defer.resolve(true);
        }, function(sender, arges) {
            return defer.resolve(false);
        });
        return defer.promise();
    }
    self.checkUserExistsInSPGroup = function(userEmail,groupName){
        var defer = $.Deferred();
        self.getUsersGroup(groupName).then(function(data){
            var isExist = false;
            if(data!=undefined&&data.length>0){
                var users = data.filter(function(n){
                    if(n.UserPrincipalName!=null && n.UserPrincipalName!=undefined){
                        return n.UserPrincipalName.toLowerCase()==userEmail.toLowerCase();
                    }
                    return false;
                });
                if(users.length>0){
                    isExist = true;
                }                    
            }
            return defer.resolve(isExist);
        }, function(){
            console.error("LorealJSService.Speakers - checkUserPermissions");
            return defer.reject()
        });
        return defer.promise();
    };
    self.removeUserFromGroup = function(userEmail, groupName){
        var defer = $.Deferred();
        self.getUserGroup(groupName).then(function(data){
            if(data.length>0){
                var _user = data.filter(function(n){
                    return n.Email.toLowerCase()==userEmail.toLowerCase();
                });
                if(_user.length>0){
                    var clientContext = SP.ClientContext.get_current();
                    var web = clientContext.get_web();
                    var group = web.get_siteGroups().getByName(groupName);
                    group.get_users().removeByLoginName(_user[0].LoginName);
                    group.update();
                    clientContext.executeQueryAsync(function(){
                        return defer.resolve();
                    }, function(sender, arges) {
                        console.error("Service.SP - removeUserFromGroup ");
                        console.error(arges.get_message());
                        return defer.reject('nok');
                    }); 
                }
                else
                {
                    return defer.resolve();
                }
            }
            else
            {
                return defer.resolve(); 
            }            
        }, function(){
            return defer.reject();
        })
        return defer.promise();
    };
    self.getCurrentUserGroups = function(){
        var defer = $.Deferred();
        var groupEndPoint = String.format("{0}/_api/web/currentuser/?$expand=groups", _spPageContextInfo.webAbsoluteUrl);
        $.ajax({
            url: groupEndPoint,
            method: "GET",
            headers: {
                "accept": "application/json;odata=verbose"
            },
            success: function (data) {
                var results = data.d.Groups.results;
                var groups = [];
                if(results!=null){
                    results.forEach(function(g){
                        var group = new MyCPD_WWM_Entities.Group({
                            'title'                 :g.Title,
                            'allowToEditMembership' :g.AllowMembersEditMembership,
                            'id'                    :g.Id
                        });
                        groups.push(group);
                    });
                }
                return defer.resolve(groups);
            },
            error: function (msg) {
                console.error("service-SP - getCurrentUserGroups");
                console.error(msg);                  
                return defer.resolve([]);
            }
        });
        return defer.promise();
    };
    self.getItems = function(listName, filter){
        var defer = $.Deferred();
        var itemCollectionEndPoint = "";
        if(filter){
            itemCollectionEndPoint = String.format("{0}/_api/web/lists/getbytitle('{1}')/items?$filter={2}&$top=5000",
                                        _spPageContextInfo.webAbsoluteUrl,
                                        listName,
                                        filter
                                    );
        }
        else
        {
            itemCollectionEndPoint = String.format("{0}/_api/web/lists/getbytitle('{1}')/items?$top=5000",
                                        _spPageContextInfo.webAbsoluteUrl,
                                        listName
                                    );
        } 
        $.ajax({
            url: itemCollectionEndPoint,
            method: "GET",
            headers: {
                "Accept": "application/json;odata=verbose",
                "X-RequestDigest": $("#__REQUESTDIGEST").val()
            },
            success: function (data) {
                var results = data.d?data.d.results:[];                
                return defer.resolve(results);
            },
            error: function(msg){
                console.error("service-SP - getItems");
                console.error(msg);
                return defer.reject(msg);
            }
        });
        return defer.promise();
    };   
    self.getFieldAsValueHTMLProperties = function(listName,itemID,properties){
        var defer = $.Deferred();

        var itemCollectionEndPoint = String.format("{0}/_api/web/lists/getbytitle('{1}')/items({2})/FieldValuesAsHtml?$select={3}",
                                        _spPageContextInfo.webAbsoluteUrl,
                                        listName,
                                        itemID,
                                        properties.join(',')
                                    );
        $.ajax({
            url: itemCollectionEndPoint,
            method: "GET",
            headers: {
                "Accept": "application/json;odata=verbose",
                "X-RequestDigest": $("#__REQUESTDIGEST").val()
            },
            success: function (data) {                
                var results = data.d?data.d:[];                
                return defer.resolve(results);
            },
            error: function(msg){
                console.error("service-SP - getItems");
                console.error(msg);
                return defer.reject(msg);
            }
        });
        return defer.promise();
    };
    self.createItem = function(listName, itemProperties){
        var defer = $.Deferred();        
        $.ajax({
            url: String.format("{0}/_api/web/lists/getbytitle('{1}')/items", _spPageContextInfo.webAbsoluteUrl,listName),
            type: "POST",
            contentType: "application/json;odata=verbose",
            data: JSON.stringify(itemProperties),
            headers: {
                    "Accept": "application/json;odata=verbose",
                    "X-RequestDigest": $("#__REQUESTDIGEST").val()
            },
            success: function (data) {
                defer.resolve(data.d.ID);    
            },
            error: function (msg) {
                console.error("service-SP - createItem");
                console.error(msg);
                defer.reject(msg);
            }
        });
        return defer.promise();
    };
    self.updateItem = function(listName,itemProperties,item){
        var defer = $.Deferred();
        $.ajax({
            url: String.format("{0}/_api/web/lists/getbytitle('{1}')/items({2})", _spPageContextInfo.webAbsoluteUrl,listName,item.id()),
            type: "POST",
            contentType: "application/json;odata=verbose",
            data: JSON.stringify(itemProperties),
            headers: {
                "Accept": "application/json;odata=verbose",
                "X-RequestDigest": $("#__REQUESTDIGEST").val(),
                "X-HTTP-Method": "MERGE",
                "IF-MATCH": "*",
                "content-type": "application/json;odata=verbose"
            },
            success: function() {
                defer.resolve(item);    
            },
            error: function (msg) {
                console.error("service-SP - updateItem");
                console.error(msg);
                defer.reject(msg);
            }
        });
        return defer.promise();
    };
    self.getPages = function(){
        var defer = $.Deferred();
        var clientContext = SP.ClientContext.get_current();
        var list = clientContext.get_web().get_lists().getByTitle('Pages');
        var items = list.getItems(SP.CamlQuery.createAllItemsQuery());
        clientContext.load(items,'Include(File,Title,Id)');
        clientContext.executeQueryAsync(function(){
            var listEnumerator = items.getEnumerator();            
            var thread = [];
            while (listEnumerator.moveNext()) {
                var oList = listEnumerator.get_current();               
                thread.push(loadFileInfo(oList));
            }
            $.when.apply($,thread).then(function(){
                var pages = [];
                for(var i=0;i<arguments.length;i++){
                    pages.push(arguments[i]);
                }
                return defer.resolve(pages);
            }, function(){
                return defer.reject();
            })
        }, function(sender, arges) {
            console.error(arges.get_message());
        }); 
        return defer.promise();

        function loadFileInfo(item){
            var deferItem = $.Deferred();
            var file = item.get_file();
            clientContext.load(file,'CheckedOutByUser');
            clientContext.executeQueryAsync(function(){
                var page = {                    
                    'id':item.get_id(),
                    'publish':file.get_level(),
                    'checkout':file.get_checkOutType(),
                    'checkoutBy':file.get_checkOutType()<2?file.get_checkedOutByUser().get_title():''
                }
                return deferItem.resolve(page);
            }, function(sender, arges) {
                console.error("Service.SP - loadFileInfo ");
                console.error(arges.get_message());
                return deferItem.reject('nok');
            }); 
            return deferItem.promise();
        }
    };
    self.getPublishingPageInfo = function(itemID){  
        var defer = $.Deferred();
        var clientContext = SP.ClientContext.get_current();
        var list = clientContext.get_web().get_lists().getByTitle('Pages');
        var item =  list.getItemById(itemID);
        clientContext.load(item,'File');
        clientContext.load(item,'Id');
        clientContext.executeQueryAsync(function(){
            loadFileInfo(item).then(function(n){
                return defer.resolve(n);
            },function() {
                return defer.reject();
            }); 
        }, function(sender, arges) {
            console.error(arges.get_message());
            return defer.reject();
        }); 
        return defer.promise();
        function loadFileInfo(item){
            var deferItem = $.Deferred();
            var file = item.get_file();
            clientContext.load(file,'CheckedOutByUser');
            clientContext.load(file,'CheckOutType');
            clientContext.executeQueryAsync(function(){
                var page = {                    
                    'id':item.get_id(),
                    'publish':file.get_level(),
                    'isPublished':file.get_level()!=SP.FileLevel.published?false:true,
                    'checkout':file.get_checkOutType(),
                    'isCheckOut':file.get_checkOutType()<2?true:false,
                    'checkoutBy':file.get_checkOutType()<2?file.get_checkedOutByUser().get_title():''
                }
                return deferItem.resolve(page);
            }, function(sender, arges) {
                console.error("Service.SP - loadFileInfo ");
                console.error(arges.get_message());
                return deferItem.reject('nok');
            }); 
            return deferItem.promise();
        }
    };
    self.updatePublishingPageProperties = function(itemID,props,isCheckedOut){
        var defer = $.Deferred();
        var clientContext = SP.ClientContext.get_current();
        var list = clientContext.get_web().get_lists().getByTitle('Pages');
        var item =  list.getItemById(itemID);
        var file = item.get_file();
        if(!isCheckedOut){file.checkOut();}
        clientContext.load(item);
        clientContext.load(file);
        clientContext.executeQueryAsync(function(){
            props.forEach(function(n){
                item.set_item(n.field,n.value);
            });
            item.update();
            item.get_file().checkIn('');
            item.get_file().publish('');
            clientContext.load(item);
            clientContext.executeQueryAsync(function(){
                return defer.resolve();
            }, function(sender, arges) {
                return defer.reject();
            }); 
        }, function(sender, arges) {
            console.error(arges.get_message());
            return defer.reject();
        }); 
        return defer.promise();
    };
    self.extractAllPages = function(){
        var defer = $.Deferred();
        var clientContext = SP.ClientContext.get_current();
        var list = clientContext.get_web().get_lists().getByTitle('Pages');
        var items = list.getItems(SP.CamlQuery.createAllItemsQuery());
        clientContext.load(items,'Include(File,Title,Id)');
        clientContext.executeQueryAsync(function(){
            var listEnumerator = items.getEnumerator();
            var thread = [];
            while (listEnumerator.moveNext()) {
                var oList = listEnumerator.get_current();               
                thread.push(extract(oList));
            }
            $.when.apply($,thread).then(function(){
                return defer.resolve();
            }, function(){
                return defer.reject();
            })
        }, function(sender, arges) {
            console.error(arges.get_message());
        }); 
        return defer.promise();

        function extract(item){
            var deferItem = $.Deferred();
            var file = item.get_file();
            clientContext.load(file,'CheckedOutByUser');
            clientContext.executeQueryAsync(function(){
                if(file.get_checkOutType()==2){
                    item.get_file().checkOut();
                    clientContext.load(item);
                    clientContext.executeQueryAsync(function(){
                        return deferItem.resolve();
                    }, function(sender, arges) {
                        return deferItem.reject();
                    }); 
                }                
                return deferItem.resolve();
            }, function(sender, arges) {
                console.error("Service.SP - loadFileInfo ");
                console.error(arges.get_message());
                return deferItem.reject('nok');
            }); 
            return deferItem.promise();
        }
    };
    self.publishAllPages = function(){
        var defer = $.Deferred();
        var clientContext = SP.ClientContext.get_current();
        var list = clientContext.get_web().get_lists().getByTitle('Pages');
        var items = list.getItems(SP.CamlQuery.createAllItemsQuery());
        clientContext.load(items,'Include(File,Title,Id)');
        clientContext.executeQueryAsync(function(){
            var listEnumerator = items.getEnumerator();            
            var thread = [];
            while (listEnumerator.moveNext()) {
                var oList = listEnumerator.get_current();
                thread.push(publish(oList));
            }
            $.when.apply($,thread).then(function(){               
                return defer.resolve();
            }, function(){
                return defer.reject();
            })
        }, function(sender, arges) {
            console.error(arges.get_message());
        }); 
        return defer.promise();

        function publish(item){
            var deferItem = $.Deferred();
            var file = item.get_file();
            clientContext.load(file,'CheckedOutByUser');
            clientContext.executeQueryAsync(function(){
                try{
                    var name = file.get_checkedOutByUser().get_title();
                    if(file.get_checkOutType()<2&&name.toLowerCase()==MyCPD_WWM.constants.main.currentUserName.toLowerCase()){
                        item.get_file().checkIn('');
                        item.get_file().publish('');
                        clientContext.load(item);
                        clientContext.executeQueryAsync(function(){
                            return deferItem.resolve();
                        }, function(sender, arges) {
                            return deferItem.reject();
                        }); 
                    }
                    else
                    {
                        return deferItem.resolve();
                    }
                }
                catch(err){
                    return deferItem.resolve();
                }
            }, function(sender, arges) {
                console.error("Service.SP - loadFileInfo ");
                console.error(arges.get_message());
                return deferItem.reject('nok');
            }); 
            return deferItem.promise();
        }
    };
}
var MyCPD_WWM_Entities = MyCPD_WWM_Entities || {};
var MyCPD_WWM_Services = MyCPD_WWM_Services || {};
var MyCPD_WWM = MyCPD_WWM || {};
MyCPD_WWM_Services.Users = function(){
    var self=this;
    self.SPService      = new MyCPD_WWM_Services.SP();
    self.listName       = MyCPD_WWM.constants.CGU_Users.listName;
    self.constantProps  = MyCPD_WWM.constants.CGU_Users;
    self.SPGroupUsers   = [];

    self.getUserInfoByEmail = function(email){
        var defer = $.Deferred();
        getUserInfoByEmail(email).then(function(data){
            return defer.resolve(data);
        }, function(){
            return defer.reject();
        })
        return defer.promise();
    };
    self.addCGUUser = function(entity){
        var defer = $.Deferred();
        addCGUUser(entity).then(function(){
            return defer.resolve();
        }, function(){
            return defer.reject();
        })
        return defer.promise();
    };
    self.isCurrentUserAdmin = function(){
        var defer = $.Deferred();
        isCurrentUserAdmin().then(function(isExist){
            return defer.resolve(isExist);
        }, function(){
            return defer.reject();
        });
        return defer.promise();
    };
    self.loadUsersExcelFile = function(file, SPGroup){
        var defer = $.Deferred();
        loadUsersExcelFile(file,SPGroup).then(function(data){
            return defer.resolve(data);
        }, function(){
            return defer.reject();
        });
        return defer.promise();
    };
    self.importUsers = function(users, groupName){
        var defer = $.Deferred();
        importUsers(users, groupName).then(function(data){            
            return defer.resolve(data);
        }, function(){
            return defer.reject();
        })
        return defer.promise();
    };
    self.getCurrentUserGroups = function(){
        var defer = $.Deferred();
        self.SPService.getCurrentUserGroups().then(function(data){
            return defer.resolve(data);
        }, function(){
            return defer.reject();
        });
        return defer.promise();
    };
    self.extractGroupUsers = function(groupName){
        extractGroupUsers(groupName);
    };
    function getUserInfoByEmail(email){
        var defer = $.Deferred();
        try{
            var filter = String.format("{0} eq '{1}'",self.constantProps.field_title,email.toLowerCase());
            self.SPService.getItems(self.listName,filter).then(function(data){
                var user = new MyCPD_WWM_Entities.User({
                    'email' : MyCPD_WWM.constants.main.currentUserMail,
                    'name'  : MyCPD_WWM.constants.main.currentUserName
                });
                if(data.length>0){
                    var spUser          = data[0];
                    var responseDate    = spUser[self.constantProps.field_date]?new Date(spUser[self.constantProps.field_date]):undefined;
                    user.responseDate(responseDate);
                    user.hasApproved(true);
                }
                return defer.resolve(user);
            }, function(){
                console.error("MyCPD_WWM_Services.Users - getUserInfoByEmail");
                return defer.reject();
            });
        }
        catch(err){
            console.error("MyCPD_WWM_Services.Users - getUserInfoByEmail");
            console.error(err);
            return defer.reject();
        }
        return defer.promise();        
    };
    function addCGUUser(entity){
        var defer = $.Deferred();
        try{
            var itemProperties = {   
                'Title'         : entity.email(),
                'ResponseDate'  : entity.responseDate()
            };
            var itemType = self.constantProps.itemTypeListName;
            itemProperties["__metadata"] = { "type": itemType };
            self.SPService.createItem(self.listName,itemProperties).then(function(){
                return defer.resolve();
            }, function(){
                console.error("MyCPD_WWM_Services.Users - addCGUUser");
                return defer.reject();
            });
        }
        catch(err){
            console.error("MyCPD_WWM_Services.Users - addCGUUser");
            console.error(err);
            return defer.reject();
        }
        return defer.promise();        
    };
    function isCurrentUserAdmin(){
        var defer = $.Deferred();
        try{
            self.SPService.checkUserExistsInSPGroup(MyCPD_WWM.constants.main.currentUserMail,MyCPD_WWMSettings.settings.WWM_Group_Admin).then(function(d){
                return defer.resolve(d);
            }, function(){
                return defer.reject();
            });
        }
        catch(err){
            console.error("MyCPD_WWM_Services.Users - isCurrentUserAdmin");
            console.error(err);
            return defer.reject();
        }
        return defer.promise();        
    };
    function loadUsersExcelFile(file,SPGroup){
        var defer = $.Deferred();
        try{
            MyCPD_WWM.common.getFileBufferAsArray(file).then(function(bufferAsArray){
                var workbook = XLSX.read(bufferAsArray, {type:"buffer"});
                var sheet1 = workbook.Sheets[workbook.SheetNames[0]];
                var dataSheet = MyCPD_WWM.common.XLSXSheetToArray(sheet1);
                var users = [];
                self.SPService.getUsersGroup(SPGroup).then(function(data){
                    self.SPGroupUsers = data;
                    for(var i=0;i<dataSheet.length;i++){
                        if(dataSheet[i][0]!=undefined&&dataSheet[i][0]!=""){
                            var email = dataSheet[i][0]!=undefined?dataSheet[i][0].trim():"N/A";
                            var user = new MyCPD_WWM_Entities.User({
                                'id'    : i,
                                'email' : email.replace("'","''")
                            });
                            users.push(user);
                            if(!MyCPD_WWM.common.validateEmail(email)){                                
                                user.name("Inconnu");
                                user.isValidEmail(false);
                                user.includeInImport(false);
                            }
                        }
                    }
                    var _users = chunkArray(users,300);
                    var i=0;
                    if(_users.length==0){return defer.resolve(users); }
                    getInfo(_users,0).then(function(){
                        return defer.resolve(users);
                    }, function(){
                        console.error("MyCPD_WWMService.Users - loadUsersExcelFile");
                        return defer.reject();
                    });
                }, function(){
                    console.error("MyCPD_WWMService.Users - loadUsersExcelFile - getUsersGroup");
                    return defer.reject();
                });
            }, function(){
                console.error("MyCPD_WWMService.Users - loadUsersExcelFile - getFileBufferAsArray");
                return defer.reject();
            }); 
        }
        catch(err){
            console.error("MyCPD_WWMService.Users - loadUsersExcelFile");
            console.error(err);
            return defer.reject();
        }
        finally{
            return defer.promise()
        }
        function getInfo(usersArray,index){
            var deferInfo = $.Deferred();
            var thread = [];
            usersArray[index].forEach(function(user){
                thread.push(loadUserInfo(user));
            });                             
            $.when.apply($,thread).then(function(){
                index++;
                if(usersArray[index]!=undefined){
                    setTimeout(function(){
                        getInfo(usersArray,index).then(function(){
                            return deferInfo.resolve();
                        });
                    },2000);
                }
                else{
                    return deferInfo.resolve();
                }                
            },function(){
                console.error("MyCPD_WWMService.Users - loadUsersExcelFile");
                return deferInfo.reject();
            });         
            return deferInfo.promise();
        }
        function loadUserInfo(user){
            var deferUser = $.Deferred();
            MyCPD_WWM.common.getUserByFullEmail(user.email()).then(function(data){
                if(data.email==undefined){
                    user.name("Inconnu");
                    user.isUnknown(true);
                    return deferUser.resolve();
                }
                else
                {
                    user.name(data.name);
                    user.email(data.email);
                    IsUserPresentInSPGroup(user);
                    return deferUser.resolve();
                    // IsUserPresentInSPGroup(user).then(function(){
                    //     return deferUser.resolve();
                    // }, function(){
                    //     return deferUser.reject();
                    // });
                }
                
            }, function(){
                console.error("MyCPD_WWMService.Users - loadUsersExcelFile - loadUserInfo");
                return deferUser.reject();
            });
            return deferUser.promise();
        }
        function IsUserPresentInSPGroup(user){
            var isExist = false;
            var users = self.SPGroupUsers.filter(function(n){
                if(n.UserPrincipalName!=null && n.UserPrincipalName!=undefined){
                    return n.UserPrincipalName.toLowerCase()==user.email().toLowerCase();
                }
                return false;
            });
            if(users.length>0){
                isExist = true;                
            }
            user.isInSPGroup(isExist);
            user.includeInImport(!isExist);
            // var deferGroup = $.Deferred();
            // self.SPService.checkUserExistsInSPGroup(user.email(),SPGroup).then(function(isExist){
            //     user.isInSPGroup(isExist);
            //     user.includeInImport(!isExist);
            //     return deferGroup.resolve();
            // }, function(){
            //     console.error("MyCPD_WWMService.Users - loadUsersExcelFile - IsUserPresentInSPGroup");
            //     return deferGroup.reject();
            // })
            // return deferGroup.promise();
        };
        function chunkArray(myArray, chunk_size){
            var index = 0;
            var arrayLength = myArray.length;
            var tempArray = [];            
            for (index = 0; index < arrayLength; index += chunk_size) {
                myChunk = myArray.slice(index, index+chunk_size);
                tempArray.push(myChunk);
            }        
            return tempArray;
        }
    };
    function importUsers(users, groupName){
        var defer = $.Deferred();
        try{
            var emails = [];
            var i=0;
            var thread = [];
            users.forEach(function(n){
                if(n.email()!=undefined && n.email()!=""){
                    emails.push(n.email());
                    i++;
                    if(i>=100){
                        thread.push(importListUsers(emails));
                        emails=[];
                        i=0;
                    }
                }
            });
            thread.push(importListUsers(emails));
            $.when.apply($,thread).then(function(){
                users.forEach(function(n){
                    n.isInSPGroup(true);
                    n.includeInImport(false);
                });
                return defer.resolve();
            }, function(){
                return defer.reject();
            })
        }
        catch(err){
            console.log("MyCPD_WWMService.Users - importUsers");
            console.log(err);
            return defer.reject();
        }
        finally{
            return defer.promise();
        }

        function importListUsers(emailsList){
            var deferUsers = $.Deferred();
            self.SPService.addUsersToSPGroup(groupName, emailsList).then(function(){                
                return deferUsers.resolve();
            }, function(){
                return deferUsers.reject();
            });
            return deferUsers.promise();
        }
        function chunkArray(myArray, chunk_size){
            var index = 0;
            var arrayLength = myArray.length;
            var tempArray = [];            
            for (index = 0; index < arrayLength; index += chunk_size) {
                myChunk = myArray.slice(index, index+chunk_size);
                tempArray.push(myChunk);
            }        
            return tempArray;
        }
    };
    function extractGroupUsers(groupName){
        try{
            self.SPService.getUsersGroup(groupName).then(function(data){
                var users = [];
                var csv = "Nom;Email;PrincipalName;\n";
                data.forEach(function(n){
                    var user = {
                        'name':ko.observable(n.Title),
                        'email':n.Email?ko.observable(n.Email):ko.observable("N/A"),
                        'principalName':ko.observable(n.UserPrincipalName)
                    };
                    users.push(user);
                });
                users = users.sort(MyCPD_WWM.common.sortByProperty('name'));
                users.forEach(function(n){
                    csv+=String.format("{0};{1};{2};\n",n.name(),n.email(),n.principalName());
                })
                if (navigator.appVersion.toString().indexOf('.NET') > 0) {
                    var csvData = new Blob(["\ufeff", csv], {encoding:"UTF-8", type: 'text/csv;charset=UTF-8;' });
                    var fileName = 'users.csv';
                    window.navigator.msSaveBlob(csvData, fileName);            
                }
                else { 
                    var csvData = new Blob([csv], { type: 'text/csv;charset=UTF-8;' });
                    var objectUrl = URL.createObjectURL(csvData);
                    var a = document.createElement("a");
                    a.style.display = "none";
                    a.href = objectUrl;
                    a.download = 'users.csv';
                    document.body.appendChild(a);
                    a.click();
                }
            }, function(){
                console.error('error');
            });
        }
        catch(err){
            console.error(err);
        }
    };
}
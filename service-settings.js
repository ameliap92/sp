var MyCPD_WWM_Services = MyCPD_WWM_Services || {};
MyCPD_WWM_Services.Settings = function(){
    var self = this;
    self.SPService = new MyCPD_WWM_Services.SP();
    self.isLoaded = false;
    self.listName = "Settings";
    self.settings = {};
    self.init = function(){
        var defer = $.Deferred();
        getAllSettings().then(function(){
            self.isLoaded = true;
            return defer.resolve();
        }, function(){
            console.error("MyCPD_WWM_Services.Settings - init");
            return defer.reject();
        });
        return defer.promise();
    };

    function getAllSettings(){
        var defer = $.Deferred();
        try{
            self.SPService.getItems(self.listName).then(function(data){
                for(var s=0;s<data.length;s++){
                    var item = data[s];
                    self.settings[item["Title"]] = item["SettingValue"];
                }
                return defer.resolve();
            }, function(){
                console.error("MyCPD_WWM_Services.Settings - getAllSettings");
                return defer.reject();
            });
        }
        catch(err){
            console.error("MyCPD_WWM_Services.Settings - getAllSettings");
            console.error(err);
            return defer.reject();
        }
        finally{
            return defer.promise()
        }
    };
    
    self.init();
};
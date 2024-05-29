
var MyCPD_WWM_Entities = MyCPD_WWM_Entities || {};
MyCPD_WWM_Entities.MessageEntity = function(data){
    var self = this;
    self.message = ko.observable(data.message);
    self.messageType = ko.observable(data.messageType);    
};

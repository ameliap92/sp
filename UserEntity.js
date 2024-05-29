var MyCPD_WWM_Entities = MyCPD_WWM_Entities || {};
MyCPD_WWM_Entities.User = function(data){
    var self            = this;  
    self.id             = ko.observable(data.id);
    self.name           = ko.observable(data.name||"");
    self.email          = ko.observable(data.email||"");
    self.responseDate   = ko.observable(data.responseDate||"");
    self.hasApproved    = ko.observable(false);
    self.firstName      = ko.observable(data.firstName);
    self.lastName       = ko.observable(data.lastName);
    self.isInSPGroup    = ko.observable(data.isInSPGroup||false);
    self.includeInImport = ko.observable(false);
    self.isValidEmail   = ko.observable(true);
    self.isUnknown      = ko.observable(false);
};
MyCPD_WWM_Entities.Group = function(data){
    var self = this;
    self.id                     = ko.observable(data.id);
    self.title                  = ko.observable(data.title);
    self.allowToEditMembership  = ko.observable(data.allowToEditMembership||false);
}

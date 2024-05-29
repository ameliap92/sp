var MyCPD_WWM_Entities = MyCPD_WWM_Entities || {};
var MyCPD_WWM_Services = MyCPD_WWM_Services || {};
MyCPD_WWM_Entities.Article = function(data){
    var self            = this;  
    self.id             = ko.observable(data.id);
    self.title          = ko.observable(data.title);
    self.date           = ko.observable(data.date);
    self.imageHTML      = ko.observable(data.imageHTML);
    self.slot           = ko.observable(data.slot);
    self.summary        = ko.observable(data.summary);
    self.descLine1      = ko.observable(data.descLine1||'');
    self.descLine2      = ko.observable(data.descLine2||'');
    self.isTestPage     = ko.observable(data.isTestPage||false);
    self.url            = ko.observable(data.url);
    self.brand          = ko.observable(data.brand);
    self.canalChatUrl   = ko.observable(data.canalChatUrl);
    self.isReplay       = ko.observable(data.isReplay||false);
    self.isCheckedOut   = ko.observable(false);
    self.isPublished    = ko.observable(false);
    self.target         = ko.observable('_self');
    self.videoUrl       = ko.observable(data.videoUrl);
    self.checkOutName   = ko.observable();
    self.isEditMode     = ko.observable(false);
    self.displayInPopup = ko.observable(false);
    

    self.imageUrl = ko.computed({
        read:function(){
            var imgUrl=undefined;
            if(self.imageHTML()){
                var src1 = self.imageHTML().split('src="');
                if(src1.length>1){
                    imgUrl = src1[1].split('"')[0]; 
                }
            }
            return imgUrl;
        },
        write:function(value){

        },
        owner:self
    });
    self.loadImageHTML = function(){
        var service = new MyCPD_WWM_Services.SP();
        service.getFieldAsValueHTMLProperties(MyCPD_WWM.constants.MyCPD_Pages.listName,self.id(),["PublishingRollupImage"]).then(function(data){
            self.imageHTML(data.PublishingRollupImage);
        }, function(){
            console.error("MyCPD_WWM_Entities.Article - loadImageHTML")
        });
    };
    self.displayDate = ko.computed({
        read:function(){
            var str="";
            if(self.date()){
                str = String.format("{0} {1} {2}th",self.date().format("dddd"),self.date().format("MMMM"),self.date().getDate());
            }
            return str;
        },
        owner:self
    });
    self.loadPageInfo = function(){
        var service = new MyCPD_WWM_Services.SP();
        service.getPublishingPageInfo(self.id()).then(function(data){
            self.isCheckedOut(data.isCheckOut);
            self.isPublished(data.isPublished);
            self.checkOutName(data.checkoutBy);
        }, function(){
            console.error("MyCPD_WWM_Entities.Article - loadImageHTML")
        })
    };
};
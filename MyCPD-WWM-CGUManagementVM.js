var MyCPD_WWM = MyCPD_WWM || {}
MyCPD_WWM.CGUManagementVM = function(){
    var self = this;
    self.MyCPD_WWM_Services_Users       = new MyCPD_WWM_Services.Users();
    self.message                        = ko.observable();
    self.messages                       = ko.observableArray([]);
    self.cguText                        = ko.observable();
    self.isCGUFormValidated             = ko.observable(false);
    self.isCGUPhotoFormValidated        = ko.observable(false);
    self.currentUserInfo                = ko.observable();
    
    self.init = function(){
        $.noConflict();
        loadModal().then(function(){            
            getUserInfo();       
        }, function(){
            showErrorMessage();
        });
    };
    function loadModal(){
        var defer = $.Deferred();
        var url = _spPageContextInfo.webServerRelativeUrl;
        var templatesUrl = String.format("{0}/style/html/view_wwm2020_modalTemplate.html",url);
        $.ajax({
            url : templatesUrl,
            success : function (data) {
                $( "#aspnetForm" ).append(data);
                return defer.resolve();
            },
            error: function(msg){
                console.error(msg);
                return defer.reject();
            }
        });
        return defer.promise();
    };
    function initModalControls(isExternal){
        $("#cgucontent").append(!isExternal?MyCPD_WWMSettings.settings.CGU_Text:MyCPD_WWMSettings.settings.CGU_Text_External);
        
        $("#cguCheckboxText").append(!isExternal?MyCPD_WWMSettings.settings.CGU_CheckboxText:MyCPD_WWMSettings.settings.CGU_External_CheckboxText);
        $("#cguPhotoCheckboxText").append(!isExternal?MyCPD_WWMSettings.settings.CGU_PhotoCheckboxText:MyCPD_WWMSettings.settings.CGU_External_PhotoCheckboxText);
        $("#cguapprove").change(function(){
            self.isCGUFormValidated(this.checked);
            validateForm();
        });
        $("#cguphoto").change(function(){
            self.isCGUPhotoFormValidated(this.checked);
            validateForm();
        });
        $("#cgusave").click(function(){
            saveCGU();
        });
    };    
    function validateForm(){
        if(self.isCGUFormValidated()&&self.isCGUPhotoFormValidated()){
            $("#cgusave").prop('disabled', false);
        }   
        else
        {
            $("#cgusave").prop('disabled', true);
        }
    };
    function getUserInfo(){
        self.MyCPD_WWM_Services_Users.getUserInfoByEmail(MyCPD_WWM.constants.main.currentUserMail).then(function(user){
            self.currentUserInfo(user);
            if(!user.hasApproved()){
                var externalEmails = MyCPD_WWMSettings.settings.CGU_External_Users.replace(/\s/g, '').toLowerCase();
                var isExternal = false;
                if(externalEmails.indexOf(MyCPD_WWM.constants.main.currentUserMail.toLowerCase())>-1){isExternal=true;}
                initModalControls(isExternal);
                showModal();
            }
        }, function(){
            showErrorMessage();
        });
    };
    function saveCGU(){
        self.currentUserInfo().responseDate(new Date());
        self.MyCPD_WWM_Services_Users.addCGUUser(self.currentUserInfo()).then(function(){
            $("#cgumodal").modal('hide');
        }, function(){
            showErrorMessage();
        });
    };
    function showModal(){
        $("#cgumodal").modal({
            show    : true,
            backdrop: 'static',
            keyboard: false
        });
        //remove web=1
        setTimeout(function(){
            var text = $("#cgucontent").html().replace("?web=1","");
            $("#cgucontent").html(text);
        }, 2000); 
    };
    function showMessage(message){
        resetMessages();
        var message = new MyCPD_WWM_Entities.MessageEntity({
            'message'       : message!=undefined?message:'Enregistrement des données effectué avec succès',
            'messageType'   : MyCPD_WWM.constants.main.messageType.Message
        });
        self.message(message);
        self.messages.push(message);
    };
    function showSuccessMessage(message){
        resetMessages();
        var message = new MyCPD_WWM_Entities.MessageEntity({
            'message'       : message!=undefined?message:'Enregistrement des données effectué avec succès',
            'messageType'   : MyCPD_WWM.constants.main.messageType.Success
        });
        self.message(message);
        self.messages.push(message);
        setTimeout(function(){
            resetMessages();
        }, 500);
    };
    function showWarningMessage(message){
        var message = new MyCPD_WWM_Entities.MessageEntity({
            'message'       : message!=undefined?message:'Warning',
            'messageType'   : MyCPD_WWM.constants.main.messageType.Warning
        });
        self.message(message);
        self.messages.push(message);
        setTimeout(function(){
            resetMessages();
        }, 2000);
    };
    function showErrorMessage(message){
        resetMessages();
        var message = new MyCPD_WWM_Entities.MessageEntity({
            'message'       : message!=undefined?message:'An error occured. Please contact your administrator',
            'messageType'   : MyCPD_WWM.constants.main.messageType.Error
        });
        self.message(message);
        self.messages.push(message);
        setTimeout(function(){
            resetMessages();
        }, 2000);
    };
    function resetMessages(){
        var messages = [];
        self.messages(messages);
    };
};
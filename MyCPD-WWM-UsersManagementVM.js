var MyCPD_WWM = MyCPD_WWM || {};
MyCPD_WWM.UserManagementVM = function(){
    var self = this;
    self.MyCPD_WWM_Services_Users       = new MyCPD_WWM_Services.Users();
    self.message                        = ko.observable();
    self.messages                       = ko.observableArray([]);
    self.usersFileInfo                  = ko.observable();
    self.availableGroups                = ko.observableArray([]);
    self.destinationGroup               = ko.observable();
    self.selectedPage                   = ko.observable('valid');

    self.init = function(){         
        getGroups();
        $('#usersmodal').on('hidden.bs.modal', function (e) {
            self.cancelImportProcess();
        });
    };
    self.uploadUsersFile = function(inputValue, data){
        if(inputValue.files.length>0){
            showMessage("Veuillez patienter pendant l'analyse des données");
            var file = inputValue.files[0];
            var parts = inputValue.value.split("\\");
            var filename = parts[parts.length - 1];     
            if(filename.indexOf('.xlsx')<0){
                showWarningMessage("Le fichier n'est pas au bon format. Veuillez sélectionner un fichier Excel");
                setTimeout(function(){
                    resetMessages();
                    self.cancelImportProcess();
                }, 2000);
            }
            else
            {
                loadDataFile(file).then(function(){                    
                    showSuccessMessage("Données chargées avec succès");
                    $('#MyCPD_WWM-users-file').val('');
                }, function(){
                    showErrorMessage("Une erreur est survenue pendant l'import des données. Veuillez contacter votre administrateur");
                    $('#MyCPD_WWM-users-file').val('');
                })
            }
        }
    };
    self.cancelImportProcess = function(){
        self.usersFileInfo(undefined);
        self.destinationGroup(undefined);
        $('#lorealJS-users-file').val('');
    };
    self.importUsers = function(){
        if(window.confirm(String.format("Vous êtes sur le point d'ajouter des utilisateurs au groupe {0}. Souhaitez-vous continuer ?",self.destinationGroup().title())))
        {
            showMessage("Démarrage de l'import des utilisateurs. Veuillez patienter");
            importUsers().then(function(){
                showSuccessMessage("Import des utilisateurs terminé avec succès");
            }, function(){
                showErrorMessage("Une erreur s'est produite lors de l'import des utilisateurs")
            });
        }  
    };
    self.validUsers = ko.computed(function(){
        return ko.utils.arrayFilter(self.usersFileInfo(), function (n) {
            return n.isValidEmail()==true&&n.isUnknown()==false;
        });
    });
    self.invalidUsers = ko.computed(function(){
        return ko.utils.arrayFilter(self.usersFileInfo(), function (n) {
            return n.isValidEmail()==false||n.isUnknown()==true;
        });
    });
    self.selectPage = function(page,obj){
        self.selectedPage(page);
    };
    self.displayModal = function(){
        $("#usersmodal").modal({
            show    : true
        });
    };
    self.resetForm = function(){
        self.usersFileInfo(undefined);
        $('#lorealJS-users-file').val('');
    };
    function loadDataFile(file){
        var defer =$.Deferred();
        self.MyCPD_WWM_Services_Users.loadUsersExcelFile(file,self.destinationGroup().title()).then(function(data){
            self.usersFileInfo(data);
            return defer.resolve();
        }, function(){
            return defer.reject();
        })
        return defer.promise();
    };
    function getGroups(){
        var defer = $.Deferred();
        self.MyCPD_WWM_Services_Users.getCurrentUserGroups().then(function(data){
            var _data = data.filter(function(n){
                return n.title().indexOf("WWM 2023")>-1;
            });
            var groups = _data.sort(MyCPD_WWM.common.sortByProperty("title"));
            self.availableGroups(groups);
            return defer.resolve();
        }, function(){
            showErrorMessage("Une erreur s'est produite lors du chargement des groupes utilisateurs")
            return defer.reject();
        });
        return defer.promise();
    };
    function importUsers(){
        var defer = $.Deferred();
        var users = self.usersFileInfo().filter(function(n){
            return n.includeInImport()==true;
        });
        self.MyCPD_WWM_Services_Users.importUsers(users, self.destinationGroup().title()).then(function(data){
            return defer.resolve();
        }, function(){            
            return defer.reject();
        });
        return defer.promise();
    };
    
    function showMessage(message){
        resetMessages();
        var message = new MyCPD_WWM_Entities.MessageEntity({
            'message'       : message!=undefined?message:'Please wait...',
            'messageType'   : MyCPD_WWM.constants.main.messageType.Message
        });
        self.message(message);
        self.messages.push(message);
    };
    function showSuccessMessage(message){
        resetMessages();
        var message = new MyCPD_WWM_Entities.MessageEntity({
            'message'       : message!=undefined?message:'Data saved successfully',
            'messageType'   : MyCPD_WWM.constants.main.messageType.Success
        });
        self.message(message);
        self.messages.push(message);
        setTimeout(function(){
            resetMessages();
        }, 2000);
    };
    function showWarningMessage(message){
        var message = new MyCPD_WWM_Entities.MessageEntity({
            'message'       : message!=undefined?message:'Warning...',
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
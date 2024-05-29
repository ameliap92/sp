var MyCPD_WWM = MyCPD_WWM || {}
var WWM_CGUManagementVM = WWM_CGUManagementVM || {};
var WWM_UsersManagementVM = WWM_UsersManagementVM || {};
MyCPD_WWM.ArticlesSummaryVM = function(data){
    var self = this;
    self.MyCPD_WWM_Services_ArticlePages= new MyCPD_WWM_Services.ArticlePages();
    self.MyCPD_WWM_Services_Users       = new MyCPD_WWM_Services.Users();
    WWM_CGUManagementVM                 = new MyCPD_WWM.CGUManagementVM();
    WWM_UsersManagementVM               = new MyCPD_WWM.UserManagementVM();
    WWM_WarningIEVM                     = new MyCPD_WWM.WarningIEVM();
    MyCPD_WWM_VideoModalVM              = new MyCPD_WWM.VideodModalVM();
    self.message                        = ko.observable();
    self.messages                       = ko.observableArray([]);
    self.articles                       = ko.observableArray([]);
    self.allArticles                    = ko.observableArray([]);
    self.isAdmin                        = ko.observable(false);
    self.isEditMode                     = ko.observable(false);
    self.isTest                         = ko.observable(data!=undefined?data.isTest:false||false);
    self.isModalLoaded                  = ko.observable(false);
    self.isForYouVisible                = ko.observable(true);
    self.isForAllVisible                = ko.observable(true);
    ko.bindingHandlers.toggleVisible = {
        init: function(element, valueAccessor) {
            var value = valueAccessor();
            $(element).toggle(ko.unwrap(value)); 
        },
        update: function(element, valueAccessor) {
            var value = valueAccessor();
            ko.unwrap(value) ? $(element).slideDown(300) : $(element).slideUp(300);
        }
    };
    self.init = function(){
        //WWM_CGUManagementVM.init();
        //loadWarningIEModal();   
        WWM_WarningIEVM.init();     
        loadData().then(function(){
            if(self.youArticles().length>0){
                self.isForAllVisible(false);
            }
            self.MyCPD_WWM_Services_Users.isCurrentUserAdmin().then(function(result){
                self.isAdmin(result);
                if(result){
                    loadUsersModal();
                }
            });
        });
        loadAssetModal();
    };
    self.youArticles = ko.computed(function(){
        var articles = [];
        self.articles().forEach(function(n){
            if(n.You!=undefined){
                n.You.articles.forEach(function(m){
                    articles.push(m);
                });
            }
        });
        return articles;
    });
    self.morningArticles = ko.computed(function(){
        var articles = [];
        self.articles().forEach(function(n){
            if(n.Morning!=undefined){
                n.Morning.articles.forEach(function(m){
                    articles.push(m);
                });
            }
        });
        return articles;
    });
    self.afternoonArticles = ko.computed(function(){
        var articles = [];
        self.articles().forEach(function(n){
            if(n.Afternoon!=undefined){
                n.Afternoon.articles.forEach(function(m){
                    articles.push(m);
                });
            }
        });
        return articles;
    });
    self.forAllArticles = ko.computed(function(){
        var articles = [];
        self.articles().forEach(function(n){
            if(n.All!=undefined){
                n.All.articles.forEach(function(m){
                    articles.push(m);
                });
                console.log(n.All)
            }
        });
        return articles;
    });
    self.displayUsersModal = function(){
        WWM_UsersManagementVM.displayModal();
    };
    self.editPages = function(){
        self.allArticles().forEach(function(n){
            if(n.isCheckedOut()==false){
                n.isEditMode(true);
            }
            else
            {
                if(n.checkOutName().toLowerCase()==MyCPD_WWM.constants.main.currentUserName.toLowerCase()){
                    n.isEditMode(true);
                }
            }
        });
        self.isEditMode(true);
    };
    self.savePages = function(){
        var thread = [];
        showMessage("Veuillez patienter...");
        var articles = self.allArticles().filter(function(n){
            return n.isEditMode()==true;
        });
        articles.forEach(function(n){
            thread.push(savePages(n));
        });
        $.when.apply($,thread).then(function(){
            self.isEditMode(false);
            showSuccessMessage();
        }, function(){
            showErrorMessage("Une erreur s'est produite pendant le processus de sauvegarde");
        });        
    };
    self.displayVideo = function(entity){
        MyCPD_WWM_VideoModalVM.displayModal(entity.videoUrl(),entity.isReplay());
    };
    self.displayForYouSection = function(){
        self.isForYouVisible(!self.isForYouVisible());
    };
    self.displayForAllSection = function(){
        self.isForAllVisible(!self.isForAllVisible());
    };
    function loadAssetModal(){
        var defer = $.Deferred();
        $("#aspnetForm").append('<div id="view_wwm_VideoModalTemplate_holder"></div>');
        var url = _spPageContextInfo.webServerRelativeUrl;
        var templatesUrl = String.format("{0}/style/html/view_wwm_modalVideo.html",url);
        $.ajax({
            url : templatesUrl,
            success : function (data) {
                $("#view_wwm_VideoModalTemplate_holder").html(data);
                ko.applyBindings(MyCPD_WWM_VideoModalVM,document.getElementById('view_wwm_VideoModalTemplate_holder'));
                self.isModalLoaded(true);
                MyCPD_WWM_VideoModalVM.init();
                return defer.resolve();
            },
            error: function(msg){
                console.error(msg);
                return defer.reject();
            }
        });
        return defer.promise();
    };
    function loadData(){
        var defer = $.Deferred();
        if(self.isTest()){
            self.MyCPD_WWM_Services_ArticlePages.getWWMTestArticles().then(function(data){
                var articles = data.sort(MyCPD_WWM.common.sortByProperty("date"));
                self.allArticles(articles);
                var items = [];
                articles.forEach(function(n){
                    var day;
                    var slot;
                    var _day = items.filter(function(d){
                        return d.date==n.displayDate();
                    });
                    if(_day.length==0){
                        day = {
                            'date':n.displayDate(),
                            'slots':[]
                        };
                        slot ={
                            'title':n.slot(),
                            'articles':[]
                        }; 
                        day[n.slot()] = slot;
                        if(n.slot().toLowerCase().indexOf("morning")>-1){
                            day["Afternoon"]={
                                'title':"Afternoon",
                                'subtitle':' (Click on the sessions below at the corresponding time)',
                                'articles':[]
                            }; 
                        }
                        else
                        {
                            day["Morning"]={
                                'title':"Morning",
                                'subtitle':' (Click on the sessions below at the corresponding time)',
                                'articles':[]
                            }; 
                        }
                        items.push(day);
                    }
                    else{
                        day =_day[0];                    
                        if(day[n.slot()]==undefined){
                            slot = {
                                'title':n.slot(),
                                'articles':[]
                            };
                            day[n.slot()] = slot;
                        }
                        else
                        {
                            slot = day[n.slot()];
                        }
                    }
                    slot.articles.push(n);
                });
                self.articles(items);
                return defer.resolve();
            }, function(){
                showErrorMessage();
                return defer.reject();
            });
        }
        else
        {
            self.MyCPD_WWM_Services_ArticlePages.getWWMArticles().then(function(data){
                var currentDate = new Date();
                var isMorning = currentDate.getHours()<=12;
                var isArticleDatePassed;
                var isDayPassed;
                var articles = data.sort(MyCPD_WWM.common.sortByProperty("date"));
                self.allArticles(articles);
                var items = [];
                articles.forEach(function(n){
                    var day;
                    var slot;
                    isArticleDatePassed = n.date()<=currentDate;
                    isCurrentArticleDate = n.date().format("dd/MM/yyyy")==currentDate.format("dd/MM/yyyy");
                    var _day = items.filter(function(d){
                        return d.date==n.displayDate();
                    });
                    if(_day.length==0){
                        day = {
                            'date':n.displayDate(),
                            'slots':[],
                            'isPassed':isArticleDatePassed&&!isCurrentArticleDate?true:false
                        };
                        var showsubtitle = false;
                        if(n.slot().toLowerCase().indexOf("morning")>-1){
                            var showsubtitle = false;
                            if(!isArticleDatePassed||(isCurrentArticleDate&&isMorning)){
                                showsubtitle=true;
                            }
                        }
                        else
                        {
                            var showsubtitle = false;
                            if(isCurrentArticleDate&&!isMorning||!isArticleDatePassed&&!isMorning||isCurrentArticleDate&&isMorning){
                                showsubtitle=true;  
                            }
                        }
                        slot ={
                            'title':n.slot(),
                            'subtitle':showsubtitle?' (Click on the sessions below at the corresponding time)':'',
                            'articles':[]
                        }; 
                        day[n.slot()] = slot;
                        if(n.slot().toLowerCase().indexOf("morning")>-1){
                            var showsubtitle = false;
                            //if(isCurrentArticleDate&&!isMorning||!isArticleDatePassed&&!isMorning||isCurrentArticleDate&&!isMorning){
                            if(!isArticleDatePassed){
                                showsubtitle=true;
                            }
                            day["Afternoon"]={
                                'title':"Afternoon",
                                'subtitle':showsubtitle?' (Click on the sessions below at the corresponding time)':'',
                                'articles':[]
                            };
                        }
                        else
                        {
                            var showsubtitle = false;
                            if(!isArticleDatePassed){
                                showsubtitle=true;
                            }
                            day["Morning"]={
                                'title':"Morning",
                                'subtitle':showsubtitle?' (Click on the sessions below at the corresponding time)':'',
                                'articles':[]
                            }; 
                        }
                        items.push(day);
                    }
                    else{
                        day =_day[0];                    
                        if(day[n.slot()]==undefined){
                            slot = {
                                'title':n.slot(),
                                'articles':[]
                            };
                            day[n.slot()] = slot;
                        }
                        else
                        {
                            slot = day[n.slot()];
                        }
                    }
                    slot.articles.push(n);
                });
                self.articles(items);
                return defer.resolve();
            }, function(){
                showErrorMessage();
                return defer.reject();
            });
        }        
        return defer.promise();
    };
    function loadUsersModal(){
        var defer = $.Deferred();
        $("#aspnetForm").append('<div id="wwm2020_usersManagement_template_holder"></div>');
        var url = _spPageContextInfo.webServerRelativeUrl;
        var templatesUrl = String.format("{0}/style/html/view_wwm2020_usersManagementTemplate.html",url);
        $.ajax({
            url : templatesUrl,
            success : function (data) {
                $("#wwm2020_usersManagement_template_holder").html(data);                        
                WWM_UsersManagementVM.init();
                ko.applyBindings(WWM_UsersManagementVM,document.getElementById('wwm2020_usersManagement_template_holder'));
                return defer.resolve();
            },
            error: function(msg){
                console.error(msg);
                return defer.reject();
            }
        });
        return defer.promise();
    };
    function loadWarningIEModal(){
        var defer = $.Deferred();
        $("#aspnetForm").append('<div id="wwm2020_warningIE_template_holder"></div>');
        var url = _spPageContextInfo.webServerRelativeUrl;
        var templatesUrl = String.format("{0}/style/html/view_wwm2020_modalWarningIETemplate.html",url);
        $.ajax({
            url : templatesUrl,
            success : function (data) {
                $("#wwm2020_warningIE_template_holder").html(data);                        
                WWM_WarningIEVM.init();
                ko.applyBindings(WWM_WarningIEVM,document.getElementById('wwm2020_warningIE_template_holder'));
                return defer.resolve();
            },
            error: function(msg){
                console.error(msg);
                return defer.reject();
            }
        });
        return defer.promise();
    };
    function savePages(entity){
        var defer = $.Deferred();
        self.MyCPD_WWM_Services_ArticlePages.updatePageProperties(entity).then(function(data){
            entity.isEditMode(false);
            return defer.resolve();
        },function(){
            return defer.reject();
        });
        return defer.promise();
    }
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
    
}
MyCPD_WWM.VideodModalVM = function(){
    var self = this;
    self.videoUrl = ko.observable();
    self.isReplay = ko.observable(false);

    self.init = function(){                
        $('#assetModal').on('hidden.bs.modal', function (e) {
            var element = document.getElementById("contentVideo");
            while (element.firstChild) {
                element.removeChild(element.firstChild);
            }
            self.videoUrl(undefined);
        }); 
        // $('#assetModal').on('shown.bs.modal', function (e) {            
        //     setTimeout(function(){ loadIframe(); }, 1000);
        // }); 
    };    
    self.displayModal = function(videoUrl,isReplay){
        self.videoUrl(videoUrl);
        self.isReplay(isReplay);
        loadIframe();
        setTimeout(function(){
            $("#assetModal").modal({
                show    : true
            });
        ; }, 500);
    }
    function loadIframe(){
        var container = document.createElement('iframe');
        container.id = "framecontent2";
        container.allowFullScreen="true"; 
        container.webkitallowfullscreen="true"; 
        container.mozallowfullscreen="true"; 
        container.setAttribute('allowFullScreen','true');
        container.setAttribute('webkitallowfullscreen','true');
        container.setAttribute('mozallowfullscreen','true');
        container.style=self.isReplay()?"width: 100%;height:92vh":"width: 100%;height:85vh"; 
        container.title="canalchat";
        container.src = self.videoUrl();
        $('#contentVideo').append(container);
        
    }
}
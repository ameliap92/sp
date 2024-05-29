var MyCPD_WWM = MyCPD_WWM || {}
MyCPD_WWM.WarningIEVM = function(){
    var self = this;
    self.currentUrl = ko.observable(document.location.href);
    
    self.copyURL = function(){
        var copyText = document.getElementById("mycpd_wwm2020_url");
        copyText.value = document.location.href;
        copyText.select();
        copyText.setSelectionRange(0, 99999); /*For mobile devices*/
        document.execCommand("copy");
    };

    self.init = function(){
        var ua = window.navigator.userAgent;
        var msie = ua.indexOf("MSIE "); 
        if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)){
        loadWarningIEModal().then(function(){                
            $('#warningIE').modal({
                show :true,
                backdrop:'static',
                backdropClass:'modal-backdrop-red'
            });
        }); 
    }       
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
}
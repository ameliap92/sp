var MyCPD_WWM_Entities = MyCPD_WWM_Entities || {};
var MyCPD_WWM_Services = MyCPD_WWM_Services || {};
var MyCPD_WWM = MyCPD_WWM || {};
MyCPD_WWM_Services.ArticlePages = function () {
    var self = this;
    self.SPService = new MyCPD_WWM_Services.SP();
    self.listName = MyCPD_WWM.constants.MyCPD_Pages.listName;
    self.constantProps = MyCPD_WWM.constants.MyCPD_Pages;

    self.getWWMArticles = function () {
        var defer = $.Deferred();
        getWWMArticles(false).then(function (data) {
            return defer.resolve(data);
        }, function () {
            return defer.reject();
        })
        return defer.promise();
    };
    self.getWWMTestArticles = function () {
        var defer = $.Deferred();
        getWWMTestArticles(true).then(function (data) {
            return defer.resolve(data);
        }, function () {
            return defer.reject();
        })
        return defer.promise();
    };
    self.updatePageProperties = function (entity) {
        var defer = $.Deferred();
        updatePageProperties(entity).then(function () {
            return defer.resolve();
        }, function () {
            return defer.reject();
        });
        return defer.promise();
    };

    function getWWMArticles() {
        var defer = $.Deferred();
        try {
            var filter = String.format("({0} eq 1 and {1} eq 0)&$select=Title,isTestPage,IsReplay,ArticleDisplayLine1,ArticleDisplayLine2,ID,CanalChatUrl,MyCPDDescription,ArticleStartDateTime,ArticleSlot,ArticleDescription,ArticleStartDate,MyCPDBrands,File,DisplayInSummary&$expand=File", self.constantProps.field_displayInSummary, self.constantProps.field_isTestPage);
            self.SPService.getItems(self.listName, filter).then(function (data) {
                var pages = [];
                data.forEach(function (n) {
                    var date = n[self.constantProps.field_articleDate] ? new Date(n[self.constantProps.field_articleDate]) : undefined;
                    var brand = n.MyCPDBrands.results.length > 0 ? n.MyCPDBrands.results[0].Label : undefined;
                    var page = new MyCPD_WWM_Entities.Article({
                        'id': n.ID,
                        'title': n.Title,
                        'date': date,
                        'slot': n[self.constantProps.field_articleSlot],
                        'brand': brand,
                        'url': n.File.ServerRelativeUrl,
                        'summary': n[self.constantProps.field_articleDesc],
                        'descLine1': n[self.constantProps.field_articleDisplayLine1],
                        'descLine2': n[self.constantProps.field_articleDisplayLine2],
                        'isTestPage': n[self.constantProps.field_isTestPage],
                        'canalChatUrl': n[self.constantProps.field_canalChatUrl],
                        'isReplay': n[self.constantProps.field_isReplay]
                    });
                    if (n[self.constantProps.field_canalChatUrl] != undefined && !page.isReplay()) {
                        page.target('_blank');
                        page.url(n[self.constantProps.field_canalChatUrl]);
                        page.videoUrl(n[self.constantProps.field_canalChatUrl]);                        
                        page.displayInPopup(true);
                    }
                    page.loadImageHTML();
                    page.loadPageInfo();
                    pages.push(page);
                });
                return defer.resolve(pages);
            }, function () {
                return defer.reject();
            });
        } catch (err) {
            console.error("MyCPD_WWM_Services.ArticlePages - getWWMArticles");
            console.error(err);
            return defer.reject();
        } finally {
            return defer.promise();
        }
    };

    function getWWMTestArticles() {
        var defer = $.Deferred();
        try {
            var filter = String.format("({0} eq 1 and {1} eq 1)&$select=Title,isTestPage,IsReplay,ArticleDisplayLine1,isReplay,ArticleDisplayLine2,ID,MyCPDDescription,ArticleStartDateTime,ArticleSlot,ArticleDescription,ArticleStartDate,MyCPDBrands,File,DisplayInSummary&$expand=File", self.constantProps.field_displayInSummary, self.constantProps.field_isTestPage);
            self.SPService.getItems(self.listName, filter).then(function (data) {
                var pages = [];
                data.forEach(function (n) {
                    var date = n[self.constantProps.field_articleDate] ? new Date(n[self.constantProps.field_articleDate]) : undefined;
                    var brand = n.MyCPDBrands.results.length > 0 ? n.MyCPDBrands.results[0].Label : undefined;
                    var page = new MyCPD_WWM_Entities.Article({
                        'id': n.ID,
                        'title': n.Title,
                        'date': date,
                        'slot': n[self.constantProps.field_articleSlot],
                        'brand': brand,
                        'url': n.File.ServerRelativeUrl,
                        'summary': n[self.constantProps.field_articleDesc],
                        'descLine1': n[self.constantProps.field_articleDisplayLine1],
                        'descLine2': n[self.constantProps.field_articleDisplayLine2],
                        'isTestPage': n[self.constantProps.field_isTestPage],
                        'isReplay': n[self.constantProps.field_isReplay]
                    });
                    page.loadImageHTML();
                    page.loadPageInfo();
                    pages.push(page);
                });
                return defer.resolve(pages);
            }, function () {
                return defer.reject();
            });
        } catch (err) {
            console.error("MyCPD_WWM_Services.ArticlePages - getWWMArticles");
            console.error(err);
            return defer.reject();
        } finally {
            return defer.promise();
        }
    };

    function updatePageProperties(entity) {
        var defer = $.Deferred();
        try {
            var props = [];
            props.push({
                'field': 'Title',
                'value': entity.title()
            });
            props.push({
                'field': 'ArticleDisplayLine1',
                'value': entity.descLine1()
            });
            props.push({
                'field': 'ArticleDisplayLine2',
                'value': entity.descLine2()
            });
            props.push({
                'field': 'IsReplay',
                'value': entity.isReplay()
            });
            self.SPService.updatePublishingPageProperties(entity.id(), props, entity.isCheckedOut()).then(function () {
                return defer.resolve();
            }, function () {
                return defer.reject();
            });
        } catch (err) {
            console.error("MyCPD_WWM_Services.ArticlePages - updatePageProperties");
            console.error(err);
            return defer.reject();
        } finally {
            return defer.promise();
        }
    };
}
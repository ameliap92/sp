var MyCPD_WWM = MyCPD_WWM || {};
(function (self) {
    'use strict';
    self.main = {
        siteUrl                         : _spPageContextInfo.webAbsoluteUrl,
        relativeUrl                     : _spPageContextInfo.webServerRelativeUrl, 
        messageType                     : Object.freeze({"Message":1, "Warning":2, "Error":3, "None":4, "Success":5}),
        currentUserName                 : _spPageContextInfo.userDisplayName,
        currentUserMail                 : _spPageContextInfo.userLoginName
    }
    self.Settings = {
        internalListName                : "Settings",  
        listName                        : "Settings",
        itemTypeListName                : "SP.Data.SettingsListItem",
        field_key                       : "Title",
        field_value                     : "SettingValue"
    };
    self.CGU_Users = {
        internalListName                : "CGUUsers",  
        listName                        : "CGU Users",
        itemTypeListName                : "SP.Data.CGUUsersListItem",
        field_title                     : "Title",
        field_date                      : "ResponseDate"
    };
    self.MyCPD_Pages = {
        internalListName                : "Pages",  
        listName                        : "Pages",
        itemTypeListName                : "SP.Data.PagesListItem",
        field_title                     : "Title",
        field_articleDate               : 'ArticleStartDateTime',
        field_articleSlot               : 'ArticleSlot',
        field_articleDesc               : 'MyCPDDescription',
        field_displayInSummary          : 'DisplayInSummary',
        field_articleDisplayLine1       : 'ArticleDisplayLine1',
        field_articleDisplayLine2       : 'ArticleDisplayLine2',
        field_isTestPage                : 'isTestPage',
        field_canalChatUrl              : 'CanalChatUrl',
        field_isReplay                  : 'IsReplay'
    }
})(MyCPD_WWM.constants={});
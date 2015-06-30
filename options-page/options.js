;(function ($, FolderManager) {
'use strict'

chrome.storage.local.get(null, function (setting) {
    FolderManager.init(setting)
})

var lastSaveTS = 0

$(document.body).on('click', save).on('keypress', save)
$(window).on('beforeunload', save)

function save () {
    if (Date.now() - lastSaveTS < 180) return
    lastSaveTS = Date.now()

    chrome.storage.local.set({
        'userJSEditor': FolderManager.pack('userJSEditor', 'user-script-item')
    })
}
})(window.jQuery, window.FolderManager);

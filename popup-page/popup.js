;(function (QRCode, FolderManager) {
'use strict'

var qrcode,
    ndQrcode = document.getElementById('qrcode'),
    ndNavUl = document.getElementById('ul')

chrome.storage.local.get(null, function (settingObj) {
    var nlTabs = [],
        setting = settingObj['userJSEditor']
    Object.keys(setting).forEach(function (key) {
        var item = setting[key]
        if (!item.enabled) return
        var ndTab = document.createElement('li')
        ndTab.dataset.transform = item.content
        ndTab.textContent = item.title
        nlTabs.push(ndTab)
    })

    nlTabs.forEach(function (ndTab) {
        ndNavUl.appendChild(ndTab)
        ndTab.addEventListener('click', function (e) {
            var ndTab = e.target,
                transform = ndTab.dataset.transform,
                url = ndQrcode.dataset.url
            setMainQrcode(eval('(' + transform + ')("' + url + '")'))
        })
    })
})

getCurrentTabAsync().then(function (tab) {
    var url = tab.url
    ndQrcode.dataset.url = url
    setMainQrcode(url)
})

function setMainQrcode (text) {
    var elt = ndQrcode
        , qrOption = {
            text: text,
            width: 150,
            height: 150
        }
    if (qrcode) {
        qrcode.clear()
        qrcode.makeCode(text)
    } else {
        qrcode = new QRCode(elt, qrOption)
    }
}

// https://developer.chrome.com/extensions/tabs#method-query
function getCurrentTabAsync () {
    return new Promise(function (resolve, reject) {
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, function (tabs) {
            if (!tabs.length)
                reject(new Error('No current active tabs found'))
            resolve(tabs[0])
        })
    })
}

})(window.QRCode, window.FolderManager);

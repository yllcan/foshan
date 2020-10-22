/* 工具方法类 */
var ctrip = (function () {
    var cUtil = {
        isInApp: function () {
            return !!navigator.userAgent.match(/ctripwireless/i)
        },
        isInWechat: function () {
            return !!navigator.userAgent.match(/micromessenger/i)
        },
        isCommonUrl: function (url) {
            if (!url) return false;
            const REG_COMMONURL = /^https:\/\/|^http:\/\/|^\/\/:/;
            return REG_COMMONURL.test(url.trim());
        },
    }

    function jump(urlObj, needFrom) {
        var obj = urlObj || {}
        var h5Url = obj.h5Url ? obj.h5Url.trim() : ''
        var appUrl = obj.appUrl ? obj.appUrl.trim() : ''
        var _from = encodeURIComponent(location.href)
        var isFrom = typeof needFrom !== 'undefined' ? needFrom : true
        if (cUtil.isInApp()) {
            var proUrl = appUrl || h5Url
            var mode = cUtil.isCommonUrl(proUrl) ? 2 : 1
            if (proUrl) {
                if (isFrom) {
                    proUrl = proUrl + (proUrl.indexOf('?') > -1 ? '&' : '?') + 'from=' + _from
                }
                CtripUtil.app_open_url(proUrl, mode);
            }
            return
        }
        if (h5Url) {
            if (isFrom) {
                h5Url = h5Url + (h5Url.indexOf('?') > -1 ? '&' : '?') + 'from=' + _from
            }
            window.location.href = h5Url
        }
    }

    function setTitle(title) {
        var navbarJson = {
            "center": [{
                "tagname": "title",
                "value": title
            }],
            "right": [{
                "tagname": "share",
                "value": "分享"
            }]
        };
        var str = JSON.stringify(navbarJson);
        LizardLite.HybridReady(function () {
            CtripBar.app_refresh_nav_bar(str);
        })

    }

    function setShare(shareData, success, fail) {
        var obj = {
            icon: shareData.icon || '',
            title: shareData.title || '',
            desc: shareData.desc || '',
            href: shareData.href || ''
        }

        if (cUtil.isInApp()) {
            LizardLite.HybridReady(function () {
                var dataList = [{
                    shareType: 'Default',
                    imageUrl: obj.icon,
                    title: obj.title,
                    text: obj.desc,
                    linkUrl: obj.href
                }]

                window.app.callback = function (params) {
                    var tagname = params.tagname
                    var methods = {
                        'share': function () {
                            CtripShare.app_call_custom_share(dataList)

                        },
                        'call_custom_share': function (params) {
                            if (!params.error_code) {
                                success && success()
                            } else {
                                params.error_code.match(/-20[12]/) && fail &&
                                fail();
                            }
                        }
                    }
                    if (typeof methods[tagname] === 'function') {
                        methods[tagname](params.param)
                    }
                }
            })

        } else if (cUtil.isInWechat()) {
            LizardLite.weixinReady(function (cShell) {
                var options = obj
                console.log(options);

                try {
                    cShell.share(options).done(function () {
                        console.log('share success');
                        success && success()
                    }).fail(function () {
                        console.log('share fail');
                        fail && fail()
                    })
                } catch (e) {
                    console.log(e);
                }
            })
        }
    }
    return {
        setTitle: setTitle,
        setShare: setShare,
        jump: jump
    }
})()

// Created by ExuDev with love, feel free to share, edit, and even commit to our gitHub :) 
// also, open new issues for feature requests!

var BeamExtendedInstance;
if (typeof BeamExtendedInstance != 'undefined') {
    BeamExtendedInstance.close();
}

BeamExtended = function() {
    var VERSION = '1.0.1';

    var twitchEmoteTemplate = '';
    var twitchEmotes = [];

    var customEmoteTemplate = '';
    var customEmotes = [];
    var customChannelEmotes = [];

    var roles = {};
    var colors = {};
    var colorWheel = [
        "#FFFF00",
        "#FF00FF",
        "#808000",
        "#00FFFF",
        "#008080",
        "#C0C0C0",
        "#00FF00",
        "#A90000",
        "#0000FF",
        "#808080",
        "#008000",
        "#BD00BD",
        "#ff7373",
        "#b6fcd5",
        "#ffa500",
        "#cbbeb5"
    ];
    var secondColors = {};

    var triggeredAlerts = [];

    var timeoutAlertChecker;
    var timeoutColorGetter;

    var styleChannel = 'style';

    var pathname = window.location.pathname;
    var channel = pathname.toLowerCase().replace("/", "");

    if (channel == 'ifstudios') {
        styleChannel = 'IFstyle';
    } else if ((channel == 'mindlesspuppetz') || (channel == 'siggy') || (channel == 'blackhawk120') || (channel == 'ziteseve') || (channel == 'squeaker') || (channel == 'akujitube') || (channel == 'artdude543') || (channel == 'lilmac21') || (channel == 'icanhascookie69') || (channel == 'cadillac_don')) {
        // Probably a better way to do this...
        styleChannel = 'tssnStyle';
    }

    var username = '';

    var Utils = {
        proxifyImage: function(url) {
            if (Utils.startsWithIgnoreCase(url, 'http://')) {
                return 'https://api.plugCubed.net/proxy/' + url;
            }
            return url;
        },
        getBaseURL: function(url) {
            return url.indexOf('#') > -1 ? url.substr(0, url.indexOf('#')) : (url.indexOf('?') > -1 ? url.substr(0, url.indexOf('?')) : url);
        },
        startsWith: function(a, b) {
            if (typeof a === 'string') {
                if (typeof b === 'string' && a.length >= b.length) {
                    return a.indexOf(b) === 0;
                } else if ($.isArray(b)) {
                    for (var c in b) {
                        if (!b.hasOwnProperty(c)) continue;
                        var d = b[c];
                        if (typeof d === 'string' && Utils.startsWith(a, d)) {
                            return true;
                        }
                    }
                }
            }
            return false;
        },
        startsWithIgnoreCase: function(a, b) {
            if (typeof a === 'string') {
                if (typeof b === 'string' && a.length >= b.length) {
                    return Utils.startsWith(a.toLowerCase(), b.toLowerCase());
                } else if ($.isArray(b)) {
                    for (var c in b) {
                        if (!b.hasOwnProperty(c)) continue;
                        var d = b[c];
                        if (typeof d === 'string' && Utils.startsWithIgnoreCase(a, d)) {
                            return true;
                        }
                    }
                }
            }
            return false;
        },
        endsWith: function(a, b) {
            if (typeof a === 'string') {
                if (typeof b === 'string' && a.length >= b.length) {
                    return a.lastIndexOf(b) === a.length - b.length;
                } else if ($.isArray(b)) {
                    for (var c in b) {
                        if (!b.hasOwnProperty(c)) continue;
                        var d = b[c];
                        if (typeof d === 'string' && Utils.endsWith(a, d)) {
                            return true;
                        }
                    }
                }
            }
            return false;
        },
        endsWithIgnoreCase: function(a, b) {
            if (typeof a === 'string') {
                if (typeof b === 'string' && a.length >= b.length) {
                    return Utils.endsWith(a.toLowerCase(), b.toLowerCase());
                } else if ($.isArray(b)) {
                    for (var c in b) {
                        if (!b.hasOwnProperty(c)) continue;
                        var d = b[c];
                        if (typeof d === 'string' && Utils.endsWithIgnoreCase(a, d)) {
                            return true;
                        }
                    }
                }
            }
            return false;
        }
    };

    //region Loading data
    $.getJSON('https://beam.pro/api/v1/users/current', function(data) {
        if (data.username != null) {
            username = data.username.toLowerCase();
        }
    });

    //region Roles
    $.getJSON('https://ec87d41a87dde68618f3f11fc9c3e4fde11820dc.googledrive.com/host/0B0aYi6iDIlBaSGxJNkFTeEhqMmM/config.json', function(data) {
        roles = data;
    });
    //endregion

    //This is a cookie loader for the GlobalUsernames - Which makes every user on beam have a color
    document.cookie.split(';').forEach(function(part) {
        if (part.trim().indexOf('BeXColors') === 0) {
            secondColors = JSON.parse(part.split('=')[1].trim());
        }
    });

    //region Chat Colors
    function getColors() {
        $.getJSON('https://ec87d41a87dde68618f3f11fc9c3e4fde11820dc.googledrive.com/host/0B0aYi6iDIlBaSGxJNkFTeEhqMmM/colors.json', function(data) {
            colors = data;
        });
        timeoutColorGetter = setTimeout(function() {
            getColors();
        }, 6e4);
    }
    getColors();
    //endregion

    //region Emotes
    $.getJSON('https://ec87d41a87dde68618f3f11fc9c3e4fde11820dc.googledrive.com/host/0B0aYi6iDIlBaSGxJNkFTeEhqMmM/emotes.json',
        /**
         * @param {{template: String, emotes: Object}} data
         */
        function(data) {
            customEmoteTemplate = data.template;
            customEmotes = data.emotes;
        });
    //endregion

    //region Twitch Emotes
    $.getJSON('https://api.plugcubed.net/twitchemotes',
        /**
         * @param {{
         *     template: {
         *         small: String
         *     },
         *     emotes: {
         *         image_id: Number
         *     }[]
         * }} data
         */
        function(data) {
            twitchEmoteTemplate = data.template.small;
            twitchEmotes = [];

            for (var i in data.emotes) {
                if (!data.emotes.hasOwnProperty(i)) continue;
                twitchEmotes.push({
                    emote: i,
                    image_id: data.emotes[i].image_id
                });
            }
        });
    //endregion

    //region Channel Emotes
    function onCustomChannelEmotesLoaded(emotes) {
        if (emotes != null) {
            customChannelEmotes = emotes;

            if (channel == 'exuviax') {
                $messages.append(
                    $('<div>')
                        .addClass('message')
                        .attr('data-role', 'ExuMessage').append(
                        $('<div>')
                            .addClass('message-body')
                            .html('Hey, I help create/maintain <a href="https://github.com/ExuDev/BeamExtended" target="_blank">Beam Extended</a> v' + VERSION + '!<br> To see all my channel emotes and bot commands, go <a href=\"http://beamalerts.com/bex/exuviax\" target=\"_blank\"> here</a>')
                    )
                );
            } else {

                var $message = $('<div>')
                    .addClass('message-body')
                    .html('<a href="https://github.com/ExuDev/BeamExtended" target="_blank">Beam Extended loaded</a> v' + VERSION + '<br><strong>This channel is using custom emotes!</strong><br> The emotes are: ');

                for (var i in emotes) {
                    if (!emotes.hasOwnProperty(i)) continue;
                    var emote = emotes[i];
                    $message.append($('<img title="' + emote.emote + '">').addClass('exu-emote').attr('src', customEmoteTemplate.split('{image_id}').join(emote.image_id).split('{image_ext}').join(emote.image_ext || 'png')).data('emote', $('<span>').html(emote.emote).text()));
                }

                $messages.append(
                    $('<div>')
                    .addClass('message')
                    .attr('data-role', 'ExuMessage').append(
                        $message
                    )
                );

            }
        } else {
            $messages.append(
                $('<div>')
                .addClass('message')
                .attr('data-role', 'ExuMessage').append(
                    $('<div>')
                    .addClass('message-body')
                    .html('<a href="https://github.com/ExuDev/BeamExtended" target="_blank">Beam Extended loaded</a> v' + VERSION + '<br>To set your custom colored username, please tweet <a href="http://ctt.ec/85332" target="_blank">@Exuviax</a><br> Request custom emotes for your channel <a href=\"http://beamalerts.com/bex/\" target=\"_blank\"> here</a>')
                )
            );
        }
    }

    $.getJSON('https://ec87d41a87dde68618f3f11fc9c3e4fde11820dc.googledrive.com/host/0B0aYi6iDIlBaSGxJNkFTeEhqMmM/ChannelEmotes/' + channel + '.json')
        .done(function(emotes) {
            onCustomChannelEmotesLoaded(emotes);
        })
        .fail(function() {
            onCustomChannelEmotesLoaded(null);
        });
    //endregion
    //endregion
    var $cssLink = $('<link rel="stylesheet" type="text/css" href="https://ec87d41a87dde68618f3f11fc9c3e4fde11820dc.googledrive.com/host/0B0aYi6iDIlBaSGxJNkFTeEhqMmM/' + styleChannel + '.css">');
    $('head').append($cssLink);

    function overrideMessageBody($messageBody) {
        // Replace image links with images
        if (bexoptions.linkimages == true) {
            $messageBody.find('a').each(function() {
                if (Utils.endsWithIgnoreCase(Utils.getBaseURL(this.href), ['.gif', '.jpg', '.jpeg', '.png', '.rif', '.tiff', '.bmp'])) {
                    var original = $('<div>').append($(this).clone()).html();

                    var $imgContainer = $('<div>').addClass('imgContainer').mouseover(function() {
                        $(this).find('.delete').show();
                    }).mouseout(function() {
                        $(this).find('.delete').hide();
                    });

                    $imgContainer.append($('<img>').attr('src', this.href));

                    $imgContainer.append($('<a>').addClass('open btn').text('Open').attr({
                        target: '_blank',
                        href: this.href
                    })).append($('<div>').addClass('remove btn').text('Remove').click(function() {
                        $imgContainer.replaceWith(original);
                    }));

                    $(this).replaceWith($imgContainer);
                }
            });
        }

        var messageBody = ' ' + $messageBody.html() + ' ';
        var oldMessageBody = messageBody;
        var emote, temp;

        // Replace Twitch Emotes (Global)
        if (bexoptions.twitchemotes == true) {
            for (var i in twitchEmotes) {
                if (!twitchEmotes.hasOwnProperty(i)) continue;
                emote = twitchEmotes[i];
                if (messageBody.indexOf(' ' + emote.emote + ' ') > -1 || messageBody.indexOf(':' + emote.emote + ':') > -1) {
                    temp = $('<div>').append($('<img title="' + emote.emote + '">').addClass('exu-emote').attr('src', twitchEmoteTemplate.split('{image_id}').join(emote.image_id)).data('emote', $('<span>').html(emote.emote).text()));
                    messageBody = messageBody.split(' ' + emote.emote + ' ').join(' ' + temp.html() + ' ');
                    messageBody = messageBody.split(':' + emote.emote + ':').join(temp.html());
                }
            }
        }

        // Replace Custom Emotes (Global)
        for (i in customEmotes) {
            if (!customEmotes.hasOwnProperty(i)) continue;
            emote = customEmotes[i];
            if (messageBody.indexOf(' ' + emote.emote + ' ') > -1 || messageBody.indexOf(':' + emote.emote + ':') > -1) {
                temp = $('<div>').append($('<img title="' + emote.emote + '">').addClass('exu-emote').attr('src', customEmoteTemplate.split('{image_id}').join(emote.image_id).split('{image_ext}').join(emote.image_ext || 'png')).data('emote', $('<span>').html(emote.emote).text()));
                messageBody = messageBody.split(' ' + emote.emote + ' ').join(' ' + temp.html() + ' ');
                messageBody = messageBody.split(':' + emote.emote + ':').join(temp.html());
            }
        }

        // Replace Custom Emotes (Channel)
        for (i in customChannelEmotes) {
            if (!customChannelEmotes.hasOwnProperty(i)) continue;
            emote = customChannelEmotes[i];
            if (messageBody.indexOf(' ' + emote.emote + ' ') > -1 || messageBody.indexOf(':' + emote.emote + ':') > -1) {
                temp = $('<div>').append($('<img title="' + emote.emote + '">').addClass('exu-emote').attr('src', customEmoteTemplate.split('{image_id}').join(emote.image_id).split('{image_ext}').join(emote.image_ext || 'png')).data('emote', $('<span>').html(emote.emote).text()));
                messageBody = messageBody.split(' ' + emote.emote + ' ').join(' ' + temp.html() + ' ');
                messageBody = messageBody.split(':' + emote.emote + ':').join(temp.html());
            }
        }

        if (oldMessageBody != messageBody) {
            $messageBody.html(messageBody.substr(1, messageBody.length - 1));
        }
    }

    function onChatReceived(event) {
        var $this = $(event.target);
        var messageAuthor = $this.find('.message-author').text().toLowerCase();
        var messageRole = $this.attr('data-role');

        if (messageAuthor == null || messageRole == null) {
            return;
        }

        var i;

        // Check for special roles
        for (i in roles) {
            if (!roles.hasOwnProperty(i)) continue;
            if (roles[i].indexOf(messageAuthor) > -1) {
                messageRole += ' ' + i;
            }
        }
        $this.attr('data-role', messageRole);

        // User Colors
        if (bexoptions.usercolors == true) {
            if (colors[messageAuthor] != null) {
                $this.find('.message-author').css('color', colors[messageAuthor]);
            } else if (secondColors[messageAuthor] != null) {
                if (bexoptions.globalcolors == true) {
                    $this.find('.message-author').css('color', secondColors[messageAuthor]);
                }
            } else {
                if (bexoptions.globalcolors == true) {
                    var randomPicker = Math.floor(Math.random() * 16);
                    secondColors[messageAuthor] = colorWheel[randomPicker];
                    $this.find('.message-author').css('color', secondColors[messageAuthor]);

                    var expireDate = new Date(Date.now() + 2678400000);
                    document.cookie = 'BeXColors=' + JSON.stringify(secondColors) + '; expires=' + expireDate.toUTCString();
                }
            }
        }

        overrideMessageBody($this.find('.message-body'));

        if (messageAuthor == username) {
            $this.on('DOMSubtreeModified', onMessageOverridden);
        }
    }

    function onMessageOverridden(event) {
        var $this = $(event.target);
        if ($this.hasClass('message-body')) {
            setTimeout(function() {
                $this.off('DOMSubtreeModified');
            }, 500);
            overrideMessageBody($this);
        }
    }

    var $messages = $('.messages').find('.nano-content');

    $messages.on('DOMNodeInserted', onChatReceived);

    console.log('Loaded BeamExtended v' + VERSION);

    function checkForAlerts() {
        $.getJSON('https://ec87d41a87dde68618f3f11fc9c3e4fde11820dc.googledrive.com/host/0B0aYi6iDIlBaSGxJNkFTeEhqMmM/alert.json', function(systemAlert) {
            for (var i in systemAlert) {
                if (!systemAlert.hasOwnProperty(i)) continue;
                if (triggeredAlerts.indexOf(systemAlert[i]) > -1) continue;
                $messages.append(
                    $('<div>')
                        .addClass('message')
                        .attr('data-role', 'ExuMessage').append(
                        $('<div>')
                            .addClass('message-body')
                            .html('<b>Beam Extended Alert</b><br>' + systemAlert[i])
                    ));
                triggeredAlerts.push(systemAlert[i]);
            }
        });
        timeoutAlertChecker = setTimeout(function() {
            checkForAlerts();
        }, 6e4);
    }

    checkForAlerts();

    this.close = function() {
        $messages.off('DOMNodeInserted', onChatReceived);
        $cssLink.remove();
        clearTimeout(timeoutAlertChecker);
        clearTimeout(timeoutColorGetter);
        BeamExtendedInstance = undefined;
    };

    return this;
};


(function() {
    function checker() {
        if (typeof jQuery !== 'undefined' && $('.messages').length > 0) {
            load();
        } else {
            setTimeout(function() {
                checker();
            }, 100);
        }
    }

    function load() {
        BeamExtendedInstance = new BeamExtended();
    }

    checker();
})();

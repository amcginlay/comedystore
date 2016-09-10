'use strict';

var http = require('http'),
    bl = require('bl'),
    cheerio = require('cheerio');

exports.list = function(req, res) {
    var req_opts = {
        host:'thecomedystore.co.uk',
        path:'/london/'
    };

    return http.get(req_opts, function(resp) {
        resp.pipe(bl(function (err, data) {
            var results = data.toString();
            var $ = cheerio.load(results);

            var comedyNights = [];
            $('.side-block').each(function() {

                var eventDateDom = $(this).find('.caldate');
                var eventMetaDom = $(this).find('.show-meta');
                var eventInfoDom = $(this).find('.show-info');

                var eventDay = $(eventDateDom).children('span').eq(0).text();
                var eventMonth = $(eventDateDom).children('span').eq(1).text();

                var eventMetaH4Dom = $(eventMetaDom).children('h4');
                var h4First = eventMetaH4Dom.first().clone().children().remove().end().text(); // zap stray child <span>
                var weekDayTimeArray = h4First.split(' - ');
                var price = eventMetaH4Dom.children('span').first().text().trim();

                (function publishComedyNight(){
                    var commedians = [];
                    $(eventInfoDom).find('.comedians .commodal .comedian-text').each(function() {
                        var comedian = $(this).clone().children().remove().end().text();
                        commedians.push(comedian);
                    });

                    var comedyNight = {
                        eventDate: weekDayTimeArray[0] + ' ' + eventDay + ' ' + eventMonth,
                        eventTime: weekDayTimeArray[1],
                        eventPrice: price,
                        eventTitle: $(eventMetaDom).children('.meta-title').first().text(),
                        comedians: commedians
                    };
                    comedyNights.push(comedyNight);
                })();
            });

            res.json({ value: comedyNights});
        }));
    })
    .on('error', function(err) {
        res.status(400).send( { type: 'error', value: err.message } );
    });
};

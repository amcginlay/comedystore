'use strict';

(function() {
    describe('CssFix', function() {
        beforeEach(module(ApplicationConfiguration.applicationModuleName));

        it('cssfixHome() test', function() {
            cssfixOther('test');                                                            // jshint ignore:line
            cssfixHome();                                                                   // jshint ignore:line
            expect($('link[href*=\'component.css\']').length).toBe(1);
        });

        it('cssfixOther() test', function() {
            cssfixHome();                                                                   // jshint ignore:line
            cssfixOther('test');                                                            // jshint ignore:line
            expect($('link[href*=\'core.css\']').length).toBe(1);
        });
    });
})();

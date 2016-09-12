'use strict';

(function() {
    describe('CssFix', function() {
        beforeEach(module(ApplicationConfiguration.applicationModuleName));

        it('cssfixHome() test', function() {
            cssfixOther('test');
            cssfixHome();
            expect($('link[href*=\'component.css\']').length).toBe(1);
        });

        it('cssfixOther() test', function() {
            cssfixHome();
            cssfixOther('test');
            expect($('link[href*=\'core.css\']').length).toBe(1);
        });
    });
})();

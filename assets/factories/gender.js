(function () {
    'use strict';
    app.factory('genderFactory', GenderController);

    function GenderController() {
        var gender = [
            { name: 'GENDER.FEMALE', value: 'female' },
            { name: 'GENDER.MALE', value: 'male' }
        ];
        return {
            get: () => {
                return gender;
            }
        };
    }
})();
(() => {
    'use strict';
    /**
      * Example
      * <ssvq-region-commune></ssvq-region-commune>
      */
    app.directive('ssvqRegionCommune', function () {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: { data: '=', opts: '=', addressDataForm: '=form' },
            scope: {},
            restrict: 'E',
            templateUrl: '/components/generic/regionCommune/regionCommune.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, regionFactory, communeFactory) {
        var vm = this;

        regionFactory.getAll().then((response) => {
            if (response.ok) {
                vm.regions = response.obj.region;
            } else {
                vm.regions = [];
            }
        }, (err) => console.log(err));

        $scope.$watch('vm.data', newData => {
            if (newData) { newData.region = 6; }
        });


        vm.onRegionChange = () => vm.data.commune = null;

        $scope.$watch('vm.data.region', region => {
            if (!region) { return; }
            communeFactory.getAll(region).then(
                list => vm.communes = list,
                () => vm.communes = []
            );
        });
    }
})();
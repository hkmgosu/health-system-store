(() => {
    'use strict';
    /**
      * Example
      * <ssvq-article-details></ssvq-article-details>
      */
    app.directive('ssvqArticleDetails', function () {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {},
            scope: {},
            restrict: 'E',
            templateUrl: '/components/article/articleDetails/articleDetails.html'
        };
    });

    /* @ngInject */
    function ComponentController($scope, $stateParams, $articleFactory) {
        var vm = this;
        $articleFactory.getDetails($stateParams.id).then(article => {
            vm.articleData = article;
            $scope.$apply();
        }, () => vm.notFound = true);

        vm.goBack = () => window.history.back();
    }
})();
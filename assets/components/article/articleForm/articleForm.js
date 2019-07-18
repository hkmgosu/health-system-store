(() => {
    'use strict';
    /**
      * Example
      * <ssvq-article-form></ssvq-article-form>
      */
    app.directive('ssvqArticleForm', function () {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: { article: '=', form: '=' },
            scope: {},
            restrict: 'E',
            templateUrl: '/components/article/articleForm/articleForm.html'
        };
    });

    /* @ngInject */
    function ComponentController($articleCategoryFactory, $articleFactory) {
        var vm = this;

        vm.transformChip = chip => {
            if (angular.isObject(chip)) {
                return chip;
            }
            return { name: chip };
        };

        vm.getTagList = $articleFactory.getTagList;

        vm.getCategoryList = (searchText) => new Promise((resolve, reject) => {
            $articleCategoryFactory.getManagedList({
                name: { startsWith: searchText }
            }).then(resolve, reject);
        });

        vm.onFileListChange = () => vm.form.$setDirty();

    }
})();
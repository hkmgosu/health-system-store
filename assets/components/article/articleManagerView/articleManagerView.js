(() => {
    'use strict';
    /**
      * Example
      * <ssvq-article-manager-view></ssvq-article-manager-view>
      */
    app.directive('ssvqArticleManagerView', function () {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {},
            scope: {},
            restrict: 'E',
            templateUrl: '/components/article/articleManagerView/articleManagerView.html'
        };
    });

    /* @ngInject */
    function ComponentController($mdDialog, $mdToast, $articleFactory) {
        var vm = this;
        vm.filter = {};

        vm.createArticle = () => {
            $mdDialog.show({
                clickOutsideToClose: true,
                templateUrl: '/components/article/articleManagerView/dialog.createArticle.html',
                controller:
                    /* @ngInject */
                    function DialogController($mdDialog) {
                        var vm = this;
                        vm.article = {
                            tagList: [],
                            attachments: [],
                            pictures: []
                        };
                        vm.cancel = () => $mdDialog.cancel();
                        vm.confirm = () => $mdDialog.hide(vm.article);
                    },
                controllerAs: 'vm',
                bindToController: true
            }).then(article => {
                $articleFactory.create(article).then((articleCreated) => {
                    window.location.href = "#/publicacion/" + articleCreated.id;
                });
                $mdToast.showSimple('La publicación ha sido creada')
            });
        };

        vm.onCategoryChange = (category) => {
            vm.filter.category = category ? category.id : null;
        };
        vm.onSearchTextChange = searchText => {
            vm.filter.searchText = searchText;
        };
    }
})();
(() => {
    'use strict';
    /**
      * Example
      * <ssvq-article-item article=""></ssvq-article-item>
      */
    app.directive('ssvqArticleItem', function () {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: {
                article: '=',
                admin: '='
            },
            scope: {},
            restrict: 'E',
            templateUrl: '/components/article/articleItem/articleItem.html'
        };
    });

    /* @ngInject */
    function ComponentController($mdDialog, $mdToast, $articleFactory, $element) {
        var vm = this;

        vm.delete = () => {
            $mdDialog.show(
                $mdDialog.confirm({
                    title: '¿Estás seguro de eliminar la publicación seleccionada?',
                    textContent: 'La publicación será eliminada para siempre',
                    ok: 'Eliminar publicación',
                    cancel: 'Cancelar'
                })
            ).then(() => {
                $articleFactory.delete(vm.article.id).then(() => {
                    $mdToast.showSimple('La publicación ha sido eliminada');
                    $element.remove();
                }, () => $mdToast.showSimple('No ha podido ser eliminada la publicación'));
            });
        };

        vm.edit = () => {
            $mdDialog.show({
                clickOutsideToClose: true,
                templateUrl: '/components/article/articleItem/dialog.editArticle.html',
                controller:
                    /* @ngInject */
                    function DialogController($mdDialog, $articleFactory, $scope) {
                        var vm = this;
                        $articleFactory.getDetails(vm.articleID).then(article => {
                            vm.article = article;
                            $scope.$apply();
                        });
                        vm.cancel = () => $mdDialog.cancel();
                        vm.confirm = () => $mdDialog.hide(vm.article);
                    },
                locals: { articleID: vm.article.id },
                controllerAs: 'vm',
                bindToController: true
            }).then(articleEdited => {
                $articleFactory.edit(articleEdited).then(
                    () => {
                        vm.article = articleEdited;
                        $mdToast.showSimple('La publicación fue editada con éxito');
                    },
                    () => $mdToast.showSimple('La publicación no ha podido ser editada')
                );
            });
        };
    }
})();
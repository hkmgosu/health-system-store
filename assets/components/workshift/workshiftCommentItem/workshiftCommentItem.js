(() => {
    'use strict';
    /**
      * Example
      * <ssvq-workshift-comment-item></ssvq-workshift-comment-item>
      */
    app.directive('ssvqWorkshiftCommentItem', function () {
        return {
            controller: ComponentController,
            controllerAs: 'vm',
            bindToController: { comment: '=' },
            scope: {},
            restrict: 'E',
            templateUrl: '/components/workshift/workshiftCommentItem/workshiftCommentItem.html'
        };
    });

    /* @ngInject */
    function ComponentController() {
        var vm = this;
    }
})();
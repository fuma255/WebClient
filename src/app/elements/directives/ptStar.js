angular.module('proton.elements')
.directive('ptStar', ($rootScope, CONSTANTS, gettextCatalog, tools, actionConversation) => {

    /**
    * Check in LabelIDs and Labels to see if the conversation or message is starred
    * @param {Object} item
    */
    function isStarred({ LabelIDs = [], Labels = [] }) {
        if (Labels.length) {
            return _.findWhere(Labels, { ID: CONSTANTS.MAILBOX_IDENTIFIERS.starred });
        }
        return LabelIDs.some((label) => label === CONSTANTS.MAILBOX_IDENTIFIERS.starred);
    }

    /**
    * Star or unstar a message/conversation
    * @param {Object} element - conversation or message
    * @param {String} type Type of message, conversation or message
    */
    function toggleStar(item, type) {
        const todoAction = isStarred(item) ? 'unstar' : 'star';

        if (type === 'conversation') {
            actionConversation[todoAction]([item.ID]);
        }

        if (type === 'message') {
            $rootScope.$emit('messageActions', { action: todoAction, data: { ids: [item.ID] } });
        }
    }

    $rootScope.$on('elements', (e, { type, data = {} }) => {
        if (type === 'toggleStar') {
            toggleStar(data.model, data.type);
        }
    });

    return {
        scope: {
            model: '='
        },
        replace: true,
        templateUrl: 'templates/elements/ptStar.tpl.html',
        link(scope, el, attr) {

            const customType = attr.ptStarType || tools.getTypeList();

            scope.isStarred = () => isStarred(scope.model);

            function onClick(e) {
                if (e.target.nodeName === 'A') {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleStar(scope.model, customType);
                }
            }

            el.on('click', onClick);

            scope
            .$on('$destroy', () => {
                el.off('click', onClick);
                $('.tooltip').remove(); // Clear all tooltips when we destroy a conversation cf #3513
            });
        }
    };
});

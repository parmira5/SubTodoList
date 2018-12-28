// It should display a list item that says 'Click here to add your first To-do' when the app loads with nothing in the store.
// It should switch to edit mode on a Todo when a user clicks on its text.
// It should save current Todo and create another Todo bullet at same level when enter key is pressed while in edit mode
// It should create a sub-Todo under current Todo when tab is pressed in edit mode
// It should discard changes when escape is pressed in edit mode
// It should mark Todo as complete when mark as complete button is clicked
// It should toggle between hiding and showing complete
//
//
//
//

(function (){
    'use strict';
    const ENTER_KEY = 13;
    const ESCAPE_KEY = 27;
    const TAB_KEY =  9;
    
    var util = {
        uuid: function(){
            var i, random;
            var uuid = '';

            for (i = 0; i < 32; i++){
                random = Math.random() * 16 | 0;
                if (i === 8 || i === 12 || i === 16 || i === 20){
                    uuid += '-';
                }
                uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random)).toString(16);
            }
            return uuid;
        },
        store: function (namespace, data) {
            if (arguments.length > 1) {
                return localStorage.setItem(namespace, JSON.stringify(data));
            } else {
                var store = localStorage.getItem(namespace);
                return (store && JSON.parse(store)) || [];
            }
        }

    };
    var App = {
        init: function (){
            this.todos = util.store('todos');
            if (this.todos.length === 0){
                this.todos.push({
                    uuid: util.uuid(),
                    title: 'Double click here to create your first Todo.',
                    level: 0,
                    completed: false,
                    subTodo: ''
                });
                this.todos.push({
                    uuid: util.uuid(),
                    title: 'Second one for testing.',
                    level: 0,
                    completed: false,
                    subTodo: ''
                });
            }
            this.render(this.todos);
        },

        render: function (todoArray){
            var builtList = this.buildList(todoArray);
            this.updateDom(builtList);
        },

        buildList: function (todoArray){
            var todos = todoArray;
            var ul = document.createElement('ul');

            todos.forEach(function (element){    
                var todoLi = document.createElement('li');
                todoLi.setAttribute('data-id', element.uuid);
                todoLi.innerHTML = element.title;
                ul.appendChild(todoLi);
            });

            return ul;
        },

        updateDom: function (list) {
            var container = document.getElementById('app-container');
            container.innerHTML = list.outerHTML;
        }
    }
    App.init();
})();
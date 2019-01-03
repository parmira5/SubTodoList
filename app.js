// It should display a list item that says 'Click here to add your first To-do' when the app loads with nothing in the store. DONE// It should switch to edit mode on a Todo when a user clicks on its text.
// It should save current Todo and create another Todo bullet at same level when enter key is pressed while in edit mode
// It should create a sub-Todo under current Todo when tab is pressed in edit mode
// It should discard changes when escape is pressed in edit mode
// It should mark Todo as complete when mark as complete button is clicked
// It should toggle between hiding and showing complete

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
                    subTodos: []
                });
            }
            this.render(this.todos);
            util.store('todos', this.todos);
            this.bindEvents();
        },

        render: function (todoArray){
            var builtList = this.buildList(todoArray);
            this.updateDom(builtList);
        },

        create: function (element, array) {
            if (arguments.length < 2){
                this.todos.splice(this.indexFromEl(element) + 1, 0, {
                    uuid: util.uuid(),
                    title: 'New Task',
                    level: 0,
                    completed: false,
                    subTodos: []
                });
            } else {
                array.unshift({
                    uuid: util.uuid(),
                    title: 'New Task',
                    level: 0,
                    completed: false,
                    subTodos: []
                });

            }
            this.render(this.todos);
            util.store('todos', this.todos);
        },

        destroy: function (element) {
            this.todos.splice(this.indexFromEl(element), 1);
            this.render(this.todos);
            util.store('todos', this.todos);

        },
        
        buildList: function (todoArray){
            var todos = todoArray;
            var ul = document.createElement('ul');

            todos.forEach(function (element){   
                var todoLi = document.createElement('li');
                var subTodos;
                todoLi.setAttribute('data-id', element.uuid);

                if (element.subTodos.length > 0){
                    subTodos = App.buildList(element.subTodos);
                } else {
                    subTodos = '';
                }
                todoLi.innerHTML = `<div class= "view">
                    <input class= "toggle" type= "checkbox">
                    <label>${element.title}</label>
                    <button class="delete">Delete</button>
                </div>
                <input class= "edit" value= "${element.title}">
                ${subTodos}`
                ul.appendChild(todoLi);
            });

            return ul.outerHTML;
        },

        updateDom: function (list) {
            var container = document.getElementById('app-container');
            container.innerHTML = list;
        },

        edit: function (e) {
            var liNode = e.target.closest('li');
            liNode.classList.add('editing');
            var input = liNode.querySelector('input.edit');
            input.focus();  


        },

        editKeyUp: function(e, array = this.todos){
            
            if (e.which === ESCAPE_KEY) {
                e.target.setAttribute('abort', true);
                e.target.blur();    
            }
            if (e.which === ENTER_KEY){
                e.target.blur();
                this.create(e.target);
            }

            if (e.which === TAB_KEY) {
                this.addSubTodo(e);
            }
        },

        update: function(e){
            var elem = e.target;
            var value = elem.value.trim();

            if (elem.getAttribute('abort')){
                elem.setAttribute('abort', true);
            } else {
                this.todos[this.indexFromEl(elem)].title = value;
            }

            this.render(this.todos);
            util.store('todos', this.todos);

        },

        indexFromEl: function(el){
            var liElem = el.closest('li');
            for (var i = 0; i < this.todos.length; i++){
                if (this.todos[i].uuid === liElem.getAttribute('data-id')){
                    return i;
                }
            }
        },

        addSubTodo: function (e) {
            var subTodoArr = this.todos[this.indexFromEl(e.target)].subTodos;
            this.create(e.target, subTodoArr);
        },

        bindEvents: function() {
            document.getElementById('app-container').addEventListener('dblclick', function (e) {
                if (e.target.tagName === 'LABEL'){
                    this.edit.call(this, e);
                }
            }.bind(this));

            document.getElementById('app-container').addEventListener('keydown', function (e) {
                if (e.target.classList.contains('edit')){
                    this.editKeyUp.call(this, e);
                }
            }.bind(this));
            document.getElementById('app-container').addEventListener('focusout', function (e) {
                if (e.target.classList.contains('edit')){
                    this.update.call(this, e);
                }
            }.bind(this));
            document.getElementById('app-container').addEventListener('click', function (e) {
                if (e.target.classList.contains('delete')){
                    this.destroy.call(this, e.target);
                }
            }.bind(this));
        }
    }
    App.init();
})();
(function (){
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
                    title: '',
                    level: 0,
                    completed: false,
                    subTodos: []
                });
            }
            this.render(this.todos);
            this.bindEvents();
        },

        render: function (array){
            builtList = this.buildList(array);
            this.updateDom(builtList);
        },

        buildList: function(array){
            var ul = document.createElement('ul');
            var todoLi;
            var subTodos;

            array.forEach(function (element){
                todoLi = document.createElement('li');
                todoLi.setAttribute('data-id', element.uuid);

                if (element.subTodos.length > 0){
                    subTodos = App.buildList(element.subTodos);
                } else {
                    subTodos = '';
                }
                todoLi.innerHTML = `<div>
                <label class= "toggleCheckbox">
                    <input class= "toggle" type= "checkbox">
                    <span class= "checkmark"></span>
                </label>
                <input class= "edit" value= ${element.title}>
                <button class= "delete">&#10005</button>
                </div>
                ${subTodos}`
                ul.appendChild(todoLi);
            });

            return ul.outerHTML;
        },

        updateDom: function (list){
            var container = document.getElementById('app-container');
            container.innerHTML = list;
        },

        createWithEnter: function(event){
            var element = event.target;
            var sourceTodo = this.getTodo(element, this.todos);
            var uuid = util.uuid();

            sourceTodo.array.splice(sourceTodo.position + 1, 0, {
                uuid: uuid,
                title: '',
                level: sourceTodo.todo.level,
                completed: false,
                subTodos: []
            });

            util.store('todos', this.todos);
            this.render(this.todos);

            document.querySelector(`[data-id="${uuid}"]`).childNodes[0].getElementsByClassName('edit')[0].focus();
        },

        createSubWithTab: function(event){
            var element = event.target;
            var sourceTodo = this.getTodo(element, this.todos);
            var uuid = util.uuid();

            sourceTodo.todo.subTodos.push({
                uuid: uuid,
                title: '',
                level: sourceTodo.todo.level + 1,
                completed: false,
                subTodos: []
            });

            util.store('todos', this.todos);
            this.render(this.todos);

            document.querySelector(`[data-id="${uuid}"]`).childNodes[0].getElementsByClassName('edit')[0].focus();

        },

        update: function(event){
            var element = event.target;
            var sourceTodo = this.getTodo(element, this.todos);

            sourceTodo.array[sourceTodo.position].title = element.value.trim();
        },

        getTodo: function (element, array){
            var id = element.closest('li').getAttribute('data-id');
            for (var i = 0; i < array.length; i++){
                if (array[i].uuid === id){
                    return {
                        todo: array[i],
                        position: i,
                        array: array
                    }
                } else {
                    if (array[i].subTodos.length > 0){
                        var foundInSubTodo = this.getTodo(element, array[i].subTodos);
                        if (foundInSubTodo){
                            return foundInSubTodo;
                        }
                    }
                }

            }
        },

        bindEvents: function(){
            document.getElementById('app-container').addEventListener('keydown', function(event){
                if (event.target.classList.contains('edit')){
                    if(event.which === ENTER_KEY){
                        this.createWithEnter.call(this, event);
                    }
                    if(event.which === TAB_KEY){
                        event.preventDefault();
                        this.createSubWithTab.call(this, event);
                    }
                }
            }.bind(this));

            document.getElementById('app-container').addEventListener('click', function(event){
                if (event.target.classList.contains('delete')){
                    this.destroyWithButton.call(this, event);
                }
            }.bind(this));
        },

        destroyWithButton: function(event){
            var element = event.target;
            var sourceTodo = this.getTodo(element, this.todos);
            sourceTodo.array.splice(sourceTodo.position, 1);

            util.store('todos', this.todos);
            this.render(this.todos);
        }
    }
    App.init();
})();
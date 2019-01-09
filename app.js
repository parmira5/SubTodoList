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
            this.render();
            this.bindEvents();
        },

        render: function (){
            var builtList;

            if (document.getElementById('filter-toggle').checked){
                builtList = this.buildActiveList(this.todos);
                document.getElementById('app-container').innerHTML = builtList;
            } else {
                builtList = this.buildList(this.todos);
                document.getElementById('app-container').innerHTML = '';
                document.getElementById('app-container').innerHTML = builtList;

            }
            
        },

        buildActiveList: function(array){
                var ul = document.createElement('ul');
                var todoLi;
                var subTodos;
                var completeClass = '';
                var checked = '';
    
                array.forEach(function (element){

                    if (!element.completed){
                    todoLi = document.createElement('li');
                    todoLi.setAttribute('data-id', element.uuid);
    
                    if (element.subTodos.length > 0){
                        subTodos = App.buildActiveList(element.subTodos);
                    } else {
                        subTodos = '';
                    }
    
                    todoLi.innerHTML = `<div>
                    <label class= "toggleCheckbox">
                        <input class= "toggle" type= "checkbox" ${checked}>
                        <span class= "checkmark"></span>
                    </label>
                    <button class= "delete">&#10005</button>
                    <input class= "edit ${completeClass}" value= "${element.title}" onfocus = "this.value = this.value">
                    </div>
                    ${subTodos}`
                    ul.appendChild(todoLi);   
                    }
                });
    
                return ul.outerHTML;
        },

        buildList: function(array){
                var ul = document.createElement('ul');
                var todoLi;
                var subTodos;
                var completeClass = '';
                var checked = '';
    
                array.forEach(function (element){
                    todoLi = document.createElement('li');
                    todoLi.setAttribute('data-id', element.uuid);
    
                    if (element.subTodos.length > 0){
                        subTodos = App.buildList(element.subTodos);
                    } else {
                        subTodos = '';
                    }
    
                    if (element.completed){
                        completeClass = 'complete';
                        checked = 'checked';
                    } else {
                        completeClass = '';
                        checked = '';
                    }
    
                    todoLi.innerHTML = `<div>
                    <label class= "toggleCheckbox">
                        <input class= "toggle" type= "checkbox" ${checked}>
                        <span class= "checkmark"></span>
                    </label>
                    <button class= "delete">&#10005</button>
                    <input class= "edit ${completeClass}" value= "${element.title}" onfocus = "this.value = this.value">
                    </div>
                    ${subTodos}`
                    ul.appendChild(todoLi);
                });
    
                return ul.outerHTML;
        },

        getPrevElement: function(event){
            var element = event.target;
            var sourceTodo = this.getTodo(element, this.todos);
            var prevElement = sourceTodo.array[sourceTodo.position - 1];
            
            if (prevElement){
                return prevElement
            } else {
                return null;
            }
        },


        createWithEnter: function(event){
            var element = event.target;
            var sourceTodo = this.getTodo(element, this.todos);
            var uuid = util.uuid();
            var val = element.value;

            if (val){
                sourceTodo.array.splice(sourceTodo.position + 1, 0, {
                    uuid: uuid,
                    title: '',
                    level: sourceTodo.todo.level,
                    completed: false,
                    subTodos: []
                });
    
                element.blur();
    
                util.store('todos', this.todos);
                this.render();
    
                document.querySelector(`[data-id="${uuid}"]`).childNodes[0].getElementsByClassName('edit')[0].focus();
            }
        },

        createSubWithTab: function(event){

            // var element = event.target;
            // var val = element.value;

            // if (val){
            //     var sourceTodo = this.getTodo(element, this.todos);
            //     var uuid = util.uuid();
    
            //     sourceTodo.todo.subTodos.push({
            //         uuid: uuid,
            //         title: '',
            //         level: sourceTodo.todo.level + 1,
            //         completed: false,
            //         subTodos: []
            //     });
    
            //     element.blur();
    
            //     util.store('todos', this.todos);
            //     this.render();
    
            //     document.querySelector(`[data-id="${uuid}"]`).childNodes[0].getElementsByClassName('edit')[0].focus();
            // }

            var prevElement = this.getPrevElement(event);

            var element = event.target;
            var sourceTodo = this.getTodo(element, this.todos);
            var movedTodo;

            if (prevElement) {
                sourceTodo.todo.level = prevElement.level + 1;
                movedTodo = JSON.parse(JSON.stringify(sourceTodo.todo));
                this.destroyWithButton(event);
                prevElement.subTodos.push(movedTodo);

                util.store('todos', this.todos);
                this.render();
            }
            
        },

        update: function(event){
            var element = event.target;
            var sourceTodo = this.getTodo(element, this.todos);
            var uuid = sourceTodo.todo.uuid;

            if (element.getAttribute('abort') == 'true'){
                if (element.value.trim()){
                    element.setAttribute('abort', false);
                    element.focus();
                } else {
                    this.destroyWithButton(event);
                }
            } else {
                if (element.value.trim()){
                    sourceTodo.array[sourceTodo.position].title = element.value.trim();
                    this.render();
                }
            }
        },

        editKeyUp: function(event){
            if (event.which === ENTER_KEY){
                this.createWithEnter(event);
            }

            if (event.which === TAB_KEY){
                event.preventDefault();
                this.createSubWithTab(event);
            }

            if (event.which === ESCAPE_KEY){
                event.target.setAttribute('abort', true);
                this.update(event);
            }
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
                this.editKeyUp.call(this, event);
            }.bind(this));

            document.getElementById('app-container').addEventListener('focusout', function(event){
                if (event.which !== ESCAPE_KEY){
                    this.update.call(this, event);
                }
            }.bind(this));

            document.getElementById('app-container').addEventListener('click', function(event){
                if (event.target.classList.contains('delete')){
                    this.destroyWithButton.call(this, event);
                }

                if (event.target.classList.contains('toggle')){
                    this.toggleComplete.call(this, event);
                }
            }.bind(this));

            document.getElementById('filter-toggle').addEventListener('change', function(){
                this.render(this.todos);
            }.bind(this));
        },

        destroyWithButton: function(event){
            var element = event.target;
            var sourceTodo = this.getTodo(element, this.todos);
            sourceTodo.array.splice(sourceTodo.position, 1);

            util.store('todos', this.todos);
            this.render();
        },

        toggleComplete: function (event, array, completedBool){
            if (arguments.length === 1){
                var element = event.target;
                var sourceTodo = this.getTodo(element, this.todos);
                completedBool = !sourceTodo.array[sourceTodo.position].completed;
                sourceTodo.array[sourceTodo.position].completed = completedBool;

                if (sourceTodo.array[sourceTodo.position].subTodos.length > 0){
                    this.toggleComplete(event, sourceTodo.array[sourceTodo.position].subTodos, completedBool);
                }
            } else {
                for (var i = 0; i < array.length; i++){
                    array[i].completed = completedBool;
                    if (array[i].subTodos.length > 0){
                        this.toggleComplete(event, array[i].subTodos, completedBool);
                    }
                }
            }
            this.render();
        }
}
    App.init();
})();
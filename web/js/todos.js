// An example Parse.js Backbone application based on the todo app by
// [Jérôme Gravel-Niquet](http://jgn.me/). This demo uses Parse to persist
// the todo items and provide user authentication and sessions.

$(function() {

  Parse.$ = jQuery;

  // Initialize Parse with your Parse application javascript keys
  Parse.initialize("0Oq3tTp9JMvd72LOrGN25PiEq9XgVHCxo57MQbpT",
                   "vUFy2o7nFx3eeKVlZneYMPI2MBoxT5LhWNoIWPja");

  // Todo Model
  // ----------

  // Our basic Todo model has `content`, `order`, and `done` attributes.
  var Todo = Parse.Object.extend("Todo", {
    // Default attributes for the todo.
    defaults: {
      content: "empty todo...",
      done: false
    },

    // Ensure that each todo created has `content`.
    initialize: function() {
      if (!this.get("content")) {
        this.set({"content": this.defaults.content});
      }
    },

    // Toggle the `done` state of this todo item.
    toggle: function() {
      this.save({done: !this.get("done")});
    }
  });

  // This is the transient application state, not persisted on Parse
  var AppState = Parse.Object.extend("AppState", {
    defaults: {
      filter: "all"
    }
  });

  // Todo Collection
  // ---------------

  var TodoList = Parse.Collection.extend({

    // Reference to this collection's model.
    model: Todo,

    // Filter down the list of all todo items that are finished.
    done: function() {
      return this.filter(function(todo){ return todo.get('done'); });
    },

    // Filter down the list to only todo items that are still not finished.
    remaining: function() {
      return this.without.apply(this, this.done());
    },

    // We keep the Todos in sequential order, despite being saved by unordered
    // GUID in the database. This generates the next order number for new items.
    nextOrder: function() {
      if (!this.length) return 1;
      return this.last().get('order') + 1;
    },

    // Todos are sorted by their original insertion order.
    comparator: function(todo) {
      return todo.get('order');
    }

  });

  // Todo Item View
  // --------------

  // The DOM element for a todo item...
  var TodoView = Parse.View.extend({

    //... is a list tag.
    tagName:  "li",

    // Cache the template function for a single item.
    template: _.template($('#item-template').html()),

    // The DOM events specific to an item.
    events: {
      "click .toggle"              : "toggleDone",
      "dblclick label.todo-content" : "edit",
      "click .todo-destroy"   : "clear",
      "keypress .edit"      : "updateOnEnter",
      "blur .edit"          : "close"
    },

    // The TodoView listens for changes to its model, re-rendering. Since there's
    // a one-to-one correspondence between a Todo and a TodoView in this
    // app, we set a direct reference on the model for convenience.
    initialize: function() {
      _.bindAll(this, 'render', 'close', 'remove');
      this.model.bind('change', this.render);
      this.model.bind('destroy', this.remove);
    },

    // Re-render the contents of the todo item.
    render: function() {
      $(this.el).html(this.template(this.model.toJSON()));
      this.input = this.$('.edit');
      return this;
    },

    // Toggle the `"done"` state of the model.
    toggleDone: function() {
      this.model.toggle();
    },

    // Switch this view into `"editing"` mode, displaying the input field.
    edit: function() {
      $(this.el).addClass("editing");
      this.input.focus();
    },

    // Close the `"editing"` mode, saving changes to the todo.
    close: function() {
      this.model.save({content: this.input.val()});
      $(this.el).removeClass("editing");
    },

    // If you hit `enter`, we're through editing the item.
    updateOnEnter: function(e) {
      if (e.keyCode == 13) this.close();
    },

    // Remove the item, destroy the model.
    clear: function() {
      this.model.destroy();
    }

  });

  // The Application
  // ---------------

  var LogInView = Parse.View.extend({
    events: {
"submit form.login-form1": "vote1",
"submit form.login-form2": "vote2",
"submit form.login-form3": "vote3",
"submit form.login-form4": "vote4"      
      // "submit form.login-form": "logIn",
      // "submit form.signup-form": "signUp"
    },

    el: ".content",
    
    initialize: function() {
      //_.bindAll(this, "logIn", "signUp");
       _.bindAll(this, "vote1", "vote2", "vote3", "vote4");
      this.render();
    },

    vote1: function(e){
      console.log("1");
      return false;
    },

    vote2: function(e){
      console.log("2");
      return false;
    },

    vote3: function(e){
      console.log("3");
      return false;
    },

    vote4: function(e){
      console.log("4");
      return false;      
    },

    // logIn: function(e) {
    //   var self = this;
    //   var username = this.$("#login-username").val();
    //   var password = this.$("#login-password").val();
      
    //   Parse.User.logIn(username, password, {
    //     success: function(user) {
    //       new ManageTodosView();
    //       self.undelegateEvents();
    //       delete self;
    //     },

    //     error: function(user, error) {
    //       self.$(".login-form .error").html("Invalid username or password. Please try again.").show();
    //       this.$(".login-form button").removeAttr("disabled");
    //     }
    //   });

    //   this.$(".login-form button").attr("disabled", "disabled");

    //   return false;
    // },

    // signUp: function(e) {
    //   var self = this;
    //   var username = this.$("#signup-username").val();
    //   var password = this.$("#signup-password").val();
      
    //   Parse.User.signUp(username, password, { ACL: new Parse.ACL() }, {
    //     success: function(user) {
    //       new ManageTodosView();
    //       self.undelegateEvents();
    //       delete self;
    //     },

    //     error: function(user, error) {
    //       self.$(".signup-form .error").html(error.message).show();
    //       this.$(".signup-form button").removeAttr("disabled");
    //     }
    //   });

    //   this.$(".signup-form button").attr("disabled", "disabled");

    //   return false;
    // },

    render: function() {
      this.$el.html(_.template($("#login-template").html()));
      this.delegateEvents();
    }
  });

  // The main view for the app
  var AppView = Parse.View.extend({
    // Instead of generating a new element, bind to the existing skeleton of
    // the App already present in the HTML.
    el: $("#todoapp"),

    initialize: function() {
      this.render();
    },

    render: function() {
      console.log("Inside AppView");
        //new ManageTodosView();
      // if (Parse.User.current()) {
      // } else {
         new LogInView();
      // }
    }
  });

  var AppRouter = Parse.Router.extend({
    routes: {
      "all": "all",
      "active": "active",
      "completed": "completed"
    },

    initialize: function(options) {
    },

    all: function() {
      state.set({ filter: "all" });
    },

    active: function() {
      state.set({ filter: "active" });
    },

    completed: function() {
      state.set({ filter: "completed" });
    }
  });

  var state = new AppState;

  new AppRouter;
  new AppView;
  Parse.history.start();
});

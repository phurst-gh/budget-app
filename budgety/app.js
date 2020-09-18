// TASKS:
// 1. Move controllers into their own files.
// 2. Add in some way of saving/storing the information.


var dataController = (function() {
  // Private variables; because they are in the closure

  // Function Constructor: capitalised name to show it's a constructor
  var Expense = function(id, desc, value) {
    this.id = id;
    this.desc = desc;
    this.value = value;
    this.percentage = -1; // -1 for undefined
  }

  // Adding functions to prototype so all iterations have access to the methods
  Expense.prototype.calcPercentage = function(totalInc) {
    if (totalInc > 0) {
      this.percentage = Math.round((this.value / totalInc) * 100);
    } else {
      this.percentage = -1;
    }
  };
  Expense.prototype.getPercentage = function() {
    return this.percentage;
  };

  // Function Constructor: capitalised name to show it's a constructor
  var Income = function(id, desc, value) {
    this.id = id;
    this.desc = desc;
    this.value = value;
  }

  // State - above objects are added into the allItems arrays
  var data = {
    allItems: {
      exp: [],
      inc: [],
    },
    totals: {
      exp: 0,
      inc: 0,
    },
    budget: 0,
    percentage: -1 // -1 often used for none existant data (non-existant until inputs are added)
  }

  calculateTotal = function(type) {
    var sum = 0;

    data.allItems[type].forEach(function(item) {
      sum = sum + item.value;
    })
    data.totals[type] = sum;
  }

  // Public; because they're returned
  return {
    addItem: function(type, desc, value) {
      var ID, newItem;

      // Create new ID: 
      if (data.allItems[type].length > 0) {
        // Get item type/get latest entry/get that enteries ID + 1
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      // Create new item based on type
      if (type === `exp`) {
        newItem = new Expense(ID, desc, value)
      } else if (type ===`inc`) {
        newItem = new Income(ID, desc, value)
      }

      // Push it data structure
      data.allItems[type].push(newItem);

      // Return new item
      return newItem;
    },

    deleteItem: function(type, id) {
      // 1. Put all item IDs into an array
      ids = data.allItems[type].map(function(item) {
        return item.id;
      })

      // 2. Get the index of the clicked item using the ID prop
      index = ids.indexOf(id);

      // 3. Delete the item
      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },

    calculateBudget: function() {
      // Calculate totoal inc/exp
      calculateTotal(`exp`);
      calculateTotal(`inc`);

      // Calculate budget: inc - exp
      data.budget = data.totals.inc - data.totals.exp;

      // Calculate percentage of income that we spent
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },

    calculatePercentages: function() {
      data.allItems.exp.forEach(function(item) {
        item.calcPercentage(data.totals.inc);
      });
    },
    getPercentages: function() {
      var allPerc = data.allItems.exp.map(function(item) {
        return item.getPercentage();
      })

      return allPerc;
    },

    getBudget: function() {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      }
    },

    testing: function() {
      console.log(data)
    }
  }
})();

// UI CONTROLLER
var UIController = (function() {
  var DOMStrings = {
    inputType: `.add__type`,
    inputDescription: `.add__description`,
    inputValue: `.add__value`,
    inputBtn: `.add__btn`,
    incomeContainer: `.income__list`,
    expenseContainer: `.expenses__list`,
    budgetLabel: `.budget__value`,
    incomeLabel: `.budget__income--value`,
    expensesLabel: `.budget__expenses--value`,
    percentageLabel: `.budget__expenses--percentage`,
    container: `.container`,
    expensesPercLabel: `.item__percentage`,
    dateLabel: `.budget__title--month`,
  }

  var formatNumber = function(num, type) {
    var numSplit, int, dec;

    num = Math.abs(num);
    // toFixed() on number prototype - JS automatically converts primitive types...
    // ...(eg numbers) to objects so we can use methods
    num = num.toFixed(2);

    numSplit = num.split(`.`); // Stores in array

    int = numSplit[0];
    // Add comma into thousands
    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + `,` + int.substr(int.length - 3, int.length); // 1234 = 1,234 and 12345 = 12,345
    }

    dec = numSplit[1];

    return (type === `exp` ? sign = `-` : `+`) + ` ` + int + `.` + dec;
   }


  // HOF: This allows me to pass in a list of nodes and run a unc on each item
  // ...without having to write a for-loop each time.
  var nodeListForEach = function(list, callback) {
    for (var i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  }

  return {
    getInput: function() {
      return {
        // select elements type is set using value property on options elements; will be either inc or exp
        type: document.querySelector(DOMStrings.inputType).value,
        description: document.querySelector(DOMStrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMStrings.inputValue).value),
      };
    },

    addListItem: function(obj, type) {
      var html, newHtml, element;

      // 1. Create HTML string
      if (type ===`inc`) {
        element = DOMStrings.incomeContainer;

        html = `<div class="item clearfix" id="inc-%id%">
          <div class="item__description">%desc%</div>
            <div class="right clearfix">
                <div class="item__value">%value%</div>
                <div class="item__delete">
                    <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                </div>
            </div>
        </div>`;
      } else if (type === `exp`) {
        element = DOMStrings.expenseContainer;

        html = `<div class="item clearfix" id="exp-%id%">
            <div class="item__description">%desc%</div>
              <div class="right clearfix">
                  <div class="item__value">%value%</div>
                  <div class="item__percentage">21%</div>
                  <div class="item__delete">
                      <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                  </div>
              </div>
          </div>`
      }

      // 2. Replace the placeholder text with data
      newHtml = html.replace(`%id%`, obj.id)
      newHtml = newHtml.replace(`%desc%`, obj.desc)
      newHtml = newHtml.replace(`%value%`, formatNumber(obj.value))

      // 3. Insert HTML into DOM
      document.querySelector(element).insertAdjacentHTML(`beforeend`, newHtml)
;    },

    deleteListItem: function(selectorID) {
      // Get element
      var el = document.getElementById(selectorID);
      // Remove it
      el.parentNode.removeChild(el);
    },

    clearFields: function() {
      var fields, fieldsArray;

      fields = document.querySelectorAll(DOMStrings.inputDescription + `,` + DOMStrings.inputValue);

      // querySelectorAll returns a list so needs converting to array to utilise array methods
      fieldsArray = Array.prototype.slice.call(fields)

      fieldsArray.forEach(function(item, index, array ) {
        item.value = ``;
      });

      fieldsArray[0].focus();
    },

    displayBudget: function(obj) {
      var type;

      obj.budget > 0 ? type = `inc` : type = `exp`;

      document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
      document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, `inc`);
      document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExp, `exp`);
    
      if (obj.percentage > 0) {
        document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + `%`;
      } else {
        document.querySelector(DOMStrings.percentageLabel).textContent = `--`;
      }
    },

    displayPercentages: function(percentages) {
      var fields = document.querySelectorAll(DOMStrings.expensesPercLabel);

      nodeListForEach(fields, function(item, i) {
        if (percentages[i] >0) {
          item.textContent = percentages[i] + `%`;
        } else {
          item.textContent = `---`;
        }
      })  
    },

    displayDate: function() {
      var now, year, month, months;

      now = new Date();

      months= [`Jan`, `Feb`, `Mar`, `Apr`, `May`, `Jun`, `Jul`, `Aug`, `Sep`, `Oct`, `Nov`, `Dec`];
      month = now.getMonth();

      year = now.getFullYear();
      document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ` ` + year;
    },

    typeChanged: function() {
      var fields;

      fields = document.querySelectorAll(
        DOMStrings.inputType + `,` +
        DOMStrings.inputDescription + `,` +
        DOMStrings.inputValue
        );

        nodeListForEach(fields, function(item) {
          item.classList.toggle(`red-focus`);
        });

        document.querySelector(DOMStrings.inputBtn).classList.toggle(`red`);
    },

    // Expose DOMStrings into public
    getDOMStrings: function() {
      return DOMStrings;
    }
  }
})();

// GLOBAL CONTROL
var controller = (function(dataCtrl, UICtrl) {
  var strings = UIController.getDOMStrings();

  var setupEventListeners =  function() {
    document.querySelector(strings.inputBtn).addEventListener(`click`, ctrlAddItem);

    document.addEventListener(`keypress`, function(e) {
      // Older or browsers without event use `which`
      if (e.keyCode === 13 || e.which === 13) {
        ctrlAddItem();
      }
    });

    document.querySelector(strings.container).addEventListener(`click`, ctrlDeleteItem);
    document.querySelector(strings.inputType).addEventListener(`change`, UIController.typeChanged);
  }

  var updateBudget = function() {
    var budget;

    // 1. Calculate budget
    dataController.calculateBudget();

    // 2. Return the budget
    budget = dataController.getBudget();

    // 3. Display the budget on the UI
    UIController.displayBudget(budget);
  }

  var updatePercentages = function() {
    // 1. Calculate percentages
    dataController.calculatePercentages();

    // 2. Read percentages from the budget controller
    var percentages = dataController.getPercentages();

    // 3. Update the UI with the new percentages
    UIController.displayPercentages(percentages);
  }

  // On new entry this happens:
  var ctrlAddItem = function() {
    var input, newItem;
    // 1. Get the filed input data
    input = UICtrl.getInput();
    
    if (input.description !== `` && !isNaN(input.value) && input.value > 0) {
      // 2. Add item to budget controller
      newItem = dataController.addItem(input.type, input.description, input.value);

      // 3. Add he item to the UI
      UIController.addListItem(newItem, input.type);

      // 4. Clear the fields
      UIController.clearFields();

     // 5. Calculate and update budget
      updateBudget();

      // 6. Calculate and update budget
      updatePercentages();
    }
  }

  var ctrlDeleteItem = function(e) {
    var itemID, splitID, type, ID;

    // Not great to depand on DOM structure but HTML it uses is hardcoded (see html addListItem func)
    itemID = e.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemID) {
      // eg inc-1
      splitID = itemID.split(`-`);
      type = splitID[0];
      ID = parseInt(splitID[1]);

      // 1. Delete item from data structure
      dataController.deleteItem(type, ID);

      // 2. Delete item from UI
      UIController.deleteListItem(itemID);

      // 3. Update and show the new budget
      updateBudget();
    }
  }

  return {
    init: function() {
      UIController.displayDate();
      UIController.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: 0,
      })
      setupEventListeners();
    }
  }

})(dataController, UIController);

// Only piece of code outside the functions,
// ...nothing will run without it as it sets up the eventListeners
controller.init();
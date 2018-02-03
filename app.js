var budgetcontroller = (function() {
  //constructor for expenses
  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  }

  Expense.prototype.calcPercentage = function(totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function() {
    return this.percentage;
  }

  //constructor for income
  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  }


  var calculateTotal = function(type) {
    var sum = 0;
    data.allItems[type].forEach(function(cur) {
      sum = sum + cur.value;
    })
    data.totals[type] = sum;
  }
  //all the data are stored here.
  var data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  }
  return {
    addItem: function(type, desc, val) {
      var newItem, ID;

      //Create new ID
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      //Create new item based on 'INCOME' or 'EXPENSE'
      if (type === 'exp') {
        newItem = new Expense(ID, desc, val);
      } else if (type === 'inc') {
        newItem = new Income(ID, desc, val);
      }

      //push it into our data structure
      data.allItems[type].push(newItem);

      //return the new element
      return newItem;
    },

    deleteItem: function(type, id) {
      var ids, index;

      ids = data.allItems[type].map(function(current) {
        return current.id;
      });

      index = ids.indexOf(id);


      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      };



    },

    calculateBudget: function() {
      // calculate total income and expenses
      calculateTotal('exp');
      calculateTotal('inc');

      // calculate the budget: income - expenses
      data.budget = data.totals.inc - data.totals.exp;

      // calculate the percentage of income that we spent

      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }




    },

    calculatePercentages: function() {

      data.allItems.exp.forEach(function(current) {
        current.calcPercentage(data.totals.inc);
      })
    },

    getPercentages: function() {
      var allPercentages = data.allItems.exp.map(function(cur) {
        return cur.getPercentage();
      });
      return allPercentages;
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
      console.log(data);
    }

  }

})();





var UIController = (function() {
  var DomStrings = {
    inputType: '.add__type',
    inputDesc: '.add__description',
    inputVal: '.add__value',
    addBtn: '.add__btn',
    incomeContainer: '.income__list',
    expensesContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expensesLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    itemPercentage: '.item__percentage',
    dateLabel: '.budget__title--month'
  }

  var formatNumber = function(num, type) {
    var numSplit, int, dec, type;

    num = Math.abs(num);
    num = num.toFixed(2);

    numSplit = num.split('.');

    int = numSplit[0];
    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
    }
    dec = numSplit[1];

    return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

  };

  var nodeListForEach = function(list, callback) {
    for (var i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  }

  return {
    getInput: function() {
      return {
        type: document.querySelector(DomStrings.inputType).value,
        description: document.querySelector(DomStrings.inputDesc).value,
        value: parseFloat(document.querySelector(DomStrings.inputVal).value)
      };
    },

    addListItem: function(obj, type) {
      var index, newHtml, element;

      if (type === 'inc') {
        element = DomStrings.incomeContainer;
        index = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'

      } else if (type === 'exp') {
        element = DomStrings.expensesContainer;
        index = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
      }
      newHtml = index.replace('%id%', obj.id);
      newHtml = newHtml.replace('%description%', obj.description);
      newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
    },

    deleteListItem: function(selectedId) {
      var el = document.getElementById(selectedId);
      el.parentNode.removeChild(el);
    },

    clearFields: function() {
      var fields, fieldsArr;

      fields = document.querySelectorAll(DomStrings.inputDesc + ', ' + DomStrings.inputVal);
      fieldsArr = Array.prototype.slice.call(fields);

      fieldsArr.forEach(function(current, index, array) {
        current.value = '';
      });

      fieldsArr[0].focus();

    },

    displayBudget: function(obj) {
      var type;

      obj.budget > 0 ? type = 'inc' : type = 'exp';

      document.querySelector(DomStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
      document.querySelector(DomStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
      document.querySelector(DomStrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');


      if (obj.percentage > 0) {
        document.querySelector(DomStrings.percentageLabel).textContent = obj.percentage + '%';
      } else {
        document.querySelector(DomStrings.percentageLabel).textContent = '---';
      }
    },


    displayPercentages: function(percentages) {
      var fields = document.querySelectorAll(DomStrings.itemPercentage);

      //calling nodeListForEach function  Higher Order Function !!
      nodeListForEach(fields, function(current, index) {
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + '%';
        } else {
          current.textContent = '---';
        }

      })


    },

    displayMonth: function() {
      var now, month, months, year;
      now = new Date();
      months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      month = now.getMonth();
      year = now.getFullYear();
      document.querySelector(DomStrings.dateLabel).textContent = months[month] + ' ' + year;

    },

    changedType: function() {
      var fields = document.querySelectorAll(
        DomStrings.inputType + ',' +
        DomStrings.inputDesc + ',' +
        DomStrings.inputVal
      )

      nodeListForEach(fields, function(cur) {
        cur.classList.toggle('red-focus');
      });
      document.querySelector(DomStrings.addBtn).classList.toggle('red');

    },

    getDomStrings: function() {
      return DomStrings;

    }
  };



})();


//GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {


  var setupEventListeners = function() {
    var getDOM = UICtrl.getDomStrings();
    document.querySelector(getDOM.addBtn).addEventListener('click', ctrlAddItem);
    document.addEventListener('keypress', function(event) {
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    })
    document.querySelector(getDOM.container).addEventListener('click', ctrlDeleteItem);
    document.querySelector(getDOM.inputType).addEventListener('change', UICtrl.changedType);
  }


  var updatePercentages = function() {
    //1. calculate percentages
    budgetCtrl.calculatePercentages();

    //2. read percentages from the budget controller
    var percentages = budgetCtrl.getPercentages();
    //3. update the ui with the new percentages

    UICtrl.displayPercentages(percentages);
  }


  var ctrlAddItem = function() {
    var input, newItem;
    //get the field input data
    input = UICtrl.getInput();

    if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
      // add the item to the budget controller
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);

      // add the ui here
      UICtrl.addListItem(newItem, input.type);

      // clear the input fields

      UICtrl.clearFields();

      // calculate and update budget

      updateBudget();

      // update the percentages

      updatePercentages();
    };
  }


  var ctrlDeleteItem = function(event) {
    var itemID,
      splitID,
      ID,
      type;

    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
    if (itemID) {


      splitID = itemID.split('-');
      type = splitID[0];
      ID = parseInt(splitID[1]);

      budgetCtrl.deleteItem(type, ID);

      UICtrl.deleteListItem(itemID);

      // update the budget

      updateBudget();

      // update the percentages

      updatePercentages();
    }



  }



  var updateBudget = function() {
    // calculate the budget
    budgetCtrl.calculateBudget();

    // return the budget
    var budget = budgetCtrl.getBudget();

    // display the budget on the ui
    UICtrl.displayBudget(budget);

  }

  return {
    init: function() {
      UICtrl.displayMonth();
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: 0
      })
      return setupEventListeners();
    }
  }




})(budgetcontroller, UIController);

controller.init();

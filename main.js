var budgetController = (function(){
    var Income = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    var Expense = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    
    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome > 0){
        this.percentage = Math.round((this.value/totalIncome) * 100);
    }else{
        this.percentage = -1;
    }                                  
 };
    Expense.prototype.getPercentage = function(){
        return this.percentage;
    };
    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(cur){
            sum += cur.value;                        
        });
        data.totals[type] = sum;
    };
    
    var data = {
        allItems:{
            inc : [],
            exp : []
        },
        totals:{
            inc : 0,
            exp : 0
        },
        budget : 0,
        percentage : -1
    };
    
    return{
      addItem : function(type,des,val){
        var ID,newItem;
        
// creating ID
        if(data.allItems[type].length > 0){
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
    }else{
        ID = 0;
    }
    
// Creating a new Item
    
        if(type === 'exp'){
        newItem = new Expense(ID,des,val);
    }else if(type === 'inc'){
        newItem = new Income(ID,des,val);
    }

//push the type into the object
    data.allItems[type].push(newItem);
//return the object
    return newItem;
    },
        
        deleteItem: function(type,id){
            var ids,index;
            ids = data.allItems[type].map(function(current){
               return current.id;
            });
            index = ids.indexOf(id);
            if(index !== -1){
                data.allItems[type].splice(index,1);
            }
        },
        calculateBudget: function(){
            //calculate budget
            calculateTotal('exp');
            calculateTotal('inc');
            
            //calculate income - expenses
            data.budget = data.totals.inc - data.totals.exp;
            
            //calculate percentage
            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp/data.totals.inc) * 100);
            }else{
                data.percentage = -1;
            }
            
        },
            getBudget : function(){
                return{
                  totalInc : data.totals.inc,
                  totalExp : data.totals.exp,
                  budget : data.budget,
                  percentage : data.percentage
                };
            },
        calculatePercentages: function(){
            data.allItems.exp.forEach(function(cur){
               cur.calcPercentage(data.totals.inc); 
            });
        },
        getPercentages: function(){
            var perAll = data.allItems.exp.map(function(current){
               return current.getPercentage(); 
            });
            return perAll;
        }
    };
})();


var UIController = (function(){
    var DOMStrings = {
        UIType: '.add__type',
        UIDescription: '.add__description',
        UIValue: '.add__value',
        UIButton: '.add__btn',
        UIExpense: '.expenses__list',
        UIIncome: '.income__list',
        budgetLabel : '.budget__value',
        incomeLabel : '.budget__income--value',
        expensesLabel : '.budget__expenses--value',
        percentageLabel : '.budget__expenses--percentage',
        container : '.container',
        percentages: '.item__percentage',
        dateLabel : '.budget__title--month'
    };
var formatNumbers = function(num,type){
    var splitNum,int,dec,type;
    num = Math.abs(num);
    num = num.toFixed(2);
    splitNum = num.split('.');
    int = splitNum[0];
    if(int.length > 3){
        int = int.substr(0,int.length - 3) + ',' +int.substr(int.length - 3,3);
    }        
    dec = splitNum[1];
        
    return (type === 'exp' ? '-' : '+')+' '+int+'.'+dec;
    };
 var nodeListForEach = function(list,callback){
                for(var i = 0; i< list.length; i++){
                    callback(list[i],i);
                }
            };
           
    return{
        getInput: function(){
            return{
                type: document.querySelector(DOMStrings.UIType).value,
                description: document.querySelector(DOMStrings.UIDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.UIValue).value)
            };   
        },
        addListItem: function(obj,type){
          var html,newHtml,element;
            if(type === 'inc'){
                element = DOMStrings.UIIncome;
                 html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }else if(type === 'exp'){
                element = DOMStrings.UIExpense;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            newHtml = html.replace('%id%',obj.id);
            newHtml = newHtml.replace('%description%',obj.description);
            newHtml = newHtml.replace('%value%',formatNumbers(obj.value,type));
           
            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
        },
        deleteListItem: function(selectorID){
        var el = document.getElementById(selectorID);
        el.parentNode.removeChild(el);
    },
        
        clearFields: function(){
         var fields;
            fields = document.querySelectorAll(DOMStrings.UIDescription + ','+ DOMStrings.UIValue);
            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function(current,index,array){
                current.value = "";
            });
            fieldsArr[0].focus();
        },
        
        displayBudget : function(obj){
            var type;
            obj.budget > 0? type = '-' :type = '+';
            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumbers(obj.budget,type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumbers(obj.totalInc,'inc');
            document.querySelector(DOMStrings.expensesLabel).textContent = formatNumbers(obj.totalExp,'exp');
            if(obj.percentage > 0){
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage;
            }else{
                document.querySelector(DOMStrings.percentageLabel).textContent  = '---';
            }
        },
        
        displayPercentages: function(percentages){
          var fields = document.querySelectorAll(DOMStrings.percentages);
            
            nodeListForEach(fields,function(current,index){
                if(percentages[index] > 0){
                    current.textContent = percentages[index] + '%';
                }else{
                    current.textContent = '---';
                }
            });
        },
        displayMonth : function(){
            var now,year,months,month;
            now = new Date();
            year = now.getFullYear();
            months = ['January','february','march','april','may','june','july','august','september','october','november','december'];
            month = now.getMonth();
            document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ' ' + year;
        },
        
        changedEvent : function(){
           var fields = document.querySelectorAll(DOMStrings.UIType + ','+DOMStrings.UIDescription+','+DOMStrings.UIValue); 
            nodeListForEach(fields,function(current){
               current.classList.toggle('red-focus'); 
            });
            document.querySelector(DOMStrings.UIButton).classList.toggle('red');
        },
        getDOMStrings: function(){
        return DOMStrings;
    }
    };
    
    
})();

var mainController = (function(budgetCtrl,UICtrl){
    
var input, newItem;
// Set up event listeners  
    
    var setUpEventListeners = function(){
         var dom = UICtrl.getDOMStrings();
        document.querySelector(dom.UIButton).addEventListener('click',ctrlAddItem);
        document.addEventListener('keypress',function(event){
        if(event.keyCode === 13 || event.which === 13){
            ctrlAddItem();
        }            
    });
        document.querySelector(dom.container).addEventListener('click',ctrlDeleteItem);
        document.querySelector(dom.UIType).addEventListener('change',UICtrl.changedEvent);
    }

    var updateBudget = function(){
        // update the budget
        budgetCtrl.calculateBudget();
        
        //return the budget
        var object = budgetCtrl.getBudget();
        
        //display the budget in UI
        UICtrl.displayBudget(object);
    }
    
    var updatePercentage = function(){
        //update the percentage
        budgetCtrl.calculatePercentages();
        // read the percentage from budget controller
        var percentage = budgetCtrl.getPercentages();
        //display the percentage in UI
        UICtrl.displayPercentages(percentage);
    }
// retrieve input value from UI
    
    var ctrlAddItem = function(){
        // Get the field input data
         input = UICtrl.getInput();
        if(input.description !== "" && input.value > 0 && !isNaN(input.value)){
            //Add the item to the budget controller
        newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            // Add the item to the UI
        UICtrl.addListItem(newItem,input.type);
            // Clear the fields
        UICtrl.clearFields();
            //Update the budget
            updateBudget();
            //update the percentage
            updatePercentage();
        }

    };
    
   var ctrlDeleteItem = function(event){
       var itemID,splitID,type,ID;
       itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
       if(itemID){
           splitID = itemID.split('-');
           type = splitID[0];
           ID = parseInt(splitID[1]);
           budgetCtrl.deleteItem(type,ID);
           UICtrl.deleteListItem(itemID);
           updateBudget();
           updatePercentage();
       }  
   };
    
    return{
        init: function(){
            setUpEventListeners();
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                  totalInc : 0,
                  totalExp : 0,
                  budget : 0,
                  percentage : -1
                });
        }
    }
})(budgetController,UIController);

mainController.init();
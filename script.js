let categoryBudgets = JSON.parse(localStorage.getItem("categoryBudgets")) || {};
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

function saveData() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
  localStorage.setItem("categoryBudgets", JSON.stringify(categoryBudgets));
}

function deleteBudget(category) {
  if (categoryBudgets.hasOwnProperty(category)) {
    if (confirm(`Are you sure you want to delete the budget for "${category}"?`)) {
      delete categoryBudgets[category];         // Remove the budget
      saveData();                               // Save to localStorage
      updateBudgetSummary();                    // Refresh UI
    }
  } else {
    alert("No budget set for this category.");
  }
}

function modifyBudgetPrompt(category) {
  const currentBudget = categoryBudgets[category];
  const newBudget = prompt(`Enter new budget for "${category}":`, currentBudget);

  if (newBudget !== null && !isNaN(newBudget) && Number(newBudget) >= 0) {
    categoryBudgets[category] = Number(newBudget);
    saveData();
    updateBudgetSummary();
  } else if (newBudget !== null) {
    alert("Please enter a valid number.");
  }
}

function updateBudgetSummary() {
  const budgetSummaryEl = document.getElementById("budget-summary");
  budgetSummaryEl.innerHTML = "<h3>Category Budgets</h3>";

  const totals = {};
  transactions.forEach(tx => {
    if (!totals[tx.category]) totals[tx.category] = 0;
    totals[tx.category] += Math.abs(tx.amount);
  });

  for (let cat in categoryBudgets) {
    const spent = totals[cat] || 0;
    const budget = categoryBudgets[cat];
    const statusColor = spent > budget ? "red" : "green";

    const div = document.createElement("div");
    div.innerHTML = `
      <p style="color:${statusColor}">
        <strong>${cat}</strong>: Spent ₹${spent} / Budget ₹${budget}
        <button onclick="modifyBudgetPrompt('${cat}')">Modify</button>
        <button onclick="deleteBudget('${cat}')">Delete</button>
      </p>
    `;
    budgetSummaryEl.appendChild(div);
  }
}

const form = document.getElementById("transaction-form");
const baseCategoryEl = document.getElementById("base-category");
const subCategoryEl = document.getElementById("subcategory");
const newCategoryEl = document.getElementById("new-category");
const budgetCategoryEl = document.getElementById("budget-category");
const transactionList = document.getElementById("transaction-list");

const incomeEl = document.getElementById("income");
const expenseEl = document.getElementById("expense");
const balanceEl = document.getElementById("balance");
const budgetAmountEl = document.getElementById("budget-amount");
const budgetSummaryEl = document.getElementById("budget-summary");

// let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
// let categoryBudgets = JSON.parse(localStorage.getItem("categoryBudgets")) || {};

const defaultCategories = {
  Income: ["Salary", "Gift", "Interest"],
  Expense: ["Food", "Rent", "Shopping", "Utilities"]
};

let customCategories = JSON.parse(localStorage.getItem("customCategories")) || {
  Income: [],
  Expense: []
};

function getAllCategories(type) {
  return [...defaultCategories[type], ...(customCategories[type] || [])];
}

function populateSubcategories() {
  const base = baseCategoryEl.value;
  const categories = getAllCategories(base);
  subCategoryEl.innerHTML = categories.map(c => `<option value="${c}">${c}</option>`).join("");
  populateBudgetDropdown();
}

function addNewCategory() {
  const base = baseCategoryEl.value;
  const newCat = newCategoryEl.value.trim();
  if (newCat && !getAllCategories(base).includes(newCat)) {
    customCategories[base].push(newCat);
    localStorage.setItem("customCategories", JSON.stringify(customCategories));
    populateSubcategories();
    newCategoryEl.value = "";
  }
}

function populateBudgetDropdown() {
  const base = baseCategoryEl.value;
  const categories = getAllCategories(base);
  budgetCategoryEl.innerHTML = categories.map(c => `<option value="${c}">${c}</option>`).join("");
}

function setCategoryBudget() {
  const cat = budgetCategoryEl.value;
  const amt = +budgetAmountEl.value;
  if (cat && amt >= 0) {
    categoryBudgets[cat] = amt;
    localStorage.setItem("categoryBudgets", JSON.stringify(categoryBudgets));
    updateBudgetSummary();
    budgetAmountEl.value = "";
  }
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const description = document.getElementById("description").value;
  const amount = +document.getElementById("amount").value;
  const base = baseCategoryEl.value;
  const category = subCategoryEl.value;

  const transaction = {
    id: Date.now(),
    description,
    amount: base === "Expense" ? -Math.abs(amount) : Math.abs(amount),
    category,
    base
  };

  transactions.push(transaction);
  localStorage.setItem("transactions", JSON.stringify(transactions));
  form.reset();
  populateSubcategories();
  updateUI();
});

function removeTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  localStorage.setItem("transactions", JSON.stringify(transactions));
  updateUI();
}

function updateUI() {
  updateTransactionList();
  updateSummary();
  updateChart();
  updateBudgetSummary();
}

function updateTransactionList() {
  transactionList.innerHTML = "";
  transactions.forEach(tx => {
    const li = document.createElement("li");
    li.innerHTML = `${tx.description} - ₹${Math.abs(tx.amount)} (${tx.category}) 
      <button onclick="removeTransaction(${tx.id})">X</button>`;
    transactionList.appendChild(li);
  });
}

function updateSummary() {
  let income = 0, expense = 0;
  transactions.forEach(tx => {
    if (tx.amount > 0) income += tx.amount;
    else expense += tx.amount;
  });
  incomeEl.textContent = income;
  expenseEl.textContent = Math.abs(expense);
  balanceEl.textContent = income + expense;
}

// function updateBudgetSummary() {
//   budgetSummaryEl.innerHTML = "<h3>Category Budgets</h3>";
//   const totals = {};
//   transactions.forEach(tx => {
//     if (!totals[tx.category]) totals[tx.category] = 0;
//     totals[tx.category] += Math.abs(tx.amount);
//   });

//   for (let cat in categoryBudgets) {
//     const spent = totals[cat] || 0;
//     const budget = categoryBudgets[cat];
//     const statusColor = spent > budget ? "red" : "green";
//     budgetSummaryEl.innerHTML += `
//       <p style="color:${statusColor}">
//         ${cat}: Spent ₹${spent} / Budget ₹${budget}
//       </p>`;
//   }
// }

function updateBudgetSummary() {
  budgetSummaryEl.innerHTML = "<h3>Category Budgets</h3>";
  const totals = {};
  transactions.forEach(tx => {
    if (!totals[tx.category]) totals[tx.category] = 0;
    totals[tx.category] += Math.abs(tx.amount);
  });

  for (let cat in categoryBudgets) {
    const spent = totals[cat] || 0;
    const budget = categoryBudgets[cat];
    const statusColor = spent > budget ? "red" : "green";

    const div = document.createElement("div");
    div.innerHTML = `
      <p style="color:${statusColor}">
        <strong>${cat}</strong>: Spent ₹${spent} / Budget ₹${budget}
        <button onclick="modifyBudgetPrompt('${cat}')" style="margin-left:10px;">Modify</button>
        <button onclick="deleteBudget('${cat}')" style="margin-left:5px;">Delete</button>
      </p>
    `;
    budgetSummaryEl.appendChild(div);
  }
}


function updateChart() {
  const ctx = document.getElementById("chart").getContext("2d");
  const totals = {};
  transactions.forEach(tx => {
    if (tx.base === "Expense") {
      totals[tx.category] = (totals[tx.category] || 0) + Math.abs(tx.amount);
    }
  });

  const data = {
    labels: Object.keys(totals),
    datasets: [{
      label: "Expenses",
      data: Object.values(totals),
      backgroundColor: ["#ff6384", "#36a2eb", "#ffce56", "#4caf50", "#9966ff", "#e74c3c"]
    }]
  };

  if (window.myChart) window.myChart.destroy();
  window.myChart = new Chart(ctx, {
    type: "doughnut",
    data
  });
}

baseCategoryEl.addEventListener("change", populateSubcategories);

document.addEventListener("DOMContentLoaded", () => {
  populateSubcategories();
  updateUI();
});

let incomeChart, expenseChart;

function showChart(type) {
  document.getElementById('incomeChart').style.display = type === 'income' ? 'block' : 'none';
  document.getElementById('expenseChart').style.display = type === 'expense' ? 'block' : 'none';
  if (type === 'income') renderChart('income');
  if (type === 'expense') renderChart('expense');
}

function renderChart(type) {
  const filtered = transactions.filter(tx => 
    (type === 'income' && tx.baseCategory === 'income') ||
    (type === 'expense' && tx.baseCategory === 'expense')
  );

  const totals = {};
  filtered.forEach(tx => {
    if (!totals[tx.category]) totals[tx.category] = 0;
    totals[tx.category] += Math.abs(tx.amount);
  });

  const labels = Object.keys(totals);
  const data = Object.values(totals);

  const chartData = {
    labels,
    datasets: [{
      label: `${type} breakdown`,
      data,
      backgroundColor: [
        '#4caf50', '#ff9800', '#2196f3', '#f44336', '#9c27b0', '#03a9f4'
      ],
      borderWidth: 1
    }]
  };

  const config = {
    type: 'pie',
    data: chartData,
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  };

  const canvas = document.getElementById(`${type}Chart`);
  if (type === 'income' && incomeChart) incomeChart.destroy();
  if (type === 'expense' && expenseChart) expenseChart.destroy();

  if (type === 'income') incomeChart = new Chart(canvas, config);
  if (type === 'expense') expenseChart = new Chart(canvas, config);
}

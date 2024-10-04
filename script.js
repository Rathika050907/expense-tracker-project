// Initialize expenses from localStorage
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let totalRewards = 0; // Global variable to track total rewards

// Add or update an expense
function addOrUpdateExpense() {
    const name = document.getElementById('expense-name').value;
    const amount = parseFloat(document.getElementById('expense-amount').value);
    const category = document.getElementById('expense-category').value;
    const date = document.getElementById('expense-date').value;
    const recurring = document.getElementById('recurring').checked;

    const id = Date.now(); // Unique ID for each expense

    const newExpense = { id, name, amount, category, date, recurring: recurring ? 'monthly' : null };

    expenses.push(newExpense);
    localStorage.setItem('expenses', JSON.stringify(expenses));

    displayExpenses();
    clearForm();
    displayExpenseChart(expenses); // Update chart after adding expense
    checkBudget(); // Check budget after adding expense
    checkRewards(); // Check for rewards after adding expense
}

// Display the expenses
function displayExpenses() {
    const expenseList = document.getElementById('expense-list');
    expenseList.innerHTML = ''; // Clear previous list

    expenses.forEach(expense => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            ${expense.name} - $${expense.amount} - ${expense.category} - ${expense.date}
            <button onclick="editExpense(${expense.id})">Edit</button>
            <button onclick="deleteExpense(${expense.id})">Delete</button>
        `;
        expenseList.appendChild(listItem);
    });
}

// Delete an expense
function deleteExpense(id) {
    expenses = expenses.filter(expense => expense.id !== id);
    localStorage.setItem('expenses', JSON.stringify(expenses));
    displayExpenses();
    displayExpenseChart(expenses); // Update chart after deleting
    checkBudget(); // Recheck budget after deleting
}

// Edit an expense
function editExpense(id) {
    const expense = expenses.find(expense => expense.id === id);

    document.getElementById('expense-name').value = expense.name;
    document.getElementById('expense-amount').value = expense.amount;
    document.getElementById('expense-category').value = expense.category;
    document.getElementById('expense-date').value = expense.date;

    deleteExpense(id);
}

// Clear form after adding or editing an expense
function clearForm() {
    document.getElementById('expense-name').value = '';
    document.getElementById('expense-amount').value = '';
    document.getElementById('expense-category').value = 'Food';
    document.getElementById('expense-date').value = '';
    document.getElementById('recurring').checked = false;
}

// Expense Visualization using Chart.js
function displayExpenseChart(expenses) {
    const categories = {};
    expenses.forEach(expense => {
        categories[expense.category] = (categories[expense.category] || 0) + expense.amount;
    });

    const ctx = document.getElementById('expenseChart').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(categories),
            datasets: [{
                data: Object.values(categories),
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
            }]
        },
        options: {
            responsive: true, // Make the chart responsive
            maintainAspectRatio: false // Allow custom aspect ratio
        }
    });
}

// Budget Limit and Alerts
function setBudget() {
    const budget = document.getElementById('budget').value;
    localStorage.setItem('budget', budget);
    checkBudget();
}

function checkBudget() {
    const budget = localStorage.getItem('budget');
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    if (totalExpenses > budget) {
        alert('You have exceeded your budget!');
    } else if (totalExpenses > 0.8 * budget) {
        alert('Warning: You are close to exceeding your budget.');
    }
}

// Reward Functionality
function checkRewards() {
    const budget = parseFloat(localStorage.getItem('budget'));
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    // Define criteria for rewards
    if (totalExpenses < budget) {
        const savedAmount = budget - totalExpenses; // Amount saved
        const reward = Math.floor(savedAmount * 0.1); // Reward as 10% of saved amount
        totalRewards += reward; // Add reward to total rewards
        alert(`🎉 Congratulations! You have saved $${savedAmount}. You've earned a reward of $${reward}! Total Rewards: $${totalRewards} 💰`);
        displayTotalRewards(); // Update the display for total rewards
        animateReward(); // Trigger animation
    }
}

function displayTotalRewards() {
    const rewardDisplay = document.getElementById('reward-display'); // Ensure you have this element in your HTML
    rewardDisplay.innerHTML = `Total Rewards: 💰 $${totalRewards}`;
}

// Animation for reward display
function animateReward() {
    const rewardDisplay = document.getElementById('reward-display');
    rewardDisplay.classList.add('bounce');
    setTimeout(() => {
        rewardDisplay.classList.remove('bounce');
    }, 300); // Duration of the bounce effect
}

// Currency Conversion
async function convertExpenseCurrency() {
    const fromCurrency = document.getElementById('currency-from').value;
    const toCurrency = document.getElementById('currency-to').value;
    const amount = parseFloat(document.getElementById('expense-amount').value);

    const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`);
    const rates = await response.json();
    
    const convertedAmount = amount * rates.rates[toCurrency];
    alert(`Converted Amount: ${convertedAmount} ${toCurrency}`);
}

// OCR for Receipts using Tesseract.js
function scanReceipt() {
    const receipt = document.getElementById('receipt').files[0];
    if (receipt) {
        Tesseract.recognize(receipt, 'eng')
            .then(({ data: { text } }) => {
                console.log(text);
                // Parse the text and auto-fill the form with extracted data if possible
            });
    }
}

// Export to CSV
function exportToCSV() {
    let csvContent = "data:text/csv;charset=utf-8,";
    expenses.forEach(expense => {
        csvContent += `${expense.name},${expense.amount},${expense.category},${expense.date}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "expenses.csv");
    document.body.appendChild(link);
    link.click();
}

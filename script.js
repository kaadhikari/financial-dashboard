class MultiUserFinancialDashboard {
    constructor() {
        this.users = this.loadUsers();
        this.currentUser = null;
        this.init();
    }

    init() {
        // Event listeners for login
        document.getElementById('login-btn').addEventListener('click', () => this.login());
        document.getElementById('logout-btn').addEventListener('click', () => this.logout());
        
        // Render existing users
        this.renderUserList();
        
        // Set today's date as default
        const today = new Date();
        const formattedToday = today.toISOString().split('T')[0];
        document.getElementById('date').value = formattedToday;
    }

    loadUsers() {
        const saved = localStorage.getItem('financialDashboardUsers');
        return saved ? JSON.parse(saved) : {};
    }

    saveUsers() {
        localStorage.setItem('financialDashboardUsers', JSON.stringify(this.users));
    }

    login() {
        const username = document.getElementById('username').value.trim();
        const jobType = document.getElementById('job-type').value;
        
        if (!username || !jobType) {
            alert('Please enter a username and select your job type');
            return;
        }

        // Create user if doesn't exist
        if (!this.users[username]) {
            this.users[username] = {
                jobType: jobType,
                entries: {},
                paychecks: {},
                createdAt: new Date().toISOString()
            };
            this.saveUsers();
        }

        this.currentUser = username;
        this.showApp();
    }

    logout() {
        this.currentUser = null;
        this.showLogin();
        this.renderUserList();
    }

    showApp() {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('app').style.display = 'block';
        
        this.updateUserInterface();
        this.updateDashboard();
        this.renderHistory();
    }

    showLogin() {
        document.getElementById('login-screen').style.display = 'block';
        document.getElementById('app').style.display = 'none';
        
        document.getElementById('username').value = '';
        document.getElementById('job-type').value = '';
    }

    updateUserInterface() {
        const user = this.users[this.currentUser];
        
        document.getElementById('user-greeting').textContent = this.currentUser;
        document.getElementById('job-type-display').textContent = 
            user.jobType === 'server' ? '💰 Server - Track your daily tips & paycheck' : '💼 Salary - Manage your income & expenses';

        const incomeSection = document.getElementById('income-section');
        if (user.jobType === 'server') {
            incomeSection.innerHTML = `
                <div class="form-group">
                    <label for="income-amount">Daily Tips ($):</label>
                    <input type="number" id="income-amount" min="0" step="0.01" placeholder="Enter tips amount" required>
                </div>
                <div class="form-group">
                    <label><input type="checkbox" id="include-paycheck"> Add paycheck for this month</label>
                </div>
                <div id="paycheck-section" style="display: none;">
                    <div class="form-group">
                        <label for="paycheck-amount">Paycheck Amount ($):</label>
                        <input type="number" id="paycheck-amount" min="0" step="0.01" placeholder="Enter paycheck amount">
                    </div>
                </div>
            `;
            document.getElementById('income-label').textContent = 'Total Income';
        } else {
            incomeSection.innerHTML = `
                <div class="form-group">
                    <label for="income-amount">Income Amount ($):</label>
                    <input type="number" id="income-amount" min="0" step="0.01" placeholder="Enter income amount" required>
                </div>
                <div class="form-group">
                    <label for="income-type">Income Type:</label>
                    <select id="income-type">
                        <option value="Paycheck">Paycheck</option>
                        <option value="Bonus">Bonus</option>
                        <option value="Side Income">Side Income</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
            `;
            document.getElementById('income-label').textContent = 'Total Income';
        }

        const dynamicSection = document.getElementById('dynamic-section');
        if (user.jobType === 'server') {
            dynamicSection.innerHTML = `
                <div class="prediction">
                    <h3>🎯 Best Days for Tips</h3>
                    <div id="prediction-result"></div>
                </div>
                <div class="monthly-overview">
                    <h3>💰 Monthly Paycheck & Tips</h3>
                    <div class="stats-grid">
                        <div class="stat-card">
                            <h3>This Month's Tips</h3>
                            <p id="monthly-tips">$0</p>
                        </div>
                        <div class="stat-card">
                            <h3>This Month's Paycheck</h3>
                            <p id="monthly-paycheck">$0</p>
                        </div>
                        <div class="stat-card">
                            <h3>Total Monthly Income</h3>
                            <p id="total-monthly-income">$0</p>
                        </div>
                    </div>
                    <div class="bills-reminder">
                        <h4>💡 Paycheck Tracker</h4>
                        <p>Remember to add your paycheck at the end of each month!</p>
                        <button id="add-paycheck-btn" class="btn btn-secondary">➕ Add/Update Paycheck</button>
                    </div>
                </div>
            `;
        } else {
            dynamicSection.innerHTML = `
                <div class="monthly-overview">
                    <h3>📅 Monthly Overview</h3>
                    <div class="stats-grid">
                        <div class="stat-card">
                            <h3>This Month's Income</h3>
                            <p id="monthly-income">$0</p>
                        </div>
                        <div class="stat-card">
                            <h3>This Month's Expenses</h3>
                            <p id="monthly-expenses">$0</p>
                        </div>
                    </div>
                    <div class="bills-reminder">
                        <h4>💡 Financial Tips</h4>
                        <p>Track your recurring bills and set savings goals!</p>
                    </div>
                </div>
            `;
        }

        // Setup event listeners AFTER updating the UI
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Clear existing listeners by recreating elements
        const elementsToReset = ['save-entry', 'add-expense', 'clear-user-data', 'add-paycheck-btn'];
        
        elementsToReset.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                const newElement = element.cloneNode(true);
                element.parentNode.replaceChild(newElement, element);
            }
        });

        // Add event listeners
        document.getElementById('save-entry').addEventListener('click', () => this.saveEntry());
        document.getElementById('add-expense').addEventListener('click', () => this.addExpenseField());
        document.getElementById('clear-user-data').addEventListener('click', () => this.clearUserData());

        // Add paycheck button listener if it exists
        const paycheckBtn = document.getElementById('add-paycheck-btn');
        if (paycheckBtn) {
            paycheckBtn.addEventListener('click', () => this.showPaycheckModal());
        }

        // Add paycheck checkbox listener if it exists
        const paycheckCheckbox = document.getElementById('include-paycheck');
        if (paycheckCheckbox) {
            paycheckCheckbox.addEventListener('change', (e) => {
                document.getElementById('paycheck-section').style.display = e.target.checked ? 'block' : 'none';
            });
        }

        // Add remove expense listeners
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-expense')) {
                const container = document.getElementById('expenses-container');
                if (container.children.length > 1) {
                    container.removeChild(e.target.parentElement);
                }
            }
        });
    }

    renderUserList() {
        const userList = document.getElementById('user-list');
        const usernames = Object.keys(this.users);
        
        if (usernames.length === 0) {
            userList.innerHTML = '<p>No existing users. Create your profile!</p>';
            return;
        }

        userList.innerHTML = '<h3>Existing Users:</h3>';
        usernames.forEach(username => {
            const userBtn = document.createElement('button');
            userBtn.className = 'btn user-btn';
            userBtn.textContent = `${username} (${this.users[username].jobType})`;
            userBtn.onclick = () => {
                document.getElementById('username').value = username;
                document.getElementById('job-type').value = this.users[username].jobType;
            };
            userList.appendChild(userBtn);
        });
    }

    saveEntry() {
        if (!this.currentUser) {
            alert('Please log in first');
            return;
        }

        const dateInput = document.getElementById('date').value;
        const date = new Date(dateInput + 'T00:00:00').toISOString().split('T')[0];
        const incomeInput = document.getElementById('income-amount').value;
        
        if (!dateInput || !incomeInput) {
            alert('Please enter a valid date and income amount');
            return;
        }

        const income = parseFloat(incomeInput);
        const user = this.users[this.currentUser];
        
        if (isNaN(income) || income < 0) {
            alert('Please enter a valid income amount');
            return;
        }

        // Collect expenses
        const expenses = [];
        const expenseEntries = document.querySelectorAll('.expense-entry');
        
        expenseEntries.forEach(entry => {
            const category = entry.querySelector('.expense-category').value;
            const amountInput = entry.querySelector('.expense-amount').value;
            
            if (amountInput && amountInput !== '') {
                const amount = parseFloat(amountInput);
                if (!isNaN(amount) && amount > 0) {
                    expenses.push({ category, amount });
                }
            }
        });

        // Handle paycheck for servers
        if (user.jobType === 'server') {
            const includePaycheck = document.getElementById('include-paycheck').checked;
            if (includePaycheck) {
                const paycheckAmountInput = document.getElementById('paycheck-amount').value;
                if (paycheckAmountInput && paycheckAmountInput !== '') {
                    const paycheckAmount = parseFloat(paycheckAmountInput);
                    if (!isNaN(paycheckAmount) && paycheckAmount > 0) {
                        const monthYear = new Date(dateInput).toISOString().slice(0, 7);
                        user.paychecks[monthYear] = paycheckAmount;
                        console.log('Paycheck saved:', monthYear, paycheckAmount);
                    }
                }
            }
        }

        // Save entry
        const entryData = {
            income,
            expenses,
            jobType: user.jobType
        };

        if (user.jobType === 'salary') {
            entryData.incomeType = document.getElementById('income-type').value;
        }

        user.entries[date] = entryData;
        this.saveUsers();
        
        this.updateDashboard();
        this.renderHistory();
        this.clearForm();
        
        alert('✅ Entry saved successfully for ' + new Date(dateInput).toLocaleDateString() + '!');
    }

    showPaycheckModal() {
        const currentMonth = new Date().toISOString().slice(0, 7);
        const user = this.users[this.currentUser];
        const currentPaycheck = user.paychecks[currentMonth] || 0;
        
        const amount = prompt(`Enter paycheck amount for ${new Date().toLocaleDateString('en', { month: 'long', year: 'numeric' })}:`, currentPaycheck || '');
        
        if (amount !== null) {
            const paycheckAmount = parseFloat(amount);
            if (!isNaN(paycheckAmount) && paycheckAmount >= 0) {
                user.paychecks[currentMonth] = paycheckAmount;
                this.saveUsers();
                this.updateDashboard();
                alert('✅ Paycheck updated successfully!');
            } else {
                alert('Please enter a valid amount');
            }
        }
    }

    addExpenseField() {
        const container = document.getElementById('expenses-container');
        const newEntry = document.createElement('div');
        newEntry.className = 'expense-entry';
        newEntry.innerHTML = `
            <select class="expense-category">
                <option value="Food">Food</option>
                <option value="Amazon">Amazon</option>
                <option value="Shopping">Shopping</option>
                <option value="Beauty">Beauty (Nails/Hair)</option>
                <option value="Coffee">Coffee</option>
                <option value="Rent">Rent</option>
                <option value="Car Payment">Car Payment</option>
                <option value="Insurance">Insurance</option>
                <option value="Gas">Gas</option>
                <option value="Other">Other</option>
            </select>
            <input type="number" class="expense-amount" min="0" step="0.01" placeholder="Amount">
            <button type="button" class="remove-expense">×</button>
        `;
        
        container.appendChild(newEntry);
    }

    clearForm() {
        document.getElementById('income-amount').value = '';
        
        const container = document.getElementById('expenses-container');
        while (container.children.length > 1) {
            container.removeChild(container.lastChild);
        }
        
        const firstEntry = container.children[0];
        firstEntry.querySelector('.expense-category').value = 'Food';
        firstEntry.querySelector('.expense-amount').value = '';
        
        if (this.users[this.currentUser].jobType === 'server') {
            document.getElementById('include-paycheck').checked = false;
            document.getElementById('paycheck-section').style.display = 'none';
            document.getElementById('paycheck-amount').value = '';
        } else {
            document.getElementById('income-type').value = 'Paycheck';
        }
        
        const today = new Date();
        const formattedToday = today.toISOString().split('T')[0];
        document.getElementById('date').value = formattedToday;
    }

    updateDashboard() {
        if (!this.currentUser) return;
        
        const user = this.users[this.currentUser];
        const entriesArray = Object.values(user.entries);
        
        const totalIncome = entriesArray.reduce((sum, entry) => sum + entry.income, 0);
        const totalExpenses = entriesArray.reduce((sum, entry) => 
            sum + entry.expenses.reduce((expSum, exp) => expSum + exp.amount, 0), 0
        );
        
        let totalWithPaychecks = totalIncome;
        if (user.jobType === 'server') {
            const totalPaychecks = Object.values(user.paychecks).reduce((sum, amount) => sum + amount, 0);
            totalWithPaychecks = totalIncome + totalPaychecks;
        }
        
        const netSavings = totalWithPaychecks - totalExpenses;

        document.getElementById('total-income').textContent = `$${totalWithPaychecks.toFixed(2)}`;
        document.getElementById('total-expenses').textContent = `$${totalExpenses.toFixed(2)}`;
        document.getElementById('net-savings').textContent = `$${netSavings.toFixed(2)}`;

        this.updateCategoryBreakdown();
        
        if (user.jobType === 'server') {
            this.updatePredictions();
            this.updateServerMonthlyOverview();
        } else {
            this.updateMonthlyOverview();
        }
    }

    updateServerMonthlyOverview() {
        const user = this.users[this.currentUser];
        const currentMonth = new Date().toISOString().slice(0, 7);
        const currentPaycheck = user.paychecks[currentMonth] || 0;
        
        const monthlyTips = Object.entries(user.entries)
            .filter(([date, entry]) => date.startsWith(currentMonth))
            .reduce((sum, [date, entry]) => sum + entry.income, 0);
        
        const totalMonthlyIncome = monthlyTips + currentPaycheck;

        document.getElementById('monthly-tips').textContent = `$${monthlyTips.toFixed(2)}`;
        document.getElementById('monthly-paycheck').textContent = `$${currentPaycheck.toFixed(2)}`;
        document.getElementById('total-monthly-income').textContent = `$${totalMonthlyIncome.toFixed(2)}`;
    }

    updateCategoryBreakdown() {
        const user = this.users[this.currentUser];
        const categoryTotals = {};
        
        Object.values(user.entries).forEach(entry => {
            entry.expenses.forEach(expense => {
                categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
            });
        });

        const categoryChart = document.getElementById('category-chart');
        categoryChart.innerHTML = '';

        if (Object.keys(categoryTotals).length === 0) {
            categoryChart.innerHTML = '<p>No expenses recorded yet</p>';
            return;
        }

        Object.entries(categoryTotals).forEach(([category, amount]) => {
            const item = document.createElement('div');
            item.className = 'category-item';
            item.innerHTML = `
                <span>${category}</span>
                <span>$${amount.toFixed(2)}</span>
            `;
            categoryChart.appendChild(item);
        });
    }

    updatePredictions() {
        const user = this.users[this.currentUser];
        const predictionResult = document.getElementById('prediction-result');
        
        if (Object.keys(user.entries).length < 3) {
            predictionResult.innerHTML = '<p>Add more data (at least 3 days) to see predictions</p>';
            return;
        }

        const dayAverages = {};
        Object.entries(user.entries).forEach(([date, entry]) => {
            const dayName = new Date(date + 'T00:00:00').toLocaleDateString('en', { weekday: 'long' });
            if (!dayAverages[dayName]) {
                dayAverages[dayName] = { total: 0, count: 0 };
            }
            dayAverages[dayName].total += entry.income;
            dayAverages[dayName].count += 1;
        });

        const sortedDays = Object.entries(dayAverages)
            .map(([day, data]) => ({
                day,
                average: data.total / data.count
            }))
            .sort((a, b) => b.average - a.average);

        predictionResult.innerHTML = '';
        sortedDays.forEach(dayData => {
            const item = document.createElement('div');
            item.className = 'prediction-item';
            item.innerHTML = `
                <strong>${dayData.day}</strong>: $${dayData.average.toFixed(2)} average
            `;
            predictionResult.appendChild(item);
        });
    }

    updateMonthlyOverview() {
        const user = this.users[this.currentUser];
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        const monthlyEntries = Object.entries(user.entries).filter(([date, entry]) => {
            const entryDate = new Date(date + 'T00:00:00');
            return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
        });

        const monthlyIncome = monthlyEntries.reduce((sum, [date, entry]) => sum + entry.income, 0);
        const monthlyExpenses = monthlyEntries.reduce((sum, [date, entry]) => 
            sum + entry.expenses.reduce((expSum, exp) => expSum + exp.amount, 0), 0
        );

        document.getElementById('monthly-income').textContent = `$${monthlyIncome.toFixed(2)}`;
        document.getElementById('monthly-expenses').textContent = `$${monthlyExpenses.toFixed(2)}`;
    }

    renderHistory() {
        if (!this.currentUser) return;
        
        const user = this.users[this.currentUser];
        const entriesList = document.getElementById('entries-list');
        entriesList.innerHTML = '';

        const sortedDates = Object.keys(user.entries).sort().reverse();

        if (sortedDates.length === 0) {
            entriesList.innerHTML = '<p>No entries yet. Start by adding your first entry!</p>';
            return;
        }

        sortedDates.forEach(date => {
            const entry = user.entries[date];
            const entryElement = document.createElement('div');
            entryElement.className = 'entry-item';
            
            const expensesList = entry.expenses.map(exp => 
                `${exp.category}: $${exp.amount.toFixed(2)}`
            ).join(', ');

            const incomeType = entry.incomeType ? ` (${entry.incomeType})` : '';
            const displayDate = new Date(date + 'T00:00:00').toLocaleDateString();
            
            entryElement.innerHTML = `
                <strong>${displayDate}</strong>
                <div>Income: $${entry.income.toFixed(2)}${incomeType}</div>
                <div class="expense-detail">Expenses: ${expensesList || 'None'}</div>
            `;
            
            entriesList.appendChild(entryElement);
        });

        if (user.jobType === 'server' && Object.keys(user.paychecks).length > 0) {
            const paycheckHeader = document.createElement('h3');
            paycheckHeader.textContent = '💰 Paycheck History';
            paycheckHeader.style.marginTop = '30px';
            paycheckHeader.style.marginBottom = '15px';
            entriesList.appendChild(paycheckHeader);

            const sortedPaychecks = Object.keys(user.paychecks).sort().reverse();
            
            sortedPaychecks.forEach(monthYear => {
                const paycheckElement = document.createElement('div');
                paycheckElement.className = 'entry-item';
                paycheckElement.style.borderLeftColor = '#f59e0b';
                
                const monthName = new Date(monthYear + '-01').toLocaleDateString('en', { month: 'long', year: 'numeric' });
                
                paycheckElement.innerHTML = `
                    <strong>${monthName} Paycheck</strong>
                    <div>Amount: $${user.paychecks[monthYear].toFixed(2)}</div>
                `;
                
                entriesList.appendChild(paycheckElement);
            });
        }
    }

    showEmptyState() {
        document.getElementById('total-income').textContent = '$0';
        document.getElementById('total-expenses').textContent = '$0';
        document.getElementById('net-savings').textContent = '$0';
        document.getElementById('category-chart').innerHTML = '<p>No data yet</p>';
        
        const dynamicSection = document.getElementById('dynamic-section');
        if (dynamicSection.querySelector('#prediction-result')) {
            document.getElementById('prediction-result').innerHTML = '<p>Add some data to see predictions</p>';
        }
        if (dynamicSection.querySelector('#monthly-tips')) {
            document.getElementById('monthly-tips').textContent = '$0';
            document.getElementById('monthly-paycheck').textContent = '$0';
            document.getElementById('total-monthly-income').textContent = '$0';
        }
    }

    clearUserData() {
        if (!this.currentUser) return;
        
        if (confirm('Are you sure you want to clear ALL your data? This cannot be undone.')) {
            this.users[this.currentUser].entries = {};
            this.users[this.currentUser].paychecks = {};
            this.saveUsers();
            this.updateDashboard();
            this.renderHistory();
            alert('Your data has been cleared!');
        }
    }
}

// Initialize the multi-user dashboard
document.addEventListener('DOMContentLoaded', () => {
    new MultiUserFinancialDashboard();
});

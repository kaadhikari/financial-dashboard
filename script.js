class MultiUserFinancialDashboard {
    constructor() {
        this.users = this.loadUsers();
        this.currentUser = null;
        this.init();
    }

    init() {
        // Basic event listeners that won't break
        document.getElementById('login-btn').onclick = () => this.login();
        document.getElementById('logout-btn').onclick = () => this.logout();
        
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

        // Simple income section - no dynamic event listeners
        const incomeSection = document.getElementById('income-section');
        if (user.jobType === 'server') {
            incomeSection.innerHTML = `
                <div class="form-group">
                    <label for="income-amount">Daily Tips ($):</label>
                    <input type="number" id="income-amount" min="0" step="0.01" placeholder="Enter tips amount" required>
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

        // Simple dynamic section
        const dynamicSection = document.getElementById('dynamic-section');
        if (user.jobType === 'server') {
            dynamicSection.innerHTML = `
                <div class="prediction">
                    <h3>🎯 Best Days for Tips</h3>
                    <div id="prediction-result"></div>
                </div>
                <div class="monthly-overview">
                    <h3>💰 Monthly Overview</h3>
                    <div class="stats-grid">
                        <div class="stat-card">
                            <h3>This Month's Tips</h3>
                            <p id="monthly-tips">$0</p>
                        </div>
                        <div class="stat-card">
                            <h3>This Month's Expenses</h3>
                            <p id="monthly-expenses">$0</p>
                        </div>
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
                </div>
            `;
        }

        // SIMPLE event listeners - no complex cloning
        document.getElementById('save-entry').onclick = () => this.saveEntry();
        document.getElementById('add-expense').onclick = () => this.addExpenseField();
        document.getElementById('clear-user-data').onclick = () => this.clearUserData();
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
        console.log('Save button clicked!'); // Debug line
        
        if (!this.currentUser) {
            alert('Please log in first');
            return;
        }

        const dateInput = document.getElementById('date').value;
        const incomeInput = document.getElementById('income-amount').value;
        
        console.log('Date:', dateInput, 'Income:', incomeInput); // Debug line
        
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

        // Save entry
        const entryData = {
            income,
            expenses,
            jobType: user.jobType
        };

        if (user.jobType === 'salary') {
            entryData.incomeType = document.getElementById('income-type').value;
        }

        // Fix timezone issue
        const date = new Date(dateInput + 'T00:00:00').toISOString().split('T')[0];
        user.entries[date] = entryData;
        
        console.log('Saving entry:', date, entryData); // Debug line
        
        this.saveUsers();
        this.updateDashboard();
        this.renderHistory();
        this.clearForm();
        
        alert('✅ Entry saved successfully for ' + new Date(dateInput).toLocaleDateString() + '!');
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
            <button type="button" class="remove-expense" onclick="this.parentElement.remove()">×</button>
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
        
        if (this.users[this.currentUser].jobType === 'salary') {
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
        
        const netSavings = totalIncome - totalExpenses;

        document.getElementById('total-income').textContent = `$${totalIncome.toFixed(2)}`;
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
        
        const monthlyTips = Object.entries(user.entries)
            .filter(([date, entry]) => date.startsWith(currentMonth))
            .reduce((sum, [date, entry]) => sum + entry.income, 0);

        const monthlyExpenses = Object.entries(user.entries)
            .filter(([date, entry]) => date.startsWith(currentMonth))
            .reduce((sum, [date, entry]) => 
                sum + entry.expenses.reduce((expSum, exp) => expSum + exp.amount, 0), 0
            );

        document.getElementById('monthly-tips').textContent = `$${monthlyTips.toFixed(2)}`;
        document.getElementById('monthly-expenses').textContent = `$${monthlyExpenses.toFixed(2)}`;
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

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', () => {
    new MultiUserFinancialDashboard();
});
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
        document.getElementById('date').valueAsDate = new Date();
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
        this.setupEventListeners();
        this.updateDashboard();
        this.renderHistory();
    }

    showLogin() {
        document.getElementById('login-screen').style.display = 'block';
        document.getElementById('app').style.display = 'none';
        
        // Clear form
        document.getElementById('username').value = '';
        document.getElementById('job-type').value = '';
    }

    updateUserInterface() {
        const user = this.users[this.currentUser];
        
        // Update greetings and job type display
        document.getElementById('user-greeting').textContent = this.currentUser;
        document.getElementById('job-type-display').textContent = 
            user.jobType === 'server' ? 'Server/Tips-based Tracking' : 'Salary-based Financial Tracking';

        // Update income section based on job type
        const incomeSection = document.getElementById('income-section');
        if (user.jobType === 'server') {
            incomeSection.innerHTML = `
                <div class="form-group">
                    <label for="income-amount">Daily Tips ($):</label>
                    <input type="number" id="income-amount" min="0" step="0.01" required>
                </div>
            `;
            document.getElementById('income-label').textContent = 'Total Tips';
        } else {
            incomeSection.innerHTML = `
                <div class="form-group">
                    <label for="income-amount">Income Amount ($):</label>
                    <input type="number" id="income-amount" min="0" step="0.01" required>
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

        // Update dynamic section
        const dynamicSection = document.getElementById('dynamic-section');
        if (user.jobType === 'server') {
            dynamicSection.innerHTML = `
                <div class="prediction">
                    <h3>🎯 Best Days for Tips</h3>
                    <div id="prediction-result"></div>
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
    }

    setupEventListeners() {
        // Remove existing listeners to avoid duplicates
        document.getElementById('save-entry').replaceWith(document.getElementById('save-entry').cloneNode(true));
        document.getElementById('add-expense').replaceWith(document.getElementById('add-expense').cloneNode(true));
        document.getElementById('clear-user-data').replaceWith(document.getElementById('clear-user-data').cloneNode(true));

        // Add new listeners
        document.getElementById('save-entry').addEventListener('click', () => this.saveEntry());
        document.getElementById('add-expense').addEventListener('click', () => this.addExpenseField());
        document.getElementById('clear-user-data').addEventListener('click', () => this.clearUserData());
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

    // ... (rest of the methods like saveEntry, addExpenseField, updateDashboard, etc. 
    // will be similar but now they'll use this.currentUser and this.users[this.currentUser].entries)

    saveEntry() {
        if (!this.currentUser) return;

        const date = document.getElementById('date').value;
        const income = parseFloat(document.getElementById('income-amount').value);
        const user = this.users[this.currentUser];
        
        if (!date || isNaN(income)) {
            alert('Please enter a valid date and income amount');
            return;
        }

        // Collect expenses
        const expenses = [];
        const expenseEntries = document.querySelectorAll('.expense-entry');
        
        expenseEntries.forEach(entry => {
            const category = entry.querySelector('.expense-category').value;
            const amount = parseFloat(entry.querySelector('.expense-amount').value);
            
            if (!isNaN(amount) && amount > 0) {
                expenses.push({ category, amount });
            }
        });

        // Save entry with additional data for salary users
        const entryData = {
            income,
            expenses,
            jobType: user.jobType
        };

        // Add income type for salary users
        if (user.jobType === 'salary') {
            entryData.incomeType = document.getElementById('income-type').value;
        }

        user.entries[date] = entryData;
        this.saveUsers();
        
        this.updateDashboard();
        this.renderHistory();
        this.clearForm();
        
        alert('Entry saved successfully!');
    }

    // ... (other methods will be adapted similarly)

    clearUserData() {
        if (confirm('Are you sure you want to clear ALL your data? This cannot be undone.')) {
            this.users[this.currentUser].entries = {};
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
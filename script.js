// Enhanced Attendance Tracker with Color Themes
class AttendanceTracker {
    constructor() {
        this.subjects = [];
        this.target = 75;
        this.isDarkMode = false;
        this.currentTheme = 'default';
        this.currentChart = null;
        this.chartType = 'doughnut';
        
        this.initializeElements();
        this.loadData();
        this.setupEventListeners();
        this.applyTheme();
        this.updateAllDisplays();
    }

    initializeElements() {
        this.elements = {
            // Navigation
            darkModeToggle: document.getElementById('dark-mode-toggle'),
            themeToggle: document.getElementById('theme-toggle'),
            dashboardTab: document.getElementById('dashboard-tab'),
            analyticsTab: document.getElementById('analytics-tab'),
            
            // Tab Contents
            dashboardContent: document.getElementById('dashboard-content'),
            analyticsContent: document.getElementById('analytics-content'),
            
            // Dashboard
            targetInput: document.getElementById('target-input'),
            totalClassesStat: document.getElementById('total-classes-stat'),
            attendedClassesStat: document.getElementById('attended-classes-stat'),
            missedClassesStat: document.getElementById('missed-classes-stat'),
            subjectsGrid: document.getElementById('subjects-grid'),
            addSubjectBtn: document.getElementById('add-subject-btn'),
            
            // Analytics
            chartTypeSelector: document.getElementById('chart-type-selector'),
            mainChart: document.getElementById('main-chart'),
            overallPercentage: document.getElementById('overall-percentage'),
            overallStatus: document.getElementById('overall-status'),
            achievementBadge: document.getElementById('achievement-badge'),
            motivationalMessage: document.getElementById('motivational-message'),
            targetCalculation: document.getElementById('target-calculation'),
            
            // Theme Modal
            themeModal: document.getElementById('theme-modal'),
            closeThemeModal: document.getElementById('close-theme-modal'),
            themeOptions: document.querySelectorAll('.theme-option')
        };
    }

    loadData() {
        try {
            const data = {
                subjects: localStorage.getItem('attendance_subjects'),
                target: localStorage.getItem('attendance_target'),
                darkMode: localStorage.getItem('attendance_dark_mode'),
                theme: localStorage.getItem('attendance_theme')
            };

            if (data.subjects) this.subjects = JSON.parse(data.subjects);
            if (data.target) {
                this.target = parseFloat(data.target);
                this.elements.targetInput.value = this.target;
            }
            if (data.darkMode === 'true') {
                this.isDarkMode = true;
            }
            if (data.theme) {
                this.currentTheme = data.theme;
            }
        } catch (error) {
            console.error('Error loading data:', error);
            this.resetData();
        }
    }

    saveData() {
        try {
            localStorage.setItem('attendance_subjects', JSON.stringify(this.subjects));
            localStorage.setItem('attendance_target', this.target.toString());
            localStorage.setItem('attendance_dark_mode', this.isDarkMode.toString());
            localStorage.setItem('attendance_theme', this.currentTheme);
        } catch (error) {
            console.error('Error saving data:', error);
        }
    }

    resetData() {
        this.subjects = [];
        this.target = 75;
        this.currentTheme = 'default';
        this.elements.targetInput.value = 75;
        this.saveData();
    }

    setupEventListeners() {
        // Dark Mode Toggle
        this.elements.darkModeToggle.addEventListener('click', () => {
            this.isDarkMode = !this.isDarkMode;
            this.applyDarkMode();
            this.saveData();
        });

        // Theme Toggle
        this.elements.themeToggle.addEventListener('click', () => {
            this.showThemeModal();
        });

        // Close Theme Modal
        this.elements.closeThemeModal.addEventListener('click', () => {
            this.hideThemeModal();
        });

        // Theme Options
        this.elements.themeOptions.forEach(option => {
            option.addEventListener('click', () => {
                const theme = option.dataset.theme;
                this.changeTheme(theme);
            });
        });

        // Close modal on outside click
        this.elements.themeModal.addEventListener('click', (e) => {
            if (e.target === this.elements.themeModal) {
                this.hideThemeModal();
            }
        });

        // Tab Navigation
        this.elements.dashboardTab.addEventListener('click', () => this.showTab('dashboard'));
        this.elements.analyticsTab.addEventListener('click', () => this.showTab('analytics'));

        // Dashboard
        this.elements.addSubjectBtn.addEventListener('click', () => this.addSubject());
        this.elements.targetInput.addEventListener('input', (e) => this.updateTarget(e.target.value));

        // Analytics
        this.elements.chartTypeSelector.addEventListener('change', (e) => this.changeChartType(e.target.value));
    }

    // Theme Management
    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        this.applyDarkMode();
        
        // Update selected theme in modal
        this.elements.themeOptions.forEach(option => {
            option.classList.remove('selected');
            if (option.dataset.theme === this.currentTheme) {
                option.classList.add('selected');
            }
        });
    }

    changeTheme(theme) {
        this.currentTheme = theme;
        this.applyTheme();
        this.saveData();
        this.hideThemeModal();
        
        // Update chart colors if chart exists
        if (this.currentChart) {
            setTimeout(() => this.initializeChart(), 100);
        }
    }

    showThemeModal() {
        this.elements.themeModal.classList.remove('hidden');
        this.elements.themeModal.querySelector('.card-bg').classList.add('modal-enter');
    }

    hideThemeModal() {
        this.elements.themeModal.classList.add('hidden');
    }

    // Fixed Dark Mode Application
    applyDarkMode() {
        const body = document.body;
        const toggle = this.elements.darkModeToggle;
        
        if (this.isDarkMode) {
            body.classList.add('dark-mode');
            toggle.textContent = '☀️';
        } else {
            body.classList.remove('dark-mode');
            toggle.textContent = '🌙';
        }
    }

    showTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`${tabName}-tab`).classList.add('active');
        
        // Update content
        document.querySelectorAll('.tab-content').forEach(content => content.classList.add('hidden'));
        document.getElementById(`${tabName}-content`).classList.remove('hidden');
        
        // Initialize chart if switching to analytics
        if (tabName === 'analytics') {
            setTimeout(() => this.initializeChart(), 100);
        }
    }

    addSubject() {
        const newSubject = {
            id: Date.now(),
            name: 'New Subject',
            totalClasses: 0,
            attendedClasses: 0
        };
        this.subjects.push(newSubject);
        this.saveData();
        this.renderSubjects();
        this.updateStats();
    }

    updateSubject(id, field, value) {
        const subject = this.subjects.find(s => s.id === id);
        if (subject) {
            if (field === 'name') {
                subject.name = value || 'Unnamed Subject';
            } else {
                const numValue = Math.max(0, parseInt(value) || 0);
                subject[field] = numValue;
                
                if (field === 'totalClasses' && subject.attendedClasses > numValue) {
                    subject.attendedClasses = numValue;
                } else if (field === 'attendedClasses' && numValue > subject.totalClasses) {
                    subject.attendedClasses = subject.totalClasses;
                }
            }
            this.saveData();
            this.renderSubjects();
            this.updateAllDisplays();
        }
    }

    removeSubject(id) {
        if (confirm('Are you sure you want to remove this subject?')) {
            this.subjects = this.subjects.filter(subject => subject.id !== id);
            this.saveData();
            this.renderSubjects();
            this.updateAllDisplays();
        }
    }

    updateTarget(value) {
        const numValue = Math.min(100, Math.max(0, parseFloat(value) || 0));
        this.target = numValue;
        this.elements.targetInput.value = numValue;
        this.saveData();
        this.updateAllDisplays();
    }

    renderSubjects() {
        this.elements.subjectsGrid.innerHTML = '';
        
        this.subjects.forEach(subject => {
            const percentage = this.calculatePercentage(subject.attendedClasses, subject.totalClasses);
            const status = this.getStatusInfo(percentage);

            const subjectCard = document.createElement('div');
            subjectCard.className = 'subject-card';
            subjectCard.innerHTML = `
                <div class="flex justify-between items-center mb-4">
                    <input 
                        type="text" 
                        value="${subject.name}" 
                        class="text-lg font-semibold bg-transparent border-none outline-none flex-1 p-1 rounded focus:bg-gray-50 transition-colors duration-300"
                        onchange="tracker.updateSubject(${subject.id}, 'name', this.value)"
                    >
                    <button 
                        onclick="tracker.removeSubject(${subject.id})"
                        class="text-red-500 hover:text-red-700 ml-2 p-1 rounded hover:bg-red-50 transition-colors duration-300"
                        title="Remove Subject"
                    >
                        🗑️
                    </button>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Total Classes</label>
                        <input 
                            type="number" 
                            value="${subject.totalClasses}" 
                            min="0"
                            class="w-full p-2 border border-gray-300 rounded focus:border-primary focus:outline-none transition-colors duration-300"
                            onchange="tracker.updateSubject(${subject.id}, 'totalClasses', this.value)"
                        >
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Attended</label>
                        <input 
                            type="number" 
                            value="${subject.attendedClasses}" 
                            min="0" 
                            max="${subject.totalClasses}"
                            class="w-full p-2 border border-gray-300 rounded focus:border-primary focus:outline-none transition-colors duration-300"
                            onchange="tracker.updateSubject(${subject.id}, 'attendedClasses', this.value)"
                        >
                    </div>
                </div>

                <div class="text-center">
                    <div class="text-2xl sm:text-3xl font-bold ${status.class} mb-1">
                        ${percentage}% ${status.emoji}
                    </div>
                    <div class="text-sm text-gray-600">
                        ${status.text}
                    </div>
                </div>
            `;

            this.elements.subjectsGrid.appendChild(subjectCard);
        });
    }

    updateStats() {
        const totalClasses = this.subjects.reduce((sum, subject) => sum + subject.totalClasses, 0);
        const attendedClasses = this.subjects.reduce((sum, subject) => sum + subject.attendedClasses, 0);
        const missedClasses = totalClasses - attendedClasses;
        
        this.elements.totalClassesStat.textContent = totalClasses;
        this.elements.attendedClassesStat.textContent = attendedClasses;
        this.elements.missedClassesStat.textContent = missedClasses;
    }

    changeChartType(type) {
        this.chartType = type;
        this.initializeChart();
    }

    initializeChart() {
        if (this.currentChart) {
            this.currentChart.destroy();
        }
        
        const ctx = this.elements.mainChart.getContext('2d');
        
        const config = {
            type: this.chartType,
            data: this.getChartData(),
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom'
                    }
                }
            }
        };
        
        this.currentChart = new Chart(ctx, config);
    }

    getChartData() {
        const totalClasses = this.subjects.reduce((sum, subject) => sum + subject.totalClasses, 0);
        const attendedClasses = this.subjects.reduce((sum, subject) => sum + subject.attendedClasses, 0);
        
        // Get theme color
        const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim() || '#3b82f6';
        
        switch (this.chartType) {
            case 'doughnut':
                return {
                    labels: ['Attended', 'Missed'],
                    datasets: [{
                        data: [attendedClasses, totalClasses - attendedClasses],
                        backgroundColor: ['#10b981', '#ef4444'],
                        borderWidth: 0
                    }]
                };
            
            case 'bar':
                return {
                    labels: this.subjects.map(s => s.name),
                    datasets: [{
                        label: 'Attended',
                        data: this.subjects.map(s => s.attendedClasses),
                        backgroundColor: '#10b981'
                    }, {
                        label: 'Total',
                        data: this.subjects.map(s => s.totalClasses),
                        backgroundColor: primaryColor
                    }]
                };
            
            case 'line':
                return {
                    labels: this.subjects.map(s => s.name),
                    datasets: [{
                        label: 'Attendance %',
                        data: this.subjects.map(s => this.calculatePercentage(s.attendedClasses, s.totalClasses)),
                        borderColor: primaryColor,
                        backgroundColor: primaryColor + '20',
                        fill: true
                    }]
                };
            
            case 'radar':
                return {
                    labels: this.subjects.map(s => s.name),
                    datasets: [{
                        label: 'Attendance %',
                        data: this.subjects.map(s => this.calculatePercentage(s.attendedClasses, s.totalClasses)),
                        backgroundColor: primaryColor + '40',
                        borderColor: primaryColor,
                        borderWidth: 2
                    }]
                };
            
            default:
                return { labels: [], datasets: [] };
        }
    }

    calculatePercentage(attended, total) {
        return total > 0 ? Math.round((attended / total) * 100) : 0;
    }

    getStatusInfo(percentage) {
        if (percentage >= 85) {
            return { class: 'status-excellent', emoji: '🌟', text: 'Excellent' };
        } else if (percentage >= 75) {
            return { class: 'status-excellent', emoji: '✅', text: 'Great' };
        } else if (percentage >= 65) {
            return { class: 'status-good', emoji: '⚠️', text: 'Warning' };
        } else {
            return { class: 'status-needs-improvement', emoji: '❌', text: 'Needs Improvement' };
        }
    }

    getAchievementBadge(percentage) {
        if (percentage >= 95) return '💎 Diamond Elite';
        if (percentage >= 85) return '🥇 Gold Star';
        if (percentage >= 75) return '🥈 Silver Standard';
        if (percentage >= 65) return '🥉 Bronze Level';
        return '🎯 Building Progress';
    }

    updateAllDisplays() {
        this.updateStats();
        this.updateOverallAnalytics();
        if (this.currentChart) {
            this.currentChart.data = this.getChartData();
            this.currentChart.update();
        }
    }

    updateOverallAnalytics() {
        const totalClasses = this.subjects.reduce((sum, subject) => sum + subject.totalClasses, 0);
        const attendedClasses = this.subjects.reduce((sum, subject) => sum + subject.attendedClasses, 0);
        const overallPercentage = this.calculatePercentage(attendedClasses, totalClasses);
        const status = this.getStatusInfo(overallPercentage);

        this.elements.overallPercentage.textContent = `${overallPercentage}%`;
        
        this.elements.overallStatus.textContent = totalClasses === 0 ? 
            'Add subjects to begin tracking' : 
            `${status.emoji} ${status.text} - ${attendedClasses}/${totalClasses} classes attended`;

        const badge = this.getAchievementBadge(overallPercentage);
        this.elements.achievementBadge.textContent = badge;

        // Motivational messages
        const messages = {
            excellent: ["Outstanding work! Keep it up! 🚀", "You're setting a great example! ⭐"],
            good: ["You're doing well, keep pushing! 💪", "Stay consistent! 📈"],
            warning: ["Focus on attending more classes! 🎯", "You can do better! ⚠️"],
            poor: ["Let's turn this around! 🔄", "Every class matters! 📚"]
        };

        let messageType = 'poor';
        if (overallPercentage >= 85) messageType = 'excellent';
        else if (overallPercentage >= 75) messageType = 'good';
        else if (overallPercentage >= 65) messageType = 'warning';

        const messageList = messages[messageType];
        const randomMessage = messageList[Math.floor(Math.random() * messageList.length)];
        this.elements.motivationalMessage.querySelector('p').textContent = randomMessage;

        // Target calculation
        this.updateTargetCalculation(overallPercentage, attendedClasses, totalClasses);
    }

    updateTargetCalculation(currentPercentage, attended, total) {
        if (total === 0) {
            this.elements.targetCalculation.innerHTML = '<p class="text-gray-600">Add subjects to see target calculations</p>';
            return;
        }

        const targetRatio = this.target / 100;
        let message = '';

        if (currentPercentage < this.target) {
            const classesNeeded = Math.ceil((targetRatio * total - attended) / (1 - targetRatio));
            message = `<p class="text-amber-600 font-medium">📈 Attend ${Math.max(0, classesNeeded)} more classes to reach ${this.target}%</p>`;
        } else if (currentPercentage > this.target) {
            const classesMissable = Math.floor((attended - targetRatio * total) / targetRatio);
            message = `<p class="text-green-600 font-medium">😌 You can miss up to ${Math.max(0, classesMissable)} classes and still maintain ${this.target}%</p>`;
        } else {
            message = `<p class="primary-text font-medium">🎯 Perfect! You're exactly at your ${this.target}% target</p>`;
        }

        this.elements.targetCalculation.innerHTML = message;
    }
}

// Initialize the tracker
document.addEventListener('DOMContentLoaded', () => {
    window.tracker = new AttendanceTracker();
});

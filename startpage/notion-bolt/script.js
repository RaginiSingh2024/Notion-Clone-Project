// Global state
let currentPage = null;
let pages = [];
let deletedPages = [];
let searchQuery = '';
let currentView = 'editor';
let settings = {
    displayName: 'Ragini Singh',
    email: 'raginisingh@example.com',
    theme: 'light',
    fontSize: 'medium',
    emailNotifications: true,
    pushNotifications: true
};
let pendingInvites = [];
// Global sticky note content shared across pages
let globalSticky = localStorage.getItem('globalSticky') || '';

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    initializeEventListeners();
    // Sticky note toggle setup
    const stickyNote = document.getElementById('stickyNote');
    const stickyToggle = document.getElementById('stickyToggle');
    stickyNote.classList.add('hidden');
    let noteOpen = false;
    stickyToggle.addEventListener('click', () => {
        noteOpen = !noteOpen;
        stickyNote.classList.toggle('hidden', !noteOpen);
        stickyToggle.classList.toggle('open', noteOpen);
    });

    // Sticky input sync
    const stickyInput = document.getElementById('stickyInput');
    stickyInput.value = globalSticky;
    stickyInput.addEventListener('input', function(){
        globalSticky = this.value;
        localStorage.setItem('globalSticky', globalSticky);
    });
    
    // Create default page if none exist
    if (pages.length === 0) {
        createPage('Getting Started', 'Welcome to your new Notion workspace! Start by typing something here...');
    }
    
    updateUI();
});

// Event listeners
function initializeEventListeners() {
    // Search functionality
    document.getElementById('searchInput').addEventListener('input', function(e) {
        searchQuery = e.target.value.toLowerCase();
        renderPages();
    });
    
    // Page title input
    document.getElementById('pageTitleInput').addEventListener('input', function(e) {
        if (currentPage) {
            currentPage.title = e.target.value || 'Untitled';
            currentPage.updatedAt = new Date();
            saveData();
            updateUI();
        }
    });
    
    // Auto-resize textarea
    const contentInput = document.getElementById('pageContentInput');
    contentInput.addEventListener('input', function() {
        // sync sticky handled separately below
        this.style.height = 'auto';
        this.style.height = this.scrollHeight + 'px';
    });
}

// Page management functions
function createPage(title = 'Untitled', content = '') {
    const page = {
        id: generateId(),
        title: title,
        content: content,
        createdAt: new Date(),
        updatedAt: new Date(),
        isFavorite: false,
        sticky: ''
    };
    
    pages.push(page);
    currentPage = page;
    currentView = 'editor';
    saveData();
    renderPages();
    updateUI();
    
    // Focus on title input for new pages
    setTimeout(() => {
        document.getElementById('pageTitleInput').focus();
    }, 100);
}

function createNewPage() {
    createPage('New page', '');
}

function selectPage(pageId) {
    currentPage = pages.find(p => p.id === pageId);
    currentView = 'editor';
    updateUI();
    renderPages();
}

function deletePage(pageId) {
    if (confirm('Are you sure you want to delete this page?')) {
        const pageIndex = pages.findIndex(p => p.id === pageId);
        if (pageIndex !== -1) {
            const deletedPage = pages.splice(pageIndex, 1)[0];
            deletedPage.deletedAt = new Date();
            deletedPages.push(deletedPage);
            
            if (currentPage && currentPage.id === pageId) {
                currentPage = pages.length > 0 ? pages[0] : null;
            }
            
            saveData();
            renderPages();
            updateUI();
        }
    }
}

// Template functions
function createFromTemplate(templateType) {
    let title, content;
    
    switch(templateType) {
        case 'meeting-notes':
            title = 'Meeting Notes - ' + new Date().toLocaleDateString();
            content = `# Meeting Notes

**Date:** ${new Date().toLocaleDateString()}
**Attendees:** 
**Duration:** 

## Agenda
- 
- 
- 

## Discussion Points
- 

## Action Items
- [ ] 
- [ ] 
- [ ] 

## Next Steps
- `;
            break;
        case 'project-plan':
            title = 'Project Plan';
            content = `# Project Plan

## Overview
Brief description of the project

## Objectives
- 
- 
- 

## Timeline
**Start Date:** 
**End Date:** 
**Milestones:**
- [ ] 
- [ ] 
- [ ] 

## Resources
- 
- 

## Risks & Mitigation
- 

## Success Criteria
- `;
            break;
        case 'daily-journal':
            title = 'Daily Journal - ' + new Date().toLocaleDateString();
            content = `# Daily Journal - ${new Date().toLocaleDateString()}

## Today's Goals
- [ ] 
- [ ] 
- [ ] 

## What Happened Today
- 

## Wins & Accomplishments
- 

## Challenges
- 

## Tomorrow's Priorities
- 
- 
- 

## Reflection
`;
            break;
        case 'task-list':
            title = 'Task List';
            content = `# Task List

## High Priority
- [ ] 
- [ ] 
- [ ] 

## Medium Priority
- [ ] 
- [ ] 

## Low Priority
- [ ] 
- [ ] 

## Completed
- [x] Example completed task

## Notes
- `;
            break;
    }
    
    createPage(title, content);
}

// Navigation functions
function showSettings() {
    currentView = 'settings';
    updateUI();
    selectNavItem(event.target.closest('.nav-item'));
}

function showTemplates() {
    currentView = 'templates';
    updateUI();
    selectNavItem(event.target.closest('.nav-item'));
}

function showTrash() {
    currentView = 'trash';
    updateUI();
    renderTrash();
    selectNavItem(event.target.closest('.nav-item'));
}

function showInviteMembers() {
    currentView = 'invite';
    updateUI();
    renderPendingInvites();
    selectNavItem(event.target.closest('.nav-item'));
}

function showAccountManagement() {
    currentView = 'account';
    updateUI();
    selectNavItem(event.target.closest('.nav-item'));
}

function showHome() {
    currentView = 'home';
    updateUI();
    renderRecentPages();
    selectNavItem(event.target.closest('.nav-item'));
}

function showInbox() {
    currentView = 'inbox';
    updateUI();
    selectNavItem(event.target.closest('.nav-item'));
}

// UI update functions
function updateUI() {
    // Hide all views
    document.getElementById('emptyState').classList.remove('show');
    document.getElementById('pageEditor').style.display = 'none';
    document.getElementById('settingsPage').style.display = 'none';
    document.getElementById('templatesPage').style.display = 'none';
    document.getElementById('trashPage').style.display = 'none';
    document.getElementById('invitePage').style.display = 'none';
    document.getElementById('accountPage').style.display = 'none';
    document.getElementById('homePage').style.display = 'none';
    document.getElementById('inboxPage').style.display = 'none';
    
    const headerTitle = document.getElementById('headerTitle');
    const lastEdited = document.getElementById('lastEdited');
    
    switch(currentView) {
        case 'editor':
            if (currentPage) {
                document.getElementById('pageEditor').style.display = 'block';
                headerTitle.textContent = currentPage.title || 'Untitled';
                lastEdited.textContent = formatLastEdited(currentPage.updatedAt);
                
                // Update inputs
                
                document.getElementById('pageTitleInput').value = currentPage.title || '';
                document.getElementById('pageContentInput').value = currentPage.content || '';
                
                // Auto-resize content textarea
                const contentInput = document.getElementById('pageContentInput');
                contentInput.style.height = 'auto';
                contentInput.style.height = contentInput.scrollHeight + 'px';
                
                // Update favorite icon
                const favoriteIcon = document.getElementById('favoriteIcon');
                favoriteIcon.className = currentPage.isFavorite ? 'fas fa-star favorite' : 'fas fa-star';
            } else {
                document.getElementById('emptyState').classList.add('show');
                headerTitle.textContent = 'No page selected';
                lastEdited.textContent = '';
            }
            break;
        case 'settings':
            document.getElementById('settingsPage').style.display = 'block';
            headerTitle.textContent = 'Settings';
            lastEdited.textContent = '';
            loadSettingsUI();
            break;
        case 'templates':
            document.getElementById('templatesPage').style.display = 'block';
            headerTitle.textContent = 'Templates';
            lastEdited.textContent = '';
            break;
        case 'trash':
            document.getElementById('trashPage').style.display = 'block';
            headerTitle.textContent = 'Trash';
            lastEdited.textContent = '';
            break;
        case 'invite':
            document.getElementById('invitePage').style.display = 'block';
            headerTitle.textContent = 'Invite Members';
            lastEdited.textContent = '';
            break;
        case 'account':
            document.getElementById('accountPage').style.display = 'block';
            headerTitle.textContent = 'Account Management';
            lastEdited.textContent = '';
            loadAccountUI();
            break;
        case 'home':
            document.getElementById('homePage').style.display = 'block';
            headerTitle.textContent = 'Home';
            lastEdited.textContent = '';
            break;
        case 'inbox':
            document.getElementById('inboxPage').style.display = 'block';
            headerTitle.textContent = 'Inbox';
            lastEdited.textContent = '';
            break;
    }
}

function renderPages() {
    const container = document.getElementById('privatePages');
    container.innerHTML = '';
    
    const filteredPages = pages.filter(page => {
        if (!searchQuery) return true;
        return page.title.toLowerCase().includes(searchQuery) || 
               page.content.toLowerCase().includes(searchQuery);
    });
    
    filteredPages.forEach(page => {
        const pageElement = document.createElement('div');
        pageElement.className = `page-item ${currentPage && currentPage.id === page.id ? 'active' : ''}`;
        pageElement.onclick = () => selectPage(page.id);
        
        pageElement.innerHTML = `
            <i class="fas fa-file-alt"></i>
            <span class="page-title">${page.title || 'Untitled'}</span>
            ${page.isFavorite ? '<i class="fas fa-star favorite-small"></i>' : ''}
            <button class="delete-btn" onclick="event.stopPropagation(); deletePage('${page.id}')">
                <i class="fas fa-trash"></i>
            </button>
        `;
        
        container.appendChild(pageElement);
    });
}

function renderTrash() {
    const container = document.getElementById('trashItems');
    container.innerHTML = '';
    
    if (deletedPages.length === 0) {
        container.innerHTML = '<div class="empty-trash">Trash is empty</div>';
        return;
    }
    
    deletedPages.forEach(page => {
        const trashItem = document.createElement('div');
        trashItem.className = 'trash-item';
        trashItem.innerHTML = `
            <div class="trash-item-info">
                <i class="fas fa-file-alt"></i>
                <div>
                    <h4>${page.title || 'Untitled'}</h4>
                    <p>Deleted ${formatLastEdited(page.deletedAt)}</p>
                </div>
            </div>
            <div class="trash-item-actions">
                <button onclick="restorePage('${page.id}')">Restore</button>
                <button onclick="permanentlyDeletePage('${page.id}')" class="danger">Delete Forever</button>
            </div>
        `;
        container.appendChild(trashItem);
    });
}

function renderRecentPages() {
    const container = document.getElementById('recentPagesList');
    container.innerHTML = '';
    
    const recentPages = pages
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 5);
    
    recentPages.forEach(page => {
        const pageElement = document.createElement('div');
        pageElement.className = 'recent-page-item';
        pageElement.onclick = () => selectPage(page.id);
        pageElement.innerHTML = `
            <i class="fas fa-file-alt"></i>
            <div>
                <h4>${page.title || 'Untitled'}</h4>
                <p>Updated ${formatLastEdited(page.updatedAt)}</p>
            </div>
        `;
        container.appendChild(pageElement);
    });
}

function renderPendingInvites() {
    const container = document.getElementById('pendingInvitesList');
    container.innerHTML = '';
    
    if (pendingInvites.length === 0) {
        container.innerHTML = '<div class="no-invites">No pending invites</div>';
        return;
    }
    
    pendingInvites.forEach((invite, index) => {
        const inviteElement = document.createElement('div');
        inviteElement.className = 'pending-invite';
        inviteElement.innerHTML = `
            <div class="invite-info">
                <strong>${invite.email}</strong>
                <span class="invite-role">${invite.role}</span>
                <span class="invite-date">Sent ${formatLastEdited(invite.sentAt)}</span>
            </div>
            <button onclick="cancelInvite(${index})" class="cancel-invite">Cancel</button>
        `;
        container.appendChild(inviteElement);
    });
}

// Settings functions
function loadSettingsUI() {
    document.getElementById('displayName').value = settings.displayName;
    document.getElementById('userEmail').value = settings.email;
    document.getElementById('themeSelect').value = settings.theme;
    document.getElementById('fontSizeSelect').value = settings.fontSize;
    document.getElementById('emailNotifications').checked = settings.emailNotifications;
    document.getElementById('pushNotifications').checked = settings.pushNotifications;
}

function saveSettings() {
    settings.displayName = document.getElementById('displayName').value;
    settings.email = document.getElementById('userEmail').value;
    settings.emailNotifications = document.getElementById('emailNotifications').checked;
    settings.pushNotifications = document.getElementById('pushNotifications').checked;
    saveData();
}

function changeTheme() {
    settings.theme = document.getElementById('themeSelect').value;
    document.body.className = settings.theme === 'dark' ? 'dark-theme' : '';
    saveData();
}

function changeFontSize() {
    settings.fontSize = document.getElementById('fontSizeSelect').value;
    document.body.className = (document.body.className.includes('dark-theme') ? 'dark-theme ' : '') + 
                              'font-' + settings.fontSize;
    saveData();
}

// Account functions
function loadAccountUI() {
    document.getElementById('fullName').value = settings.displayName;
    document.getElementById('accountEmail').value = settings.email;
}

function changeAvatar() {
    alert('Avatar change functionality would integrate with file upload in a real application');
}

function changePassword() {
    showModal('Change Password', `
        <div class="password-form">
            <div class="form-group">
                <label>Current Password</label>
                <input type="password" id="currentPassword">
            </div>
            <div class="form-group">
                <label>New Password</label>
                <input type="password" id="newPassword">
            </div>
            <div class="form-group">
                <label>Confirm New Password</label>
                <input type="password" id="confirmPassword">
            </div>
            <button onclick="updatePassword()">Update Password</button>
        </div>
    `);
}

function enable2FA() {
    showModal('Enable Two-Factor Authentication', `
        <div class="tfa-setup">
            <p>Scan this QR code with your authenticator app:</p>
            <div class="qr-code">📱 QR Code would appear here</div>
            <div class="form-group">
                <label>Enter verification code</label>
                <input type="text" id="tfaCode" placeholder="000000">
            </div>
            <button onclick="confirmTFA()">Enable 2FA</button>
        </div>
    `);
}

function deleteAccount() {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        alert('Account deletion would be processed in a real application');
    }
}

// Trash functions
function restorePage(pageId) {
    const pageIndex = deletedPages.findIndex(p => p.id === pageId);
    if (pageIndex !== -1) {
        const restoredPage = deletedPages.splice(pageIndex, 1)[0];
        delete restoredPage.deletedAt;
        pages.push(restoredPage);
        saveData();
        renderTrash();
        renderPages();
    }
}

function restoreAllPages() {
    if (confirm('Restore all deleted pages?')) {
        deletedPages.forEach(page => {
            delete page.deletedAt;
            pages.push(page);
        });
        deletedPages = [];
        saveData();
        renderTrash();
        renderPages();
    }
}

function permanentlyDeletePage(pageId) {
    if (confirm('Permanently delete this page? This action cannot be undone.')) {
        const pageIndex = deletedPages.findIndex(p => p.id === pageId);
        if (pageIndex !== -1) {
            deletedPages.splice(pageIndex, 1);
            saveData();
            renderTrash();
        }
    }
}

function emptyTrash() {
    if (confirm('Permanently delete all pages in trash? This action cannot be undone.')) {
        deletedPages = [];
        saveData();
        renderTrash();
    }
}

// Invite functions
function sendInvite() {
    const email = document.getElementById('inviteEmail').value;
    const role = document.getElementById('inviteRole').value;
    
    if (!email) {
        alert('Please enter an email address');
        return;
    }
    
    const invite = {
        email: email,
        role: role,
        sentAt: new Date()
    };
    
    pendingInvites.push(invite);
    document.getElementById('inviteEmail').value = '';
    saveData();
    renderPendingInvites();
    alert('Invite sent successfully!');
}

function copyInviteLink() {
    const linkInput = document.getElementById('shareLink');
    linkInput.select();
    document.execCommand('copy');
    alert('Invite link copied to clipboard!');
}

function cancelInvite(index) {
    if (confirm('Cancel this invite?')) {
        pendingInvites.splice(index, 1);
        saveData();
        renderPendingInvites();
    }
}

// Header action functions
function showShareModal() {
    showModal('Share Page', `
        <div class="share-options">
            <div class="share-option">
                <h4>Share with people</h4>
                <div class="share-input-group">
                    <input type="email" placeholder="Enter email address">
                    <select>
                        <option>Can view</option>
                        <option>Can edit</option>
                        <option>Can comment</option>
                    </select>
                    <button>Share</button>
                </div>
            </div>
            <div class="share-option">
                <h4>Share link</h4>
                <div class="link-container">
                    <input type="text" value="https://notion.so/page/abc123" readonly>
                    <button onclick="copyShareLink()">Copy</button>
                </div>
            </div>
        </div>
    `);
}

function showComments() {
    showModal('Comments', `
        <div class="comments-section">
            <div class="comment">
                <div class="comment-avatar">U</div>
                <div class="comment-content">
                    <strong>User</strong>
                    <p>This is a sample comment on the page.</p>
                    <span class="comment-time">2 hours ago</span>
                </div>
            </div>
            <div class="add-comment">
                <textarea placeholder="Add a comment..."></textarea>
                <button>Comment</button>
            </div>
        </div>
    `);
}

function toggleFavorite() {
    if (currentPage) {
        currentPage.isFavorite = !currentPage.isFavorite;
        saveData();
        updateUI();
        renderPages();
    }
}

function showMoreOptions() {
    showModal('Page Options', `
        <div class="page-options">
            <button onclick="duplicatePage()">
                <i class="fas fa-copy"></i>
                Duplicate Page
            </button>
            <button onclick="exportPage()">
                <i class="fas fa-download"></i>
                Export
            </button>
            <button onclick="moveToTrash()" class="danger">
                <i class="fas fa-trash"></i>
                Move to Trash
            </button>
        </div>
    `);
}

// Modal functions
function showModal(title, content) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalContent').innerHTML = content;
    document.getElementById('modalOverlay').style.display = 'flex';
}

function closeModal() {
    document.getElementById('modalOverlay').style.display = 'none';
}

// Content handling
function handleTitleKeydown(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        document.getElementById('pageContentInput').focus();
    }
}

function handleContentChange() {
    if (currentPage) {
        currentPage.content = document.getElementById('pageContentInput').value;
        currentPage.updatedAt = new Date();
        saveData();
        updateLastEdited();
    }
}

function updateLastEdited() {
    if (currentPage) {
        document.getElementById('lastEdited').textContent = formatLastEdited(currentPage.updatedAt);
    }
}

// Sidebar functionality
function toggleSection(sectionName) {
    const chevron = document.getElementById(sectionName + '-chevron');
    const content = document.getElementById(sectionName + '-content');
    
    if (content.classList.contains('collapsed')) {
        content.classList.remove('collapsed');
        chevron.classList.remove('collapsed');
    } else {
        content.classList.add('collapsed');
        chevron.classList.add('collapsed');
    }
}

function selectNavItem(element) {
    if (!element) return;
    
    // Remove active class from all nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Add active class to selected item
    element.classList.add('active');
    
    // Clear current page selection if clicking on non-page items
    const pageItems = document.querySelectorAll('.page-item');
    pageItems.forEach(item => {
        item.classList.remove('active');
    });
}

// Inbox functions
function filterInbox(filter) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Filter logic would go here
    console.log('Filtering inbox by:', filter);
}

// Utility functions
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatLastEdited(date) {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Edited just now';
    if (minutes < 60) return `Edited ${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    if (hours < 24) return `Edited ${hours} hour${hours !== 1 ? 's' : ''} ago`;
    return `Edited ${days} day${days !== 1 ? 's' : ''} ago`;
}

// Data persistence functions
function saveData() {
    localStorage.setItem('notion-pages', JSON.stringify(pages));
    localStorage.setItem('notion-deleted-pages', JSON.stringify(deletedPages));
    localStorage.setItem('notion-current-page', currentPage ? currentPage.id : null);
    localStorage.setItem('notion-settings', JSON.stringify(settings));
    localStorage.setItem('notion-pending-invites', JSON.stringify(pendingInvites));
}

function loadData() {
    try {
        // Load pages
        const savedPages = localStorage.getItem('notion-pages');
        if (savedPages) {
            pages = JSON.parse(savedPages).map(page => ({
                ...page,
                createdAt: new Date(page.createdAt),
                updatedAt: new Date(page.updatedAt)
            }));
        }
        
        // Load deleted pages
        const savedDeletedPages = localStorage.getItem('notion-deleted-pages');
        if (savedDeletedPages) {
            deletedPages = JSON.parse(savedDeletedPages).map(page => ({
                ...page,
                createdAt: new Date(page.createdAt),
                updatedAt: new Date(page.updatedAt),
                deletedAt: new Date(page.deletedAt)
            }));
        }
        
        // Load current page
        const savedCurrentPageId = localStorage.getItem('notion-current-page');
        if (savedCurrentPageId && pages.length > 0) {
            currentPage = pages.find(p => p.id === savedCurrentPageId) || pages[0];
        } else if (pages.length > 0) {
            currentPage = pages[0];
        }
        
        // Load settings
        const savedSettings = localStorage.getItem('notion-settings');
        if (savedSettings) {
            settings = { ...settings, ...JSON.parse(savedSettings) };
        }
        
        // Load pending invites
        const savedInvites = localStorage.getItem('notion-pending-invites');
        if (savedInvites) {
            pendingInvites = JSON.parse(savedInvites).map(invite => ({
                ...invite,
                sentAt: new Date(invite.sentAt)
            }));
        }
        
    } catch (error) {
        console.error('Error loading data:', error);
        pages = [];
        deletedPages = [];
        currentPage = null;
        pendingInvites = [];
    }
}

// Auto-save functionality
setInterval(() => {
    if (currentPage && currentView === 'editor') {
        const contentInput = document.getElementById('pageContentInput');
        const titleInput = document.getElementById('pageTitleInput');
        
        if (contentInput && titleInput) {
            currentPage.content = contentInput.value;
            currentPage.title = titleInput.value || 'Untitled';
            saveData();
        }
    }
}, 2000); // Auto-save every 2 seconds

// Additional utility functions for modal actions
function copyShareLink() {
    alert('Share link copied to clipboard!');
    closeModal();
}

function duplicatePage() {
    if (currentPage) {
        createPage(currentPage.title + ' (Copy)', currentPage.content);
    }
    closeModal();
}

function exportPage() {
    if (currentPage) {
        const content = `# ${currentPage.title}\n\n${currentPage.content}`;
        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${currentPage.title || 'Untitled'}.md`;
        a.click();
        URL.revokeObjectURL(url);
    }
    closeModal();
}

function moveToTrash() {
    if (currentPage) {
        deletePage(currentPage.id);
    }
    closeModal();
}

function updatePassword() {
    const current = document.getElementById('currentPassword').value;
    const newPass = document.getElementById('newPassword').value;
    const confirm = document.getElementById('confirmPassword').value;
    
    if (!current || !newPass || !confirm) {
        alert('Please fill in all fields');
        return;
    }
    
    if (newPass !== confirm) {
        alert('New passwords do not match');
        return;
    }
    
    alert('Password updated successfully!');
    closeModal();
}

function confirmTFA() {
    const code = document.getElementById('tfaCode').value;
    if (!code || code.length !== 6) {
        alert('Please enter a valid 6-digit code');
        return;
    }
    
    alert('Two-factor authentication enabled successfully!');
    closeModal();
}
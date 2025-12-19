// STORAGE
const Storage = {
    get(key) { try { const item = localStorage.getItem(key); return item ? JSON.parse(item) : null; } catch (e) { return null; } },
    set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {} },
    remove(key) { localStorage.removeItem(key); }
};

// LOGGER
const Logger = {
    add(action, details = {}) {
        const logs = Storage.get('logs') || [];
        logs.push({
            id: Date.now().toString(),
            action,
            userId: Auth.user?.id || 'system',
            userRole: Auth.user?.role || 'guest',
            timestamp: new Date().toISOString()
        });
        Storage.set('logs', logs);
        console.log(`[${action}]`, details);
    }
};

// DATA MANAGERS
const Teachers = {
    getAll() { return Storage.get('teachers') || []; },
    add(data) {
        const teachers = this.getAll();
        const t = { id: Date.now().toString(), ...data, slots: data.slots || [] };
        teachers.push(t);
        Storage.set('teachers', teachers);
        Logger.add('teacher_added', { name: data.name });
        return t;
    },
    update(id, data) {
        const teachers = this.getAll();
        const idx = teachers.findIndex(t => t.id === id);
        if (idx >= 0) {
            teachers[idx] = { ...teachers[idx], ...data };
            Storage.set('teachers', teachers);
            Logger.add('teacher_updated', { id });
            return teachers[idx];
        }
    },
    delete(id) {
        Storage.set('teachers', this.getAll().filter(t => t.id !== id));
        Logger.add('teacher_deleted', { id });
    },
    getById(id) { return this.getAll().find(t => t.id === id); },
    search(q) {
        if (!q) return this.getAll();
        const query = q.toLowerCase();
        return this.getAll().filter(t =>
            t.name.toLowerCase().includes(query) ||
            t.department.toLowerCase().includes(query) ||
            t.subjects.toLowerCase().includes(query)
        );
    }
};

const Appointments = {
    getAll() { return Storage.get('appointments') || []; },
    add(data) {
        const appts = this.getAll();
        const a = { id: Date.now().toString(), ...data, status: 'pending', createdAt: new Date().toISOString() };
        appts.push(a);
        Storage.set('appointments', appts);
        Logger.add('appointment_booked', { studentId: data.studentId });
        return a;
    },
    update(id, data) {
        const appts = this.getAll();
        const idx = appts.findIndex(a => a.id === id);
        if (idx >= 0) {
            appts[idx] = { ...appts[idx], ...data };
            Storage.set('appointments', appts);
            Logger.add('appointment_updated', { id, status: data.status });
            return appts[idx];
        }
    },
    getByTeacherId(id) { return this.getAll().filter(a => a.teacherId === id); },
    getByStudentId(id) { return this.getAll().filter(a => a.studentId === id); }
};

const Messages = {
    getAll() { return Storage.get('messages') || []; },
    add(data) {
        const msgs = this.getAll();
        msgs.push({ id: Date.now().toString(), ...data, createdAt: new Date().toISOString() });
        Storage.set('messages', msgs);
        Logger.add('message_sent', { fromId: data.fromId });
        return true;
    },
    getByUserId(id) { return this.getAll().filter(m => m.toId === id); }
};

// AUTH
const Auth = {
    user: null,
    init() { const s = Storage.get('session'); if (s) this.user = s; },
    login(email, password) {
        const users = Storage.get('users');
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
            this.user = user;
            Storage.set('session', user);
            Logger.add('login', { email });
            return true;
        }
        return false;
    },
    logout() { Logger.add('logout', {}); this.user = null; Storage.remove('session'); }
};

// UI
function setContent(html) { document.getElementById('app').innerHTML = html; }
function showToast(msg, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = msg;
    document.getElementById('toastContainer').appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}
function showModal(title, content) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = content;
    document.getElementById('modal').classList.add('open');
}
function closeModal() { document.getElementById('modal').classList.remove('open'); }
function formatDate(iso) { return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); }

// INIT DATA
function initData() {
    if (!Storage.get('users')) {
        Storage.set('users', [
            { id: '1', email: 'admin@clg.com', password: 'password', role: 'admin', name: 'Admin User' },
            { id: '2', email: 'teacher@clg.com', password: 'password', role: 'teacher', name: 'John Doe' },
            { id: '3', email: 'student@clg.com', password: 'password', role: 'student', name: 'Jane Student' }
        ]);
    }
    if (!Storage.get('teachers')) {
        Storage.set('teachers', [
            { id: '2', name: 'Dr. Alice Smith', department: 'Computer Science', subjects: 'Python, JavaScript, Web Development', bio: 'CS Expert with 10+ years experience' },
            { id: 'tea2', name: 'Prof. Bob Johnson', department: 'Mathematics', subjects: 'Calculus, Linear Algebra, Statistics', bio: 'Math Teacher' },
            { id: 'tea3', name: 'Ms. Sarah Lee', department: 'English', subjects: 'Literature, Writing, Grammar', bio: 'English Teacher' }
        ]);
    }
    if (!Storage.get('appointments')) Storage.set('appointments', []);
    if (!Storage.get('messages')) Storage.set('messages', []);
    if (!Storage.get('logs')) Storage.set('logs', []);
}

// RENDER MAIN
function render() {
    if (!Auth.user) return renderLogin();
    if (Auth.user.role === 'admin') return renderAdmin();
    if (Auth.user.role === 'teacher') return renderTeacher();
    return renderStudent();
}

// LOGIN
function renderLogin() {
    setContent(`
        <div class="auth-container">
            <h1>📚 Booking System</h1>
            <p>Student-Teacher Appointment Portal</p>
            <form onsubmit="doLogin(event)">
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="email" required value="student@clg.com">
                </div>
                <div class="form-group">
                    <label>Password</label>
                    <input type="password" id="pwd" required value="password">
                </div>
                <button type="submit" class="btn btn-primary btn-block">Login</button>
                <p style="text-align: center; margin-top: 1rem; font-size: 0.85rem; color: var(--gray-600);">
                    Accounts: admin@clg.com | teacher@clg.com | student@clg.com<br>Password: password
                </p>
            </form>
        </div>
    `);
}

function doLogin(e) {
    e.preventDefault();
    if (Auth.login(document.getElementById('email').value, document.getElementById('pwd').value)) {
        showToast('Login successful!');
        setTimeout(() => render(), 300);
    } else {
        showToast('Invalid credentials', 'danger');
    }
}

// ADMIN
function renderAdmin() {
    const teachers = Teachers.getAll();
    const appts = Appointments.getAll();
    const pending = appts.filter(a => a.status === 'pending').length;
    setContent(`
        <div class="layout">
            <div class="sidebar">
                <h2>🔐 Admin</h2>
                <div class="user-info">${Auth.user.name}</div>
                <ul class="sidebar-menu">
                    <li><button onclick="render()">Dashboard</button></li>
                    <li><button onclick="showLogs()">Logs</button></li>
                    <li><button onclick="Auth.logout(); render()">Logout</button></li>
                </ul>
            </div>
            <div class="main-content">
                <h1>Admin Dashboard</h1>
                <div class="grid">
                    <div class="stat-card"><div class="stat-number">${teachers.length}</div><div class="stat-label">Teachers</div></div>
                    <div class="stat-card"><div class="stat-number">${pending}</div><div class="stat-label">Pending</div></div>
                    <div class="stat-card"><div class="stat-number">${appts.length}</div><div class="stat-label">Appointments</div></div>
                </div>
                <div class="card">
                    <div class="card-header"><span class="card-title">Teachers</span><button class="btn btn-primary btn-sm" onclick="showAddTeacherModal()">+ Add</button></div>
                    <table>
                        <thead><tr><th>Name</th><th>Department</th><th>Actions</th></tr></thead>
                        <tbody>
                            ${teachers.map(t => `<tr><td>${t.name}</td><td>${t.department}</td><td class="flex"><button class="btn btn-sm btn-secondary" onclick="editTeacher('${t.id}')">Edit</button><button class="btn btn-sm btn-danger" onclick="deleteTeacher('${t.id}')">Delete</button></td></tr>`).join('')}
                        </tbody>
                    </table>
                </div>
                <div class="card">
                    <div class="card-header"><span class="card-title">Appointments</span></div>
                    <table>
                        <thead><tr><th>Student</th><th>Teacher</th><th>Date</th><th>Status</th><th>Action</th></tr></thead>
                        <tbody>
                            ${appts.map(a => {
                                const t = Teachers.getById(a.teacherId);
                                return `<tr><td>${a.studentName}</td><td>${t?.name || 'N/A'}</td><td>${formatDate(a.datetime)}</td><td><span class="badge badge-${a.status}">${a.status}</span></td><td>${a.status === 'pending' ? `<button class="btn btn-sm btn-success" onclick="approveAppt('${a.id}')">Approve</button>` : ''}</td></tr>`;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `);
}

function showAddTeacherModal() {
    showModal('Add Teacher', `
        <form onsubmit="addTeacher(event)">
            <div class="form-group"><label>Name</label><input type="text" id="name" required></div>
            <div class="form-group"><label>Email</label><input type="email" id="email" required placeholder="teacher@clg.com"></div>
            <div class="form-group"><label>Department</label><input type="text" id="dept" required></div>
            <div class="form-group"><label>Subjects</label><input type="text" id="subjects" required placeholder="e.g., Python, JavaScript"></div>
            <div class="form-group"><label>Bio</label><textarea id="bio" placeholder="Teacher bio"></textarea></div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Add Teacher</button>
            </div>
        </form>
    `);
}

function addTeacher(e) {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const dept = document.getElementById('dept').value;
    const subjects = document.getElementById('subjects').value;
    const bio = document.getElementById('bio').value;
    
    // Generate unique ID
    const teacherId = 'tea_' + Date.now();
    
    // Create user account first
    const users = Storage.get('users');
    const newUser = {
        id: teacherId,
        email: email,
        password: 'password',
        role: 'teacher',
        name: name
    };
    users.push(newUser);
    Storage.set('users', users);
    
    // Create teacher with same ID
    const teachers = Teachers.getAll();
    const teacher = {
        id: teacherId,
        name: name,
        email: email,
        department: dept,
        subjects: subjects,
        bio: bio
    };
    teachers.push(teacher);
    Storage.set('teachers', teachers);
    Logger.add('teacher_added', { name: name, email: email });
    
    showToast('✅ Teacher added! Email: ' + email + ' | Password: password', 'success');
    closeModal();
    setTimeout(() => render(), 300);
}

function editTeacher(id) {
    const t = Teachers.getById(id);
    showModal('Edit Teacher', `
        <form onsubmit="updateTeacher(event, '${id}')">
            <div class="form-group"><label>Name</label><input type="text" id="name" value="${t.name}" required></div>
            <div class="form-group"><label>Email</label><input type="email" id="email" value="${t.email || ''}" required></div>
            <div class="form-group"><label>Department</label><input type="text" id="dept" value="${t.department}" required></div>
            <div class="form-group"><label>Subjects</label><input type="text" id="subjects" value="${t.subjects}" required></div>
            <div class="form-group"><label>Bio</label><textarea id="bio">${t.bio || ''}</textarea></div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Update</button>
            </div>
        </form>
    `);
}

function updateTeacher(e, id) {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const dept = document.getElementById('dept').value;
    const subjects = document.getElementById('subjects').value;
    const bio = document.getElementById('bio').value;
    
    // Update teacher
    const teachers = Teachers.getAll();
    const tIdx = teachers.findIndex(t => t.id === id);
    if (tIdx >= 0) {
        teachers[tIdx] = {
            ...teachers[tIdx],
            name,
            email,
            department: dept,
            subjects,
            bio
        };
        Storage.set('teachers', teachers);
    }
    
    // Update user account
    const users = Storage.get('users');
    const userIdx = users.findIndex(u => u.id === id);
    if (userIdx >= 0) {
        users[userIdx].name = name;
        users[userIdx].email = email;
        Storage.set('users', users);
    }
    
    Logger.add('teacher_updated', { id, name });
    showToast('✅ Teacher updated!');
    closeModal();
    setTimeout(() => render(), 300);
}

function deleteTeacher(id) {
    if (confirm('Delete?')) { Teachers.delete(id); showToast('Deleted!'); setTimeout(() => render(), 300); }
}

function approveAppt(id) {
    Appointments.update(id, { status: 'approved' });
    showToast('Approved!');
    setTimeout(() => render(), 300);
}

function showLogs() {
    const logs = (Storage.get('logs') || []).slice().reverse();
    showModal('System Logs', `
        <table style="font-size: 0.9rem;">
            <thead><tr><th>Action</th><th>User</th><th>Time</th></tr></thead>
            <tbody>${logs.slice(0, 30).map(l => `<tr><td>${l.action}</td><td>${l.userRole}</td><td>${formatDate(l.timestamp)}</td></tr>`).join('')}</tbody>
        </table>
    `);
}

// TEACHER
function renderTeacher() {
    const appts = Appointments.getByTeacherId(Auth.user.id);
    setContent(`
        <div class="layout">
            <div class="sidebar">
                <h2>👨‍🏫 Teacher</h2>
                <div class="user-info">${Auth.user.name}</div>
                <ul class="sidebar-menu">
                    <li><button onclick="render()">Dashboard</button></li>
                    <li><button onclick="Auth.logout(); render()">Logout</button></li>
                </ul>
            </div>
            <div class="main-content">
                <h1>My Appointments</h1>
                <div class="card">
                    <table>
                        <thead><tr><th>Student</th><th>Date</th><th>Purpose</th><th>Status</th><th>Action</th></tr></thead>
                        <tbody>
                            ${appts.map(a => `
                                <tr>
                                    <td>${a.studentName}</td>
                                    <td>${formatDate(a.datetime)}</td>
                                    <td>${a.purpose}</td>
                                    <td><span class="badge badge-${a.status}">${a.status}</span></td>
                                    <td>${a.status === 'pending' ? `<button class="btn btn-sm btn-success" onclick="approveAppt('${a.id}')">Approve</button>` : ''}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `);
}

// STUDENT
function renderStudent() {
    const teachers = Teachers.getAll();
    const appts = Appointments.getByStudentId(Auth.user.id);
    setContent(`
        <div class="layout">
            <div class="sidebar">
                <h2>👨‍🎓 Student</h2>
                <div class="user-info">${Auth.user.name}</div>
                <ul class="sidebar-menu">
                    <li><button onclick="render()">My Appointments</button></li>
                    <li><button onclick="showTeachers()">Find Teachers</button></li>
                    <li><button onclick="Auth.logout(); render()">Logout</button></li>
                </ul>
            </div>
            <div class="main-content">
                <h1>My Appointments</h1>
                <div class="card">
                    <table>
                        <thead><tr><th>Teacher</th><th>Date</th><th>Purpose</th><th>Status</th></tr></thead>
                        <tbody>
                            ${appts.length === 0 ? '<tr><td colspan="4" style="text-align: center; padding: 2rem;">No appointments</td></tr>' : appts.map(a => {
                                const t = Teachers.getById(a.teacherId);
                                return `<tr><td>${t?.name || 'N/A'}</td><td>${formatDate(a.datetime)}</td><td>${a.purpose}</td><td><span class="badge badge-${a.status}">${a.status}</span></td></tr>`;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `);
}

function showTeachers() {
    const teachers = Teachers.getAll();
    setContent(`
        <div class="layout">
            <div class="sidebar">
                <h2>👨‍🎓 Student</h2>
                <div class="user-info">${Auth.user.name}</div>
                <ul class="sidebar-menu">
                    <li><button onclick="render()">My Appointments</button></li>
                    <li><button onclick="showTeachers()" style="background: rgba(255,255,255,0.25);">Find Teachers</button></li>
                    <li><button onclick="Auth.logout(); render()">Logout</button></li>
                </ul>
            </div>
            <div class="main-content">
                <h1>📖 Find & Book a Teacher</h1>
                <div class="card">
                    <h3 style="color: var(--primary); margin-bottom: 1rem;">Available Teachers</h3>
                    ${teachers.map(t => `
                        <div class="teacher-card">
                            <h3 style="margin-bottom: 0.5rem;">👨‍🏫 ${t.name}</h3>
                            <p><strong>📍 Department:</strong> ${t.department}</p>
                            <p><strong>📚 Subjects:</strong> ${t.subjects}</p>
                            <p><strong>ℹ️ Bio:</strong> ${t.bio}</p>
                            <button class="btn btn-primary" onclick="bookModal('${t.id}')">📅 Book Appointment</button>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `);
}

function bookModal(teacherId) {
    const t = Teachers.getById(teacherId);
    
    showModal(`Book with ${t.name}`, `
        <form onsubmit="doBook(event, '${teacherId}')">
            <div class="form-group">
                <label>📅 Select Date & Time</label>
                <input type="datetime-local" id="datetime" required style="padding: 0.75rem; border: 1px solid var(--gray-300); border-radius: 6px; width: 100%;">
            </div>
            <div class="form-group">
                <label>📝 Purpose of Meeting</label>
                <textarea id="purpose" required placeholder="Why do you want to meet this teacher?" style="padding: 0.75rem; border: 1px solid var(--gray-300); border-radius: 6px; width: 100%; min-height: 100px;"></textarea>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">📅 Book Now</button>
            </div>
        </form>
    `);
}

function doBook(e, teacherId) {
    e.preventDefault();
    const datetime = document.getElementById('datetime').value;
    const purpose = document.getElementById('purpose').value;
    
    if (!datetime || !purpose) {
        showToast('Please fill all fields', 'danger');
        return;
    }
    
    Appointments.add({ 
        teacherId, 
        studentId: Auth.user.id, 
        studentName: Auth.user.name, 
        datetime: datetime, 
        purpose: purpose 
    });
    showToast('✅ Appointment booked successfully!', 'success');
    closeModal();
    setTimeout(() => render(), 800);
}

// START
initData();
Auth.init();
render();
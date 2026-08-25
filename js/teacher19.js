function renderStudents(){fetch("get_students.php").then(e=>e.json()).then(e=>{let t="";if(!Array.isArray(e)||0===e.length){t='<div class="empty-state"><div class="empty-icon">\uD83D\uDC65</div><h3>Нет учеников</h3><p>Нажмите \xabДобавить ученика\xbb, чтобы создать первого</p></div>',setMainContent(t+='<div style="text-align:center; margin-top:16px;"><button class="btn-add" onclick="openAddStudentModal()">+ Добавить ученика</button></div>');return}let l="";e.forEach(e=>{let t=void 0!==e.rate&&null!==e.rate?e.rate:0;l+=`
                    <tr style="cursor:pointer;" onclick="openCalendar(${e.id}, '${e.first_name} ${e.last_name||""}')">
                        <td>${e.first_name}</td>
                        <td>${e.last_name||""}</td>
                        <td>${e.subject||""}</td>
                        <td>${t}</td>
                        <td>${e.login}</td>
                        <td>
                            <button class="btn-icon" onclick="event.stopPropagation(); openEditStudentModal(${e.id}, '${e.first_name}', '${e.last_name||""}', '${e.subject||""}', ${t})">✏️</button>
                            <button class="btn-icon" onclick="event.stopPropagation(); deleteStudent(${e.id}, '${e.first_name}')">🗑️</button>
                        </td>
                    </tr>`}),setMainContent(t=`
                <div class="dashboard-header">
                    <h2>Ученики</h2>
                    <button class="btn-add" onclick="openAddStudentModal()">+ Добавить ученика</button>
                </div>
                <div class="table-responsive">
                    <table>
                        <thead><tr><th>Имя</th><th>Фамилия</th><th>Предмет</th><th>Ставка</th><th>Логин</th><th></th></tr></thead>
                        <tbody>${l}</tbody>
                    </table>
                </div>`)}).catch(()=>{let e='<div class="empty-state"><div class="empty-icon">\uD83D\uDC65</div><h3>Нет учеников</h3><p>Нажмите \xabДобавить ученика\xbb, чтобы создать первого</p></div>';setMainContent(e+='<div style="text-align:center; margin-top:16px;"><button class="btn-add" onclick="openAddStudentModal()">+ Добавить ученика</button></div>')})}function renderHomeworkList(){fetch("get_students.php").then(e=>e.json()).then(e=>{if(!Array.isArray(e)||0===e.length){showEmptyState("\uD83D\uDCDD","Домашние задания","Добавьте учеников, чтобы назначать задания");return}let t="";e.forEach(e=>{t+=`<tr style="cursor:pointer;" onclick="openHomeworkStudent(${e.id}, '${e.first_name} ${e.last_name||""}')">
                    <td>${e.first_name}</td>
                    <td>${e.last_name||""}</td>
                    <td>${e.subject||""}</td>
                    <td>${e.login}</td>
                </tr>`}),setMainContent(`
                <div class="dashboard-header"><h2>Домашние задания</h2></div>
                <div class="table-responsive">
                    <table>
                        <thead><tr><th>Имя</th><th>Фамилия</th><th>Предмет</th><th>Логин</th></tr></thead>
                        <tbody>${t}</tbody>
                    </table>
                </div>`)}).catch(()=>showEmptyState("\uD83D\uDCDD","Домашние задания","Добавьте учеников, чтобы назначать задания"))}function openHomeworkStudent(e,t){Promise.all([fetch(`get_homework_categories.php?student_id=${e}`).then(e=>e.json()),fetch(`get_homework_blocks.php?student_id=${e}&category_id=all`).then(e=>e.json()),fetch(`get_homeworks.php?student_id=${e}`).then(e=>e.json())]).then(([l,o,a])=>{window.currentHomeworkData={studentId:e,studentName:t,categories:l,blocks:o,homeworks:a};let n=window.lastHomeworkCategoryId;n&&l.some(e=>e.id==n)?renderHomeworkTabs(n):renderHomeworkTabs()})}function renderHomeworkTabs(e=null){window.lastHomeworkCategoryId=e;let{studentId:t,studentName:l,categories:o,blocks:a,homeworks:n}=window.currentHomeworkData,s="";o.forEach(t=>{let l=e==t.id?"active":"";s+=`<button class="schedule-mode-btn ${l}" onclick="renderHomeworkTabs(${t.id})">📁 ${t.name}</button>`});let i=`<button class="btn-back" onclick="renderHomeworkList()">← Назад к списку учеников</button>`;i+=`<div class="dashboard-header">
        <h2>Задания: ${l}</h2>
        <div style="display:flex; gap:8px;">
            <button class="btn-add" onclick="openAddHomeworkCategoryModal(${t}, '${l.replace(/'/g,"\\'")}')">+ Категория</button>
            <button class="btn-add" onclick="openAddHomeworkBlockModal(${t}, '${l.replace(/'/g,"\\'")}', ${e||"null"})">+ Блок</button>
            <button class="btn-add" onclick="openAddHomeworkModal(${t}, '${l.replace(/'/g,"\\'")}', null, ${e||"null"})">+ Задание</button>
        </div>
    </div>
    <div class="schedule-mode-switcher" style="margin-bottom:20px;">${s=`
        <button class="schedule-mode-btn ${null===e?"active":""}" onclick="renderHomeworkTabs(null)">📁 Все</button>
        ${s}
    `}</div>`;let r=a;null!==e&&"all"!==e&&(r=a.filter(t=>t.category_id==e));let d={},c=[];n.forEach(e=>{if(e.block_id){let t=r.some(t=>t.id==e.block_id);t?(d[e.block_id]||(d[e.block_id]=[]),d[e.block_id].push(e)):c.push(e)}else c.push(e)});let p="";r.forEach(o=>{let a=d[o.id]||[];p+=renderBlockCard(o,a,t,l,e)}),i+=`<div id="homeworkBlocksContainer" class="homework-blocks-container" data-student="${t}">${p}</div>`,null===e&&c.length>0&&(i+=renderUngroupedCard(c,t,l,e)),0===r.length&&(null!==e||0===c.length)&&(i+='<div class="empty-state"><div class="empty-icon">\uD83D\uDCDD</div><h3>Нет заданий в этой категории</h3></div>'),setMainContent(i),r.length>0&&initHomeworkDragDrop(t)}function renderBlockCard(e,t,l,o,a=null){let n="";return t.forEach(e=>n+=renderHomeworkRow(e,l,o)),`
        <div class="homework-block" data-block-id="${e.id}">
            <div class="homework-block__header">
                <h3 class="homework-block__title">${e.name}</h3>
                <div class="homework-block__actions">
                    <button class="btn-icon" onclick="openHomeworkEditBlockModal(${e.id}, '${e.name.replace(/'/g,"\\'")}', ${l}, '${o.replace(/'/g,"\\'")}')">✏️</button>
                    <button class="btn-icon" onclick="deleteHomeworkBlock(${e.id}, ${l}, '${o.replace(/'/g,"\\'")}')">🗑️</button>
                    <button class="btn-add" onclick="openAddHomeworkModal(${l}, '${o.replace(/'/g,"\\'")}', ${e.id}, ${a||"null"})">+ Задание</button>
                </div>
            </div>
            ${t.length?`
                <div class="table-responsive">
                    <table>
                        <thead><tr><th>Название</th><th>Текст</th><th>Статус</th><th>Ссылки</th><th></th></tr></thead>
                        <tbody>${n}</tbody>
                    </table>
                </div>`:'<p class="block-empty-text">Нет заданий</p>'}
        </div>`}function renderUngroupedCard(e,t,l,o=null){let a="";return e.forEach(e=>a+=renderHomeworkRow(e,t,l)),`
        <div class="homework-block">
            <div class="homework-block__header">
                <h3 class="homework-block__title">Без блока</h3>
                <button class="btn-add" onclick="openAddHomeworkModal(${t}, '${l.replace(/'/g,"\\'")}', null, ${o||"null"})">+ Задание</button>
            </div>
            ${e.length?`
                <div class="table-responsive">
                    <table>
                        <thead><tr><th>Название</th><th>Текст</th><th>Статус</th><th>Ссылки</th><th></th></tr></thead>
                        <tbody>${a}</tbody>
                    </table>
                </div>`:""}
        </div>`}function renderHomeworkRow(e,t,l){let o="Выполнено"===e.status?"badge--success":"badge--danger",a="";if(e.links)try{let n=JSON.parse(e.links);a=n.map(e=>`<a href="${e}" target="_blank">Ссылка</a>`).join(", ")}catch(s){}return`
        <tr>
            <td>${e.title}</td>
            <td>${e.text||""}</td>
            <td><span class="badge ${o}" onclick="changeHomeworkStatus(${e.id}, ${t}, '${l.replace(/'/g,"\\'")}')" style="cursor:pointer;">${e.status}</span></td>
            <td>${a}</td>
            <td>
                <button class="btn-icon" onclick="editHomework(${e.id}, ${t}, '${l.replace(/'/g,"\\'")}')">✏️</button>
                <button class="btn-icon" onclick="deleteHomework(${e.id}, ${t}, '${l.replace(/'/g,"\\'")}')">🗑️</button>
            </td>
        </tr>`}function changeHomeworkStatus(e,t,l){let o=event.target.closest(".badge");o&&fetch(`get_homeworks.php?student_id=${t}`).then(e=>e.json()).then(t=>{let l=t.find(t=>t.id==e);if(!l)return;let a="Выполнено"===l.status?"Не выполнено":"Выполнено";fetch("update_homework.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`id=${e}&status=${a}`}).then(e=>e.json()).then(e=>{e.success?(o.textContent=a,o.className=`badge ${"Выполнено"===a?"badge--success":"badge--danger"}`):alert("Ошибка: "+e.error)})})}function openHomeworkBlockModal(e,t){let l=document.createElement("div");l.className="modal-overlay active",l.innerHTML=`
        <div class="modal">
            <button class="modal__close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            <h3>Новый блок заданий</h3>
            <div class="form-group"><label class="form-label">Название блока</label><input type="text" id="blockName" class="form-input"></div>
            <button class="btn btn--primary" onclick="addHomeworkBlock(${e}, '${t.replace(/'/g,"\\'")}')">Создать</button>
        </div>`,document.body.appendChild(l)}function addHomework(e,t){let l=document.querySelector(".modal-overlay.active .modal");if(!l)return;let o=l.querySelector("#hwBlock")?.value||"",a=l.querySelector("#hwCategory")?.value||"",n=l.querySelector("#hwTitle")?.value.trim()||"",s=l.querySelector("#hwText")?.value.trim()||"",i=l.querySelector("#hwLinks")?.value.trim()||"";if(!n)return alert("Название обязательно");fetch("add_homework.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`student_id=${e}&block_id=${o}&title=${encodeURIComponent(n)}&text=${encodeURIComponent(s)}&links=${encodeURIComponent(i)}&category_id=${a}`}).then(e=>e.json()).then(o=>{if(o.success){let a=l.closest(".modal-overlay");a&&a.remove(),openHomeworkStudent(e,t)}else alert(o.error)})}function openHomeworkEditBlockModal(e,t,l,o){let a=document.createElement("div");a.className="modal-overlay active",a.innerHTML=`
        <div class="modal">
            <button class="modal__close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            <h3>Переименовать блок</h3>
            <div class="form-group"><label class="form-label">Название</label><input type="text" id="blockName" class="form-input" value="${t}"></div>
            <button class="btn btn--primary" onclick="editHomeworkBlock(${e}, ${l}, '${o.replace(/'/g,"\\'")}')">Сохранить</button>
        </div>`,document.body.appendChild(a)}function editHomeworkBlock(e,t,l){let o=document.getElementById("blockName").value.trim();if(!o)return alert("Введите название");fetch("update_homework_block.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`id=${e}&name=${encodeURIComponent(o)}`}).then(e=>e.json()).then(e=>{e.success?(document.querySelector(".modal-overlay").remove(),openHomeworkStudent(t,l)):alert(e.error)})}function deleteHomeworkBlock(e,t,l){confirm("Удалить блок? Задания останутся, но переместятся в \xabБез блока\xbb.")&&fetch("delete_homework_block.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`id=${e}`}).then(e=>e.json()).then(e=>{e.success?openHomeworkStudent(t,l):alert(e.error)})}function openAddHomeworkModal(e,t,l=null,o=null){Promise.all([fetch(`get_homework_blocks.php?student_id=${e}&category_id=all`).then(e=>e.json()),fetch(`get_homework_categories.php?student_id=${e}`).then(e=>e.json())]).then(([a,n])=>{let s='<option value="">Без блока</option>';a.forEach(e=>{s+=`<option value="${e.id}" ${e.id==l?"selected":""}>${e.name}</option>`});let i="";n.forEach(e=>{i+=`<option value="${e.id}" ${e.id==o?"selected":""}>${e.name}</option>`});let r=document.createElement("div");r.className="modal-overlay active",r.innerHTML=`
            <div class="modal">
                <button class="modal__close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                <h3>Добавить задание для ${t}</h3>
                <div class="form-group"><label class="form-label">Категория</label><select id="hwCategory" class="form-select">${i}</select></div>
                <div class="form-group"><label class="form-label">Блок</label><select id="hwBlock" class="form-select">${s}</select></div>
                <div class="form-group"><label class="form-label">Название</label><input type="text" id="hwTitle" class="form-input"></div>
                <div class="form-group"><label class="form-label">Текст</label><textarea id="hwText" class="form-input" rows="3"></textarea></div>
                <div class="form-group"><label class="form-label">Ссылки (каждая с новой строки)</label><textarea id="hwLinks" class="form-input" rows="3"></textarea></div>
                <button class="btn btn--primary" onclick="addHomework(${e}, '${t.replace(/'/g,"\\'")}')">Сохранить</button>
            </div>`,document.body.appendChild(r)})}function editHomework(e,t,l){Promise.all([fetch(`get_homeworks.php?student_id=${t}`).then(e=>e.json()),fetch(`get_homework_blocks.php?student_id=${t}&category_id=all`).then(e=>e.json()),fetch(`get_homework_categories.php?student_id=${t}`).then(e=>e.json())]).then(([o,a,n])=>{let s=o.find(t=>t.id==e);if(!s)return;let i=s.links?JSON.parse(s.links).join("\n"):"",r='<option value="">Без блока</option>';a.forEach(e=>{r+=`<option value="${e.id}" ${e.id==s.block_id?"selected":""}>${e.name}</option>`});let d="";n.forEach(e=>{let t=a.find(e=>e.id==s.block_id),l=t&&t.category_id==e.id?"selected":"";d+=`<option value="${e.id}" ${l}>${e.name}</option>`});let c=document.createElement("div");c.className="modal-overlay active",c.innerHTML=`
            <div class="modal">
                <button class="modal__close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                <h3>Редактировать задание</h3>
                <div class="form-group"><label class="form-label">Категория</label><select id="hwCategory" class="form-select">${d}</select></div>
                <div class="form-group"><label class="form-label">Блок</label><select id="hwBlock" class="form-select">${r}</select></div>
                <div class="form-group"><label class="form-label">Название</label><input type="text" id="hwTitle" class="form-input" value="${s.title}"></div>
                <div class="form-group"><label class="form-label">Текст</label><textarea id="hwText" class="form-input" rows="3">${s.text||""}</textarea></div>
                <div class="form-group"><label class="form-label">Ссылки (каждая с новой строки)</label><textarea id="hwLinks" class="form-input" rows="3">${i}</textarea></div>
                <button class="btn btn--primary" onclick="updateHomework(${e}, ${t}, '${l.replace(/'/g,"\\'")}')">Сохранить</button>
            </div>`,document.body.appendChild(c)})}function updateHomework(e,t,l){let o=document.getElementById("hwBlock").value,a=document.getElementById("hwTitle").value.trim(),n=document.getElementById("hwText").value.trim(),s=document.getElementById("hwLinks").value.trim();if(!a)return alert("Название обязательно");fetch("update_homework.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`id=${e}&block_id=${o}&title=${encodeURIComponent(a)}&text=${encodeURIComponent(n)}&links=${encodeURIComponent(s)}`}).then(e=>e.json()).then(e=>{e.success?(document.querySelector(".modal-overlay").remove(),openHomeworkStudent(t,l)):alert(e.error)})}function toggleHomeworkStatus(e,t,l){let o=event.target.closest(".badge");o&&fetch(`get_homeworks.php?student_id=${t}`).then(e=>e.json()).then(t=>{let l=t.find(t=>t.id==e);if(!l)return;let a="Выполнено"===l.status?"Не выполнено":"Выполнено",n=l.links?JSON.parse(l.links).join("\n"):"";fetch("update_homework.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`id=${e}&block_id=${l.block_id||""}&title=${encodeURIComponent(l.title)}&text=${encodeURIComponent(l.text||"")}&links=${encodeURIComponent(n)}&status=${a}`}).then(e=>e.json()).then(e=>{e.success?(o.textContent=a,o.className=`badge ${"Выполнено"===a?"badge--success":"badge--danger"}`):alert("Ошибка: "+e.error)})})}function deleteHomework(e,t,l){confirm("Удалить задание?")&&fetch("delete_homework.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`id=${e}`}).then(e=>e.json()).then(e=>e.success?openHomeworkStudent(t,l):alert(e.error))}function initHomeworkDragDrop(e){let t=document.getElementById("homeworkBlocksContainer");if(!t)return;let l=t.querySelectorAll(".homework-block");l.forEach(e=>{e.setAttribute("draggable",!0),e.addEventListener("dragstart",handleDragStart),e.addEventListener("dragend",handleDragEnd)}),t.addEventListener("dragover",handleDragOver),t.addEventListener("drop",handleDrop)}document.addEventListener("DOMContentLoaded",()=>{let e=document.getElementById("hamburger"),t=document.getElementById("sidebar");e.addEventListener("click",()=>t.classList.toggle("open")),t.addEventListener("click",e=>{let l=e.target.closest(".sidebar__link");if(!l)return;let o=l.getAttribute("data-tab");if(o){if(e.preventDefault(),document.querySelectorAll(".sidebar__link").forEach(e=>e.classList.remove("active")),l.classList.add("active"),o.startsWith("custom_")){let a=o.replace("custom_",""),n=l.textContent.replace(/^📌\s*/,"").trim();renderCustomBlock(a,n),window.innerWidth<768&&t.classList.remove("open");return}switch(o){case"schedule":renderTeacherSchedule();break;case"students":renderStudents();break;case"homeworks":renderHomeworkList();break;case"library":renderLibrary();break;case"lectures":renderBlocks("lecture");break;case"help":renderHelp();break;case"add-custom-block":openAddCustomBlockModal();break;case"intensive":case"course2":setMainContent('<div class="empty-state"><div class="empty-icon">\uD83D\uDEA7</div><h3>В разработке</h3></div>')}window.innerWidth<768&&t.classList.remove("open")}}),renderStudents(),loadCustomBlocks(),applyHiddenSections(),showBetaNotice(),setInterval(()=>{fetch("check_access.php").then(e=>e.json()).then(e=>{e.active||(document.cookie="remember_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;",window.location.href="index.php?error=expired")}).catch(()=>{})},6e4),document.getElementById("mainContent").addEventListener("click",()=>{window.innerWidth<768&&t.classList.contains("open")&&t.classList.remove("open")})});let draggedHomeworkBlock=null;function handleDragStart(e){(draggedHomeworkBlock=e.target.closest(".homework-block"))&&(e.dataTransfer.effectAllowed="move",draggedHomeworkBlock.classList.add("dragging"))}function handleDragEnd(e){let t=e.target.closest(".homework-block");t&&t.classList.remove("dragging"),draggedHomeworkBlock=null}function handleDragOver(e){e.preventDefault(),e.dataTransfer.dropEffect="move"}function handleDrop(e){e.preventDefault();let t=document.getElementById("homeworkBlocksContainer");if(!t||!draggedHomeworkBlock)return;let l=document.elementFromPoint(e.clientX,e.clientY),o=l?l.closest(".homework-block"):null;if(!o||o===draggedHomeworkBlock)return;let a=o.getBoundingClientRect(),n=a.top+a.height/2;e.clientY<n?t.insertBefore(draggedHomeworkBlock,o):t.insertBefore(draggedHomeworkBlock,o.nextSibling);let s=[];t.querySelectorAll(".homework-block").forEach(e=>{let t=e.querySelector('[onclick*="openHomeworkEditBlockModal"]');if(t){let l=t.getAttribute("onclick").match(/openHomeworkEditBlockModal\((\d+)/);l&&s.push(l[1])}}),reorderHomeworkBlocks(s,t.dataset.student)}function reorderHomeworkBlocks(e,t){fetch("reorder_homework_blocks.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`student_id=${t}&order=${encodeURIComponent(JSON.stringify(e))}`}).then(e=>e.json()).then(e=>{e.success||alert("Ошибка при сохранении порядка")})}function renderLibrary(){if("basic"===CURRENT_PLAN){setMainContent(`<div class="empty-state"><div class="empty-icon">🔒</div><h3>Доступно в Профессиональном тарифе</h3><p><a href="contact.html">Повысить тариф</a></p></div>`);return}Promise.all([fetch("get_library_sections.php").then(e=>e.json()),fetch("get_library_tasks.php").then(e=>e.json())]).then(([e,t])=>{let l=[];t.sections&&t.sections.forEach(e=>{e.blocks&&e.blocks.forEach(t=>{t.section_id=e.id,l.push(t)})}),t.ungrouped_blocks&&(l=l.concat(t.ungrouped_blocks)),window.libraryData={sections:t.sections,blocks:l};let o="";e.forEach(e=>{o+=`<button class="schedule-mode-btn" onclick="filterLibraryBlocks(${e.id})">📁 ${e.name}</button>`});let a=`
            <div class="dashboard-header">
                <h2>Библиотека заданий</h2>
                <div style="display:flex; gap:8px;">
                    <button class="btn-add" onclick="openAddLibrarySectionModal()">+ Раздел</button>
                    <button class="btn-add" onclick="openAddLibraryBlockModal()">+ Блок</button>
                </div>
            </div>
            <div class="schedule-mode-switcher" style="margin-bottom:20px;">
                <button class="schedule-mode-btn active" onclick="filterLibraryBlocks(null)">📁 Все</button>
                ${o}
            </div>`;e.forEach(e=>{a+=`
                <div class="library-section" data-section-id="${e.id}">
                    <div class="library-section__header">
                        <h3 class="library-section__title">${e.name}</h3>
                        <div class="library-section__actions">
                            <button class="btn-icon" onclick="event.stopPropagation(); openEditLibrarySectionModal(${e.id}, '${e.name.replace(/'/g,"\\'")}')">✏️</button>
                            <button class="btn-icon" onclick="event.stopPropagation(); deleteLibrarySection(${e.id})">🗑️</button>
                            <button class="btn-add" onclick="event.stopPropagation(); openAddLibraryBlockModal(${e.id})">+ Добавить блок</button>
                        </div>
                    </div>
                    <div class="blocks-grid">`;let t=l.filter(t=>t.section_id==e.id);t.forEach(e=>{a+=renderLibraryBlockCard(e)}),a+="</div></div>"});let n=t.ungrouped_tasks||[];n.length>0&&(a+='<h3 style="margin-top:24px;">Задания без блока</h3><div class="blocks-grid">',n.forEach(e=>a+=renderLibraryTaskCard(e,null)),a+="</div>"),setMainContent(a),initLibraryDragDrop(),window.currentLibrarySectionId&&filterLibraryBlocks(window.currentLibrarySectionId)})}function filterLibraryBlocks(e=null){window.currentLibrarySectionId=e,document.querySelectorAll(".library-section").forEach(t=>{let l=t.dataset.sectionId;null===e||"all"===e?t.style.display="":l===String(e)?t.style.display="":t.style.display="none"}),document.querySelectorAll(".schedule-mode-btn").forEach(e=>e.classList.remove("active"));let t;(t=null===e?document.querySelector('.schedule-mode-btn[onclick="filterLibraryBlocks(null)"]'):"none"===e?document.querySelector(".schedule-mode-btn[onclick=\"filterLibraryBlocks('none')\"]"):document.querySelector(`.schedule-mode-btn[onclick="filterLibraryBlocks(${e})"]`))&&t.classList.add("active")}function buildLibrarySections(e,t){let l=document.getElementById("librarySectionsContainer");if(!l)return;let o="";e.forEach(e=>{t.filter(t=>t.section_id==e.id),o+=`
            <div class="library-section" data-section-id="${e.id}">
                <div class="library-section__header">
                    <h3 class="library-section__title">${e.name}</h3>
                    <div class="library-section__actions">
                        <button class="btn-icon" onclick="event.stopPropagation(); openEditLibrarySectionModal(${e.id}, '${e.name.replace(/'/g,"\\'")}')">✏️</button>
                        <button class="btn-icon" onclick="event.stopPropagation(); deleteLibrarySection(${e.id})">🗑️</button>
                        <button class="btn-add" onclick="event.stopPropagation(); openAddLibraryBlockModal(${e.id})">+ Добавить блок</button>
                    </div>
                </div>
                <div class="blocks-grid" id="sectionBlocks-${e.id}"></div>
            </div>`});let a=t.filter(e=>!e.section_id);if(a.length>0&&(o+=`<h3 style="margin-top:24px;">Блоки без раздела</h3>
                 <div class="blocks-grid" id="sectionBlocks-none"></div>`),l.innerHTML=o,e.forEach(e=>{let l=t.filter(t=>t.section_id==e.id),o=document.getElementById(`sectionBlocks-${e.id}`);o&&(o.innerHTML=l.map(e=>renderLibraryBlockCard(e)).join(""))}),a.length>0){let n=document.getElementById("sectionBlocks-none");n&&(n.innerHTML=a.map(e=>renderLibraryBlockCard(e)).join(""))}}function renderLibraryTabs(e=null){window.currentLibrarySectionId=e;let{sections:t,blocks:l}=window.libraryData,o="";t.forEach(t=>{let l=e==t.id?"active":"";o+=`<button class="schedule-mode-btn ${l}" onclick="renderLibraryTabs(${t.id})">📁 ${t.name}</button>`});let a=`
        <div class="dashboard-header">
            <h2>Библиотека заданий</h2>
            <div style="display:flex; gap:8px;">
                <button class="btn-add" onclick="openAddLibrarySectionModal()">+ Раздел</button>
                <button class="btn-add" onclick="openAddLibraryBlockModal(${e||"null"})">+ Блок</button>
            </div>
        </div>
        <div class="schedule-mode-switcher" style="margin-bottom:20px;">${o=`
        <button class="schedule-mode-btn ${null===e?"active":""}" onclick="renderLibraryTabs(null)">📁 Все</button>
        ${o}
    `}</div>`,n=l;null!==e&&"all"!==e&&(n=l.filter(t=>t.section_id==e)),0===n.length?a+='<div class="empty-state"><div class="empty-icon">\uD83D\uDCD6</div><h3>Нет блоков</h3></div>':(a+=`<div class="blocks-grid" id="libraryBlocksContainer" data-section-id="${e||""}">`,n.forEach(e=>{a+=renderLibraryBlockCard(e)}),a+="</div>"),setMainContent(a),initLibraryDragDrop()}let currentLibrarySectionId=null;function renderLibraryBlockCard(e){return`
        <div class="block-card library-block"
             data-block-id="${e.id}"
             data-section-id="${e.section_id||""}"
             onclick="openLibraryBlockView(${e.id}, '${e.name.replace(/'/g,"\\'")}')">
            <div class="block-card__header">
                <h3 class="block-card__title" title="${e.name}">${e.name}</h3>
                <div class="block-card__actions">
                    <button class="btn-icon" onclick="event.stopPropagation(); openEditLibraryBlockModal(${e.id}, '${e.name.replace(/'/g,"\\'")}', ${e.section_id||"null"})">✏️</button>
                    <button class="btn-icon" onclick="event.stopPropagation(); deleteLibraryBlock(${e.id})">🗑️</button>
                    <div style="margin-top: 8px;">
                        <button class="btn btn--ghost" style="width: 100%; padding: 6px 0;" onclick="event.stopPropagation(); assignLibraryBlockModal(${e.id})">+ Назначить блок</button>
                    </div>
                </div>
            </div>
            <p class="block-empty-text">Заданий: ${e.tasks?e.tasks.length:0}</p>
        </div>`}function openLibraryBlockView(e,t){fetch("get_library_tasks.php").then(e=>e.json()).then(l=>{let o=[];l.sections&&l.sections.forEach(e=>{e.blocks&&e.blocks.forEach(t=>{t.section_id=e.id,o.push(t)})}),l.ungrouped_blocks&&(o=o.concat(l.ungrouped_blocks));let a=o.find(t=>t.id==e);a?window.lastLibrarySectionId=a.section_id||null:window.lastLibrarySectionId=null;let n=a&&a.tasks||[],s=`
                <button class="btn-back" onclick="renderLibrary()">← Назад к библиотеке</button>
                <div class="dashboard-header">
                    <h2>${t}</h2>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <button class="btn-add" onclick="openAddLibraryTaskModal(${e})">+ Добавить задание</button>
                        <button class="btn-add" onclick="assignLibraryBlockModal(${e})">Назначить блок</button>
                    </div>
                </div>`;n.length?s+='<div class="blocks-grid library-tasks-grid" data-block-id="'+e+'">'+n.map(e=>renderLibraryTaskCard(e)).join("")+"</div>":s+='<div class="empty-state"><div class="empty-icon">\uD83D\uDCC4</div><h3>Нет заданий</h3></div>',setMainContent(s),n.length>0&&initLibraryTasksDragDrop()})}function renderLibraryTaskCard(e,t=null){let l="";if(e.links)try{let o=JSON.parse(e.links);l=o.map(e=>{let t=getRutubeEmbed(e);return t||`<a href="${e}" target="_blank" style="display:inline-block; margin-top:6px;">🔗 Ссылка</a>`}).join("")}catch(a){}return`
        <div class="block-card library-task"
             data-task-id="${e.id}"
             data-title="${encodeURIComponent(e.title)}"
             data-text="${encodeURIComponent(e.text||"")}"
             data-links="${encodeURIComponent(e.links||"")}"
             data-block-id="${e.block_id||""}"
             data-section-id="${t||""}"
             style="cursor:default;">
            <div class="block-card__header">
                <h3 class="block-card__title">${e.title}</h3>
                <div class="block-card__actions">
                    <button class="btn-icon edit-task-btn">✏️</button>
                    <button class="btn-icon delete-task-btn">🗑️</button>
                </div>
            </div>
            <p>${e.text||""}</p>
            ${l}
            <button class="btn-add assign-task-btn" data-section-id="${t||""}">Назначить ученику</button>
        </div>`}function openAddLibraryBlockModal(e=null){fetch("get_library_sections.php").then(e=>e.json()).then(t=>{let l="";t.forEach(t=>{l+=`<option value="${t.id}" ${t.id==e?"selected":""}>${t.name}</option>`});let o=document.createElement("div");o.className="modal-overlay active",o.innerHTML=`
                <div class="modal">
                    <button class="modal__close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                    <h3>Новый блок в библиотеке</h3>
                    <div class="form-group"><label class="form-label">Название блока</label><input type="text" id="libBlockName" class="form-input"></div>
                    <div class="form-group"><label class="form-label">Раздел</label><select id="libBlockSection" class="form-select">${l}</select></div>
                    <button class="btn btn--primary" onclick="addLibraryBlock()">Создать</button>
                </div>`,document.body.appendChild(o)})}function addLibraryBlock(){let e=document.getElementById("libBlockName").value.trim(),t=document.getElementById("libBlockSection")?.value||"";if(!e)return alert("Введите название");fetch("add_library_block.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`name=${encodeURIComponent(e)}&section_id=${t}`}).then(e=>e.json()).then(e=>{e.success?(e.id&&(window.__lastLibraryBlockId=e.id),document.querySelector(".modal-overlay").remove(),renderLibrary()):alert(e.error)})}function openEditLibraryBlockModal(e,t,l=null){fetch("get_library_sections.php").then(e=>e.json()).then(o=>{let a="";o.forEach(e=>{let t=e.id==l?" selected":"";a+=`<option value="${e.id}"${t}>${e.name}</option>`});let n=document.createElement("div");n.className="modal-overlay active",n.innerHTML=`
                <div class="modal">
                    <button class="modal__close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                    <h3>Редактировать блок</h3>
                    <div class="form-group"><label class="form-label">Название</label><input type="text" id="libBlockName" class="form-input" value="${t}"></div>
                    <div class="form-group"><label class="form-label">Раздел</label><select id="libBlockSection" class="form-select">${a}</select></div>
                    <button class="btn btn--primary" onclick="editLibraryBlock(${e})">Сохранить</button>
                </div>`,document.body.appendChild(n)})}function refreshLibraryDataAndUI(){Promise.all([fetch("get_library_sections.php").then(e=>e.json()),fetch("get_library_tasks.php").then(e=>e.json())]).then(([e,t])=>{let l=[];t.sections&&t.sections.forEach(e=>{e.blocks&&e.blocks.forEach(t=>{t.section_id=e.id,l.push(t)})}),t.ungrouped_blocks&&(l=l.concat(t.ungrouped_blocks)),window.libraryData={sections:e,blocks:l},document.querySelectorAll(".library-section").forEach(e=>{let t=e.dataset.sectionId,o=l.filter(e=>e.section_id==t),a=e.querySelector(".blocks-grid");a&&(a.innerHTML=o.map(e=>renderLibraryBlockCard(e)).join(""))});let o=l.filter(e=>!e.section_id);document.querySelector("h3 + .blocks-grid");let a=document.querySelectorAll("h3");a.forEach(e=>{if(e.textContent.includes("Блоки без раздела")){let t=e.nextElementSibling;t&&(t.innerHTML=o.map(e=>renderLibraryBlockCard(e)).join(""))}}),filterLibraryBlocks(window.currentLibrarySectionId)})}function editLibraryBlock(e){let t=document.getElementById("libBlockName").value.trim(),l=document.getElementById("libBlockSection")?.value||"";if(!t)return alert("Введите название");fetch("update_library_block.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`id=${e}&name=${encodeURIComponent(t)}&section_id=${l}`}).then(e=>e.json()).then(e=>{e.success?(document.querySelector(".modal-overlay").remove(),refreshLibraryDataAndUI()):alert(e.error)})}function deleteLibraryBlock(e){confirm("Удалить блок? Задания внутри будут перенесены в \xabБез блока\xbb.")&&fetch("delete_library_block.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`id=${e}`}).then(e=>e.json()).then(e=>{e.success?refreshLibraryDataAndUI():alert(e.error)})}function openAddLibrarySectionModal(){let e=document.createElement("div");e.className="modal-overlay active",e.innerHTML=`
        <div class="modal">
            <button class="modal__close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            <h3>Новый раздел</h3>
            <div class="form-group"><label class="form-label">Название раздела</label><input type="text" id="libSectionName" class="form-input"></div>
            <button class="btn btn--primary" onclick="addLibrarySection()">Создать</button>
        </div>`,document.body.appendChild(e)}function addLibrarySection(){let e=document.getElementById("libSectionName").value.trim();if(!e)return alert("Введите название");fetch("add_library_section.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`name=${encodeURIComponent(e)}`}).then(e=>e.json()).then(e=>{e.success?(e.id&&(window.__lastLibrarySectionId=e.id),document.querySelector(".modal-overlay").remove(),renderLibrary()):alert(e.error)})}function openEditLibrarySectionModal(e,t){let l=document.createElement("div");l.className="modal-overlay active",l.innerHTML=`
        <div class="modal">
            <button class="modal__close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            <h3>Переименовать раздел</h3>
            <div class="form-group"><label class="form-label">Название</label><input type="text" id="libSectionName" class="form-input" value="${t}"></div>
            <button class="btn btn--primary" onclick="updateLibrarySection(${e})">Сохранить</button>
        </div>`,document.body.appendChild(l)}function updateLibrarySection(e){let t=document.getElementById("libSectionName").value.trim();if(!t)return alert("Введите название");fetch("update_library_section.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`id=${e}&name=${encodeURIComponent(t)}`}).then(e=>e.json()).then(e=>{e.success?(document.querySelector(".modal-overlay").remove(),refreshLibraryDataAndUI()):alert(e.error)})}function deleteLibrarySection(e){confirm("Удалить раздел? Блоки внутри станут без раздела.")&&fetch("delete_library_section.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`id=${e}`}).then(e=>e.json()).then(e=>{e.success?refreshLibraryDataAndUI():alert(e.error)})}function openEditLibraryTaskModal(e,t,l,o,a=null,n=""){fetch("get_library_blocks.php").then(e=>{if(!e.ok)throw Error("Ошибка сервера");return e.json()}).then(s=>{if(!Array.isArray(s))throw Error("Неверный формат данных");let i='<option value="">Без блока</option>';s.forEach(e=>{let t=e.id==a?" selected":"";i+=`<option value="${e.id}"${t}>${e.name}</option>`});let r=o;try{let d=JSON.parse(o);Array.isArray(d)&&(r=d.join("\n"))}catch(c){}let p=document.createElement("div");p.className="modal-overlay active",p.innerHTML=`
                <div class="modal">
                    <button class="modal__close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                    <h3>Редактировать задание</h3>
                    <div class="form-group"><label class="form-label">Блок</label><select id="libBlockSelect" class="form-select">${i}</select></div>
                    <div class="form-group"><label class="form-label">Название</label><input type="text" id="libTitle" class="form-input" value="${t}"></div>
                    <div class="form-group"><label class="form-label">Текст</label><textarea id="libText" class="form-input" rows="4">${l}</textarea></div>
                    <div class="form-group"><label class="form-label">Ссылки (каждая с новой строки)</label><textarea id="libLinks" class="form-input" rows="3">${r}</textarea></div>
                    <button class="btn btn--primary" onclick="updateLibraryTask(${e}, ${a||"null"}, '${n.replace(/'/g,"\\'")}')">Сохранить</button>
                </div>`,document.body.appendChild(p)}).catch(e=>{console.error("Ошибка загрузки блоков:",e),alert("Не удалось загрузить список блоков. Попробуйте позже.")})}function addLibraryTask(e=null,t=""){let l=document.getElementById("libBlockSelect").value,o=document.getElementById("libTitle").value.trim(),a=document.getElementById("libText").value.trim(),n=document.getElementById("libLinks").value.trim();if(!o)return alert("Название обязательно");fetch("add_library_task.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`block_id=${l}&title=${encodeURIComponent(o)}&text=${encodeURIComponent(a)}&links=${encodeURIComponent(n)}`}).then(e=>e.json()).then(l=>{l.success?(document.querySelector(".modal-overlay").remove(),e&&"null"!==e?openLibraryBlockView(e,t):renderLibrary()):alert(l.error)})}function openAddLibraryTaskModal(e=null,t=""){fetch("get_library_blocks.php").then(e=>e.json()).then(l=>{let o='<option value="">Без блока</option>';l.forEach(t=>{o+=`<option value="${t.id}" ${t.id==e?"selected":""}>${t.name}</option>`});let a=document.createElement("div");a.className="modal-overlay active",a.innerHTML=`
                <div class="modal">
                    <button class="modal__close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                    <h3>Новое задание в библиотеку</h3>
                    <div class="form-group"><label class="form-label">Блок</label><select id="libBlockSelect" class="form-select">${o}</select></div>
                    <div class="form-group"><label class="form-label">Название</label><input type="text" id="libTitle" class="form-input"></div>
                    <div class="form-group"><label class="form-label">Текст</label><textarea id="libText" class="form-input" rows="4"></textarea></div>
                    <div class="form-group"><label class="form-label">Ссылки (каждая с новой строки)</label><textarea id="libLinks" class="form-input" rows="3"></textarea></div>
                    <button class="btn btn--primary" onclick="addLibraryTask(${e||"null"}, '${t.replace(/'/g,"\\'")}')">Сохранить</button>
                </div>`,document.body.appendChild(a)})}function updateLibraryTask(e,t=null,l=""){let o=document.getElementById("libBlockSelect").value,a=document.getElementById("libTitle").value.trim(),n=document.getElementById("libText").value.trim(),s=document.getElementById("libLinks").value.trim();if(!a)return alert("Название обязательно");fetch("update_library_task.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`id=${e}&block_id=${o}&title=${encodeURIComponent(a)}&text=${encodeURIComponent(n)}&links=${encodeURIComponent(s)}`}).then(e=>e.json()).then(e=>{e.success?(document.querySelector(".modal-overlay").remove(),t&&"null"!==t?openLibraryBlockView(t,l):renderLibrary()):alert(e.error)})}function deleteLibraryTask(e){confirm("Удалить задание из библиотеки?")&&fetch("delete_library_task.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`id=${e}`}).then(e=>e.json()).then(e=>{e.success?renderLibrary():alert(e.error)})}function assignLibraryTaskToStudent(e){let t=window.lastLibrarySectionId||null;Promise.all([fetch("get_students.php").then(e=>e.json()),fetch(`get_assigned_students.php?task_id=${e}`).then(e=>e.json())]).then(([l,o])=>{let a="";l.forEach(e=>{let t=o.includes(Number(e.id))?"disabled":"";a+=`<label><input type="checkbox" value="${e.id}" ${t}> ${e.first_name} ${e.last_name}${t?" (уже назначено)":""}</label><br>`});let n=document.createElement("div");n.className="modal-overlay active",n.innerHTML=`
            <div class="modal">
                <button class="modal__close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                <h3>Назначить задание ученику</h3>
                <div>${a}</div>
                <button class="btn btn--primary" onclick="assignLibraryToSingleStudent(${e}, '${t||""}')">Назначить выбранному</button>
            </div>`,document.body.appendChild(n)})}function openLibraryAssignmentModal(e,t,l=null){Promise.all([fetch("get_library_tasks.php").then(e=>e.json()),fetch(`get_homework_categories.php?student_id=${e}`).then(e=>e.json()),fetch(`get_homework_blocks.php?student_id=${e}&category_id=all`).then(e=>e.json())]).then(([o,a,n])=>{let s=[];if(o.blocks&&o.blocks.forEach(e=>{e.tasks&&(s=s.concat(e.tasks))}),o.ungrouped&&(s=s.concat(o.ungrouped)),0===s.length){alert("В библиотеке нет заданий");return}let i="";s.forEach(e=>{i+=`<option value="${e.id}">${e.title}</option>`});let r='<option value="">Без категории</option>';a.forEach(e=>{r+=`<option value="${e.id}" ${e.id==l?"selected":""}>${e.name}</option>`});let d='<option value="">Без блока</option>';n.forEach(e=>{d+=`<option value="${e.id}">${e.name}</option>`});let c=document.createElement("div");c.className="modal-overlay active",c.innerHTML=`
            <div class="modal">
                <button class="modal__close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                <h3>Выбрать из библиотеки</h3>
                <div class="form-group">
                    <label class="form-label">Задание</label>
                    <select id="libSelect" class="form-select">${i}</select>
                </div>
                <div class="form-group">
                    <label class="form-label">Категория</label>
                    <select id="libCategory" class="form-select">${r}</select>
                </div>
                <div class="form-group">
                    <label class="form-label">Блок</label>
                    <select id="libBlock" class="form-select">${d}</select>
                </div>
                <button class="btn btn--primary" onclick="assignLibraryToStudent(${e}, '${t.replace(/'/g,"\\'")}')">Назначить</button>
            </div>`,document.body.appendChild(c)}).catch(e=>{console.error("Ошибка загрузки:",e),alert("Не удалось загрузить данные")})}function assignLibraryToSingleStudent(e,t=null){let l=document.querySelectorAll(".modal input[type=checkbox]:checked:not([disabled])");if(0===l.length)return alert("Выберите учеников");let o="";if(t){let a=window.libraryData;if(a&&a.sections){let n=a.sections.find(e=>e.id==t);n&&(o=n.name)}}let s=[];l.forEach(t=>{s.push(fetch("assign_task.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`task_id=${e}&student_id=${t.value}&category_name=${encodeURIComponent(o)}`}).then(e=>e.json()))}),Promise.all(s).then(e=>{let t=e.filter(e=>e.error);if(t.length>0)alert("Некоторые задания не назначены: "+t.map(e=>e.error).join(", "));else if(document.querySelector(".modal-overlay").remove(),alert("Задания назначены"),window.currentHomeworkData){let l=window.currentHomeworkData.studentId;Promise.all([fetch(`get_homework_categories.php?student_id=${l}`).then(e=>e.json()),fetch(`get_homework_blocks.php?student_id=${l}&category_id=all`).then(e=>e.json()),fetch(`get_homeworks.php?student_id=${l}`).then(e=>e.json())]).then(([e,t,l])=>{window.currentHomeworkData.categories=e,window.currentHomeworkData.blocks=t,window.currentHomeworkData.homeworks=l,renderHomeworkTabs(window.lastHomeworkCategoryId)})}})}function assignLibraryBlock(e){let t=document.querySelectorAll(".modal input[type=checkbox]:checked");if(0===t.length)return alert("Выберите учеников");let l="",o=window.libraryData;if(o&&o.sections){for(let a of o.sections)if(a.blocks&&a.blocks.some(t=>t.id==e)){l=a.name;break}}fetch("get_library_tasks.php").then(e=>e.json()).then(o=>{let a=[];o.sections&&o.sections.forEach(e=>{e.blocks&&(a=a.concat(e.blocks))}),o.ungrouped_blocks&&(a=a.concat(o.ungrouped_blocks));let n=a.find(t=>t.id==e);if(!n||!n.tasks||0===n.tasks.length){alert("В блоке нет заданий");return}let s=n.tasks.map(e=>e.id),i=[];t.forEach(e=>{s.forEach(t=>{i.push(fetch("assign_task.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`task_id=${t}&student_id=${e.value}&category_name=${encodeURIComponent(l)}`}).then(e=>e.json()))})}),Promise.all(i).then(e=>{let t=e.filter(e=>e.error);if(t.length>0)alert("Некоторые задания не назначены: "+t.map(e=>e.error).join(", "));else if(document.querySelector(".modal-overlay").remove(),alert("Все задания блока назначены выбранным ученикам"),window.currentHomeworkData){let l=window.currentHomeworkData.studentId;Promise.all([fetch(`get_homework_categories.php?student_id=${l}`).then(e=>e.json()),fetch(`get_homework_blocks.php?student_id=${l}&category_id=all`).then(e=>e.json()),fetch(`get_homeworks.php?student_id=${l}`).then(e=>e.json())]).then(([e,t,l])=>{window.currentHomeworkData.categories=e,window.currentHomeworkData.blocks=t,window.currentHomeworkData.homeworks=l,renderHomeworkTabs(window.lastHomeworkCategoryId)})}})})}function initLibraryDragDrop(){let e=document.querySelectorAll("#mainContent .blocks-grid");e.length&&e.forEach(e=>{if("true"===e.dataset.dragInit)return;e.dataset.dragInit="true";let t=e.querySelectorAll(".library-block");t.forEach(e=>{e.setAttribute("draggable",!0),e.addEventListener("dragstart",handleLibraryDragStart),e.addEventListener("dragend",handleLibraryDragEnd)}),e.addEventListener("dragover",handleLibraryDragOver),e.addEventListener("drop",handleLibraryDrop)})}let draggedLibraryBlock=null;function handleLibraryDragStart(e){(draggedLibraryBlock=e.target.closest(".library-block"))&&(e.dataTransfer.effectAllowed="move",draggedLibraryBlock.classList.add("dragging"))}function handleLibraryDragEnd(e){let t=e.target.closest(".library-block");t&&t.classList.remove("dragging"),draggedLibraryBlock=null}function handleLibraryDragOver(e){e.preventDefault(),e.dataTransfer.dropEffect="move"}function handleLibraryDrop(e){e.preventDefault();let t=e.target.closest(".blocks-grid");if(!t||!draggedLibraryBlock)return;let l=document.elementFromPoint(e.clientX,e.clientY),o=l?l.closest(".library-block"):null;if(o&&o!==draggedLibraryBlock){let a=o.getBoundingClientRect(),n=a.top+a.height/2;e.clientY<n?t.insertBefore(draggedLibraryBlock,o):t.insertBefore(draggedLibraryBlock,o.nextSibling)}else t.appendChild(draggedLibraryBlock);let s=[];t.querySelectorAll(".library-block").forEach(e=>{let t=e.dataset.blockId;t&&s.push(t)}),reorderLibraryBlocks(s)}function reorderLibraryBlocks(e){fetch("reorder_library_blocks.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`order=${encodeURIComponent(JSON.stringify(e))}`}).then(e=>e.json()).then(e=>{e.success||alert("Ошибка сохранения порядка")})}function initLibraryTasksDragDrop(){let e=document.querySelector(".library-tasks-grid");if(!e)return;let t=e.querySelectorAll(".library-task");t.forEach(e=>{e.setAttribute("draggable",!0),e.addEventListener("dragstart",handleTaskDragStart),e.addEventListener("dragend",handleTaskDragEnd)}),e.addEventListener("dragover",handleTaskDragOver),e.addEventListener("drop",handleTaskDrop)}let draggedTask=null;function handleTaskDragStart(e){(draggedTask=e.target.closest(".library-task"))&&(e.dataTransfer.effectAllowed="move",draggedTask.classList.add("dragging"))}function handleTaskDragEnd(e){let t=e.target.closest(".library-task");t&&t.classList.remove("dragging"),draggedTask=null}function handleTaskDragOver(e){e.preventDefault(),e.dataTransfer.dropEffect="move"}function handleTaskDrop(e){e.preventDefault();let t=document.querySelector(".library-tasks-grid");if(!t||!draggedTask)return;let l=document.elementFromPoint(e.clientX,e.clientY),o=l?l.closest(".library-task"):null;if(!o||o===draggedTask)return;let a=o.getBoundingClientRect(),n=a.top+a.height/2;e.clientY<n?t.insertBefore(draggedTask,o):t.insertBefore(draggedTask,o.nextSibling);let s=[];t.querySelectorAll(".library-task").forEach(e=>{let t=e.dataset.taskId;t&&s.push(t)});let i=t.closest("[data-block-id]")?.dataset.blockId;i&&reorderLibraryTasks(s,i)}function reorderLibraryTasks(e,t){fetch("reorder_library_tasks.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`block_id=${t}&order=${encodeURIComponent(JSON.stringify(e))}`}).then(e=>e.json()).then(e=>{e.success||alert("Ошибка сохранения порядка")})}function assignLibraryBlockModal(e){fetch("get_students.php").then(e=>e.json()).then(t=>{let l="";t.forEach(e=>{l+=`<label><input type="checkbox" value="${e.id}"> ${e.first_name} ${e.last_name}</label><br>`});let o=document.createElement("div");o.className="modal-overlay active",o.innerHTML=`
                <div class="modal">
                    <button class="modal__close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                    <h3>Назначить все задания блока</h3>
                    <div>${l}</div>
                    <button class="btn btn--primary" onclick="assignLibraryBlock(${e})">Назначить выбранным</button>
                </div>`,document.body.appendChild(o)})}function assignLibraryBlock(e){let t=document.querySelectorAll(".modal input[type=checkbox]:checked");if(0===t.length)return alert("Выберите учеников");let l="",o=window.libraryData;if(o&&o.sections){for(let a of o.sections)if(a.blocks&&a.blocks.some(t=>t.id==e)){l=a.name;break}}fetch("get_library_tasks.php").then(e=>e.json()).then(o=>{let a=[];o.sections&&o.sections.forEach(e=>{e.blocks&&(a=a.concat(e.blocks))}),o.ungrouped_blocks&&(a=a.concat(o.ungrouped_blocks));let n=a.find(t=>t.id==e);if(!n||!n.tasks||0===n.tasks.length){alert("В блоке нет заданий");return}let s=n.tasks.map(e=>e.id),i=[];t.forEach(e=>{s.forEach(t=>{i.push(fetch("assign_task.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`task_id=${t}&student_id=${e.value}&category_name=${encodeURIComponent(l)}`}).then(e=>e.json()))})}),Promise.all(i).then(e=>{let t=e.filter(e=>e.error);if(t.length>0)alert("Некоторые задания не назначены: "+t.map(e=>e.error).join(", "));else if(document.querySelector(".modal-overlay").remove(),alert("Все задания блока назначены выбранным ученикам"),window.currentHomeworkData){let l=window.currentHomeworkData.studentId;Promise.all([fetch(`get_homework_categories.php?student_id=${l}`).then(e=>e.json()),fetch(`get_homework_blocks.php?student_id=${l}&category_id=all`).then(e=>e.json()),fetch(`get_homeworks.php?student_id=${l}`).then(e=>e.json())]).then(([e,t,l])=>{window.currentHomeworkData.categories=e,window.currentHomeworkData.blocks=t,window.currentHomeworkData.homeworks=l,renderHomeworkTabs(window.lastHomeworkCategoryId)})}})})}function renderBlocks(e){if("basic"===CURRENT_PLAN){setMainContent(`<div class="empty-state"><div class="empty-icon">🔒</div><h3>Доступно в Профессиональном тарифе</h3><p><a href="contact.html">Повысить тариф</a></p></div>`);return}let t="lecture"===e?"Лекции":"Шпоры",l="lecture"===e?"\uD83D\uDCDA":"\uD83D\uDCCB";fetch(`get_blocks.php?type=${e}`).then(e=>e.json()).then(async o=>{let a=`
                <div class="dashboard-header">
                    <h2>${t}</h2>
                    <button class="btn-add" onclick="openAddBlockModal('${e}')">+ Добавить блок</button>
                </div>`;if(0===o.length)a+=`<div class="empty-state"><div class="empty-icon">${l}</div><h3>Нет блоков</h3><p>Добавьте первый блок, чтобы начать.</p></div>`;else{for(let n of(a+=`<div class="blocks-grid" id="lectureBlocksContainer" data-type="${e}">`,o)){let s=await fetch(`get_block_items.php?block_id=${n.id}`).then(e=>e.json()),i="";s.length>0?(i='<ul class="block-items-list">',s.forEach(e=>{i+=`<li>${e.title} ${e.link?`<a href="${e.link}" target="_blank" onclick="event.stopPropagation()">🔗</a>`:""}</li>`}),i+="</ul>"):i=`<p class="block-empty-text">Нет материалов</p>`,a+=`
    <div class="block-card" data-block-id="${n.id}" onclick="openBlockView(${n.id}, '${n.name.replace(/'/g,"\\'")}', '${e}')">
        <div class="block-card__header">
            <h3 class="block-card__title">${n.name}</h3>
            <div class="block-card__actions">
                <button class="btn-icon" onclick="event.stopPropagation(); openEditBlockModal(${n.id}, '${n.name.replace(/'/g,"\\'")}', '${e}')">✏️</button>
                <button class="btn-icon" onclick="event.stopPropagation(); deleteBlock(${n.id}, '${e}')">🗑️</button>
            </div>
        </div>
        ${i}
    </div>`}a+="</div>"}setMainContent(a),o.length>0&&initLectureDragDrop(e)}).catch(()=>showEmptyState(l,t,"Ошибка загрузки."))}function openAddBlockModal(e){let t=document.createElement("div");t.className="modal-overlay active",t.innerHTML=`
        <div class="modal">
            <button class="modal__close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            <h3>Добавить блок</h3>
            <div class="form-group"><label class="form-label">Название блока</label><input type="text" id="blockName" class="form-input"></div>
            <button class="btn btn--primary" onclick="addBlock('${e}')">Создать</button>
        </div>`,document.body.appendChild(t)}function addBlock(e){let t=document.getElementById("blockName").value.trim();if(!t)return alert("Введите название");fetch("add_block.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`name=${encodeURIComponent(t)}&type=${e}`}).then(e=>e.json()).then(t=>{t.success?(document.querySelector(".modal-overlay").remove(),renderBlocks(e)):alert(t.error)})}function openBlockView(e,t,l){fetch(`get_block_items.php?block_id=${e}`).then(e=>e.json()).then(o=>{let a="";o.forEach(o=>{a+=`
                    <tr style="cursor:pointer;" onclick="openLessonView(${o.id}, '${o.title.replace(/'/g,"\\'")}', '${(o.link||"").replace(/'/g,"\\'")}', '${(o.comment||"").replace(/'/g,"\\'")}', ${e}, '${t.replace(/'/g,"\\'")}', '${l}')">
                        <td>${o.title}</td>
                    </tr>`}),setMainContent(`
                <button class="btn-back" onclick="renderBlocks('${l}')">Назад к блокам</button>
                <div class="dashboard-header">
                    <h2>${t}</h2>
                    <div style="display:flex; gap:8px; align-items:center;">
                        <button class="btn-add" onclick="openAddItemModal(${e}, '${t.replace(/'/g,"\\'")}', '${l}')">+ Добавить ${"lecture"===l?"лекцию":"материал"}</button>
                        ${"lecture"===l?`<button class="btn-icon" onclick="openBlockAccessModal(${e})" title="Настроить доступ">👥</button>`:""}
                    </div>
                </div>
                ${o.length?`
                    <div class="table-responsive elegant-table">
                        <table>
                            <thead><tr><th>Название</th></tr></thead>
                            <tbody>${a}</tbody>
                        </table>
                    </div>`:`<div class="empty-state"><div class="empty-icon">📄</div><h3>Нет материалов</h3></div>`}
            `)})}function openBlockAccessModal(e){Promise.all([fetch("get_students.php").then(e=>e.json()),fetch(`get_block_access.php?block_id=${e}`).then(e=>e.json())]).then(([t,l])=>{let o="";t.forEach(e=>{let t=l.includes(Number(e.id))?"checked":"";o+=`<label><input type="checkbox" value="${e.id}" ${t}> ${e.first_name} ${e.last_name}</label><br>`});let a=document.createElement("div");a.className="modal-overlay active",a.innerHTML=`
            <div class="modal">
                <button class="modal__close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                <h3>Доступ к блоку</h3>
                <p>Выберите учеников, которые увидят этот блок:</p>
                <div>${o}</div>
                <button class="btn btn--primary" onclick="saveBlockAccess(${e})">Сохранить</button>
            </div>`,document.body.appendChild(a)})}function saveBlockAccess(e){let t=[];document.querySelectorAll(".modal input[type=checkbox]:checked").forEach(e=>t.push(e.value)),fetch("update_block_access.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`block_id=${e}&student_ids=${encodeURIComponent(JSON.stringify(t))}`}).then(e=>e.json()).then(e=>{e.success?(document.querySelector(".modal-overlay").remove(),alert("Доступ обновлён")):alert(e.error)})}function openLessonView(e,t,l,o,a,n,s){setMainContent(`
        <button class="btn-back" onclick="openBlockView(${a}, '${n.replace(/'/g,"\\'")}', '${s}')">← Назад к блоку</button>
        <div class="lesson-detail">
            <div class="lesson-detail__header">
                <h2 class="lesson-detail__title">${t||"Без названия"}</h2>
            </div>
            <div class="lesson-detail__row">
                <span class="lesson-detail__label">Название</span>
                <span class="lesson-detail__value">
                    <input type="text" id="itemTitle" class="form-input" value="${t}">
                </span>
            </div>
            <div class="lesson-detail__row">
                <span class="lesson-detail__label">Ссылка</span>
                <span class="lesson-detail__value">
                    <input type="text" id="itemLink" class="form-input" value="${l||""}">
                    ${getRutubeEmbed(l)}
                </span>
            </div>
            <div class="lesson-detail__row">
                <span class="lesson-detail__label">Файлы</span>
                <span class="lesson-detail__value">
                    <div id="blockItemFilesContainer"></div>
                    <div class="file-upload-custom" style="margin-top:8px;">
                        <label for="blockItemFileInput" class="file-upload-trigger">📎 Выбрать файлы</label>
                        <input type="file" id="blockItemFileInput" multiple
                               onchange="document.getElementById('blockItemFileInfo').textContent = this.files.length ? 'Выбрано: ' + this.files.length + ' файл(ов)' : ''">
                        <span class="file-upload-info" id="blockItemFileInfo"></span>
                        <button class="btn btn--secondary" onclick="uploadFiles('block_item', ${e}, 'blockItemFileInput', 'blockItemFilesContainer', 'blockItemFileInfo')">Загрузить</button>
                    </div>
                </span>
            </div>
            <div class="lesson-detail__row">
                <span class="lesson-detail__label">Комментарий</span>
                <span class="lesson-detail__value">
                    <textarea id="itemComment" class="form-input" rows="4">${o||""}</textarea>
                </span>
            </div>
            <div style="display:flex; gap:12px; margin-top:20px;">
                <button class="btn btn--primary" onclick="updateBlockItem(${e}, ${a}, '${n.replace(/'/g,"\\'")}', '${s}')">Сохранить</button>
                <button class="btn btn--danger" onclick="deleteBlockItem(${e}, ${a}, '${n.replace(/'/g,"\\'")}', '${s}')">Удалить</button>
            </div>
        </div>`),loadFiles("block_item",e,"blockItemFilesContainer")}function openAddItemModal(e,t,l){let o=document.createElement("div");o.className="modal-overlay active",o.innerHTML=`
        <div class="modal">
            <button class="modal__close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            <h3>Добавить ${"lecture"===l?"лекцию":"шпору"}</h3>
            <div class="form-group"><label class="form-label">Название</label><input type="text" id="itemTitle" class="form-input"></div>
            <div class="form-group"><label class="form-label">Ссылка</label><input type="text" id="itemLink" class="form-input"></div>
            <div class="form-group"><label class="form-label">Комментарий</label><textarea id="itemComment" class="form-input" rows="3"></textarea></div>
            <button class="btn btn--primary" onclick="addBlockItem(${e}, '${t.replace(/'/g,"\\'")}', '${l}')">Сохранить</button>
        </div>`,document.body.appendChild(o)}function addBlockItem(e,t,l){let o=document.getElementById("itemTitle").value.trim(),a=document.getElementById("itemLink").value.trim(),n=document.getElementById("itemComment").value.trim();if(!o)return alert("Введите название");fetch("add_block_item.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`block_id=${e}&title=${encodeURIComponent(o)}&link=${encodeURIComponent(a)}&comment=${encodeURIComponent(n)}`}).then(e=>e.json()).then(o=>{o.success?(document.querySelector(".modal-overlay").remove(),openBlockView(e,t,l)):alert(o.error)})}function openEditItemModal(e,t,l,o,a,n,s){let i=document.createElement("div");i.className="modal-overlay active",i.innerHTML=`
        <div class="modal">
            <button class="modal__close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            <h3>Редактировать материал</h3>
            <div class="form-group"><label class="form-label">Название</label><input type="text" id="itemTitle" class="form-input" value="${t}"></div>
            <div class="form-group"><label class="form-label">Ссылка</label><input type="text" id="itemLink" class="form-input" value="${l}"></div>
            <div class="form-group"><label class="form-label">Комментарий</label><textarea id="itemComment" class="form-input" rows="3">${o}</textarea></div>
            <button class="btn btn--primary" onclick="updateBlockItem(${e}, ${a}, '${n}', '${s}')">Сохранить</button>
        </div>`,document.body.appendChild(i)}function updateBlockItem(e,t,l,o){let a=document.getElementById("itemTitle").value.trim(),n=document.getElementById("itemLink").value.trim(),s=document.getElementById("itemComment").value.trim();if(!a)return alert("Введите название");fetch("update_block_item.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`id=${e}&title=${encodeURIComponent(a)}&link=${encodeURIComponent(n)}&comment=${encodeURIComponent(s)}`}).then(e=>e.json()).then(e=>{e.success?(document.querySelector(".modal-overlay").remove(),openBlockView(t,l,o)):alert(e.error)})}function deleteBlockItem(e,t,l,o){confirm("Удалить материал?")&&fetch("delete_block_item.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`id=${e}`}).then(e=>e.json()).then(e=>e.success?openBlockView(t,l,o):alert(e.error))}function openEditBlockModal(e,t,l){let o=document.createElement("div");o.className="modal-overlay active",o.innerHTML=`
        <div class="modal">
            <button class="modal__close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            <h3>Редактировать блок</h3>
            <div class="form-group">
                <label class="form-label">Название блока</label>
                <input type="text" id="editBlockName" class="form-input" value="${t}">
            </div>
            <button class="btn btn--primary" onclick="editBlock(${e}, '${l}')">Сохранить</button>
        </div>`,document.body.appendChild(o)}function editBlock(e,t){let l=document.getElementById("editBlockName").value.trim();if(!l)return alert("Название не может быть пустым");fetch("update_block.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`id=${e}&name=${encodeURIComponent(l)}&type=${t}`}).then(e=>e.json()).then(e=>{e.success?(document.querySelector(".modal-overlay").remove(),renderBlocks(t)):alert("Ошибка: "+e.error)}).catch(e=>alert("Ошибка сети: "+e))}function deleteBlock(e,t){confirm("Удалить блок? Все материалы внутри него тоже удалятся.")&&fetch("delete_block.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`id=${e}`}).then(e=>e.json()).then(e=>{e.success?renderBlocks(t):alert("Ошибка: "+e.error)}).catch(e=>alert("Ошибка сети: "+e))}function initLectureDragDrop(e){let t=document.getElementById("lectureBlocksContainer");if(!t)return;let l=t.querySelectorAll(".block-card");l.forEach(e=>{e.setAttribute("draggable",!0),e.addEventListener("dragstart",handleLectureDragStart),e.addEventListener("dragend",handleLectureDragEnd)}),t.addEventListener("dragover",handleLectureDragOver),t.addEventListener("drop",handleLectureDrop)}let draggedLectureCard=null;function handleLectureDragStart(e){(draggedLectureCard=e.target.closest(".block-card"))&&(e.dataTransfer.effectAllowed="move",draggedLectureCard.classList.add("dragging"))}function handleLectureDragEnd(e){let t=e.target.closest(".block-card");t&&t.classList.remove("dragging"),draggedLectureCard=null}function handleLectureDragOver(e){e.preventDefault(),e.dataTransfer.dropEffect="move"}function handleLectureDrop(e){e.preventDefault();let t=document.getElementById("lectureBlocksContainer");if(!t||!draggedLectureCard)return;let l=document.elementFromPoint(e.clientX,e.clientY),o=l?l.closest(".block-card"):null;if(!o||o===draggedLectureCard)return;let a=o.getBoundingClientRect(),n=a.top+a.height/2;e.clientY<n?t.insertBefore(draggedLectureCard,o):t.insertBefore(draggedLectureCard,o.nextSibling);let s=[];t.querySelectorAll(".block-card").forEach(e=>{let t=e.dataset.blockId;t&&s.push(t)}),reorderLectureBlocks(s,t.dataset.type)}function reorderLectureBlocks(e,t){fetch("reorder_blocks.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`type=${t}&order=${encodeURIComponent(JSON.stringify(e))}`}).then(e=>e.json()).then(e=>{e.success||alert("Ошибка при сохранении порядка")})}function getRutubeEmbed(e){if(!e)return"";let t=e.match(/(?:rutube\.ru\/video\/(?:private\/)?)([a-zA-Z0-9_-]+)\/?(?:\?p=([a-zA-Z0-9_-]+))?/);if(!t)return"";let l=t[1],o=t[2]?`?p=${t[2]}&m=1`:"?m=1";return`
        <div class="rutube-player">
            <iframe src="https://rutube.ru/play/embed/${l}${o}"
                    allow="clipboard-write; autoplay; fullscreen"
                    allowfullscreen>
            </iframe>
        </div>`}function renderHelp(){setMainContent(`
        <div class="help-page">
            <h2>📘 Полное руководство по TeachForum</h2>
            <p style="color:var(--text-secondary); margin-bottom:24px;">Конкретные шаги по каждому разделу. Без воды.</p>

            <div style="display:grid; gap:20px;">

                <!-- 1. Ученики -->
                <div style="background:#f8fafc; border-radius:16px; padding:24px; border-left:5px solid var(--primary);">
                    <div style="font-size:36px; margin-bottom:10px;">👥</div>
                    <h3>1. Ученики</h3>
                    <p><strong>Добавление:</strong> нажмите \xab+ Добавить ученика\xbb → заполните Имя, Фамилию, Предмет. Email необязателен. Нажмите \xabСоздать\xbb. Система сгенерирует логин и пароль автоматически.</p>
                    <p style="color:#dc2626; font-weight:600;">⚠️ Пароль показывается один раз. Сразу скопируйте его кнопкой \xab📋 Скопировать всё\xbb или отправьте через \xab📤 Поделиться\xbb.</p>
                    <p><strong>Редактирование:</strong> в таблице учеников нажмите ✏️. Измените имя, фамилию или предмет → \xabСохранить\xbb.</p>
                    <p><strong>Удаление:</strong> нажмите 🗑️ рядом с учеником → подтвердите. Удалятся все его уроки, задания и файлы.</p>
                    <p><strong>Календарь ученика:</strong> кликните по строке с именем в таблице.</p>
                </div>

                <!-- 2. Моё расписание -->
                <div style="background:#f8fafc; border-radius:16px; padding:24px; border-left:5px solid #3b82f6;">
                    <div style="font-size:36px; margin-bottom:10px;">📅</div>
                    <h3>2. Моё расписание</h3>
                    <p>Три режима просмотра: <strong>День</strong>, <strong>Неделя</strong>, <strong>Месяц</strong>. Переключайте кнопками под заголовком.</p>
                    <p><strong>День:</strong> список уроков на выбранную дату. Стрелки ← → листают день назад/вперёд. Кнопка \xabСегодня\xbb возвращает к текущей дате.</p>
                    <p><strong>Неделя:</strong> сетка 7 дней. В каждой ячейке — время и имя ученика. Клик по ячейке открывает расписание этого дня.</p>
                    <p><strong>Месяц:</strong> классический календарь. Клик по дню с уроком открывает календарь этого ученика. Стрелки переключают месяц.</p>
                    <p>На карточке урока отображается: время, имя ученика, тема, статус оплаты (цветной бейдж), иконка 🎥 если есть запись.</p>
                </div>

                <!-- 3. Календарь ученика -->
                <div style="background:#f8fafc; border-radius:16px; padding:24px; border-left:5px solid #10b981;">
                    <div style="font-size:36px; margin-bottom:10px;">🗓️</div>
                    <h3>3. Календарь и уроки</h3>
                    <p><strong>Переключение месяцев:</strong> стрелки ← → в шапке календаря.</p>
                    <p><strong>Виды отображения:</strong> кнопки \xab📅 Календарь\xbb и \xab📋 Таблица\xbb. В таблице все уроки месяца списком с быстрым изменением статуса оплаты.</p>
                    <p><strong>Добавление урока:</strong> клик по пустой дате → введите время и тему → \xabСохранить\xbb. Если указать время раньше 08:00 или позже 21:00, система покажет предупреждение.</p>
                    <p><strong>Редактирование урока:</strong> клик по дате с уроком. Откроется карточка с полями:</p>
                    <ul style="margin:8px 0 8px 20px; color:var(--text-secondary);">
                        <li><strong>Время</strong> — поле ввода типа time.</li>
                        <li><strong>Тема</strong> — текстовое поле.</li>
                        <li><strong>Статус оплаты</strong> — бейдж-кнопка. Кликайте по ней для переключения: Не указан → Оплачено → Не оплачено → Ожидается. Цвет меняется мгновенно, но окончательно сохраняется только при нажатии кнопки \xabСохранить\xbb внизу карточки.</li>
                        <li><strong>Файлы</strong> — кнопка \xab📎 Выбрать файлы\xbb → выберите один или несколько файлов → \xabЗагрузить\xbb. Файлы появятся в списке под полем. Удаление — кнопка 🗑️ рядом с файлом.</li>
                        <li><strong>Комментарий</strong> — многострочное поле для заметок.</li>
                        <li><strong>Ссылка на запись</strong> — вставьте URL. Если это Rutube, видеоплеер появится автоматически под полем.</li>
                    </ul>
                    <p><strong>Удаление урока:</strong> кнопка \xabУдалить\xbb внизу карточки. Действие необратимо.</p>
                </div>

                <!-- 4. Статистика -->
                <div style="background:#f8fafc; border-radius:16px; padding:24px; border-left:5px solid #f59e0b;">
                    <div style="font-size:36px; margin-bottom:10px;">📊</div>
                    <h3>4. Статистика по оплате</h3>
                    <p>Над календарём ученика отображается панель с цифрами за текущий месяц:</p>
                    <ul style="margin:8px 0 8px 20px; color:var(--text-secondary);">
                        <li><strong>Всего уроков</strong> — общее количество.</li>
                        <li><strong>🟢 Оплачено</strong> — зелёный счётчик.</li>
                        <li><strong>🔴 Не оплачено</strong> — красный счётчик.</li>
                        <li><strong>🟡 Ожидается</strong> — жёлтый счётчик.</li>
                    </ul>
                    <p>Дни в календаре подсвечиваются фоном в зависимости от статуса оплаты урока: зелёный (оплачено), красный (не оплачено), жёлтый (ожидается), серый (не указан).</p>
                </div>

                <!-- 5. ДЗ -->
                <div style="background:#f8fafc; border-radius:16px; padding:24px; border-left:5px solid #8b5cf6;">
                    <div style="font-size:36px; margin-bottom:10px;">📝</div>
                    <h3>5. Домашние задания</h3>
                    <p><strong>Выбор ученика:</strong> в разделе \xabДомашние задания\xbb кликните по ученику в таблице.</p>
                    <p><strong>Категории:</strong> вкладки над списком блоков. Создайте категорию кнопкой \xab+ Категория\xbb. Например: \xabМатематика\xbb, \xabРусский язык\xbb. Блоки можно фильтровать по категориям.</p>
                    <p><strong>Блоки:</strong> контейнеры для заданий. Создайте блок кнопкой \xab+ Блок\xbb. Переименуйте через ✏️, удалите через 🗑️. При удалении блока задания не удаляются — они переходят в группу \xabБез блока\xbb.</p>
                    <p><strong>Задания:</strong> внутри блока нажмите \xab+ Задание\xbb. Заполните:</p>
                    <ul style="margin:8px 0 8px 20px; color:var(--text-secondary);">
                        <li><strong>Название</strong> — обязательное поле.</li>
                        <li><strong>Текст</strong> — условие задания.</li>
                        <li><strong>Ссылки</strong> — каждая с новой строки. Поддерживаются Google Формы, Rutube и любые URL.</li>
                    </ul>
                    <p><strong>Статус:</strong> клик по бейджу \xabВыполнено\xbb / \xabНе выполнено\xbb переключает статус мгновенно.</p>
                    <p><strong>Перетаскивание:</strong> зажмите заголовок блока левой кнопкой мыши и перетащите выше/ниже. Отпустите — порядок сохранится.</p>
                    <p><strong>Библиотека:</strong> если у вас есть задания в библиотеке, на странице ученика появится кнопка \xabВыбрать из библиотеки\xbb. Выберите задание, категорию и блок — и оно назначится ученику.</p>
                </div>

                <!-- 6. Библиотека -->
                <div style="background:#f8fafc; border-radius:16px; padding:24px; border-left:5px solid #ec4899;">
                    <div style="font-size:36px; margin-bottom:10px;">📖</div>
                    <h3>6. Библиотека заданий</h3>
                    <p>Библиотека — это хранилище типовых заданий. Структура: <strong>Раздел → Блок → Задание</strong>.</p>
                    <p><strong>Разделы:</strong> создавайте папки кнопкой \xab+ Раздел\xbb. Например: \xabОГЭ Математика\xbb, \xabЕГЭ Физика\xbb. Редактируйте название через ✏️, удаляйте через 🗑️. При удалении раздела блоки внутри него становятся \xabБез раздела\xbb.</p>
                    <p><strong>Блоки:</strong> внутри раздела создавайте блоки кнопкой \xab+ Добавить блок\xbb. Каждый блок имеет название. Редактирование (✏️) позволяет также перенести блок в другой раздел. Удаление (🗑️) переносит задания в \xabБез блока\xbb.</p>
                    <p><strong>Задания:</strong> откройте блок → \xab+ Добавить задание\xbb. Поля: название, текст, ссылки (каждая с новой строки). Задания можно редактировать (✏️) и удалять (🗑️).</p>
                    <p><strong>Перетаскивание:</strong> работает и для блоков внутри раздела, и для заданий внутри блока. Зажмите карточку и перетащите.</p>
                    <p><strong>Назначение ученику:</strong></p>
                    <ul style="margin:8px 0 8px 20px; color:var(--text-secondary);">
                        <li>В карточке задания нажмите \xabНазначить ученику\xbb → выберите одного или нескольких учеников → \xabНазначить\xbb.</li>
                        <li>В карточке блока нажмите \xabНазначить блок\xbb — все задания блока назначатся выбранным ученикам сразу.</li>
                        <li>При назначении категория в домашних заданиях подставляется автоматически по названию раздела библиотеки. Если у ученика такой категории нет — она создастся сама.</li>
                    </ul>
                </div>

                <!-- 7. Лекции / Шпоры -->
                <div style="background:#f8fafc; border-radius:16px; padding:24px; border-left:5px solid #06b6d4;">
                    <div style="font-size:36px; margin-bottom:10px;">📚</div>
                    <h3>7. Лекции и Шпоры</h3>
                    <p>Разделы для хранения учебных материалов. Работают одинаково: создаёте блоки, внутри них — элементы.</p>
                    <p><strong>Блоки:</strong> \xab+ Добавить блок\xbb → введите название. Редактирование (✏️), удаление (🗑️), перетаскивание работают как в библиотеке.</p>
                    <p><strong>Элементы:</strong> внутри блока \xab+ Добавить лекцию/материал\xbb. Поля:</p>
                    <ul style="margin:8px 0 8px 20px; color:var(--text-secondary);">
                        <li><strong>Название</strong> — обязательно.</li>
                        <li><strong>Ссылка</strong> — URL. Rutube-ссылки автоматически превращаются в плеер.</li>
                        <li><strong>Комментарий</strong> — пояснение к материалу.</li>
                        <li><strong>Файлы</strong> — прикрепляются в карточке элемента через \xab📎 Выбрать файлы\xbb.</li>
                    </ul>
                    <p><strong>Доступ:</strong> кнопка 👥 на странице блока позволяет выбрать, какие именно ученики видят этот блок. Не выбранные ученики блок не увидят.</p>
                </div>

                <!-- 8. Кастомные разделы -->
                <div style="background:#f8fafc; border-radius:16px; padding:24px; border-left:5px solid #f97316;">
                    <div style="font-size:36px; margin-bottom:10px;">📌</div>
                    <h3>8. Кастомные разделы</h3>
                    <p>Собственные разделы в боковом меню. Создайте через \xab+ Добавить раздел\xbb в сайдбаре.</p>
                    <p><strong>Типы разделов:</strong></p>
                    <ul style="margin:8px 0 8px 20px; color:var(--text-secondary);">
                        <li><strong>📄 Материалы</strong> — как лекции: название, ссылка, комментарий, файлы.</li>
                        <li><strong>📝 Задания</strong> — как библиотека: название, текст, ссылки. Карточки отображаются в стиле заданий.</li>
                        <li><strong>📚 Лекции</strong> — стандартные материалы с Rutube-плеером.</li>
                    </ul>
                    <p><strong>Структура:</strong> Раздел → Блок → Элемент. Блоки и элементы добавляются кнопками \xab+ Добавить блок/элемент\xbb. Редактирование и удаление через ✏️ и 🗑️.</p>
                    <p><strong>Доступ:</strong> кнопка 👥 на странице раздела. Выберите учеников — только они увидят раздел в своём меню.</p>
                </div>

                <!-- 9. Файлы -->
                <div style="background:#f8fafc; border-radius:16px; padding:24px; border-left:5px solid #64748b;">
                    <div style="font-size:36px; margin-bottom:10px;">📎</div>
                    <h3>9. Работа с файлами</h3>
                    <p>Файлы можно прикреплять к: урокам, элементам лекций/шпор, кастомным материалам.</p>
                    <p><strong>Загрузка:</strong> нажмите \xab📎 Выбрать файлы\xbb → выберите один или несколько файлов в окне браузера → нажмите \xabЗагрузить\xbb. Поддерживаются любые форматы (PDF, DOCX, JPG, PNG, MP4 и др.).</p>
                    <p><strong>Список:</strong> после загрузки файл появится с иконкой 📄, именем и размером в мегабайтах.</p>
                    <p><strong>Скачивание:</strong> кнопка \xabСкачать\xbb откроет файл в новой вкладке.</p>
                    <p><strong>Удаление:</strong> кнопка 🗑️ рядом с файлом. Действие необратимо.</p>
                </div>

                <!-- 10. Rutube -->
                <div style="background:#f8fafc; border-radius:16px; padding:24px; border-left:5px solid #ef4444;">
                    <div style="font-size:36px; margin-bottom:10px;">🎥</div>
                    <h3>10. Видео с Rutube</h3>
                    <p>Вставьте ссылку на видео Rutube в поле \xabСсылка на запись\xbb (в уроке) или \xabСсылка\xbb (в лекции/материале).</p>
                    <p>Поддерживаются обычные и приватные ссылки формата:<br>
                    <code style="background:#e2e8f0; padding:2px 6px; border-radius:4px;">rutube.ru/video/ID/</code> и <code style="background:#e2e8f0; padding:2px 6px; border-radius:4px;">rutube.ru/video/private/ID/</code></p>
                    <p>После сохранения вместо ссылки появится встроенный плеер. Ученик сможет смотреть видео прямо в кабинете.</p>
                </div>

                <!-- 11. Меню -->
                <div style="background:#f8fafc; border-radius:16px; padding:24px; border-left:5px solid #14b8a6;">
                    <div style="font-size:36px; margin-bottom:10px;">⚙️</div>
                    <h3>11. Настройка бокового меню</h3>
                    <p>Нажмите ⚙️ в шапке сайдбара (рядом с аватаркой).</p>
                    <p>В открывшемся окне для каждого раздела доступно:</p>
                    <ul style="margin:8px 0 8px 20px; color:var(--text-secondary);">
                        <li><strong>Название</strong> — переименуйте любой пункт меню.</li>
                        <li><strong>Иконка</strong> — выберите эмодзи из списка.</li>
                        <li><strong>Видимость</strong> — галочка \xabПоказывать\xbb. Если снять, раздел исчезнет из меню и у учеников тоже.</li>
                    </ul>
                    <p>Нажмите \xabСохранить\xbb. Изменения применяются мгновенно.</p>
                </div>

                <!-- 12. Часовой пояс -->
                <div style="background:#f8fafc; border-radius:16px; padding:24px; border-left:5px solid #6366f1;">
                    <div style="font-size:36px; margin-bottom:10px;">🕒</div>
                    <h3>12. Часовой пояс</h3>
                    <p>Нажмите 🕒 в шапке сайдбара. Выберите ваш город из списка (от Калининграда до Камчатки, а также Минск и Алматы).</p>
                    <p>Нажмите \xabСохранить\xbb. Время всех существующих уроков пересчитается автоматически. Ученик тоже может задать свой часовой пояс — время будет отображаться в его локальном времени.</p>
                </div>

                <!-- 13. Аватар -->
                <div style="background:#f8fafc; border-radius:16px; padding:24px; border-left:5px solid #a855f7;">
                    <div style="font-size:36px; margin-bottom:10px;">🖼️</div>
                    <h3>13. Аватарка</h3>
                    <p>Кликните по кругу с буквой (или по фото) в верхней части сайдбара.</p>
                    <p>В открывшемся окне нажмите \xabВыбрать файл\xbb → выберите изображение (JPG, PNG, GIF) → \xabЗагрузить\xbb. Фото отобразится вместо буквы.</p>
                    <p>Чтобы вернуть букву, нажмите \xabУдалить фото\xbb.</p>
                </div>

                <!-- 14. Drag & Drop -->
                <div style="background:#f8fafc; border-radius:16px; padding:24px; border-left:5px solid #84cc16;">
                    <div style="font-size:36px; margin-bottom:10px;">🖱️</div>
                    <h3>14. Перетаскивание (Drag & Drop)</h3>
                    <p>Работает в следующих разделах:</p>
                    <ul style="margin:8px 0 8px 20px; color:var(--text-secondary);">
                        <li>Домашние задания — блоки заданий.</li>
                        <li>Библиотека — блоки внутри разделов и задания внутри блоков.</li>
                        <li>Лекции и Шпоры — блоки.</li>
                        <li>Кастомные разделы — блоки внутри раздела.</li>
                    </ul>
                    <p><strong>Как использовать:</strong> зажмите левую кнопку мыши на карточке блока (или задания), перетащите в нужное место, отпустите. Порядок сохраняется на сервере автоматически.</p>
                </div>

                <!-- 15. Проблемы -->
                <div style="background:#f8fafc; border-radius:16px; padding:24px; border-left:5px solid #94a3b8;">
                    <div style="font-size:36px; margin-bottom:10px;">🛠️</div>
                    <h3>15. Если что-то пошло не так</h3>
                    <ul style="margin:8px 0 8px 20px; color:var(--text-secondary);">
                        <li>Обновите страницу клавишей <strong>F5</strong> или <strong>Ctrl+R</strong>.</li>
                        <li>Проверьте подключение к интернету.</li>
                        <li>Если файл не загружается — убедитесь, что его размер не превышает лимит хостинга (обычно 20–50 МБ).</li>
                        <li>Если Rutube-видео не отображается — проверьте, что ссылка начинается с <code>rutube.ru/video/</code>.</li>
                    </ul>
                    <p>По любым вопросам: пишите на <strong>Teachforum@mail.ru</strong> или через <a href="contact.html" target="_blank" style="color:var(--primary);">форму обратной связи</a>.</p>
                </div>

            </div>

            <p style="margin-top:32px; color:var(--text-secondary); text-align:center;">Удачных занятий с TeachForum!</p>
        </div>`)}function setMainContent(e){let t=document.getElementById("mainContent"),l=t.querySelector('div[style*="background: #FEF3C7"]'),o=l?l.outerHTML:"";t.innerHTML=o+e}function showUpgradeMessage(){setMainContent(`<div class="empty-state"><div class="empty-icon">🔒</div><h3>Доступно в Профессиональном тарифе</h3><p><a href="contact.html">Повысить тариф</a></p></div>`)}function loadCustomBlocks(){"undefined"!=typeof CURRENT_PLAN&&"basic"!==CURRENT_PLAN&&fetch("get_custom_blocks.php").then(e=>e.json()).then(e=>{let t=document.getElementById("customBlocksContainer");t&&(t.innerHTML="",e.forEach(e=>{t.innerHTML+=`
                    <a class="sidebar__link" data-tab="custom_${e.id}" onclick="event.preventDefault();">📌 ${e.name}</a>
                `}))})}function renderCustomBlock(e,t){fetch(`get_custom_groups.php?block_id=${e}`).then(e=>e.json()).then(async l=>{let o=`
                <button class="btn-back" onclick="renderCustomBlocksList()">← Назад</button>
                <div class="dashboard-header">
                    <h2>${t}</h2>
                    <div style="display:flex; gap:8px; align-items:center;">
                        <button class="btn-add" onclick="openAddCustomGroupModal(${e}, '${t.replace(/'/g,"\\'")}')">+ Добавить блок</button>
                        <button class="btn-icon" onclick="openEditCustomBlockModal(${e}, '${t.replace(/'/g,"\\'")}')" title="Редактировать раздел">✏️</button>
                        <button class="btn-icon" onclick="deleteCustomBlock(${e})" title="Удалить раздел">🗑️</button>
                        <button class="btn-icon" onclick="openCustomBlockAccessModal(${e}, '${t.replace(/'/g,"\\'")}')" title="Настроить доступ">👥</button>
                    </div>
                </div>`;if(0===l.length)o+='<div class="empty-state"><div class="empty-icon">\uD83D\uDCC4</div><h3>Нет блоков</h3><p>Добавьте первый блок внутри раздела.</p></div>';else{for(let a of(o+='<div class="blocks-grid" id="customGroupsContainer" data-block-id="'+e+'">',l)){let n=await fetch(`get_custom_items.php?group_id=${a.id}`).then(e=>e.json()),s="";if(n.length>0)s='<ul class="block-items-list">',n.forEach(e=>{if("tasks"===a.type){let t=e.comment?e.comment.substring(0,60)+(e.comment.length>60?"…":""):"без описания",l=0;if(e.link)try{let o=JSON.parse(e.link);l=Array.isArray(o)?o.length:1}catch(n){l=1}s+=`<li><strong>${e.title}</strong> – ${t} ${l>0?`(${l} ссыл.)`:""}</li>`}else s+=`<li>${e.title} ${e.link?`<a href="${e.link}" target="_blank" onclick="event.stopPropagation()">🔗</a>`:""}</li>`}),s+="</ul>";else{let i="tasks"===a.type?"Нет заданий":"lectures"===a.type?"Нет лекций":"Нет материалов";s=`<p class="block-empty-text">${i}</p>`}let r="\uD83D\uDCC4",d="block-card--material";"tasks"===a.type?(r="\uD83D\uDCDD",d="block-card--tasks"):"lectures"===a.type&&(r="\uD83D\uDCDA",d="block-card--lectures"),o+=`
                        <div class="block-card ${d}" data-group-id="${a.id}" onclick="openCustomGroupView(${a.id}, '${a.name.replace(/'/g,"\\'")}', ${e}, '${t.replace(/'/g,"\\'")}', '${a.type||"material"}')">
                            <div class="block-card__header">
                                <h3 class="block-card__title">
                                    <span class="block-card__type-icon">${r}</span>${a.name}
                                </h3>
                                <div class="block-card__actions">
                                    <button class="btn-icon" onclick="event.stopPropagation(); openEditCustomGroupModal(${a.id}, '${a.name.replace(/'/g,"\\'")}', ${e}, '${t.replace(/'/g,"\\'")}')">✏️</button>
                                    <button class="btn-icon" onclick="event.stopPropagation(); deleteCustomGroup(${a.id}, ${e}, '${t.replace(/'/g,"\\'")}')">🗑️</button>
                                </div>
                            </div>
                            ${s}
                        </div>`}o+="</div>"}setMainContent(o),l.length>0&&initCustomGroupDragDrop(e)})}function renderCustomBlocksList(){loadCustomBlocks(),setMainContent('<div class="empty-state"><div class="empty-icon">\uD83D\uDCCC</div><h3>Выберите раздел в боковом меню</h3></div>')}function openAddCustomBlockModal(e=null){let t=document.querySelector(".modal-overlay");t&&t.remove();let l="";l="tasks"===e?'<input type="hidden" id="customBlockType" value="tasks">':`
            <div class="form-group">
                <label class="form-label">Тип раздела</label>
                <select id="customBlockType" class="form-select">
                    <option value="material">📄 Материалы</option>
                    <option value="tasks">📝 Задания (Библиотека)</option>
                    <option value="lectures">📚 Лекции</option>
                </select>
            </div>`;let o=document.createElement("div");o.className="modal-overlay active",o.innerHTML=`
        <div class="modal">
            <button class="modal__close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            <h3>${"tasks"===e?"Новая библиотека заданий":"Новый раздел"}</h3>
            <div class="form-group"><label class="form-label">Название</label><input type="text" id="customBlockName" class="form-input"></div>
            ${l}
            <button class="btn btn--primary" onclick="addCustomBlock()">Создать</button>
        </div>`,document.body.appendChild(o)}function addCustomBlock(){let e=document.querySelector(".modal-overlay.active");if(!e)return;let t=e.querySelector("#customBlockName"),l=e.querySelector("#customBlockType");if(!t)return;let o=t.value.trim(),a=l?l.value:"material";if(!o)return alert("Введите название");fetch("add_custom_block.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`name=${encodeURIComponent(o)}&type=${a}`}).then(e=>e.json()).then(t=>{t.success?(e.remove(),loadCustomBlocks(),t.block_id?renderCustomBlock(t.block_id,o):setMainContent('<div class="empty-state"><div class="empty-icon">\uD83D\uDCCC</div><h3>Раздел создан! Выберите его в боковом меню.</h3></div>')):alert(t.error)})}function openEditCustomBlockModal(e,t){let l=document.createElement("div");l.className="modal-overlay active",l.innerHTML=`
        <div class="modal">
            <button class="modal__close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            <h3>Переименовать раздел</h3>
            <div class="form-group"><label class="form-label">Название</label><input type="text" id="customBlockName" class="form-input" value="${t}"></div>
            <button class="btn btn--primary" onclick="editCustomBlock(${e})">Сохранить</button>
        </div>`,document.body.appendChild(l)}function editCustomBlock(e){let t=document.querySelector(".modal-overlay.active");if(!t)return;let l=t.querySelector("#customBlockName");if(!l)return;let o=l.value.trim();if(!o)return alert("Введите название");fetch("update_custom_block.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`id=${e}&name=${encodeURIComponent(o)}`}).then(e=>e.json()).then(l=>{if(l.success){t.remove(),loadCustomBlocks();let a=document.getElementById("mainContent");a&&-1!==a.innerHTML.indexOf("btn-back")&&renderCustomBlock(e,o)}else alert(l.error)})}function deleteCustomBlock(e){confirm("Удалить раздел и все его содержимое?")&&fetch("delete_custom_block.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`id=${e}`}).then(e=>e.json()).then(e=>{e.success?(loadCustomBlocks(),setMainContent('<div class="empty-state"><div class="empty-icon">\uD83D\uDCCC</div><h3>Раздел удалён.</h3></div>')):alert(e.error)})}function openAddCustomGroupModal(e,t){let l=document.createElement("div");l.className="modal-overlay active",l.innerHTML=`
        <div class="modal">
            <button class="modal__close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            <h3>Новый блок в разделе \xab${t}\xbb</h3>
            <div class="form-group"><label class="form-label">Название блока</label><input type="text" id="customGroupName" class="form-input"></div>
            <div class="form-group">
                <label class="form-label">Тип блока</label>
                <select id="customGroupType" class="form-select">
                    <option value="material">📄 Материалы</option>
                    <option value="tasks">📝 Задания</option>
                    <option value="lectures">📚 Лекции</option>
                </select>
            </div>
            <button class="btn btn--primary" onclick="addCustomGroup(${e}, '${t.replace(/'/g,"\\'")}')">Создать</button>
        </div>`,document.body.appendChild(l)}function addCustomGroup(e,t){let l=document.querySelector(".modal-overlay.active");if(!l)return;let o=l.querySelector("#customGroupName"),a=l.querySelector("#customGroupType");if(!o||!a)return;let n=o.value.trim(),s=a.value;if(!n)return alert("Введите название");fetch("add_custom_group.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`block_id=${e}&name=${encodeURIComponent(n)}&type=${s}`}).then(e=>e.json()).then(o=>{o.success?(l.remove(),renderCustomBlock(e,t)):alert(o.error)})}function openEditCustomGroupModal(e,t,l,o){let a=document.createElement("div");a.className="modal-overlay active",a.innerHTML=`
        <div class="modal">
            <button class="modal__close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            <h3>Переименовать блок</h3>
            <div class="form-group"><label class="form-label">Название</label><input type="text" id="customGroupName" class="form-input" value="${t}"></div>
            <button class="btn btn--primary" onclick="editCustomGroup(${e}, ${l}, '${o.replace(/'/g,"\\'")}')">Сохранить</button>
        </div>`,document.body.appendChild(a)}function editCustomGroup(e,t,l){let o=document.querySelector(".modal-overlay.active");if(!o)return;let a=o.querySelector("#customGroupName");if(!a)return;let n=a.value.trim();if(!n)return alert("Введите название");fetch("update_custom_group.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`id=${e}&name=${encodeURIComponent(n)}`}).then(e=>e.json()).then(e=>{e.success?(o.remove(),renderCustomBlock(t,l)):alert(e.error)})}function deleteCustomGroup(e,t,l){confirm("Удалить блок?")&&fetch("delete_custom_group.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`id=${e}`}).then(e=>e.json()).then(e=>e.success?renderCustomBlock(t,l):alert(e.error))}function openCustomGroupView(e,t,l,o,a="material"){fetch(`get_custom_items.php?group_id=${e}`).then(e=>e.json()).then(n=>{let s=`
                <button class="btn-back" onclick="renderCustomBlock(${l}, '${o.replace(/'/g,"\\'")}')">← Назад к разделу</button>
                <div class="dashboard-header">
                    <h2>${t}</h2>
                    <button class="btn-add" onclick="openAddCustomItemToGroupModal(${e}, '${t.replace(/'/g,"\\'")}', ${l}, '${o.replace(/'/g,"\\'")}', '${a}')">
                        + Добавить ${"tasks"===a?"задание":"lectures"===a?"лекцию":"материал"}
                    </button>
                </div>`;0===n.length?s+='<div class="empty-state"><div class="empty-icon">\uD83D\uDCC4</div><h3>Нет элементов</h3></div>':(s+='<div class="custom-items-grid">',n.forEach(n=>{let i="custom-item-card--material",r="\uD83D\uDCC4";if("tasks"===a?(i="custom-item-card--tasks",r="\uD83D\uDCDD"):"lectures"===a&&(i="custom-item-card--lectures",r="\uD83D\uDCDA"),s+=`
                        <div class="custom-item-card ${i}" onclick="openCustomItemView(${n.id}, '${n.title.replace(/'/g,"\\'")}', '${(n.link||"").replace(/'/g,"\\'")}', '${(n.comment||"").replace(/'/g,"\\'")}', ${e}, '${t.replace(/'/g,"\\'")}', ${l}, '${o.replace(/'/g,"\\'")}', '${a}')">
                            <div class="custom-item-card__header">
                                <span class="custom-item-card__icon">${r}</span>
                                <h3 class="custom-item-card__title">${n.title}</h3>
                            </div>`,"tasks"===a){if(s+='<div class="custom-item-card__body">',n.comment&&(s+=`<div class="task-text">${n.comment.replace(/\n/g,"<br>")}</div>`),n.link){let d=[];try{d=JSON.parse(n.link)}catch(c){}Array.isArray(d)&&d.length>0?(s+='<div class="task-links">',d.forEach(e=>{s+=`<a href="${e}" target="_blank" onclick="event.stopPropagation()">🔗 Ссылка</a>`}),s+="</div>"):n.link&&(s+=`<a href="${n.link}" target="_blank" onclick="event.stopPropagation()">🔗 Ссылка</a>`)}s+="</div>"}else s+='<div class="custom-item-card__body">',n.link&&(s+=`<div class="task-link"><a href="${n.link}" target="_blank" onclick="event.stopPropagation()">🔗 Открыть</a></div>`),n.comment&&(s+=`<div class="task-comment">${n.comment.length>80?n.comment.substring(0,80)+"…":n.comment}</div>`),s+="</div>";s+="</div>"}),s+="</div>"),setMainContent(s)})}function openAddCustomItemToGroupModal(e,t,l,o,a="material"){let n=document.createElement("div");n.className="modal-overlay active";let s="";s="tasks"===a?`
            <div class="form-group"><label class="form-label">Название</label><input type="text" id="customItemTitle" class="form-input"></div>
            <div class="form-group"><label class="form-label">Текст задания</label><textarea id="customItemText" class="form-input" rows="4"></textarea></div>
            <div class="form-group"><label class="form-label">Ссылки (каждая с новой строки)</label><textarea id="customItemLinks" class="form-input" rows="3"></textarea></div>
        `:`
            <div class="form-group"><label class="form-label">Название</label><input type="text" id="customItemTitle" class="form-input"></div>
            <div class="form-group"><label class="form-label">Ссылка</label><input type="text" id="customItemLink" class="form-input"></div>
            <div class="form-group"><label class="form-label">Комментарий</label><textarea id="customItemComment" class="form-input" rows="3"></textarea></div>
        `,n.innerHTML=`
        <div class="modal">
            <button class="modal__close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            <h3>Добавить ${"tasks"===a?"задание":"lectures"===a?"лекцию":"материал"} в \xab${t}\xbb</h3>
            ${s}
            <button class="btn btn--primary" onclick="addCustomItemToGroup(${e}, '${t.replace(/'/g,"\\'")}', ${l}, '${o.replace(/'/g,"\\'")}', '${a}')">Сохранить</button>
        </div>`,document.body.appendChild(n)}function addCustomItemToGroup(e,t,l,o,a="material"){let n=document.querySelector(".modal-overlay.active");if(!n){alert("Модальное окно не найдено");return}let s=n.querySelector("#customItemTitle");if(!s)return;let i=s.value.trim();if(!i)return alert("Название обязательно");let r=`group_id=${e}&title=${encodeURIComponent(i)}`;if("tasks"===a){let d=n.querySelector("#customItemText"),c=n.querySelector("#customItemLinks"),p=d?d.value.trim():"",u=c?c.value.trim():"";r+=`&text=${encodeURIComponent(p)}&links=${encodeURIComponent(u)}`}else{let m=n.querySelector("#customItemLink"),b=n.querySelector("#customItemComment"),h=m?m.value.trim():"",v=b?b.value.trim():"";r+=`&link=${encodeURIComponent(h)}&comment=${encodeURIComponent(v)}`}fetch("add_custom_item.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:r}).then(e=>e.json()).then(s=>{s.success?(n.remove(),openCustomGroupView(e,t,l,o,a)):alert(s.error)}).catch(e=>alert("Ошибка сети: "+e))}function openCustomItemView(e,t,l,o,a,n,s,i,r="material"){let d="";setMainContent(`
        <button class="btn-back" onclick="openCustomGroupView(${a}, '${n.replace(/'/g,"\\'")}', ${s}, '${i.replace(/'/g,"\\'")}', '${r}')">← Назад к блоку</button>
        <div class="lesson-detail">
            <div class="lesson-detail__header">
                <h2 class="lesson-detail__title">${t||"Без названия"}</h2>
            </div>
            ${d="tasks"===r?`
            <div class="lesson-detail__row">
                <span class="lesson-detail__label">Название</span>
                <span class="lesson-detail__value">
                    <input type="text" id="customItemTitle" class="form-input" value="${t}">
                </span>
            </div>
            <div class="lesson-detail__row">
                <span class="lesson-detail__label">Текст задания</span>
                <span class="lesson-detail__value">
                    <textarea id="customItemText" class="form-input" rows="4">${o||""}</textarea>
                </span>
            </div>
            <div class="lesson-detail__row">
                <span class="lesson-detail__label">Ссылки</span>
                <span class="lesson-detail__value">
                    <textarea id="customItemLinks" class="form-input" rows="3">${l||""}</textarea>
                </span>
            </div>
        `:`
            <div class="lesson-detail__row">
                <span class="lesson-detail__label">Название</span>
                <span class="lesson-detail__value">
                    <input type="text" id="customItemTitle" class="form-input" value="${t}">
                </span>
            </div>
            <div class="lesson-detail__row">
                <span class="lesson-detail__label">Ссылка</span>
                <span class="lesson-detail__value">
                    <input type="text" id="customItemLink" class="form-input" value="${l||""}">
                    ${getRutubeEmbed(l)}
                </span>
            </div>
            <div class="lesson-detail__row">
                <span class="lesson-detail__label">Файлы</span>
                <span class="lesson-detail__value">
                    <div id="customItemFilesContainer"></div>
                    <div class="file-upload-custom" style="margin-top:8px;">
                        <label for="customItemFileInput" class="file-upload-trigger">📎 Выбрать файлы</label>
                        <input type="file" id="customItemFileInput" multiple
                               onchange="document.getElementById('customItemFileInfo').textContent = this.files.length ? 'Выбрано: ' + this.files.length + ' файл(ов)' : ''">
                        <span class="file-upload-info" id="customItemFileInfo"></span>
                        <button class="btn btn--secondary" onclick="uploadFiles('custom_item', ${e}, 'customItemFileInput', 'customItemFilesContainer', 'customItemFileInfo')">Загрузить</button>
                    </div>
                </span>
            </div>
            <div class="lesson-detail__row">
                <span class="lesson-detail__label">Комментарий</span>
                <span class="lesson-detail__value">
                    <textarea id="customItemComment" class="form-input" rows="4">${o||""}</textarea>
                </span>
            </div>
        `}
            <div style="display:flex; gap:12px; margin-top:20px;">
                <button class="btn btn--primary" onclick="updateCustomItem(${e}, ${a}, '${n.replace(/'/g,"\\'")}', ${s}, '${i.replace(/'/g,"\\'")}', '${r}')">Сохранить</button>
                <button class="btn btn--danger" onclick="deleteCustomItem(${e}, ${a}, '${n.replace(/'/g,"\\'")}', ${s}, '${i.replace(/'/g,"\\'")}')">Удалить</button>
            </div>
        </div>`),"tasks"!==r&&loadFiles("custom_item",e,"customItemFilesContainer")}function updateCustomItem(e,t,l,o,a,n="material"){let s=document.getElementById("mainContent"),i=s.querySelector("#customItemTitle")?.value.trim();if(!i)return alert("Название обязательно");let r=`id=${e}&title=${encodeURIComponent(i)}`;if("tasks"===n){let d=s.querySelector("#customItemText")?.value.trim()||"",c=s.querySelector("#customItemLinks")?.value.trim()||"";r+=`&text=${encodeURIComponent(d)}&links=${encodeURIComponent(c)}`}else{let p=s.querySelector("#customItemLink")?.value.trim()||"",u=s.querySelector("#customItemComment")?.value.trim()||"";r+=`&link=${encodeURIComponent(p)}&comment=${encodeURIComponent(u)}`}fetch("update_custom_item.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:r}).then(e=>e.json()).then(e=>{e.success?openCustomGroupView(t,l,o,a,n):alert(e.error)})}function deleteCustomItem(e,t,l,o,a){confirm("Удалить материал?")&&fetch("delete_custom_item.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`id=${e}`}).then(e=>e.json()).then(e=>e.success?openCustomGroupView(t,l,o,a):alert(e.error))}function initCustomGroupDragDrop(e){let t=document.getElementById("customGroupsContainer");if(!t)return;let l=t.querySelectorAll(".block-card");l.forEach(e=>{e.setAttribute("draggable",!0),e.addEventListener("dragstart",handleCustomGroupDragStart),e.addEventListener("dragend",handleCustomGroupDragEnd)}),t.addEventListener("dragover",handleCustomGroupDragOver),t.addEventListener("drop",handleCustomGroupDrop)}let draggedCustomGroup=null;function handleCustomGroupDragStart(e){(draggedCustomGroup=e.target.closest(".block-card"))&&(e.dataTransfer.effectAllowed="move",draggedCustomGroup.classList.add("dragging"))}function handleCustomGroupDragEnd(e){let t=e.target.closest(".block-card");t&&t.classList.remove("dragging"),draggedCustomGroup=null}function handleCustomGroupDragOver(e){e.preventDefault(),e.dataTransfer.dropEffect="move"}function handleCustomGroupDrop(e){e.preventDefault();let t=document.getElementById("customGroupsContainer");if(!t||!draggedCustomGroup)return;let l=document.elementFromPoint(e.clientX,e.clientY),o=l?l.closest(".block-card"):null;if(!o||o===draggedCustomGroup)return;let a=o.getBoundingClientRect(),n=a.top+a.height/2;e.clientY<n?t.insertBefore(draggedCustomGroup,o):t.insertBefore(draggedCustomGroup,o.nextSibling);let s=[];t.querySelectorAll(".block-card").forEach(e=>s.push(e.dataset.groupId)),reorderCustomGroups(s,t.dataset.blockId)}function reorderCustomGroups(e,t){fetch("reorder_custom_groups.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`order=${encodeURIComponent(JSON.stringify(e))}`}).then(e=>e.json()).then(e=>{e.success||alert("Ошибка сохранения порядка")})}function openCustomBlockAccessModal(e,t){Promise.all([fetch("get_students.php").then(e=>e.json()),fetch(`get_custom_block_access.php?block_id=${e}`).then(e=>e.json())]).then(([l,o])=>{let a="";l.forEach(e=>{let t=o.includes(Number(e.id))?"checked":"";a+=`<label><input type="checkbox" value="${e.id}" ${t}> ${e.first_name} ${e.last_name}</label><br>`});let n=document.createElement("div");n.className="modal-overlay active",n.innerHTML=`
            <div class="modal">
                <button class="modal__close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                <h3>Доступ к разделу \xab${t}\xbb</h3>
                <p>Выберите учеников, которые увидят этот раздел:</p>
                <div>${a}</div>
                <button class="btn btn--primary" onclick="saveCustomBlockAccess(${e})">Сохранить</button>
            </div>`,document.body.appendChild(n)})}function saveCustomBlockAccess(e){let t=[];document.querySelectorAll(".modal input[type=checkbox]:checked").forEach(e=>t.push(e.value)),fetch("update_custom_block_access.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`block_id=${e}&student_ids=${encodeURIComponent(JSON.stringify(t))}`}).then(e=>e.json()).then(e=>{e.success?(document.querySelector(".modal-overlay").remove(),alert("Доступ обновлён")):alert(e.error)})}function loadFiles(e,t,l){fetch(`get_files.php?entity_type=${e}&entity_id=${t}`).then(e=>e.json()).then(o=>{let a=document.getElementById(l);if(!a)return;if(!Array.isArray(o)||0===o.length){a.innerHTML='<p style="color:var(--text-secondary);">Нет прикреплённых файлов</p>';return}let n='<ul class="files-list">';o.forEach(o=>{let a=(o.size/1048576).toFixed(1);n+=`
                <li class="files-list__item">
                    <span class="files-list__icon">📄</span>
                    <span class="files-list__name">${o.original_name}</span>
                    <span class="files-list__size">${a} MB</span>
                    <div class="files-list__actions">
                        <a href="download_file.php?id=${o.id}" class="btn--file-download" target="_blank">Скачать</a>
                        <button class="btn--file-delete" onclick="deleteFile(${o.id}, '${e}', ${t}, '${l}')">🗑️</button>
                    </div>
                </li>`}),n+="</ul>",a.innerHTML=n}).catch(()=>{document.getElementById(l).innerHTML='<p style="color:red;">Ошибка загрузки списка файлов</p>'})}function uploadFiles(e,t,l,o,a){let n=document.getElementById(l);if(!n||!n.files.length){alert("Выберите файлы");return}let s=new FormData;for(let i of(s.append("entity_type",e),s.append("entity_id",t),n.files))s.append("files[]",i);fetch("upload_file.php",{method:"POST",body:s}).then(e=>e.json()).then(l=>{l.success?(n.value="",a&&(document.getElementById(a).textContent=""),loadFiles(e,t,o)):alert("Ошибка загрузки: "+(l.error||"неизвестная ошибка"))}).catch(e=>{console.error("Сетевая ошибка:",e),alert("Сетевая ошибка при загрузке")})}function deleteFile(e,t,l,o){confirm("Удалить файл?")&&fetch("delete_file.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`id=${e}`}).then(e=>e.json()).then(e=>{e.success?loadFiles(t,l,o):alert("Ошибка: "+e.error)}).catch(()=>alert("Ошибка сети при удалении"))}function getPaymentLabel(e){return({none:"Не указан",paid:"Оплачено",unpaid:"Не оплачено",pending:"Ожидается"})[e]||"Не указан"}function cyclePaymentStatus(e){let t=document.getElementById("paymentBadge");if(!t)return;let l=t.textContent.trim(),o=["none","paid","unpaid","pending"];updatePaymentBadge(o[(o.indexOf({"Не указан":"none",Оплачено:"paid","Не оплачено":"unpaid",Ожидается:"pending"}[l]||"none")+1)%o.length])}function updatePaymentBadge(e){let t=document.getElementById("paymentBadge");t&&(t.textContent=getPaymentLabel(e),t.className=`badge badge--${e} badge--clickable`)}function showEmptyState(e,t,l){setMainContent(`
        <div class="empty-state">
            <div class="empty-icon">${e}</div>
            <h3>${t}</h3>
            <p>${l}</p>
        </div>`)}function openAddStudentModal(){let e=document.createElement("div");e.className="modal-overlay active",e.innerHTML=`
        <div class="modal">
            <button class="modal__close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            <h3>Добавить ученика</h3>
            <div class="form-group"><label class="form-label">Имя</label><input type="text" id="studFirstName" class="form-input"></div>
            <div class="form-group"><label class="form-label">Фамилия</label><input type="text" id="studLastName" class="form-input"></div>
            <div class="form-group"><label class="form-label">Email (необязательно)</label><input type="email" id="studEmail" class="form-input"></div>
            <div id="genCredentials" style="display:none; margin:12px 0; padding:12px; background:#ECFDF5; border-radius:8px;"></div>
            <button class="btn btn--primary" onclick="addStudent(this)">Создать</button>
        </div>`,document.body.appendChild(e)}function addStudent(e){let t=document.getElementById("studFirstName").value.trim(),l=document.getElementById("studLastName").value.trim(),o=document.getElementById("studEmail")?.value.trim()||"";if(!t)return alert("Имя обязательно");e.disabled=!0,e.textContent="Сохраняю...",fetch("add_student.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`first_name=${encodeURIComponent(t)}&last_name=${encodeURIComponent(l)}&email=${encodeURIComponent(o)}`}).then(e=>e.json()).then(t=>{if(t.success){let l=document.getElementById("genCredentials");l.style.display="block",l.innerHTML=`
                <p style="color: red; font-weight: 500; margin-bottom: 12px;">⚠️ Пароль показывается только один раз. Сохраните его сейчас!</p>
                <div style="background: #f0f0ff; padding: 12px; border-radius: 10px; margin-bottom: 12px;">
                    <strong>Логин:</strong> ${t.login}<br>
                    <strong>Пароль:</strong> ${t.password}
                </div>
                <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
                    <button class="btn btn--secondary" id="copyAllBtn">📋 Скопировать всё</button>
                    <button class="btn btn--primary" id="shareBtn">📤 Поделиться</button>
                </div>
            `,document.getElementById("copyAllBtn").addEventListener("click",function(){copyToClipboard(`Логин: ${t.login}
Пароль: ${t.password}`,this)}),document.getElementById("shareBtn").addEventListener("click",function(){let e={title:"Данные для входа в TeachForum",text:`Логин: ${t.login}
Пароль: ${t.password}`};navigator.share?navigator.share(e).catch(()=>{}):copyToClipboard(e.text,this)}),e.textContent="Закрыть",e.disabled=!1,e.onclick=function(){let t=e.closest(".modal-overlay");t&&t.remove(),renderStudents()}}else alert("Ошибка: "+(t.error||"Неизвестная ошибка")),e.disabled=!1,e.textContent="Создать"}).catch(t=>{alert("Ошибка сети: "+t),e.disabled=!1,e.textContent="Создать"})}function deleteStudent(e,t){confirm(`Удалить ученика ${t}?`)&&fetch("delete_student.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`student_id=${e}`}).then(e=>e.json()).then(e=>e.success?renderStudents():alert(e.error))}function changeMonth(e,t,l,o){renderCalendar(e,t,l,o),loadLessonsTable(e,t,l,o)}function switchViewMode(e,t,l,o){currentViewMode="calendar"===currentViewMode?"table":"calendar";let a=document.getElementById("switchCalendar"),n=document.getElementById("switchTable"),s=document.getElementById("calendarPanel"),i=document.getElementById("tablePanel");if("calendar"===currentViewMode)a.classList.add("active"),n.classList.remove("active"),s.style.display="",i.style.display="none";else{n.classList.add("active"),a.classList.remove("active"),s.style.display="none",i.style.display="";let r=document.getElementById("lessonsTableContainer");r&&(r.innerHTML='<div style="text-align:center;padding:40px;"><div class="loading-spinner"></div></div>'),loadLessonsTable(e,t,l,o)}}function loadLessonsTable(e,t,l,o){fetch(`get_schedule.php?student_id=${e}&month=${o}&year=${l}&timezone=${TEACHER_TIMEZONE}`).then(e=>e.json()).then(a=>{let n=document.getElementById("lessonsTableContainer");if(!n)return;let s=["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"][o-1];if(!Array.isArray(a)||0===a.length){n.innerHTML=`
                    <div style="display:flex; align-items:center; gap:12px; margin-bottom:12px;">
                        <button class="btn btn--ghost" onclick="changeMonth(${e}, '${t}', ${1===o?l-1:l}, ${1===o?12:o-1})">←</button>
                        <span style="font-size:18px; font-weight:600;">${s} ${l}</span>
                        <button class="btn btn--ghost" onclick="changeMonth(${e}, '${t}', ${12===o?l+1:l}, ${12===o?1:o+1})">→</button>
                    </div>
                    <p>Нет уроков в этом месяце</p>
                `;return}a.sort((e,t)=>(e.lesson_date+e.time).localeCompare(t.lesson_date+t.time));let i="";a.forEach(a=>{let n=a.time?a.time.slice(0,5):"",s=getPaymentLabel(a.payment_status),r=a.payment_status||"none",d={id:a.id,lesson_date:a.lesson_date,time:a.time,topic:a.topic,comment:a.comment,recording_link:a.recording_link,payment_status:a.payment_status};i+=`
                    <tr style="cursor:pointer;"
                        data-lesson='${JSON.stringify(d)}'
                        data-student-id="${e}"
                        data-student-name="${t.replace(/"/g,"&quot;")}"
                        data-year="${l}"
                        data-month="${o}"
                        onclick="openLessonPageFromTable(this)">
                        <td>${a.lesson_date}</td>
                        <td>${n}</td>
                        <td>${escapeHtml(a.topic)||""}</td>
                        <td><span class="badge badge--${r} badge--clickable" onclick="event.stopPropagation(); changePaymentStatusInTable(${a.id}, this)">${s}</span></td>
                        <td>${a.comment||""}</td>
                        <td>${a.recording_link?'<span class="badge badge--primary">\uD83C\uDFA5</span>':""}</td>
                    </tr>`});let r=`
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <button class="btn btn--ghost" onclick="changeMonth(${e}, '${t}', ${1===o?l-1:l}, ${1===o?12:o-1})">←</button>
                        <span style="font-size:18px; font-weight:600;">${s} ${l}</span>
                        <button class="btn btn--ghost" onclick="changeMonth(${e}, '${t}', ${12===o?l+1:l}, ${12===o?1:o+1})">→</button>
                    </div>
                    <button class="btn-add" onclick="openAddLessonFromTable(${e}, '${t.replace(/'/g,"\\'")}', ${l}, ${o})">+ Добавить урок</button>
                </div>
                <div class="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>Дата</th>
                                <th>Время</th>
                                <th>Тема</th>
                                <th>Статус</th>
                                <th>Комментарий</th>
                                <th>Запись</th>
                            </tr>
                        </thead>
                        <tbody>${i}</tbody>
                    </table>
                </div>`;n.innerHTML=r}).catch(()=>{let e=document.getElementById("lessonsTableContainer");e&&(e.innerHTML="")})}function changePaymentStatusInTable(e,t){let l=t.textContent.trim(),o={"Не указан":"none",Оплачено:"paid","Не оплачено":"unpaid",Ожидается:"pending"}[l]||"none",a=["none","paid","unpaid","pending"],n=(a.indexOf(o)+1)%a.length,s=a[n],i=t.closest("tr");if(!i)return;let r=JSON.parse(i.dataset.lesson);t.textContent=getPaymentLabel(s),t.className=`badge badge--${s} badge--clickable`;let d=r.time||"",c=r.topic||"",p=r.comment||"",u=r.recording_link||"";fetch("update_lesson.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`id=${e}&time=${encodeURIComponent(d)}&topic=${encodeURIComponent(c)}&comment=${encodeURIComponent(p)}&recording_link=${encodeURIComponent(u)}&payment_status=${s}`}).then(e=>e.json()).then(e=>{e.success?(r.payment_status=s,i.dataset.lesson=JSON.stringify(r),updateCalendarAndStatsForLesson(r.lesson_date,s)):(t.textContent=l,t.className=`badge badge--${o} badge--clickable`,alert("Ошибка сохранения статуса"))})}function updateCalendarAndStatsForLesson(e,t){let l=document.querySelector(`.calendar-day[data-date="${e}"]`);l&&(l.classList.remove("calendar-day--none","calendar-day--paid","calendar-day--unpaid","calendar-day--pending"),l.classList.add("calendar-day--"+t));let o=document.querySelectorAll("#lessonsTableContainer tbody tr"),a=0,n=0,s=0,i=0;o.forEach(e=>{let t=JSON.parse(e.dataset.lesson);a++,"paid"===t.payment_status?n++:"unpaid"===t.payment_status?s++:"pending"===t.payment_status&&i++});let r=document.querySelectorAll(".stats-panel__value");r.length>=4&&(r[0].textContent=a,r[1].textContent=n,r[2].textContent=s,r[3].textContent=i)}function openLessonPageFromTable(e){let t=JSON.parse(e.dataset.lesson),l=e.dataset.studentId,o=e.dataset.studentName,a=parseInt(e.dataset.year),n=parseInt(e.dataset.month);openLessonPage(t,l,o,a,n)}function openAddLessonFromTable(e,t,l,o){let a=document.createElement("div");a.className="modal-overlay active",a.innerHTML=`
        <div class="modal">
            <button class="modal__close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            <h3>Добавить урок для ${t}</h3>
            <div class="form-group"><label class="form-label">Дата</label><input type="date" id="lessonDate" class="form-input"></div>
            <div class="form-group"><label class="form-label">Время</label><input type="time" id="lessonTime" class="form-input"></div>
            <div class="form-group"><label class="form-label">Тема</label><input type="text" id="lessonTopic" class="form-input"></div>
            <button class="btn btn--primary" onclick="addLessonFromTable(${e}, '${t.replace(/'/g,"\\'")}', ${l}, ${o})">Сохранить</button>
        </div>`,document.body.appendChild(a)}function addLessonFromTable(e,t,l,o){let a=document.getElementById("lessonDate").value,n=document.getElementById("lessonTime").value,s=document.getElementById("lessonTopic").value.trim();if(!a||!n||!s)return alert("Заполните все поля");fetch("add_lesson.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`student_id=${e}&date=${a}&time=${encodeURIComponent(n)}&topic=${encodeURIComponent(s)}&teacher_timezone=${TEACHER_TIMEZONE}`}).then(e=>e.json()).then(a=>{a.success?(document.querySelector(".modal-overlay").remove(),changeMonth(e,t,l,o)):alert(a.error)})}let currentViewMode="calendar";function openCalendar(e,t){let l=new Date;renderCalendar(e,t,l.getFullYear(),l.getMonth()+1),"table"===currentViewMode&&loadLessonsTable(e,t,l.getFullYear(),l.getMonth()+1)}function renderCalendar(e,t,l,o){Promise.all([fetch(`get_schedule.php?student_id=${e}&month=${o}&year=${l}&timezone=${TEACHER_TIMEZONE}`).then(e=>e.json()),fetch(`get_student_stats.php?student_id=${e}&month=${o}&year=${l}`).then(e=>e.json())]).then(([a,n])=>{let s=new Date(l,o-1,1),i=new Date(l,o,0),r=new Date(s);r.setDate(r.getDate()-(0===s.getDay()?6:s.getDay()-1));let d=new Date(i);d.setDate(d.getDate()+(0===d.getDay()?0:7-d.getDay()));let c="";for(let p=new Date(r);p<=d;p.setDate(p.getDate()+1)){let u=p.getFullYear(),m=String(p.getMonth()+1).padStart(2,"0"),b=String(p.getDate()).padStart(2,"0"),h=`${u}-${m}-${b}`,v=a.find(e=>e.lesson_date===h),y=p.getMonth()!==o-1,g=h===new Date().toISOString().split("T")[0],f="";v&&(f=" calendar-day--"+(v.payment_status||"none")),c+=`<div class="calendar-day ${y?"other-month":""} ${g?"today":""} ${f}" data-date="${h}" onclick="dayClick('${h}', ${e}, '${t}', ${l}, ${o})">
                <div class="calendar-date">${p.getDate()}</div>
                ${v?`<div class="lesson-badge">${v.time?.slice(0,5)} ${escapeHtml(v.topic)}</div>`:""}
            </div>`}let k=`
            <div class="stats-panel">
                <div class="stats-panel__item">
                    <div class="stats-panel__label">Всего уроков</div>
                    <div class="stats-panel__value">${n.total||0}</div>
                </div>
                <div class="stats-panel__item stats-panel__item--paid">
                    <div class="stats-panel__label">🟢 Оплачено</div>
                    <div class="stats-panel__value">${n.paid||0}</div>
                </div>
                <div class="stats-panel__item stats-panel__item--unpaid">
                    <div class="stats-panel__label">🔴 Не оплачено</div>
                    <div class="stats-panel__value">${n.unpaid||0}</div>
                </div>
                <div class="stats-panel__item stats-panel__item--pending">
                    <div class="stats-panel__label">🟡 Ожидается</div>
                    <div class="stats-panel__value">${n.pending||0}</div>
                </div>
            </div>`,w="calendar"===currentViewMode;setMainContent(`
            <button class="btn-back" onclick="renderStudents()">Назад к ученикам</button>
            ${k}
            <div class="schedule-mode-switcher" style="margin-bottom:20px;">
                <button id="switchCalendar" class="schedule-mode-btn ${w?"active":""}" onclick="switchViewMode(${e}, '${t}', ${l}, ${o})">📅 Календарь</button>
                <button id="switchTable" class="schedule-mode-btn ${w?"":"active"}" onclick="switchViewMode(${e}, '${t}', ${l}, ${o})">📋 Таблица</button>
            </div>
            <div id="calendarPanel" style="display:${w?"":"none"};">
                <div class="calendar">
                    <div class="calendar-header">
                        <button class="btn btn--ghost" onclick="changeMonth(${e}, '${t}', ${1===o?l-1:l}, ${1===o?12:o-1})">←</button>
                        <div class="calendar-title">${["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"][o-1]} ${l}</div>
                        <button class="btn btn--ghost" onclick="changeMonth(${e}, '${t}', ${12===o?l+1:l}, ${12===o?1:o+1})">→</button>
                    </div>
                    <div class="calendar-grid">
                        <div class="calendar-day-header">ПН</div><div class="calendar-day-header">ВТ</div><div class="calendar-day-header">СР</div>
                        <div class="calendar-day-header">ЧТ</div><div class="calendar-day-header">ПТ</div><div class="calendar-day-header">СБ</div><div class="calendar-day-header">ВС</div>
                        ${c}
                    </div>
                </div>
            </div>
            <div id="tablePanel" style="display:${w?"none":""};">
                <div id="lessonsTableContainer"></div>
            </div>`),"table"===currentViewMode&&loadLessonsTable(e,t,l,o)}).catch(()=>alert("Ошибка загрузки расписания"))}function dayClick(e,t,l,o,a){fetch(`get_lesson.php?student_id=${t}&date=${e}`).then(e=>e.json()).then(n=>{n&&n.id?openLessonPage(n,t,l,o,a):openAddLessonModal(e,t,l,o,a)}).catch(()=>openAddLessonModal(e,t,l,o,a))}function openAddLessonModal(e,t,l,o,a){selectedLessonStudents=[{id:t,name:l}];let n=document.createElement("div");n.className="modal-overlay active",n.innerHTML=`
        <div class="modal">
            <button class="modal__close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            <h3>Добавить урок на ${e}</h3>
            <div class="form-group">
                <label class="form-label">Ученики</label>
                <div id="selectedStudentsContainer" style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:8px;">
                    ${renderSelectedStudentsTags()}
                </div>
                <button class="btn btn--secondary" onclick="openStudentPickerModal()">+ Добавить ученика</button>
            </div>
            <div class="form-group"><label class="form-label">Время</label><input type="time" id="lessonTime" class="form-input"></div>
            <div class="form-group"><label class="form-label">Тема</label><input type="text" id="lessonTopic" class="form-input"></div>
            <button class="btn btn--primary" onclick="addLesson('${e}', ${o}, ${a})">Сохранить</button>
        </div>`,document.body.appendChild(n)}function renderSelectedStudentsTags(){return selectedLessonStudents.map(e=>`<span class="badge badge--primary">${e.name}</span>`).join("")}function addLesson(e,t,l){let o=document.getElementById("lessonTime").value,a=document.getElementById("lessonTopic").value.trim();if(!o||!a)return alert("Заполните время и тему");if(0===selectedLessonStudents.length)return alert("Выберите хотя бы одного ученика");let n=selectedLessonStudents.map(e=>e.id),s=`date=${e}&time=${encodeURIComponent(o)}&topic=${encodeURIComponent(a)}&teacher_timezone=${TEACHER_TIMEZONE}&student_ids=${encodeURIComponent(JSON.stringify(n))}`;fetch("add_lesson.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:s}).then(e=>e.json()).then(e=>{if(e.success){document.querySelector(".modal-overlay").remove();let o=selectedLessonStudents[0];renderCalendar(o.id,o.name,t,l)}else alert(e.error||"Ошибка сохранения")}).catch(()=>alert("Ошибка сети"))}function openLessonPage(e,t,l,o,a){window.currentLessonData={lesson:e,studentId:t,studentName:l,year:o,month:a};let n=e.time?e.time.slice(0,5):"",s=escapeHtml(e.topic),i=escapeHtml(e.comment),r=escapeHtml(e.recording_link);currentPaymentStatuses={},Array.isArray(e.students)?e.students.forEach(e=>{currentPaymentStatuses[e.student_id]=e.payment_status||"none"}):currentPaymentStatuses[e.student_id]=e.payment_status||"none";let d="";if(Array.isArray(e.students)&&e.students.length>0)e.students.forEach(e=>{let t=`${e.first_name} ${e.last_name||""}`.trim(),l=currentPaymentStatuses[e.student_id]||"none";d+=`
                <div class="lesson-detail__row" style="display:flex; align-items:center; gap:8px;">
                    <span class="lesson-detail__label" style="min-width:auto;">${t}</span>
                    <span id="paymentBadge_${e.student_id}" class="badge badge--${l} badge--clickable"
                          onclick="cycleStudentPaymentStatus(${e.student_id})">
                        ${getPaymentLabel(l)}
                    </span>
                </div>`});else{let c=e.payment_status||"none";d=`
            <div class="lesson-detail__row" style="display:flex; align-items:center; gap:8px;">
                <span class="lesson-detail__label" style="min-width:auto;">${l}</span>
                <span id="paymentBadge_${e.student_id}" class="badge badge--${c} badge--clickable"
                      onclick="cycleStudentPaymentStatus(${e.student_id})">
                    ${getPaymentLabel(c)}
                </span>
            </div>`}setMainContent(`
        <button class="btn-back" onclick="changeMonth(${t}, '${l}', ${o}, ${a})">Назад</button>
        <h2>${e.lesson_date} — ${s}</h2>
        <div class="form-group"><label class="form-label">Время</label><input type="time" id="editTime" class="form-input" value="${n||""}"></div>
        <div class="form-group"><label class="form-label">Тема</label><input type="text" id="editTopic" class="form-input" value="${s}"></div>
        <div class="form-group">
            <label class="form-label">Участники и статусы оплаты</label>
            ${d}
        </div>
        <div class="form-group">
            <label class="form-label">Прикреплённые файлы</label>
            <div id="lessonFilesContainer"></div>
            <div class="file-upload-custom">
                <label for="lessonFileInput" class="file-upload-trigger">📎 Выбрать файлы</label>
                <input type="file" id="lessonFileInput" multiple
                       onchange="document.getElementById('lessonFileInfo').textContent = this.files.length ? 'Выбрано: ' + this.files.length + ' файл(ов)' : ''">
                <span class="file-upload-info" id="lessonFileInfo"></span>
                <button class="btn btn--secondary" onclick="uploadFiles('lesson', ${e.id}, 'lessonFileInput', 'lessonFilesContainer', 'lessonFileInfo')">Загрузить</button>
            </div>
        </div>
        <div class="form-group"><label class="form-label">Комментарий</label><textarea id="editComment" class="form-input" rows="3">${i}</textarea></div>
        <div class="form-group">
            <label class="form-label">Ссылка на запись</label>
            <input type="text" id="editLink" class="form-input" value="${r}">
            ${getRutubeEmbed(e.recording_link)}
        </div>
        <div style="display:flex; gap:12px; flex-wrap:wrap;">
            <button class="btn btn--primary" onclick="updateLesson(${e.id}, ${t}, '${l}', ${o}, ${a})">Сохранить</button>
            <button class="btn btn--secondary" onclick="openRescheduleModal(${e.id}, '${e.lesson_date}', '${n}', ${t}, '${l}', ${o}, ${a})">🔄 Перенести</button>
            <button class="btn btn--danger" onclick="deleteLesson(${e.id}, ${t}, '${l}', ${o}, ${a})">Удалить</button>
        </div>`),loadFiles("lesson",e.id,"lessonFilesContainer")}function cycleStudentPaymentStatus(e){let t=document.getElementById(`paymentBadge_${e}`);if(!t)return;let l=t.textContent.trim(),o=["none","paid","unpaid","pending"],a=o[(o.indexOf({"Не указан":"none",Оплачено:"paid","Не оплачено":"unpaid",Ожидается:"pending"}[l]||"none")+1)%o.length];currentPaymentStatuses[e]=a,t.textContent=getPaymentLabel(a),t.className=`badge badge--${a} badge--clickable`}function updateLesson(e,t,l,o,a){let n=document.getElementById("editTime").value,s=document.getElementById("editTopic").value.trim(),i=document.getElementById("editComment").value.trim(),r=document.getElementById("editLink").value.trim(),d=JSON.stringify(currentPaymentStatuses);fetch("update_lesson.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`id=${e}&time=${encodeURIComponent(n)}&topic=${encodeURIComponent(s)}&comment=${encodeURIComponent(i)}&recording_link=${encodeURIComponent(r)}&teacher_timezone=${TEACHER_TIMEZONE}&student_payments=${encodeURIComponent(d)}`}).then(e=>e.json()).then(e=>e.success?changeMonth(t,l,o,a):alert(e.error))}function deleteLesson(e,t,l,o,a){confirm("Удалить урок?")&&fetch("delete_lesson.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`id=${e}`}).then(e=>e.json()).then(e=>e.success?changeMonth(t,l,o,a):alert(e.error))}let currentScheduleMode="day",currentScheduleDate=new Date().toISOString().split("T")[0];function renderTeacherSchedule(){setMainContent(`
        <div class="dashboard-header">
            <h2>📅 Моё расписание</h2>
            <div class="schedule-mode-switcher">
                <button class="schedule-mode-btn ${"day"===currentScheduleMode?"active":""}" onclick="switchScheduleMode('day')">День</button>
                <button class="schedule-mode-btn ${"week"===currentScheduleMode?"active":""}" onclick="switchScheduleMode('week')">Неделя</button>
                <button class="schedule-mode-btn ${"month"===currentScheduleMode?"active":""}" onclick="switchScheduleMode('month')">Месяц</button>
            </div>
        </div>
        <div id="scheduleContent"></div>
    `),loadScheduleContent()}function switchScheduleMode(e){currentScheduleMode=e,"day"!==e&&(currentScheduleDate=new Date().toISOString().split("T")[0]),document.querySelectorAll(".schedule-mode-btn").forEach(e=>e.classList.remove("active")),event.target.classList.add("active"),loadScheduleContent()}function loadScheduleContent(){let e=document.getElementById("scheduleContent");if(e){if("day"===currentScheduleMode)loadDaySchedule(currentScheduleDate);else if("week"===currentScheduleMode)loadWeekSchedule(currentScheduleDate);else if("month"===currentScheduleMode){let[t,l]=currentScheduleDate.split("-");loadMonthSchedule(parseInt(t),parseInt(l))}}}function loadDaySchedule(e){fetch(`get_teacher_schedule.php?date=${e}&timezone=${TEACHER_TIMEZONE}`).then(e=>e.json()).then(t=>{let l=new Date(e).toLocaleDateString("ru-RU",{year:"numeric",month:"long",day:"numeric"}),o=`
                <div class="schedule-day-header">
                    <div class="schedule-date-nav">
                        <button class="btn btn--ghost" onclick="loadDaySchedule('${shiftDate(e,-1)}')">←</button>
                        <span class="date-title">${l}</span>
                        <button class="btn btn--ghost" onclick="loadDaySchedule('${shiftDate(e,1)}')">→</button>
                        <button class="btn btn--secondary" onclick="loadDaySchedule('${new Date().toISOString().split("T")[0]}')">Сегодня</button>
                    </div>
                </div>`;0===t.length?o+='<div class="empty-state"><div class="empty-icon">\uD83D\uDCC5</div><h3>Нет уроков</h3></div>':(o+='<div class="schedule-list">',t.forEach(e=>{let t=e.time?e.time.slice(0,5):"",l=(e.students||[]).map(e=>`${e.first_name} ${e.last_name||""}`.trim()).join("/"),a=getPaymentLabel(e.payment_status);o+=`
                        <div class="schedule-lesson-card" onclick="openTeacherLessonFromSchedule(${e.students?.[0]?.student_id||0}, '${e.lesson_date}')">
                            <div class="schedule-lesson-info">
                                <div class="schedule-lesson-time">🕒 ${t}</div>
                                <div class="schedule-lesson-student">👤 ${l}</div>
                                <div class="schedule-lesson-topic">${escapeHtml(e.topic)||"Без темы"}</div>
                            </div>
                            <div class="schedule-lesson-badges">
                                <span class="badge badge--${e.payment_status}">${a}</span>
                                ${e.recording_link?'<span class="badge badge--primary">\uD83C\uDFA5</span>':""}
                            </div>
                        </div>`}),o+="</div>"),document.getElementById("scheduleContent").innerHTML=o,currentScheduleDate=e})}function loadWeekSchedule(e){let t=getMonday(e),l=shiftDate(t,6);fetch(`get_teacher_schedule.php?start_date=${t}&end_date=${l}&timezone=${TEACHER_TIMEZONE}`).then(e=>e.json()).then(e=>{let o=`
                <div class="schedule-day-header">
                    <div class="schedule-date-nav">
                        <button class="btn btn--ghost" onclick="loadWeekSchedule('${shiftDate(t,-7)}')">←</button>
                        <span class="date-title">${formatDate(t)} – ${formatDate(l)}</span>
                        <button class="btn btn--ghost" onclick="loadWeekSchedule('${shiftDate(t,7)}')">→</button>
                        <button class="btn btn--secondary" onclick="loadWeekSchedule('${new Date().toISOString().split("T")[0]}')">Сегодня</button>
                    </div>
                </div>
                <div class="week-grid">
                    <div class="week-day-header">ПН</div>
                    <div class="week-day-header">ВТ</div>
                    <div class="week-day-header">СР</div>
                    <div class="week-day-header">ЧТ</div>
                    <div class="week-day-header">ПТ</div>
                    <div class="week-day-header">СБ</div>
                    <div class="week-day-header">ВС</div>`;for(let a=0;a<7;a++){let n=shiftDate(t,a),s=e.filter(e=>e.lesson_date===n),i=n===new Date().toISOString().split("T")[0];o+=`<div class="week-day-cell" onclick="openDayFromWeek('${n}')">
                    <div class="week-day-date ${i?"today":""}">${new Date(n).getDate()}</div>`,s.forEach(e=>{let t=(e.students||[]).map(e=>e.first_name).join("/");o+=`<span class="week-lesson-dot">${e.time?.slice(0,5)} ${t}</span>`}),o+="</div>"}o+="</div>",document.getElementById("scheduleContent").innerHTML=o,currentScheduleDate=t})}function loadMonthSchedule(e,t){let l=`${e}-${String(t).padStart(2,"0")}-01`,o=`${e}-${String(t).padStart(2,"0")}-${new Date(e,t,0).getDate()}`;fetch(`get_teacher_schedule.php?start_date=${l}&end_date=${o}&timezone=${TEACHER_TIMEZONE}`).then(e=>e.json()).then(l=>{let o=new Date(e,t-1,1),a=new Date(e,t,0),n=new Date(o),s=n.getDay();n.setDate(n.getDate()+(0===s?-6:1-s));let i=new Date(a),r=i.getDay();i.setDate(i.getDate()+(0===r?0:7-r));let d="";for(let c=new Date(n);c<=i;c.setDate(c.getDate()+1)){let p=c.getFullYear(),u=String(c.getMonth()+1).padStart(2,"0"),m=String(c.getDate()).padStart(2,"0"),b=`${p}-${u}-${m}`,h=l.filter(e=>e.lesson_date===b),v=c.getMonth()!==t-1,y=b===new Date().toISOString().split("T")[0];d+=`<div class="calendar-day ${v?"other-month":""} ${y?"today":""}" onclick="openDayFromMonth('${b}')">
                    <div class="calendar-date">${c.getDate()}</div>`,h.forEach(e=>{let t=(e.students||[]).map(e=>e.first_name).join("/"),l="lesson-dot",o=(e.students||[]).map(e=>e.payment_status);o.includes("unpaid")?l+=" lesson-dot--unpaid":o.includes("pending")?l+=" lesson-dot--pending":o.every(e=>"paid"===e)?l+=" lesson-dot--paid":l+=" lesson-dot--none",d+=`<span class="${l}">${e.time?.slice(0,5)} ${t}</span>`}),d+="</div>"}let g=0,f=0,k=0;l.forEach(e=>{(e.students||[]).forEach(e=>{let t=e.rate||0;"paid"===e.payment_status?g+=t:"unpaid"===e.payment_status?f+=t:"pending"===e.payment_status&&(k+=t)})});let w=`
                <div class="stats-panel" style="margin-top:16px;">
                    <div class="stats-panel__item stats-panel__item--paid">
                        <div class="stats-panel__label">🟢 Оплачено</div>
                        <div class="stats-panel__value">${g} ₽</div>
                    </div>
                    <div class="stats-panel__item stats-panel__item--unpaid">
                        <div class="stats-panel__label">🔴 Не оплачено</div>
                        <div class="stats-panel__value">${f} ₽</div>
                    </div>
                    <div class="stats-panel__item stats-panel__item--pending">
                        <div class="stats-panel__label">🟡 Ожидается</div>
                        <div class="stats-panel__value">${k} ₽</div>
                    </div>
                </div>`,x=`
                <div class="teacher-calendar">
                    <div class="calendar-header">
                        <button class="btn btn--ghost" onclick="loadMonthSchedule(${1===t?e-1:e}, ${1===t?12:t-1})">←</button>
                        <div class="calendar-title">${["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"][t-1]} ${e}</div>
                        <button class="btn btn--ghost" onclick="loadMonthSchedule(${12===t?e+1:e}, ${12===t?1:t+1})">→</button>
                        <button class="btn btn--secondary" onclick="loadMonthSchedule(new Date().getFullYear(), new Date().getMonth()+1)">Сегодня</button>
                    </div>
                    <div class="calendar-grid">
                        <div class="calendar-day-header">ПН</div><div class="calendar-day-header">ВТ</div><div class="calendar-day-header">СР</div>
                        <div class="calendar-day-header">ЧТ</div><div class="calendar-day-header">ПТ</div><div class="calendar-day-header">СБ</div><div class="calendar-day-header">ВС</div>
                        ${d}
                    </div>
                </div>
                ${w}`;document.getElementById("scheduleContent").innerHTML=x,currentScheduleDate=`${e}-${String(t).padStart(2,"0")}-01`}).catch(e=>{console.error("Ошибка загрузки расписания:",e),document.getElementById("scheduleContent").innerHTML='<div class="empty-state">Ошибка загрузки</div>'})}function openDayFromWeek(e){currentScheduleMode="day",currentScheduleDate=e,document.querySelectorAll(".schedule-mode-btn").forEach(e=>{e.classList.remove("active"),"День"===e.textContent.trim()&&e.classList.add("active")}),loadDaySchedule(e)}function openDayFromMonth(e){currentScheduleMode="day",currentScheduleDate=e,document.querySelectorAll(".schedule-mode-btn").forEach(e=>{e.classList.remove("active"),"День"===e.textContent.trim()&&e.classList.add("active")}),loadDaySchedule(e)}function openTeacherLessonFromSchedule(e,t){let[l,o]=t.split("-");renderCalendar(e,"Ученик",parseInt(l),parseInt(o))}function shiftDate(e,t){let l=new Date(e);return l.setDate(l.getDate()+t),l.toISOString().split("T")[0]}function getMonday(e){let t=new Date(e),l=t.getDay(),o=t.getDate()-l+(0===l?-6:1);return t.setDate(o),t.toISOString().split("T")[0]}function formatDate(e){return new Date(e).toLocaleDateString("ru-RU",{day:"numeric",month:"long"})}function openAvatarModal(){let e="undefined"!=typeof TEACHER_AVATAR?TEACHER_AVATAR:"",t=document.querySelector(".welcome-avatar")?.textContent.trim()||"?",l="";l=e?`<img src="${e}?t=${new Date().getTime()}" class="avatar-modal-preview" id="avatarPreview" alt="Аватар">`:`<div class="avatar-modal-placeholder" id="avatarPreview">${t}</div>`;let o=document.createElement("div");o.className="modal-overlay active",o.innerHTML=`
        <div class="modal">
            <button class="modal__close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            <h3>Изменить фото</h3>
            <div style="text-align:center;">${l}</div>
            <div style="display:flex; gap:8px; margin-top:16px;">
                <input type="file" id="avatarFileInput" accept="image/*" style="flex:1;">
                <button class="btn btn--primary" onclick="uploadAvatar()">Загрузить</button>
            </div>
            ${e?`<button class="btn btn--danger" style="width:100%; margin-top:8px;" onclick="deleteAvatar()">Удалить фото</button>`:""}
        </div>`,document.body.appendChild(o)}function uploadAvatar(){let e=document.getElementById("avatarFileInput");if(!e||!e.files.length){alert("Выберите файл");return}let t=new FormData;t.append("avatar",e.files[0]),fetch("upload_avatar.php",{method:"POST",body:t}).then(e=>e.json()).then(e=>{e.success?(updateSidebarAvatar(e.avatar),document.querySelector(".modal-overlay").remove()):alert("Ошибка: "+e.error)}).catch(()=>alert("Ошибка сети"))}function deleteAvatar(){confirm("Удалить фото и вернуть букву?")&&fetch("delete_avatar.php",{method:"POST"}).then(e=>e.json()).then(e=>{e.success?(updateSidebarAvatar(""),document.querySelector(".modal-overlay").remove()):alert("Ошибка: "+e.error)}).catch(()=>alert("Ошибка сети"))}function updateSidebarAvatar(e){let t=document.querySelector(".sidebar__welcome .welcome-avatar"),l=document.querySelector(".sidebar__welcome .welcome-avatar-img");if(e){if(l)l.src=e+"?t="+new Date().getTime();else if(t){let o=document.createElement("img");o.src=e+"?t="+new Date().getTime(),o.className="welcome-avatar-img",o.alt="Аватар",t.replaceWith(o)}}else if(l){let a=document.createElement("div");a.className="welcome-avatar",a.textContent=l.alt?.charAt(0)||"?",l.replaceWith(a)}}function copyToClipboard(e,t){if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(e).then(()=>{let e=t.textContent;t.textContent="✓ Скопировано",setTimeout(()=>{t.textContent=e},1500)});else{let l=document.createElement("textarea");l.value=e,l.style.position="fixed",l.style.opacity="0",document.body.appendChild(l),l.select(),document.execCommand("copy"),document.body.removeChild(l);let o=t.textContent;t.textContent="✓ Скопировано",setTimeout(()=>{t.textContent=o},1500)}}function copyToClipboard(e,t){if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(e).then(()=>{let e=t.textContent;t.textContent="✓ Скопировано",setTimeout(()=>{t.textContent=e},1500)});else{let l=document.createElement("textarea");l.value=e,l.style.position="fixed",l.style.opacity="0",document.body.appendChild(l),l.select(),document.execCommand("copy"),document.body.removeChild(l);let o=t.textContent;t.textContent="✓ Скопировано",setTimeout(()=>{t.textContent=o},1500)}}function applyHiddenSections(){"undefined"!=typeof HIDDEN_SECTIONS&&HIDDEN_SECTIONS&&HIDDEN_SECTIONS.forEach(e=>{let t=document.querySelector(`.sidebar__link[data-tab="${e}"]`);t&&(t.style.display="none")})}function openSidebarEditor(){let e=[],t="undefined"!=typeof SIDEBAR_CUSTOMIZATION?SIDEBAR_CUSTOMIZATION:{},l="undefined"!=typeof HIDDEN_SECTIONS&&Array.isArray(HIDDEN_SECTIONS)?HIDDEN_SECTIONS:[];[{key:"library",name:"Библиотека заданий",icon:"\uD83D\uDCD6"},{key:"lectures",name:"Лекции",icon:"\uD83D\uDCDA"},{key:"help",name:"Справка",icon:"\uD83D\uDCD8"},{key:"add-custom-block",name:"Добавить раздел",icon:"+"}].forEach(o=>{let a=t[o.key]||{};e.push({key:o.key,title:a.title||o.name,icon:a.icon||o.icon,visible:!l.includes(o.key)})}),document.querySelectorAll('.sidebar__link[data-tab^="custom_"]').forEach(o=>{let a=o.getAttribute("data-tab"),n=a,s=t[n]||{},i=s.title||o.textContent.replace(/^📌\s*/,"").trim();e.push({key:n,title:i,icon:s.icon||"\uD83D\uDCCC",visible:!l.includes(n)})});let o=["\uD83D\uDCD6","\uD83D\uDCDA","\uD83D\uDCCB","\uD83D\uDCD8","\uD83D\uDCC5","\uD83D\uDCDD","\uD83D\uDCCC","\uD83D\uDCC1","\uD83D\uDCCE","\uD83D\uDCCA","\uD83D\uDCC8","\uD83D\uDCC9","\uD83C\uDF93","\uD83C\uDFC6","\uD83D\uDCA1","\uD83D\uDCE3","\uD83D\uDCE2","\uD83D\uDD14","✨","\uD83D\uDD25","\uD83D\uDC8E","\uD83C\uDFAF"],a="";e.forEach((e,t)=>{let l=e.visible?"checked":"";a+=`
            <div class="sidebar-editor-row" data-key="${e.key}">
                <div class="sidebar-editor-cell">
                    <input type="text" class="form-input sidebar-editor-title" value="${e.title}" placeholder="Название">
                </div>
                <div class="sidebar-editor-cell">
                    <select class="form-select sidebar-editor-icon">${o.map(t=>`<option value="${t}" ${e.icon===t?"selected":""}>${t}</option>`).join("")}</select>
                </div>
                <div class="sidebar-editor-cell" style="text-align:center;">
                    <label><input type="checkbox" class="sidebar-editor-visible" ${l}> Показывать</label>
                </div>
            </div>`});let n=document.createElement("div");n.className="modal-overlay active",n.innerHTML=`
        <div class="modal" style="min-width:600px;">
            <button class="modal__close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            <h3>Настроить меню</h3>
            <p style="color:var(--text-secondary); font-size:14px;">Здесь можно переименовать разделы, сменить иконки и настроить их видимость.</p>
            <div class="sidebar-editor-table">
                <div class="sidebar-editor-header">
                    <div class="sidebar-editor-cell"><strong>Название</strong></div>
                    <div class="sidebar-editor-cell"><strong>Иконка</strong></div>
                    <div class="sidebar-editor-cell" style="text-align:center;"><strong>Видимость</strong></div>
                </div>
                ${a}
            </div>
            <button class="btn btn--primary" onclick="saveSidebarEditor()">Сохранить</button>
        </div>`,document.body.appendChild(n)}function saveSidebarEditor(){let e=document.querySelectorAll(".sidebar-editor-row"),t=[],l=[];e.forEach(e=>{let o=e.dataset.key,a=e.querySelector(".sidebar-editor-title"),n=e.querySelector(".sidebar-editor-icon"),s=e.querySelector(".sidebar-editor-visible"),i=a?a.value.trim():"",r=n?n.value:"",d=!s||s.checked;t.push({key:o,title:i,icon:r}),d||l.push(o)}),fetch("save_sidebar_customization.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:"data="+encodeURIComponent(JSON.stringify(t))}).then(e=>e.json()).then(e=>{if(e.success)return fetch("save_hidden_sections.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:"hidden_sections="+encodeURIComponent(JSON.stringify(l))});throw Error(e.error||"Ошибка сохранения")}).then(e=>e.json()).then(e=>{e.success?(window.SIDEBAR_CUSTOMIZATION={},t.forEach(e=>{(e.title||e.icon)&&(window.SIDEBAR_CUSTOMIZATION[e.key]={title:e.title,icon:e.icon})}),window.HIDDEN_SECTIONS=l,applySidebarCustomization(),applyHiddenSections(),document.querySelector(".modal-overlay").remove()):alert("Ошибка сохранения видимости")}).catch(e=>{alert("Ошибка: "+e.message)})}function applySidebarCustomization(){if("undefined"==typeof SIDEBAR_CUSTOMIZATION||!SIDEBAR_CUSTOMIZATION)return;let e=SIDEBAR_CUSTOMIZATION;document.querySelectorAll(".sidebar__link[data-tab]").forEach(t=>{let l=t.getAttribute("data-tab");if(!l||l.startsWith("custom_"))return;let o=e[l];if(o){if(o.icon){let a=t.textContent.replace(/^.\s*/,o.icon+" ");t.textContent=a}if(o.title){let n=t.childNodes;n.length>1&&3===n[1].nodeType?n[1].textContent=" "+o.title:t.childNodes[0].textContent=o.icon?o.icon+" "+o.title:o.title}}}),document.querySelectorAll('.sidebar__link[data-tab^="custom_"]').forEach(t=>{let l=t.getAttribute("data-tab"),o=e[l];o&&(o.icon?t.textContent=o.icon+" "+(o.title||t.textContent.replace(/^📌\s*/,"").trim()):o.title&&(t.textContent="\uD83D\uDCCC "+o.title))})}function openEditStudentModal(e,t,l,o,a=0){let n=document.createElement("div");n.className="modal-overlay active",n.innerHTML=`
        <div class="modal">
            <button class="modal__close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            <h3>Редактировать ученика</h3>
            <div class="form-group"><label class="form-label">Имя</label><input type="text" id="studFirstName" class="form-input" value="${t}"></div>
            <div class="form-group"><label class="form-label">Фамилия</label><input type="text" id="studLastName" class="form-input" value="${l}"></div>
            <div class="form-group"><label class="form-label">Предмет</label><input type="text" id="studSubject" class="form-input" value="${o}"></div>
            <div class="form-group"><label class="form-label">Ставка (₽)</label><input type="number" id="studRate" class="form-input" value="${a}" min="0"></div>
            <button class="btn btn--primary" onclick="updateStudent(${e})">Сохранить</button>
        </div>`,document.body.appendChild(n)}function updateStudent(e){let t=document.getElementById("studFirstName").value.trim(),l=document.getElementById("studLastName").value.trim(),o=document.getElementById("studSubject").value.trim(),a=document.getElementById("studRate"),n=a?parseInt(a.value,10):0,s=isNaN(n)?0:n;if(!t)return alert("Имя обязательно");fetch("update_student.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`id=${e}&first_name=${encodeURIComponent(t)}&last_name=${encodeURIComponent(l)}&subject=${encodeURIComponent(o)}&rate=${s}`}).then(e=>e.json()).then(e=>{e.success?(document.querySelector(".modal-overlay").remove(),renderStudents()):alert(e.error)}).catch(()=>alert("Ошибка сети"))}function showBetaNotice(){if("1"===sessionStorage.getItem("beta_notice_shown"))return;sessionStorage.setItem("beta_notice_shown","1");let e=document.createElement("div");e.className="modal-overlay active",e.innerHTML=`
        <div class="modal" style="max-width: 420px;">
            <div class="modal__close" onclick="this.closest('.modal-overlay').remove();">&times;</div>
            <h3 style="text-align:center; margin-bottom:12px;">🚀 Мы в бета‑тесте!</h3>
            <p style="color: var(--text-secondary); margin-bottom: 16px; line-height: 1.5;">
                Сейчас платформа активно тестируется, поэтому <strong>все функции временно бесплатны</strong>.
                Если заметили ошибку, хотите что‑то предложить или просто есть вопросы — напишите нам через
                <a href="contact.html" target="_blank" style="color: var(--primary);">форму обратной связи</a>.
                Будем рады любому отзыву!
            </p>
            <button class="btn btn--primary" style="width:100%;" onclick="this.closest('.modal-overlay').remove();">Понятно, спасибо!</button>
        </div>`,document.body.appendChild(e)}function openAddHomeworkCategoryModal(e,t){let l=document.createElement("div");l.className="modal-overlay active",l.innerHTML=`
        <div class="modal">
            <button class="modal__close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            <h3>Новая категория для ${t}</h3>
            <div class="form-group"><label class="form-label">Название категории</label><input type="text" id="categoryName" class="form-input"></div>
            <button class="btn btn--primary" onclick="addHomeworkCategory(${e}, '${t.replace(/'/g,"\\'")}')">Создать</button>
        </div>`,document.body.appendChild(l)}function addHomeworkCategory(e,t){let l=document.getElementById("categoryName").value.trim();if(!l)return alert("Введите название");fetch("add_homework_category.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`student_id=${e}&name=${encodeURIComponent(l)}`}).then(e=>e.json()).then(l=>{l.success?(document.querySelector(".modal-overlay").remove(),openHomeworkStudent(e,t)):alert(l.error)})}function openEditHomeworkCategoryModal(e,t,l,o){let a=document.createElement("div");a.className="modal-overlay active",a.innerHTML=`
        <div class="modal">
            <button class="modal__close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            <h3>Переименовать категорию</h3>
            <div class="form-group"><label class="form-label">Название</label><input type="text" id="categoryName" class="form-input" value="${t}"></div>
            <button class="btn btn--primary" onclick="updateHomeworkCategory(${e}, ${l}, '${o.replace(/'/g,"\\'")}')">Сохранить</button>
        </div>`,document.body.appendChild(a)}function updateHomeworkCategory(e,t,l){let o=document.getElementById("categoryName").value.trim();if(!o)return alert("Введите название");fetch("update_homework_category.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`id=${e}&name=${encodeURIComponent(o)}`}).then(e=>e.json()).then(e=>{e.success?(document.querySelector(".modal-overlay").remove(),openHomeworkStudent(t,l)):alert(e.error)})}function deleteHomeworkCategory(e,t,l){confirm('Удалить категорию? Блоки останутся, но переместятся в "Без категории".')&&fetch("delete_homework_category.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`id=${e}`}).then(e=>e.json()).then(e=>{e.success?openHomeworkStudent(t,l):alert(e.error)})}function openAddHomeworkBlockModal(e,t,l=null){fetch(`get_homework_categories.php?student_id=${e}`).then(e=>e.json()).then(o=>{let a="";o.forEach(e=>{a+=`<option value="${e.id}" ${e.id==l?"selected":""}>${e.name}</option>`});let n=document.createElement("div");n.className="modal-overlay active",n.innerHTML=`
                <div class="modal">
                    <button class="modal__close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                    <h3>Новый блок заданий для ${t}</h3>
                    <div class="form-group"><label class="form-label">Название блока</label><input type="text" id="blockName" class="form-input"></div>
                    <div class="form-group"><label class="form-label">Категория</label><select id="blockCategory" class="form-select">${a}</select></div>
                    <button class="btn btn--primary" onclick="addHomeworkBlock(${e}, '${t.replace(/'/g,"\\'")}', ${l||"null"})">Создать</button>
                </div>`,document.body.appendChild(n)})}function addHomeworkBlock(e,t,l=null){let o=document.getElementById("blockName").value.trim(),a=document.getElementById("blockCategory")?.value||l||"";if(!o)return alert("Введите название");fetch("add_homework_block.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`student_id=${e}&name=${encodeURIComponent(o)}&category_id=${a}`}).then(e=>e.json()).then(t=>{t.success?(document.querySelector(".modal-overlay").remove(),fetch(`get_homework_blocks.php?student_id=${e}&category_id=all`).then(e=>e.json()).then(e=>{window.currentHomeworkData.blocks=e,renderHomeworkTabs(window.lastHomeworkCategoryId)})):alert(t.error)})}function openTimezoneModal(){let e="undefined"!=typeof TEACHER_TIMEZONE?TEACHER_TIMEZONE:"Europe/Moscow",t="";[{value:"Europe/Moscow",label:"Москва (UTC+3)"},{value:"Europe/Kaliningrad",label:"Калининград (UTC+2)"},{value:"Europe/Samara",label:"Самара (UTC+4)"},{value:"Asia/Yekaterinburg",label:"Екатеринбург (UTC+5)"},{value:"Asia/Omsk",label:"Омск (UTC+6)"},{value:"Asia/Krasnoyarsk",label:"Красноярск (UTC+7)"},{value:"Asia/Irkutsk",label:"Иркутск (UTC+8)"},{value:"Asia/Yakutsk",label:"Якутск (UTC+9)"},{value:"Asia/Vladivostok",label:"Владивосток (UTC+10)"},{value:"Asia/Kamchatka",label:"Камчатка (UTC+12)"},{value:"Europe/Minsk",label:"Минск (UTC+3)"},{value:"Asia/Almaty",label:"Алматы (UTC+6)"},].forEach(l=>{let o=l.value===e?" selected":"";t+=`<option value="${l.value}"${o}>${l.label}</option>`});let l=document.createElement("div");l.className="modal-overlay active",l.innerHTML=`
        <div class="modal" style="max-width:400px;">
            <button class="modal__close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            <h3>Часовой пояс</h3>
            <div class="form-group">
                <label class="form-label">Ваш часовой пояс</label>
                <select id="teacherTimezone" class="form-select">${t}</select>
            </div>
            <button class="btn btn--primary" onclick="saveTimezone()">Сохранить</button>
        </div>`,document.body.appendChild(l)}function saveTimezone(){let e=document.getElementById("teacherTimezone");if(!e)return;let t=e.value;fetch("update_teacher_timezone.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`timezone=${encodeURIComponent(t)}`}).then(e=>e.json()).then(e=>{if(e.success){if(document.querySelector(".modal-overlay").remove(),TEACHER_TIMEZONE=t,alert("Часовой пояс сохранён. Время уроков пересчитано."),window.currentCalendarData){let{studentId:l,studentName:o,year:a,month:n}=window.currentCalendarData;renderCalendar(l,o,a,n),loadLessonsTable(l,o,a,n)}if(window.currentLessonData){let{lesson:s,studentId:i,studentName:r,year:d,month:c}=window.currentLessonData;openLessonPage(s,i,r,d,c)}}else alert("Ошибка: "+e.error)}).catch(()=>alert("Ошибка сети"))}function escapeHtml(e){return e?String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;"):""}document.addEventListener("click",function(e){let t=e.target.closest(".add-library-task-btn");if(t){let l=t.dataset.blockId,o=t.dataset.blockName?decodeURIComponent(t.dataset.blockName):"";l&&openAddLibraryTaskModal(l,o);return}let a=e.target.closest(".edit-task-btn");if(a){let n=a.closest(".library-task");if(n){let s=n.dataset.taskId,i=decodeURIComponent(n.dataset.title||""),r=decodeURIComponent(n.dataset.text||""),d=decodeURIComponent(n.dataset.links||""),c=n.dataset.blockId||null,p=n.dataset.blockName?decodeURIComponent(n.dataset.blockName):"";s&&openEditLibraryTaskModal(s,i,r,d,c,p)}return}let u=e.target.closest(".delete-task-btn");if(u){let m=u.closest(".library-task");if(m){let b=m.dataset.taskId;b&&deleteLibraryTask(b)}return}let h=e.target.closest(".assign-task-btn");if(h){let v=h.closest(".library-task");if(v){let y=v.dataset.taskId;y&&assignLibraryTaskToStudent(y)}return}}),document.addEventListener("click",function(e){let t=e.target.closest(".edit-library-block-btn");if(t){e.stopPropagation();let l=t.closest(".library-block");if(l){let o=l.dataset.blockId,a=l.querySelector(".block-card__title")?.textContent.trim()||"",n=l.dataset.sectionId||null;openEditLibraryBlockModal(o,a,n)}return}let s=e.target.closest(".delete-library-block-btn");if(s){e.stopPropagation();let i=s.closest(".library-block");if(i){let r=i.dataset.blockId;r&&deleteLibraryBlock(r)}return}});const Onboarding={active:!1,stepIndex:0,isReplay:!1,bars:null,pulse:null,tooltip:null,beforeUnloadHandler:null,_refreshInterval:null,_currentTarget:null,steps:[{id:"welcome",type:"center",text:"Добро пожаловать в TeachForum! Мы настроим кабинет для работы. Начнём с добавления первого ученика.",btn:"Начать",allowSkip:!0},{id:"addStudentBtn",type:"click",text:"Нажмите сюда, чтобы создать профиль ученика.",selector:'#mainContent .btn-add[onclick*="openAddStudentModal"]',find:()=>document.querySelector('#mainContent .btn-add[onclick*="openAddStudentModal"]')},{id:"clickCreateStudent",type:"click",text:"Введите имя, фамилию и нажмите \xabСоздать\xbb.",selector:".modal .btn--primary",find:()=>document.querySelector(".modal .btn--primary")},{id:"waitForCredentialsModal",type:"modalClose",text:"",find:()=>null,noTooltip:!0},{id:"openStudentCalendar",type:"click",text:"Кликните по строке ученика, чтобы открыть его календарь.",selector:"#mainContent .table-responsive tbody tr",find:()=>document.querySelector("#mainContent .table-responsive tbody tr")},{id:"addLessonDay",type:"click",text:"Выберите свободную дату в календаре, чтобы создать урок.",selector:".calendar-day:not(.other-month)",find:()=>document.querySelector(".calendar-day:not(.other-month)")},{id:"lessonForm",type:"modalClose",text:"Укажите время, тему и нажмите \xabСохранить\xbb.",find:()=>document.querySelector(".modal-overlay.active .modal")},{id:"showSchedule",type:"click",text:"Теперь перейдите в \xabМоё расписание\xbb.",selector:'.sidebar__link[data-tab="schedule"]',find:()=>document.querySelector('.sidebar__link[data-tab="schedule"]')},{id:"switchToMonth",type:"click",text:"Переключитесь на вид \xabМесяц\xbb, чтобы увидеть созданный урок.",selector:".schedule-mode-btn",matches:e=>(e.textContent||"").includes("Месяц"),find:()=>Array.from(document.querySelectorAll(".schedule-mode-btn")).find(e=>(e.textContent||"").includes("Месяц"))},{id:"showScheduleLesson",type:"center",text:"Отлично! Урок появился в вашем расписании. Теперь научимся работать с заданиями.",btn:"Далее"},{id:"goToHomework",type:"click",text:"Перейдите в раздел \xabДомашние задания\xbb.",selector:'.sidebar__link[data-tab="homeworks"]',find:()=>document.querySelector('.sidebar__link[data-tab="homeworks"]')},{id:"selectStudentInHomework",type:"click",text:"Выберите того же ученика в списке.",selector:"#mainContent .table-responsive tbody tr",find:()=>document.querySelector("#mainContent .table-responsive tbody tr")},{id:"goToLibrary",type:"click",text:"Теперь перейдите в \xabБиблиотеку заданий\xbb.",selector:'.sidebar__link[data-tab="library"]',find:()=>document.querySelector('.sidebar__link[data-tab="library"]')},{id:"addLibrarySection",type:"click",text:"Создайте раздел для заданий – нажмите \xab+ Раздел\xbb.",selector:'.btn-add[onclick*="openAddLibrarySectionModal"]',find:()=>document.querySelector('.btn-add[onclick*="openAddLibrarySectionModal"]')},{id:"libSectionForm",type:"modalClose",text:"Введите название раздела и нажмите \xabСоздать\xbb.",find:()=>document.querySelector(".modal-overlay.active .modal")},{id:"addLibraryBlock",type:"click",text:"Внутри раздела нажмите \xab+ Добавить блок\xbb.",selector:'.library-section .btn-add[onclick*="openAddLibraryBlockModal"]',find(){let e=document.querySelector(`.library-section[data-section-id="${window.__lastLibrarySectionId||""}"] .btn-add[onclick*="openAddLibraryBlockModal"]`);if(e)return e;let t=document.querySelectorAll('.library-section .btn-add[onclick*="openAddLibraryBlockModal"]');return t.length?t[t.length-1]:null}},{id:"libBlockForm",type:"modalClose",text:"Назовите блок и создайте его.",find:()=>document.querySelector(".modal-overlay.active .modal")},{id:"openLibraryBlock",type:"click",text:"Кликните по созданному блоку, чтобы открыть его.",selector:".library-block",find(){let e=document.querySelector(`.library-block[data-block-id="${window.__lastLibraryBlockId||""}"]`);if(e)return e;let t=document.querySelectorAll(".library-block");return t.length?t[t.length-1]:null}},{id:"addLibraryTask",type:"click",text:"Добавьте задание в блок – нажмите \xab+ Добавить задание\xbb.",selector:'.btn-add[onclick*="openAddLibraryTaskModal"]',find:()=>document.querySelector('.btn-add[onclick*="openAddLibraryTaskModal"]')},{id:"libTaskForm",type:"modalClose",text:"Заполните название, текст (опционально) и нажмите \xabСохранить\xbb.",find:()=>document.querySelector(".modal-overlay.active .modal")},{id:"assignLibraryTask",type:"click",text:"Назначьте это задание ученику – нажмите \xabНазначить ученику\xbb в карточке задания.",selector:".assign-task-btn",find:()=>document.querySelector(".assign-task-btn")},{id:"assignLibraryTaskModal",type:"modalClose",text:"Выберите ученика (поставьте галочку) и нажмите \xabНазначить выбранному\xbb.",find:()=>document.querySelector(".modal-overlay.active .modal"),tooltipPosition:"top"},{id:"showHomeworkResult",type:"center",text:"✅ Готово! Задание появилось в разделе \xabДомашние задания\xbb у ученика. Вы успешно освоили ключевые возможности TeachForum.",btn:"Понятно"},{id:"finish",type:"center",text:"Отлично! Вы освоили основы TeachForum. Теперь вы можете управлять оплатами, настраивать кабинет и использовать все возможности. Если что-то забудете — загляните в \uD83D\uDCD8 Справку в боковом меню. Успешных уроков!",btn:"Понятно"}],init(){let e=!0===window.__ONBOARDING_COMPLETED__,t=window.innerWidth<768,l=document.getElementById("onboardingReplayBtn");l&&(t?l.style.display="none":(l.style.display=e?"":"none",l.addEventListener("click",e=>{e.preventDefault(),this.start(!0)}))),e||(t?"1"!==localStorage.getItem("teachforum_mobile_notice_shown")&&this.showMobileNotice():setTimeout(()=>this.start(!1),1200))},showMobileNotice(){localStorage.setItem("teachforum_mobile_notice_shown","1");let e=document.createElement("div");e.className="modal-overlay active",e.innerHTML=`
        <div class="modal" style="max-width: 400px;">
            <div class="modal__close" onclick="this.closest('.modal-overlay').remove();">&times;</div>
            <h3 style="text-align:center; margin-bottom:12px;">💻 Обучение только на компьютере</h3>
            <p style="color: var(--text-secondary); margin-bottom: 16px; line-height: 1.5;">
                Для прохождения пошагового обучения войдите в аккаунт с компьютера.
                На телефоне вы можете пользоваться всеми функциями сервиса, просто обучение будет доступно позже с десктопа.
            </p>
            <button class="btn btn--primary" style="width:100%;" onclick="this.closest('.modal-overlay').remove();">Понятно</button>
        </div>`,document.body.appendChild(e)},start(e){if(this.active&&this.destroy(),this.isReplay=e,this.active=!0,this.stepIndex=0,!e){let t=window.innerWidth-document.documentElement.clientWidth;document.body.style.paddingRight=t+"px",document.body.style.overflow="hidden",this.beforeUnloadHandler=e=>{e.preventDefault(),e.returnValue=""},window.addEventListener("beforeunload",this.beforeUnloadHandler)}this.createElements(),this.run()},destroy(){this.active=!1,this.stopRefreshLoop(),this._currentTarget=null,this.bars&&(Object.values(this.bars).forEach(e=>e.remove()),this.bars=null),this.pulse&&(this.pulse.remove(),this.pulse=null),this.tooltip&&(this.tooltip.remove(),this.tooltip=null),document.body.style.overflow="",document.body.style.paddingRight="",this.beforeUnloadHandler&&(window.removeEventListener("beforeunload",this.beforeUnloadHandler),this.beforeUnloadHandler=null)},createElements(){this.bars={},["t","r","b","l"].forEach(e=>{let t=document.createElement("div");t.className="onboarding-bar"+(this.isReplay?" onboarding-bar--soft":""),t.style.position="fixed",t.style.zIndex=150,t.style.display="none",t.style.background=this.isReplay?"rgba(0,0,0,0.35)":"rgba(0,0,0,0.55)",t.addEventListener("click",e=>{this.isReplay?this.destroy():(e.preventDefault(),e.stopPropagation())}),document.body.appendChild(t),this.bars[e]=t}),this.pulse=document.createElement("div"),this.pulse.className="onboarding-pulse",this.pulse.style.display="none",document.body.appendChild(this.pulse),this.tooltip=document.createElement("div"),this.tooltip.className="onboarding-tooltip",this.tooltip.style.display="none",document.body.appendChild(this.tooltip)},async run(){if(!this.active)return;if(this.stepIndex>=this.steps.length){this.finish();return}let e=this.steps[this.stepIndex];if("center"===e.type){this.hideBars(),this.showCenter(e);return}if("modalClose"===e.type){this.hideBars(),e.noTooltip||("top"===e.tooltipPosition?this.showTopTooltip(e.text):this.showFixedTooltip(e.text)),await this.waitForModalClose(e.noTooltip?3e4:2e4),this.hideBars(),this.stepIndex++,await this.sleep(300),this.run();return}let t=await this.waitFor(e.find,1e4);if(!t){console.warn("Onboarding: элемент не найден",e.id),this.stepIndex++,this.run();return}this._currentTarget=t,t.scrollIntoView({block:"center",behavior:"smooth"}),await this.sleep(300),this.positionBars(t),this.startRefreshLoop(),this.showFixedTooltip(e.text);let l=t=>{let o=t.target.closest(e.selector);o&&(!e.matches||e.matches(o))?(document.removeEventListener("click",l,!0),this.hideBars(),this.stepIndex++,this.showInterim("Выполняется действие…"),setTimeout(()=>this.run(),300)):this.isReplay||(t.preventDefault(),t.stopPropagation())};document.addEventListener("click",l,!0)},sleep:e=>new Promise(t=>setTimeout(t,e)),positionBars(e){if(!e||!this.bars)return;let t=e.getBoundingClientRect(),l=Math.max(0,t.left-6),o=Math.max(0,t.top-6),a=Math.min(window.innerWidth,t.right+6),n=Math.min(window.innerHeight,t.bottom+6);this.bars.t.style.cssText=`top:0;left:0;width:100%;height:${o}px;display:block;`,this.bars.r.style.cssText=`top:${o}px;left:${a}px;width:${Math.max(0,window.innerWidth-a)}px;height:${n-o}px;display:block;`,this.bars.b.style.cssText=`top:${n}px;left:0;width:100%;height:${Math.max(0,window.innerHeight-n)}px;display:block;`,this.bars.l.style.cssText=`top:${o}px;left:0;width:${l}px;height:${n-o}px;display:block;`,this.pulse&&(this.pulse.style.display="block",this.pulse.style.top=o+"px",this.pulse.style.left=l+"px",this.pulse.style.width=a-l+"px",this.pulse.style.height=n-o+"px")},hideBars(){this.stopRefreshLoop(),this._currentTarget=null,this.bars&&Object.values(this.bars).forEach(e=>e.style.display="none"),this.pulse&&(this.pulse.style.display="none"),this.tooltip&&(this.tooltip.style.display="none")},startRefreshLoop(){this._refreshInterval&&clearInterval(this._refreshInterval),this._refreshInterval=setInterval(()=>{this._currentTarget&&document.contains(this._currentTarget)&&this.positionBars(this._currentTarget)},150)},stopRefreshLoop(){this._refreshInterval&&(clearInterval(this._refreshInterval),this._refreshInterval=null)},showInterim(e){this.tooltip&&(this.tooltip.className="onboarding-tooltip",this.tooltip.style.cssText="position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); background: white; border-radius: 14px; padding: 20px 24px; box-shadow: 0 10px 40px rgba(0,0,0,0.25); z-index: 250;",this.tooltip.innerHTML=`<div class="onboarding-tooltip__text">${e}</div>`,this.tooltip.style.display="block")},showFixedTooltip(e){if(!this.tooltip)return;this.tooltip.className="onboarding-tooltip",this.tooltip.style.cssText="position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); background: white; border-radius: 14px; padding: 20px 24px; box-shadow: 0 10px 40px rgba(0,0,0,0.25); z-index: 250;";let t=`<div class="onboarding-tooltip__text">${e}</div>`;this.isReplay&&(t+='<button class="onboarding-tooltip__close" style="position:absolute;top:6px;right:8px;background:none;border:none;font-size:22px;cursor:pointer;">&times;</button>'),this.tooltip.innerHTML=t,this.tooltip.style.display="block",this.isReplay&&this.tooltip.querySelector(".onboarding-tooltip__close").addEventListener("click",()=>this.destroy())},showTopTooltip(e){if(!this.tooltip)return;this.tooltip.className="onboarding-tooltip",this.tooltip.style.cssText="position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: white; border-radius: 14px; padding: 20px 24px; box-shadow: 0 10px 40px rgba(0,0,0,0.25); z-index: 250;";let t=`<div class="onboarding-tooltip__text">${e}</div>`;this.isReplay&&(t+='<button class="onboarding-tooltip__close" style="position:absolute;top:6px;right:8px;background:none;border:none;font-size:22px;cursor:pointer;">&times;</button>'),this.tooltip.innerHTML=t,this.tooltip.style.display="block",this.isReplay&&this.tooltip.querySelector(".onboarding-tooltip__close").addEventListener("click",()=>this.destroy())},showCenter(e){if(!this.tooltip)return;this.tooltip.className="onboarding-tooltip onboarding-tooltip--center",this.tooltip.style.cssText="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; border-radius: 14px; padding: 20px 24px; box-shadow: 0 10px 40px rgba(0,0,0,0.25); z-index: 250;";let t=`<div class="onboarding-tooltip__text">${e.text}</div>`;t+='<div class="onboarding-tooltip__actions">',e.btn&&(t+=`<button class="onboarding-tooltip__btn" style="background: #0D7C3D; color: white; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer;">${e.btn}</button>`),e.allowSkip&&(t+=`<button class="onboarding-tooltip__btn onboarding-tooltip__btn--secondary" style="margin-left:10px; background: #F3F4F6; border:1px solid #E5E7EB; color: #1F2937; padding: 10px 20px; border-radius: 10px; cursor:pointer;">Пропустить обучение</button>`),t+="</div>",this.isReplay&&(t+='<button class="onboarding-tooltip__close" style="position:absolute;top:6px;right:8px;background:none;border:none;font-size:22px;cursor:pointer;">&times;</button>'),this.tooltip.innerHTML=t,this.tooltip.style.display="block",e.btn&&this.tooltip.querySelector(".onboarding-tooltip__btn").addEventListener("click",()=>{"finish"===e.id?this.finish():(this.stepIndex++,this.run())}),e.allowSkip&&this.tooltip.querySelector(".onboarding-tooltip__btn--secondary").addEventListener("click",()=>this.skip()),this.isReplay&&this.tooltip.querySelector(".onboarding-tooltip__close").addEventListener("click",()=>this.destroy())},skip(){fetch("complete_onboarding.php",{method:"POST",headers:{"X-Requested-With":"XMLHttpRequest"}}).then(e=>e.json()).then(e=>{if(e.success){window.__ONBOARDING_COMPLETED__=!0;let t=document.getElementById("onboardingReplayBtn");t&&(t.style.display="")}}).catch(()=>{}),this.destroy()},finish(){this.isReplay||fetch("complete_onboarding.php",{method:"POST",headers:{"X-Requested-With":"XMLHttpRequest"}}).then(e=>e.json()).then(e=>{if(e.success){window.__ONBOARDING_COMPLETED__=!0;let t=document.getElementById("onboardingReplayBtn");t&&(t.style.display="")}}).catch(()=>{}),this.destroy()},waitFor:(e,t=1e4)=>new Promise(l=>{let o=e();if(o){l(o);return}let a=new MutationObserver(()=>{let t=e();t&&(a.disconnect(),l(t))});a.observe(document.body,{childList:!0,subtree:!0}),setTimeout(()=>{a.disconnect(),l(null)},t)}),waitForModalClose:(e=3e4)=>new Promise(t=>{let l=0,o=Date.now(),a=()=>{if(Date.now()-o>e){t();return}let n=document.querySelector(".modal-overlay.active");if(n)l=0;else if(++l>=3){t();return}setTimeout(a,200)};a()})};function openRescheduleModal(e,t,l,o,a,n,s){let i=document.createElement("div");i.className="modal-overlay active",i.innerHTML=`
        <div class="modal">
            <button class="modal__close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            <h3>Перенос урока</h3>
            <div class="form-group">
                <label class="form-label">Новая дата</label>
                <input type="date" id="rescheduleDate" class="form-input" value="${t}">
            </div>
            <div class="form-group">
                <label class="form-label">Новое время</label>
                <input type="time" id="rescheduleTime" class="form-input" value="${l}">
            </div>
            <button class="btn btn--primary" onclick="submitReschedule(${e}, ${o}, '${a}', ${n}, ${s})">Перенести</button>
        </div>`,document.body.appendChild(i)}function submitReschedule(e,t,l,o,a){let n=document.getElementById("rescheduleDate").value,s=document.getElementById("rescheduleTime").value;if(!n||!s)return alert("Укажите дату и время");fetch("reschedule_lesson.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`id=${e}&new_date=${encodeURIComponent(n)}&new_time=${encodeURIComponent(s)}&teacher_timezone=${TEACHER_TIMEZONE}`}).then(e=>e.json()).then(e=>{if(e.success){document.querySelector(".modal-overlay").remove();let[o,a]=n.split("-").map(Number);renderCalendar(t,l,o,a)}else alert(e.error||"Ошибка переноса")}).catch(()=>alert("Ошибка сети"))}"loading"===document.readyState?document.addEventListener("DOMContentLoaded",()=>Onboarding.init()):Onboarding.init();let selectedLessonStudents=[],currentPaymentStatuses={};function openStudentPickerModal(){fetch("get_students.php").then(e=>e.json()).then(e=>{if(!Array.isArray(e))return;let t=selectedLessonStudents.map(e=>e.id),l="";e.forEach(e=>{let o=t.includes(e.id)?"checked":"",a=`${e.first_name} ${e.last_name||""}`.trim();l+=`<label><input type="checkbox" value="${e.id}" ${o}> ${a}</label><br>`});let o=document.createElement("div");o.className="modal-overlay active",o.innerHTML=`
                <div class="modal">
                    <button class="modal__close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                    <h3>Выберите учеников</h3>
                    <div>${l}</div>
                    <button class="btn btn--primary" onclick="confirmStudentPicker(this)">Готово</button>
                </div>`,document.body.appendChild(o)})}function confirmStudentPicker(e){let t=e.closest(".modal-overlay");if(!t)return;let l=t.querySelectorAll("input[type=checkbox]:checked"),o={};l.forEach(e=>{let t=parseInt(e.value),l=e.closest("label").textContent.trim();o[t]=l});let a=selectedLessonStudents[0];a&&!o[a.id]&&(o[a.id]=a.name),selectedLessonStudents=Object.keys(o).map(e=>({id:parseInt(e),name:o[e]})),t.remove();let n=document.getElementById("selectedStudentsContainer");n&&(n.innerHTML=renderSelectedStudentsTags())}
function renderStudents(){fetch("get_students.php").then(e=>e.json()).then(e=>{let t="";if(!Array.isArray(e)||0===e.length){t='<div class="empty-state"><div class="empty-icon">\uD83D\uDC65</div><h3>Нет учеников</h3><p>Нажмите \xabДобавить ученика\xbb, чтобы создать первого</p></div>',setMainContent(t+='<div style="text-align:center; margin-top:16px;"><button class="btn-add" onclick="openAddStudentModal()">+ Добавить ученика</button></div>');return}let o="";e.forEach(e=>{o+=`
                    <tr style="cursor:pointer;" onclick="openCalendar(${e.id}, '${e.first_name} ${e.last_name||""}')">
                        <td>${e.first_name}</td>
                        <td>${e.last_name||""}</td>
                        <td>${e.subject||""}</td>
                        <td>${e.login}</td>
                        <td>
                            <button class="btn-icon" onclick="event.stopPropagation(); openEditStudentModal(${e.id}, '${e.first_name}', '${e.last_name||""}', '${e.subject||""}')">✏️</button>
                            <button class="btn-icon" onclick="event.stopPropagation(); deleteStudent(${e.id}, '${e.first_name}')">🗑️</button>
                        </td>
                    </tr>`}),setMainContent(t=`
                <div class="dashboard-header">
                    <h2>Ученики</h2>
                    <button class="btn-add" onclick="openAddStudentModal()">+ Добавить ученика</button>
                </div>
                <div class="table-responsive">
                    <table>
                        <thead><tr><th>Имя</th><th>Фамилия</th><th>Предмет</th><th>Логин</th><th></th></tr></thead>
                        <tbody>${o}</tbody>
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
                </div>`)}).catch(()=>showEmptyState("\uD83D\uDCDD","Домашние задания","Добавьте учеников, чтобы назначать задания"))}function openHomeworkStudent(e,t){Promise.all([fetch(`get_homework_categories.php?student_id=${e}`).then(e=>e.json()),fetch(`get_homework_blocks.php?student_id=${e}&category_id=all`).then(e=>e.json()),fetch(`get_homeworks.php?student_id=${e}`).then(e=>e.json())]).then(([o,l,a])=>{window.currentHomeworkData={studentId:e,studentName:t,categories:o,blocks:l,homeworks:a};let n=window.lastHomeworkCategoryId;n&&o.some(e=>e.id==n)?renderHomeworkTabs(n):renderHomeworkTabs()})}function renderHomeworkTabs(e=null){window.lastHomeworkCategoryId=e;let{studentId:t,studentName:o,categories:l,blocks:a,homeworks:n}=window.currentHomeworkData,s="";l.forEach(t=>{let o=e==t.id?"active":"";s+=`<button class="schedule-mode-btn ${o}" onclick="renderHomeworkTabs(${t.id})">📁 ${t.name}</button>`});let i=`<button class="btn-back" onclick="renderHomeworkList()">← Назад к списку учеников</button>`;i+=`<div class="dashboard-header">
        <h2>Задания: ${o}</h2>
        <div style="display:flex; gap:8px;">
            <button class="btn-add" onclick="openAddHomeworkCategoryModal(${t}, '${o.replace(/'/g,"\\'")}')">+ Категория</button>
            <button class="btn-add" onclick="openAddHomeworkBlockModal(${t}, '${o.replace(/'/g,"\\'")}', ${e||"null"})">+ Блок</button>
            <button class="btn-add" onclick="openAddHomeworkModal(${t}, '${o.replace(/'/g,"\\'")}', null, ${e||"null"})">+ Задание</button>
        </div>
    </div>
    <div class="schedule-mode-switcher" style="margin-bottom:20px;">${s=`
        <button class="schedule-mode-btn ${null===e?"active":""}" onclick="renderHomeworkTabs(null)">📁 Все</button>
        <button class="schedule-mode-btn ${"none"===e?"active":""}" onclick="renderHomeworkTabs('none')">📁 Без категории</button>
        ${s}
    `}</div>`;let r=a;null!==e&&"all"!==e&&(r="none"===e?a.filter(e=>null===e.category_id):a.filter(t=>t.category_id==e));let d={},c=[];n.forEach(e=>{if(e.block_id){let t=r.some(t=>t.id==e.block_id);t?(d[e.block_id]||(d[e.block_id]=[]),d[e.block_id].push(e)):c.push(e)}else c.push(e)});let p="";r.forEach(l=>{let a=d[l.id]||[];p+=renderBlockCard(l,a,t,o,e)}),i+=`<div id="homeworkBlocksContainer" class="homework-blocks-container" data-student="${t}">${p}</div>`,(null===e||"none"===e)&&c.length>0&&(i+=renderUngroupedCard(c,t,o,e)),0===r.length&&(null!==e&&"none"!==e||0===c.length)&&(i+='<div class="empty-state"><div class="empty-icon">\uD83D\uDCDD</div><h3>Нет заданий в этой категории</h3></div>'),setMainContent(i),r.length>0&&initHomeworkDragDrop(t)}function renderBlockCard(e,t,o,l,a=null){let n="";return t.forEach(e=>n+=renderHomeworkRow(e,o,l)),`
        <div class="homework-block" data-block-id="${e.id}">
            <div class="homework-block__header">
                <h3 class="homework-block__title">${e.name}</h3>
                <div class="homework-block__actions">
                    <button class="btn-icon" onclick="openHomeworkEditBlockModal(${e.id}, '${e.name.replace(/'/g,"\\'")}', ${o}, '${l.replace(/'/g,"\\'")}')">✏️</button>
                    <button class="btn-icon" onclick="deleteHomeworkBlock(${e.id}, ${o}, '${l.replace(/'/g,"\\'")}')">🗑️</button>
                    <button class="btn-add" onclick="openAddHomeworkModal(${o}, '${l.replace(/'/g,"\\'")}', ${e.id}, ${a||"null"})">+ Задание</button>
                </div>
            </div>
            ${t.length?`
                <div class="table-responsive">
                    <table>
                        <thead><tr><th>Название</th><th>Текст</th><th>Статус</th><th>Ссылки</th><th></th></tr></thead>
                        <tbody>${n}</tbody>
                    </table>
                </div>`:'<p class="block-empty-text">Нет заданий</p>'}
        </div>`}function renderUngroupedCard(e,t,o,l=null){let a="";return e.forEach(e=>a+=renderHomeworkRow(e,t,o)),`
        <div class="homework-block">
            <div class="homework-block__header">
                <h3 class="homework-block__title">Без блока</h3>
                <button class="btn-add" onclick="openAddHomeworkModal(${t}, '${o.replace(/'/g,"\\'")}', null, ${l||"null"})">+ Задание</button>
            </div>
            ${e.length?`
                <div class="table-responsive">
                    <table>
                        <thead><tr><th>Название</th><th>Текст</th><th>Статус</th><th>Ссылки</th><th></th></tr></thead>
                        <tbody>${a}</tbody>
                    </table>
                </div>`:""}
        </div>`}function renderHomeworkRow(e,t,o){let l="Выполнено"===e.status?"badge--success":"badge--danger",a="";if(e.links)try{let n=JSON.parse(e.links);a=n.map(e=>`<a href="${e}" target="_blank">Ссылка</a>`).join(", ")}catch(s){}return`
        <tr>
            <td>${e.title}</td>
            <td>${e.text||""}</td>
            <td><span class="badge ${l}" onclick="changeHomeworkStatus(${e.id}, ${t}, '${o.replace(/'/g,"\\'")}')" style="cursor:pointer;">${e.status}</span></td>
            <td>${a}</td>
            <td>
                <button class="btn-icon" onclick="editHomework(${e.id}, ${t}, '${o.replace(/'/g,"\\'")}')">✏️</button>
                <button class="btn-icon" onclick="deleteHomework(${e.id}, ${t}, '${o.replace(/'/g,"\\'")}')">🗑️</button>
            </td>
        </tr>`}function changeHomeworkStatus(e,t,o){let l=event.target.closest(".badge");l&&fetch(`get_homeworks.php?student_id=${t}`).then(e=>e.json()).then(t=>{let o=t.find(t=>t.id==e);if(!o)return;let a="Выполнено"===o.status?"Не выполнено":"Выполнено";fetch("update_homework.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`id=${e}&status=${a}`}).then(e=>e.json()).then(e=>{e.success?(l.textContent=a,l.className=`badge ${"Выполнено"===a?"badge--success":"badge--danger"}`):alert("Ошибка: "+e.error)})})}function openHomeworkBlockModal(e,t){let o=document.createElement("div");o.className="modal-overlay active",o.innerHTML=`
        <div class="modal">
            <button class="modal__close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            <h3>Новый блок заданий</h3>
            <div class="form-group"><label class="form-label">Название блока</label><input type="text" id="blockName" class="form-input"></div>
            <button class="btn btn--primary" onclick="addHomeworkBlock(${e}, '${t.replace(/'/g,"\\'")}')">Создать</button>
        </div>`,document.body.appendChild(o)}function addHomework(e,t){let o=document.querySelector(".modal-overlay.active .modal");if(!o)return;let l=o.querySelector("#hwBlock")?.value||"",a=o.querySelector("#hwCategory")?.value||"",n=o.querySelector("#hwTitle")?.value.trim()||"",s=o.querySelector("#hwText")?.value.trim()||"",i=o.querySelector("#hwLinks")?.value.trim()||"";if(!n)return alert("Название обязательно");fetch("add_homework.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`student_id=${e}&block_id=${l}&title=${encodeURIComponent(n)}&text=${encodeURIComponent(s)}&links=${encodeURIComponent(i)}&category_id=${a}`}).then(e=>e.json()).then(l=>{if(l.success){let a=o.closest(".modal-overlay");a&&a.remove(),openHomeworkStudent(e,t)}else alert(l.error)})}function openHomeworkEditBlockModal(e,t,o,l){let a=document.createElement("div");a.className="modal-overlay active",a.innerHTML=`
        <div class="modal">
            <button class="modal__close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            <h3>Переименовать блок</h3>
            <div class="form-group"><label class="form-label">Название</label><input type="text" id="blockName" class="form-input" value="${t}"></div>
            <button class="btn btn--primary" onclick="editHomeworkBlock(${e}, ${o}, '${l.replace(/'/g,"\\'")}')">Сохранить</button>
        </div>`,document.body.appendChild(a)}function editHomeworkBlock(e,t,o){let l=document.getElementById("blockName").value.trim();if(!l)return alert("Введите название");fetch("update_homework_block.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`id=${e}&name=${encodeURIComponent(l)}`}).then(e=>e.json()).then(e=>{e.success?(document.querySelector(".modal-overlay").remove(),openHomeworkStudent(t,o)):alert(e.error)})}function deleteHomeworkBlock(e,t,o){confirm("Удалить блок? Задания останутся, но переместятся в \xabБез блока\xbb.")&&fetch("delete_homework_block.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`id=${e}`}).then(e=>e.json()).then(e=>{e.success?openHomeworkStudent(t,o):alert(e.error)})}function openAddHomeworkModal(e,t,o=null,l=null){Promise.all([fetch(`get_homework_blocks.php?student_id=${e}&category_id=all`).then(e=>e.json()),fetch(`get_homework_categories.php?student_id=${e}`).then(e=>e.json())]).then(([a,n])=>{let s='<option value="">Без блока</option>';a.forEach(e=>{s+=`<option value="${e.id}" ${e.id==o?"selected":""}>${e.name}</option>`});let i='<option value="">Без категории</option>';n.forEach(e=>{i+=`<option value="${e.id}" ${e.id==l?"selected":""}>${e.name}</option>`});let r=document.createElement("div");r.className="modal-overlay active",r.innerHTML=`
            <div class="modal">
                <button class="modal__close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                <h3>Добавить задание для ${t}</h3>
                <div class="form-group"><label class="form-label">Категория</label><select id="hwCategory" class="form-select">${i}</select></div>
                <div class="form-group"><label class="form-label">Блок</label><select id="hwBlock" class="form-select">${s}</select></div>
                <div class="form-group"><label class="form-label">Название</label><input type="text" id="hwTitle" class="form-input"></div>
                <div class="form-group"><label class="form-label">Текст</label><textarea id="hwText" class="form-input" rows="3"></textarea></div>
                <div class="form-group"><label class="form-label">Ссылки (каждая с новой строки)</label><textarea id="hwLinks" class="form-input" rows="3"></textarea></div>
                <button class="btn btn--primary" onclick="addHomework(${e}, '${t.replace(/'/g,"\\'")}')">Сохранить</button>
            </div>`,document.body.appendChild(r)})}function editHomework(e,t,o){Promise.all([fetch(`get_homeworks.php?student_id=${t}`).then(e=>e.json()),fetch(`get_homework_blocks.php?student_id=${t}&category_id=all`).then(e=>e.json()),fetch(`get_homework_categories.php?student_id=${t}`).then(e=>e.json())]).then(([l,a,n])=>{let s=l.find(t=>t.id==e);if(!s)return;let i=s.links?JSON.parse(s.links).join("\n"):"",r='<option value="">Без блока</option>';a.forEach(e=>{r+=`<option value="${e.id}" ${e.id==s.block_id?"selected":""}>${e.name}</option>`});let d='<option value="">Без категории</option>';n.forEach(e=>{let t=a.find(e=>e.id==s.block_id),o=t&&t.category_id==e.id?"selected":"";d+=`<option value="${e.id}" ${o}>${e.name}</option>`});let c=document.createElement("div");c.className="modal-overlay active",c.innerHTML=`
            <div class="modal">
                <button class="modal__close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                <h3>Редактировать задание</h3>
                <div class="form-group"><label class="form-label">Категория</label><select id="hwCategory" class="form-select">${d}</select></div>
                <div class="form-group"><label class="form-label">Блок</label><select id="hwBlock" class="form-select">${r}</select></div>
                <div class="form-group"><label class="form-label">Название</label><input type="text" id="hwTitle" class="form-input" value="${s.title}"></div>
                <div class="form-group"><label class="form-label">Текст</label><textarea id="hwText" class="form-input" rows="3">${s.text||""}</textarea></div>
                <div class="form-group"><label class="form-label">Ссылки (каждая с новой строки)</label><textarea id="hwLinks" class="form-input" rows="3">${i}</textarea></div>
                <button class="btn btn--primary" onclick="updateHomework(${e}, ${t}, '${o.replace(/'/g,"\\'")}')">Сохранить</button>
            </div>`,document.body.appendChild(c)})}function updateHomework(e,t,o){let l=document.getElementById("hwBlock").value,a=document.getElementById("hwTitle").value.trim(),n=document.getElementById("hwText").value.trim(),s=document.getElementById("hwLinks").value.trim();if(!a)return alert("Название обязательно");fetch("update_homework.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`id=${e}&block_id=${l}&title=${encodeURIComponent(a)}&text=${encodeURIComponent(n)}&links=${encodeURIComponent(s)}`}).then(e=>e.json()).then(e=>{e.success?(document.querySelector(".modal-overlay").remove(),openHomeworkStudent(t,o)):alert(e.error)})}function toggleHomeworkStatus(e,t,o){let l=event.target.closest(".badge");l&&fetch(`get_homeworks.php?student_id=${t}`).then(e=>e.json()).then(t=>{let o=t.find(t=>t.id==e);if(!o)return;let a="Выполнено"===o.status?"Не выполнено":"Выполнено",n=o.links?JSON.parse(o.links).join("\n"):"";fetch("update_homework.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`id=${e}&block_id=${o.block_id||""}&title=${encodeURIComponent(o.title)}&text=${encodeURIComponent(o.text||"")}&links=${encodeURIComponent(n)}&status=${a}`}).then(e=>e.json()).then(e=>{e.success?(l.textContent=a,l.className=`badge ${"Выполнено"===a?"badge--success":"badge--danger"}`):alert("Ошибка: "+e.error)})})}function deleteHomework(e,t,o){confirm("Удалить задание?")&&fetch("delete_homework.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`id=${e}`}).then(e=>e.json()).then(e=>e.success?openHomeworkStudent(t,o):alert(e.error))}function initHomeworkDragDrop(e){let t=document.getElementById("homeworkBlocksContainer");if(!t)return;let o=t.querySelectorAll(".homework-block");o.forEach(e=>{e.setAttribute("draggable",!0),e.addEventListener("dragstart",handleDragStart),e.addEventListener("dragend",handleDragEnd)}),t.addEventListener("dragover",handleDragOver),t.addEventListener("drop",handleDrop)}document.addEventListener("DOMContentLoaded",()=>{let e=document.getElementById("hamburger"),t=document.getElementById("sidebar");e.addEventListener("click",()=>t.classList.toggle("open")),t.addEventListener("click",e=>{let o=e.target.closest(".sidebar__link");if(!o)return;let l=o.getAttribute("data-tab");if(l){if(e.preventDefault(),document.querySelectorAll(".sidebar__link").forEach(e=>e.classList.remove("active")),o.classList.add("active"),l.startsWith("custom_")){let a=l.replace("custom_",""),n=o.textContent.replace(/^📌\s*/,"").trim();renderCustomBlock(a,n),window.innerWidth<768&&t.classList.remove("open");return}switch(l){case"schedule":renderTeacherSchedule();break;case"students":renderStudents();break;case"homeworks":renderHomeworkList();break;case"library":renderLibrary();break;case"lectures":renderBlocks("lecture");break;case"help":renderHelp();break;case"add-custom-block":openAddCustomBlockModal();break;case"intensive":case"course2":setMainContent('<div class="empty-state"><div class="empty-icon">\uD83D\uDEA7</div><h3>В разработке</h3></div>')}window.innerWidth<768&&t.classList.remove("open")}}),renderStudents(),loadCustomBlocks(),applyHiddenSections(),showBetaNotice(),setInterval(()=>{fetch("check_access.php").then(e=>e.json()).then(e=>{e.active||(document.cookie="remember_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;",window.location.href="index.php?error=expired")}).catch(()=>{})},6e4),document.getElementById("mainContent").addEventListener("click",()=>{window.innerWidth<768&&t.classList.contains("open")&&t.classList.remove("open")})});let draggedHomeworkBlock=null;function handleDragStart(e){(draggedHomeworkBlock=e.target.closest(".homework-block"))&&(e.dataTransfer.effectAllowed="move",draggedHomeworkBlock.classList.add("dragging"))}function handleDragEnd(e){let t=e.target.closest(".homework-block");t&&t.classList.remove("dragging"),draggedHomeworkBlock=null}function handleDragOver(e){e.preventDefault(),e.dataTransfer.dropEffect="move"}function handleDrop(e){e.preventDefault();let t=document.getElementById("homeworkBlocksContainer");if(!t||!draggedHomeworkBlock)return;let o=document.elementFromPoint(e.clientX,e.clientY),l=o?o.closest(".homework-block"):null;if(!l||l===draggedHomeworkBlock)return;let a=l.getBoundingClientRect(),n=a.top+a.height/2;e.clientY<n?t.insertBefore(draggedHomeworkBlock,l):t.insertBefore(draggedHomeworkBlock,l.nextSibling);let s=[];t.querySelectorAll(".homework-block").forEach(e=>{let t=e.querySelector('[onclick*="openHomeworkEditBlockModal"]');if(t){let o=t.getAttribute("onclick").match(/openHomeworkEditBlockModal\((\d+)/);o&&s.push(o[1])}}),reorderHomeworkBlocks(s,t.dataset.student)}function reorderHomeworkBlocks(e,t){fetch("reorder_homework_blocks.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`student_id=${t}&order=${encodeURIComponent(JSON.stringify(e))}`}).then(e=>e.json()).then(e=>{e.success||alert("Ошибка при сохранении порядка")})}function renderLibrary(){if("basic"===CURRENT_PLAN){setMainContent(`<div class="empty-state"><div class="empty-icon">🔒</div><h3>Доступно в Профессиональном тарифе</h3><p><a href="contact.html">Повысить тариф</a></p></div>`);return}Promise.all([fetch("get_library_sections.php").then(e=>e.json()),fetch("get_library_tasks.php").then(e=>e.json())]).then(([e,t])=>{let o=[];t.sections&&t.sections.forEach(e=>{e.blocks&&e.blocks.forEach(t=>{t.section_id=e.id,o.push(t)})}),t.ungrouped_blocks&&(o=o.concat(t.ungrouped_blocks)),window.libraryData={sections:t.sections,blocks:o};let l="";e.forEach(e=>{l+=`<button class="schedule-mode-btn" onclick="filterLibraryBlocks(${e.id})">📁 ${e.name}</button>`});let a=`
            <div class="dashboard-header">
                <h2>Библиотека заданий</h2>
                <div style="display:flex; gap:8px;">
                    <button class="btn-add" onclick="openAddLibrarySectionModal()">+ Раздел</button>
                    <button class="btn-add" onclick="openAddLibraryBlockModal()">+ Блок</button>
                </div>
            </div>
            <div class="schedule-mode-switcher" style="margin-bottom:20px;">
                <button class="schedule-mode-btn active" onclick="filterLibraryBlocks(null)">📁 Все</button>
                <button class="schedule-mode-btn" onclick="filterLibraryBlocks('none')">📁 Без раздела</button>
                ${l}
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
                    <div class="blocks-grid">`;let t=o.filter(t=>t.section_id==e.id);t.forEach(e=>{a+=renderLibraryBlockCard(e)}),a+="</div></div>"});let n=o.filter(e=>!e.section_id);a+=`
            <div class="library-section" data-section-id="none">
                <div class="library-section__header">
                    <h3 class="library-section__title">Без раздела</h3>
                </div>
                <div class="blocks-grid">`,n.forEach(e=>a+=renderLibraryBlockCard(e)),a+="</div></div>";let s=t.ungrouped_tasks||[];s.length>0&&(a+='<h3 style="margin-top:24px;">Задания без блока</h3><div class="blocks-grid">',s.forEach(e=>a+=renderLibraryTaskCard(e,null)),a+="</div>"),setMainContent(a),initLibraryDragDrop(),window.currentLibrarySectionId&&filterLibraryBlocks(window.currentLibrarySectionId)})}function filterLibraryBlocks(e=null){window.currentLibrarySectionId=e,document.querySelectorAll(".library-section").forEach(t=>{let o=t.dataset.sectionId;null===e||"all"===e?t.style.display="":o===String(e)?t.style.display="":t.style.display="none"}),document.querySelectorAll(".schedule-mode-btn").forEach(e=>e.classList.remove("active"));let t;(t=null===e?document.querySelector('.schedule-mode-btn[onclick="filterLibraryBlocks(null)"]'):"none"===e?document.querySelector(".schedule-mode-btn[onclick=\"filterLibraryBlocks('none')\"]"):document.querySelector(`.schedule-mode-btn[onclick="filterLibraryBlocks(${e})"]`))&&t.classList.add("active")}function buildLibrarySections(e,t){let o=document.getElementById("librarySectionsContainer");if(!o)return;let l="";e.forEach(e=>{t.filter(t=>t.section_id==e.id),l+=`
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
            </div>`});let a=t.filter(e=>!e.section_id);if(a.length>0&&(l+=`<h3 style="margin-top:24px;">Блоки без раздела</h3>
                 <div class="blocks-grid" id="sectionBlocks-none"></div>`),o.innerHTML=l,e.forEach(e=>{let o=t.filter(t=>t.section_id==e.id),l=document.getElementById(`sectionBlocks-${e.id}`);l&&(l.innerHTML=o.map(e=>renderLibraryBlockCard(e)).join(""))}),a.length>0){let n=document.getElementById("sectionBlocks-none");n&&(n.innerHTML=a.map(e=>renderLibraryBlockCard(e)).join(""))}}function renderLibraryTabs(e=null){window.currentLibrarySectionId=e;let{sections:t,blocks:o}=window.libraryData,l="";t.forEach(t=>{let o=e==t.id?"active":"";l+=`<button class="schedule-mode-btn ${o}" onclick="renderLibraryTabs(${t.id})">📁 ${t.name}</button>`});let a=`
        <div class="dashboard-header">
            <h2>Библиотека заданий</h2>
            <div style="display:flex; gap:8px;">
                <button class="btn-add" onclick="openAddLibrarySectionModal()">+ Раздел</button>
                <button class="btn-add" onclick="openAddLibraryBlockModal(${e||"null"})">+ Блок</button>
            </div>
        </div>
        <div class="schedule-mode-switcher" style="margin-bottom:20px;">${l=`
        <button class="schedule-mode-btn ${null===e?"active":""}" onclick="renderLibraryTabs(null)">📁 Все</button>
        <button class="schedule-mode-btn ${"none"===e?"active":""}" onclick="renderLibraryTabs('none')">📁 Без раздела</button>
        ${l}
    `}</div>`,n=o;null!==e&&"all"!==e&&(n="none"===e?o.filter(e=>null===e.section_id||void 0===e.section_id):o.filter(t=>t.section_id==e)),0===n.length?a+='<div class="empty-state"><div class="empty-icon">\uD83D\uDCD6</div><h3>Нет блоков</h3></div>':(a+=`<div class="blocks-grid" id="libraryBlocksContainer" data-section-id="${e||""}">`,n.forEach(e=>{a+=renderLibraryBlockCard(e)}),a+="</div>"),setMainContent(a),initLibraryDragDrop()}let currentLibrarySectionId=null;function renderLibraryBlockCard(e){return`
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
        </div>`}function openLibraryBlockView(e,t){fetch("get_library_tasks.php").then(e=>e.json()).then(o=>{let l=[];o.sections&&o.sections.forEach(e=>{e.blocks&&e.blocks.forEach(t=>{t.section_id=e.id,l.push(t)})}),o.ungrouped_blocks&&(l=l.concat(o.ungrouped_blocks));let a=l.find(t=>t.id==e);a?window.lastLibrarySectionId=a.section_id||null:window.lastLibrarySectionId=null;let n=a&&a.tasks||[],s=`
                <button class="btn-back" onclick="renderLibrary()">← Назад к библиотеке</button>
                <div class="dashboard-header">
                    <h2>${t}</h2>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <button class="btn-add" onclick="openAddLibraryTaskModal(${e})">+ Добавить задание</button>
                        <button class="btn-add" onclick="assignLibraryBlockModal(${e})">Назначить блок</button>
                    </div>
                </div>`;n.length?s+='<div class="blocks-grid library-tasks-grid" data-block-id="'+e+'">'+n.map(e=>renderLibraryTaskCard(e)).join("")+"</div>":s+='<div class="empty-state"><div class="empty-icon">\uD83D\uDCC4</div><h3>Нет заданий</h3></div>',setMainContent(s),n.length>0&&initLibraryTasksDragDrop()})}function renderLibraryTaskCard(e,t=null){let o="";if(e.links)try{let l=JSON.parse(e.links);o=l.map(e=>{let t=getRutubeEmbed(e);return t||`<a href="${e}" target="_blank" style="display:inline-block; margin-top:6px;">🔗 Ссылка</a>`}).join("")}catch(a){}return`
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
            ${o}
            <button class="btn-add assign-task-btn" data-section-id="${t||""}">Назначить ученику</button>
        </div>`}function openAddLibraryBlockModal(e=null){fetch("get_library_sections.php").then(e=>e.json()).then(t=>{let o='<option value="">Без раздела</option>';t.forEach(t=>{o+=`<option value="${t.id}" ${t.id==e?"selected":""}>${t.name}</option>`});let l=document.createElement("div");l.className="modal-overlay active",l.innerHTML=`
                <div class="modal">
                    <button class="modal__close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                    <h3>Новый блок в библиотеке</h3>
                    <div class="form-group"><label class="form-label">Название блока</label><input type="text" id="libBlockName" class="form-input"></div>
                    <div class="form-group"><label class="form-label">Раздел</label><select id="libBlockSection" class="form-select">${o}</select></div>
                    <button class="btn btn--primary" onclick="addLibraryBlock()">Создать</button>
                </div>`,document.body.appendChild(l)})}function addLibraryBlock(){let e=document.getElementById("libBlockName").value.trim(),t=document.getElementById("libBlockSection")?.value||"";if(!e)return alert("Введите название");fetch("add_library_block.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`name=${encodeURIComponent(e)}&section_id=${t}`}).then(e=>e.json()).then(e=>{e.success?(e.id&&(window.__lastLibraryBlockId=e.id),document.querySelector(".modal-overlay").remove(),renderLibrary()):alert(e.error)})}function openEditLibraryBlockModal(e,t,o=null){fetch("get_library_sections.php").then(e=>e.json()).then(l=>{let a='<option value="">Без раздела</option>';l.forEach(e=>{let t=e.id==o?" selected":"";a+=`<option value="${e.id}"${t}>${e.name}</option>`});let n=document.createElement("div");n.className="modal-overlay active",n.innerHTML=`
                <div class="modal">
                    <button class="modal__close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                    <h3>Редактировать блок</h3>
                    <div class="form-group"><label class="form-label">Название</label><input type="text" id="libBlockName" class="form-input" value="${t}"></div>
                    <div class="form-group"><label class="form-label">Раздел</label><select id="libBlockSection" class="form-select">${a}</select></div>
                    <button class="btn btn--primary" onclick="editLibraryBlock(${e})">Сохранить</button>
                </div>`,document.body.appendChild(n)})}function refreshLibraryDataAndUI(){Promise.all([fetch("get_library_sections.php").then(e=>e.json()),fetch("get_library_tasks.php").then(e=>e.json())]).then(([e,t])=>{let o=[];t.sections&&t.sections.forEach(e=>{e.blocks&&e.blocks.forEach(t=>{t.section_id=e.id,o.push(t)})}),t.ungrouped_blocks&&(o=o.concat(t.ungrouped_blocks)),window.libraryData={sections:e,blocks:o},document.querySelectorAll(".library-section").forEach(e=>{let t=e.dataset.sectionId,l=o.filter(e=>e.section_id==t),a=e.querySelector(".blocks-grid");a&&(a.innerHTML=l.map(e=>renderLibraryBlockCard(e)).join(""))});let l=o.filter(e=>!e.section_id);document.querySelector("h3 + .blocks-grid");let a=document.querySelectorAll("h3");a.forEach(e=>{if(e.textContent.includes("Блоки без раздела")){let t=e.nextElementSibling;t&&(t.innerHTML=l.map(e=>renderLibraryBlockCard(e)).join(""))}}),filterLibraryBlocks(window.currentLibrarySectionId)})}function editLibraryBlock(e){let t=document.getElementById("libBlockName").value.trim(),o=document.getElementById("libBlockSection")?.value||"";if(!t)return alert("Введите название");fetch("update_library_block.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`id=${e}&name=${encodeURIComponent(t)}&section_id=${o}`}).then(e=>e.json()).then(e=>{e.success?(document.querySelector(".modal-overlay").remove(),refreshLibraryDataAndUI()):alert(e.error)})}function deleteLibraryBlock(e){confirm("Удалить блок? Задания внутри будут перенесены в \xabБез блока\xbb.")&&fetch("delete_library_block.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`id=${e}`}).then(e=>e.json()).then(e=>{e.success?refreshLibraryDataAndUI():alert(e.error)})}function openAddLibrarySectionModal(){let e=document.createElement("div");e.className="modal-overlay active",e.innerHTML=`
        <div class="modal">
            <button class="modal__close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            <h3>Новый раздел</h3>
            <div class="form-group"><label class="form-label">Название раздела</label><input type="text" id="libSectionName" class="form-input"></div>
            <button class="btn btn--primary" onclick="addLibrarySection()">Создать</button>
        </div>`,document.body.appendChild(e)}function addLibrarySection(){let e=document.getElementById("libSectionName").value.trim();if(!e)return alert("Введите название");fetch("add_library_section.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`name=${encodeURIComponent(e)}`}).then(e=>e.json()).then(e=>{e.success?(e.id&&(window.__lastLibrarySectionId=e.id),document.querySelector(".modal-overlay").remove(),renderLibrary()):alert(e.error)})}function openEditLibrarySectionModal(e,t){let o=document.createElement("div");o.className="modal-overlay active",o.innerHTML=`
        <div class="modal">
            <button class="modal__close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            <h3>Переименовать раздел</h3>
            <div class="form-group"><label class="form-label">Название</label><input type="text" id="libSectionName" class="form-input" value="${t}"></div>
            <button class="btn btn--primary" onclick="updateLibrarySection(${e})">Сохранить</button>
        </div>`,document.body.appendChild(o)}function updateLibrarySection(e){let t=document.getElementById("libSectionName").value.trim();if(!t)return alert("Введите название");fetch("update_library_section.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`id=${e}&name=${encodeURIComponent(t)}`}).then(e=>e.json()).then(e=>{e.success?(document.querySelector(".modal-overlay").remove(),refreshLibraryDataAndUI()):alert(e.error)})}function deleteLibrarySection(e){confirm("Удалить раздел? Блоки внутри станут без раздела.")&&fetch("delete_library_section.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`id=${e}`}).then(e=>e.json()).then(e=>{e.success?refreshLibraryDataAndUI():alert(e.error)})}function openEditLibraryTaskModal(e,t,o,l,a=null,n=""){fetch("get_library_blocks.php").then(e=>{if(!e.ok)throw Error("Ошибка сервера");return e.json()}).then(s=>{if(!Array.isArray(s))throw Error("Неверный формат данных");let i='<option value="">Без блока</option>';s.forEach(e=>{let t=e.id==a?" selected":"";i+=`<option value="${e.id}"${t}>${e.name}</option>`});let r=l;try{let d=JSON.parse(l);Array.isArray(d)&&(r=d.join("\n"))}catch(c){}let p=document.createElement("div");p.className="modal-overlay active",p.innerHTML=`
                <div class="modal">
                    <button class="modal__close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                    <h3>Редактировать задание</h3>
                    <div class="form-group"><label class="form-label">Блок</label><select id="libBlockSelect" class="form-select">${i}</select></div>
                    <div class="form-group"><label class="form-label">Название</label><input type="text" id="libTitle" class="form-input" value="${t}"></div>
                    <div class="form-group"><label class="form-label">Текст</label><textarea id="libText" class="form-input" rows="4">${o}</textarea></div>
                    <div class="form-group"><label class="form-label">Ссылки (каждая с новой строки)</label><textarea id="libLinks" class="form-input" rows="3">${r}</textarea></div>
                    <button class="btn btn--primary" onclick="updateLibraryTask(${e}, ${a||"null"}, '${n.replace(/'/g,"\\'")}')">Сохранить</button>
                </div>`,document.body.appendChild(p)}).catch(e=>{console.error("Ошибка загрузки блоков:",e),alert("Не удалось загрузить список блоков. Попробуйте позже.")})}function addLibraryTask(e=null,t=""){let o=document.getElementById("libBlockSelect").value,l=document.getElementById("libTitle").value.trim(),a=document.getElementById("libText").value.trim(),n=document.getElementById("libLinks").value.trim();if(!l)return alert("Название обязательно");fetch("add_library_task.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`block_id=${o}&title=${encodeURIComponent(l)}&text=${encodeURIComponent(a)}&links=${encodeURIComponent(n)}`}).then(e=>e.json()).then(o=>{o.success?(document.querySelector(".modal-overlay").remove(),e&&"null"!==e?openLibraryBlockView(e,t):renderLibrary()):alert(o.error)})}function openAddLibraryTaskModal(e=null,t=""){fetch("get_library_blocks.php").then(e=>e.json()).then(o=>{let l='<option value="">Без блока</option>';o.forEach(t=>{l+=`<option value="${t.id}" ${t.id==e?"selected":""}>${t.name}</option>`});let a=document.createElement("div");a.className="modal-overlay active",a.innerHTML=`
                <div class="modal">
                    <button class="modal__close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                    <h3>Новое задание в библиотеку</h3>
                    <div class="form-group"><label class="form-label">Блок</label><select id="libBlockSelect" class="form-select">${l}</select></div>
                    <div class="form-group"><label class="form-label">Название</label><input type="text" id="libTitle" class="form-input"></div>
                    <div class="form-group"><label class="form-label">Текст</label><textarea id="libText" class="form-input" rows="4"></textarea></div>
                    <div class="form-group"><label class="form-label">Ссылки (каждая с новой строки)</label><textarea id="libLinks" class="form-input" rows="3"></textarea></div>
                    <button class="btn btn--primary" onclick="addLibraryTask(${e||"null"}, '${t.replace(/'/g,"\\'")}')">Сохранить</button>
                </div>`,document.body.appendChild(a)})}function updateLibraryTask(e,t=null,o=""){let l=document.getElementById("libBlockSelect").value,a=document.getElementById("libTitle").value.trim(),n=document.getElementById("libText").value.trim(),s=document.getElementById("libLinks").value.trim();if(!a)return alert("Название обязательно");fetch("update_library_task.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`id=${e}&block_id=${l}&title=${encodeURIComponent(a)}&text=${encodeURIComponent(n)}&links=${encodeURIComponent(s)}`}).then(e=>e.json()).then(e=>{e.success?(document.querySelector(".modal-overlay").remove(),t&&"null"!==t?openLibraryBlockView(t,o):renderLibrary()):alert(e.error)})}function deleteLibraryTask(e){confirm("Удалить задание из библиотеки?")&&fetch("delete_library_task.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`id=${e}`}).then(e=>e.json()).then(e=>{e.success?renderLibrary():alert(e.error)})}function assignLibraryTaskToStudent(e){let t=window.lastLibrarySectionId||null;Promise.all([fetch("get_students.php").then(e=>e.json()),fetch(`get_assigned_students.php?task_id=${e}`).then(e=>e.json())]).then(([o,l])=>{let a="";o.forEach(e=>{let t=l.includes(Number(e.id))?"disabled":"";a+=`<label><input type="checkbox" value="${e.id}" ${t}> ${e.first_name} ${e.last_name}${t?" (уже назначено)":""}</label><br>`});let n=document.createElement("div");n.className="modal-overlay active",n.innerHTML=`
            <div class="modal">
                <button class="modal__close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                <h3>Назначить задание ученику</h3>
                <div>${a}</div>
                <button class="btn btn--primary" onclick="assignLibraryToSingleStudent(${e}, '${t||""}')">Назначить выбранному</button>
            </div>`,document.body.appendChild(n)})}function openLibraryAssignmentModal(e,t,o=null){Promise.all([fetch("get_library_tasks.php").then(e=>e.json()),fetch(`get_homework_categories.php?student_id=${e}`).then(e=>e.json()),fetch(`get_homework_blocks.php?student_id=${e}&category_id=all`).then(e=>e.json())]).then(([l,a,n])=>{let s=[];if(l.blocks&&l.blocks.forEach(e=>{e.tasks&&(s=s.concat(e.tasks))}),l.ungrouped&&(s=s.concat(l.ungrouped)),0===s.length){alert("В библиотеке нет заданий");return}let i="";s.forEach(e=>{i+=`<option value="${e.id}">${e.title}</option>`});let r='<option value="">Без категории</option>';a.forEach(e=>{r+=`<option value="${e.id}" ${e.id==o?"selected":""}>${e.name}</option>`});let d='<option value="">Без блока</option>';n.forEach(e=>{d+=`<option value="${e.id}">${e.name}</option>`});let c=document.createElement("div");c.className="modal-overlay active",c.innerHTML=`
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
            </div>`,document.body.appendChild(c)}).catch(e=>{console.error("Ошибка загрузки:",e),alert("Не удалось загрузить данные")})}function assignLibraryToSingleStudent(e,t=null){let o=document.querySelectorAll(".modal input[type=checkbox]:checked:not([disabled])");if(0===o.length)return alert("Выберите учеников");let l="";if(t){let a=window.libraryData;if(a&&a.sections){let n=a.sections.find(e=>e.id==t);n&&(l=n.name)}}let s=[];o.forEach(t=>{s.push(fetch("assign_task.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`task_id=${e}&student_id=${t.value}&category_name=${encodeURIComponent(l)}`}).then(e=>e.json()))}),Promise.all(s).then(e=>{let t=e.filter(e=>e.error);if(t.length>0)alert("Некоторые задания не назначены: "+t.map(e=>e.error).join(", "));else if(document.querySelector(".modal-overlay").remove(),alert("Задания назначены"),window.currentHomeworkData){let o=window.currentHomeworkData.studentId;Promise.all([fetch(`get_homework_categories.php?student_id=${o}`).then(e=>e.json()),fetch(`get_homework_blocks.php?student_id=${o}&category_id=all`).then(e=>e.json()),fetch(`get_homeworks.php?student_id=${o}`).then(e=>e.json())]).then(([e,t,o])=>{window.currentHomeworkData.categories=e,window.currentHomeworkData.blocks=t,window.currentHomeworkData.homeworks=o,renderHomeworkTabs(window.lastHomeworkCategoryId)})}})}function assignLibraryBlock(e){let t=document.querySelectorAll(".modal input[type=checkbox]:checked");if(0===t.length)return alert("Выберите учеников");let o="",l=window.libraryData;if(l&&l.sections){for(let a of l.sections)if(a.blocks&&a.blocks.some(t=>t.id==e)){o=a.name;break}}fetch("get_library_tasks.php").then(e=>e.json()).then(l=>{let a=[];l.sections&&l.sections.forEach(e=>{e.blocks&&(a=a.concat(e.blocks))}),l.ungrouped_blocks&&(a=a.concat(l.ungrouped_blocks));let n=a.find(t=>t.id==e);if(!n||!n.tasks||0===n.tasks.length){alert("В блоке нет заданий");return}let s=n.tasks.map(e=>e.id),i=[];t.forEach(e=>{s.forEach(t=>{i.push(fetch("assign_task.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`task_id=${t}&student_id=${e.value}&category_name=${encodeURIComponent(o)}`}).then(e=>e.json()))})}),Promise.all(i).then(e=>{let t=e.filter(e=>e.error);if(t.length>0)alert("Некоторые задания не назначены: "+t.map(e=>e.error).join(", "));else if(document.querySelector(".modal-overlay").remove(),alert("Все задания блока назначены выбранным ученикам"),window.currentHomeworkData){let o=window.currentHomeworkData.studentId;Promise.all([fetch(`get_homework_categories.php?student_id=${o}`).then(e=>e.json()),fetch(`get_homework_blocks.php?student_id=${o}&category_id=all`).then(e=>e.json()),fetch(`get_homeworks.php?student_id=${o}`).then(e=>e.json())]).then(([e,t,o])=>{window.currentHomeworkData.categories=e,window.currentHomeworkData.blocks=t,window.currentHomeworkData.homeworks=o,renderHomeworkTabs(window.lastHomeworkCategoryId)})}})})}function initLibraryDragDrop(){let e=document.querySelectorAll("#mainContent .blocks-grid");e.length&&e.forEach(e=>{if("true"===e.dataset.dragInit)return;e.dataset.dragInit="true";let t=e.querySelectorAll(".library-block");t.forEach(e=>{e.setAttribute("draggable",!0),e.addEventListener("dragstart",handleLibraryDragStart),e.addEventListener("dragend",handleLibraryDragEnd)}),e.addEventListener("dragover",handleLibraryDragOver),e.addEventListener("drop",handleLibraryDrop)})}let draggedLibraryBlock=null;function handleLibraryDragStart(e){(draggedLibraryBlock=e.target.closest(".library-block"))&&(e.dataTransfer.effectAllowed="move",draggedLibraryBlock.classList.add("dragging"))}function handleLibraryDragEnd(e){let t=e.target.closest(".library-block");t&&t.classList.remove("dragging"),draggedLibraryBlock=null}function handleLibraryDragOver(e){e.preventDefault(),e.dataTransfer.dropEffect="move"}function handleLibraryDrop(e){e.preventDefault();let t=e.target.closest(".blocks-grid");if(!t||!draggedLibraryBlock)return;let o=document.elementFromPoint(e.clientX,e.clientY),l=o?o.closest(".library-block"):null;if(l&&l!==draggedLibraryBlock){let a=l.getBoundingClientRect(),n=a.top+a.height/2;e.clientY<n?t.insertBefore(draggedLibraryBlock,l):t.insertBefore(draggedLibraryBlock,l.nextSibling)}else t.appendChild(draggedLibraryBlock);let s=[];t.querySelectorAll(".library-block").forEach(e=>{let t=e.dataset.blockId;t&&s.push(t)}),reorderLibraryBlocks(s)}function reorderLibraryBlocks(e){fetch("reorder_library_blocks.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`order=${encodeURIComponent(JSON.stringify(e))}`}).then(e=>e.json()).then(e=>{e.success||alert("Ошибка сохранения порядка")})}function initLibraryTasksDragDrop(){let e=document.querySelector(".library-tasks-grid");if(!e)return;let t=e.querySelectorAll(".library-task");t.forEach(e=>{e.setAttribute("draggable",!0),e.addEventListener("dragstart",handleTaskDragStart),e.addEventListener("dragend",handleTaskDragEnd)}),e.addEventListener("dragover",handleTaskDragOver),e.addEventListener("drop",handleTaskDrop)}let draggedTask=null;function handleTaskDragStart(e){(draggedTask=e.target.closest(".library-task"))&&(e.dataTransfer.effectAllowed="move",draggedTask.classList.add("dragging"))}function handleTaskDragEnd(e){let t=e.target.closest(".library-task");t&&t.classList.remove("dragging"),draggedTask=null}function handleTaskDragOver(e){e.preventDefault(),e.dataTransfer.dropEffect="move"}function handleTaskDrop(e){e.preventDefault();let t=document.querySelector(".library-tasks-grid");if(!t||!draggedTask)return;let o=document.elementFromPoint(e.clientX,e.clientY),l=o?o.closest(".library-task"):null;if(!l||l===draggedTask)return;let a=l.getBoundingClientRect(),n=a.top+a.height/2;e.clientY<n?t.insertBefore(draggedTask,l):t.insertBefore(draggedTask,l.nextSibling);let s=[];t.querySelectorAll(".library-task").forEach(e=>{let t=e.dataset.taskId;t&&s.push(t)});let i=t.closest("[data-block-id]")?.dataset.blockId;i&&reorderLibraryTasks(s,i)}function reorderLibraryTasks(e,t){fetch("reorder_library_tasks.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`block_id=${t}&order=${encodeURIComponent(JSON.stringify(e))}`}).then(e=>e.json()).then(e=>{e.success||alert("Ошибка сохранения порядка")})}function assignLibraryBlockModal(e){fetch("get_students.php").then(e=>e.json()).then(t=>{let o="";t.forEach(e=>{o+=`<label><input type="checkbox" value="${e.id}"> ${e.first_name} ${e.last_name}</label><br>`});let l=document.createElement("div");l.className="modal-overlay active",l.innerHTML=`
                <div class="modal">
                    <button class="modal__close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                    <h3>Назначить все задания блока</h3>
                    <div>${o}</div>
                    <button class="btn btn--primary" onclick="assignLibraryBlock(${e})">Назначить выбранным</button>
                </div>`,document.body.appendChild(l)})}function assignLibraryBlock(e){let t=document.querySelectorAll(".modal input[type=checkbox]:checked");if(0===t.length)return alert("Выберите учеников");let o="",l=window.libraryData;if(l&&l.sections){for(let a of l.sections)if(a.blocks&&a.blocks.some(t=>t.id==e)){o=a.name;break}}fetch("get_library_tasks.php").then(e=>e.json()).then(l=>{let a=[];l.sections&&l.sections.forEach(e=>{e.blocks&&(a=a.concat(e.blocks))}),l.ungrouped_blocks&&(a=a.concat(l.ungrouped_blocks));let n=a.find(t=>t.id==e);if(!n||!n.tasks||0===n.tasks.length){alert("В блоке нет заданий");return}let s=n.tasks.map(e=>e.id),i=[];t.forEach(e=>{s.forEach(t=>{i.push(fetch("assign_task.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`task_id=${t}&student_id=${e.value}&category_name=${encodeURIComponent(o)}`}).then(e=>e.json()))})}),Promise.all(i).then(e=>{let t=e.filter(e=>e.error);if(t.length>0)alert("Некоторые задания не назначены: "+t.map(e=>e.error).join(", "));else if(document.querySelector(".modal-overlay").remove(),alert("Все задания блока назначены выбранным ученикам"),window.currentHomeworkData){let o=window.currentHomeworkData.studentId;Promise.all([fetch(`get_homework_categories.php?student_id=${o}`).then(e=>e.json()),fetch(`get_homework_blocks.php?student_id=${o}&category_id=all`).then(e=>e.json()),fetch(`get_homeworks.php?student_id=${o}`).then(e=>e.json())]).then(([e,t,o])=>{window.currentHomeworkData.categories=e,window.currentHomeworkData.blocks=t,window.currentHomeworkData.homeworks=o,renderHomeworkTabs(window.lastHomeworkCategoryId)})}})})}function renderBlocks(e){if("basic"===CURRENT_PLAN){setMainContent(`<div class="empty-state"><div class="empty-icon">🔒</div><h3>Доступно в Профессиональном тарифе</h3><p><a href="contact.html">Повысить тариф</a></p></div>`);return}let t="lecture"===e?"Лекции":"Шпоры",o="lecture"===e?"\uD83D\uDCDA":"\uD83D\uDCCB";fetch(`get_blocks.php?type=${e}`).then(e=>e.json()).then(async l=>{let a=`
                <div class="dashboard-header">
                    <h2>${t}</h2>
                    <button class="btn-add" onclick="openAddBlockModal('${e}')">+ Добавить блок</button>
                </div>`;if(0===l.length)a+=`<div class="empty-state"><div class="empty-icon">${o}</div><h3>Нет блоков</h3><p>Добавьте первый блок, чтобы начать.</p></div>`;else{for(let n of(a+=`<div class="blocks-grid" id="lectureBlocksContainer" data-type="${e}">`,l)){let s=await fetch(`get_block_items.php?block_id=${n.id}`).then(e=>e.json()),i="";s.length>0?(i='<ul class="block-items-list">',s.forEach(e=>{i+=`<li>${e.title} ${e.link?`<a href="${e.link}" target="_blank" onclick="event.stopPropagation()">🔗</a>`:""}</li>`}),i+="</ul>"):i=`<p class="block-empty-text">Нет материалов</p>`,a+=`
    <div class="block-card" data-block-id="${n.id}" onclick="openBlockView(${n.id}, '${n.name.replace(/'/g,"\\'")}', '${e}')">
        <div class="block-card__header">
            <h3 class="block-card__title">${n.name}</h3>
            <div class="block-card__actions">
                <button class="btn-icon" onclick="event.stopPropagation(); openEditBlockModal(${n.id}, '${n.name.replace(/'/g,"\\'")}', '${e}')">✏️</button>
                <button class="btn-icon" onclick="event.stopPropagation(); deleteBlock(${n.id}, '${e}')">🗑️</button>
            </div>
        </div>
        ${i}
    </div>`}a+="</div>"}setMainContent(a),l.length>0&&initLectureDragDrop(e)}).catch(()=>showEmptyState(o,t,"Ошибка загрузки."))}function openAddBlockModal(e){let t=document.createElement("div");t.className="modal-overlay active",t.innerHTML=`
        <div class="modal">
            <button class="modal__close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            <h3>Добавить блок</h3>
            <div class="form-group"><label class="form-label">Название блока</label><input type="text" id="blockName" class="form-input"></div>
            <button class="btn btn--primary" onclick="addBlock('${e}')">Создать</button>
        </div>`,document.body.appendChild(t)}function addBlock(e){let t=document.getElementById("blockName").value.trim();if(!t)return alert("Введите название");fetch("add_block.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`name=${encodeURIComponent(t)}&type=${e}`}).then(e=>e.json()).then(t=>{t.success?(document.querySelector(".modal-overlay").remove(),renderBlocks(e)):alert(t.error)})}function openBlockView(e,t,o){fetch(`get_block_items.php?block_id=${e}`).then(e=>e.json()).then(l=>{let a="";l.forEach(l=>{a+=`
                    <tr style="cursor:pointer;" onclick="openLessonView(${l.id}, '${l.title.replace(/'/g,"\\'")}', '${(l.link||"").replace(/'/g,"\\'")}', '${(l.comment||"").replace(/'/g,"\\'")}', ${e}, '${t.replace(/'/g,"\\'")}', '${o}')">
                        <td>${l.title}</td>
                    </tr>`}),setMainContent(`
                <button class="btn-back" onclick="renderBlocks('${o}')">Назад к блокам</button>
                <div class="dashboard-header">
                    <h2>${t}</h2>
                    <div style="display:flex; gap:8px; align-items:center;">
                        <button class="btn-add" onclick="openAddItemModal(${e}, '${t.replace(/'/g,"\\'")}', '${o}')">+ Добавить ${"lecture"===o?"лекцию":"материал"}</button>
                        ${"lecture"===o?`<button class="btn-icon" onclick="openBlockAccessModal(${e})" title="Настроить доступ">👥</button>`:""}
                    </div>
                </div>
                ${l.length?`
                    <div class="table-responsive elegant-table">
                        <table>
                            <thead><tr><th>Название</th></tr></thead>
                            <tbody>${a}</tbody>
                        </table>
                    </div>`:`<div class="empty-state"><div class="empty-icon">📄</div><h3>Нет материалов</h3></div>`}
            `)})}function openBlockAccessModal(e){Promise.all([fetch("get_students.php").then(e=>e.json()),fetch(`get_block_access.php?block_id=${e}`).then(e=>e.json())]).then(([t,o])=>{let l="";t.forEach(e=>{let t=o.includes(Number(e.id))?"checked":"";l+=`<label><input type="checkbox" value="${e.id}" ${t}> ${e.first_name} ${e.last_name}</label><br>`});let a=document.createElement("div");a.className="modal-overlay active",a.innerHTML=`
            <div class="modal">
                <button class="modal__close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                <h3>Доступ к блоку</h3>
                <p>Выберите учеников, которые увидят этот блок:</p>
                <div>${l}</div>
                <button class="btn btn--primary" onclick="saveBlockAccess(${e})">Сохранить</button>
            </div>`,document.body.appendChild(a)})}function saveBlockAccess(e){let t=[];document.querySelectorAll(".modal input[type=checkbox]:checked").forEach(e=>t.push(e.value)),fetch("update_block_access.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`block_id=${e}&student_ids=${encodeURIComponent(JSON.stringify(t))}`}).then(e=>e.json()).then(e=>{e.success?(document.querySelector(".modal-overlay").remove(),alert("Доступ обновлён")):alert(e.error)})}function openLessonView(e,t,o,l,a,n,s){setMainContent(`
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
                    <input type="text" id="itemLink" class="form-input" value="${o||""}">
                    ${getRutubeEmbed(o)}
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
                    <textarea id="itemComment" class="form-input" rows="4">${l||""}</textarea>
                </span>
            </div>
            <div style="display:flex; gap:12px; margin-top:20px;">
                <button class="btn btn--primary" onclick="updateBlockItem(${e}, ${a}, '${n.replace(/'/g,"\\'")}', '${s}')">Сохранить</button>
                <button class="btn btn--danger" onclick="deleteBlockItem(${e}, ${a}, '${n.replace(/'/g,"\\'")}', '${s}')">Удалить</button>
            </div>
        </div>`),loadFiles("block_item",e,"blockItemFilesContainer")}function openAddItemModal(e,t,o){let l=document.createElement("div");l.className="modal-overlay active",l.innerHTML=`
        <div class="modal">
            <button class="modal__close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            <h3>Добавить ${"lecture"===o?"лекцию":"шпору"}</h3>
            <div class="form-group"><label class="form-label">Название</label><input type="text" id="itemTitle" class="form-input"></div>
            <div class="form-group"><label class="form-label">Ссылка</label><input type="text" id="itemLink" class="form-input"></div>
            <div class="form-group"><label class="form-label">Комментарий</label><textarea id="itemComment" class="form-input" rows="3"></textarea></div>
            <button class="btn btn--primary" onclick="addBlockItem(${e}, '${t.replace(/'/g,"\\'")}', '${o}')">Сохранить</button>
        </div>`,document.body.appendChild(l)}function addBlockItem(e,t,o){let l=document.getElementById("itemTitle").value.trim(),a=document.getElementById("itemLink").value.trim(),n=document.getElementById("itemComment").value.trim();if(!l)return alert("Введите название");fetch("add_block_item.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`block_id=${e}&title=${encodeURIComponent(l)}&link=${encodeURIComponent(a)}&comment=${encodeURIComponent(n)}`}).then(e=>e.json()).then(l=>{l.success?(document.querySelector(".modal-overlay").remove(),openBlockView(e,t,o)):alert(l.error)})}function openEditItemModal(e,t,o,l,a,n,s){let i=document.createElement("div");i.className="modal-overlay active",i.innerHTML=`
        <div class="modal">
            <button class="modal__close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            <h3>Редактировать материал</h3>
            <div class="form-group"><label class="form-label">Название</label><input type="text" id="itemTitle" class="form-input" value="${t}"></div>
            <div class="form-group"><label class="form-label">Ссылка</label><input type="text" id="itemLink" class="form-input" value="${o}"></div>
            <div class="form-group"><label class="form-label">Комментарий</label><textarea id="itemComment" class="form-input" rows="3">${l}</textarea></div>
            <button class="btn btn--primary" onclick="updateBlockItem(${e}, ${a}, '${n}', '${s}')">Сохранить</button>
        </div>`,document.body.appendChild(i)}function updateBlockItem(e,t,o,l){let a=document.getElementById("itemTitle").value.trim(),n=document.getElementById("itemLink").value.trim(),s=document.getElementById("itemComment").value.trim();if(!a)return alert("Введите название");fetch("update_block_item.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`id=${e}&title=${encodeURIComponent(a)}&link=${encodeURIComponent(n)}&comment=${encodeURIComponent(s)}`}).then(e=>e.json()).then(e=>{e.success?(document.querySelector(".modal-overlay").remove(),openBlockView(t,o,l)):alert(e.error)})}function deleteBlockItem(e,t,o,l){confirm("Удалить материал?")&&fetch("delete_block_item.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`id=${e}`}).then(e=>e.json()).then(e=>e.success?openBlockView(t,o,l):alert(e.error))}function openEditBlockModal(e,t,o){let l=document.createElement("div");l.className="modal-overlay active",l.innerHTML=`
        <div class="modal">
            <button class="modal__close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            <h3>Редактировать блок</h3>
            <div class="form-group">
                <label class="form-label">Название блока</label>
                <input type="text" id="editBlockName" class="form-input" value="${t}">
            </div>
            <button class="btn btn--primary" onclick="editBlock(${e}, '${o}')">Сохранить</button>
        </div>`,document.body.appendChild(l)}function editBlock(e,t){let o=document.getElementById("editBlockName").value.trim();if(!o)return alert("Название не может быть пустым");fetch("update_block.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`id=${e}&name=${encodeURIComponent(o)}&type=${t}`}).then(e=>e.json()).then(e=>{e.success?(document.querySelector(".modal-overlay").remove(),renderBlocks(t)):alert("Ошибка: "+e.error)}).catch(e=>alert("Ошибка сети: "+e))}function deleteBlock(e,t){confirm("Удалить блок? Все материалы внутри него тоже удалятся.")&&fetch("delete_block.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`id=${e}`}).then(e=>e.json()).then(e=>{e.success?renderBlocks(t):alert("Ошибка: "+e.error)}).catch(e=>alert("Ошибка сети: "+e))}function initLectureDragDrop(e){let t=document.getElementById("lectureBlocksContainer");if(!t)return;let o=t.querySelectorAll(".block-card");o.forEach(e=>{e.setAttribute("draggable",!0),e.addEventListener("dragstart",handleLectureDragStart),e.addEventListener("dragend",handleLectureDragEnd)}),t.addEventListener("dragover",handleLectureDragOver),t.addEventListener("drop",handleLectureDrop)}let draggedLectureCard=null;function handleLectureDragStart(e){(draggedLectureCard=e.target.closest(".block-card"))&&(e.dataTransfer.effectAllowed="move",draggedLectureCard.classList.add("dragging"))}function handleLectureDragEnd(e){let t=e.target.closest(".block-card");t&&t.classList.remove("dragging"),draggedLectureCard=null}function handleLectureDragOver(e){e.preventDefault(),e.dataTransfer.dropEffect="move"}function handleLectureDrop(e){e.preventDefault();let t=document.getElementById("lectureBlocksContainer");if(!t||!draggedLectureCard)return;let o=document.elementFromPoint(e.clientX,e.clientY),l=o?o.closest(".block-card"):null;if(!l||l===draggedLectureCard)return;let a=l.getBoundingClientRect(),n=a.top+a.height/2;e.clientY<n?t.insertBefore(draggedLectureCard,l):t.insertBefore(draggedLectureCard,l.nextSibling);let s=[];t.querySelectorAll(".block-card").forEach(e=>{let t=e.dataset.blockId;t&&s.push(t)}),reorderLectureBlocks(s,t.dataset.type)}function reorderLectureBlocks(e,t){fetch("reorder_blocks.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`type=${t}&order=${encodeURIComponent(JSON.stringify(e))}`}).then(e=>e.json()).then(e=>{e.success||alert("Ошибка при сохранении порядка")})}function getRutubeEmbed(e){if(!e)return"";let t=e.match(/(?:rutube\.ru\/video\/(?:private\/)?)([a-zA-Z0-9_-]+)\/?(?:\?p=([a-zA-Z0-9_-]+))?/);if(!t)return"";let o=t[1],l=t[2]?`?p=${t[2]}&m=1`:"?m=1";return`
        <div class="rutube-player">
            <iframe src="https://rutube.ru/play/embed/${o}${l}"
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
        </div>`)}function setMainContent(e){let t=document.getElementById("mainContent"),o=t.querySelector('div[style*="background: #FEF3C7"]'),l=o?o.outerHTML:"";t.innerHTML=l+e}function showUpgradeMessage(){setMainContent(`<div class="empty-state"><div class="empty-icon">🔒</div><h3>Доступно в Профессиональном тарифе</h3><p><a href="contact.html">Повысить тариф</a></p></div>`)}function loadCustomBlocks(){"undefined"!=typeof CURRENT_PLAN&&"basic"!==CURRENT_PLAN&&fetch("get_custom_blocks.php").then(e=>e.json()).then(e=>{let t=document.getElementById("customBlocksContainer");t&&(t.innerHTML="",e.forEach(e=>{t.innerHTML+=`
                    <a class="sidebar__link" data-tab="custom_${e.id}" onclick="event.preventDefault();">📌 ${e.name}</a>
                `}))})}function renderCustomBlock(e,t){fetch(`get_custom_groups.php?block_id=${e}`).then(e=>e.json()).then(async o=>{let l=`
                <button class="btn-back" onclick="renderCustomBlocksList()">← Назад</button>
                <div class="dashboard-header">
                    <h2>${t}</h2>
                    <div style="display:flex; gap:8px; align-items:center;">
                        <button class="btn-add" onclick="openAddCustomGroupModal(${e}, '${t.replace(/'/g,"\\'")}')">+ Добавить блок</button>
                        <button class="btn-icon" onclick="openEditCustomBlockModal(${e}, '${t.replace(/'/g,"\\'")}')" title="Редактировать раздел">✏️</button>
                        <button class="btn-icon" onclick="deleteCustomBlock(${e})" title="Удалить раздел">🗑️</button>
                        <button class="btn-icon" onclick="openCustomBlockAccessModal(${e}, '${t.replace(/'/g,"\\'")}')" title="Настроить доступ">👥</button>
                    </div>
                </div>`;if(0===o.length)l+='<div class="empty-state"><div class="empty-icon">\uD83D\uDCC4</div><h3>Нет блоков</h3><p>Добавьте первый блок внутри раздела.</p></div>';else{for(let a of(l+='<div class="blocks-grid" id="customGroupsContainer" data-block-id="'+e+'">',o)){let n=await fetch(`get_custom_items.php?group_id=${a.id}`).then(e=>e.json()),s="";if(n.length>0)s='<ul class="block-items-list">',n.forEach(e=>{if("tasks"===a.type){let t=e.comment?e.comment.substring(0,60)+(e.comment.length>60?"…":""):"без описания",o=0;if(e.link)try{let l=JSON.parse(e.link);o=Array.isArray(l)?l.length:1}catch(n){o=1}s+=`<li><strong>${e.title}</strong> – ${t} ${o>0?`(${o} ссыл.)`:""}</li>`}else s+=`<li>${e.title} ${e.link?`<a href="${e.link}" target="_blank" onclick="event.stopPropagation()">🔗</a>`:""}</li>`}),s+="</ul>";else{let i="tasks"===a.type?"Нет заданий":"lectures"===a.type?"Нет лекций":"Нет материалов";s=`<p class="block-empty-text">${i}</p>`}let r="\uD83D\uDCC4",d="block-card--material";"tasks"===a.type?(r="\uD83D\uDCDD",d="block-card--tasks"):"lectures"===a.type&&(r="\uD83D\uDCDA",d="block-card--lectures"),l+=`
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
                        </div>`}l+="</div>"}setMainContent(l),o.length>0&&initCustomGroupDragDrop(e)})}function renderCustomBlocksList(){loadCustomBlocks(),setMainContent('<div class="empty-state"><div class="empty-icon">\uD83D\uDCCC</div><h3>Выберите раздел в боковом меню</h3></div>')}function openAddCustomBlockModal(e=null){let t=document.querySelector(".modal-overlay");t&&t.remove();let o="";o="tasks"===e?'<input type="hidden" id="customBlockType" value="tasks">':`
            <div class="form-group">
                <label class="form-label">Тип раздела</label>
                <select id="customBlockType" class="form-select">
                    <option value="material">📄 Материалы</option>
                    <option value="tasks">📝 Задания (Библиотека)</option>
                    <option value="lectures">📚 Лекции</option>
                </select>
            </div>`;let l=document.createElement("div");l.className="modal-overlay active",l.innerHTML=`
        <div class="modal">
            <button class="modal__close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            <h3>${"tasks"===e?"Новая библиотека заданий":"Новый раздел"}</h3>
            <div class="form-group"><label class="form-label">Название</label><input type="text" id="customBlockName" class="form-input"></div>
            ${o}
            <button class="btn btn--primary" onclick="addCustomBlock()">Создать</button>
        </div>`,document.body.appendChild(l)}function addCustomBlock(){let e=document.querySelector(".modal-overlay.active");if(!e)return;let t=e.querySelector("#customBlockName"),o=e.querySelector("#customBlockType");if(!t)return;let l=t.value.trim(),a=o?o.value:"material";if(!l)return alert("Введите название");fetch("add_custom_block.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`name=${encodeURIComponent(l)}&type=${a}`}).then(e=>e.json()).then(t=>{t.success?(e.remove(),loadCustomBlocks(),t.block_id?renderCustomBlock(t.block_id,l):setMainContent('<div class="empty-state"><div class="empty-icon">\uD83D\uDCCC</div><h3>Раздел создан! Выберите его в боковом меню.</h3></div>')):alert(t.error)})}function openEditCustomBlockModal(e,t){let o=document.createElement("div");o.className="modal-overlay active",o.innerHTML=`
        <div class="modal">
            <button class="modal__close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            <h3>Переименовать раздел</h3>
            <div class="form-group"><label class="form-label">Название</label><input type="text" id="customBlockName" class="form-input" value="${t}"></div>
            <button class="btn btn--primary" onclick="editCustomBlock(${e})">Сохранить</button>
        </div>`,document.body.appendChild(o)}function editCustomBlock(e){let t=document.querySelector(".modal-overlay.active");if(!t)return;let o=t.querySelector("#customBlockName");if(!o)return;let l=o.value.trim();if(!l)return alert("Введите название");fetch("update_custom_block.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`id=${e}&name=${encodeURIComponent(l)}`}).then(e=>e.json()).then(o=>{if(o.success){t.remove(),loadCustomBlocks();let a=document.getElementById("mainContent");a&&-1!==a.innerHTML.indexOf("btn-back")&&renderCustomBlock(e,l)}else alert(o.error)})}function deleteCustomBlock(e){confirm("Удалить раздел и все его содержимое?")&&fetch("delete_custom_block.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`id=${e}`}).then(e=>e.json()).then(e=>{e.success?(loadCustomBlocks(),setMainContent('<div class="empty-state"><div class="empty-icon">\uD83D\uDCCC</div><h3>Раздел удалён.</h3></div>')):alert(e.error)})}function openAddCustomGroupModal(e,t){let o=document.createElement("div");o.className="modal-overlay active",o.innerHTML=`
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
        </div>`,document.body.appendChild(o)}function addCustomGroup(e,t){let o=document.querySelector(".modal-overlay.active");if(!o)return;let l=o.querySelector("#customGroupName"),a=o.querySelector("#customGroupType");if(!l||!a)return;let n=l.value.trim(),s=a.value;if(!n)return alert("Введите название");fetch("add_custom_group.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`block_id=${e}&name=${encodeURIComponent(n)}&type=${s}`}).then(e=>e.json()).then(l=>{l.success?(o.remove(),renderCustomBlock(e,t)):alert(l.error)})}function openEditCustomGroupModal(e,t,o,l){let a=document.createElement("div");a.className="modal-overlay active",a.innerHTML=`
        <div class="modal">
            <button class="modal__close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            <h3>Переименовать блок</h3>
            <div class="form-group"><label class="form-label">Название</label><input type="text" id="customGroupName" class="form-input" value="${t}"></div>
            <button class="btn btn--primary" onclick="editCustomGroup(${e}, ${o}, '${l.replace(/'/g,"\\'")}')">Сохранить</button>
        </div>`,document.body.appendChild(a)}function editCustomGroup(e,t,o){let l=document.querySelector(".modal-overlay.active");if(!l)return;let a=l.querySelector("#customGroupName");if(!a)return;let n=a.value.trim();if(!n)return alert("Введите название");fetch("update_custom_group.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`id=${e}&name=${encodeURIComponent(n)}`}).then(e=>e.json()).then(e=>{e.success?(l.remove(),renderCustomBlock(t,o)):alert(e.error)})}function deleteCustomGroup(e,t,o){confirm("Удалить блок?")&&fetch("delete_custom_group.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`id=${e}`}).then(e=>e.json()).then(e=>e.success?renderCustomBlock(t,o):alert(e.error))}function openCustomGroupView(e,t,o,l,a="material"){fetch(`get_custom_items.php?group_id=${e}`).then(e=>e.json()).then(n=>{let s=`
                <button class="btn-back" onclick="renderCustomBlock(${o}, '${l.replace(/'/g,"\\'")}')">← Назад к разделу</button>
                <div class="dashboard-header">
                    <h2>${t}</h2>
                    <button class="btn-add" onclick="openAddCustomItemToGroupModal(${e}, '${t.replace(/'/g,"\\'")}', ${o}, '${l.replace(/'/g,"\\'")}', '${a}')">
                        + Добавить ${"tasks"===a?"задание":"lectures"===a?"лекцию":"материал"}
                    </button>
                </div>`;0===n.length?s+='<div class="empty-state"><div class="empty-icon">\uD83D\uDCC4</div><h3>Нет элементов</h3></div>':(s+='<div class="custom-items-grid">',n.forEach(n=>{let i="custom-item-card--material",r="\uD83D\uDCC4";if("tasks"===a?(i="custom-item-card--tasks",r="\uD83D\uDCDD"):"lectures"===a&&(i="custom-item-card--lectures",r="\uD83D\uDCDA"),s+=`
                        <div class="custom-item-card ${i}" onclick="openCustomItemView(${n.id}, '${n.title.replace(/'/g,"\\'")}', '${(n.link||"").replace(/'/g,"\\'")}', '${(n.comment||"").replace(/'/g,"\\'")}', ${e}, '${t.replace(/'/g,"\\'")}', ${o}, '${l.replace(/'/g,"\\'")}', '${a}')">
                            <div class="custom-item-card__header">
                                <span class="custom-item-card__icon">${r}</span>
                                <h3 class="custom-item-card__title">${n.title}</h3>
                            </div>`,"tasks"===a){if(s+='<div class="custom-item-card__body">',n.comment&&(s+=`<div class="task-text">${n.comment.replace(/\n/g,"<br>")}</div>`),n.link){let d=[];try{d=JSON.parse(n.link)}catch(c){}Array.isArray(d)&&d.length>0?(s+='<div class="task-links">',d.forEach(e=>{s+=`<a href="${e}" target="_blank" onclick="event.stopPropagation()">🔗 Ссылка</a>`}),s+="</div>"):n.link&&(s+=`<a href="${n.link}" target="_blank" onclick="event.stopPropagation()">🔗 Ссылка</a>`)}s+="</div>"}else s+='<div class="custom-item-card__body">',n.link&&(s+=`<div class="task-link"><a href="${n.link}" target="_blank" onclick="event.stopPropagation()">🔗 Открыть</a></div>`),n.comment&&(s+=`<div class="task-comment">${n.comment.length>80?n.comment.substring(0,80)+"…":n.comment}</div>`),s+="</div>";s+="</div>"}),s+="</div>"),setMainContent(s)})}function openAddCustomItemToGroupModal(e,t,o,l,a="material"){let n=document.createElement("div");n.className="modal-overlay active";let s="";s="tasks"===a?`
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
            <button class="btn btn--primary" onclick="addCustomItemToGroup(${e}, '${t.replace(/'/g,"\\'")}', ${o}, '${l.replace(/'/g,"\\'")}', '${a}')">Сохранить</button>
        </div>`,document.body.appendChild(n)}function addCustomItemToGroup(e,t,o,l,a="material"){let n=document.querySelector(".modal-overlay.active");if(!n){alert("Модальное окно не найдено");return}let s=n.querySelector("#customItemTitle");if(!s)return;let i=s.value.trim();if(!i)return alert("Название обязательно");let r=`group_id=${e}&title=${encodeURIComponent(i)}`;if("tasks"===a){let d=n.querySelector("#customItemText"),c=n.querySelector("#customItemLinks"),p=d?d.value.trim():"",u=c?c.value.trim():"";r+=`&text=${encodeURIComponent(p)}&links=${encodeURIComponent(u)}`}else{let m=n.querySelector("#customItemLink"),b=n.querySelector("#customItemComment"),h=m?m.value.trim():"",v=b?b.value.trim():"";r+=`&link=${encodeURIComponent(h)}&comment=${encodeURIComponent(v)}`}fetch("add_custom_item.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:r}).then(e=>e.json()).then(s=>{s.success?(n.remove(),openCustomGroupView(e,t,o,l,a)):alert(s.error)}).catch(e=>alert("Ошибка сети: "+e))}function openCustomItemView(e,t,o,l,a,n,s,i,r="material"){let d="";setMainContent(`
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
                    <textarea id="customItemText" class="form-input" rows="4">${l||""}</textarea>
                </span>
            </div>
            <div class="lesson-detail__row">
                <span class="lesson-detail__label">Ссылки</span>
                <span class="lesson-detail__value">
                    <textarea id="customItemLinks" class="form-input" rows="3">${o||""}</textarea>
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
                    <input type="text" id="customItemLink" class="form-input" value="${o||""}">
                    ${getRutubeEmbed(o)}
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
                    <textarea id="customItemComment" class="form-input" rows="4">${l||""}</textarea>
                </span>
            </div>
        `}
            <div style="display:flex; gap:12px; margin-top:20px;">
                <button class="btn btn--primary" onclick="updateCustomItem(${e}, ${a}, '${n.replace(/'/g,"\\'")}', ${s}, '${i.replace(/'/g,"\\'")}', '${r}')">Сохранить</button>
                <button class="btn btn--danger" onclick="deleteCustomItem(${e}, ${a}, '${n.replace(/'/g,"\\'")}', ${s}, '${i.replace(/'/g,"\\'")}')">Удалить</button>
            </div>
        </div>`),"tasks"!==r&&loadFiles("custom_item",e,"customItemFilesContainer")}function updateCustomItem(e,t,o,l,a,n="material"){let s=document.getElementById("mainContent"),i=s.querySelector("#customItemTitle")?.value.trim();if(!i)return alert("Название обязательно");let r=`id=${e}&title=${encodeURIComponent(i)}`;if("tasks"===n){let d=s.querySelector("#customItemText")?.value.trim()||"",c=s.querySelector("#customItemLinks")?.value.trim()||"";r+=`&text=${encodeURIComponent(d)}&links=${encodeURIComponent(c)}`}else{let p=s.querySelector("#customItemLink")?.value.trim()||"",u=s.querySelector("#customItemComment")?.value.trim()||"";r+=`&link=${encodeURIComponent(p)}&comment=${encodeURIComponent(u)}`}fetch("update_custom_item.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:r}).then(e=>e.json()).then(e=>{e.success?openCustomGroupView(t,o,l,a,n):alert(e.error)})}function deleteCustomItem(e,t,o,l,a){confirm("Удалить материал?")&&fetch("delete_custom_item.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`id=${e}`}).then(e=>e.json()).then(e=>e.success?openCustomGroupView(t,o,l,a):alert(e.error))}function initCustomGroupDragDrop(e){let t=document.getElementById("customGroupsContainer");if(!t)return;let o=t.querySelectorAll(".block-card");o.forEach(e=>{e.setAttribute("draggable",!0),e.addEventListener("dragstart",handleCustomGroupDragStart),e.addEventListener("dragend",handleCustomGroupDragEnd)}),t.addEventListener("dragover",handleCustomGroupDragOver),t.addEventListener("drop",handleCustomGroupDrop)}let draggedCustomGroup=null;function handleCustomGroupDragStart(e){(draggedCustomGroup=e.target.closest(".block-card"))&&(e.dataTransfer.effectAllowed="move",draggedCustomGroup.classList.add("dragging"))}function handleCustomGroupDragEnd(e){let t=e.target.closest(".block-card");t&&t.classList.remove("dragging"),draggedCustomGroup=null}function handleCustomGroupDragOver(e){e.preventDefault(),e.dataTransfer.dropEffect="move"}function handleCustomGroupDrop(e){e.preventDefault();let t=document.getElementById("customGroupsContainer");if(!t||!draggedCustomGroup)return;let o=document.elementFromPoint(e.clientX,e.clientY),l=o?o.closest(".block-card"):null;if(!l||l===draggedCustomGroup)return;let a=l.getBoundingClientRect(),n=a.top+a.height/2;e.clientY<n?t.insertBefore(draggedCustomGroup,l):t.insertBefore(draggedCustomGroup,l.nextSibling);let s=[];t.querySelectorAll(".block-card").forEach(e=>s.push(e.dataset.groupId)),reorderCustomGroups(s,t.dataset.blockId)}function reorderCustomGroups(e,t){fetch("reorder_custom_groups.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`order=${encodeURIComponent(JSON.stringify(e))}`}).then(e=>e.json()).then(e=>{e.success||alert("Ошибка сохранения порядка")})}function openCustomBlockAccessModal(e,t){Promise.all([fetch("get_students.php").then(e=>e.json()),fetch(`get_custom_block_access.php?block_id=${e}`).then(e=>e.json())]).then(([o,l])=>{let a="";o.forEach(e=>{let t=l.includes(Number(e.id))?"checked":"";a+=`<label><input type="checkbox" value="${e.id}" ${t}> ${e.first_name} ${e.last_name}</label><br>`});let n=document.createElement("div");n.className="modal-overlay active",n.innerHTML=`
            <div class="modal">
                <button class="modal__close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                <h3>Доступ к разделу \xab${t}\xbb</h3>
                <p>Выберите учеников, которые увидят этот раздел:</p>
                <div>${a}</div>
                <button class="btn btn--primary" onclick="saveCustomBlockAccess(${e})">Сохранить</button>
            </div>`,document.body.appendChild(n)})}function saveCustomBlockAccess(e){let t=[];document.querySelectorAll(".modal input[type=checkbox]:checked").forEach(e=>t.push(e.value)),fetch("update_custom_block_access.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`block_id=${e}&student_ids=${encodeURIComponent(JSON.stringify(t))}`}).then(e=>e.json()).then(e=>{e.success?(document.querySelector(".modal-overlay").remove(),alert("Доступ обновлён")):alert(e.error)})}function loadFiles(e,t,o){fetch(`get_files.php?entity_type=${e}&entity_id=${t}`).then(e=>e.json()).then(l=>{let a=document.getElementById(o);if(!a)return;if(!Array.isArray(l)||0===l.length){a.innerHTML='<p style="color:var(--text-secondary);">Нет прикреплённых файлов</p>';return}let n='<ul class="files-list">';l.forEach(l=>{let a=(l.size/1048576).toFixed(1);n+=`
                <li class="files-list__item">
                    <span class="files-list__icon">📄</span>
                    <span class="files-list__name">${l.original_name}</span>
                    <span class="files-list__size">${a} MB</span>
                    <div class="files-list__actions">
                        <a href="download_file.php?id=${l.id}" class="btn--file-download" target="_blank">Скачать</a>
                        <button class="btn--file-delete" onclick="deleteFile(${l.id}, '${e}', ${t}, '${o}')">🗑️</button>
                    </div>
                </li>`}),n+="</ul>",a.innerHTML=n}).catch(()=>{document.getElementById(o).innerHTML='<p style="color:red;">Ошибка загрузки списка файлов</p>'})}function uploadFiles(e,t,o,l,a){let n=document.getElementById(o);if(!n||!n.files.length){alert("Выберите файлы");return}let s=new FormData;for(let i of(s.append("entity_type",e),s.append("entity_id",t),n.files))s.append("files[]",i);fetch("upload_file.php",{method:"POST",body:s}).then(e=>e.json()).then(o=>{o.success?(n.value="",a&&(document.getElementById(a).textContent=""),loadFiles(e,t,l)):alert("Ошибка загрузки: "+(o.error||"неизвестная ошибка"))}).catch(e=>{console.error("Сетевая ошибка:",e),alert("Сетевая ошибка при загрузке")})}function deleteFile(e,t,o,l){confirm("Удалить файл?")&&fetch("delete_file.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`id=${e}`}).then(e=>e.json()).then(e=>{e.success?loadFiles(t,o,l):alert("Ошибка: "+e.error)}).catch(()=>alert("Ошибка сети при удалении"))}function getPaymentLabel(e){return({none:"Не указан",paid:"Оплачено",unpaid:"Не оплачено",pending:"Ожидается"})[e]||"Не указан"}function cyclePaymentStatus(e){let t=document.getElementById("paymentBadge");if(!t)return;let o=t.textContent.trim(),l=["none","paid","unpaid","pending"];updatePaymentBadge(l[(l.indexOf({"Не указан":"none",Оплачено:"paid","Не оплачено":"unpaid",Ожидается:"pending"}[o]||"none")+1)%l.length])}function updatePaymentBadge(e){let t=document.getElementById("paymentBadge");t&&(t.textContent=getPaymentLabel(e),t.className=`badge badge--${e} badge--clickable`)}function showEmptyState(e,t,o){setMainContent(`
        <div class="empty-state">
            <div class="empty-icon">${e}</div>
            <h3>${t}</h3>
            <p>${o}</p>
        </div>`)}function openAddStudentModal(){let e=document.createElement("div");e.className="modal-overlay active",e.innerHTML=`
        <div class="modal">
            <button class="modal__close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            <h3>Добавить ученика</h3>
            <div class="form-group"><label class="form-label">Имя</label><input type="text" id="studFirstName" class="form-input"></div>
            <div class="form-group"><label class="form-label">Фамилия</label><input type="text" id="studLastName" class="form-input"></div>
            <div class="form-group"><label class="form-label">Email (необязательно)</label><input type="email" id="studEmail" class="form-input"></div>
            <div id="genCredentials" style="display:none; margin:12px 0; padding:12px; background:#ECFDF5; border-radius:8px;"></div>
            <button class="btn btn--primary" onclick="addStudent(this)">Создать</button>
        </div>`,document.body.appendChild(e)}function addStudent(e){let t=document.getElementById("studFirstName").value.trim(),o=document.getElementById("studLastName").value.trim(),l=document.getElementById("studEmail")?.value.trim()||"";if(!t)return alert("Имя обязательно");e.disabled=!0,e.textContent="Сохраняю...",fetch("add_student.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`first_name=${encodeURIComponent(t)}&last_name=${encodeURIComponent(o)}&email=${encodeURIComponent(l)}`}).then(e=>e.json()).then(t=>{if(t.success){let o=document.getElementById("genCredentials");o.style.display="block",o.innerHTML=`
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
Пароль: ${t.password}`};navigator.share?navigator.share(e).catch(()=>{}):copyToClipboard(e.text,this)}),e.textContent="Закрыть",e.disabled=!1,e.onclick=function(){let t=e.closest(".modal-overlay");t&&t.remove(),renderStudents()}}else alert("Ошибка: "+(t.error||"Неизвестная ошибка")),e.disabled=!1,e.textContent="Создать"}).catch(t=>{alert("Ошибка сети: "+t),e.disabled=!1,e.textContent="Создать"})}function deleteStudent(e,t){confirm(`Удалить ученика ${t}?`)&&fetch("delete_student.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`student_id=${e}`}).then(e=>e.json()).then(e=>e.success?renderStudents():alert(e.error))}function changeMonth(e,t,o,l){renderCalendar(e,t,o,l),loadLessonsTable(e,t,o,l)}function switchViewMode(e,t,o,l){currentViewMode="calendar"===currentViewMode?"table":"calendar";let a=document.getElementById("switchCalendar"),n=document.getElementById("switchTable"),s=document.getElementById("calendarPanel"),i=document.getElementById("tablePanel");if("calendar"===currentViewMode)a.classList.add("active"),n.classList.remove("active"),s.style.display="",i.style.display="none";else{n.classList.add("active"),a.classList.remove("active"),s.style.display="none",i.style.display="";let r=document.getElementById("lessonsTableContainer");r&&(r.innerHTML='<div style="text-align:center;padding:40px;"><div class="loading-spinner"></div></div>'),loadLessonsTable(e,t,o,l)}}function loadLessonsTable(e,t,o,l){fetch(`get_schedule.php?student_id=${e}&month=${l}&year=${o}&timezone=${TEACHER_TIMEZONE}`).then(e=>e.json()).then(a=>{let n=document.getElementById("lessonsTableContainer");if(!n)return;let s=["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"][l-1];if(!Array.isArray(a)||0===a.length){n.innerHTML=`
                    <div style="display:flex; align-items:center; gap:12px; margin-bottom:12px;">
                        <button class="btn btn--ghost" onclick="changeMonth(${e}, '${t}', ${1===l?o-1:o}, ${1===l?12:l-1})">←</button>
                        <span style="font-size:18px; font-weight:600;">${s} ${o}</span>
                        <button class="btn btn--ghost" onclick="changeMonth(${e}, '${t}', ${12===l?o+1:o}, ${12===l?1:l+1})">→</button>
                    </div>
                    <p>Нет уроков в этом месяце</p>
                `;return}a.sort((e,t)=>(e.lesson_date+e.time).localeCompare(t.lesson_date+t.time));let i="";a.forEach(a=>{let n=a.time?a.time.slice(0,5):"",s=getPaymentLabel(a.payment_status),r=a.payment_status||"none",d={id:a.id,lesson_date:a.lesson_date,time:a.time,topic:a.topic,comment:a.comment,recording_link:a.recording_link,payment_status:a.payment_status};i+=`
                    <tr style="cursor:pointer;"
                        data-lesson='${JSON.stringify(d)}'
                        data-student-id="${e}"
                        data-student-name="${t.replace(/"/g,"&quot;")}"
                        data-year="${o}"
                        data-month="${l}"
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
                        <button class="btn btn--ghost" onclick="changeMonth(${e}, '${t}', ${1===l?o-1:o}, ${1===l?12:l-1})">←</button>
                        <span style="font-size:18px; font-weight:600;">${s} ${o}</span>
                        <button class="btn btn--ghost" onclick="changeMonth(${e}, '${t}', ${12===l?o+1:o}, ${12===l?1:l+1})">→</button>
                    </div>
                    <button class="btn-add" onclick="openAddLessonFromTable(${e}, '${t.replace(/'/g,"\\'")}', ${o}, ${l})">+ Добавить урок</button>
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
                </div>`;n.innerHTML=r}).catch(()=>{let e=document.getElementById("lessonsTableContainer");e&&(e.innerHTML="")})}function changePaymentStatusInTable(e,t){let o=t.textContent.trim(),l={"Не указан":"none",Оплачено:"paid","Не оплачено":"unpaid",Ожидается:"pending"}[o]||"none",a=["none","paid","unpaid","pending"],n=(a.indexOf(l)+1)%a.length,s=a[n],i=t.closest("tr");if(!i)return;let r=JSON.parse(i.dataset.lesson);t.textContent=getPaymentLabel(s),t.className=`badge badge--${s} badge--clickable`;let d=r.time||"",c=r.topic||"",p=r.comment||"",u=r.recording_link||"";fetch("update_lesson.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`id=${e}&time=${encodeURIComponent(d)}&topic=${encodeURIComponent(c)}&comment=${encodeURIComponent(p)}&recording_link=${encodeURIComponent(u)}&payment_status=${s}`}).then(e=>e.json()).then(e=>{e.success?(r.payment_status=s,i.dataset.lesson=JSON.stringify(r),updateCalendarAndStatsForLesson(r.lesson_date,s)):(t.textContent=o,t.className=`badge badge--${l} badge--clickable`,alert("Ошибка сохранения статуса"))})}function updateCalendarAndStatsForLesson(e,t){let o=document.querySelector(`.calendar-day[data-date="${e}"]`);o&&(o.classList.remove("calendar-day--none","calendar-day--paid","calendar-day--unpaid","calendar-day--pending"),o.classList.add("calendar-day--"+t));let l=document.querySelectorAll("#lessonsTableContainer tbody tr"),a=0,n=0,s=0,i=0;l.forEach(e=>{let t=JSON.parse(e.dataset.lesson);a++,"paid"===t.payment_status?n++:"unpaid"===t.payment_status?s++:"pending"===t.payment_status&&i++});let r=document.querySelectorAll(".stats-panel__value");r.length>=4&&(r[0].textContent=a,r[1].textContent=n,r[2].textContent=s,r[3].textContent=i)}function openLessonPageFromTable(e){let t=JSON.parse(e.dataset.lesson),o=e.dataset.studentId,l=e.dataset.studentName,a=parseInt(e.dataset.year),n=parseInt(e.dataset.month);openLessonPage(t,o,l,a,n)}function openAddLessonFromTable(e,t,o,l){let a=document.createElement("div");a.className="modal-overlay active",a.innerHTML=`
        <div class="modal">
            <button class="modal__close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            <h3>Добавить урок для ${t}</h3>
            <div class="form-group"><label class="form-label">Дата</label><input type="date" id="lessonDate" class="form-input"></div>
            <div class="form-group"><label class="form-label">Время</label><input type="time" id="lessonTime" class="form-input"></div>
            <div class="form-group"><label class="form-label">Тема</label><input type="text" id="lessonTopic" class="form-input"></div>
            <button class="btn btn--primary" onclick="addLessonFromTable(${e}, '${t.replace(/'/g,"\\'")}', ${o}, ${l})">Сохранить</button>
        </div>`,document.body.appendChild(a)}function addLessonFromTable(e,t,o,l){let a=document.getElementById("lessonDate").value,n=document.getElementById("lessonTime").value,s=document.getElementById("lessonTopic").value.trim();if(!a||!n||!s)return alert("Заполните все поля");fetch("add_lesson.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`student_id=${e}&date=${a}&time=${encodeURIComponent(n)}&topic=${encodeURIComponent(s)}&teacher_timezone=${TEACHER_TIMEZONE}`}).then(e=>e.json()).then(a=>{a.success?(document.querySelector(".modal-overlay").remove(),changeMonth(e,t,o,l)):alert(a.error)})}let currentViewMode="calendar";function openCalendar(e,t){let o=new Date;renderCalendar(e,t,o.getFullYear(),o.getMonth()+1),"table"===currentViewMode&&loadLessonsTable(e,t,o.getFullYear(),o.getMonth()+1)}function renderCalendar(e,t,o,l){Promise.all([fetch(`get_schedule.php?student_id=${e}&month=${l}&year=${o}&timezone=${TEACHER_TIMEZONE}`).then(e=>e.json()),fetch(`get_student_stats.php?student_id=${e}&month=${l}&year=${o}`).then(e=>e.json())]).then(([a,n])=>{let s=new Date(o,l-1,1),i=new Date(o,l,0),r=new Date(s);r.setDate(r.getDate()-(0===s.getDay()?6:s.getDay()-1));let d=new Date(i);d.setDate(d.getDate()+(0===d.getDay()?0:7-d.getDay()));let c="";for(let p=new Date(r);p<=d;p.setDate(p.getDate()+1)){let u=p.getFullYear(),m=String(p.getMonth()+1).padStart(2,"0"),b=String(p.getDate()).padStart(2,"0"),h=`${u}-${m}-${b}`,v=a.find(e=>e.lesson_date===h),y=p.getMonth()!==l-1,g=h===new Date().toISOString().split("T")[0],k="";v&&(k=" calendar-day--"+(v.payment_status||"none")),c+=`<div class="calendar-day ${y?"other-month":""} ${g?"today":""} ${k}" data-date="${h}" onclick="dayClick('${h}', ${e}, '${t}', ${o}, ${l})">
                <div class="calendar-date">${p.getDate()}</div>
                ${v?`<div class="lesson-badge">${v.time?.slice(0,5)} ${escapeHtml(v.topic)}</div>`:""}
            </div>`}let f=`
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
            ${f}
            <div class="schedule-mode-switcher" style="margin-bottom:20px;">
                <button id="switchCalendar" class="schedule-mode-btn ${w?"active":""}" onclick="switchViewMode(${e}, '${t}', ${o}, ${l})">📅 Календарь</button>
                <button id="switchTable" class="schedule-mode-btn ${w?"":"active"}" onclick="switchViewMode(${e}, '${t}', ${o}, ${l})">📋 Таблица</button>
            </div>
            <div id="calendarPanel" style="display:${w?"":"none"};">
                <div class="calendar">
                    <div class="calendar-header">
                        <button class="btn btn--ghost" onclick="changeMonth(${e}, '${t}', ${1===l?o-1:o}, ${1===l?12:l-1})">←</button>
                        <div class="calendar-title">${["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"][l-1]} ${o}</div>
                        <button class="btn btn--ghost" onclick="changeMonth(${e}, '${t}', ${12===l?o+1:o}, ${12===l?1:l+1})">→</button>
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
            </div>`),"table"===currentViewMode&&loadLessonsTable(e,t,o,l)}).catch(()=>alert("Ошибка загрузки расписания"))}function dayClick(e,t,o,l,a){fetch(`get_lesson.php?student_id=${t}&date=${e}`).then(e=>e.json()).then(n=>{n&&n.id?openLessonPage(n,t,o,l,a):openAddLessonModal(e,t,o,l,a)}).catch(()=>openAddLessonModal(e,t,o,l,a))}function openAddLessonModal(e,t,o,l,a){let n=document.createElement("div");n.className="modal-overlay active",n.innerHTML=`
        <div class="modal">
            <button class="modal__close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            <h3>Добавить урок на ${e}</h3>
            <div class="form-group"><label class="form-label">Время</label><input type="time" id="lessonTime" class="form-input"></div>
            <div class="form-group"><label class="form-label">Тема</label><input type="text" id="lessonTopic" class="form-input"></div>
            <button class="btn btn--primary" onclick="addLesson(${t}, '${e}', ${l}, ${a}, '${o}')">Сохранить</button>
        </div>`,document.body.appendChild(n)}function addLesson(e,t,o,l,a){let n=document.getElementById("lessonTime").value,s=document.getElementById("lessonTopic").value.trim();if(!n||!s)return alert("Заполните время и тему");let i=parseInt(n.split(":")[0],10);(!(i<8)&&!(i>=21)||confirm("\uD83D\uDD52 Время выходит за рамки обычного рабочего дня (08:00–21:00).\n\nВсё равно сохранить урок?"))&&fetch("add_lesson.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`student_id=${e}&date=${t}&time=${encodeURIComponent(n)}&topic=${encodeURIComponent(s)}&teacher_timezone=${TEACHER_TIMEZONE}`}).then(e=>e.json()).then(t=>{t.success?(document.querySelector(".modal-overlay").remove(),renderCalendar(e,a,o,l)):alert(t.error)})}function openLessonPage(e,t,o,l,a){window.currentLessonData={lesson:e,studentId:t,studentName:o,year:l,month:a};let n=e.time?e.time.slice(0,5):"",s=escapeHtml(e.topic),i=escapeHtml(e.comment),r=escapeHtml(e.recording_link);setMainContent(`
        <button class="btn-back" onclick="changeMonth(${t}, '${o}', ${l}, ${a})">Назад</button>
        <h2>${e.lesson_date} — ${s}</h2>
        <div class="form-group"><label class="form-label">Время</label><input type="time" id="editTime" class="form-input" value="${n||""}"></div>
        <div class="form-group"><label class="form-label">Тема</label><input type="text" id="editTopic" class="form-input" value="${s}"></div>
        <div class="form-group">
            <label class="form-label">Прикреплённые файлы</label>
            <div id="lessonFilesContainer"></div>
            <div class="form-group">
                <label class="form-label">Статус оплаты</label>
                <span id="paymentBadge" class="badge badge--${e.payment_status||"none"} badge--clickable" 
                    onclick="cyclePaymentStatus(${e.id})">
                    ${getPaymentLabel(e.payment_status)}
                </span>
            </div>
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
        <div style="display:flex; gap:12px;">
            <button class="btn btn--primary" onclick="updateLesson(${e.id}, ${t}, '${o}', ${l}, ${a})">Сохранить</button>
            <button class="btn btn--danger" onclick="deleteLesson(${e.id}, ${t}, '${o}', ${l}, ${a})">Удалить</button>
        </div>`),loadFiles("lesson",e.id,"lessonFilesContainer")}function updateLesson(e,t,o,l,a){let n=document.getElementById("editTime").value,s=document.getElementById("editTopic").value.trim(),i=document.getElementById("editComment").value.trim(),r=document.getElementById("editLink").value.trim(),d=document.getElementById("paymentBadge"),c="none";if(d){let p=d.textContent.trim();c=({"Не указан":"none",Оплачено:"paid","Не оплачено":"unpaid",Ожидается:"pending"})[p]||"none"}fetch("update_lesson.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`id=${e}&time=${encodeURIComponent(n)}&topic=${encodeURIComponent(s)}&comment=${encodeURIComponent(i)}&recording_link=${encodeURIComponent(r)}&payment_status=${c}&teacher_timezone=${TEACHER_TIMEZONE}`}).then(e=>e.json()).then(e=>e.success?changeMonth(t,o,l,a):alert(e.error))}function deleteLesson(e,t,o,l,a){confirm("Удалить урок?")&&fetch("delete_lesson.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`id=${e}`}).then(e=>e.json()).then(e=>e.success?changeMonth(t,o,l,a):alert(e.error))}let currentScheduleMode="day",currentScheduleDate=new Date().toISOString().split("T")[0];function renderTeacherSchedule(){setMainContent(`
        <div class="dashboard-header">
            <h2>📅 Моё расписание</h2>
            <div class="schedule-mode-switcher">
                <button class="schedule-mode-btn ${"day"===currentScheduleMode?"active":""}" onclick="switchScheduleMode('day')">День</button>
                <button class="schedule-mode-btn ${"week"===currentScheduleMode?"active":""}" onclick="switchScheduleMode('week')">Неделя</button>
                <button class="schedule-mode-btn ${"month"===currentScheduleMode?"active":""}" onclick="switchScheduleMode('month')">Месяц</button>
            </div>
        </div>
        <div id="scheduleContent"></div>
    `),loadScheduleContent()}function switchScheduleMode(e){currentScheduleMode=e,"day"!==e&&(currentScheduleDate=new Date().toISOString().split("T")[0]),document.querySelectorAll(".schedule-mode-btn").forEach(e=>e.classList.remove("active")),event.target.classList.add("active"),loadScheduleContent()}function loadScheduleContent(){let e=document.getElementById("scheduleContent");if(e){if("day"===currentScheduleMode)loadDaySchedule(currentScheduleDate);else if("week"===currentScheduleMode)loadWeekSchedule(currentScheduleDate);else if("month"===currentScheduleMode){let[t,o]=currentScheduleDate.split("-");loadMonthSchedule(parseInt(t),parseInt(o))}}}function loadDaySchedule(e){fetch(`get_teacher_schedule.php?date=${e}&timezone=${TEACHER_TIMEZONE}`).then(e=>e.json()).then(t=>{let o=new Date(e).toLocaleDateString("ru-RU",{year:"numeric",month:"long",day:"numeric"}),l=`
                <div class="schedule-day-header">
                    <div class="schedule-date-nav">
                        <button class="btn btn--ghost" onclick="loadDaySchedule('${shiftDate(e,-1)}')">←</button>
                        <span class="date-title">${o}</span>
                        <button class="btn btn--ghost" onclick="loadDaySchedule('${shiftDate(e,1)}')">→</button>
                        <button class="btn btn--secondary" onclick="loadDaySchedule('${new Date().toISOString().split("T")[0]}')">Сегодня</button>
                    </div>
                </div>`;0===t.length?l+='<div class="empty-state"><div class="empty-icon">\uD83D\uDCC5</div><h3>Нет уроков</h3></div>':(l+='<div class="schedule-list">',t.forEach(e=>{let t=e.time?e.time.slice(0,5):"",o=`${e.first_name} ${e.last_name||""}`.trim(),a=getPaymentLabel(e.payment_status);l+=`
                        <div class="schedule-lesson-card" onclick="openTeacherLessonFromSchedule(${e.student_id}, '${e.lesson_date}')">
                            <div class="schedule-lesson-info">
                                <div class="schedule-lesson-time">🕒 ${t}</div>
                                <div class="schedule-lesson-student">👤 ${o}</div>
                                <div class="schedule-lesson-topic">${escapeHtml(e.topic)||"Без темы"}</div>
                            </div>
                            <div class="schedule-lesson-badges">
                                <span class="badge badge--${e.payment_status}">${a}</span>
                                ${e.recording_link?'<span class="badge badge--primary">\uD83C\uDFA5</span>':""}
                            </div>
                        </div>`}),l+="</div>"),document.getElementById("scheduleContent").innerHTML=l,currentScheduleDate=e})}function loadWeekSchedule(e){let t=getMonday(e),o=shiftDate(t,6);fetch(`get_teacher_schedule.php?start_date=${t}&end_date=${o}&timezone=${TEACHER_TIMEZONE}`).then(e=>e.json()).then(e=>{let l=`
                <div class="schedule-day-header">
                    <div class="schedule-date-nav">
                        <button class="btn btn--ghost" onclick="loadWeekSchedule('${shiftDate(t,-7)}')">←</button>
                        <span class="date-title">${formatDate(t)} – ${formatDate(o)}</span>
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
                    <div class="week-day-header">ВС</div>`;for(let a=0;a<7;a++){let n=shiftDate(t,a),s=e.filter(e=>e.lesson_date===n),i=n===new Date().toISOString().split("T")[0];l+=`<div class="week-day-cell" onclick="openDayFromWeek('${n}')">
                    <div class="week-day-date ${i?"today":""}">${new Date(n).getDate()}</div>`,s.forEach(e=>{l+=`<span class="week-lesson-dot">${e.time?.slice(0,5)} ${e.first_name}</span>`}),l+="</div>"}l+="</div>",document.getElementById("scheduleContent").innerHTML=l,currentScheduleDate=t})}function loadMonthSchedule(e,t){let o=`${e}-${String(t).padStart(2,"0")}-01`,l=`${e}-${String(t).padStart(2,"0")}-${new Date(e,t,0).getDate()}`;fetch(`get_teacher_schedule.php?start_date=${o}&end_date=${l}&timezone=${TEACHER_TIMEZONE}`).then(e=>e.json()).then(o=>{let l=new Date(e,t-1,1),a=new Date(e,t,0),n=new Date(l),s=n.getDay();n.setDate(n.getDate()+(0===s?-6:1-s));let i=new Date(a),r=i.getDay();i.setDate(i.getDate()+(0===r?0:7-r));let d="";for(let c=new Date(n);c<=i;c.setDate(c.getDate()+1)){let p=c.getFullYear(),u=String(c.getMonth()+1).padStart(2,"0"),m=String(c.getDate()).padStart(2,"0"),b=`${p}-${u}-${m}`,h=o.filter(e=>e.lesson_date===b),v=c.getMonth()!==t-1,y=b===new Date().toISOString().split("T")[0];d+=`<div class="calendar-day ${v?"other-month":""} ${y?"today":""}" onclick="openDayFromMonth('${b}')">
                    <div class="calendar-date">${c.getDate()}</div>`,h.forEach(e=>{d+=`<span class="lesson-dot">${e.time?.slice(0,5)} ${e.first_name}</span>`}),d+="</div>"}let g=`
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
                </div>`;document.getElementById("scheduleContent").innerHTML=g,currentScheduleDate=`${e}-${String(t).padStart(2,"0")}-01`})}function openDayFromWeek(e){currentScheduleMode="day",currentScheduleDate=e,document.querySelectorAll(".schedule-mode-btn").forEach(e=>{e.classList.remove("active"),"День"===e.textContent.trim()&&e.classList.add("active")}),loadDaySchedule(e)}function openDayFromMonth(e){currentScheduleMode="day",currentScheduleDate=e,document.querySelectorAll(".schedule-mode-btn").forEach(e=>{e.classList.remove("active"),"День"===e.textContent.trim()&&e.classList.add("active")}),loadDaySchedule(e)}function openTeacherLessonFromSchedule(e,t){let[o,l]=t.split("-");renderCalendar(e,"Ученик",parseInt(o),parseInt(l))}function shiftDate(e,t){let o=new Date(e);return o.setDate(o.getDate()+t),o.toISOString().split("T")[0]}function getMonday(e){let t=new Date(e),o=t.getDay(),l=t.getDate()-o+(0===o?-6:1);return t.setDate(l),t.toISOString().split("T")[0]}function formatDate(e){return new Date(e).toLocaleDateString("ru-RU",{day:"numeric",month:"long"})}function openAvatarModal(){let e="undefined"!=typeof TEACHER_AVATAR?TEACHER_AVATAR:"",t=document.querySelector(".welcome-avatar")?.textContent.trim()||"?",o="";o=e?`<img src="${e}?t=${new Date().getTime()}" class="avatar-modal-preview" id="avatarPreview" alt="Аватар">`:`<div class="avatar-modal-placeholder" id="avatarPreview">${t}</div>`;let l=document.createElement("div");l.className="modal-overlay active",l.innerHTML=`
        <div class="modal">
            <button class="modal__close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            <h3>Изменить фото</h3>
            <div style="text-align:center;">${o}</div>
            <div style="display:flex; gap:8px; margin-top:16px;">
                <input type="file" id="avatarFileInput" accept="image/*" style="flex:1;">
                <button class="btn btn--primary" onclick="uploadAvatar()">Загрузить</button>
            </div>
            ${e?`<button class="btn btn--danger" style="width:100%; margin-top:8px;" onclick="deleteAvatar()">Удалить фото</button>`:""}
        </div>`,document.body.appendChild(l)}function uploadAvatar(){let e=document.getElementById("avatarFileInput");if(!e||!e.files.length){alert("Выберите файл");return}let t=new FormData;t.append("avatar",e.files[0]),fetch("upload_avatar.php",{method:"POST",body:t}).then(e=>e.json()).then(e=>{e.success?(updateSidebarAvatar(e.avatar),document.querySelector(".modal-overlay").remove()):alert("Ошибка: "+e.error)}).catch(()=>alert("Ошибка сети"))}function deleteAvatar(){confirm("Удалить фото и вернуть букву?")&&fetch("delete_avatar.php",{method:"POST"}).then(e=>e.json()).then(e=>{e.success?(updateSidebarAvatar(""),document.querySelector(".modal-overlay").remove()):alert("Ошибка: "+e.error)}).catch(()=>alert("Ошибка сети"))}function updateSidebarAvatar(e){let t=document.querySelector(".sidebar__welcome .welcome-avatar"),o=document.querySelector(".sidebar__welcome .welcome-avatar-img");if(e){if(o)o.src=e+"?t="+new Date().getTime();else if(t){let l=document.createElement("img");l.src=e+"?t="+new Date().getTime(),l.className="welcome-avatar-img",l.alt="Аватар",t.replaceWith(l)}}else if(o){let a=document.createElement("div");a.className="welcome-avatar",a.textContent=o.alt?.charAt(0)||"?",o.replaceWith(a)}}function copyToClipboard(e,t){if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(e).then(()=>{let e=t.textContent;t.textContent="✓ Скопировано",setTimeout(()=>{t.textContent=e},1500)});else{let o=document.createElement("textarea");o.value=e,o.style.position="fixed",o.style.opacity="0",document.body.appendChild(o),o.select(),document.execCommand("copy"),document.body.removeChild(o);let l=t.textContent;t.textContent="✓ Скопировано",setTimeout(()=>{t.textContent=l},1500)}}function copyToClipboard(e,t){if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(e).then(()=>{let e=t.textContent;t.textContent="✓ Скопировано",setTimeout(()=>{t.textContent=e},1500)});else{let o=document.createElement("textarea");o.value=e,o.style.position="fixed",o.style.opacity="0",document.body.appendChild(o),o.select(),document.execCommand("copy"),document.body.removeChild(o);let l=t.textContent;t.textContent="✓ Скопировано",setTimeout(()=>{t.textContent=l},1500)}}function applyHiddenSections(){"undefined"!=typeof HIDDEN_SECTIONS&&HIDDEN_SECTIONS&&HIDDEN_SECTIONS.forEach(e=>{let t=document.querySelector(`.sidebar__link[data-tab="${e}"]`);t&&(t.style.display="none")})}function openSidebarEditor(){let e=[],t="undefined"!=typeof SIDEBAR_CUSTOMIZATION?SIDEBAR_CUSTOMIZATION:{},o="undefined"!=typeof HIDDEN_SECTIONS&&Array.isArray(HIDDEN_SECTIONS)?HIDDEN_SECTIONS:[];[{key:"library",name:"Библиотека заданий",icon:"\uD83D\uDCD6"},{key:"lectures",name:"Лекции",icon:"\uD83D\uDCDA"},{key:"help",name:"Справка",icon:"\uD83D\uDCD8"},{key:"add-custom-block",name:"Добавить раздел",icon:"+"}].forEach(l=>{let a=t[l.key]||{};e.push({key:l.key,title:a.title||l.name,icon:a.icon||l.icon,visible:!o.includes(l.key)})}),document.querySelectorAll('.sidebar__link[data-tab^="custom_"]').forEach(l=>{let a=l.getAttribute("data-tab"),n=a,s=t[n]||{},i=s.title||l.textContent.replace(/^📌\s*/,"").trim();e.push({key:n,title:i,icon:s.icon||"\uD83D\uDCCC",visible:!o.includes(n)})});let l=["\uD83D\uDCD6","\uD83D\uDCDA","\uD83D\uDCCB","\uD83D\uDCD8","\uD83D\uDCC5","\uD83D\uDCDD","\uD83D\uDCCC","\uD83D\uDCC1","\uD83D\uDCCE","\uD83D\uDCCA","\uD83D\uDCC8","\uD83D\uDCC9","\uD83C\uDF93","\uD83C\uDFC6","\uD83D\uDCA1","\uD83D\uDCE3","\uD83D\uDCE2","\uD83D\uDD14","✨","\uD83D\uDD25","\uD83D\uDC8E","\uD83C\uDFAF"],a="";e.forEach((e,t)=>{let o=e.visible?"checked":"";a+=`
            <div class="sidebar-editor-row" data-key="${e.key}">
                <div class="sidebar-editor-cell">
                    <input type="text" class="form-input sidebar-editor-title" value="${e.title}" placeholder="Название">
                </div>
                <div class="sidebar-editor-cell">
                    <select class="form-select sidebar-editor-icon">${l.map(t=>`<option value="${t}" ${e.icon===t?"selected":""}>${t}</option>`).join("")}</select>
                </div>
                <div class="sidebar-editor-cell" style="text-align:center;">
                    <label><input type="checkbox" class="sidebar-editor-visible" ${o}> Показывать</label>
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
        </div>`,document.body.appendChild(n)}function saveSidebarEditor(){let e=document.querySelectorAll(".sidebar-editor-row"),t=[],o=[];e.forEach(e=>{let l=e.dataset.key,a=e.querySelector(".sidebar-editor-title"),n=e.querySelector(".sidebar-editor-icon"),s=e.querySelector(".sidebar-editor-visible"),i=a?a.value.trim():"",r=n?n.value:"",d=!s||s.checked;t.push({key:l,title:i,icon:r}),d||o.push(l)}),fetch("save_sidebar_customization.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:"data="+encodeURIComponent(JSON.stringify(t))}).then(e=>e.json()).then(e=>{if(e.success)return fetch("save_hidden_sections.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:"hidden_sections="+encodeURIComponent(JSON.stringify(o))});throw Error(e.error||"Ошибка сохранения")}).then(e=>e.json()).then(e=>{e.success?(window.SIDEBAR_CUSTOMIZATION={},t.forEach(e=>{(e.title||e.icon)&&(window.SIDEBAR_CUSTOMIZATION[e.key]={title:e.title,icon:e.icon})}),window.HIDDEN_SECTIONS=o,applySidebarCustomization(),applyHiddenSections(),document.querySelector(".modal-overlay").remove()):alert("Ошибка сохранения видимости")}).catch(e=>{alert("Ошибка: "+e.message)})}function applySidebarCustomization(){if("undefined"==typeof SIDEBAR_CUSTOMIZATION||!SIDEBAR_CUSTOMIZATION)return;let e=SIDEBAR_CUSTOMIZATION;document.querySelectorAll(".sidebar__link[data-tab]").forEach(t=>{let o=t.getAttribute("data-tab");if(!o||o.startsWith("custom_"))return;let l=e[o];if(l){if(l.icon){let a=t.textContent.replace(/^.\s*/,l.icon+" ");t.textContent=a}if(l.title){let n=t.childNodes;n.length>1&&3===n[1].nodeType?n[1].textContent=" "+l.title:t.childNodes[0].textContent=l.icon?l.icon+" "+l.title:l.title}}}),document.querySelectorAll('.sidebar__link[data-tab^="custom_"]').forEach(t=>{let o=t.getAttribute("data-tab"),l=e[o];l&&(l.icon?t.textContent=l.icon+" "+(l.title||t.textContent.replace(/^📌\s*/,"").trim()):l.title&&(t.textContent="\uD83D\uDCCC "+l.title))})}function openEditStudentModal(e,t,o,l){let a=document.createElement("div");a.className="modal-overlay active",a.innerHTML=`
        <div class="modal">
            <button class="modal__close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            <h3>Редактировать ученика</h3>
            <div class="form-group"><label class="form-label">Имя</label><input type="text" id="studFirstName" class="form-input" value="${t}"></div>
            <div class="form-group"><label class="form-label">Фамилия</label><input type="text" id="studLastName" class="form-input" value="${o}"></div>
            <div class="form-group"><label class="form-label">Предмет</label><input type="text" id="studSubject" class="form-input" value="${l}"></div>
            <button class="btn btn--primary" onclick="updateStudent(${e})">Сохранить</button>
        </div>`,document.body.appendChild(a)}function updateStudent(e){let t=document.getElementById("studFirstName").value.trim(),o=document.getElementById("studLastName").value.trim(),l=document.getElementById("studSubject").value.trim();if(!t)return alert("Имя обязательно");fetch("update_student.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`id=${e}&first_name=${encodeURIComponent(t)}&last_name=${encodeURIComponent(o)}&subject=${encodeURIComponent(l)}`}).then(e=>e.json()).then(e=>{e.success?(document.querySelector(".modal-overlay").remove(),renderStudents()):alert(e.error)}).catch(()=>alert("Ошибка сети"))}function showBetaNotice(){if("1"===sessionStorage.getItem("beta_notice_shown"))return;sessionStorage.setItem("beta_notice_shown","1");let e=document.createElement("div");e.className="modal-overlay active",e.innerHTML=`
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
        </div>`,document.body.appendChild(e)}function openAddHomeworkCategoryModal(e,t){let o=document.createElement("div");o.className="modal-overlay active",o.innerHTML=`
        <div class="modal">
            <button class="modal__close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            <h3>Новая категория для ${t}</h3>
            <div class="form-group"><label class="form-label">Название категории</label><input type="text" id="categoryName" class="form-input"></div>
            <button class="btn btn--primary" onclick="addHomeworkCategory(${e}, '${t.replace(/'/g,"\\'")}')">Создать</button>
        </div>`,document.body.appendChild(o)}function addHomeworkCategory(e,t){let o=document.getElementById("categoryName").value.trim();if(!o)return alert("Введите название");fetch("add_homework_category.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`student_id=${e}&name=${encodeURIComponent(o)}`}).then(e=>e.json()).then(o=>{o.success?(document.querySelector(".modal-overlay").remove(),openHomeworkStudent(e,t)):alert(o.error)})}function openEditHomeworkCategoryModal(e,t,o,l){let a=document.createElement("div");a.className="modal-overlay active",a.innerHTML=`
        <div class="modal">
            <button class="modal__close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            <h3>Переименовать категорию</h3>
            <div class="form-group"><label class="form-label">Название</label><input type="text" id="categoryName" class="form-input" value="${t}"></div>
            <button class="btn btn--primary" onclick="updateHomeworkCategory(${e}, ${o}, '${l.replace(/'/g,"\\'")}')">Сохранить</button>
        </div>`,document.body.appendChild(a)}function updateHomeworkCategory(e,t,o){let l=document.getElementById("categoryName").value.trim();if(!l)return alert("Введите название");fetch("update_homework_category.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`id=${e}&name=${encodeURIComponent(l)}`}).then(e=>e.json()).then(e=>{e.success?(document.querySelector(".modal-overlay").remove(),openHomeworkStudent(t,o)):alert(e.error)})}function deleteHomeworkCategory(e,t,o){confirm('Удалить категорию? Блоки останутся, но переместятся в "Без категории".')&&fetch("delete_homework_category.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`id=${e}`}).then(e=>e.json()).then(e=>{e.success?openHomeworkStudent(t,o):alert(e.error)})}function openAddHomeworkBlockModal(e,t,o=null){fetch(`get_homework_categories.php?student_id=${e}`).then(e=>e.json()).then(l=>{let a='<option value="">Без категории</option>';l.forEach(e=>{a+=`<option value="${e.id}" ${e.id==o?"selected":""}>${e.name}</option>`});let n=document.createElement("div");n.className="modal-overlay active",n.innerHTML=`
                <div class="modal">
                    <button class="modal__close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                    <h3>Новый блок заданий для ${t}</h3>
                    <div class="form-group"><label class="form-label">Название блока</label><input type="text" id="blockName" class="form-input"></div>
                    <div class="form-group"><label class="form-label">Категория</label><select id="blockCategory" class="form-select">${a}</select></div>
                    <button class="btn btn--primary" onclick="addHomeworkBlock(${e}, '${t.replace(/'/g,"\\'")}', ${o||"null"})">Создать</button>
                </div>`,document.body.appendChild(n)})}function addHomeworkBlock(e,t,o=null){let l=document.getElementById("blockName").value.trim(),a=document.getElementById("blockCategory")?.value||o||"";if(!l)return alert("Введите название");fetch("add_homework_block.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`student_id=${e}&name=${encodeURIComponent(l)}&category_id=${a}`}).then(e=>e.json()).then(t=>{t.success?(document.querySelector(".modal-overlay").remove(),fetch(`get_homework_blocks.php?student_id=${e}&category_id=all`).then(e=>e.json()).then(e=>{window.currentHomeworkData.blocks=e,renderHomeworkTabs(window.lastHomeworkCategoryId)})):alert(t.error)})}function openTimezoneModal(){let e="undefined"!=typeof TEACHER_TIMEZONE?TEACHER_TIMEZONE:"Europe/Moscow",t="";[{value:"Europe/Moscow",label:"Москва (UTC+3)"},{value:"Europe/Kaliningrad",label:"Калининград (UTC+2)"},{value:"Europe/Samara",label:"Самара (UTC+4)"},{value:"Asia/Yekaterinburg",label:"Екатеринбург (UTC+5)"},{value:"Asia/Omsk",label:"Омск (UTC+6)"},{value:"Asia/Krasnoyarsk",label:"Красноярск (UTC+7)"},{value:"Asia/Irkutsk",label:"Иркутск (UTC+8)"},{value:"Asia/Yakutsk",label:"Якутск (UTC+9)"},{value:"Asia/Vladivostok",label:"Владивосток (UTC+10)"},{value:"Asia/Kamchatka",label:"Камчатка (UTC+12)"},{value:"Europe/Minsk",label:"Минск (UTC+3)"},{value:"Asia/Almaty",label:"Алматы (UTC+6)"},].forEach(o=>{let l=o.value===e?" selected":"";t+=`<option value="${o.value}"${l}>${o.label}</option>`});let o=document.createElement("div");o.className="modal-overlay active",o.innerHTML=`
        <div class="modal" style="max-width:400px;">
            <button class="modal__close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            <h3>Часовой пояс</h3>
            <div class="form-group">
                <label class="form-label">Ваш часовой пояс</label>
                <select id="teacherTimezone" class="form-select">${t}</select>
            </div>
            <button class="btn btn--primary" onclick="saveTimezone()">Сохранить</button>
        </div>`,document.body.appendChild(o)}function saveTimezone(){let e=document.getElementById("teacherTimezone");if(!e)return;let t=e.value;fetch("update_teacher_timezone.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`timezone=${encodeURIComponent(t)}`}).then(e=>e.json()).then(e=>{if(e.success){if(document.querySelector(".modal-overlay").remove(),TEACHER_TIMEZONE=t,alert("Часовой пояс сохранён. Время уроков пересчитано."),window.currentCalendarData){let{studentId:o,studentName:l,year:a,month:n}=window.currentCalendarData;renderCalendar(o,l,a,n),loadLessonsTable(o,l,a,n)}if(window.currentLessonData){let{lesson:s,studentId:i,studentName:r,year:d,month:c}=window.currentLessonData;openLessonPage(s,i,r,d,c)}}else alert("Ошибка: "+e.error)}).catch(()=>alert("Ошибка сети"))}function escapeHtml(e){return e?String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;"):""}document.addEventListener("click",function(e){let t=e.target.closest(".add-library-task-btn");if(t){let o=t.dataset.blockId,l=t.dataset.blockName?decodeURIComponent(t.dataset.blockName):"";o&&openAddLibraryTaskModal(o,l);return}let a=e.target.closest(".edit-task-btn");if(a){let n=a.closest(".library-task");if(n){let s=n.dataset.taskId,i=decodeURIComponent(n.dataset.title||""),r=decodeURIComponent(n.dataset.text||""),d=decodeURIComponent(n.dataset.links||""),c=n.dataset.blockId||null,p=n.dataset.blockName?decodeURIComponent(n.dataset.blockName):"";s&&openEditLibraryTaskModal(s,i,r,d,c,p)}return}let u=e.target.closest(".delete-task-btn");if(u){let m=u.closest(".library-task");if(m){let b=m.dataset.taskId;b&&deleteLibraryTask(b)}return}let h=e.target.closest(".assign-task-btn");if(h){let v=h.closest(".library-task");if(v){let y=v.dataset.taskId;y&&assignLibraryTaskToStudent(y)}return}}),document.addEventListener("click",function(e){let t=e.target.closest(".edit-library-block-btn");if(t){e.stopPropagation();let o=t.closest(".library-block");if(o){let l=o.dataset.blockId,a=o.querySelector(".block-card__title")?.textContent.trim()||"",n=o.dataset.sectionId||null;openEditLibraryBlockModal(l,a,n)}return}let s=e.target.closest(".delete-library-block-btn");if(s){e.stopPropagation();let i=s.closest(".library-block");if(i){let r=i.dataset.blockId;r&&deleteLibraryBlock(r)}return}});const Onboarding={active:!1,stepIndex:0,isReplay:!1,bars:null,pulse:null,tooltip:null,beforeUnloadHandler:null,_refreshInterval:null,_currentTarget:null,steps:[{id:"welcome",type:"center",text:"Добро пожаловать в TeachForum! Мы настроим кабинет для работы. Начнём с добавления первого ученика.",btn:"Начать",allowSkip:!0},{id:"addStudentBtn",type:"click",text:"Нажмите сюда, чтобы создать профиль ученика.",selector:'#mainContent .btn-add[onclick*="openAddStudentModal"]',find:()=>document.querySelector('#mainContent .btn-add[onclick*="openAddStudentModal"]')},{id:"clickCreateStudent",type:"click",text:"Введите имя, фамилию и нажмите \xabСоздать\xbb.",selector:".modal .btn--primary",find:()=>document.querySelector(".modal .btn--primary")},{id:"waitForCredentialsModal",type:"modalClose",text:"",find:()=>null,noTooltip:!0},{id:"openStudentCalendar",type:"click",text:"Кликните по строке ученика, чтобы открыть его календарь.",selector:"#mainContent .table-responsive tbody tr",find:()=>document.querySelector("#mainContent .table-responsive tbody tr")},{id:"addLessonDay",type:"click",text:"Выберите свободную дату в календаре, чтобы создать урок.",selector:".calendar-day:not(.other-month)",find:()=>document.querySelector(".calendar-day:not(.other-month)")},{id:"lessonForm",type:"modalClose",text:"Укажите время, тему и нажмите \xabСохранить\xbb.",find:()=>document.querySelector(".modal-overlay.active .modal")},{id:"showSchedule",type:"click",text:"Теперь перейдите в \xabМоё расписание\xbb.",selector:'.sidebar__link[data-tab="schedule"]',find:()=>document.querySelector('.sidebar__link[data-tab="schedule"]')},{id:"switchToMonth",type:"click",text:"Переключитесь на вид \xabМесяц\xbb, чтобы увидеть созданный урок.",selector:".schedule-mode-btn",matches:e=>(e.textContent||"").includes("Месяц"),find:()=>Array.from(document.querySelectorAll(".schedule-mode-btn")).find(e=>(e.textContent||"").includes("Месяц"))},{id:"showScheduleLesson",type:"center",text:"Отлично! Урок появился в вашем расписании. Теперь научимся работать с заданиями.",btn:"Далее"},{id:"goToHomework",type:"click",text:"Перейдите в раздел \xabДомашние задания\xbb.",selector:'.sidebar__link[data-tab="homeworks"]',find:()=>document.querySelector('.sidebar__link[data-tab="homeworks"]')},{id:"selectStudentInHomework",type:"click",text:"Выберите того же ученика в списке.",selector:"#mainContent .table-responsive tbody tr",find:()=>document.querySelector("#mainContent .table-responsive tbody tr")},{id:"goToLibrary",type:"click",text:"Теперь перейдите в \xabБиблиотеку заданий\xbb.",selector:'.sidebar__link[data-tab="library"]',find:()=>document.querySelector('.sidebar__link[data-tab="library"]')},{id:"addLibrarySection",type:"click",text:"Создайте раздел для заданий – нажмите \xab+ Раздел\xbb.",selector:'.btn-add[onclick*="openAddLibrarySectionModal"]',find:()=>document.querySelector('.btn-add[onclick*="openAddLibrarySectionModal"]')},{id:"libSectionForm",type:"modalClose",text:"Введите название раздела и нажмите \xabСоздать\xbb.",find:()=>document.querySelector(".modal-overlay.active .modal")},{id:"addLibraryBlock",type:"click",text:"Внутри раздела нажмите \xab+ Добавить блок\xbb.",selector:'.library-section .btn-add[onclick*="openAddLibraryBlockModal"]',find(){let e=document.querySelector(`.library-section[data-section-id="${window.__lastLibrarySectionId||""}"] .btn-add[onclick*="openAddLibraryBlockModal"]`);if(e)return e;let t=document.querySelectorAll('.library-section .btn-add[onclick*="openAddLibraryBlockModal"]');return t.length?t[t.length-1]:null}},{id:"libBlockForm",type:"modalClose",text:"Назовите блок и создайте его.",find:()=>document.querySelector(".modal-overlay.active .modal")},{id:"openLibraryBlock",type:"click",text:"Кликните по созданному блоку, чтобы открыть его.",selector:".library-block",find(){let e=document.querySelector(`.library-block[data-block-id="${window.__lastLibraryBlockId||""}"]`);if(e)return e;let t=document.querySelectorAll(".library-block");return t.length?t[t.length-1]:null}},{id:"addLibraryTask",type:"click",text:"Добавьте задание в блок – нажмите \xab+ Добавить задание\xbb.",selector:'.btn-add[onclick*="openAddLibraryTaskModal"]',find:()=>document.querySelector('.btn-add[onclick*="openAddLibraryTaskModal"]')},{id:"libTaskForm",type:"modalClose",text:"Заполните название, текст (опционально) и нажмите \xabСохранить\xbb.",find:()=>document.querySelector(".modal-overlay.active .modal")},{id:"assignLibraryTask",type:"click",text:"Назначьте это задание ученику – нажмите \xabНазначить ученику\xbb в карточке задания.",selector:".assign-task-btn",find:()=>document.querySelector(".assign-task-btn")},{id:"assignLibraryTaskModal",type:"modalClose",text:"Выберите ученика (поставьте галочку) и нажмите \xabНазначить выбранному\xbb.",find:()=>document.querySelector(".modal-overlay.active .modal"),tooltipPosition:"top"},{id:"showHomeworkResult",type:"center",text:"✅ Готово! Задание появилось в разделе \xabДомашние задания\xbb у ученика. Вы успешно освоили ключевые возможности TeachForum.",btn:"Понятно"},{id:"finish",type:"center",text:"Отлично! Вы освоили основы TeachForum. Теперь вы можете управлять оплатами, настраивать кабинет и использовать все возможности. Если что-то забудете — загляните в \uD83D\uDCD8 Справку в боковом меню. Успешных уроков!",btn:"Понятно"}],init(){let e=!0===window.__ONBOARDING_COMPLETED__,t=window.innerWidth<768,o=document.getElementById("onboardingReplayBtn");o&&(t?o.style.display="none":(o.style.display=e?"":"none",o.addEventListener("click",e=>{e.preventDefault(),this.start(!0)}))),e||(t?"1"!==localStorage.getItem("teachforum_mobile_notice_shown")&&this.showMobileNotice():setTimeout(()=>this.start(!1),1200))},showMobileNotice(){localStorage.setItem("teachforum_mobile_notice_shown","1");let e=document.createElement("div");e.className="modal-overlay active",e.innerHTML=`
        <div class="modal" style="max-width: 400px;">
            <div class="modal__close" onclick="this.closest('.modal-overlay').remove();">&times;</div>
            <h3 style="text-align:center; margin-bottom:12px;">💻 Обучение только на компьютере</h3>
            <p style="color: var(--text-secondary); margin-bottom: 16px; line-height: 1.5;">
                Для прохождения пошагового обучения войдите в аккаунт с компьютера.
                На телефоне вы можете пользоваться всеми функциями сервиса, просто обучение будет доступно позже с десктопа.
            </p>
            <button class="btn btn--primary" style="width:100%;" onclick="this.closest('.modal-overlay').remove();">Понятно</button>
        </div>`,document.body.appendChild(e)},start(e){if(this.active&&this.destroy(),this.isReplay=e,this.active=!0,this.stepIndex=0,!e){let t=window.innerWidth-document.documentElement.clientWidth;document.body.style.paddingRight=t+"px",document.body.style.overflow="hidden",this.beforeUnloadHandler=e=>{e.preventDefault(),e.returnValue=""},window.addEventListener("beforeunload",this.beforeUnloadHandler)}this.createElements(),this.run()},destroy(){this.active=!1,this.stopRefreshLoop(),this._currentTarget=null,this.bars&&(Object.values(this.bars).forEach(e=>e.remove()),this.bars=null),this.pulse&&(this.pulse.remove(),this.pulse=null),this.tooltip&&(this.tooltip.remove(),this.tooltip=null),document.body.style.overflow="",document.body.style.paddingRight="",this.beforeUnloadHandler&&(window.removeEventListener("beforeunload",this.beforeUnloadHandler),this.beforeUnloadHandler=null)},createElements(){this.bars={},["t","r","b","l"].forEach(e=>{let t=document.createElement("div");t.className="onboarding-bar"+(this.isReplay?" onboarding-bar--soft":""),t.style.position="fixed",t.style.zIndex=150,t.style.display="none",t.style.background=this.isReplay?"rgba(0,0,0,0.35)":"rgba(0,0,0,0.55)",t.addEventListener("click",e=>{this.isReplay?this.destroy():(e.preventDefault(),e.stopPropagation())}),document.body.appendChild(t),this.bars[e]=t}),this.pulse=document.createElement("div"),this.pulse.className="onboarding-pulse",this.pulse.style.display="none",document.body.appendChild(this.pulse),this.tooltip=document.createElement("div"),this.tooltip.className="onboarding-tooltip",this.tooltip.style.display="none",document.body.appendChild(this.tooltip)},async run(){if(!this.active)return;if(this.stepIndex>=this.steps.length){this.finish();return}let e=this.steps[this.stepIndex];if("center"===e.type){this.hideBars(),this.showCenter(e);return}if("modalClose"===e.type){this.hideBars(),e.noTooltip||("top"===e.tooltipPosition?this.showTopTooltip(e.text):this.showFixedTooltip(e.text)),await this.waitForModalClose(e.noTooltip?3e4:2e4),this.hideBars(),this.stepIndex++,await this.sleep(300),this.run();return}let t=await this.waitFor(e.find,1e4);if(!t){console.warn("Onboarding: элемент не найден",e.id),this.stepIndex++,this.run();return}this._currentTarget=t,t.scrollIntoView({block:"center",behavior:"smooth"}),await this.sleep(300),this.positionBars(t),this.startRefreshLoop(),this.showFixedTooltip(e.text);let o=t=>{let l=t.target.closest(e.selector);l&&(!e.matches||e.matches(l))?(document.removeEventListener("click",o,!0),this.hideBars(),this.stepIndex++,this.showInterim("Выполняется действие…"),setTimeout(()=>this.run(),300)):this.isReplay||(t.preventDefault(),t.stopPropagation())};document.addEventListener("click",o,!0)},sleep:e=>new Promise(t=>setTimeout(t,e)),positionBars(e){if(!e||!this.bars)return;let t=e.getBoundingClientRect(),o=Math.max(0,t.left-6),l=Math.max(0,t.top-6),a=Math.min(window.innerWidth,t.right+6),n=Math.min(window.innerHeight,t.bottom+6);this.bars.t.style.cssText=`top:0;left:0;width:100%;height:${l}px;display:block;`,this.bars.r.style.cssText=`top:${l}px;left:${a}px;width:${Math.max(0,window.innerWidth-a)}px;height:${n-l}px;display:block;`,this.bars.b.style.cssText=`top:${n}px;left:0;width:100%;height:${Math.max(0,window.innerHeight-n)}px;display:block;`,this.bars.l.style.cssText=`top:${l}px;left:0;width:${o}px;height:${n-l}px;display:block;`,this.pulse&&(this.pulse.style.display="block",this.pulse.style.top=l+"px",this.pulse.style.left=o+"px",this.pulse.style.width=a-o+"px",this.pulse.style.height=n-l+"px")},hideBars(){this.stopRefreshLoop(),this._currentTarget=null,this.bars&&Object.values(this.bars).forEach(e=>e.style.display="none"),this.pulse&&(this.pulse.style.display="none"),this.tooltip&&(this.tooltip.style.display="none")},startRefreshLoop(){this._refreshInterval&&clearInterval(this._refreshInterval),this._refreshInterval=setInterval(()=>{this._currentTarget&&document.contains(this._currentTarget)&&this.positionBars(this._currentTarget)},150)},stopRefreshLoop(){this._refreshInterval&&(clearInterval(this._refreshInterval),this._refreshInterval=null)},showInterim(e){this.tooltip&&(this.tooltip.className="onboarding-tooltip",this.tooltip.style.cssText="position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); background: white; border-radius: 14px; padding: 20px 24px; box-shadow: 0 10px 40px rgba(0,0,0,0.25); z-index: 250;",this.tooltip.innerHTML=`<div class="onboarding-tooltip__text">${e}</div>`,this.tooltip.style.display="block")},showFixedTooltip(e){if(!this.tooltip)return;this.tooltip.className="onboarding-tooltip",this.tooltip.style.cssText="position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); background: white; border-radius: 14px; padding: 20px 24px; box-shadow: 0 10px 40px rgba(0,0,0,0.25); z-index: 250;";let t=`<div class="onboarding-tooltip__text">${e}</div>`;this.isReplay&&(t+='<button class="onboarding-tooltip__close" style="position:absolute;top:6px;right:8px;background:none;border:none;font-size:22px;cursor:pointer;">&times;</button>'),this.tooltip.innerHTML=t,this.tooltip.style.display="block",this.isReplay&&this.tooltip.querySelector(".onboarding-tooltip__close").addEventListener("click",()=>this.destroy())},showTopTooltip(e){if(!this.tooltip)return;this.tooltip.className="onboarding-tooltip",this.tooltip.style.cssText="position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: white; border-radius: 14px; padding: 20px 24px; box-shadow: 0 10px 40px rgba(0,0,0,0.25); z-index: 250;";let t=`<div class="onboarding-tooltip__text">${e}</div>`;this.isReplay&&(t+='<button class="onboarding-tooltip__close" style="position:absolute;top:6px;right:8px;background:none;border:none;font-size:22px;cursor:pointer;">&times;</button>'),this.tooltip.innerHTML=t,this.tooltip.style.display="block",this.isReplay&&this.tooltip.querySelector(".onboarding-tooltip__close").addEventListener("click",()=>this.destroy())},showCenter(e){if(!this.tooltip)return;this.tooltip.className="onboarding-tooltip onboarding-tooltip--center",this.tooltip.style.cssText="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; border-radius: 14px; padding: 20px 24px; box-shadow: 0 10px 40px rgba(0,0,0,0.25); z-index: 250;";let t=`<div class="onboarding-tooltip__text">${e.text}</div>`;t+='<div class="onboarding-tooltip__actions">',e.btn&&(t+=`<button class="onboarding-tooltip__btn" style="background: #0D7C3D; color: white; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer;">${e.btn}</button>`),e.allowSkip&&(t+=`<button class="onboarding-tooltip__btn onboarding-tooltip__btn--secondary" style="margin-left:10px; background: #F3F4F6; border:1px solid #E5E7EB; color: #1F2937; padding: 10px 20px; border-radius: 10px; cursor:pointer;">Пропустить обучение</button>`),t+="</div>",this.isReplay&&(t+='<button class="onboarding-tooltip__close" style="position:absolute;top:6px;right:8px;background:none;border:none;font-size:22px;cursor:pointer;">&times;</button>'),this.tooltip.innerHTML=t,this.tooltip.style.display="block",e.btn&&this.tooltip.querySelector(".onboarding-tooltip__btn").addEventListener("click",()=>{"finish"===e.id?this.finish():(this.stepIndex++,this.run())}),e.allowSkip&&this.tooltip.querySelector(".onboarding-tooltip__btn--secondary").addEventListener("click",()=>this.skip()),this.isReplay&&this.tooltip.querySelector(".onboarding-tooltip__close").addEventListener("click",()=>this.destroy())},skip(){fetch("complete_onboarding.php",{method:"POST",headers:{"X-Requested-With":"XMLHttpRequest"}}).then(e=>e.json()).then(e=>{if(e.success){window.__ONBOARDING_COMPLETED__=!0;let t=document.getElementById("onboardingReplayBtn");t&&(t.style.display="")}}).catch(()=>{}),this.destroy()},finish(){this.isReplay||fetch("complete_onboarding.php",{method:"POST",headers:{"X-Requested-With":"XMLHttpRequest"}}).then(e=>e.json()).then(e=>{if(e.success){window.__ONBOARDING_COMPLETED__=!0;let t=document.getElementById("onboardingReplayBtn");t&&(t.style.display="")}}).catch(()=>{}),this.destroy()},waitFor:(e,t=1e4)=>new Promise(o=>{let l=e();if(l){o(l);return}let a=new MutationObserver(()=>{let t=e();t&&(a.disconnect(),o(t))});a.observe(document.body,{childList:!0,subtree:!0}),setTimeout(()=>{a.disconnect(),o(null)},t)}),waitForModalClose:(e=3e4)=>new Promise(t=>{let o=0,l=Date.now(),a=()=>{if(Date.now()-l>e){t();return}let n=document.querySelector(".modal-overlay.active");if(n)o=0;else if(++o>=3){t();return}setTimeout(a,200)};a()})};"loading"===document.readyState?document.addEventListener("DOMContentLoaded",()=>Onboarding.init()):Onboarding.init();
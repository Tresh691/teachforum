function loadStudentSchedule(){let e=new Date;renderStudentCalendar(e.getFullYear(),e.getMonth()+1)}function renderStudentCalendar(e,t){fetch(`student_get_schedule.php?year=${e}&month=${t}&timezone=${STUDENT_TIMEZONE}`).then(e=>{if(!e.ok)throw Error("Ошибка сервера");return e.json()}).then(a=>{if(!Array.isArray(a))throw Error("Неверный формат данных");let l=new Date(e,t-1,1),s=new Date(e,t,0),n=new Date(l);n.setDate(n.getDate()-(0===l.getDay()?6:l.getDay()-1));let i=new Date(s);i.setDate(i.getDate()+(0===i.getDay()?0:7-i.getDay()));let o="";for(let d=new Date(n);d<=i;d.setDate(d.getDate()+1)){let c=d.getFullYear(),r=String(d.getMonth()+1).padStart(2,"0"),u=String(d.getDate()).padStart(2,"0"),m=`${c}-${r}-${u}`,p=a.find(e=>e.lesson_date===m),v=d.getMonth()!==t-1,h=m===new Date().toISOString().split("T")[0];o+=`<div class="calendar-day ${v?"other-month":""} ${h?"today":""}" onclick="${p?`viewLesson(${p.id})`:""}">
                    <div class="calendar-date">${d.getDate()}</div>
                    ${p?`<div class="lesson-badge">${p.time?.slice(0,5)} ${p.topic}</div>`:""}
                </div>`}document.getElementById("mainContent").innerHTML=`
                <div class="calendar">
                    <div class="calendar-header">
                        <button class="btn btn--ghost" onclick="renderStudentCalendar(${1===t?e-1:e}, ${1===t?12:t-1})">←</button>
                        <div class="calendar-title">${["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"][t-1]} ${e}</div>
                        <button class="btn btn--ghost" onclick="renderStudentCalendar(${12===t?e+1:e}, ${12===t?1:t+1})">→</button>
                    </div>
                    <div class="calendar-grid">
                        <div class="calendar-day-header">ПН</div><div class="calendar-day-header">ВТ</div><div class="calendar-day-header">СР</div>
                        <div class="calendar-day-header">ЧТ</div><div class="calendar-day-header">ПТ</div><div class="calendar-day-header">СБ</div><div class="calendar-day-header">ВС</div>
                        ${o}
                    </div>
                </div>`}).catch(e=>{console.error("Ошибка загрузки расписания:",e),document.getElementById("mainContent").innerHTML='<div class="empty-state"><div class="empty-icon">⚠️</div><h3>Не удалось загрузить расписание</h3><p>Попробуйте позже</p></div>'})}function viewLesson(e){fetch(`student_get_lesson.php?id=${e}&timezone=${STUDENT_TIMEZONE}`).then(e=>e.json()).then(t=>{if(!t)return;window.currentStudentLessonData={lessonId:e,lesson:t};let a=t.time?t.time.slice(0,5):"";document.getElementById("mainContent").innerHTML=`
                <button class="btn-back" onclick="loadStudentSchedule()">← Назад к календарю</button>
                <div class="lesson-detail">
                    <div class="lesson-detail__header">
                        <h2 class="lesson-detail__title">${t.topic||"Без темы"}</h2>
                        <span class="lesson-detail__date">${t.lesson_date}</span>
                    </div>
                    <div class="lesson-detail__row">
                        <span class="lesson-detail__label">Время</span>
                        <span class="lesson-detail__value">${a||"—"}</span>
                    </div>
                    <div class="lesson-detail__row">
                        <span class="lesson-detail__label">Статус оплаты</span>
                        <span class="lesson-detail__value">
                            <span class="badge badge--${t.payment_status||"none"}">${getPaymentLabelStudent(t.payment_status)}</span>
                        </span>
                    </div>
                    <div class="lesson-detail__row">
                        <span class="lesson-detail__label">Файлы</span>
                        <span class="lesson-detail__value" id="studentLessonFiles"></span>
                    </div>
                    <div class="lesson-detail__row">
                        <span class="lesson-detail__label">Комментарий</span>
                        <span class="lesson-detail__value">${t.comment||"Нет"}</span>
                    </div>
                    <div class="lesson-detail__row">
                        <span class="lesson-detail__label">Запись урока</span>
                        <span class="lesson-detail__value">
                            ${t.recording_link?getRutubeEmbed(t.recording_link)?"":`<a href="${t.recording_link}" target="_blank">Открыть запись</a>`:"Нет"}
                        </span>
                    </div>
                    ${t.recording_link&&getRutubeEmbed(t.recording_link)?getRutubeEmbed(t.recording_link):""}
                </div>`,loadStudentFiles("lesson",e,"studentLessonFiles")})}function loadStudentHomeworks(){Promise.all([fetch("student_get_homework_categories.php").then(e=>e.json()),fetch("student_get_homework_blocks.php?category_id=all").then(e=>e.json()),fetch("student_get_homeworks.php").then(e=>e.json())]).then(([e,t,a])=>{window.currentStudentHomeworkData={categories:e,blocks:t,homeworks:a},renderStudentHomeworkTabs()}).catch(e=>{console.error("Ошибка загрузки домашних заданий:",e),document.getElementById("mainContent").innerHTML='<div class="empty-state"><div class="empty-icon">\uD83D\uDCDD</div><h3>Ошибка загрузки</h3></div>'})}function renderStudentHomeworkTabs(e=null){let{categories:t,blocks:a,homeworks:l}=window.currentStudentHomeworkData,s="";t.forEach(t=>{let a=e==t.id?"active":"";s+=`<button class="schedule-mode-btn ${a}" onclick="renderStudentHomeworkTabs(${t.id})">📁 ${t.name}</button>`});let n="<h2>Домашние задания</h2>";n+=`<div class="schedule-mode-switcher" style="margin-bottom:20px;">${s=`
        <button class="schedule-mode-btn ${null===e?"active":""}" onclick="renderStudentHomeworkTabs(null)">📁 Все</button>
        ${s}
    `}</div>`;let i=a;null!==e&&"all"!==e&&(i=a.filter(t=>t.category_id==e));let o={},d=[];l.forEach(e=>{if(e.block_id){let t=i.some(t=>t.id==e.block_id);t?(o[e.block_id]||(o[e.block_id]=[]),o[e.block_id].push(e)):d.push(e)}else d.push(e)});let c="";i.forEach(e=>{let t=o[e.id]||[];c+=`
            <div class="homework-block">
                <div class="homework-block__header"><h3 class="homework-block__title">${e.name}</h3></div>
                ${t.length?`
                    <div class="table-responsive">
                        <table>
                            <thead><tr><th>Название</th><th>Текст</th><th>Статус</th><th>Ссылки</th></tr></thead>
                            <tbody>${t.map(renderHomeworkRow).join("")}</tbody>
                        </table>
                    </div>`:'<p class="block-empty-text">Нет заданий</p>'}
            </div>`}),null===e&&d.length>0&&(c+=`
            <div class="homework-block">
                <div class="homework-block__header"><h3 class="homework-block__title">Без блока</h3></div>
                ${d.length?`
                    <div class="table-responsive">
                        <table>
                            <thead><tr><th>Название</th><th>Текст</th><th>Статус</th><th>Ссылки</th></tr></thead>
                            <tbody>${d.map(renderHomeworkRow).join("")}</tbody>
                        </table>
                    </div>`:""}
            </div>`),0===i.length&&(null!==e||0===d.length)&&(c+='<div class="empty-state"><div class="empty-icon">\uD83D\uDCDD</div><h3>Нет заданий в этой категории</h3></div>'),n+=c,document.getElementById("mainContent").innerHTML=n}function loadStudentBlocks(e){let t="lecture"===e?"Лекции":"Шпоры";fetch(`student_get_blocks.php?type=${e}`).then(e=>e.json()).then(async a=>{let l=`<h2>${t}</h2>`;if(0===a.length)l+=`<div class="empty-state"><div class="empty-icon">${"lecture"===e?"\uD83D\uDCDA":"\uD83D\uDCCB"}</div><h3>Нет блоков</h3></div>`;else{for(let s of(l+='<div class="blocks-grid">',a)){let n=await fetch(`student_get_block_items.php?block_id=${s.id}`).then(e=>e.json()),i="";n.length>0?(i='<ul class="block-items-list">',n.forEach(e=>{i+=`<li>${e.title} ${e.link?`<a href="${e.link}" target="_blank">🔗</a>`:""}${e.comment?`<br><small>${e.comment}</small>`:""}</li>`}),i+="</ul>"):i=`<p class="block-empty-text">Нет материалов</p>`,l+=`
                        <div class="block-card" style="cursor:pointer;" onclick="viewStudentBlock(${s.id}, '${s.name.replace(/'/g,"\\'")}', '${e}')">
                            <h3 class="block-card__title">${s.name}</h3>
                            ${i}
                        </div>`}l+="</div>"}document.getElementById("mainContent").innerHTML=l})}function viewStudentBlock(e,t,a){fetch(`student_get_block_items.php?block_id=${e}`).then(e=>e.json()).then(e=>{let l="";e.forEach(e=>{l+=`
                    <tr style="cursor:pointer;" onclick="openStudentLessonView(${e.id}, '${e.title.replace(/'/g,"\\'")}', '${(e.link||"").replace(/'/g,"\\'")}', '${(e.comment||"").replace(/'/g,"\\'")}')">
                        <td>📄 ${e.title}</td>
                    </tr>`}),document.getElementById("mainContent").innerHTML=`
                <button class="btn-back" onclick="loadStudentBlocks('${a}')">← Назад к блокам</button>
                <h2>${t}</h2>
                ${e.length?`<div class="table-responsive elegant-table"><table><thead><tr><th>Название</th></tr></thead><tbody>${l}</tbody></table></div>`:'<div class="empty-state"><div class="empty-icon">\uD83D\uDCC4</div><h3>Нет материалов</h3></div>'}
            `})}function openStudentLessonView(e,t,a,l){document.getElementById("mainContent").innerHTML=`
        <button class="btn-back" onclick="history.back()">← Назад</button>
        <div class="lesson-detail">
            <div class="lesson-detail__header"><h2 class="lesson-detail__title">${t||"Без названия"}</h2></div>
            <div class="lesson-detail__row"><span class="lesson-detail__label">Ссылка</span><span class="lesson-detail__value">${a?getRutubeEmbed(a)?getRutubeEmbed(a):`<a href="${a}" target="_blank">Открыть</a>`:"—"}</span></div>
            <div class="lesson-detail__row">
                <span class="lesson-detail__label">Файлы</span>
                <span class="lesson-detail__value" id="studentBlockItemFiles"></span>
            </div>
            <div class="lesson-detail__row"><span class="lesson-detail__label">Комментарий</span><span class="lesson-detail__value">${l||"Нет"}</span></div>
        </div>`,loadStudentFiles("block_item",e,"studentBlockItemFiles")}function getRutubeEmbed(e){if(!e)return"";let t=e.match(/(?:rutube\.ru\/video\/(?:private\/)?)([a-zA-Z0-9_-]+)\/?(?:\?p=([a-zA-Z0-9_-]+))?/);if(!t)return"";let a=t[1],l=t[2]?`?p=${t[2]}&m=1`:"?m=1";return`
        <div class="rutube-player" style="display:block; width:100%; margin:12px 0;">
            <iframe src="https://rutube.ru/play/embed/${a}${l}"
                    allow="clipboard-write; autoplay; fullscreen"
                    style="position:absolute; top:0; left:0; width:100%; height:100%; border:none;">
            </iframe>
        </div>`}function loadStudentCustomBlocks(){fetch("student_get_custom_blocks.php").then(e=>e.json()).then(e=>{let t=document.getElementById("customBlocksContainer");t&&(t.innerHTML="",e.forEach(e=>{t.innerHTML+=`
                    <a class="sidebar__link" data-tab="custom_${e.id}">📌 ${e.name}</a>
                `}))})}function loadStudentCustomBlockView(e,t){fetch(`student_get_custom_groups.php?block_id=${e}`).then(e=>e.json()).then(async a=>{let l=`<button class="btn-back" onclick="loadStudentCustomBlocks()">← Назад</button><h2>${t}</h2>`;if(0===a.length)l+='<div class="empty-state"><div class="empty-icon">\uD83D\uDCC4</div><h3>Нет блоков</h3></div>';else{for(let s of(l+='<div class="blocks-grid">',a)){let n=await fetch(`student_get_custom_items.php?group_id=${s.id}`).then(e=>e.json()),i="";if(n.length>0)i='<ul class="block-items-list">',n.forEach(e=>{if("tasks"===s.type){let t=e.comment?e.comment.substring(0,60)+(e.comment.length>60?"…":""):"без описания",a=0;if(e.link)try{let l=JSON.parse(e.link);a=Array.isArray(l)?l.length:1}catch(n){a=1}i+=`<li><strong>${e.title}</strong> – ${t} ${a>0?`(${a} ссыл.)`:""}</li>`}else i+=`<li>${e.title} ${e.link?`<a href="${e.link}" target="_blank" onclick="event.stopPropagation()">🔗</a>`:""}</li>`}),i+="</ul>";else{let o="tasks"===s.type?"Нет заданий":"lectures"===s.type?"Нет лекций":"Нет материалов";i=`<p class="block-empty-text">${o}</p>`}let d="\uD83D\uDCC4",c="block-card--material";"tasks"===s.type?(d="\uD83D\uDCDD",c="block-card--tasks"):"lectures"===s.type&&(d="\uD83D\uDCDA",c="block-card--lectures"),l+=`
                        <div class="block-card ${c}" style="cursor:pointer;" onclick="openStudentCustomGroupView(${s.id}, '${s.name.replace(/'/g,"\\'")}', ${e}, '${t.replace(/'/g,"\\'")}', '${s.type||"material"}')">
                            <div class="block-card__header">
                                <h3 class="block-card__title">
                                    <span class="block-card__type-icon">${d}</span>${s.name}
                                </h3>
                            </div>
                            ${i}
                        </div>`}l+="</div>"}document.getElementById("mainContent").innerHTML=l})}function openStudentCustomGroupView(e,t,a,l,s="material"){fetch(`student_get_custom_items.php?group_id=${e}`).then(e=>e.json()).then(n=>{let i=`
                <button class="btn-back" onclick="loadStudentCustomBlockView(${a}, '${l.replace(/'/g,"\\'")}')">← Назад к блокам</button>
                <h2>${t}</h2>`;0===n.length?i+='<div class="empty-state"><div class="empty-icon">\uD83D\uDCC4</div><h3>Нет материалов</h3></div>':(i+='<div class="custom-items-grid">',n.forEach(n=>{let o="custom-item-card--material",d="\uD83D\uDCC4";if("tasks"===s?(o="custom-item-card--tasks",d="\uD83D\uDCDD"):"lectures"===s&&(o="custom-item-card--lectures",d="\uD83D\uDCDA"),i+=`
                        <div class="custom-item-card ${o}" onclick="openStudentCustomItemView(${n.id}, '${n.title.replace(/'/g,"\\'")}', '${(n.link||"").replace(/'/g,"\\'")}', '${(n.comment||"").replace(/'/g,"\\'")}', ${e}, '${t.replace(/'/g,"\\'")}', ${a}, '${l.replace(/'/g,"\\'")}')">
                            <div class="custom-item-card__header">
                                <span class="custom-item-card__icon">${d}</span>
                                <h3 class="custom-item-card__title">${n.title}</h3>
                            </div>`,"tasks"===s){if(i+='<div class="custom-item-card__body">',n.comment&&(i+=`<div class="task-text">${n.comment.replace(/\n/g,"<br>")}</div>`),n.link){let c=[];try{c=JSON.parse(n.link)}catch(r){}Array.isArray(c)&&c.length>0?(i+='<div class="task-links">',c.forEach(e=>{i+=`<a href="${e}" target="_blank" onclick="event.stopPropagation()">🔗 Ссылка</a>`}),i+="</div>"):n.link&&(i+=`<a href="${n.link}" target="_blank" onclick="event.stopPropagation()">🔗 Ссылка</a>`)}i+="</div>"}else i+='<div class="custom-item-card__body">',n.link&&(i+=`<div class="task-link"><a href="${n.link}" target="_blank" onclick="event.stopPropagation()">🔗 Открыть</a></div>`),n.comment&&(i+=`<div class="task-comment">${n.comment.length>80?n.comment.substring(0,80)+"…":n.comment}</div>`),i+="</div>";i+="</div>"}),i+="</div>"),document.getElementById("mainContent").innerHTML=i})}function openStudentCustomItemView(e,t,a,l,s,n,i,o){document.getElementById("mainContent").innerHTML=`
        <button class="btn-back" onclick="openStudentCustomGroupView(${s}, '${n.replace(/'/g,"\\'")}', ${i}, '${o.replace(/'/g,"\\'")}')">← Назад к материалам</button>
        <div class="lesson-detail">
            <div class="lesson-detail__header">
                <h2 class="lesson-detail__title">${t||"Без названия"}</h2>
            </div>
            <div class="lesson-detail__row">
                <span class="lesson-detail__label">Ссылка</span>
                <span class="lesson-detail__value">
                    ${a?getRutubeEmbed(a)?getRutubeEmbed(a):`<a href="${a}" target="_blank">Открыть</a>`:"—"}
                </span>
            </div>
            <div class="lesson-detail__row">
                <span class="lesson-detail__label">Файлы</span>
                <span class="lesson-detail__value" id="studentCustomItemFiles"></span>
            </div>
            <div class="lesson-detail__row">
                <span class="lesson-detail__label">Комментарий</span>
                <span class="lesson-detail__value">${l||"Нет"}</span>
            </div>
        </div>`,loadStudentFiles("custom_item",e,"studentCustomItemFiles")}function loadStudentFiles(e,t,a){fetch(`get_files.php?entity_type=${e}&entity_id=${t}`).then(e=>e.json()).then(e=>{let t=document.getElementById(a);if(!t)return;if(!Array.isArray(e)||0===e.length){t.innerHTML='<p style="color:var(--text-secondary);">Нет файлов</p>';return}let l='<ul class="files-list">';e.forEach(e=>{let t=(e.size/1048576).toFixed(1);l+=`
                <li class="files-list__item">
                    <span class="files-list__icon">📄</span>
                    <span class="files-list__name">${e.original_name}</span>
                    <span class="files-list__size">${t} MB</span>
                    <div class="files-list__actions">
                        <a href="download_file.php?id=${e.id}" class="btn--file-download" target="_blank">Скачать</a>
                    </div>
                </li>`}),l+="</ul>",t.innerHTML=l}).catch(()=>{document.getElementById(a).innerHTML='<p style="color:red;">Ошибка загрузки</p>'})}function renderHomeworkRow(e){let t="Выполнено"===e.status?"badge--success":"badge--danger",a="";if(e.links)try{let l=JSON.parse(e.links);a=l.map(e=>`<a href="${e}" target="_blank">Ссылка</a>`).join(", ")}catch(s){}return`
        <tr>
            <td>${e.title}</td>
            <td>${e.text||""}</td>
            <td><span class="badge ${t}">${e.status}</span></td>
            <td>${a}</td>
        </tr>`}function getPaymentLabelStudent(e){return({none:"Не указан",paid:"Оплачено",unpaid:"Не оплачено",pending:"Ожидается"})[e]||"Не указан"}function applyHiddenSections(){"undefined"!=typeof HIDDEN_SECTIONS&&HIDDEN_SECTIONS&&HIDDEN_SECTIONS.forEach(e=>{let t=document.querySelector(`.sidebar__link[data-tab="${e}"]`);t&&(t.style.display="none")})}function applySidebarCustomization(){if("undefined"==typeof SIDEBAR_CUSTOMIZATION||!SIDEBAR_CUSTOMIZATION)return;let e=SIDEBAR_CUSTOMIZATION;document.querySelectorAll(".sidebar__link[data-tab]").forEach(t=>{let a=t.getAttribute("data-tab");if(!a||a.startsWith("custom_"))return;let l=e[a];if(l){if(l.icon){let s=t.textContent.replace(/^.\s*/,l.icon+" ");t.textContent=s}if(l.title){let n=t.childNodes;n.length>1&&3===n[1].nodeType?n[1].textContent=" "+l.title:t.childNodes[0].textContent=l.icon?l.icon+" "+l.title:l.title}}}),document.querySelectorAll('.sidebar__link[data-tab^="custom_"]').forEach(t=>{let a=t.getAttribute("data-tab"),l=e[a];l&&(l.icon?t.textContent=l.icon+" "+(l.title||t.textContent.replace(/^📌\s*/,"").trim()):l.title&&(t.textContent="\uD83D\uDCCC "+l.title))})}function openStudentAvatarModal(){let e="undefined"!=typeof STUDENT_AVATAR?STUDENT_AVATAR:"",t=document.querySelector(".welcome-avatar")?.textContent.trim()||"?",a="";a=e?`<img src="${e}?t=${new Date().getTime()}" class="avatar-modal-preview" id="avatarPreview" alt="Аватар">`:`<div class="avatar-modal-placeholder" id="avatarPreview">${t}</div>`;let l=document.createElement("div");l.className="modal-overlay active",l.innerHTML=`
        <div class="modal">
            <button class="modal__close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            <h3>Изменить фото</h3>
            <div style="text-align:center;">${a}</div>
            <div style="display:flex; gap:8px; margin-top:16px;">
                <input type="file" id="avatarFileInput" accept="image/*" style="flex:1;">
                <button class="btn btn--primary" onclick="uploadStudentAvatar()">Загрузить</button>
            </div>
            ${e?`<button class="btn btn--danger" style="width:100%; margin-top:8px;" onclick="deleteStudentAvatar()">Удалить фото</button>`:""}
        </div>`,document.body.appendChild(l)}function uploadStudentAvatar(){let e=document.getElementById("avatarFileInput");if(!e||!e.files.length){alert("Выберите файл");return}let t=new FormData;t.append("avatar",e.files[0]),fetch("upload_avatar.php",{method:"POST",body:t}).then(e=>e.json()).then(e=>{e.success?(updateStudentSidebarAvatar(e.avatar),document.querySelector(".modal-overlay").remove()):alert("Ошибка: "+e.error)}).catch(()=>alert("Ошибка сети"))}function deleteStudentAvatar(){confirm("Удалить фото и вернуть букву?")&&fetch("delete_avatar.php",{method:"POST"}).then(e=>e.json()).then(e=>{e.success?(updateStudentSidebarAvatar(""),document.querySelector(".modal-overlay").remove()):alert("Ошибка: "+e.error)}).catch(()=>alert("Ошибка сети"))}function updateStudentSidebarAvatar(e){let t=document.querySelector(".sidebar__welcome .welcome-avatar"),a=document.querySelector(".sidebar__welcome .welcome-avatar-img");if(e){if(a)a.src=e+"?t="+new Date().getTime();else if(t){let l=document.createElement("img");l.src=e+"?t="+new Date().getTime(),l.className="welcome-avatar-img",l.alt="Аватар",t.replaceWith(l)}}else if(a){let s=document.createElement("div");s.className="welcome-avatar",s.textContent=a.alt?.charAt(0)||"?",a.replaceWith(s)}}function showBetaNotice(){if("1"===sessionStorage.getItem("beta_notice_shown"))return;sessionStorage.setItem("beta_notice_shown","1");let e=document.createElement("div");e.className="modal-overlay active",e.innerHTML=`
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
        </div>`,document.body.appendChild(e)}function openStudentTimezoneModal(){let e="undefined"!=typeof STUDENT_TIMEZONE?STUDENT_TIMEZONE:"Europe/Moscow",t="";[{value:"Europe/Moscow",label:"Москва (UTC+3)"},{value:"Europe/Kaliningrad",label:"Калининград (UTC+2)"},{value:"Europe/Samara",label:"Самара (UTC+4)"},{value:"Asia/Yekaterinburg",label:"Екатеринбург (UTC+5)"},{value:"Asia/Omsk",label:"Омск (UTC+6)"},{value:"Asia/Krasnoyarsk",label:"Красноярск (UTC+7)"},{value:"Asia/Irkutsk",label:"Иркутск (UTC+8)"},{value:"Asia/Yakutsk",label:"Якутск (UTC+9)"},{value:"Asia/Vladivostok",label:"Владивосток (UTC+10)"},{value:"Asia/Kamchatka",label:"Камчатка (UTC+12)"},].forEach(a=>{let l=a.value===e?" selected":"";t+=`<option value="${a.value}"${l}>${a.label}</option>`});let a=document.createElement("div");a.className="modal-overlay active",a.innerHTML=`
        <div class="modal" style="max-width:400px;">
            <button class="modal__close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            <h3>Часовой пояс</h3>
            <div class="form-group">
                <label class="form-label">Ваш часовой пояс</label>
                <select id="studentTimezone" class="form-select">${t}</select>
            </div>
            <button class="btn btn--primary" onclick="saveStudentTimezone()">Сохранить</button>
        </div>`,document.body.appendChild(a)}function saveStudentTimezone(){let e=document.getElementById("studentTimezone");if(!e)return;let t=e.value;fetch("update_student_timezone.php",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`timezone=${encodeURIComponent(t)}`}).then(e=>e.json()).then(e=>{if(e.success){if(document.querySelector(".modal-overlay").remove(),STUDENT_TIMEZONE=t,alert("Часовой пояс сохранён. Время уроков пересчитано."),window.currentStudentLessonData){let{lessonId:a}=window.currentStudentLessonData;viewLesson(a)}{let l=new Date;renderStudentCalendar(l.getFullYear(),l.getMonth()+1)}}else alert("Ошибка: "+e.error)}).catch(()=>alert("Ошибка сети"))}document.addEventListener("DOMContentLoaded",()=>{let e=document.getElementById("hamburger"),t=document.getElementById("sidebar");e.addEventListener("click",()=>t.classList.toggle("open")),t.addEventListener("click",e=>{let a=e.target.closest(".sidebar__link");if(!a)return;let l=a.getAttribute("data-tab");if(l){if(e.preventDefault(),document.querySelectorAll(".sidebar__link").forEach(e=>e.classList.remove("active")),a.classList.add("active"),l.startsWith("custom_")){let s=l.replace("custom_",""),n=a.textContent.replace(/^📌\s*/,"").trim();loadStudentCustomBlockView(s,n),window.innerWidth<768&&t.classList.remove("open");return}switch(l){case"schedule":loadStudentSchedule();break;case"homeworks":loadStudentHomeworks();break;case"lectures":loadStudentBlocks("lecture")}window.innerWidth<768&&t.classList.remove("open")}}),loadStudentSchedule(),loadStudentCustomBlocks(),applyHiddenSections(),applySidebarCustomization(),showBetaNotice(),document.getElementById("mainContent").addEventListener("click",()=>{window.innerWidth<768&&t.classList.contains("open")&&t.classList.remove("open")})}),document.addEventListener("click",function(e){(e.target.closest(".welcome-avatar")||e.target.closest(".welcome-avatar-img"))&&openStudentAvatarModal()});
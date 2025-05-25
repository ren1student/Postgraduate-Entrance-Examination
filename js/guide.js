// 全局变量
let guideData = []; // 存储所有指南数据
let currentGuideId = null; // 当前显示的指南ID

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 加载指南数据
    loadGuideData();
});

// 加载指南数据
function loadGuideData() {
    fetch('data/guide.json')
        .then(response => response.json())
        .then(data => {
            guideData = data;
            setupGuideNavigation(data);
            
            // 默认显示第一个指南
            if (data.length > 0) {
                showGuide(data[0].id);
            }
        })
        .catch(error => {
            console.error('获取指南数据失败:', error);
            document.getElementById('guideNav').innerHTML = `
                <div class="list-group-item text-danger">
                    <i class="bi bi-exclamation-triangle me-2"></i>加载失败，请刷新重试
                </div>
            `;
            document.getElementById('guideContent').innerHTML = `
                <div class="alert alert-danger">
                    <i class="bi bi-exclamation-triangle me-2"></i>加载指南内容失败，请刷新页面重试
                </div>
            `;
        });
}

// 设置指南导航
function setupGuideNavigation(guides) {
    const guideNav = document.getElementById('guideNav');
    guideNav.innerHTML = '';
    
    guides.forEach(guide => {
        const navItem = document.createElement('a');
        navItem.href = '#';
        navItem.className = 'list-group-item list-group-item-action';
        navItem.dataset.guideId = guide.id;
        navItem.innerHTML = `
            <i class="bi bi-file-text me-2"></i>${guide.title}
        `;
        
        navItem.addEventListener('click', function(e) {
            e.preventDefault();
            showGuide(guide.id);
        });
        
        guideNav.appendChild(navItem);
    });
}

// 显示指定ID的指南
function showGuide(guideId) {
    const guide = guideData.find(g => g.id === guideId);
    if (!guide) return;
    
    // 更新当前指南ID
    currentGuideId = guideId;
    
    // 更新导航项的激活状态
    document.querySelectorAll('#guideNav .list-group-item').forEach(item => {
        if (item.dataset.guideId === guideId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    // 显示指南内容
    const guideContent = document.getElementById('guideContent');
    guideContent.innerHTML = renderGuideContent(guide);
    
    // 滚动到顶部
    guideContent.scrollTop = 0;
}

// 根据标题显示指南
function showGuideByTitle(title) {
    const guide = guideData.find(g => g.title === title);
    if (guide) {
        showGuide(guide.id);
    }
}

// 渲染指南内容
function renderGuideContent(guide) {
    let html = `
        <h3 class="mb-4">${guide.title}</h3>
    `;
    
    // 根据不同的指南类型渲染不同的内容
    switch (guide.title) {
        case '考研基础知识':
            html += renderBasicKnowledge(guide.content);
            break;
        case '考研时间规划':
            html += renderTimePlanning(guide.content);
            break;
        case '复习方法指导':
            html += renderStudyMethods(guide.content);
            break;
        case '心理调适建议':
            html += renderPsychologicalAdjustment(guide.content);
            break;
        case '常见问题解答':
            html += renderFAQ(guide.content);
            break;
        default:
            html += `<p>${JSON.stringify(guide.content)}</p>`;
    }
    
    return html;
}

// 渲染考研基础知识
function renderBasicKnowledge(content) {
    let html = `
        <div class="alert alert-info mb-4">
            <i class="bi bi-info-circle me-2"></i>${content.introduction}
        </div>
        
        <h4 class="mb-3">考试科目与分值</h4>
        <div class="table-responsive">
            <table class="table table-bordered">
                <thead class="table-light">
                    <tr>
                        <th>科目</th>
                        <th>分值</th>
                        <th>考试时长</th>
                        <th>内容描述</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    content.examStructure.forEach(subject => {
        html += `
            <tr>
                <td>${subject.subject}</td>
                <td>${subject.score}分</td>
                <td>${subject.duration}</td>
                <td>${subject.description}</td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
        </div>
    `;
    
    return html;
}

// 渲染考研时间规划
function renderTimePlanning(content) {
    let html = `
        <div class="alert alert-warning mb-4">
            <i class="bi bi-lightbulb me-2"></i>${content.overview}
        </div>
        
        <h4 class="mb-3">考研备考阶段</h4>
        <div class="row">
    `;
    
    content.stages.forEach(stage => {
        html += `
            <div class="col-md-6 mb-4">
                <div class="card h-100">
                    <div class="card-header bg-light">
                        <h5 class="card-title mb-0">${stage.period} - ${stage.name}</h5>
                    </div>
                    <div class="card-body">
                        <ul class="list-group list-group-flush">
        `;
        
        stage.tasks.forEach(task => {
            html += `<li class="list-group-item"><i class="bi bi-check-circle me-2 text-success"></i>${task}</li>`;
        });
        
        html += `
                        </ul>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += `
        </div>
        
        <div class="mt-4">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">时间规划建议</h5>
                    <ul>
                        <li>制定详细的学习计划，包括每日、每周和每月的目标</li>
                        <li>合理分配各科复习时间，根据自身情况调整</li>
                        <li>设置阶段性目标，定期检查完成情况</li>
                        <li>保留适当的休息时间，避免过度疲劳</li>
                        <li>考前一个月调整作息，与考试时间保持一致</li>
                    </ul>
                </div>
            </div>
        </div>
    `;
    
    return html;
}

// 渲染复习方法指导
function renderStudyMethods(content) {
    let html = `
        <h4 class="mb-3">通用复习建议</h4>
        <div class="card mb-4">
            <div class="card-body">
                <ul class="list-group list-group-flush">
    `;
    
    content.generalTips.forEach(tip => {
        html += `<li class="list-group-item"><i class="bi bi-star me-2 text-warning"></i>${tip}</li>`;
    });
    
    html += `
                </ul>
            </div>
        </div>
        
        <h4 class="mb-3">各科复习方法</h4>
        <div class="accordion" id="subjectMethodsAccordion">
    `;
    
    // 政治
    html += `
        <div class="accordion-item">
            <h2 class="accordion-header" id="politicsHeading">
                <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#politicsCollapse" aria-expanded="true" aria-controls="politicsCollapse">
                    ${content.subjectTips.politics.name}
                </button>
            </h2>
            <div id="politicsCollapse" class="accordion-collapse collapse show" aria-labelledby="politicsHeading" data-bs-parent="#subjectMethodsAccordion">
                <div class="accordion-body">
                    <ul class="list-unstyled">
    `;
    
    content.subjectTips.politics.methods.forEach(method => {
        html += `<li class="mb-2"><i class="bi bi-arrow-right-circle me-2 text-primary"></i>${method}</li>`;
    });
    
    html += `
                    </ul>
                </div>
            </div>
        </div>
    `;
    
    // 英语
    html += `
        <div class="accordion-item">
            <h2 class="accordion-header" id="englishHeading">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#englishCollapse" aria-expanded="false" aria-controls="englishCollapse">
                    ${content.subjectTips.english.name}
                </button>
            </h2>
            <div id="englishCollapse" class="accordion-collapse collapse" aria-labelledby="englishHeading" data-bs-parent="#subjectMethodsAccordion">
                <div class="accordion-body">
                    <ul class="list-unstyled">
    `;
    
    content.subjectTips.english.methods.forEach(method => {
        html += `<li class="mb-2"><i class="bi bi-arrow-right-circle me-2 text-primary"></i>${method}</li>`;
    });
    
    html += `
                    </ul>
                </div>
            </div>
        </div>
    `;
    
    // 专业课
    html += `
        <div class="accordion-item">
            <h2 class="accordion-header" id="professionalHeading">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#professionalCollapse" aria-expanded="false" aria-controls="professionalCollapse">
                    ${content.subjectTips.professional.name}
                </button>
            </h2>
            <div id="professionalCollapse" class="accordion-collapse collapse" aria-labelledby="professionalHeading" data-bs-parent="#subjectMethodsAccordion">
                <div class="accordion-body">
                    <ul class="list-unstyled">
    `;
    
    content.subjectTips.professional.methods.forEach(method => {
        html += `<li class="mb-2"><i class="bi bi-arrow-right-circle me-2 text-primary"></i>${method}</li>`;
    });
    
    html += `
                    </ul>
                </div>
            </div>
        </div>
    `;
    
    html += `
        </div>
    `;
    
    return html;
}

// 渲染心理调适建议
function renderPsychologicalAdjustment(content) {
    let html = `
        <h4 class="mb-3">常见心理问题及解决方案</h4>
        <div class="row">
    `;
    
    content.commonProblems.forEach(problem => {
        html += `
            <div class="col-md-4 mb-4">
                <div class="card h-100">
                    <div class="card-header bg-light">
                        <h5 class="card-title mb-0">${problem.problem}</h5>
                    </div>
                    <div class="card-body">
                        <ul class="list-group list-group-flush">
        `;
        
        problem.solutions.forEach(solution => {
            html += `<li class="list-group-item">${solution}</li>`;
        });
        
        html += `
                        </ul>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += `
        </div>
        
        <h4 class="mb-3">保持积极心态的建议</h4>
        <div class="card">
            <div class="card-body">
                <ul class="list-group list-group-flush">
    `;
    
    content.motivationTips.forEach(tip => {
        html += `<li class="list-group-item"><i class="bi bi-emoji-smile me-2 text-success"></i>${tip}</li>`;
    });
    
    html += `
                </ul>
            </div>
        </div>
    `;
    
    return html;
}

// 渲染常见问题解答
function renderFAQ(content) {
    let html = `
        <ul class="nav nav-tabs mb-4" id="faqTabs" role="tablist">
            <li class="nav-item" role="presentation">
                <button class="nav-link active" id="admission-tab" data-bs-toggle="tab" data-bs-target="#admission" type="button" role="tab" aria-controls="admission" aria-selected="true">报考相关</button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="preparation-tab" data-bs-toggle="tab" data-bs-target="#preparation" type="button" role="tab" aria-controls="preparation" aria-selected="false">备考相关</button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="examTips-tab" data-bs-toggle="tab" data-bs-target="#examTips" type="button" role="tab" aria-controls="examTips" aria-selected="false">考试技巧</button>
            </li>
        </ul>
        
        <div class="tab-content" id="faqTabContent">
            <!-- 报考相关 -->
            <div class="tab-pane fade show active" id="admission" role="tabpanel" aria-labelledby="admission-tab">
                <div class="accordion" id="admissionAccordion">
    `;
    
    content.admission.forEach((item, index) => {
        html += `
            <div class="accordion-item">
                <h2 class="accordion-header" id="admissionHeading${index}">
                    <button class="accordion-button ${index > 0 ? 'collapsed' : ''}" type="button" data-bs-toggle="collapse" data-bs-target="#admissionCollapse${index}" aria-expanded="${index === 0 ? 'true' : 'false'}" aria-controls="admissionCollapse${index}">
                        ${item.question}
                    </button>
                </h2>
                <div id="admissionCollapse${index}" class="accordion-collapse collapse ${index === 0 ? 'show' : ''}" aria-labelledby="admissionHeading${index}" data-bs-parent="#admissionAccordion">
                    <div class="accordion-body">
                        ${item.answer}
                    </div>
                </div>
            </div>
        `;
    });
    
    html += `
                </div>
            </div>
            
            <!-- 备考相关 -->
            <div class="tab-pane fade" id="preparation" role="tabpanel" aria-labelledby="preparation-tab">
                <div class="accordion" id="preparationAccordion">
    `;
    
    content.preparation.forEach((item, index) => {
        html += `
            <div class="accordion-item">
                <h2 class="accordion-header" id="preparationHeading${index}">
                    <button class="accordion-button ${index > 0 ? 'collapsed' : ''}" type="button" data-bs-toggle="collapse" data-bs-target="#preparationCollapse${index}" aria-expanded="${index === 0 ? 'true' : 'false'}" aria-controls="preparationCollapse${index}">
                        ${item.question}
                    </button>
                </h2>
                <div id="preparationCollapse${index}" class="accordion-collapse collapse ${index === 0 ? 'show' : ''}" aria-labelledby="preparationHeading${index}" data-bs-parent="#preparationAccordion">
                    <div class="accordion-body">
                        ${item.answer}
                    </div>
                </div>
            </div>
        `;
    });
    
    html += `
                </div>
            </div>
            
            <!-- 考试技巧 -->
            <div class="tab-pane fade" id="examTips" role="tabpanel" aria-labelledby="examTips-tab">
                <div class="accordion" id="examTipsAccordion">
    `;
    
    content.examTips.forEach((item, index) => {
        html += `
            <div class="accordion-item">
                <h2 class="accordion-header" id="examTipsHeading${index}">
                    <button class="accordion-button ${index > 0 ? 'collapsed' : ''}" type="button" data-bs-toggle="collapse" data-bs-target="#examTipsCollapse${index}" aria-expanded="${index === 0 ? 'true' : 'false'}" aria-controls="examTipsCollapse${index}">
                        ${item.question}
                    </button>
                </h2>
                <div id="examTipsCollapse${index}" class="accordion-collapse collapse ${index === 0 ? 'show' : ''}" aria-labelledby="examTipsHeading${index}" data-bs-parent="#examTipsAccordion">
                    <div class="accordion-body">
                        ${item.answer}
                    </div>
                </div>
            </div>
        `;
    });
    
    html += `
                </div>
            </div>
        </div>
    `;
    
    return html;
}
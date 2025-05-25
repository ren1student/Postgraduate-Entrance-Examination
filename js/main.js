// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 初始化页面
    initPage();
    
    // 绑定搜索按钮事件
    bindSearchEvent();
    
    // 绑定导航事件
    bindNavigationEvents();
});

// 初始化页面
function initPage() {
    console.log('考研信息查询系统初始化完成');
    
    // 加载默认数据
    loadSchoolData();
    loadMajorData();
    loadGuideData();
}

// 绑定搜索按钮事件
function bindSearchEvent() {
    const searchButton = document.querySelector('.input-group .btn-primary');
    const searchInput = document.querySelector('.input-group input');
    
    if (searchButton && searchInput) {
        searchButton.addEventListener('click', function() {
            const keyword = searchInput.value.trim();
            if (keyword) {
                searchInfo(keyword);
            } else {
                alert('请输入搜索关键词');
            }
        });
        
        // 回车键触发搜索
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const keyword = searchInput.value.trim();
                if (keyword) {
                    searchInfo(keyword);
                } else {
                    alert('请输入搜索关键词');
                }
            }
        });
    }
}

// 搜索信息
function searchInfo(keyword) {
    console.log('搜索关键词:', keyword);
    
    // 从数据文件中搜索相关信息
    fetch('data/schools.json')
        .then(response => response.json())
        .then(data => {
            // 过滤学校数据
            const filteredSchools = data.filter(school => 
                school.name.includes(keyword) || 
                school.location.includes(keyword) ||
                (school.description && school.description.includes(keyword))
            );
            
            // 显示搜索结果
            displaySearchResults(filteredSchools, keyword);
        })
        .catch(error => {
            console.error('获取学校数据失败:', error);
            alert('搜索失败，请稍后再试');
        });
        
    // 同时搜索专业数据
    fetch('data/majors.json')
        .then(response => response.json())
        .then(data => {
            // 过滤专业数据
            const filteredMajors = data.filter(major => 
                major.name.includes(keyword) || 
                (major.description && major.description.includes(keyword))
            );
            
            // 显示搜索结果
            displaySearchResults(filteredMajors, keyword, 'major');
        })
        .catch(error => {
            console.error('获取专业数据失败:', error);
        });
}

// 显示搜索结果
function displaySearchResults(results, keyword, type = 'school') {
    const container = document.querySelector('.container');
    const searchResultsSection = document.getElementById('searchResults');
    
    // 如果已有搜索结果区域则清空，否则创建新的
    if (searchResultsSection) {
        searchResultsSection.innerHTML = '';
    } else {
        const newSection = document.createElement('div');
        newSection.id = 'searchResults';
        newSection.className = 'row mt-4';
        container.insertBefore(newSection, document.querySelector('.row:nth-child(2)').nextSibling);
    }
    
    const searchResultsDiv = document.getElementById('searchResults');
    
    // 创建搜索结果标题
    const titleDiv = document.createElement('div');
    titleDiv.className = 'col-12 mb-3';
    titleDiv.innerHTML = `<h3>搜索结果: "${keyword}" <small class="text-muted">(找到 ${results.length} 条结果)</small></h3>`;
    searchResultsDiv.appendChild(titleDiv);
    
    if (results.length === 0) {
        const noResultDiv = document.createElement('div');
        noResultDiv.className = 'col-12 alert alert-info';
        noResultDiv.textContent = '没有找到相关信息，请尝试其他关键词';
        searchResultsDiv.appendChild(noResultDiv);
        return;
    }
    
    // 显示搜索结果
    results.forEach(item => {
        const resultDiv = document.createElement('div');
        resultDiv.className = 'col-md-6 mb-4';
        
        let content = '';
        if (type === 'school') {
            content = `
                <div class="card school-item">
                    <div class="card-body">
                        <h5 class="card-title">${item.name}</h5>
                        <h6 class="card-subtitle mb-2 text-muted">${item.location || ''}</h6>
                        <p class="card-text">${item.description || '暂无描述'}</p>
                        <div class="mt-2">
                            ${item.tags ? item.tags.map(tag => `<span class="badge bg-light text-dark">${tag}</span>`).join('') : ''}
                        </div>
                        <a href="#" class="btn btn-sm btn-outline-primary mt-3" onclick="showSchoolDetail('${item.id}')">查看详情</a>
                    </div>
                </div>
            `;
        } else {
            content = `
                <div class="card major-item">
                    <div class="card-body">
                        <h5 class="card-title">${item.name}</h5>
                        <p class="card-text">${item.description || '暂无描述'}</p>
                        <div class="mt-2">
                            ${item.tags ? item.tags.map(tag => `<span class="badge bg-light text-dark">${tag}</span>`).join('') : ''}
                        </div>
                        <a href="#" class="btn btn-sm btn-outline-primary mt-3" onclick="showMajorDetail('${item.id}')">查看详情</a>
                    </div>
                </div>
            `;
        }
        
        resultDiv.innerHTML = content;
        searchResultsDiv.appendChild(resultDiv);
    });
    
    // 滚动到搜索结果区域
    searchResultsDiv.scrollIntoView({ behavior: 'smooth' });
}

// 绑定导航事件
function bindNavigationEvents() {
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 移除所有导航项的active类
            navLinks.forEach(item => item.classList.remove('active'));
            
            // 为当前点击的导航项添加active类
            this.classList.add('active');
            
            // 获取目标部分的ID
            const targetId = this.getAttribute('href').substring(1);
            
            // 显示相应的内容
            showSection(targetId);
        });
    });
}

// 显示指定部分的内容
function showSection(sectionId) {
    console.log('显示部分:', sectionId);
    
    // 隐藏搜索结果
    const searchResults = document.getElementById('searchResults');
    if (searchResults) {
        searchResults.style.display = 'none';
    }
    
    // 根据不同的部分加载不同的内容
    switch(sectionId) {
        case 'home':
            // 显示首页内容
            document.querySelector('.row:nth-child(2)').style.display = 'flex';
            document.querySelector('.row:nth-child(3)').style.display = 'flex';
            
            // 隐藏其他部分
            hideContentSections(['schoolsContent', 'majorsContent', 'guideContent']);
            break;
            
        case 'schools':
            // 显示院校信息
            showSchoolsSection();
            
            // 隐藏其他部分
            document.querySelector('.row:nth-child(2)').style.display = 'none';
            document.querySelector('.row:nth-child(3)').style.display = 'none';
            hideContentSections(['majorsContent', 'guideContent']);
            break;
            
        case 'majors':
            // 显示专业信息
            showMajorsSection();
            
            // 隐藏其他部分
            document.querySelector('.row:nth-child(2)').style.display = 'none';
            document.querySelector('.row:nth-child(3)').style.display = 'none';
            hideContentSections(['schoolsContent', 'guideContent']);
            break;
            
        case 'guide':
            // 显示考研指南
            showGuideSection();
            
            // 隐藏其他部分
            document.querySelector('.row:nth-child(2)').style.display = 'none';
            document.querySelector('.row:nth-child(3)').style.display = 'none';
            hideContentSections(['schoolsContent', 'majorsContent']);
            break;
    }
}

// 隐藏内容部分
function hideContentSections(sectionIds) {
    sectionIds.forEach(id => {
        const section = document.getElementById(id);
        if (section) {
            section.style.display = 'none';
        }
    });
}

// 显示院校信息部分
function showSchoolsSection() {
    // 检查是否已存在院校信息部分
    let schoolsSection = document.getElementById('schoolsContent');
    
    if (!schoolsSection) {
        // 创建院校信息部分
        schoolsSection = document.createElement('div');
        schoolsSection.id = 'schoolsContent';
        schoolsSection.className = 'row mt-4';
        
        // 添加标题
        const titleDiv = document.createElement('div');
        titleDiv.className = 'col-12 mb-4';
        titleDiv.innerHTML = '<h2 class="text-center">院校信息</h2>';
        schoolsSection.appendChild(titleDiv);
        
        // 添加筛选区域
        const filterDiv = document.createElement('div');
        filterDiv.className = 'col-12 mb-4';
        filterDiv.innerHTML = `
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">筛选条件</h5>
                    <div class="row">
                        <div class="col-md-4 mb-3">
                            <label for="regionFilter" class="form-label">地区</label>
                            <select class="form-select" id="regionFilter">
                                <option value="">全部地区</option>
                                <option value="北京">北京</option>
                                <option value="上海">上海</option>
                                <option value="广东">广东</option>
                                <option value="江苏">江苏</option>
                                <option value="浙江">浙江</option>
                                <option value="湖北">湖北</option>
                                <option value="四川">四川</option>
                            </select>
                        </div>
                        <div class="col-md-4 mb-3">
                            <label for="typeFilter" class="form-label">类型</label>
                            <select class="form-select" id="typeFilter">
                                <option value="">全部类型</option>
                                <option value="综合">综合类</option>
                                <option value="理工">理工类</option>
                                <option value="师范">师范类</option>
                                <option value="医药">医药类</option>
                                <option value="农林">农林类</option>
                            </select>
                        </div>
                        <div class="col-md-4 mb-3">
                            <label for="levelFilter" class="form-label">层次</label>
                            <select class="form-select" id="levelFilter">
                                <option value="">全部层次</option>
                                <option value="985">985工程</option>
                                <option value="211">211工程</option>
                                <option value="双一流">双一流</option>
                            </select>
                        </div>
                    </div>
                    <div class="text-center">
                        <button class="btn btn-primary" id="applyFilter">应用筛选</button>
                        <button class="btn btn-outline-secondary ms-2" id="resetFilter">重置</button>
                    </div>
                </div>
            </div>
        `;
        schoolsSection.appendChild(filterDiv);
        
        // 添加学校列表容器
        const schoolsListDiv = document.createElement('div');
        schoolsListDiv.className = 'col-12';
        schoolsListDiv.innerHTML = '<div id="schoolsList" class="row"></div>';
        schoolsSection.appendChild(schoolsListDiv);
        
        // 将院校信息部分添加到页面
        document.querySelector('.container').appendChild(schoolsSection);
        
        // 加载院校数据
        loadSchoolData();
        
        // 绑定筛选事件
        document.getElementById('applyFilter').addEventListener('click', filterSchools);
        document.getElementById('resetFilter').addEventListener('click', resetSchoolFilters);
    }
    
    // 显示院校信息部分
    schoolsSection.style.display = 'flex';
}

// 加载院校数据
function loadSchoolData() {
    fetch('data/schools.json')
        .then(response => response.json())
        .then(data => {
            displaySchools(data);
        })
        .catch(error => {
            console.error('获取院校数据失败:', error);
            const schoolsList = document.getElementById('schoolsList');
            if (schoolsList) {
                schoolsList.innerHTML = '<div class="col-12 alert alert-danger">加载院校数据失败，请稍后再试</div>';
            }
        });
}

// 显示院校列表
function displaySchools(schools) {
    const schoolsList = document.getElementById('schoolsList');
    if (!schoolsList) return;
    
    schoolsList.innerHTML = '';
    
    if (schools.length === 0) {
        schoolsList.innerHTML = '<div class="col-12 alert alert-info">没有找到符合条件的院校</div>';
        return;
    }
    
    schools.forEach(school => {
        const schoolDiv = document.createElement('div');
        schoolDiv.className = 'col-md-6 mb-4';
        schoolDiv.innerHTML = `
            <div class="card school-item">
                <div class="card-body">
                    <h5 class="card-title">${school.name}</h5>
                    <h6 class="card-subtitle mb-2 text-muted">${school.location || ''}</h6>
                    <p class="card-text">${school.description || '暂无描述'}</p>
                    <div class="mt-2">
                        ${school.tags ? school.tags.map(tag => `<span class="badge bg-light text-dark">${tag}</span>`).join('') : ''}
                    </div>
                    <a href="#" class="btn btn-sm btn-outline-primary mt-3" onclick="showSchoolDetail('${school.id}')">查看详情</a>
                </div>
            </div>
        `;
        schoolsList.appendChild(schoolDiv);
    });
}

// 筛选院校
function filterSchools() {
    const region = document.getElementById('regionFilter').value;
    const type = document.getElementById('typeFilter').value;
    const level = document.getElementById('levelFilter').value;
    
    fetch('data/schools.json')
        .then(response => response.json())
        .then(data => {
            // 应用筛选条件
            const filteredSchools = data.filter(school => {
                let match = true;
                
                if (region && school.location !== region) {
                    match = false;
                }
                
                if (type && !school.tags.includes(type)) {
                    match = false;
                }
                
                if (level && !school.tags.includes(level)) {
                    match = false;
                }
                
                return match;
            });
            
            // 显示筛选后的院校
            displaySchools(filteredSchools);
        })
        .catch(error => {
            console.error('筛选院校失败:', error);
        });
}

// 重置院校筛选
function resetSchoolFilters() {
    document.getElementById('regionFilter').value = '';
    document.getElementById('typeFilter').value = '';
    document.getElementById('levelFilter').value = '';
    
    // 重新加载所有院校
    loadSchoolData();
}

// 显示院校详情
function showSchoolDetail(schoolId) {
    fetch('data/schools.json')
        .then(response => response.json())
        .then(data => {
            const school = data.find(s => s.id === schoolId);
            if (school) {
                // 创建详情模态框
                const modalHtml = `
                    <div class="modal fade" id="schoolDetailModal" tabindex="-1" aria-hidden="true">
                        <div class="modal-dialog modal-lg">
                            <div class="modal-content">
                                <div class="modal-header bg-light">
                                    <h5 class="modal-title">${school.name}</h5>
                                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>
                                <div class="modal-body">
                                    <div class="detail-header">
                                        <h2>${school.name}</h2>
                                        <p class="text-muted">${school.location || ''}</p>
                                        <div class="mb-2">
                                            ${school.tags ? school.tags.map(tag => `<span class="badge bg-primary">${tag}</span>`).join(' ') : ''}
                                        </div>
                                    </div>
                                    
                                    <div class="row mb-4">
                                        <div class="col-12">
                                            <h4>学校简介</h4>
                                            <p>${school.description || '暂无简介'}</p>
                                        </div>
                                    </div>
                                    
                                    <div class="row mb-4">
                                        <div class="col-12">
                                            <h4>考研信息</h4>
                                            <table class="table table-bordered">
                                                <tbody>
                                                    <tr>
                                                        <th width="30%">招生人数</th>
                                                        <td>${school.enrollmentCount || '暂无数据'}</td>
                                                    </tr>
                                                    <tr>
                                                        <th>报录比</th>
                                                        <td>${school.admissionRatio || '暂无数据'}</td>
                                                    </tr>
                                                    <tr>
                                                        <th>考试科目</th>
                                                        <td>${school.examSubjects ? school.examSubjects.join('、') : '暂无数据'}</td>
                                                    </tr>
                                                    <tr>
                                                        <th>招生专业</th>
                                                        <td>${school.majors ? school.majors.join('、') : '暂无数据'}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                    
                                    <div class="row">
                                        <div class="col-12">
                                            <h4>历年分数线</h4>
                                            <table class="table table-bordered table-striped">
                                                <thead>
                                                    <tr>
                                                        <th>年份</th>
                                                        <th>专业课</th>
                                                        <th>英语</th>
                                                        <th>政治</th>
                                                        <th>总分</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    ${school.scoreLines ? school.scoreLines.map(line => `
                                                        <tr>
                                                            <td>${line.year}</td>
                                                            <td>${line.professional || '-'}</td>
                                                            <td>${line.english || '-'}</td>
                                                            <td>${line.politics || '-'}</td>
                                                            <td>${line.total || '-'}</td>
                                                        </tr>
                                                    `).join('') : '<tr><td colspan="5" class="text-center">暂无分数线数据</td></tr>'}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                                <div class="modal-footer">
                                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">关闭</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                
                // 添加模态框到页面
                const modalContainer = document.createElement('div');
                modalContainer.innerHTML = modalHtml;
                document.body.appendChild(modalContainer);
                
                // 显示模态框
                const modal = new bootstrap.Modal(document.getElementById('schoolDetailModal'));
                modal.show();
                
                // 模态框关闭后移除
                document.getElementById('schoolDetailModal').addEventListener('hidden.bs.modal', function() {
                    document.body.removeChild(modalContainer);
                });
            } else {
                alert('未找到该院校信息');
            }
        })
        .catch(error => {
            console.error('获取院校详情失败:', error);
            alert('获取院校详情失败，请稍后再试');
        });
}

// 显示专业信息部分
function showMajorsSection() {
    // 检查是否已存在专业信息部分
    let majorsSection = document.getElementById('majorsContent');
    
    if (!majorsSection) {
        // 创建专业信息部分
        majorsSection = document.createElement('div');
        majorsSection.id = 'majorsContent';
        majorsSection.className = 'row mt-4';
        
        // 添加标题
        const titleDiv = document.createElement('div');
        titleDiv.className = 'col-12 mb-4';
        titleDiv.innerHTML = '<h2 class="text-center">专业信息</h2>';
        majorsSection.appendChild(titleDiv);
        
        // 添加筛选区域
        const filterDiv = document.createElement('div');
        filterDiv.className = 'col-12 mb-4';
        filterDiv.innerHTML = `
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">筛选条件</h5>
                    <div class="row">
                        <div class="col-md-4 mb-3">
                            <label for="categoryFilter" class="form-label">学科门类</label>
                            <select class="form-select" id="categoryFilter">
                                <option value="">全部门类</option>
                                <option value="哲学">哲学</option>
                                <option value="经济学">经济学</option>
                                <option value="法学">法学</option>
                                <option value="教育学">教育学</option>
                                <option value="文学">文学</option>
                                <option value="历史学">历史学</option>
                                <option value="理学">理学</option>
                                <option value="工学">工学</option>
                                <option value="农学">农学</option>
                                <option value="医学">医学</option>
                                <option value="管理学">管理学</option>
                                <option value="艺术学">艺术学</option>
                            </select>
                        </div>
                        <div class="col-md-4 mb-3">
                            <label for="degreeFilter" class="form-label">学位类型</label>
                            <select class="form-select" id="degreeFilter">
                                <option value="">全部类型</option>
                                <option value="学术型">学术型</option>
                                <option value="专业型">专业型</option>
                            </select>
                        </div>
                        <div class="col-md-4 mb-3">
                            <label for="difficultyFilter" class="form-label">难度系数</label>
                            <select class="form-select" id="difficultyFilter">
                                <option value="">全部难度</option>
                                <option value="1">★</option>
                                <option value="2">★★</option>
                                <option value="3">★★★</option>
                                <option value="4">★★★★</option>
                                <option value="5">★★★★★</option>
                            </select>
                        </div>
                    </div>
                    <div class="text-center">
                        <button class="btn btn-primary" id="applyMajorFilter">应用筛选</button>
                        <button class="btn btn-outline-secondary ms-2" id="resetMajorFilter">重置</button>
                    </div>
                </div>
            </div>
        `;
        majorsSection.appendChild(filterDiv);
        
        // 添加专业列表容器
        const majorsListDiv = document.createElement('div');
        majorsListDiv.className = 'col-12';
        majorsListDiv.innerHTML = '<div id="majorsList" class="row"></div>';
        majorsSection.appendChild(majorsListDiv);
        
        // 将专业信息部分添加到页面
        document.querySelector('.container').appendChild(majorsSection);
        
        // 加载专业数据
        loadMajorData();
        
        // 绑定筛选事件
        document.getElementById('applyMajorFilter').addEventListener('click', filterMajors);
        document.getElementById('resetMajorFilter').addEventListener('click', resetMajorFilters);
    }
    
    // 显示专业信息部分
    majorsSection.style.display = 'flex';
}

// 加载专业数据
function loadMajorData() {
    fetch('data/majors.json')
        .then(response => response.json())
        .then(data => {
            displayMajors(data);
        })
        .catch(error => {
            console.error('获取专业数据失败:', error);
            const majorsList = document.getElementById('majorsList');
            if (majorsList) {
                majorsList.innerHTML = '<div class="col-12 alert alert-danger">加载专业数据失败，请稍后再试</div>';
            }
        });
}

// 显示专业列表
function displayMajors(majors) {
    const majorsList = document.getElementById('majorsList');
    if (!majorsList) return;
    
    majorsList.innerHTML = '';
    
    if (majors.length === 0) {
        majorsList.innerHTML = '<div class="col-12 alert alert-info">没有找到符合条件的专业</div>';
        return;
    }
    
    majors.forEach(major => {
        const majorDiv = document.createElement('div');
        majorDiv.className = 'col-md-6 mb-4';
        majorDiv.innerHTML = `
            <div class="card major-item">
                <div class="card-body">
                    <h5 class="card-title">${major.name}</h5>
                    <h6 class="card-subtitle mb-2 text-muted">${major.category || ''}</h6>
                    <p class="card-text">${major.description || '暂无描述'}</p>
                    <div class="mt-2">
                        ${major.tags ? major.tags.map(tag => `<span class="badge bg-light text-dark">${tag}</span>`).join('') : ''}
                        ${major.difficulty ? '<span class="badge bg-warning text-dark">难度: ' + '★'.repeat(major.difficulty) + '</span>' : ''}
                    </div>
                    <a href="#" class="btn btn-sm btn-outline-primary mt-3" onclick="showMajorDetail('${major.id}')">查看详情</a>
                </div>
            </div>
        `;
        majorsList.appendChild(majorDiv);
    });
}

// 筛选专业
function filterMajors() {
    const category = document.getElementById('categoryFilter').value;
    const degree = document.getElementById('degreeFilter').value;
    const difficulty = document.getElementById('difficultyFilter').value;
    
    fetch('data/majors.json')
        .then(response => response.json())
        .then(data => {
            // 应用筛选条件
            const filteredMajors = data.filter(major => {
                let match = true;
                
                if (category && major.category !== category) {
                    match = false;
                }
                
                if (degree && !major.tags.includes(degree)) {
                    match = false;
                }
                
                if (difficulty && major.difficulty !== parseInt(difficulty)) {
                    match = false;
                }
                
                return match;
            });
            
            // 显示筛选后的专业
            displayMajors(filteredMajors);
        })
        .catch(error => {
            console.error('筛选专业失败:', error);
        });
}

// 重置专业筛选
function resetMajorFilters() {
    document.getElementById('categoryFilter').value = '';
    document.getElementById('degreeFilter').value = '';
    document.getElementById('difficultyFilter').value = '';
    
    // 重新加载所有专业
    loadMajorData();
}

// 显示专业详情
function showMajorDetail(majorId) {
    fetch('data/majors.json')
        .then(response => response.json())
        .then(data => {
            const major = data.find(m => m.id === majorId);
            if (major) {
                // 创建详情模态框
                const modalHtml = `
                    <div class="modal fade" id="majorDetailModal" tabindex="-1" aria-hidden="true">
                        <div class="modal-dialog modal-lg">
                            <div class="modal-content">
                                <div class="modal-header bg-light">
                                    <h5 class="modal-title">${major.name}</h5>
                                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                                </div>
                                <div class="modal-body">
                                    <div class="detail-header">
                                        <h2>${major.name}</h2>
                                        <p class="text-muted">${major.category || ''}</p>
                                        <div class="mb-2">
                                            ${major.tags ? major.tags.map(tag => `<span class="badge bg-primary">${tag}</span>`).join(' ') : ''}
                                            ${major.difficulty ? '<span class="badge bg-warning text-dark">难度: ' + '★'.repeat(major.difficulty) + '</span>' : ''}
                                        </div>
                                    </div>
                                    
                                    <div class="row mb-4">
                                        <div class="col-12">
                                            <h4>专业简介</h4>
                                            <p>${major.description || '暂无简介'}</p>
                                        </div>
                                    </div>
                                    
                                    <div class="row mb-4">
                                        <div class="col-12">
                                            <h4>考试科目</h4>
                                            <ul class="list-group">
                                                ${major.examSubjects ? major.examSubjects.map(subject => 
                                                    `<li class="list-group-item">${subject}</li>`
                                                ).join('') : '<li class="list-group-item">暂无数据</li>'}
                                            </ul>
                                        </div>
                                    </div>
                                    
                                    <div class="row mb-4">
                                        <div class="col-12">
                                            <h4>推荐参考书目</h4>
                                            <ul class="list-group">
                                                ${major.recommendedBooks ? major.recommendedBooks.map(book => 
                                                    `<li class="list-group-item">${book}</li>`
                                                ).join('') : '<li class="list-group-item">暂无数据</li>'}
                                            </ul>
                                        </div>
                                    </div>
                                    
                                    <div class="row mb-4">
                                        <div class="col-md-6">
                                            <h4>就业方向</h4>
                                            <ul class="list-group">
                                                ${major.careerProspects ? major.careerProspects.map(career => 
                                                    `<li class="list-group-item">${career}</li>`
                                                ).join('') : '<li class="list-group-item">暂无数据</li>'}
                                            </ul>
                                        </div>
                                        <div class="col-md-6">
                                            <h4>研究方向</h4>
                                            <ul class="list-group">
                                                ${major.researchDirections ? major.researchDirections.map(direction => 
                                                    `<li class="list-group-item">${direction}</li>`
                                                ).join('') : '<li class="list-group-item">暂无数据</li>'}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <div class="modal-footer">
                                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">关闭</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                
                // 添加模态框到页面
                const modalContainer = document.createElement('div');
                modalContainer.innerHTML = modalHtml;
                document.body.appendChild(modalContainer);
                
                // 显示模态框
                const modal = new bootstrap.Modal(document.getElementById('majorDetailModal'));
                modal.show();
                
                // 模态框关闭后移除
                document.getElementById('majorDetailModal').addEventListener('hidden.bs.modal', function() {
                    document.body.removeChild(modalContainer);
                });
            } else {
                alert('未找到该专业信息');
            }
        })
        .catch(error => {
            console.error('获取专业详情失败:', error);
            alert('获取专业详情失败，请稍后再试');
        });
}

// 显示考研指南部分
function showGuideSection() {
    // 检查是否已存在考研指南部分
    let guideSection = document.getElementById('guideContent');
    
    if (!guideSection) {
        // 创建考研指南部分
        guideSection = document.createElement('div');
        guideSection.id = 'guideContent';
        guideSection.className = 'row mt-4';
        
        // 添加标题
        const titleDiv = document.createElement('div');
        titleDiv.className = 'col-12 mb-4';
        titleDiv.innerHTML = '<h2 class="text-center">考研指南</h2>';
        guideSection.appendChild(titleDiv);
        
        // 添加指南内容
        const contentDiv = document.createElement('div');
        contentDiv.className = 'col-12';
        contentDiv.innerHTML = `
            <div class="accordion" id="guideAccordion">
                <div class="accordion-item">
                    <h2 class="accordion-header">
                        <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne">
                            考研基本流程
                        </button>
                    </h2>
                    <div id="collapseOne" class="accordion-collapse collapse show" data-bs-parent="#guideAccordion">
                        <div class="accordion-body">
                            <ol>
                                <li>确定报考院校和专业（3月-8月）</li>
                                <li>准备初试科目（4月-12月）</li>
                                <li>网上报名（10月）</li>
                                <li>现场确认（11月）</li>
                                <li>打印准考证（12月）</li>
                                <li>参加初试（12月）</li>
                                <li>查询成绩（2月）</li>
                                <li>准备复试（2月-3月）</li>
                                <li>参加复试（3月-4月）</li>
                                <li>等待录取（4月-5月）</li>
                            </ol>
                        </div>
                    </div>
                </div>
                
                <div class="accordion-item">
                    <h2 class="accordion-header">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo">
                            复习规划建议
                        </button>
                    </h2>
                    <div id="collapseTwo" class="accordion-collapse collapse" data-bs-parent="#guideAccordion">
                        <div class="accordion-body">
                            <h5>基础阶段（4月-7月）</h5>
                            <ul>
                                <li>熟悉考试大纲</li>
                                <li>制定复习计划</li>
                                <li>完成基础知识的学习</li>
                                <li>做好笔记和知识整理</li>
                            </ul>
                            
                            <h5>强化阶段（8月-10月）</h5>
                            <ul>
                                <li>查漏补缺，巩固基础</li>
                                <li>大量刷题，总结规律</li>
                                <li>模拟练习，提高速度</li>
                                <li>关注重点和难点</li>
                            </ul>
                            
                            <h5>冲刺阶段（11月-12月）</h5>
                            <ul>
                                <li>全真模拟训练</li>
                                <li>总结各科答题技巧</li>
                                <li>调整作息，保持状态</li>
                                <li>查漏补缺，查缺补漏</li>
                            </ul>
                        </div>
                    </div>
                </div>
                
                <div class="accordion-item">
                    <h2 class="accordion-header">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree">
                            复试准备建议
                        </button>
                    </h2>
                    <div id="collapseThree" class="accordion-collapse collapse" data-bs-parent="#guideAccordion">
                        <div class="accordion-body">
                            <h5>复试内容</h5>
                            <ul>
                                <li>专业课笔试</li>
                                <li>专业面试</li>
                                <li>英语口语测试</li>
                                <li>综合素质面试</li>
                            </ul>
                            
                            <h5>准备建议</h5>
                            <ul>
                                <li>提前了解复试流程和要求</li>
                                <li>准备专业课复习资料</li>
                                <li>练习英语口语表达</li>
                                <li>准备个人自我介绍</li>
                                <li>整理本科阶段成果</li>
                                <li>关注目标院校动态</li>
                            </ul>
                        </div>
                    </div>
                </div>
                
                <div class="accordion-item">
                    <h2 class="accordion-header">
                        <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseFour">
                            常见问题解答
                        </button>
                    </h2>
                    <div id="collapseFour" class="accordion-collapse collapse" data-bs-parent="#guideAccordion">
                        <div class="accordion-body">
                            <div class="faq-item mb-4">
                                <h5>1. 什么时候开始准备考研最合适？</h5>
                                <p>建议从大三下学期开始准备，这样时间比较充裕，可以更好地规划复习进度。但也要根据个人情况和基础来决定。</p>
                            </div>
                            
                            <div class="faq-item mb-4">
                                <h5>2. 如何选择考研院校和专业？</h5>
                                <p>建议综合考虑以下因素：</p>
                                <ul>
                                    <li>个人兴趣和职业规划</li>
                                    <li>院校实力和专业排名</li>
                                    <li>地理位置和就业前景</li>
                                    <li>考试难度和录取情况</li>
                                </ul>
                            </div>
                            
                            <div class="faq-item mb-4">
                                <h5>3. 如何合理分配各科复习时间？</h5>
                                <p>建议根据个人基础和各科难度来分配：</p>
                                <ul>
                                    <li>数学：40-50%的时间</li>
                                    <li>专业课：30-40%的时间</li>
                                    <li>政治：10-15%的时间</li>
                                    <li>英语：10-15%的时间</li>
                                </ul>
                            </div>
                            
                            <div class="faq-item">
                                <h5>4. 如何应对考研压力？</h5>
                                <ul>
                                    <li>制定合理的学习计划</li>
                                    <li>保持规律的作息时间</li>
                                    <li>适当运动放松身心</li>
                                    <li>与考研同学交流经验</li>
                                    <li>调整心态，保持积极乐观</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        guideSection.appendChild(contentDiv);
        
        // 将考研指南部分添加到页面
        document.querySelector('.container').appendChild(guideSection);
    }
    
    // 显示考研指南部分
    guideSection.style.display = 'flex';
}

// 加载考研指南数据
function loadGuideData() {
    // 暂时使用静态数据，后续可以改为从服务器加载
    console.log('加载考研指南数据');
}
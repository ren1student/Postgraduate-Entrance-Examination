// 全局变量
let schoolsData = []; // 存储所有院校数据
let filteredSchools = []; // 存储筛选后的院校数据
let currentPage = 1; // 当前页码
const itemsPerPage = 6; // 每页显示的院校数量

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 加载院校数据
    loadSchoolsData();
    
    // 绑定搜索按钮事件
    document.getElementById('schoolSearchBtn').addEventListener('click', searchSchools);
    
    // 绑定搜索框回车事件
    document.getElementById('schoolSearchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchSchools();
        }
    });
    
    // 绑定筛选按钮事件
    document.getElementById('applyFilterBtn').addEventListener('click', applyFilters);
    
    // 绑定重置筛选按钮事件
    document.getElementById('resetFilterBtn').addEventListener('click', resetFilters);
});

// 加载院校数据
function loadSchoolsData() {
    fetch('data/schools.json')
        .then(response => response.json())
        .then(data => {
            schoolsData = data;
            filteredSchools = [...schoolsData];
            
            // 初始化筛选选项
            initializeFilterOptions(data);
            
            // 显示院校列表
            displaySchools(filteredSchools, currentPage);
            
            // 处理URL参数中的搜索词
            handleSearchParams();
        })
        .catch(error => {
            console.error('获取院校数据失败:', error);
            document.getElementById('schoolsList').innerHTML = `
                <div class="col-12">
                    <div class="alert alert-danger">
                        <i class="bi bi-exclamation-triangle me-2"></i>加载院校数据失败，请刷新页面重试
                    </div>
                </div>
            `;
        });
}

// 初始化筛选选项
function initializeFilterOptions(schools) {
    // 获取所有地区
    const locations = [...new Set(schools.map(school => school.location))];
    const locationFilter = document.getElementById('locationFilter');
    locations.sort().forEach(location => {
        const option = document.createElement('option');
        option.value = location;
        option.textContent = location;
        locationFilter.appendChild(option);
    });
    
    // 获取所有院校类型标签
    const tags = [...new Set(schools.flatMap(school => school.tags))];
    const tagFilter = document.getElementById('tagFilter');
    tags.sort().forEach(tag => {
        const option = document.createElement('option');
        option.value = tag;
        option.textContent = tag;
        tagFilter.appendChild(option);
    });
    
    // 获取所有专业
    const majors = [...new Set(schools.flatMap(school => school.majors))];
    const majorFilter = document.getElementById('majorFilter');
    majors.sort().forEach(major => {
        const option = document.createElement('option');
        option.value = major;
        option.textContent = major;
        majorFilter.appendChild(option);
    });
}

// 显示院校列表
function displaySchools(schools, page) {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedSchools = schools.slice(startIndex, endIndex);
    
    const schoolsList = document.getElementById('schoolsList');
    schoolsList.innerHTML = '';
    
    if (schools.length === 0) {
        schoolsList.innerHTML = `
            <div class="col-12">
                <div class="alert alert-info">
                    <i class="bi bi-info-circle me-2"></i>没有找到符合条件的院校，请尝试其他搜索条件
                </div>
            </div>
        `;
        document.getElementById('schoolsPagination').innerHTML = '';
        return;
    }
    
    paginatedSchools.forEach(school => {
        const schoolCard = document.createElement('div');
        schoolCard.className = 'col-md-6 col-lg-4 mb-4';
        schoolCard.innerHTML = `
            <div class="card h-100">
                <div class="card-body">
                    <h5 class="card-title">${school.name}</h5>
                    <h6 class="card-subtitle mb-2 text-muted">
                        <i class="bi bi-geo-alt me-1"></i>${school.location}
                    </h6>
                    <div class="mb-3">
                        ${school.tags.map(tag => `<span class="badge bg-light text-dark me-1">${tag}</span>`).join('')}
                    </div>
                    <p class="card-text">${truncateText(school.description, 100)}</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <small class="text-muted">招生人数: ${school.enrollmentCount}</small>
                        <button class="btn btn-sm btn-outline-primary" onclick="showSchoolDetail('${school.id}')">
                            查看详情
                        </button>
                    </div>
                </div>
            </div>
        `;
        schoolsList.appendChild(schoolCard);
    });
    
    // 更新分页控件
    updatePagination(schools.length, page);
}

// 更新分页控件
function updatePagination(totalItems, currentPage) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const pagination = document.getElementById('schoolsPagination');
    pagination.innerHTML = '';
    
    // 如果只有一页，不显示分页控件
    if (totalPages <= 1) {
        return;
    }
    
    // 上一页按钮
    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    prevLi.innerHTML = `
        <a class="page-link" href="#" aria-label="上一页" ${currentPage > 1 ? `onclick="changePage(${currentPage - 1}); return false;"` : ''}>
            <span aria-hidden="true">&laquo;</span>
        </a>
    `;
    pagination.appendChild(prevLi);
    
    // 页码按钮
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    // 第一页按钮
    if (startPage > 1) {
        const firstLi = document.createElement('li');
        firstLi.className = 'page-item';
        firstLi.innerHTML = `
            <a class="page-link" href="#" onclick="changePage(1); return false;">1</a>
        `;
        pagination.appendChild(firstLi);
        
        // 省略号
        if (startPage > 2) {
            const ellipsisLi = document.createElement('li');
            ellipsisLi.className = 'page-item disabled';
            ellipsisLi.innerHTML = `
                <a class="page-link" href="#">...</a>
            `;
            pagination.appendChild(ellipsisLi);
        }
    }
    
    // 页码按钮
    for (let i = startPage; i <= endPage; i++) {
        const pageLi = document.createElement('li');
        pageLi.className = `page-item ${i === currentPage ? 'active' : ''}`;
        pageLi.innerHTML = `
            <a class="page-link" href="#" onclick="changePage(${i}); return false;">${i}</a>
        `;
        pagination.appendChild(pageLi);
    }
    
    // 省略号和最后一页
    if (endPage < totalPages) {
        // 省略号
        if (endPage < totalPages - 1) {
            const ellipsisLi = document.createElement('li');
            ellipsisLi.className = 'page-item disabled';
            ellipsisLi.innerHTML = `
                <a class="page-link" href="#">...</a>
            `;
            pagination.appendChild(ellipsisLi);
        }
        
        // 最后一页按钮
        const lastLi = document.createElement('li');
        lastLi.className = 'page-item';
        lastLi.innerHTML = `
            <a class="page-link" href="#" onclick="changePage(${totalPages}); return false;">${totalPages}</a>
        `;
        pagination.appendChild(lastLi);
    }
    
    // 下一页按钮
    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    nextLi.innerHTML = `
        <a class="page-link" href="#" aria-label="下一页" ${currentPage < totalPages ? `onclick="changePage(${currentPage + 1}); return false;"` : ''}>
            <span aria-hidden="true">&raquo;</span>
        </a>
    `;
    pagination.appendChild(nextLi);
}

// 切换页码
function changePage(page) {
    currentPage = page;
    displaySchools(filteredSchools, currentPage);
    // 滚动到页面顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 搜索院校
function searchSchools() {
    const searchTerm = document.getElementById('schoolSearchInput').value.trim().toLowerCase();
    
    if (searchTerm === '') {
        filteredSchools = [...schoolsData];
    } else {
        filteredSchools = schoolsData.filter(school => {
            return (
                school.name.toLowerCase().includes(searchTerm) ||
                school.location.toLowerCase().includes(searchTerm) ||
                school.description.toLowerCase().includes(searchTerm) ||
                school.majors.some(major => major.toLowerCase().includes(searchTerm)) ||
                school.tags.some(tag => tag.toLowerCase().includes(searchTerm))
            );
        });
    }
    
    currentPage = 1;
    displaySchools(filteredSchools, currentPage);
}

// 应用筛选
function applyFilters() {
    const location = document.getElementById('locationFilter').value;
    const tag = document.getElementById('tagFilter').value;
    const major = document.getElementById('majorFilter').value;
    
    filteredSchools = schoolsData.filter(school => {
        const locationMatch = location === '' || school.location === location;
        const tagMatch = tag === '' || school.tags.includes(tag);
        const majorMatch = major === '' || school.majors.includes(major);
        
        return locationMatch && tagMatch && majorMatch;
    });
    
    currentPage = 1;
    displaySchools(filteredSchools, currentPage);
    
    // 关闭筛选折叠面板
    const filterCollapse = document.getElementById('filterCollapse');
    const bsCollapse = bootstrap.Collapse.getInstance(filterCollapse);
    if (bsCollapse) {
        bsCollapse.hide();
    }
}

// 重置筛选
function resetFilters() {
    document.getElementById('locationFilter').value = '';
    document.getElementById('tagFilter').value = '';
    document.getElementById('majorFilter').value = '';
    
    filteredSchools = [...schoolsData];
    currentPage = 1;
    displaySchools(filteredSchools, currentPage);
}

// 显示院校详情
function showSchoolDetail(schoolId) {
    const school = schoolsData.find(s => s.id === schoolId);
    if (!school) return;
    
    const modalTitle = document.getElementById('schoolDetailModalLabel');
    const modalContent = document.getElementById('schoolDetailContent');
    
    modalTitle.textContent = school.name;
    
    modalContent.innerHTML = `
        <div class="mb-4">
            <h5 class="mb-3">院校概况</h5>
            <p>${school.description}</p>
            <div class="d-flex flex-wrap mb-2">
                ${school.tags.map(tag => `<span class="badge bg-light text-dark me-2 mb-2">${tag}</span>`).join('')}
            </div>
            <div class="row mt-3">
                <div class="col-md-6">
                    <p><strong>所在地区：</strong>${school.location}</p>
                </div>
                <div class="col-md-6">
                    <p><strong>招生人数：</strong>${school.enrollmentCount}</p>
                </div>
                <div class="col-md-6">
                    <p><strong>录取比例：</strong>${school.admissionRatio}</p>
                </div>
            </div>
        </div>
        
        <div class="mb-4">
            <h5 class="mb-3">考试科目</h5>
            <div class="d-flex flex-wrap">
                ${school.examSubjects.map(subject => `<span class="badge bg-primary me-2 mb-2">${subject}</span>`).join('')}
            </div>
        </div>
        
        <div class="mb-4">
            <h5 class="mb-3">开设专业</h5>
            <div class="d-flex flex-wrap">
                ${school.majors.map(major => `<span class="badge bg-success me-2 mb-2">${major}</span>`).join('')}
            </div>
        </div>
        
        <div>
            <h5 class="mb-3">历年分数线</h5>
            <div class="table-responsive">
                <table class="table table-bordered">
                    <thead class="table-light">
                        <tr>
                            <th>年份</th>
                            <th>专业课</th>
                            <th>英语</th>
                            <th>政治</th>
                            <th>总分</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${school.scoreLines.map(score => `
                            <tr>
                                <td>${score.year}</td>
                                <td>${score.professional}</td>
                                <td>${score.english}</td>
                                <td>${score.politics}</td>
                                <td>${score.total}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    // 显示模态框
    const modal = new bootstrap.Modal(document.getElementById('schoolDetailModal'));
    modal.show();
}

// 处理URL参数中的搜索词
function handleSearchParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const searchTerm = urlParams.get('search');
    
    if (searchTerm) {
        document.getElementById('schoolSearchInput').value = decodeURIComponent(searchTerm);
        searchSchools();
    }
}

// 截断文本
function truncateText(text, maxLength) {
    if (text.length <= maxLength) {
        return text;
    }
    return text.substring(0, maxLength) + '...';
}
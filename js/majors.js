// 全局变量
let majorsData = []; // 存储所有专业数据
let filteredMajors = []; // 存储筛选后的专业数据
let currentPage = 1; // 当前页码
const itemsPerPage = 6; // 每页显示的专业数量

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 加载专业数据
    loadMajorsData();
    
    // 绑定搜索按钮事件
    document.getElementById('majorSearchBtn').addEventListener('click', searchMajors);
    
    // 绑定搜索框回车事件
    document.getElementById('majorSearchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchMajors();
        }
    });
    
    // 绑定筛选按钮事件
    document.getElementById('applyFilterBtn').addEventListener('click', applyFilters);
    
    // 绑定重置筛选按钮事件
    document.getElementById('resetFilterBtn').addEventListener('click', resetFilters);
});

// 加载专业数据
function loadMajorsData() {
    fetch('data/majors.json')
        .then(response => response.json())
        .then(data => {
            majorsData = data;
            filteredMajors = [...majorsData];
            
            // 初始化筛选选项
            initializeFilterOptions(data);
            
            // 显示专业列表
            displayMajors(filteredMajors, currentPage);
            
            // 处理URL参数中的搜索词
            handleSearchParams();
        })
        .catch(error => {
            console.error('获取专业数据失败:', error);
            document.getElementById('majorsList').innerHTML = `
                <div class="col-12">
                    <div class="alert alert-danger">
                        <i class="bi bi-exclamation-triangle me-2"></i>加载专业数据失败，请刷新页面重试
                    </div>
                </div>
            `;
        });
}

// 初始化筛选选项
function initializeFilterOptions(majors) {
    // 获取所有学科门类
    const categories = [...new Set(majors.map(major => major.category))];
    const categoryFilter = document.getElementById('categoryFilter');
    categories.sort().forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
    
    // 获取所有专业特点标签
    const tags = [...new Set(majors.flatMap(major => major.tags))];
    const tagFilter = document.getElementById('tagFilter');
    tags.sort().forEach(tag => {
        const option = document.createElement('option');
        option.value = tag;
        option.textContent = tag;
        tagFilter.appendChild(option);
    });
}

// 显示专业列表
function displayMajors(majors, page) {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedMajors = majors.slice(startIndex, endIndex);
    
    const majorsList = document.getElementById('majorsList');
    majorsList.innerHTML = '';
    
    if (majors.length === 0) {
        majorsList.innerHTML = `
            <div class="col-12">
                <div class="alert alert-info">
                    <i class="bi bi-info-circle me-2"></i>没有找到符合条件的专业，请尝试其他搜索条件
                </div>
            </div>
        `;
        document.getElementById('majorsPagination').innerHTML = '';
        return;
    }
    
    paginatedMajors.forEach(major => {
        const majorCard = document.createElement('div');
        majorCard.className = 'col-md-6 col-lg-4 mb-4';
        majorCard.innerHTML = `
            <div class="card h-100">
                <div class="card-body">
                    <h5 class="card-title">${major.name}</h5>
                    <h6 class="card-subtitle mb-2 text-muted">${major.category}</h6>
                    <div class="mb-3">
                        ${major.tags.map(tag => `<span class="badge bg-light text-dark me-1">${tag}</span>`).join('')}
                    </div>
                    <p class="card-text">${truncateText(major.description, 100)}</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <small class="text-muted">难度：</small>
                            <small class="text-warning">${'★'.repeat(major.difficulty)}</small>
                        </div>
                        <button class="btn btn-sm btn-outline-primary" onclick="showMajorDetail('${major.id}')">
                            查看详情
                        </button>
                    </div>
                </div>
            </div>
        `;
        majorsList.appendChild(majorCard);
    });
    
    // 更新分页控件
    updatePagination(majors.length, page);
}

// 更新分页控件
function updatePagination(totalItems, currentPage) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const pagination = document.getElementById('majorsPagination');
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
    displayMajors(filteredMajors, currentPage);
    // 滚动到页面顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 搜索专业
function searchMajors() {
    const searchTerm = document.getElementById('majorSearchInput').value.trim().toLowerCase();
    
    if (searchTerm === '') {
        filteredMajors = [...majorsData];
    } else {
        filteredMajors = majorsData.filter(major => {
            return (
                major.name.toLowerCase().includes(searchTerm) ||
                major.category.toLowerCase().includes(searchTerm) ||
                major.description.toLowerCase().includes(searchTerm) ||
                major.tags.some(tag => tag.toLowerCase().includes(searchTerm))
            );
        });
    }
    
    currentPage = 1;
    displayMajors(filteredMajors, currentPage);
}

// 应用筛选
function applyFilters() {
    const category = document.getElementById('categoryFilter').value;
    const difficulty = document.getElementById('difficultyFilter').value;
    const tag = document.getElementById('tagFilter').value;
    
    filteredMajors = majorsData.filter(major => {
        const categoryMatch = category === '' || major.category === category;
        const difficultyMatch = difficulty === '' || major.difficulty === parseInt(difficulty);
        const tagMatch = tag === '' || major.tags.includes(tag);
        
        return categoryMatch && difficultyMatch && tagMatch;
    });
    
    currentPage = 1;
    displayMajors(filteredMajors, currentPage);
    
    // 关闭筛选折叠面板
    const filterCollapse = document.getElementById('filterCollapse');
    const bsCollapse = bootstrap.Collapse.getInstance(filterCollapse);
    if (bsCollapse) {
        bsCollapse.hide();
    }
}

// 重置筛选
function resetFilters() {
    document.getElementById('categoryFilter').value = '';
    document.getElementById('difficultyFilter').value = '';
    document.getElementById('tagFilter').value = '';
    
    filteredMajors = [...majorsData];
    currentPage = 1;
    displayMajors(filteredMajors, currentPage);
}

// 显示专业详情
function showMajorDetail(majorId) {
    const major = majorsData.find(m => m.id === majorId);
    if (!major) return;
    
    const modalTitle = document.getElementById('majorDetailModalLabel');
    const modalContent = document.getElementById('majorDetailContent');
    
    modalTitle.textContent = major.name;
    
    modalContent.innerHTML = `
        <div class="mb-4">
            <h5 class="mb-3">专业概况</h5>
            <p>${major.description}</p>
            <div class="d-flex flex-wrap mb-2">
                ${major.tags.map(tag => `<span class="badge bg-light text-dark me-2 mb-2">${tag}</span>`).join('')}
            </div>
            <div class="row mt-3">
                <div class="col-md-6">
                    <p><strong>学科门类：</strong>${major.category}</p>
                </div>
                <div class="col-md-6">
                    <p>
                        <strong>难度等级：</strong>
                        <span class="text-warning">${'★'.repeat(major.difficulty)}</span>
                    </p>
                </div>
            </div>
        </div>
        
        <div class="mb-4">
            <h5 class="mb-3">考试科目</h5>
            <div class="d-flex flex-wrap">
                ${major.examSubjects.map(subject => `<span class="badge bg-primary me-2 mb-2">${subject}</span>`).join('')}
            </div>
        </div>
        
        <div class="mb-4">
            <h5 class="mb-3">推荐参考书目</h5>
            <ul class="list-group">
                ${major.recommendedBooks.map(book => `
                    <li class="list-group-item">
                        <i class="bi bi-book me-2"></i>${book}
                    </li>
                `).join('')}
            </ul>
        </div>
        
        <div class="mb-4">
            <h5 class="mb-3">就业方向</h5>
            <div class="row">
                ${major.careerProspects.map(career => `
                    <div class="col-md-6 mb-2">
                        <div class="d-flex align-items-center">
                            <i class="bi bi-briefcase me-2"></i>
                            <span>${career}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div>
            <h5 class="mb-3">研究方向</h5>
            <div class="row">
                ${major.researchDirections.map(direction => `
                    <div class="col-md-6 mb-2">
                        <div class="d-flex align-items-center">
                            <i class="bi bi-lightbulb me-2"></i>
                            <span>${direction}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    // 显示模态框
    const modal = new bootstrap.Modal(document.getElementById('majorDetailModal'));
    modal.show();
}

// 处理URL参数中的搜索词
function handleSearchParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const searchTerm = urlParams.get('search');
    
    if (searchTerm) {
        document.getElementById('majorSearchInput').value = decodeURIComponent(searchTerm);
        searchMajors();
    }
}

// 截断文本
function truncateText(text, maxLength) {
    if (text.length <= maxLength) {
        return text;
    }
    return text.substring(0, maxLength) + '...';
}
// 考研时间线数据
const timelineData = [
    {
        month: "3月-5月",
        title: "准备阶段",
        description: "确定目标院校和专业，收集考试资料，制定学习计划，开始基础复习。"
    },
    {
        month: "6月-8月",
        title: "强化阶段",
        description: "系统复习各科内容，做专项练习，查漏补缺，进行模拟练习。"
    },
    {
        month: "9月-11月",
        title: "冲刺阶段",
        description: "强化重点难点，做真题模拟，总结复习方法，调整作息时间。"
    },
    {
        month: "12月",
        title: "考前准备",
        description: "查看考场，准备考试用品，调整心态，保持作息规律。"
    },
    {
        month: "次年2月-3月",
        title: "成绩查询",
        description: "查询初试成绩，准备复试或调剂。"
    },
    {
        month: "次年3月-4月",
        title: "复试阶段",
        description: "参加复试，关注录取结果。"
    }
];

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 加载考研时间线
    loadTimeline();
    
    // 绑定快速搜索按钮事件
    document.getElementById('quickSearchBtn').addEventListener('click', quickSearch);
    
    // 绑定搜索框回车事件
    document.getElementById('quickSearchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            quickSearch();
        }
    });
});

// 加载考研时间线
function loadTimeline() {
    const timelineElement = document.getElementById('timeline');
    
    if (!timelineElement) return;
    
    let timelineHTML = '';
    
    timelineData.forEach((item, index) => {
        timelineHTML += `
            <div class="timeline-item ${index % 2 === 0 ? 'left' : 'right'}">
                <div class="timeline-date">${item.month}</div>
                <div class="timeline-content">
                    <h5>${item.title}</h5>
                    <p>${item.description}</p>
                </div>
            </div>
        `;
    });
    
    timelineElement.innerHTML = timelineHTML;
}

// 快速搜索功能
function quickSearch() {
    const searchTerm = document.getElementById('quickSearchInput').value.trim().toLowerCase();
    
    if (searchTerm === '') {
        return;
    }
    
    // 检查是否是院校名称
    fetch('data/schools.json')
        .then(response => response.json())
        .then(schools => {
            const matchedSchool = schools.find(school => 
                school.name.toLowerCase().includes(searchTerm)
            );
            
            if (matchedSchool) {
                window.location.href = `schools.html?search=${encodeURIComponent(searchTerm)}`;
                return;
            }
            
            // 检查是否是专业名称
            return fetch('data/majors.json')
                .then(response => response.json())
                .then(majors => {
                    const matchedMajor = majors.find(major => 
                        major.name.toLowerCase().includes(searchTerm)
                    );
                    
                    if (matchedMajor) {
                        window.location.href = `majors.html?search=${encodeURIComponent(searchTerm)}`;
                    } else {
                        // 没有匹配结果，跳转到指南页面
                        window.location.href = `guide.html?search=${encodeURIComponent(searchTerm)}`;
                    }
                });
        })
        .catch(error => {
            console.error('搜索失败:', error);
            // 出错时也跳转到指南页面
            window.location.href = `guide.html?search=${encodeURIComponent(searchTerm)}`;
        });
}
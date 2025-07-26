// JSON导入状态恢复问题诊断脚本
console.log('🔍 开始诊断JSON导入状态恢复问题...');

// 检查localStorage中的状态数据
function checkLocalStorageStates() {
    console.log('📊 检查localStorage中的状态数据...');
    
    let killedCount = 0;
    let killedUnknownCount = 0;
    let refreshedCount = 0;
    let totalStates = 0;
    let stateDetails = [];
    
    for (let i = 1; i <= 400; i++) {
        const state = localStorage.getItem(`pigTimer_line_${i}_state`);
        const killTime = localStorage.getItem(`pigTimer_line_${i}_killTime`);
        
        if (state) {
            totalStates++;
            stateDetails.push({
                line: i,
                state: state,
                killTime: killTime ? new Date(parseInt(killTime)).toLocaleString() : null
            });
            
            if (state === 'killed') killedCount++;
            else if (state === 'killed-unknown') killedUnknownCount++;
            else if (state === 'refreshed') refreshedCount++;
        }
    }
    
    console.log(`📊 localStorage状态统计:`);
    console.log(`- 总状态数: ${totalStates}`);
    console.log(`- 已击杀: ${killedCount}`);
    console.log(`- 击杀未知时间: ${killedUnknownCount}`);
    console.log(`- 已刷新: ${refreshedCount}`);
    
    return { totalStates, killedCount, killedUnknownCount, refreshedCount, stateDetails };
}

// 检查DOM中的状态显示
function checkDOMStates() {
    console.log('🎯 检查DOM中的状态显示...');
    
    let domKilledCount = 0;
    let domKilledUnknownCount = 0;
    let domRefreshedCount = 0;
    let domTotalStates = 0;
    let mismatchedCells = [];
    
    for (let i = 1; i <= 400; i++) {
        const cell = document.querySelector(`td[data-line="${i}"]`);
        const state = localStorage.getItem(`pigTimer_line_${i}_state`);
        
        if (cell && state) {
            const hasKilled = cell.classList.contains('killed');
            const hasKilledUnknown = cell.classList.contains('killed-unknown');
            const hasRefreshed = cell.classList.contains('refreshed');
            const hasExpectedState = cell.classList.contains(state);
            
            if (hasKilled || hasKilledUnknown || hasRefreshed) {
                domTotalStates++;
                if (hasKilled) domKilledCount++;
                if (hasKilledUnknown) domKilledUnknownCount++;
                if (hasRefreshed) domRefreshedCount++;
            }
            
            if (!hasExpectedState) {
                mismatchedCells.push({
                    line: i,
                    expectedState: state,
                    actualClasses: Array.from(cell.classList).filter(cls => 
                        ['killed', 'killed-unknown', 'refreshed'].includes(cls)
                    )
                });
            }
        }
    }
    
    console.log(`🎯 DOM状态统计:`);
    console.log(`- 总状态数: ${domTotalStates}`);
    console.log(`- 已击杀: ${domKilledCount}`);
    console.log(`- 击杀未知时间: ${domKilledUnknownCount}`);
    console.log(`- 已刷新: ${domRefreshedCount}`);
    
    if (mismatchedCells.length > 0) {
        console.warn(`❌ 发现${mismatchedCells.length}个不匹配的单元格:`, mismatchedCells);
    }
    
    return { domTotalStates, domKilledCount, domKilledUnknownCount, domRefreshedCount, mismatchedCells };
}

// 手动修复状态不匹配的问题
function fixMismatchedStates() {
    console.log('🔧 开始修复状态不匹配的问题...');
    
    let fixedCount = 0;
    
    for (let i = 1; i <= 400; i++) {
        const cell = document.querySelector(`td[data-line="${i}"]`);
        const state = localStorage.getItem(`pigTimer_line_${i}_state`);
        
        if (cell && state && !cell.classList.contains(state)) {
            console.log(`🔧 修复线路${i}: 期望状态=${state}`);
            
            // 清除现有状态
            cell.classList.remove('killed', 'killed-unknown', 'refreshed');
            
            // 添加正确状态
            cell.classList.add(state);
            
            // 更新提示文本
            const tooltip = cell.querySelector('.tooltip');
            if (tooltip) {
                if (state === 'killed') {
                    tooltip.textContent = '双击取消击杀状态';
                } else if (state === 'killed-unknown') {
                    tooltip.textContent = '双击取消击杀状态';
                } else if (state === 'refreshed') {
                    tooltip.textContent = '金猪已刷新，左键击杀开始倒计时，右键击杀但不知时间';
                }
            }
            
            // 如果是击杀状态，检查是否需要恢复计时器
            if (state === 'killed') {
                const killTime = localStorage.getItem(`pigTimer_line_${i}_killTime`);
                if (killTime && window.app && window.app.timerManager) {
                    const currentTime = new Date().getTime();
                    const elapsed = currentTime - parseInt(killTime);
                    const timerDuration = window.app.testMode ? 10000 : (24 * 60 * 60 * 1000);
                    
                    if (elapsed < timerDuration) {
                        const remaining = timerDuration - elapsed;
                        console.log(`🔧 恢复线路${i}的计时器，剩余时间=${remaining}ms`);
                        
                        // 确保定时器元素存在
                        let timerElement = document.getElementById(`timer-${i}`);
                        if (!timerElement) {
                            timerElement = document.createElement('div');
                            timerElement.id = `timer-${i}`;
                            timerElement.className = 'timer-display';
                            cell.appendChild(timerElement);
                        }
                        
                        window.app.timerManager.startTimer(i, parseInt(killTime), remaining, cell, 
                            window.app.onTimerComplete.bind(window.app));
                    }
                }
            }
            
            fixedCount++;
        }
    }
    
    console.log(`✅ 修复完成，共修复${fixedCount}个状态不匹配的单元格`);
    return fixedCount;
}

// 强制重新验证状态
function forceStateVerification() {
    console.log('🔍 强制重新验证状态...');
    
    if (window.app && window.app.statsManager) {
        // 强制DOM同步
        document.body.offsetHeight;
        
        // 延迟验证以确保所有DOM更新完成
        setTimeout(() => {
            window.app.statsManager.verifyStateRestoration();
        }, 500);
    }
}

// 运行完整诊断
function runFullDiagnostic() {
    console.log('🏥 运行完整诊断...');
    
    const localStorageData = checkLocalStorageStates();
    const domData = checkDOMStates();
    
    console.log('📋 诊断结果对比:');
    console.log(`- localStorage vs DOM 总状态数: ${localStorageData.totalStates} vs ${domData.domTotalStates}`);
    console.log(`- localStorage vs DOM 已击杀: ${localStorageData.killedCount} vs ${domData.domKilledCount}`);
    console.log(`- localStorage vs DOM 击杀未知: ${localStorageData.killedUnknownCount} vs ${domData.domKilledUnknownCount}`);
    console.log(`- localStorage vs DOM 已刷新: ${localStorageData.refreshedCount} vs ${domData.domRefreshedCount}`);
    
    const mismatchCount = domData.mismatchedCells.length;
    if (mismatchCount > 0) {
        console.warn(`⚠️ 发现${mismatchCount}个状态不匹配的问题`);
        
        // 自动修复
        const fixedCount = fixMismatchedStates();
        
        if (fixedCount > 0) {
            // 重新验证
            setTimeout(() => {
                forceStateVerification();
            }, 1000);
        }
    } else {
        console.log('✅ 所有状态都正确匹配');
    }
}

// 提供全局函数
window.checkLocalStorageStates = checkLocalStorageStates;
window.checkDOMStates = checkDOMStates;
window.fixMismatchedStates = fixMismatchedStates;
window.forceStateVerification = forceStateVerification;
window.runFullDiagnostic = runFullDiagnostic;

// 自动运行诊断
runFullDiagnostic();

console.log('✅ 诊断完成');
console.log('💡 可用命令:');
console.log('- checkLocalStorageStates() - 检查localStorage状态');
console.log('- checkDOMStates() - 检查DOM状态');
console.log('- fixMismatchedStates() - 修复不匹配的状态');
console.log('- forceStateVerification() - 强制重新验证');
console.log('- runFullDiagnostic() - 运行完整诊断');
